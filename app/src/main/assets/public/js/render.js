/* Brohi Clips Pro — 3D Subtitles & FFmpeg Render Engine */

export const W = 1080;
export const H = 1920;

export const CAP_STYLES_3D = {
  gold3d: {
    name: '👑 Imperial Gold 3D',
    font: 'Anton',
    fontSize: 58,
    primaryColor: '&H001FC8FF',      // BGR format: Yellow/Gold
    secondaryColor: '&H00FFFFFF',
    outlineColor: '&H00080600',      // Deep Black outline
    shadowColor: '&H900055AA',       // 3D Amber shadow
    outline: 5.0,
    shadow: 7.0,
    spacing: 2.0,
  },
  cyber3d: {
    name: '⚡ Cyber Neon 3D',
    font: 'Montserrat',
    fontSize: 54,
    primaryColor: '&H00FFFFFF',      // White
    secondaryColor: '&H00F0FF00',    // Cyan highlight
    outlineColor: '&H00000000',      // Black
    shadowColor: '&H80FF007F',       // 3D Pink Shadow
    outline: 4.5,
    shadow: 6.5,
    spacing: 1.5,
  },
  toxic3d: {
    name: '🧪 Toxic Green 3D',
    font: 'Bebas',
    fontSize: 62,
    primaryColor: '&H0055FF00',      // Neon Lime
    secondaryColor: '&H00FFFFFF',
    outlineColor: '&H00000000',
    shadowColor: '&H90003300',
    outline: 4.5,
    shadow: 6.0,
    spacing: 1.0,
  }
};

/**
 * Builds an Advanced SubStation Alpha (.ass) subtitle file with 3D Pop-Up Animations
 */
export function buildAss(cues, styleKey = 'gold3d') {
  const s = CAP_STYLES_3D[styleKey] || CAP_STYLES_3D.gold3d;

  const header = `[Script Info]
Title: Brohi Clips Pro 3D Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
PlayResX: ${W}
PlayResY: ${H}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${s.font},${s.fontSize},${s.primaryColor},${s.secondaryColor},${s.outlineColor},${s.shadowColor},-1,0,0,0,100,100,${s.spacing},0,1,${s.outline},${s.shadow},2,40,40,240,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = cues.map((cue) => {
    const start = formatAssTime(cue.start);
    const end = formatAssTime(cue.end);
    // 3D Kinetic Scale Pop: word bursts from 130% to 100% with extruded depth
    const text = `{\\t(0,80,\\fscx125\\fscy125)\\t(80,180,\\fscx100\\fscy100)}${cue.text.toUpperCase()}`;
    return `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`;
  }).join('\n');

  return header + events;
}

function formatAssTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const cs = Math.floor((sec % 1) * 100);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

export function ffArgs(options = {}) {
  const {
    inputPath,
    outputPath,
    startTime = 0,
    duration = 30,
    assPath,
    mode = 'blur'
  } = options;

  const args = ['-y', '-ss', String(startTime), '-t', String(duration), '-i', inputPath];

  let filterGraph = '';

  if (mode === 'blur') {
    filterGraph += `[0:v]split=2[bg][fg];[bg]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=24:6[bg_blur];[fg]scale=${W}:${W}:force_original_aspect_ratio=decrease[fg_scaled];[bg_blur][fg_scaled]overlay=(W-w)/2:(H-h)/2[base]`;
  } else {
    filterGraph += `[0:v]crop=ih*9/16:ih:(iw-ow)/2:0,scale=${W}:${H}[base]`;
  }

  let finalVTag = '[base]';

  if (assPath) {
    filterGraph += `;${finalVTag}ass='${assPath}'[v_sub]`;
    finalVTag = '[v_sub]';
  }

  args.push('-filter_complex', filterGraph);
  args.push('-map', finalVTag);
  args.push('-map', '0:a?');
  args.push('-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '22');
  args.push('-c:a', 'aac', '-b:a', '128k');
  args.push('-pix_fmt', 'yuv420p');
  args.push(outputPath);

  return args;
}
