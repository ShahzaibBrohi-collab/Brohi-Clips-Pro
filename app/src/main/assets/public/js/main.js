/* Brohi Clips Pro — Master UI Controller & Router */

import { ThreeSceneManager, setup3DTiltCards } from './three-scene.js';
import { Engine } from './engine.js';
import { findMoments, testKey } from './ai.js';
import { buildAss, ffArgs, CAP_STYLES_3D } from './render.js';
import { getSettings, saveSettings, getClips, saveClip } from './store.js';

const $app = document.getElementById('app');
let threeMgr = null;
let S = getSettings();
let currentPage = 'home';

function toast(msg, bad = false) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.toggle('bad', bad);
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 3500);
}

function updateNavActive(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.page === page);
  });
}

// 1. Home / Studio Screen
function renderHome() {
  updateNavActive('home');
  $app.innerHTML = `
    <div class="card-3d">
      <div class="card-title">
        <span>🎬</span>
        <span>AI Video to 3D Short</span>
      </div>
      <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">
        Paste any YouTube or Twitch stream URL. Our on-device AI will detect the most viral moments and render vertical shorts with 3D subtitles.
      </p>
      <div style="margin-top: 14px;">
        <input type="text" id="stream-url" class="input-3d" placeholder="https://youtube.com/watch?v=..." />
      </div>
      <div style="margin-top: 16px;">
        <button id="btn-scan" class="btn-3d full">
          <span>⚡</span>
          <span>Start AI Radar Scan</span>
        </button>
      </div>
    </div>

    <div class="card-3d">
      <div class="card-title">
        <span>💎</span>
        <span>Pro Capabilities</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
        <div style="background: rgba(255,200,31,0.06); border: 1px solid rgba(255,200,31,0.2); border-radius: 14px; padding: 14px; text-align: center;">
          <div style="font-size: 24px;">👑</div>
          <div style="font-weight: 800; font-size: 13px; color: #fff; margin-top: 6px;">3D Gold Subtitles</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Bevel depth & bounce</div>
        </div>
        <div style="background: rgba(0,240,255,0.06); border: 1px solid rgba(0,240,255,0.2); border-radius: 14px; padding: 14px; text-align: center;">
          <div style="font-size: 24px;">🤖</div>
          <div style="font-weight: 800; font-size: 13px; color: #fff; margin-top: 6px;">3D AI Avatar</div>
          <div style="font-weight: 400; font-size: 11px; color: var(--text-muted); margin-top: 2px;">WebGL Host Hook</div>
        </div>
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 14px; text-align: center;">
          <div style="font-size: 24px;">🔑</div>
          <div style="font-weight: 800; font-size: 13px; color: #fff; margin-top: 6px;">Your API Key</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">100% Free & Private</div>
        </div>
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 14px; text-align: center;">
          <div style="font-size: 24px;">🚀</div>
          <div style="font-weight: 800; font-size: 13px; color: #fff; margin-top: 6px;">Zero Cloud Costs</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">On-Device FFmpeg</div>
        </div>
      </div>
    </div>
  `;
  setup3DTiltCards();

  document.getElementById('btn-scan').onclick = () => {
    const url = document.getElementById('stream-url').value.trim();
    if (!url) {
      toast('Please enter a valid video link', true);
      return;
    }
    if (!S.geminiKey) {
      toast('Please enter your free Gemini API Key in Settings first!', true);
      renderSettings();
      return;
    }
    renderScan(url);
  };
}

// 2. Creator Page (Shahzaib Ali Profile)
function renderCreator() {
  updateNavActive('creator');
  $app.innerHTML = `
    <div class="card-3d">
      <div class="creator-hero">
        <div class="creator-avatar-frame">
          <img src="shahzaib_ali.jpg" alt="Shahzaib Ali" />
        </div>
        <h2 class="creator-name">Shahzaib Ali</h2>
        <div class="creator-role">Founder & Lead AI Systems Architect</div>
        <div class="creator-tag">Visionary & Creator of Brohi Clips</div>
      </div>

      <div style="background: rgba(255, 200, 31, 0.08); border: 1px solid rgba(255, 200, 31, 0.25); border-radius: 14px; padding: 16px; margin: 16px 0; font-size: 13px; line-height: 1.6;">
        <b>About Shahzaib Ali:</b><br>
        Shahzaib Ali is a passionate Android & AI Systems Engineer who architected <b>Brohi Clips Pro</b> to revolutionize mobile content creation. His vision was to eliminate expensive cloud subscription services by engineering a 100% serverless, private on-device video rendering pipeline powered by Google Gemini AI, FFmpeg, and Python.
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 14px;">
        <a href="https://github.com/ShahzaibBrohi-collab" target="_blank" class="btn-3d full" style="text-decoration: none;">
          <span>🌐</span>
          <span>View GitHub: @ShahzaibBrohi-collab</span>
        </a>
        <a href="https://github.com/ShahzaibBrohi-collab/Brohi-Clips-Pro" target="_blank" class="btn-3d secondary full" style="text-decoration: none;">
          <span>⭐</span>
          <span>Star Brohi Clips on GitHub</span>
        </a>
      </div>
    </div>
  `;
  setup3DTiltCards();
  threeMgr?.speak('Meet our creator and visionary, Shahzaib Ali!');
}

