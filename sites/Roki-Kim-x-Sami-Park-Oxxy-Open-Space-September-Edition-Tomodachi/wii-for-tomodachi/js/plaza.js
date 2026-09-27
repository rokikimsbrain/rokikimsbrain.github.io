const MP_VISION = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";
const MP_MODEL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const COLS = 4;
const ROWS = 3;
const SLOTS_PER_PAGE = COLS * ROWS;
const PAGE_COUNT = 3;
const PINCH_ON = 0.52;
const PINCH_OFF = 0.78;
const FIST_ON = 0.38;
const FIST_OFF = 0.22;
const PINCH_ON_FRAMES = 2;
const PINCH_OFF_FRAMES = 8;
const HAND_LOST_FRAMES = 10;
const POINTER_SMOOTH_HANDS = 0.12;
const POINTER_SMOOTH_MOUSE = 0.48;
const EDGE = 0.13;
const PAGE_HOLD = 0.42;
const CHANNEL_HOLD_FIRST = 0.5;
const CHANNEL_HOLD_NEXT = 1;

// Put your loops in audio/, then type the filename next to a channel.
// Leave a channel as "" to keep it silent.
const CHANNEL_AUDIO = {
  disc: "0001 og dull.mp3",
  mii: "0002 og isa.mp3",
  photo: "0003 michi dull.mp3",
  shop: "0004 tz kpoppo irene.mp3",
  forecast: "0005 yerba sativa.mp3",
  news: "0006 sativa one47.mp3",
  votes: "0007 killspires.mp3",
  check: "0008 lluneth.mp3",
  internet: "0009 isa.mp3",
  nintendo: "0010 irene linea luanne.mp3",
  speak: "0011 tz one47.mp3",
  transfer: "0012 windmill ova.mp3",
  "luigis-mansion-3": "0013 isa dull.mp3",
  "mario-maker-2": "0014 oxo kpoppo.mp3",
  odyssey: "0015 tz luanne.mp3",
  "smash-ultimate": "0016 isa.mp3",
  "mario-party": "0017 lluneth one47.mp3",
  "mk8-deluxe": "0018 killspires.mp3",
  "track-19": "0019 roi tripping.mp3",
  "track-20": "0020 ki tell me the problem.mp3",
  "track-21": "0021 jkjmetasco dolls.mp3",
  "track-22": "0022 awfultop on her feet.mp3",
  "track-23": "0023 saheb kicking shit like might guy.mp3",
  "track-24": "0024 sb only for the first time.mp3",
  "track-25": "0025 1ure look what the cat dragged in.mp3",
  "track-26": "0026 awfultop hit me.mp3",
};

// Put one video in video/ for each channel, using these filenames.
// Leave a name as "" to keep that channel without a video.
const CHANNEL_VIDEO = {
  disc: "disc.mp4",
  mii: "mii.mp4",
  photo: "photo.mp4",
  shop: "shop.mp4",
  forecast: "forecast.mp4",
  news: "news.mp4",
  votes: "votes.mp4",
  check: "check.mp4",
  internet: "internet.mp4",
  nintendo: "nintendo.mp4",
  speak: "speak.mp4",
  transfer: "transfer.mp4",
  "luigis-mansion-3": "1.mp4",
  "mario-maker-2": "2.mp4",
  odyssey: "3.mp4",
  "smash-ultimate": "4.mp4",
  "mario-party": "5.mp4",
  "mk8-deluxe": "6.mp4",
  "track-19": "tracks.mp4",
  "track-20": "tracks.mp4",
  "track-21": "tracks.mp4",
  "track-22": "tracks.mp4",
  "track-23": "tracks.mp4",
  "track-24": "tracks.mp4",
  "track-25": "tracks.mp4",
  "track-26": "tracks.mp4",
};

const CHANNELS = [
  { id: "disc", page: 0, slot: 0, title: "Disc Channel", back: "Drop in a disc to start a game.", icon: "disc" },
  { id: "mii", page: 0, slot: 1, title: "Mii Channel", back: "A plaza of faces. Pinch this channel to step inside.", icon: "mii" },
  { id: "photo", page: 0, slot: 2, title: "Photo Channel", back: "Stills, light leaks, and the afterimage of a fall.", icon: "photo" },
  { id: "shop", page: 0, slot: 3, title: "Wii Shop Channel", back: "Nothing to buy. Everything here is already yours.", icon: "shop" },
  { id: "forecast", page: 0, slot: 4, title: "Forecast Channel", back: "Blue sky now. Storms later. Hold left or right to travel.", icon: "forecast" },
  { id: "news", page: 0, slot: 5, title: "News Channel", back: "Headlines arrive like objects you can actually hold.", icon: "news" },
  { id: "votes", page: 0, slot: 6, title: "Everybody Votes", back: "Yes or no, in one pinch.", icon: "votes" },
  { id: "check", page: 0, slot: 7, title: "Check Mii Out", back: "Put a face on a block and send it across the room.", icon: "mii" },
  { id: "internet", page: 0, slot: 8, title: "Internet Channel", back: "A window, not a feed.", icon: "internet" },
  { id: "nintendo", page: 0, slot: 9, title: "Nintendo Channel", back: "Trailers, demos, and what is coming next.", icon: "news" },
  { id: "speak", page: 0, slot: 10, title: "Wii Speak", back: "Voice as another kind of pointing.", icon: "speak" },
  { id: "transfer", page: 0, slot: 11, title: "Wii U Transfer Tool", back: "Move a plaza from one box to another.", icon: "data" },
  { id: "luigis-mansion-3", page: 1, slot: 0, title: "Luigi's Mansion 3", back: "A hotel of ghosts, and Luigi holding the vacuum.", shot: "game" },
  { id: "mario-maker-2", page: 1, slot: 1, title: "Super Mario Maker 2", back: "Build a course. Then fall through the one you just made.", shot: "game" },
  { id: "odyssey", page: 1, slot: 2, title: "Super Mario Odyssey", back: "A hat that captures, a globe that keeps turning.", shot: "game" },
  { id: "smash-ultimate", page: 1, slot: 3, title: "Super Smash Bros. Ultimate", back: "Everyone is here. The stage is already moving.", shot: "game" },
  { id: "mario-party", page: 1, slot: 4, title: "Super Mario Party", back: "Dice, minigames, and a board that will not sit still.", shot: "game" },
  { id: "mk8-deluxe", page: 1, slot: 5, title: "Mario Kart 8 Deluxe", back: "Anti-gravity, items, and a track that folds over itself.", shot: "game" },
  { id: "track-19", page: 1, slot: 6, title: "roi tripping", back: "og", shot: "game", track: true },
  { id: "track-20", page: 1, slot: 7, title: "ki tell me the problem", back: "og", shot: "game", track: true },
  { id: "track-21", page: 1, slot: 8, title: "jkjmetasco dolls", back: "og", shot: "game", track: true },
  { id: "track-22", page: 1, slot: 9, title: "awfultop on her feet", back: "og", shot: "game", track: true },
  { id: "track-23", page: 1, slot: 10, title: "saheb kicking shit like might guy", back: "dull", shot: "game", track: true },
  { id: "track-24", page: 1, slot: 11, title: "sb only for the first time", back: "dull", shot: "game", track: true },
  { id: "track-25", page: 2, slot: 0, title: "1ure look what the cat dragged in", back: "dull", shot: "game", track: true },
  { id: "track-26", page: 2, slot: 1, title: "awfultop hit me", back: "dull", shot: "game", track: true },
];

