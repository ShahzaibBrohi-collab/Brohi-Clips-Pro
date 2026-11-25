/* Brohi Clips Pro — Local State & Settings Store */

const SETTINGS_KEY = 'brohi_clips_pro_settings_v2';
const CLIPS_KEY = 'brohi_clips_pro_vault_v2';

const DEFAULT_SETTINGS = {
  geminiKey: '',        // User's OWN personal key (BYOK)
  style3D: 'gold3d',
  cropMode: 'blur',
  enableAvatar: true,
  enable3DBg: true,
  lastUpdate: 0
};

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(partial) {
  const current = getSettings();
  const updated = { ...current, ...partial };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
  return updated;
}

export function getClips() {
  try {
    const raw = localStorage.getItem(CLIPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveClip(clip) {
  const list = getClips();
  list.unshift(clip);
  try {
    localStorage.setItem(CLIPS_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save clip history:', e);
  }
  return list;
}
