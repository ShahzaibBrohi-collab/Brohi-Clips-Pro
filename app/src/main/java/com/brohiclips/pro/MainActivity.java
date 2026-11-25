package com.brohiclips.pro;

import android.annotation.SuppressLint;
import android.content.ContentValues;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.PowerManager;
import android.provider.MediaStore;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.FileProvider;

import com.yausername.ffmpeg.FFmpeg;
import com.yausername.youtubedl_android.YoutubeDL;
import com.yausername.youtubedl_android.YoutubeDLRequest;
import com.yausername.youtubedl_android.YoutubeDLResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = "BrohiClipsPro";
    private WebView webView;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private PowerManager.WakeLock wakeLock;
    private boolean isEngineReady = false;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Dark Status Bar
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setStatusBarColor(Color.parseColor("#08080C"));
            getWindow().setNavigationBarColor(Color.parseColor("#08080C"));
        }

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.setBackgroundColor(Color.parseColor("#08080C"));
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient());

        // Add Android Native Bridge
        webView.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");

        // Load Luxury 3D Studio Web UI
        webView.loadUrl("file:///android_asset/public/index.html");

        // Safe background engine init
        initNativeEngine();
    }

    private void initNativeEngine() {
        executor.execute(() -> {
            try {
                Log.d(TAG, "Initializing YoutubeDL and FFmpeg safely...");
                YoutubeDL.getInstance().init(getApplicationContext());
                FFmpeg.getInstance().init(getApplicationContext());
                isEngineReady = true;
                Log.d(TAG, "Native video engines initialized successfully!");
            } catch (Exception e) {
                Log.e(TAG, "Engine init notice: " + e.getMessage());
            }
        });
    }

    public class AndroidBridge {

        @JavascriptInterface
        public String initEngine() {
            return isEngineReady ? "ready" : "initializing";
        }

        @JavascriptInterface
        public void probe(String url, String callbackId) {
            executor.execute(() -> {
                try {
                    YoutubeDLRequest request = new YoutubeDLRequest(url);
                    request.addOption("--dump-json");
                    request.addOption("--no-playlist");
                    YoutubeDLResponse res = YoutubeDL.getInstance().execute(request);
                    sendJsCallback(callbackId, true, res.getOut());
                } catch (Exception e) {
                    sendJsCallback(callbackId, false, e.getMessage());
                }
            });
        }

        private File getFFmpegExecutable() {
            File direct = new File(getNoBackupFilesDir(), "youtubedl-android/packages/ffmpeg/ffmpeg");
            if (direct.exists()) {
                direct.setExecutable(true);
                return direct;
            }
            File fallback = new File(getApplicationInfo().nativeLibraryDir, "libffmpeg.so");
            if (fallback.exists()) {
                fallback.setExecutable(true);
                return fallback;
            }
            return direct;
        }

        @JavascriptInterface
        public void ff(String argsJson, String callbackId) {
            executor.execute(() -> {
                try {
                    JSONArray arr = new JSONArray(argsJson);
                    List<String> cmd = new ArrayList<>();
                    File ffmpegBin = getFFmpegExecutable();
                    cmd.add(ffmpegBin.getAbsolutePath());
                    for (int i = 0; i < arr.length(); i++) {
                        cmd.add(arr.getString(i));
                    }
                    ProcessBuilder pb = new ProcessBuilder(cmd);
                    pb.redirectErrorStream(true);
                    Process process = pb.start();
                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                        String line;
                        while ((line = reader.readLine()) != null) {
                            Log.d(TAG, "FFmpeg: " + line);
                        }
                    }
                    int exitCode = process.waitFor();
                    if (exitCode == 0) {
                        sendJsCallback(callbackId, true, "success");
                    } else {
                        sendJsCallback(callbackId, false, "FFmpeg exit code: " + exitCode);
                    }
                } catch (Exception e) {
                    sendJsCallback(callbackId, false, e.getMessage());
                }
            });
        }

        @JavascriptInterface
        public void save(String srcPath, String filename, String callbackId) {
            executor.execute(() -> {
                try {
                    File src = new File(srcPath);
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Video.Media.TITLE, filename);
                    values.put(MediaStore.Video.Media.DISPLAY_NAME, filename);
                    values.put(MediaStore.Video.Media.MIME_TYPE, "video/mp4");
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        values.put(MediaStore.Video.Media.RELATIVE_PATH, Environment.DIRECTORY_MOVIES + "/Brohi Clips");
                    }
                    Uri uri = getContentResolver().insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, values);
                    if (uri != null) {
                        try (OutputStream out = getContentResolver().openOutputStream(uri);
                             FileInputStream in = new FileInputStream(src)) {
                            byte[] buf = new byte[8192];
                            int len;
                            while ((len = in.read(buf)) > 0) out.write(buf, 0, len);
                        }
                    }
                    sendJsCallback(callbackId, true, "saved");
                } catch (Exception e) {
                    sendJsCallback(callbackId, false, e.getMessage());
                }
            });
        }

        @JavascriptInterface
        public void share(String path, String text) {
            runOnUiThread(() -> {
                try {
                    Intent intent = new Intent(Intent.ACTION_SEND);
                    intent.setType("video/mp4");
                    if (text != null) intent.putExtra(Intent.EXTRA_TEXT, text);
                    if (path != null && !path.isEmpty()) {
                        File file = new File(path);
                        Uri uri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", file);
                        intent.putExtra(Intent.EXTRA_STREAM, uri);
                        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    }
                    startActivity(Intent.createChooser(intent, "Share via"));
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Share error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    private void sendJsCallback(String callbackId, boolean success, String data) {
        runOnUiThread(() -> {
            String script = String.format("window.__bridgeCallback && window.__bridgeCallback('%s', %b, %s);",
                    callbackId, success, JSONObject.quote(data));
            webView.evaluateJavascript(script, null);
        });
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