const els = {
  world: document.getElementById("world"),
  stage: document.getElementById("stage"),
  pointer: document.getElementById("pointer"),
  cam: document.getElementById("cam"),
  hint: document.getElementById("hint"),
  clock: document.getElementById("clock"),
  dockDate: document.getElementById("dockDate"),
  gate: document.getElementById("gate"),
  gateNote: document.getElementById("gateNote"),
  startCam: document.getElementById("startCam"),
  startMouse: document.getElementById("startMouse"),
  handGuide: document.getElementById("handGuide"),
  handGuideBack: document.getElementById("handGuideBack"),
  handGuideNext: document.getElementById("handGuideNext"),
  handGuideDots: document.getElementById("handGuideDots"),
  arrowLeft: document.getElementById("arrowLeft"),
  arrowRight: document.getElementById("arrowRight"),
  meterLeft: document.getElementById("meterLeft"),
  meterRight: document.getElementById("meterRight"),
  pagePips: document.getElementById("pagePips"),
  channelScreen: document.getElementById("channelScreen"),
  channelTitle: document.getElementById("channelTitle"),
  channelCrowd: document.getElementById("channelCrowd"),
  channelViz: document.getElementById("channelViz"),
  channelVideo: document.getElementById("channelVideo"),
  trackCharacters: document.getElementById("trackCharacters"),
  closeChannel: document.getElementById("closeChannel"),
  nextChannel: document.getElementById("nextChannel"),
  backChannel: document.getElementById("backChannel"),
  wiiBtn: document.getElementById("wiiBtn"),
  mailBtn: document.getElementById("mailBtn"),
  mailNote: document.getElementById("mailNote"),
  messageBoard: document.getElementById("messageBoard"),
  closeBoard: document.getElementById("closeBoard"),
};

const state = {
  mode: "idle",
  page: 0,
  pageX: 0,
  pointer: { x: 0.5, y: 0.5, clientX: innerWidth / 2, clientY: innerHeight / 2, visible: false },
  pinch: false,
  hovered: null,
  meters: { left: 0, right: 0 },
  edgeRepeat: { left: 0, right: 0 },
  lastTs: 0,
  hand: null,
  landmarker: null,
  audio: null,
  channelLoop: null,
  lastHoverId: null,
  pinchOnFrames: 0,
  pinchOffFrames: 0,
  pinchSmooth: 1,
  fistSmooth: 0,
  lostFrames: 0,
  openTile: null,
  mailNotified: false,
  guideStep: 0,
  guideTimer: 0,
};

const tiles = new Map();
const slots = [];

