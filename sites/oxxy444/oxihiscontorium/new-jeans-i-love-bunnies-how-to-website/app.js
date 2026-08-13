import {
  FilesetResolver,
  HandLandmarker,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/+esm";

const TIP = {
  thumb: 4,
  index: 8,
  middle: 12,
  ring: 16,
  pinky: 20,
};

const DIP = {
  thumb: 3,
  index: 7,
  middle: 11,
  ring: 15,
  pinky: 19,
};

const PIP = {
  index: 6,
  middle: 10,
  ring: 14,
  pinky: 18,
};

const HANDS = ["Left", "Right"];
const FINGER_ORDER = ["index", "middle", "ring", "pinky"];
const STORAGE_KEY = "hand-letters-phrases-v3";

const DEFAULT_PHRASES = {
  Left: { index: "A", middle: "B", ring: "C", pinky: "D" },
  Right: { index: "E", middle: "F", ring: "G", pinky: "H" },
};

const FINGER_COLORS = {
  index: "#3DFFA8",
  middle: "#FFB703",
  ring: "#4CC9F0",
  pinky: "#F72585",
};

/**
 * Distinct spoken characters per finger (real TTS voices).
 * ttsFallbacks help when a voice is rate-limited.
 * SAM values are offline fallback only.
 */
const FINGER_VOICES = {
  Left: {
    index: {
      tts: "Brian",
      ttsFallbacks: ["Hans", "Miguel"],
      character: "Adult man",
      pitch: 42,
      speed: 72,
      mouth: 110,
      throat: 150,
      rate: 1,
    },
    middle: {
      tts: "Amy",
      ttsFallbacks: ["Emma", "Joanna", "Vicki"],
      character: "Adult woman",
      pitch: 64,
      speed: 72,
      mouth: 140,
      throat: 120,
      rate: 1,
    },
    ring: {
      tts: "Hans",
      ttsFallbacks: ["Brian", "Ricardo"],
      character: "Older man",
      pitch: 36,
      speed: 64,
      mouth: 100,
      throat: 160,
      rate: 0.94,
    },
    pinky: {
      tts: "Emma",
      ttsFallbacks: ["Amy", "Joanna"],
      character: "Young woman",
      pitch: 76,
      speed: 82,
      mouth: 155,
      throat: 105,
      rate: 1.06,
    },
  },
  Right: {
    index: {
      tts: "Miguel",
      ttsFallbacks: ["Brian", "Hans"],
      character: "Young man",
      pitch: 50,
      speed: 78,
      mouth: 120,
      throat: 135,
      rate: 1.04,
    },
    middle: {
      tts: "Joanna",
      ttsFallbacks: ["Amy", "Emma", "Vicki"],
      character: "Warm woman",
      pitch: 62,
      speed: 70,
      mouth: 138,
      throat: 122,
      rate: 1,
    },
    ring: {
      tts: "Ricardo",
      ttsFallbacks: ["Hans", "Brian", "Miguel"],
      character: "Deep man",
      pitch: 30,
      speed: 66,
      mouth: 92,
      throat: 168,
      rate: 0.92,
    },
    pinky: {
      tts: "Vicki",
      ttsFallbacks: ["Emma", "Amy", "Joanna"],
      character: "Older woman",
      pitch: 70,
      speed: 66,
      mouth: 145,
      throat: 115,
      rate: 0.96,
    },
  },
};

const THUMB_COLOR = "rgba(255, 255, 255, 0.9)";

const PAD_ALONG_FINGER = 0.38;
const FINGER_PAD_RADIUS = 0.175;
const THUMB_PAD_RADIUS = 0.155;

// Tip-to-thumb pinch thresholds (hand-scale units). Middle/ring are harder
// anatomically, so they get a more forgiving window.
const PINCH_ON_BY_FINGER = {
  index: 0.23,
  middle: 0.3,
  ring: 0.3,
  pinky: 0.25,
};
const PINCH_OFF_BY_FINGER = {
  index: 0.34,
  middle: 0.42,
  ring: 0.42,
  pinky: 0.36,
};
const PINCH_COOLDOWN_MS = 320;
const SMOOTH = 0.45;

const video = document.getElementById("camera");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("start");
const flash = document.getElementById("flash");
const statusEl = document.getElementById("status");
const editToggle = document.getElementById("editToggle");
const editClose = document.getElementById("editClose");
const editor = document.getElementById("editor");
const phraseForm = document.getElementById("phraseForm");
const resetBtn = document.getElementById("resetPhrases");

let handLandmarker = null;
let lastVideoTime = -1;
let running = false;
let flashTimer = 0;
let audioCtx = null;
let phrases = loadPhrases();
let playToken = 0;

/** @type {Map<string, InstanceType<typeof window.SamJs>>} */
const samByVoice = new Map();

/** @type {Map<string, AudioBuffer>} */
const soundCache = new Map();

/** @type {Map<string, boolean>} */
const pinched = new Map();

/** @type {Map<string, number>} */
const lastTriggerAt = new Map();

/** @type {Map<string, {x:number,y:number,z:number}>} */
const smoothedPoints = new Map();

function cloneDefaults() {
  return structuredClone(DEFAULT_PHRASES);
}

function loadPhrases() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaults();
    const parsed = JSON.parse(raw);
    return {
      Left: { ...DEFAULT_PHRASES.Left, ...(parsed.Left || {}) },
      Right: { ...DEFAULT_PHRASES.Right, ...(parsed.Right || {}) },
    };
  } catch {
    return cloneDefaults();
  }
}