// 3. Settings Screen (BYOK: Bring Your Own Key)
function renderSettings() {
  updateNavActive('settings');
  $app.innerHTML = `
    <div class="card-3d">
      <div class="card-title">
        <span>⚙️</span>
        <span>App & AI Settings</span>
      </div>

      <div style="margin-bottom: 16px;">
        <label style="font-size: 12px; color: var(--gold-primary); font-weight: 700; display: block; margin-bottom: 6px;">
          Your Personal Google Gemini API Key (BYOK):
        </label>
        <input type="password" id="input-api-key" class="input-3d" value="${S.geminiKey}" placeholder="AIzaSy..." />
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; line-height: 1.4;">
          🔒 <b>Private & Free:</b> Your key is stored strictly on your phone. Get your free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: var(--gold-primary);">Google AI Studio</a>.
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-bottom: 20px;">
        <button id="btn-test-key" class="btn-3d secondary" style="flex: 1; padding: 12px;">Test Key</button>
        <button id="btn-save-key" class="btn-3d" style="flex: 1; padding: 12px;">Save Key</button>
      </div>

      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">
        <div class="card-title" style="font-size: 14px; margin-bottom: 8px;">
          <span>📱</span>
          <span>Device & Engine Status</span>
        </div>
        <div style="font-size: 12px; color: var(--text-muted); line-height: 1.6;">
          • App Version: <b>v2.0.0 Pro Luxury Edition</b><br>
          • Native Engine: <b>FFmpeg + Python yt-dlp</b><br>
          • Target Architecture: <b>Android 7.0 - Android 15</b><br>
          • Creator: <b>Shahzaib Ali</b>
        </div>
      </div>
    </div>
  `;
  setup3DTiltCards();

  document.getElementById('btn-test-key').onclick = async () => {
    const k = document.getElementById('input-api-key').value.trim();
    toast('Testing Gemini API Key...');
    try {
      await testKey(k);
      toast('✅ Gemini API Key is valid and working!');
    } catch (e) {
      toast(`❌ Error: ${e.message}`, true);
    }
  };

  document.getElementById('btn-save-key').onclick = () => {
    const k = document.getElementById('input-api-key').value.trim();
    S = saveSettings({ geminiKey: k });
    toast('Settings saved successfully!');
  };
}