function iconSvg(kind) {
  const icons = {
    disc: `<circle class="spin" cx="36" cy="32" r="22" fill="#f4f4f4" stroke="#c8c8c8" stroke-width="3"/><circle cx="36" cy="32" r="7" fill="#7ec8ee"/><circle cx="36" cy="32" r="3" fill="#fff"/>`,
    mii: `<circle cx="36" cy="30" r="18" fill="#ffe1b5"/><circle class="eye" cx="30" cy="28" r="2.4" fill="#333"/><circle class="eye" cx="42" cy="28" r="2.4" fill="#333"/><path d="M30 38 q6 5 12 0" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    photo: `<g class="float"><rect x="16" y="18" width="40" height="30" rx="4" fill="#7ad3a0"/><polygon points="22,42 32,28 40,36 46,30 54,42" fill="#fff"/><circle cx="26" cy="26" r="3" fill="#fff59a"/></g>`,
    forecast: `<circle class="glow" cx="30" cy="28" r="12" fill="#ffd054"/><ellipse class="cloud" cx="42" cy="36" rx="16" ry="10" fill="#fff"/>`,
    news: `<g class="spin-slow"><circle cx="36" cy="32" r="18" fill="#3d7fe0"/><path d="M18 32 h36 M36 14 v36 M22 20 q14 8 28 0 M22 44 q14-8 28 0" stroke="#fff" stroke-width="2" fill="none"/></g>`,
    shop: `<g class="sway"><path d="M24 24 h24 l-3 26 h-18 z" fill="#7bc15a"/><path d="M30 24 v-6 a6 6 0 0 1 12 0 v6" stroke="#3a7a2a" stroke-width="3" fill="none"/></g>`,
    votes: `<rect x="18" y="20" width="36" height="28" rx="4" fill="#fff"/><path class="pop" d="M26 34 l6 6 14-16" stroke="#2f9de0" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    internet: `<g class="pulse"><circle cx="36" cy="32" r="18" fill="#5aa6e8"/><ellipse cx="36" cy="32" rx="8" ry="18" fill="none" stroke="#fff" stroke-width="2"/><path d="M18 32 h36 M22 24 h28 M22 40 h28" stroke="#fff" stroke-width="2"/></g>`,
    mail: `<g class="nudge"><rect x="16" y="22" width="40" height="26" rx="3" fill="#f4d35e"/><path d="M16 22 l20 16 20-16" stroke="#fff" stroke-width="3" fill="none"/></g>`,
    falling: `<rect x="30" y="12" width="12" height="40" rx="3" fill="#111"/><rect class="fall-bar" x="32" y="14" width="8" height="8" fill="#fff"/>`,
    light: `<rect x="28" y="14" width="16" height="38" fill="#111"/><rect class="flash" x="28" y="30" width="16" height="10" fill="#fff"/>`,
    descent: `<g class="slide"><path d="M24 16 l12 12 12-12" stroke="#2f9de0" stroke-width="4" fill="none"/><path d="M24 32 l12 12 12-12" stroke="#2f9de0" stroke-width="4" fill="none"/></g>`,
    pulse: `<path class="beat" d="M16 36 h10 l4-14 8 28 6-14 h12" stroke="#e85d4c" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    night: `<g class="float"><circle cx="36" cy="32" r="16" fill="#1c2a4a"/><circle cx="42" cy="26" r="10" fill="#b6e3f8"/></g>`,
    signal: `<g class="ripple"><path d="M24 40 a16 16 0 0 1 24 0 M20 34 a22 22 0 0 1 32 0 M16 28 a28 28 0 0 1 40 0" stroke="#2f9de0" stroke-width="3" fill="none"/><circle cx="36" cy="46" r="3" fill="#2f9de0"/></g>`,
    echo: `<g class="ripple"><circle cx="28" cy="32" r="6" fill="#2f9de0"/><path d="M36 22 a16 16 0 0 1 0 20 M42 16 a24 24 0 0 1 0 32" stroke="#2f9de0" stroke-width="3" fill="none"/></g>`,
    drift: `<g class="wave"><path d="M18 36 q18-22 36 0" stroke="#fff" stroke-width="5" fill="none"/><path d="M22 40 q14-14 28 0" stroke="#2f9de0" stroke-width="4" fill="none"/></g>`,
    today: `<g class="nudge"><rect x="20" y="18" width="32" height="32" rx="4" fill="#fff"/><rect x="20" y="18" width="32" height="8" fill="#e85d4c"/><circle cx="30" cy="36" r="2.5" fill="#2f9de0"/><circle cx="42" cy="36" r="2.5" fill="#2f9de0"/></g>`,
    speak: `<g class="pulse"><rect x="22" y="24" width="18" height="16" rx="3" fill="#888"/><polygon points="40,28 52,20 52,44 40,36" fill="#888"/></g>`,
    fit: `<g class="bob"><circle cx="36" cy="22" r="8" fill="#ffe1b5"/><path d="M24 50 q12-22 24 0" stroke="#2f9de0" stroke-width="5" fill="none"/></g>`,
    sports: `<circle class="spin" cx="36" cy="32" r="16" fill="#f4d35e" stroke="#d9b03a" stroke-width="3"/>`,
    homebrew: `<path class="nudge" d="M20 34 l16-16 16 16 v18 h-32 z" fill="#c47a3a"/>`,
    data: `<g class="nudge"><rect x="14" y="28" width="22" height="26" rx="3" fill="#f4d35e"/><rect x="16" y="24" width="12" height="6" rx="1.5" fill="#e0b83a"/><rect x="34" y="22" width="24" height="32" rx="3" fill="#7ec8ee"/><rect x="36" y="18" width="14" height="6" rx="1.5" fill="#5aa6e8"/></g>`,
    settings: `<g class="spin-slow"><path fill="#c5d0d8" d="M33 13 h6 v6 l5.2 2.2 4.2-4.2 4.2 4.2-4.2 4.2 2.2 5.2 h6 v6 h-6 l-2.2 5.2 4.2 4.2-4.2 4.2-4.2-4.2-5.2 2.2 v6 h-6 v-6 l-5.2-2.2-4.2 4.2-4.2-4.2 4.2-4.2-2.2-5.2 h-6 v-6 h6 l2.2-5.2-4.2-4.2 4.2-4.2 4.2 4.2 5.2-2.2z"/><circle cx="36" cy="32" r="8" fill="#eef4f8"/><circle cx="36" cy="32" r="3.6" fill="#8aa0b0"/></g>`,
  };
  return `<svg class="icon icon-${kind}" viewBox="0 0 72 72" aria-hidden="true">${icons[kind] || icons.disc}</svg>`;
}

function ensureAudio() {
  if (state.audio) return state.audio;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  state.audio = new Ctx();
  return state.audio;
}

function tone(freq, dur, type) {
  const ctx = ensureAudio();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.035, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur);
}

function chime() {
  tone(660, 0.12);
  setTimeout(function () {
    tone(990, 0.18);
  }, 70);
}

function channelVideoSrc(spec) {
  if (!spec) return "";
  var file = spec.video || CHANNEL_VIDEO[spec.id] || "";
  if (!file) return "";
  if (/^(https?:|\.\/|\/)/.test(file)) return file;
  if (file.indexOf("video/") === 0) return encodeURI(file);
  return encodeURI("video/" + file);
}

function armChannelVideoLoop(vid) {
  vid.loop = true;
  vid.onended = function () {
    if (!vid.dataset.channelId) return;
    vid.currentTime = 0;
    var again = vid.play();
    if (again && again.catch) again.catch(function () {});
  };
}

function stopChannelVideo() {
  var vid = els.channelVideo;
  if (!vid) return;
  vid.onerror = null;
  vid.onloadeddata = null;
  vid.onended = null;
  vid.pause();
  vid.hidden = true;
  vid.removeAttribute("src");
  vid.load();
  delete vid.dataset.channelId;
}

function unlockAndPlay(el) {
  var ctx = state.audio;
  function play() {
    var go = el.play();
    if (go && go.catch) go.catch(function () {});
  }
  if (ctx && ctx.state === "suspended") {
    ctx.resume().then(play).catch(play);
  } else {
    play();
  }
}

function playChannelVideo(spec) {
  var vid = els.channelVideo;
  var src = channelVideoSrc(spec);
  if (!vid || !src) {
    stopChannelVideo();
    return;
  }
  vid.muted = true;
  vid.volume = 0;
  if (vid.dataset.channelId === spec.id && vid.getAttribute("src") && !vid.error) {
    armChannelVideoLoop(vid);
    vid.hidden = false;
    vid.currentTime = 0;
    var again = vid.play();
    if (again && again.catch) again.catch(function () {});
    return;
  }
  vid.dataset.channelId = spec.id;
  armChannelVideoLoop(vid);
  vid.hidden = false;
  vid.onerror = function () {
    if (vid.dataset.channelId === spec.id) vid.hidden = true;
  };
  vid.onloadeddata = function () {
    if (vid.dataset.channelId === spec.id && !vid.error) vid.hidden = false;
  };
  vid.src = src;
  var play = vid.play();
  if (play && play.catch) play.catch(function () {});
}

const audioResolved = {};

function listedAudioFile(spec) {
  if (!spec) return "";
  return spec.audio || CHANNEL_AUDIO[spec.id] || "";
}

function audioFileFor(spec) {
  if (!spec) return "";
  if (audioResolved[spec.id]) return audioResolved[spec.id];
  return listedAudioFile(spec);
}

function audioPrefix(file) {
  var base = String(file || "")
    .replace(/^.*\//, "")
    .replace(/\.mp3$/i, "");
  var match = base.match(/^(\d+)/);
  return match ? match[1] : "";
}

function channelAudioSrc(spec) {
  if (!spec) return "";
  var file = audioFileFor(spec);
  if (!file) return "";
  if (/^(https?:|\.\/|\/)/.test(file)) return file;
  if (file.indexOf("audio/") === 0) return encodeURI(file);
  return encodeURI("audio/" + file);
}

function trackTitle(spec) {
  if (!spec) return "";
  var file = audioFileFor(spec);
  if (!file) return spec.title;
  var name = file.replace(/^.*\//, "").replace(/\.mp3$/i, "");
  name = name.replace(/^\d+\s+/, "").replace(/\s+/g, " ").trim();
  return name || spec.title;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function applyTrackTitles() {
  tiles.forEach(function (tile) {
    if (!tile.spec.track) return;
    var title = trackTitle(tile.spec);
    var label = tile.el.querySelector(".art-track-name");
    if (label) label.textContent = title;
    var heading = tile.el.querySelector(".back-copy h2");
    if (heading) heading.textContent = title;
  });
  if (state.openTile && state.openTile.spec.track && els.channelTitle) {
    els.channelTitle.textContent = trackTitle(state.openTile.spec);
  }
}

function loadAudioDirectory() {
  return fetch("audio/")
    .then(function (res) {
      if (!res.ok) return "";
      return res.text();
    })
    .then(function (html) {
      if (!html) return;
      var files = [];
      String(html).replace(/href="([^"]+\.mp3)"/gi, function (_, href) {
        files.push(decodeURIComponent(href.replace(/^.*\//, "")));
        return "";
      });
      Object.keys(CHANNEL_AUDIO).forEach(function (id) {
        var listed = CHANNEL_AUDIO[id];
        var prefix = audioPrefix(listed);
        if (!prefix) return;
        var hit = files.find(function (file) {
          var base = file.replace(/\.mp3$/i, "");
          return file === listed || base === prefix || base.indexOf(prefix + " ") === 0;
        });
        if (hit) audioResolved[id] = hit;
      });
      applyTrackTitles();
    })
    .catch(function () {});
}

const viz = {
  analyser: null,
  gain: null,
  source: null,
  freq: null,
  wave: null,
  raf: 0,
  t: 0,
  trail: [],
  gainFollow: 1,
};

function resizeViz() {
  var canvas = els.channelViz;
  if (!canvas) return;
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var w = canvas.clientWidth || innerWidth;
  var h = canvas.clientHeight || innerHeight;
  canvas.width = Math.max(1, Math.floor(w * dpr));
  canvas.height = Math.max(1, Math.floor(h * dpr));
  resizeCharLayer();
}

function resizeCharLayer() {
  var canvas = els.trackCharacters;
  if (!canvas) return;
  var w = canvas.clientWidth || innerWidth;
  var h = canvas.clientHeight || innerHeight;
  var scale = w > 960 ? 960 / w : 1;
  canvas.width = Math.max(1, Math.floor(w * scale));
  canvas.height = Math.max(1, Math.floor(h * scale));
}

function isTrackSkyPixel(r, g, b) {
  var bright = (r + g + b) / 3;
  var cyan = (g + b) / 2 - r;
  if (g > 96 && g > b + 14 && g >= r - 12) return false;
  if (r - Math.max(g, b) >= 4 && bright < 248) return false;
  if (bright < 140) return false;
  if (bright > 230 && Math.abs(g - b) < 22 && cyan > -8) return true;
  return bright > 175 && cyan > 18;
}

function punchSkyFromTop(data, w, h) {
  var n = w * h;
  var seen = new Uint8Array(n);
  var stack = new Int32Array(n);
  var top = 0;
  var i;
  var x;
  var p;
  var r;
  var g;
  var b;
  var nx;
  var ny;
  var np;
  function push(idx) {
    if (idx < 0 || idx >= n || seen[idx]) return;
    r = data[idx * 4];
    g = data[idx * 4 + 1];
    b = data[idx * 4 + 2];
    if (!isTrackSkyPixel(r, g, b)) return;
    seen[idx] = 1;
    stack[top++] = idx;
  }
  for (x = 0; x < w; x++) push(x);
  for (i = 1; i < (h * 0.42) | 0; i++) {
    push(i * w);
    push(i * w + w - 1);
  }
  while (top > 0) {
    p = stack[--top];
    data[p * 4 + 3] = 0;
    nx = p % w;
    ny = (p / w) | 0;
    if (nx > 0) push(p - 1);
    if (nx + 1 < w) push(p + 1);
    if (ny > 0) push(p - w);
    if (ny + 1 < h) push(p + w);
  }
}

function drawKeyedCharacters() {
  var canvas = els.trackCharacters;
  var vid = els.channelVideo;
  if (!canvas || canvas.hidden || !vid || vid.readyState < 2) return;
  var vw = vid.videoWidth;
  var vh = vid.videoHeight;
  if (!vw || !vh) return;
  var w = canvas.width;
  var h = canvas.height;
  var ctx = canvas.getContext("2d", { willReadFrequently: true });
  var scale = Math.max(w / vw, h / vh);
  var dw = vw * scale;
  var dh = vh * scale;
  var dx = (w - dw) / 2;
  var dy = (h - dh) / 2;
  ctx.clearRect(0, 0, w, h);
  try {
    ctx.drawImage(vid, dx, dy, dw, dh);
  } catch (err) {
    return;
  }
  var img;
  try {
    img = ctx.getImageData(0, 0, w, h);
  } catch (err) {
    ctx.clearRect(0, 0, w, h);
    return;
  }
  punchSkyFromTop(img.data, w, h);
  ctx.putImageData(img, 0, 0);
}

function ensureVizGraph() {
  var ctx = ensureAudio();
  if (!ctx) return null;
  if (ctx.state === "suspended") ctx.resume();
  if (!viz.analyser) {
    viz.analyser = ctx.createAnalyser();
    viz.analyser.fftSize = 1024;
    viz.analyser.smoothingTimeConstant = 0.32;
    viz.analyser.minDecibels = -82;
    viz.analyser.maxDecibels = -18;
    viz.gain = ctx.createGain();
    viz.gain.gain.value = 1;
    viz.analyser.connect(viz.gain);
    viz.gain.connect(ctx.destination);
    viz.freq = new Uint8Array(viz.analyser.frequencyBinCount);
    viz.wave = new Uint8Array(viz.analyser.fftSize);
  }
  return ctx;
}

function stopVizDraw() {
  if (viz.raf) cancelAnimationFrame(viz.raf);
  viz.raf = 0;
  viz.trail = [];
  viz.gainFollow = 1;
  var canvas = els.channelViz;
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  if (els.trackCharacters && els.trackCharacters.getContext) {
    var charCtx = els.trackCharacters.getContext("2d");
    charCtx.clearRect(0, 0, els.trackCharacters.width, els.trackCharacters.height);
  }
}

function startViz(spec, audioEl) {
  stopVizDraw();
  var canvas = els.channelViz;
  if (!canvas || !spec) return;
  viz.trail = [];
  resizeViz();
  var ctxAudio = ensureVizGraph();
  if (audioEl && ctxAudio) {
    try {
      if (!audioEl._wiiSource) {
        audioEl._wiiSource = ctxAudio.createMediaElementSource(audioEl);
        audioEl._wiiSource.connect(viz.analyser);
      }
    } catch (err) {
      console.error(err);
    }
  }
  function step() {
    viz.raf = requestAnimationFrame(step);
    drawViz();
  }
  viz.raf = requestAnimationFrame(step);
}

function vizHasSignal() {
  if (!viz.freq) return false;
  for (var i = 0; i < viz.freq.length; i++) {
    if (viz.freq[i] > 6) return true;
  }
  return false;
}

function vizBass() {
  if (!viz.freq || !vizHasSignal()) return 0.12 + 0.05 * Math.sin(viz.t * 0.08);
  var s = 0;
  var n = Math.min(6, viz.freq.length);
  for (var i = 0; i < n; i++) s += viz.freq[i];
  return Math.pow(s / (n * 255), 0.7);
}

function sampleWave(count) {
  var out = new Float32Array(count);
  var wave = viz.wave;
  var len = wave && wave.length ? wave.length : 0;
  var i;
  if (!len || !vizHasSignal()) {
    for (i = 0; i < count; i++) {
      var u = i / (count - 1);
      out[i] =
        Math.sin(u * Math.PI * 3 + viz.t * 0.045) * 0.16 +
        Math.sin(u * Math.PI * 7 - viz.t * 0.03) * 0.06;
    }
    return out;
  }
  for (i = 0; i < count; i++) {
    var idx = Math.floor((i / (count - 1)) * (len - 1));
    var acc = 0;
    var k;
    var span = 3;
    for (k = -span; k <= span; k++) {
      var j = Math.min(len - 1, Math.max(0, idx + k));
      acc += (wave[j] - 128) / 128;
    }
    out[i] = acc / (span * 2 + 1);
  }
  return out;
}

function projectPoint(x, y, z, w, h) {
  var yaw = 0.24;
  var xr = x * Math.cos(yaw) + (z - 0.5) * Math.sin(yaw) * 0.22;
  var persp = 1 / (0.52 + z * 1.2);
  return {
    x: w * 0.5 + xr * w * 0.25 * persp,
    y: h * (0.66 - z * 0.4) - y * h * 0.16 * persp,
    persp: persp,
  };
}

function traceRow(ctx, row) {
  var n = row.length;
  var i;
  var prev = row[0];
  ctx.beginPath();
  ctx.moveTo(prev.x, prev.y);
  for (i = 1; i < n; i++) {
    var p = row[i];
    ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + p.x) / 2, (prev.y + p.y) / 2);
    prev = p;
  }
  ctx.lineTo(prev.x, prev.y);
}

function strokeProjected(ctx, row, alpha, width, lead) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  traceRow(ctx, row);
  ctx.strokeStyle = "rgba(150, 164, 176," + (0.22 + alpha * 0.35) + ")";
  ctx.lineWidth = width + 0.8;
  ctx.stroke();
  traceRow(ctx, row);
  ctx.strokeStyle = "rgba(255,255,255," + alpha + ")";
  ctx.lineWidth = width;
  ctx.shadowColor = lead ? "rgba(255,255,255,0.9)" : "transparent";
  ctx.shadowBlur = lead ? 12 : 0;
  ctx.stroke();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
}

function drawViz() {
  var canvas = els.channelViz;
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var w = canvas.width;
  var h = canvas.height;
  var cols = 56;
  var depth = 32;
  viz.t += 1;
  if (viz.analyser) {
    viz.analyser.getByteFrequencyData(viz.freq);
    viz.analyser.getByteTimeDomainData(viz.wave);
  }
  ctx.clearRect(0, 0, w, h);

  var samples = sampleWave(cols);
  var peak = 0.05;
  var i;
  for (i = 0; i < cols; i++) peak = Math.max(peak, Math.abs(samples[i]));
  var targetGain = Math.min(3.4, 0.92 / peak);
  viz.gainFollow += (targetGain - viz.gainFollow) * 0.14;
  var bass = vizBass();
  var amp = viz.gainFollow * (0.82 + bass * 0.45);
  var shaped = new Float32Array(cols);
  for (i = 0; i < cols; i++) {
    var t = i / (cols - 1);
    var env = 0.78 + 0.22 * Math.sin(t * Math.PI);
    var y = samples[i] * amp * env;
    if (y > 1) y = 1;
    if (y < -1) y = -1;
    shaped[i] = y;
  }
  viz.trail.push(shaped);
  if (viz.trail.length > depth) viz.trail.shift();

  var rows = viz.trail;
  var rowCount = rows.length;
  var pts = [];
  var r;
  var c;
  for (r = 0; r < rowCount; r++) {
    var z = rowCount < 2 ? 0 : 1 - r / (rowCount - 1);
    var rowPts = [];
    for (c = 0; c < cols; c++) {
      var u = c / (cols - 1);
      rowPts.push(projectPoint(u * 2 - 1, rows[r][c], z, w, h));
    }
    pts.push(rowPts);
  }

  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  var dpr = window.devicePixelRatio || 1;
  var ribStep = 4;
  for (c = 0; c < cols; c += ribStep) {
    ctx.beginPath();
    for (r = 0; r < rowCount; r++) {
      var rib = pts[r][c];
      if (r === 0) ctx.moveTo(rib.x, rib.y);
      else ctx.lineTo(rib.x, rib.y);
    }
    ctx.strokeStyle = "rgba(90, 104, 116, 0.4)";
    ctx.lineWidth = Math.max(1, dpr * 1.05);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.72)";
    ctx.lineWidth = Math.max(1, dpr * 0.75);
    ctx.stroke();
  }
  for (r = 0; r < rowCount; r++) {
    var lead = r === rowCount - 1;
    var near = rowCount < 2 ? 1 : r / (rowCount - 1);
    var fade = 0.45 + near * 0.55;
    var width = Math.max(1.25, dpr * (0.7 + near * 1.15));
    strokeProjected(ctx, pts[r], fade, width, lead);
  }
  if (els.channelScreen && els.channelScreen.classList.contains("track-open")) {
    drawKeyedCharacters();
  }
}

function stopChannelLoop() {
  stopVizDraw();
  stopChannelVideo();
  var loop = state.channelLoop;
  if (!loop) return;
  if (loop._wiiSource) {
    try {
      loop._wiiSource.disconnect();
    } catch (err) {}
    loop._wiiSource = null;
  }
  loop.pause();
  loop.removeAttribute("src");
  loop.load();
  if (loop.parentNode) loop.parentNode.removeChild(loop);
  state.channelLoop = null;
}

function playChannelLoop(spec) {
  var src = channelAudioSrc(spec);
  if (!src) {
    stopChannelLoop();
    startViz(spec, null);
    playChannelVideo(spec);
    return;
  }
  if (state.channelLoop && state.channelLoop.dataset.channelId === spec.id) {
    state.channelLoop.muted = false;
    state.channelLoop.volume = 1;
    state.channelLoop.currentTime = 0;
    unlockAndPlay(state.channelLoop);
    if (!viz.raf) startViz(spec, state.channelLoop);
    playChannelVideo(spec);
    return;
  }
  stopChannelLoop();
  var ctx = ensureVizGraph();
  var el = new Audio();
  el.crossOrigin = "anonymous";
  el.src = src;
  el.loop = true;
  el.preload = "auto";
  el.volume = 1;
  el.muted = false;
  el.hidden = true;
  el.dataset.channelId = spec.id;
  el.setAttribute("data-channel-audio", spec.id);
  el.addEventListener("error", function () {
    if (state.channelLoop !== el) return;
    startViz(spec, null);
    if (el.parentNode) el.parentNode.removeChild(el);
    if (state.channelLoop === el) state.channelLoop = null;
  });
  document.body.appendChild(el);
  state.channelLoop = el;
  function go() {
    startViz(spec, el);
    playChannelVideo(spec);
    unlockAndPlay(el);
  }
  if (ctx && ctx.state === "suspended") ctx.resume().then(go).catch(go);
  else go();
}

function buildAtmosphere() {}

function channelArt(spec) {
  var shots = {
    disc: 1,
    mii: 1,
    photo: 1,
    shop: 1,
    forecast: 1,
    news: 1,
    votes: 1,
    check: 1,
    internet: 1,
    nintendo: 1,
    speak: 1,
    transfer: 1,
  };
  if (spec.track) {
    return (
      '<div class="art art-game art-track" style="background-image:url(\'img/newaudiofileimage.png?v=oxxy-newimg1\'),url(\'img/newaudiofileimage.jpg?v=oxxy-newimg1\')">' +
      '<b class="art-track-name">' +
      escapeHtml(trackTitle(spec)) +
      "</b></div>"
    );
  }
  if (spec.shot === "game") {
    return (
      '<div class="art art-game" style="background-image:url(\'img/ch-' +
      spec.id +
      ".png?v=oxxy-sametrack1')\"></div>"
    );
  }
  if (shots[spec.id]) {
    return (
      '<div class="art art-shot" style="background-image:url(\'img/ch-' +
      spec.id +
      ".png\')\"></div>"
    );
  }
  return '<div class="art art-plain"><b>' + spec.title + "</b></div>";
}

function makeTile(spec, extraClass) {
  var channel = document.createElement("article");
  channel.className = extraClass ? "channel " + extraClass : "channel";
  channel.dataset.id = spec.id;
  channel.innerHTML =
    '<div class="channel-face front">' +
    channelArt(spec) +
    '</div><div class="channel-face back"><div class="back-copy"><h2>' +
    spec.title +
    "</h2><p>" +
    spec.back +
    "</p></div></div>";
  return {
    spec: spec,
    el: channel,
    page: spec.page || 0,
    slot: spec.slot || 0,
    rotY: 0,
    rotX: 0,
    lift: 1,
    z: 0,
    phase: (spec.slot || 0) * 0.7 + (spec.page || 0) * 1.3,
    homePage: spec.page || 0,
    homeSlot: spec.slot || 0,
  };
}

function buildWorld() {
  els.world.innerHTML = "";
  els.pagePips.innerHTML = "";
  slots.length = 0;
  tiles.clear();

  for (var p = 0; p < PAGE_COUNT; p++) {
    var page = document.createElement("section");
    page.className = "page";
    page.dataset.page = String(p);
    var grid = document.createElement("div");
    grid.className = "grid";
    for (var s = 0; s < SLOTS_PER_PAGE; s++) {
      var slot = document.createElement("div");
      slot.className = "slot";
      slot.dataset.page = String(p);
      slot.dataset.slot = String(s);
      grid.appendChild(slot);
      slots.push(slot);
    }
    page.appendChild(grid);
    els.world.appendChild(page);

    var pip = document.createElement("span");
    pip.className = "pip" + (p === 0 ? " is-on" : "");
    els.pagePips.appendChild(pip);
  }

  CHANNELS.forEach(function (spec) {
    var slot = slotEl(spec.page, spec.slot);
    var tile = makeTile(spec);
    tile.el.style.setProperty("--idle-delay", (spec.slot * 0.18 + spec.page * 0.4).toFixed(2) + "s");
    slot.appendChild(tile.el);
    tiles.set(spec.id, tile);
  });
}

function slotEl(page, slot) {
  return els.world.querySelector('.slot[data-page="' + page + '"][data-slot="' + slot + '"]');
}

function updateClock() {
  var now = new Date();
  var h = now.getHours();
  var h12 = h % 12 || 12;
  var m = String(now.getMinutes()).padStart(2, "0");
  var ampm = h >= 12 ? "PM" : "AM";
  els.clock.innerHTML =
    '<span class="clock-h">' +
    h12 +
    '</span><span class="clock-m">' +
    m +
    '</span><span class="clock-ampm">' +
    ampm +
    "</span>";
  var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  if (els.dockDate) {
    els.dockDate.textContent = days[now.getDay()] + " " + (now.getMonth() + 1) + "/" + now.getDate();
  }
}

function defaultHint() {
  if (state.mode === "hands") {
    return "Pinch a channel to open it. Hold your hand at the left or right edge to turn the page.";
  }
  return "Click a channel to open it. Push the cursor to the left or right edge to turn the page.";
}

function setHint(text) {
  els.hint.textContent = text || defaultHint();
}

function setPage(page) {
  var prev = state.page;
  var next = Math.max(0, Math.min(PAGE_COUNT - 1, page));
  if (next === prev) return;
  state.page = next;
  tone(next > prev ? 880 : 620, 0.1);
  Array.prototype.forEach.call(els.pagePips.children, function (pip, i) {
    pip.classList.toggle("is-on", i === state.page);
  });
  els.arrowLeft.disabled = state.page === 0;
  els.arrowRight.disabled = state.page === PAGE_COUNT - 1;
}

function palmCenter(landmarks) {
  return {
    x: (landmarks[0].x + landmarks[5].x + landmarks[17].x) / 3,
    y: (landmarks[0].y + landmarks[5].y + landmarks[17].y) / 3,
  };
}

function dist2(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function handScale(landmarks) {
  var scale = dist2(landmarks[0], landmarks[9]);
  return Math.max(scale, 0.06);
}

function pinchDistance(landmarks) {
  var thumb = landmarks[4];
  return Math.min(
    dist2(thumb, landmarks[8]),
    dist2(thumb, landmarks[7]),
    dist2(thumb, landmarks[6]),
    dist2(thumb, landmarks[12])
  );
}

function fingerCurl(landmarks, mcp, tip) {
  var wrist = landmarks[0];
  var mcpD = dist2(landmarks[mcp], wrist);
  var tipD = dist2(landmarks[tip], wrist);
  return 1 - Math.min(1, tipD / Math.max(mcpD * 1.85, 0.03));
}

function fistAmount(landmarks) {
  return (
    fingerCurl(landmarks, 5, 8) +
    fingerCurl(landmarks, 9, 12) +
    fingerCurl(landmarks, 13, 16) +
    fingerCurl(landmarks, 17, 20)
  ) / 4;
}

function isGrabbing(landmarks) {
  var pinch = pinchDistance(landmarks) / handScale(landmarks);
  var fist = fistAmount(landmarks);
  state.pinchSmooth = state.pinchSmooth * 0.6 + pinch * 0.4;
  state.fistSmooth = state.fistSmooth * 0.6 + fist * 0.4;
  if (state.pinch) return state.pinchSmooth < PINCH_OFF || state.fistSmooth > FIST_OFF;
  return state.pinchSmooth < PINCH_ON || state.fistSmooth > FIST_ON;
}

function pointerFromHand(landmarks, grabbing) {
  var palm = palmCenter(landmarks);
  var knuckle = landmarks[5];
  var index = landmarks[8];
  var ix;
  var iy;
  if (grabbing) {
    ix = knuckle.x * 0.55 + palm.x * 0.45;
    iy = knuckle.y * 0.55 + palm.y * 0.45;
  } else {
    ix = index.x * 0.4 + knuckle.x * 0.35 + palm.x * 0.25;
    iy = index.y * 0.4 + knuckle.y * 0.35 + palm.y * 0.25;
  }
  return {
    x: 1 - ix,
    y: iy,
  };
}

function clientFromNorm(nx, ny) {
  return { x: nx * innerWidth, y: ny * innerHeight };
}

function channelAtPointer() {
  var x = state.pointer.clientX;
  var y = state.pointer.clientY;
  var best = null;
  var bestArea = Infinity;
  tiles.forEach(function (tile) {
    var r = tile.el.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      var area = r.width * r.height;
      if (area < bestArea) {
        best = tile;
        bestArea = area;
      }
    }
  });
  return best;
}

function hitElement(el, pad) {
  if (!el || el.hidden) return false;
  pad = pad || 0;
  var r = el.getBoundingClientRect();
  return (
    state.pointer.clientX >= r.left - pad &&
    state.pointer.clientX <= r.right + pad &&
    state.pointer.clientY >= r.top - pad &&
    state.pointer.clientY <= r.bottom + pad
  );
}

function hitMail() {
  return hitElement(els.mailBtn, 28) || hitElement(els.mailNote, 12);
}

function applyTileTransform(tile) {
  var hot = state.hovered === tile;
  var wantLift = hot ? 1.06 : 1;
  var wantZ = hot ? 42 : 0;
  tile.lift += (wantLift - (tile.lift || 1)) * 0.16;
  tile.z += (wantZ - (tile.z || 0)) * 0.16;
  var hoverTilt = hot ? -2.4 : 0;
  tile.el.style.transform =
    "translateZ(" +
    (tile.z || 0).toFixed(1) +
    "px) rotateX(" +
    hoverTilt.toFixed(2) +
    "deg) scale(" +
    (tile.lift || 1).toFixed(3) +
    ")";
  tile.el.classList.toggle("is-hot", hot);
}

function channelIndex(id) {
  for (var i = 0; i < CHANNELS.length; i++) {
    if (CHANNELS[i].id === id) return i;
  }
  return -1;
}

function syncChannelArrows() {
  if (els.channelScreen.hidden || !state.openTile) {
    els.arrowLeft.disabled = state.page === 0;
    els.arrowRight.disabled = state.page === PAGE_COUNT - 1;
    if (els.nextChannel) els.nextChannel.disabled = true;
    if (els.backChannel) els.backChannel.disabled = true;
    return;
  }
  var i = channelIndex(state.openTile.spec.id);
  els.arrowLeft.disabled = true;
  els.arrowRight.disabled = true;
  if (els.backChannel) els.backChannel.disabled = i <= 0;
  if (els.nextChannel) els.nextChannel.disabled = i < 0 || i >= CHANNELS.length - 1;
}

function openChannel(tile) {
  if (!tile) return;
  state.openTile = tile;
  els.channelTitle.textContent = trackTitle(tile.spec);
  if (els.channelCrowd) els.channelCrowd.hidden = true;
  if (els.trackCharacters) els.trackCharacters.hidden = !tile.spec.track;
  els.channelScreen.classList.toggle("track-open", !!tile.spec.track);
  els.channelScreen.hidden = false;
  document.body.classList.add("channel-open");
  syncChannelArrows();
  chime();
  playChannelLoop(tile.spec);
}

function closeChannel() {
  stopChannelLoop();
  els.channelScreen.hidden = true;
  els.channelScreen.classList.remove("track-open");
  if (els.trackCharacters) els.trackCharacters.hidden = true;
  document.body.classList.remove("channel-open");
  state.openTile = null;
  syncChannelArrows();
}

function stopCamera() {
  if (state.landmarker && state.landmarker.close) {
    try {
      state.landmarker.close();
    } catch (err) {}
  }
  state.landmarker = null;
  if (!els.cam) return;
  var stream = els.cam.srcObject;
  if (stream && stream.getTracks) {
    stream.getTracks().forEach(function (track) {
      track.stop();
    });
  }
  els.cam.srcObject = null;
  els.cam.pause();
}

function returnToGate() {
  if (state.mode === "idle" && els.gate && !els.gate.hidden) return;
  if (boardOpen()) closeMessage();
  if (!els.channelScreen.hidden) closeChannel();
  state.mode = "idle";
  state.pinch = false;
  state.hand = null;
  state.pinchOnFrames = 0;
  state.pinchOffFrames = 0;
  state.hovered = null;
  state.meters.left = 0;
  state.meters.right = 0;
  state.pointer.visible = false;
  stopCamera();
  if (els.pointer) els.pointer.hidden = true;
  document.body.classList.add("gate-open");
  document.body.classList.remove("mouse-mode");
  document.body.classList.remove("channel-open");
  document.body.classList.remove("board-open");
  if (els.gate) els.gate.hidden = false;
  if (els.gateNote) els.gateNote.textContent = "";
  if (els.startCam) els.startCam.classList.remove("is-pressed");
  if (els.startMouse) els.startMouse.classList.remove("is-pressed");
  hideHandGuide();
  state.page = 0;
  state.pageX = 0;
  if (els.pagePips) {
    Array.prototype.forEach.call(els.pagePips.children, function (pip, i) {
      pip.classList.toggle("is-on", i === 0);
    });
  }
  els.arrowLeft.disabled = true;
  els.arrowRight.disabled = PAGE_COUNT - 1 === 0;
  placeCrowdHotspots();
  chime();
}

function openAdjacentChannel(dir) {
  if (!state.openTile) return;
  var i = channelIndex(state.openTile.spec.id) + dir;
  if (i < 0 || i >= CHANNELS.length) return;
  openChannel(tiles.get(CHANNELS[i].id));
}

function tileFromEvent(event) {
  if (!event || !event.target || !event.target.closest) return null;
  var el = event.target.closest(".channel");
  if (!el) return null;
  return tiles.get(el.dataset.id) || null;
}

function boardOpen() {
  return els.messageBoard && !els.messageBoard.hidden;
}

function notifyMail() {
  if (!els.mailBtn || state.mailNotified) return;
  state.mailNotified = true;
  els.mailBtn.classList.remove("is-notify");
  void els.mailBtn.offsetWidth;
  els.mailBtn.classList.add("is-notify");
  if (!els.mailNote) return;
  els.mailNote.hidden = false;
  els.mailNote.classList.remove("is-out");
  setTimeout(function () {
    if (!els.mailNote || boardOpen()) return;
    els.mailNote.classList.add("is-out");
    setTimeout(function () {
      if (els.mailNote && !boardOpen()) els.mailNote.hidden = true;
    }, 380);
  }, 2800);
}

function openMessage() {
  if (!els.messageBoard) return;
  if (els.mailNote) els.mailNote.hidden = true;
  if (!els.channelScreen.hidden) closeChannel();
  els.messageBoard.hidden = false;
  document.body.classList.add("board-open");
  var scroll = els.messageBoard.querySelector(".board-scroll");
  if (scroll) scroll.scrollTop = 0;
  chime();
}

function closeMessage() {
  if (!els.messageBoard) return;
  els.messageBoard.hidden = true;
  document.body.classList.remove("board-open");
}

function onPinchStart(event) {
  if (boardOpen()) {
    if (hitElement(els.closeBoard) || (event && event.target && event.target.closest && event.target.closest("#closeBoard"))) {
      closeMessage();
    }
    return;
  }
  if (hitMail() || (event && event.target && event.target.closest && (event.target.closest("#mailBtn") || event.target.closest("#mailNote")))) {
    openMessage();
    return;
  }
  if (!els.channelScreen.hidden) {
    if (hitElement(els.nextChannel) || (event && event.target && event.target.closest && event.target.closest("#nextChannel"))) {
      if (els.nextChannel && !els.nextChannel.disabled) openAdjacentChannel(1);
      return;
    }
    if (hitElement(els.backChannel) || (event && event.target && event.target.closest && event.target.closest("#backChannel"))) {
      if (els.backChannel && !els.backChannel.disabled) openAdjacentChannel(-1);
      return;
    }
    if (hitElement(els.closeChannel) || (event && event.target && event.target.closest && event.target.closest("#closeChannel"))) {
      closeChannel();
    }
    return;
  }
  var tile = tileFromEvent(event) || channelAtPointer();
  if (tile) {
    openChannel(tile);
    return;
  }
  if (hitElement(els.wiiBtn)) returnToGate();
}

function onPinchEnd() {}

function updatePointer(nx, ny, visible, snap) {
  var alpha = snap ? 1 : state.mode === "hands" ? POINTER_SMOOTH_HANDS : POINTER_SMOOTH_MOUSE;
  state.pointer.x += (nx - state.pointer.x) * alpha;
  state.pointer.y += (ny - state.pointer.y) * alpha;
  var sm = clientFromNorm(state.pointer.x, state.pointer.y);
  state.pointer.clientX = sm.x;
  state.pointer.clientY = sm.y;
  state.pointer.visible = visible;
  if (visible) {
    els.pointer.hidden = false;
    els.pointer.style.left = sm.x + "px";
    els.pointer.style.top = sm.y + "px";
  }
}

function tick(ts) {
  var dt = state.lastTs ? Math.min(0.05, (ts - state.lastTs) / 1000) : 0.016;
  state.lastTs = ts;

  var targetX = -state.page * 100;
  state.pageX += (targetX - state.pageX) * Math.min(1, dt * 14);
  var lean = (state.pointer.x - 0.5) * -8;
  els.world.style.transform = "translate3d(calc(" + state.pageX + "vw + " + lean.toFixed(1) + "px), 0, 0)";

  var hovered = channelAtPointer();
  if (hovered && hovered !== state.hovered && hovered.spec) {
    if (state.lastHoverId !== hovered.spec.id) {
      tone(980, 0.05);
      state.lastHoverId = hovered.spec.id;
    }
  }
  if (!hovered) state.lastHoverId = null;
  state.hovered = hovered || null;

  tiles.forEach(function (tile) {
    applyTileTransform(tile);
  });

  var splash = !els.channelScreen.hidden;
  var blocking = !els.gate.hidden || boardOpen();
  var leftHot;
  var rightHot;
  if (splash) {
    leftHot = false;
    rightHot = false;
  } else {
    var onDock = hitMail() || hitElement(els.wiiBtn, 16);
    leftHot = !onDock && !blocking && state.pointer.visible && state.pointer.x < EDGE && state.page > 0;
    rightHot = !onDock && !blocking && state.pointer.visible && state.pointer.x > 1 - EDGE && state.page < PAGE_COUNT - 1;
  }
  var leftHold = PAGE_HOLD;
  var rightHold = PAGE_HOLD;
  state.meters.left = leftHot ? Math.min(1, state.meters.left + dt / leftHold) : Math.max(0, state.meters.left - dt * 2);
  state.meters.right = rightHot ? Math.min(1, state.meters.right + dt / rightHold) : Math.max(0, state.meters.right - dt * 2);
  if (!leftHot) state.edgeRepeat.left = 0;
  if (!rightHot) state.edgeRepeat.right = 0;
  els.meterLeft.classList.toggle("is-on", leftHot || state.meters.left > 0.05);
  els.meterRight.classList.toggle("is-on", rightHot || state.meters.right > 0.05);
  els.meterLeft.style.opacity = String(0.25 + state.meters.left * 0.75);
  els.meterRight.style.opacity = String(0.25 + state.meters.right * 0.75);
  els.arrowLeft.classList.toggle("is-hot", leftHot);
  els.arrowRight.classList.toggle("is-hot", rightHot);
  if (state.meters.left >= 1) {
    setPage(state.page - 1);
    state.meters.left = 0;
  }
  if (state.meters.right >= 1) {
    setPage(state.page + 1);
    state.meters.right = 0;
  }

  els.pointer.classList.toggle("is-pinch", state.pinch);
  els.wiiBtn.classList.toggle("is-hot", hitElement(els.wiiBtn));
  if (els.mailBtn) els.mailBtn.classList.toggle("is-hot", hitElement(els.mailBtn));
  if (els.closeChannel) els.closeChannel.classList.toggle("is-hot", hitElement(els.closeChannel));
  if (els.nextChannel) els.nextChannel.classList.toggle("is-hot", !els.nextChannel.disabled && hitElement(els.nextChannel));
  if (els.backChannel) els.backChannel.classList.toggle("is-hot", !els.backChannel.disabled && hitElement(els.backChannel));
  requestAnimationFrame(tick);
}

async function createLandmarker() {
  var mod = await import(MP_VISION + "/vision_bundle.mjs");
  var vision = await mod.FilesetResolver.forVisionTasks(MP_VISION + "/wasm");
  var options = {
    runningMode: "VIDEO",
    numHands: 1,
    minHandDetectionConfidence: 0.55,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  };
  try {
    return await mod.HandLandmarker.createFromOptions(vision, Object.assign({}, options, {
      baseOptions: { modelAssetPath: MP_MODEL, delegate: "GPU" },
    }));
  } catch (err) {
    return mod.HandLandmarker.createFromOptions(vision, Object.assign({}, options, {
      baseOptions: { modelAssetPath: MP_MODEL, delegate: "CPU" },
    }));
  }
}

async function startCamera() {
  els.gateNote.textContent = "Asking for the camera…";
  try {
    var stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
    els.cam.srcObject = stream;
    await els.cam.play();
    state.landmarker = await createLandmarker();
    state.mode = "hands";
    els.gate.hidden = true;
    document.body.classList.remove("gate-open");
    document.body.classList.remove("mouse-mode");
    notifyMail();
    els.pointer.hidden = false;
    hideHandGuide();
    chime();
    setHint("Pinch a channel to open it. Hold your hand at the left or right edge to turn the page.");
    loopHands();
  } catch (err) {
    console.error(err);
    els.gateNote.textContent = "Camera blocked or unavailable. Use the mouse, or allow the camera and try again.";
    startMouse();
  }
}

function loopHands() {
  var lastVideoTime = -1;
  function step() {
    if (state.mode !== "hands" || !state.landmarker) return;
    if (els.cam.readyState >= 2 && els.cam.currentTime !== lastVideoTime) {
      lastVideoTime = els.cam.currentTime;
      var result = state.landmarker.detectForVideo(els.cam, performance.now());
      if (result.landmarks && result.landmarks[0]) {
        var lm = result.landmarks[0];
        state.hand = lm;
        state.lostFrames = 0;
        var wantPinch = isGrabbing(lm);
        if (!(wantPinch && !state.pinch)) {
          var point = pointerFromHand(lm, wantPinch || state.pinch);
          updatePointer(point.x, point.y, true);
        }
        if (wantPinch) {
          state.pinchOnFrames += 1;
          state.pinchOffFrames = 0;
        } else {
          state.pinchOffFrames += 1;
          state.pinchOnFrames = 0;
        }
        if (!state.pinch && state.pinchOnFrames >= PINCH_ON_FRAMES) {
          state.pinch = true;
          onPinchStart();
        } else if (state.pinch && state.pinchOffFrames >= PINCH_OFF_FRAMES) {
          state.pinch = false;
          onPinchEnd();
        }
      } else {
        state.lostFrames += 1;
        if (state.lostFrames >= HAND_LOST_FRAMES) {
          state.hand = null;
          state.pinchOnFrames = 0;
          state.pinchOffFrames = 0;
          if (state.pinch) {
            state.pinch = false;
            onPinchEnd();
          }
        }
      }
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function startMouse() {
  hideHandGuide();
  state.mode = "mouse";
  els.gate.hidden = true;
  document.body.classList.remove("gate-open");
  document.body.classList.add("mouse-mode");
  els.pointer.hidden = false;
  setHint("Click a channel to open it. Push the cursor to the left or right edge to turn the page.");
  chime();
  notifyMail();
}

function clearGuideTimer() {
  if (state.guideTimer) {
    clearTimeout(state.guideTimer);
    state.guideTimer = 0;
  }
}

function hideHandGuide() {
  clearGuideTimer();
  state.guideStep = 0;
  if (els.handGuide) els.handGuide.hidden = true;
}

function renderHandGuide() {
  if (!els.handGuide) return;
  Array.prototype.forEach.call(els.handGuide.querySelectorAll(".hand-guide-slide"), function (slide) {
    var on = Number(slide.dataset.step) === state.guideStep;
    slide.hidden = !on;
    slide.classList.toggle("is-on", on);
  });
  if (els.handGuideDots) {
    Array.prototype.forEach.call(els.handGuideDots.children, function (dot, i) {
      dot.classList.toggle("is-on", i === state.guideStep);
    });
  }
  if (els.handGuideNext) els.handGuideNext.textContent = state.guideStep >= 2 ? "Continue" : "Next";
}

function queueGuideAdvance() {
  clearGuideTimer();
  if (state.guideStep >= 2) return;
  state.guideTimer = setTimeout(function () {
    if (!els.handGuide || els.handGuide.hidden) return;
    setHandGuideStep(state.guideStep + 1);
  }, 3400);
}

function setHandGuideStep(step) {
  state.guideStep = Math.max(0, Math.min(2, step));
  renderHandGuide();
  queueGuideAdvance();
}

function openHandGuide() {
  if (!els.handGuide) {
    startCamera();
    return;
  }
  state.mode = "guide";
  els.handGuide.hidden = false;
  setHandGuideStep(0);
}

function beginFromGate(btn, fn) {
  if (state.mode !== "idle") return;
  state.mode = "starting";
  if (btn) btn.classList.add("is-pressed");
  var ctx = ensureAudio();
  if (ctx && ctx.state === "suspended") ctx.resume();
  setTimeout(fn, 420);
}

var CROWD_ART = { imgW: 1024, imgH: 422 };
var CROWD_FACES = [
  { id: "tomodachi", x: 826, y: 294, r: 40 },
  { id: "sami", x: 299, y: 378, r: 26 },
  { id: "roki", x: 505, y: 372, r: 28 },
  { id: "elisa", x: 610, y: 376, r: 26 },
];

function placeCrowdHotspots() {
  var crowd = document.querySelector(".gate-crowd");
  if (!crowd) return;
  var w = crowd.offsetWidth;
  var h = crowd.offsetHeight;
  if (!w || !h) return;
  var scale = Math.max(w / CROWD_ART.imgW, h / CROWD_ART.imgH);
  var drawnW = CROWD_ART.imgW * scale;
  var drawnH = CROWD_ART.imgH * scale;
  var originX = crowd.offsetLeft + (w - drawnW) / 2;
  var originY = crowd.offsetTop + h - drawnH;
  CROWD_FACES.forEach(function (face) {
    var hit = document.querySelector('.crowd-hotspot[data-face="' + face.id + '"]');
    if (!hit) return;
    var size = face.r * 2 * scale;
    hit.style.left = originX + face.x * scale - size / 2 + "px";
    hit.style.top = originY + face.y * scale - size / 2 + "px";
    hit.style.width = size + "px";
    hit.style.height = size + "px";
    hit.style.bottom = "auto";
    hit.style.transform = "none";
  });
}

function onMouseMove(event) {
  if (typeof event.clientX !== "number") return;
  if (!els.gate.hidden) return;
  if (state.mode === "idle" || state.mode === "starting" || state.mode === "guide") return;
  updatePointer(event.clientX / innerWidth, event.clientY / innerHeight, true);
}

function onMouseDown(event) {
  if (state.mode === "idle" || state.mode === "starting" || state.mode === "guide") return;
  if (typeof event.clientX === "number") {
    updatePointer(event.clientX / innerWidth, event.clientY / innerHeight, true, true);
  }
  if (hitMail() || (event.target && event.target.closest && event.target.closest("#mailBtn, #mailNote"))) {
    openMessage();
    return;
  }
  if (event.target && event.target.closest && event.target.closest("button, a, input")) return;
  state.pinch = true;
  onPinchStart(event);
}

function onMouseUp() {
  if (!state.pinch) return;
  state.pinch = false;
  onPinchEnd();
}

els.startCam.addEventListener("click", function () {
  beginFromGate(els.startCam, openHandGuide);
});
els.startMouse.addEventListener("click", function () {
  beginFromGate(els.startMouse, startMouse);
});
if (els.handGuideNext) {
  els.handGuideNext.addEventListener("click", function () {
    if (state.guideStep >= 2) {
      hideHandGuide();
      startCamera();
    } else {
      setHandGuideStep(state.guideStep + 1);
    }
  });
}
if (els.handGuideBack) {
  els.handGuideBack.addEventListener("click", function () {
    if (state.guideStep <= 0) returnToGate();
    else setHandGuideStep(state.guideStep - 1);
  });
}
placeCrowdHotspots();
window.addEventListener("resize", function () {
  placeCrowdHotspots();
  if (!els.channelScreen.hidden) resizeViz();
});
window.addEventListener("load", placeCrowdHotspots);
els.arrowLeft.addEventListener("click", function () {
  if (els.channelScreen.hidden) setPage(state.page - 1);
});
els.arrowRight.addEventListener("click", function () {
  if (els.channelScreen.hidden) setPage(state.page + 1);
});
els.closeChannel.addEventListener("click", closeChannel);
if (els.nextChannel) {
  els.nextChannel.addEventListener("click", function () {
    if (!els.nextChannel.disabled) openAdjacentChannel(1);
  });
}
if (els.backChannel) {
  els.backChannel.addEventListener("click", function () {
    if (!els.backChannel.disabled) openAdjacentChannel(-1);
  });
}
els.mailBtn.addEventListener("click", openMessage);
if (els.mailNote) els.mailNote.addEventListener("click", openMessage);
if (els.closeBoard) els.closeBoard.addEventListener("click", closeMessage);
els.wiiBtn.addEventListener("click", returnToGate);

window.addEventListener("mousemove", onMouseMove);
window.addEventListener("mousedown", onMouseDown);
window.addEventListener("mouseup", onMouseUp);
window.addEventListener(
  "touchstart",
  function (event) {
    if (state.mode === "idle") return;
    var t = event.touches[0];
    if (!t) return;
    updatePointer(t.clientX / innerWidth, t.clientY / innerHeight, true);
    onMouseDown({ target: event.target, clientX: t.clientX, clientY: t.clientY });
  },
  { passive: true }
);
window.addEventListener(
  "touchmove",
  function (event) {
    var t = event.touches[0];
    if (!t) return;
    onMouseMove(t);
  },
  { passive: true }
);
window.addEventListener("touchend", onMouseUp);
window.addEventListener("keydown", function (event) {
  if (boardOpen()) {
    if (event.key === "Escape") closeMessage();
    return;
  }
  if (event.key === "ArrowLeft") {
    if (!els.channelScreen.hidden) openAdjacentChannel(-1);
    else setPage(state.page - 1);
  }
  if (event.key === "ArrowRight") {
    if (!els.channelScreen.hidden) openAdjacentChannel(1);
    else setPage(state.page + 1);
  }
  if (event.key === "Escape") closeChannel();
});

buildAtmosphere();
buildWorld();
loadAudioDirectory();
updateClock();
setInterval(updateClock, 1000);
els.arrowLeft.disabled = true;
requestAnimationFrame(tick);