function savePhrases() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(phrases));
}

function getPhrase(hand, finger) {
  return (phrases[hand]?.[finger] || "").trim();
}

function setStatus(text) {
  if (!text) {
    statusEl.hidden = true;
    statusEl.textContent = "";
    return;
  }
  statusEl.hidden = false;
  statusEl.textContent = text;
}

function distance2d(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function handScale(landmarks) {
  return Math.max(distance2d(landmarks[0], landmarks[9]), 0.001);
}

function smoothPoint(key, point) {
  const prev = smoothedPoints.get(key);
  if (!prev) {
    const next = { x: point.x, y: point.y, z: point.z || 0 };
    smoothedPoints.set(key, next);
    return next;
  }
  const next = {
    x: prev.x * (1 - SMOOTH) + point.x * SMOOTH,
    y: prev.y * (1 - SMOOTH) + point.y * SMOOTH,
    z: prev.z * (1 - SMOOTH) + (point.z || 0) * SMOOTH,
  };
  smoothedPoints.set(key, next);
  return next;
}

function ensureAudio() {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function voiceKey(hand, finger) {
  return `${hand}-${finger}`;
}

function getVoice(hand, finger) {
  return FINGER_VOICES[hand]?.[finger] || FINGER_VOICES.Right.index;
}

function getSam(hand, finger) {
  const key = voiceKey(hand, finger);
  if (samByVoice.has(key)) return samByVoice.get(key);

  const SamJs = window.SamJs;
  if (typeof SamJs !== "function") {
    throw new Error("Speech engine failed to load");
  }

  const voice = getVoice(hand, finger);
  const instance = new SamJs({
    pitch: voice.pitch,
    speed: voice.speed,
    mouth: voice.mouth,
    throat: voice.throat,
  });
  samByVoice.set(key, instance);
  return instance;
}

function playBuffer(buffer, hand, finger) {
  if (!buffer) return false;
  const actx = ensureAudio();
  const source = actx.createBufferSource();
  const gain = actx.createGain();
  const voice = getVoice(hand, finger);
  gain.gain.value = 1;
  source.buffer = buffer;
  source.playbackRate.value = voice.rate || 1;
  source.connect(gain);
  gain.connect(actx.destination);
  source.start(0);
  return true;
}

function sanitizePhrase(text) {
  return text.replace(/[^a-zA-Z0-9 .,?!'-]/g, " ").replace(/\s+/g, " ").trim();
}

function cacheKey(hand, finger, phrase) {
  return `${voiceKey(hand, finger)}:${phrase.trim()}`;
}

async function synthesizeWithTts(text, voiceName) {
  const url =
    "https://api.streamelements.com/kappa/v2/speech?voice=" +
    encodeURIComponent(voiceName) +
    "&text=" +
    encodeURIComponent(text);
  const response = await fetch(url);
  if (!response.ok) throw new Error("TTS HTTP " + response.status);
  const data = await response.arrayBuffer();
  return ensureAudio().decodeAudioData(data.slice(0));
}

async function synthesizeWithTtsChain(text, voice) {
  const names = [voice.tts, ...(voice.ttsFallbacks || [])];
  let lastError = null;
  for (const name of names) {
    try {
      return await synthesizeWithTts(text, name);
    } catch (error) {
      lastError = error;
      await new Promise((r) => setTimeout(r, 120));
    }
  }
  throw lastError || new Error("All TTS voices failed");
}

async function synthesizeWithSam(text, hand, finger) {
  const engine = getSam(hand, finger);
  const wavBytes = engine.wav(text);
  if (!wavBytes || !wavBytes.length) throw new Error("Could not synthesize");
  const copy = wavBytes.buffer.slice(
    wavBytes.byteOffset,
    wavBytes.byteOffset + wavBytes.byteLength
  );
  return ensureAudio().decodeAudioData(copy);
}

async function getPhraseBuffer(phrase, hand, finger, waitForNatural = false) {
  const key = cacheKey(hand, finger, phrase);
  const spoken = sanitizePhrase(phrase);
  if (!spoken) return null;
  if (soundCache.has(key) && !waitForNatural) return soundCache.get(key);

  // Cache local voice immediately so middle/ring never sit silent.
  const local = await synthesizeWithSam(spoken, hand, finger);
  soundCache.set(key, local);

  const upgrade = synthesizeWithTtsChain(spoken, getVoice(hand, finger))
    .then((natural) => {
      soundCache.set(key, natural);
      return natural;
    })
    .catch(() => local);

  if (waitForNatural) {
    const natural = await Promise.race([
      upgrade,
      new Promise((resolve) => setTimeout(() => resolve(local), 2200)),
    ]);
    return natural;
  }

  return local;
}

async function playPhrase(text, hand, finger) {
  const phrase = text.trim();
  if (!phrase) return;
  const token = ++playToken;
  ensureAudio();

  try {
    const buffer = await getPhraseBuffer(phrase, hand, finger);
    if (token !== playToken) return;
    playBuffer(buffer, hand, finger);
  } catch (error) {
    console.error(error);
    setStatus("Could not play that phrase.");
    window.setTimeout(() => setStatus(""), 1800);
  }
}

function showFlash(text, finger) {
  const phrase = text.trim();
  flash.textContent = phrase;
  flash.style.color = FINGER_COLORS[finger] || "#fff";
  flash.classList.toggle("short", phrase.length <= 2);
  flash.classList.add("show");
  window.clearTimeout(flashTimer);
  flashTimer = window.setTimeout(() => flash.classList.remove("show"), 900);
}

function playFinger(text, hand, finger) {
  showFlash(text, finger);
  playPhrase(text, hand, finger);
}

function labelFor(text) {
  const phrase = text.trim();
  if (!phrase) return "";
  if (phrase.length <= 18) return phrase;
  return `${phrase.slice(0, 17)}…`;
}

function fillForm() {
  for (const hand of HANDS) {
    for (const finger of FINGER_ORDER) {
      const input = phraseForm.elements.namedItem(`${hand}-${finger}`);
      if (input) input.value = phrases[hand][finger];
    }
  }
}

function readForm() {
  const next = cloneDefaults();
  for (const hand of HANDS) {
    for (const finger of FINGER_ORDER) {
      const input = phraseForm.elements.namedItem(`${hand}-${finger}`);
      const value = (input?.value || "").trim();
      next[hand][finger] = value || DEFAULT_PHRASES[hand][finger];
    }
  }
  return next;
}

function setEditorOpen(open) {
  editor.hidden = !open;
  editToggle.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) fillForm();
}

function resizeCanvas() {
  const w = video.clientWidth || window.innerWidth;
  const h = video.clientHeight || window.innerHeight;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

function lerpPoint(a, b, t) {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: (a.z || 0) + ((b.z || 0) - (a.z || 0)) * t,
  };
}

function fingerPadPoint(landmarks, finger) {
  return lerpPoint(
    landmarks[TIP[finger]],
    landmarks[DIP[finger]],
    PAD_ALONG_FINGER
  );
}

function fitLabelFont(text, radiusPx, active) {
  const maxSize = Math.max(16, Math.floor(radiusPx * (active ? 0.85 : 0.75)));
  let size = maxSize;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  while (size >= 11) {
    ctx.font = `700 ${size}px Helvetica, Arial, sans-serif`;
    if (ctx.measureText(text).width <= radiusPx * 1.85) break;
    size -= 1;
  }
  return size;
}

function withAlpha(color, alpha) {
  if (color.startsWith("rgba") || color.startsWith("rgb")) return color;
  const hex = color.replace("#", "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawPadCircle(pad, radiusNorm, color, text, active) {
  const x = pad.x * canvas.width;
  const y = pad.y * canvas.height;
  const radiusPx = Math.max(28, radiusNorm * canvas.width);

  ctx.beginPath();
  ctx.arc(x, y, radiusPx, 0, Math.PI * 2);
  ctx.fillStyle = active ? color : withAlpha(color, 0.82);
  ctx.fill();

  ctx.lineWidth = active ? 3.5 : 2.5;
  ctx.strokeStyle = active ? "#fff" : "rgba(255,255,255,0.55)";
  ctx.stroke();

  const label = labelFor(text);
  if (!label) return;

  const size = fitLabelFont(label, radiusPx, active);
  ctx.font = `700 ${size}px Helvetica, Arial, sans-serif`;
  ctx.fillStyle = "#06141f";
  ctx.fillText(label, x, y);
}

function updatePinches(handedness, landmarks) {
  const scale = handScale(landmarks);
  const thumbTip = smoothPoint(
    `${handedness}-thumb-tip`,
    landmarks[TIP.thumb]
  );
  const thumbPad = smoothPoint(
    `${handedness}-thumb-pad`,
    fingerPadPoint(landmarks, "thumb")
  );
  const thumbRadius = scale * THUMB_PAD_RADIUS;

  drawPadCircle(thumbPad, thumbRadius, THUMB_COLOR, "", false);

  const contacts = [];

  for (const finger of FINGER_ORDER) {
    const tip = smoothPoint(
      `${handedness}-${finger}-tip`,
      landmarks[TIP[finger]]
    );
    const pad = smoothPoint(
      `${handedness}-${finger}-pad`,
      fingerPadPoint(landmarks, finger)
    );
    const pip = landmarks[PIP[finger]];
    const tipRatio = distance2d(tip, thumbTip) / scale;
    const pipRatio = distance2d(pip, thumbTip) / scale;
    // True pad pinch: the tip is nearer the thumb than the PIP joint.
    const tipIsContact = tipRatio < pipRatio * 0.9;
    contacts.push({
      finger,
      tipRatio,
      tipIsContact,
      pad,
      fingerRadius: scale * FINGER_PAD_RADIUS,
    });
  }

  // Prefer fingers whose tip is actually the contact point.
  const candidates = contacts.filter((c) => c.tipIsContact);
  const pool = candidates.length ? candidates : contacts;

  let best = pool[0];
  for (const entry of pool) {
    if (entry.tipRatio < best.tipRatio) best = entry;
  }

  const now = performance.now();

  for (const entry of contacts) {
    const key = `${handedness}-${entry.finger}`;
    const was = pinched.get(key) || false;
    const onThresh = PINCH_ON_BY_FINGER[entry.finger];
    const offThresh = PINCH_OFF_BY_FINGER[entry.finger];
    let next = was;

    // Activate only the clearest tip pinch. Stay active until released,
    // even if another finger briefly measures closer (fixes middle/ring).
    if (
      !was &&
      entry.finger === best.finger &&
      entry.tipIsContact &&
      entry.tipRatio < onThresh
    ) {
      next = true;
    }
    if (was && entry.tipRatio > offThresh) {
      next = false;
    }

    pinched.set(key, next);

    const phrase = getPhrase(handedness, entry.finger);
    const cooled =
      now - (lastTriggerAt.get(key) || 0) > PINCH_COOLDOWN_MS;

    if (!was && next && phrase && cooled) {
      lastTriggerAt.set(key, now);
      playFinger(phrase, handedness, entry.finger);
    }

    drawPadCircle(
      entry.pad,
      entry.fingerRadius,
      FINGER_COLORS[entry.finger],
      phrase,
      next
    );
  }
}

function drawHands(results) {
  resizeCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!results.landmarks?.length) return;

  results.landmarks.forEach((landmarks, i) => {
    const handedness = results.handednesses?.[i]?.[0]?.categoryName || "Right";
    updatePinches(handedness, landmarks);
  });
}

async function detectFrame() {
  if (!running || !handLandmarker) return;

  if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const results = handLandmarker.detectForVideo(video, performance.now());
    drawHands(results);
  }

  requestAnimationFrame(detectFrame);
}

async function createLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
  );
  return HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
    minHandDetectionConfidence: 0.65,
    minHandPresenceConfidence: 0.65,
    minTrackingConfidence: 0.65,
  });
}