// 4. Vault Screen
function renderVault() {
  updateNavActive('vault');
  const clips = getClips();
  $app.innerHTML = `
    <div class="card-3d">
      <div class="card-title">
        <span>📁</span>
        <span>My Created Shorts (${clips.length})</span>
      </div>
      ${clips.length === 0 ? `
        <div style="text-align: center; padding: 30px 10px; color: var(--text-muted); font-size: 13px;">
          No shorts created yet. Paste a link on the Studio page to render your first 3D short!
        </div>
      ` : `
        <div>
          ${clips.map((c) => `
            <div class="moment-item">
              <div>
                <div style="font-weight: 800; font-size: 14px;">${c.title}</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">📅 ${c.date}</div>
              </div>
              <div>
                <button class="btn-3d btn-share-clip" data-path="${c.path}" data-title="${c.title}" style="padding: 8px 14px; font-size: 12px;">Share</button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
  setup3DTiltCards();

  document.querySelectorAll('.btn-share-clip').forEach((b) => {
    b.onclick = () => Engine.share(b.dataset.path, b.dataset.title);
  });
}

// 5. Radar Scanning Screen
async function renderScan(url) {
  $app.innerHTML = `
    <div class="card-3d" style="text-align: center; padding: 40px 20px;">
      <div style="font-size: 48px; animation: pulse 1.5s infinite;">📡</div>
      <h2 style="font-family: 'Montserrat', sans-serif; font-size: 18px; margin: 16px 0 8px; color: var(--gold-primary);">
        Brohi AI Radar Scanning...
      </h2>
      <p style="font-size: 13px; color: var(--text-muted);" id="scan-status">
        Analyzing stream metadata and virality potential...
      </p>
    </div>
  `;
  setup3DTiltCards();

  threeMgr?.speak('Scanning video with your Gemini AI key!');

  try {
    const info = await Engine.probe(url);
    const context = `Title: ${info.title}\nDuration: ${info.duration}s\nChannel: ${info.uploader}`;
    const moments = await findMoments(context, S.geminiKey);
    renderMomentsList(moments, info);
  } catch (err) {
    toast(`Scan error: ${err.message}`, true);
    setTimeout(renderHome, 2500);
  }
}

// 6. Moments Selection Screen
function renderMomentsList(moments, info) {
  $app.innerHTML = `
    <div class="card-3d">
      <div class="card-title">
        <span>🔥</span>
        <span>Detected Viral Moments (${moments.length})</span>
      </div>
      <div>
        ${moments.map((m) => `
          <div class="moment-item" data-id="${m.id}">
            <div>
              <div style="font-weight: 800; font-size: 14px;">${m.title}</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">
                ⏱️ ${m.startFormatted} - ${m.endFormatted} (${m.endSec - m.startSec}s)
              </div>
              <div style="font-size: 11px; color: var(--gold-primary); margin-top: 4px; font-style: italic;">
                "${m.hook}"
              </div>
            </div>
            <div style="text-align: right;">
              <span class="moment-score">★ ${m.score}</span>
              <button class="btn-3d btn-edit-moment" data-id="${m.id}" style="margin-top: 8px; padding: 6px 14px; font-size: 12px;">
                3D Edit
              </button>
            </div>
          </div>
        `).join('')}
      </div>
      <div style="margin-top: 16px;">
        <button id="btn-back-home" class="btn-3d secondary full">Back to Studio</button>
      </div>
    </div>
  `;
  setup3DTiltCards();

  document.querySelectorAll('.btn-edit-moment').forEach((btn) => {
    btn.onclick = () => {
      const moment = moments.find((m) => m.id === btn.dataset.id);
      if (moment) renderEditor(moment, info);
    };
  });

  document.getElementById('btn-back-home').onclick = renderHome;
}

// 7. Studio 3D Editor Screen
function renderEditor(moment, info) {
  $app.innerHTML = `
    <div class="card-3d">
      <div class="card-title">
        <span>🎨</span>
        <span>3D Studio: ${moment.title}</span>
      </div>

      <div style="margin-bottom: 14px;">
        <label style="font-size: 12px; color: var(--gold-primary); display: block; margin-bottom: 6px; font-weight: 700;">
          3D Subtitle Style:
        </label>
        <select id="sel-style" class="input-3d">
          ${Object.entries(CAP_STYLES_3D).map(([k, v]) => `
            <option value="${k}" ${k === S.style3D ? 'selected' : ''}>${v.name}</option>
          `).join('')}
        </select>
      </div>

      <div style="margin-bottom: 14px;">
        <label style="font-size: 12px; color: var(--gold-primary); display: block; margin-bottom: 6px; font-weight: 700;">
          Vertical 9:16 Layout:
        </label>
        <select id="sel-crop" class="input-3d">
          <option value="blur" selected>Luxury Blurred Background (Recommended)</option>
          <option value="crop">Center 9:16 Direct Crop</option>
        </select>
      </div>

      <button id="btn-render-short" class="btn-3d full">
        <span>🚀</span>
        <span>Render 3D Short</span>
      </button>

      <div style="margin-top: 12px;">
        <button id="btn-cancel" class="btn-3d secondary full">Cancel</button>
      </div>
    </div>
  `;
  setup3DTiltCards();

  threeMgr?.speak(`Ready to render "${moment.title}"!`);

  document.getElementById('btn-cancel').onclick = renderHome;
  document.getElementById('btn-render-short').onclick = async () => {
    const styleKey = document.getElementById('sel-style').value;
    const cropMode = document.getElementById('sel-crop').value;

    toast('Rendering 3D short on-device with FFmpeg...');
    threeMgr?.speak('Rendering your 3D short now!');

    try {
      const mockCues = [
        { start: 0, end: 2.5, text: moment.hook },
        { start: 2.6, end: 5.5, text: moment.title }
      ];
      const assContent = buildAss(mockCues, styleKey);
      const outPath = `/sdcard/Movies/Brohi Clips/short-${Date.now()}.mp4`;

      const args = ffArgs({
        inputPath: 'raw_input.mp4',
        outputPath: outPath,
        startTime: moment.startSec,
        duration: moment.endSec - moment.startSec,
        mode: cropMode
      });

      await Engine.ff(args);

      saveClip({
        id: `clip-${Date.now()}`,
        title: moment.title,
        path: outPath,
        date: new Date().toLocaleDateString()
      });

      toast('✅ Short created and saved to Gallery!');
      threeMgr?.speak('Boom! Your 3D short is ready in your gallery!');
      setTimeout(renderVault, 1800);
    } catch (e) {
      toast(`Render error: ${e.message}`, true);
    }
  };
}

// App Initialization
window.addEventListener('DOMContentLoaded', async () => {
  threeMgr = new ThreeSceneManager();

  // Wire Top Header & Bottom Nav
  document.getElementById('btn-nav-creator').onclick = renderCreator;
  document.getElementById('btn-nav-settings').onclick = renderSettings;

  document.querySelectorAll('.nav-item').forEach((item) => {
    item.onclick = () => {
      const page = item.dataset.page;
      if (page === 'home') renderHome();
      else if (page === 'vault') renderVault();
      else if (page === 'creator') renderCreator();
      else if (page === 'settings') renderSettings();
    };
  });

  try {
    await Engine.initEngine();
  } catch (e) {
    console.warn('Engine init:', e);
  }

  renderHome();
});
