/* Brohi Clips Pro — Native Capacitor Engine Bridge */

const P = () => window.Capacitor?.Plugins?.EnginePlugin || window.Capacitor?.Plugins?.Engine;

export const isNative = () => !!P();

export const Engine = {
  async initEngine() {
    if (isNative()) {
      return await P().initEngine();
    }
    console.log('[Engine] Web preview mode: Native Bridge ready');
    return { status: 'ready', mode: 'web-fallback' };
  },

  async probe(url) {
    if (isNative()) {
      return await P().probe({ url });
    }
    return {
      title: 'Demo Stream / Video File',
      duration: 1800,
      uploader: 'Brohi Creator',
      streamUrl: url
    };
  },

  async clip(start, end, name) {
    if (isNative()) {
      return await P().clip({ start, end, name });
    }
    return { path: `/data/mock/clip-${name}.mp4` };
  },

  async ff(args) {
    if (isNative()) {
      return await P().ff({ args });
    }
    console.log('[Engine] FFmpeg command:', args);
    return { status: 'success' };
  },

  async save(path, name) {
    if (isNative()) {
      return await P().save({ path, name });
    }
    return { saved: true, path: `/sdcard/Movies/Brohi Clips/${name}` };
  },

  async share(path, text) {
    if (isNative()) {
      return await P().share({ path, text });
    }
    if (navigator.share) {
      return await navigator.share({ title: 'Brohi Clip', text, url: window.location.href });
    }
    return { shared: true };
  },

  async awake(on) {
    if (isNative() && P().awake) {
      return await P().awake({ on }).catch(() => {});
    }
  }
};