async function prefetchAllPhrases() {
  // Sequential + slight delay avoids TTS rate-limits that were starving
  // right-hand middle/ring voices.
  for (const hand of HANDS) {
    for (const finger of FINGER_ORDER) {
      const phrase = getPhrase(hand, finger);
      if (!phrase) continue;
      try {
        await getPhraseBuffer(phrase, hand, finger, true);
      } catch (error) {
        console.warn(error);
      }
      await new Promise((r) => setTimeout(r, 80));
    }
  }
}

async function startCamera() {
  startBtn.disabled = true;
  ensureAudio();
  setStatus("Loading…");

  try {
    if (typeof window.SamJs !== "function") {
      throw new Error("Speech engine failed to load");
    }
    await prefetchAllPhrases();
    // Prove audio + left-index voice from this click.
    await playPhrase(phrases.Left.index, "Left", "index");
    handLandmarker = await createLandmarker();
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Could not load. Try again.");
    startBtn.disabled = false;
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    video.srcObject = stream;
    await video.play();
    video.classList.add("live");
    startBtn.hidden = true;
    running = true;
    setStatus("");
    requestAnimationFrame(detectFrame);
  } catch (error) {
    console.error(error);
    setStatus("Camera permission needed — try Start again.");
    startBtn.disabled = false;
  }
}

startBtn.addEventListener("click", startCamera);

editToggle.addEventListener("click", () => {
  setEditorOpen(editor.hidden);
});

editClose.addEventListener("click", () => setEditorOpen(false));

phraseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  phrases = readForm();
  savePhrases();
  soundCache.clear();

  ensureAudio();
  setEditorOpen(false);
  setStatus("Building voices…");

  try {
    await prefetchAllPhrases();
    await playPhrase(phrases.Left.index, "Left", "index");
    setStatus("");
  } catch (error) {
    console.error(error);
    setStatus("Saved, but audio failed to build.");
  }
});

resetBtn.addEventListener("click", () => {
  phrases = cloneDefaults();
  savePhrases();
  fillForm();
});

window.addEventListener("resize", () => {
  if (running) resizeCanvas();
});

fillForm();
