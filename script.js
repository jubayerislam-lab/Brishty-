/**
 * ==============================================================
 * ROMANTIC BIRTHDAY WISH SCRIPT
 * For User's "Bow" / "Pakhi"
 * Includes:
 * 1. Password Protection (13/5/2012)
 * 2. Floating 3D Heart with Burst Effect
 * 3. Enchanted Blooming Flower Plant Canvas Animation
 * 4. Romantic Synthesizer Music (Web Audio API) + Audio Track
 * 5. AI Sweet Girl Voice (SpeechSynthesis) with Live Highlight
 * 6. Ambient Falling Petals, Twinkling Stars & Fireflies
 * ==============================================================
 */

function playUnlockChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime + idx * 0.12;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    });
  } catch(e) {}
}

// Global State
const state = {
  unlocked: false,
  heartClicked: false,
  musicPlaying: false,
  voiceEnabled: true,
  currentSpeakingIndex: -1,
  audioCtx: null,
  synthTimer: null,
  flowerProgress: 0,
  flowerGrown: false
};

// Target password normalization helper
function isPasswordCorrect(input) {
  if (!input) return false;
  // Clean input: remove spaces and normalize delimiters
  const clean = input.trim().replace(/\s+/g, '').replace(/[-.]/g, '/');
  
  // Accept: 13/5/2012, 13/05/2012, 13/5/12
  const validVariants = ['13/5/2012', '13/05/2012', '13/5/12', '13/05/12'];
  return validVariants.includes(clean);
}

// ==============================================================
// 1. PASSWORD UNLOCK LOGIC
// ==============================================================
function verifyPassword() {
  const inputEl = document.getElementById('passwordInput');
  const errorEl = document.getElementById('errorMessage');
  const lockCard = document.querySelector('.lock-card');
  const lockIcon = document.getElementById('lockIcon');
  const userVal = inputEl.value;

  if (isPasswordCorrect(userVal)) {
    // Correct Password!
    playUnlockChime();
    errorEl.style.color = '#00ff88';
    errorEl.textContent = 'পাসওয়ার্ড মিলে গেছে সোনা! স্বাগতম... 💖';
    lockIcon.classList.remove('fa-lock');
    lockIcon.classList.add('fa-lock-open');
    lockCard.style.boxShadow = '0 0 50px rgba(0, 255, 136, 0.8)';

    // Transition to Screen 2 (Heart Screen) after short celebration
    setTimeout(() => {
      document.getElementById('lockScreen').classList.remove('active');
      const heartScreen = document.getElementById('heartScreen');
      heartScreen.classList.add('active');
      state.unlocked = true;
      triggerHeartShower(15);
    }, 1000);

  } else {
    // Incorrect Password
    lockCard.classList.remove('shake');
    void lockCard.offsetWidth; // Force CSS reflow
    lockCard.classList.add('shake');
    
    errorEl.style.color = '#ff6b8b';
    errorEl.textContent = 'উফ ভুল পাসওয়ার্ড সোনা! 🥺 একটু মনে করে দেখো... (13/5/2012)';
    inputEl.value = '';
    inputEl.focus();
  }
}

function clearInput() {
  const input = document.getElementById('passwordInput');
  input.value = '';
  input.focus();
}

// ==============================================================
// 2. FLOATING HEART CLICK & SCREEN 3 REVEAL
// ==============================================================
document.addEventListener('DOMContentLoaded', () => {
  initAmbientBackground();

  const mainHeartBtn = document.getElementById('mainHeartBtn');
  if (mainHeartBtn) {
    mainHeartBtn.addEventListener('click', (e) => {
      if (state.heartClicked) return;
      state.heartClicked = true;

      // Heart burst explosion effect
      const rect = mainHeartBtn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      createHeartBurst(centerX, centerY, 45);

      // Transition to Wish Screen
      setTimeout(() => {
        document.getElementById('heartScreen').classList.remove('active');
        const wishScreen = document.getElementById('wishScreen');
        wishScreen.classList.add('active');

        // Start Romantic Music
        startRomanticMusic();

        // Start Flower Plant Canvas Animation
        initBloomingFlower();

        // Animate Letter Lines & Start AI Voice Narration
        revealLetterAndNarrate();
      }, 700);
    });
  }

  // Setup Button Handlers
  setupControls();
});

// ==============================================================
// 3. ROMANTIC MUSIC ENGINE (Web Audio API Synthesizer + Fallback)
// ==============================================================
// A dreamy, romantic music box / piano chord progression that NEVER fails offline!
function startRomanticMusic() {
  state.musicPlaying = true;
  updateMusicUI(true);

  // Attempt to play external audio element if available
  const audioTrack = document.getElementById('bgMusicTrack');
  if (audioTrack) {
    audioTrack.volume = 0.45;
    audioTrack.play().catch(() => {
      // If network audio blocked or failed, Web Audio API synthesizer handles it seamlessly!
      initWebAudioSynthesizer();
    });
  } else {
    initWebAudioSynthesizer();
  }
}

function toggleMusic() {
  const audioTrack = document.getElementById('bgMusicTrack');
  if (state.musicPlaying) {
    state.musicPlaying = false;
    updateMusicUI(false);
    if (audioTrack) audioTrack.pause();
    if (state.synthTimer) {
      clearInterval(state.synthTimer);
      state.synthTimer = null;
    }
  } else {
    state.musicPlaying = true;
    updateMusicUI(true);
    if (audioTrack) {
      audioTrack.play().catch(() => initWebAudioSynthesizer());
    } else {
      initWebAudioSynthesizer();
    }
  }
}

function updateMusicUI(isPlaying) {
  const musicIcon = document.getElementById('musicIcon');
  if (musicIcon) {
    if (isPlaying) {
      musicIcon.className = 'fa-solid fa-music';
      musicIcon.style.color = '#ff2e75';
    } else {
      musicIcon.className = 'fa-solid fa-volume-xmark';
      musicIcon.style.color = '#fff';
    }
  }
}

function initWebAudioSynthesizer() {
  if (state.synthTimer) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!state.audioCtx) {
      state.audioCtx = new AudioContext();
    }
    if (state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }

    // Romantic chord notes (frequencies in Hz: Canon in C / Romantic Ballad)
    // C, G, Am, Em, F, C, F, G
    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C
      [196.00, 246.94, 293.66, 392.00], // G
      [220.00, 261.63, 329.63, 440.00], // Am
      [164.81, 196.00, 246.94, 329.63], // Em
      [174.61, 220.00, 261.63, 349.23], // F
      [261.63, 329.63, 392.00, 523.25], // C
      [174.61, 220.00, 261.63, 349.23], // F
      [196.00, 246.94, 293.66, 392.00]  // G
    ];

    let chordIdx = 0;
    let noteIdx = 0;

    const playBellTone = (freq, duration = 1.2) => {
      if (!state.musicPlaying || !state.audioCtx) return;
      const now = state.audioCtx.currentTime;
      const osc = state.audioCtx.createOscillator();
      const gain = state.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(state.audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    };

    state.synthTimer = setInterval(() => {
      if (!state.musicPlaying) return;
      const currentChord = chords[chordIdx];
      const freq = currentChord[noteIdx];
      playBellTone(freq, 1.4);

      noteIdx++;
      if (noteIdx >= currentChord.length) {
        noteIdx = 0;
        chordIdx = (chordIdx + 1) % chords.length;
      }
    }, 420);

  } catch (err) {
    console.log('WebAudio initialization notice:', err);
  }
}

// ==============================================================
// 4. AI SWEET GIRL VOICE (Text-to-Speech)
// ==============================================================
// Speech sentences with dual language support (Bengali script for Bengali voice, Romanized for English voice)
const wishSentences = [
  {
    selector: '.letter-header',
    enText: "Happy Birthday My Bow! I am gonna wish you!",
    bnText: "হ্যাপি বার্থডে মাই বউ! আই অ্যাম গনা উইশ ইউ!"
  },
  {
    selector: '.line-1',
    enText: "You are so beautiful...",
    bnText: "ইউ আর সো বিউটিফুল!"
  },
  {
    selector: '.line-2',
    enText: "Banan bhul pari na, hihi!",
    bnText: "বানান ভুল পারি না, হিহি!"
  },
  {
    selector: '.line-3',
    enText: "I love you so so so so much!",
    bnText: "আই লাভ ইউ সো সো সো সো মাচ!"
  },
  {
    selector: '.line-4',
    enText: "Ami jani na tumi amay bhalobasho ki na, but ami tumay all time, all second, all hour, I love you very much!",
    bnText: "আমি জানি না তুমি আমায় ভালোবাসো কি না, কিন্তু আমি তোমায় অলটাইম, অল সেকেন্ড, অল আওয়ার অনেক অনেক ভালোবাসি!"
  },
  {
    selector: '.line-5',
    enText: "Ajkei tumar birthday, but amar kache taka nai. Somossa jomiye tumar jonno kichu na kichu gift korbo, InshaAllah!",
    bnText: "আজকেই তোমার বার্থডে, কিন্তু আমার কাছে টাকা নাই। সমস্যা নাই জমিয়ে তোমার জন্য কিছু না কিছু গিফট করবো ইনশাআল্লাহ!"
  },
  {
    selector: '.line-6',
    enText: "Tumar jonno ekta sundor shari, jama ar churi dibo. Tumi amar bow, tumar amar shob, I love you pakhi!",
    bnText: "তোমার জন্য একটা সুন্দর শাড়ি, জামা আর চুড়ি দেবো। তুমি আমার বউ, তোমার আমার সব, আই লাভ ইউ পাখি!"
  },
  {
    selector: '.line-7',
    enText: "All time! Forever and ever. Happy birthday my love!",
    bnText: "অল টাইম! অনেক অনেক ভালোবাসি পাখি! শুভ জন্মদিন!"
  }
];

let speechVoices = [];

function loadVoices() {
  if ('speechSynthesis' in window) {
    speechVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      speechVoices = window.speechSynthesis.getVoices();
    };
  }
}
loadVoices();

// Find the best sweet female voice available on the system / browser
function getBestFemaleVoice() {
  if (!speechVoices || speechVoices.length === 0) {
    speechVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  }
  
  // 1. Try to find a Bengali voice first if available
  const bnVoice = speechVoices.find(v => (v.lang && v.lang.toLowerCase().includes('bn')) || v.name.toLowerCase().includes('bangla') || v.name.toLowerCase().includes('bengali'));
  if (bnVoice) return { voice: bnVoice, isBn: true };

  // 2. High quality sweet female English voices
  const preferred = [
    'Google UK English Female',
    'Google US English',
    'Microsoft Zira',
    'Microsoft Jenny',
    'Microsoft Aria',
    'Samantha',
    'Victoria',
    'Karen',
    'Natasha',
    'Heera'
  ];

  for (const name of preferred) {
    const v = speechVoices.find(voice => voice.name.includes(name));
    if (v) return { voice: v, isBn: false };
  }

  // 3. Any voice marked female
  const anyFemale = speechVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('girl'));
  if (anyFemale) return { voice: anyFemale, isBn: false };

  // 4. Default fallback
  return { voice: speechVoices[0] || null, isBn: false };
}

let isSpeaking = false;
let currentUtterance = null;

function speakSentenceList(index = 0) {
  if (!state.voiceEnabled) return;
  if (!('speechSynthesis' in window)) return;
  if (index >= wishSentences.length) {
    // Finished reading
    setSpeakingUI(false, "শোনা শেষ হয়েছে ❤️");
    document.querySelectorAll('.wish-line, .letter-header').forEach(el => el.classList.remove('active-speaking'));
    return;
  }

  const currentItem = wishSentences[index];
  const voiceInfo = getBestFemaleVoice();
  const textToSpeak = (voiceInfo && voiceInfo.isBn) ? currentItem.bnText : currentItem.enText;

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  currentUtterance = utterance;

  if (voiceInfo && voiceInfo.voice) {
    utterance.voice = voiceInfo.voice;
  }

  // Sweet feminine parameters
  utterance.pitch = 1.28;  // Cute higher tone
  utterance.rate = 0.86;   // Romantic, gentle, slow pace
  utterance.volume = 1.0;

  utterance.onstart = () => {
    isSpeaking = true;
    setSpeakingUI(true, "মিষ্টি AI কণ্ঠে পড়ছে...");
    highlightWishLine(currentItem.selector);
  };

  utterance.onend = () => {
    setTimeout(() => {
      speakSentenceList(index + 1);
    }, 450);
  };

  utterance.onerror = (e) => {
    console.log('Voice notice:', e);
    setTimeout(() => {
      speakSentenceList(index + 1);
    }, 500);
  };

  window.speechSynthesis.speak(utterance);
}

function highlightWishLine(selector) {
  document.querySelectorAll('.wish-line, .letter-header').forEach(el => el.classList.remove('active-speaking'));
  const target = document.querySelector(selector);
  if (target) {
    target.classList.add('active-speaking');
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function setSpeakingUI(active, text) {
  const eq = document.getElementById('equalizer');
  const status = document.getElementById('voiceStatusText');
  if (eq) {
    if (active) eq.classList.add('active');
    else eq.classList.remove('active');
  }
  if (status && text) {
    status.textContent = text;
  }
}

function stopVoice() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  isSpeaking = false;
  setSpeakingUI(false, "ভয়েস বন্ধ আছে");
}

function toggleVoice() {
  const voiceIcon = document.getElementById('voiceIcon');
  if (state.voiceEnabled) {
    state.voiceEnabled = false;
    stopVoice();
    if (voiceIcon) voiceIcon.className = 'fa-solid fa-volume-xmark';
  } else {
    state.voiceEnabled = true;
    if (voiceIcon) voiceIcon.className = 'fa-solid fa-volume-high';
    speakSentenceList(0);
  }
}

// Reveal lines with smooth stagger and trigger voice
function revealLetterAndNarrate() {
  const lines = document.querySelectorAll('.wish-line');
  lines.forEach((line, idx) => {
    setTimeout(() => {
      line.classList.add('revealed');
    }, 300 + idx * 400);
  });

  // Start voice narration after brief delay
  setTimeout(() => {
    speakSentenceList(0);
  }, 1200);
}

// ==============================================================
// 5. ENCHANTED BLOOMING FLOWER PLANT (Canvas Animation)
// ==============================================================
function initBloomingFlower() {
  const canvas = document.getElementById('flowerCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let progress = 0; // 0 to 1 growth
  let flowers = [];
  let sparkles = [];

  // Generate flower positions along the plant stems
  function setupPlantNodes(w, h) {
    const baseX = w * 0.5;
    const baseY = h * 0.94;

    flowers = [
      // Main Center Crown Rose
      { x: baseX, y: h * 0.26, size: 48, bloomAt: 0.65, color: '#ff0f50', glow: '#ff6699' },
      // Left Branch Rose
      { x: baseX - w * 0.22, y: h * 0.45, size: 38, bloomAt: 0.50, color: '#e6004c', glow: '#ff7096' },
      // Right Branch Rose
      { x: baseX + w * 0.23, y: h * 0.42, size: 40, bloomAt: 0.55, color: '#ff2e75', glow: '#ffa3be' },
      // Lower Left Rosebud
      { x: baseX - w * 0.16, y: h * 0.62, size: 30, bloomAt: 0.40, color: '#d90448', glow: '#ff5c8a' },
      // Lower Right Rosebud
      { x: baseX + w * 0.18, y: h * 0.66, size: 28, bloomAt: 0.42, color: '#ff1464', glow: '#ff759c' }
    ];
  }
  setupPlantNodes(canvas.width, canvas.height);

  // Draw organic green curved stem
  function drawStem(p, w, h) {
    const startX = w * 0.5;
    const startY = h * 0.94;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Main Stem
    ctx.beginPath();
    ctx.strokeStyle = '#2b7a3e';
    ctx.lineWidth = 9 * (1 - p * 0.25);
    ctx.moveTo(startX, startY);

    const cp1x = startX - 25 * Math.sin(p * Math.PI);
    const cp1y = startY - (startY - h * 0.26) * 0.5 * p;
    const targetY = startY - (startY - h * 0.26) * p;
    ctx.quadraticCurveTo(cp1x, cp1y, startX, targetY);
    ctx.stroke();

    // Stem inner soft highlight
    ctx.beginPath();
    ctx.strokeStyle = '#48b864';
    ctx.lineWidth = 4 * (1 - p * 0.25);
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cp1x, cp1y, startX, targetY);
    ctx.stroke();

    // Left Branch (Sprouts at p > 0.3)
    if (p > 0.3) {
      const branchP = Math.min(1, (p - 0.3) / 0.3);
      const bStartY = startY - (startY - h * 0.26) * 0.45;
      const bStartX = startX - 5;
      const targetBX = bStartX - (w * 0.22) * branchP;
      const targetBY = bStartY - (h * 0.12) * branchP;

      ctx.beginPath();
      ctx.strokeStyle = '#256d36';
      ctx.lineWidth = 6;
      ctx.moveTo(bStartX, bStartY);
      ctx.quadraticCurveTo(bStartX - 20, bStartY, targetBX, targetBY);
      ctx.stroke();

      // Leaves on Left Branch
      drawLeaf(bStartX - 35 * branchP, bStartY - 10 * branchP, -0.6, branchP);
    }

    // Right Branch (Sprouts at p > 0.35)
    if (p > 0.35) {
      const branchP = Math.min(1, (p - 0.35) / 0.3);
      const bStartY = startY - (startY - h * 0.26) * 0.48;
      const bStartX = startX + 5;
      const targetBX = bStartX + (w * 0.23) * branchP;
      const targetBY = bStartY - (h * 0.15) * branchP;

      ctx.beginPath();
      ctx.strokeStyle = '#256d36';
      ctx.lineWidth = 6;
      ctx.moveTo(bStartX, bStartY);
      ctx.quadraticCurveTo(bStartX + 20, bStartY, targetBX, targetBY);
      ctx.stroke();

      // Leaves on Right Branch
      drawLeaf(bStartX + 40 * branchP, bStartY - 12 * branchP, 0.6, branchP);
    }

    // Lower leaves on main stem
    if (p > 0.2) {
      const lP = Math.min(1, (p - 0.2) / 0.2);
      drawLeaf(startX - 20, startY - 70, -0.8, lP);
      drawLeaf(startX + 22, startY - 95, 0.8, lP);
    }

    // Glowing soil mound at base
    const grad = ctx.createRadialGradient(startX, startY + 10, 5, startX, startY + 10, 80);
    grad.addColorStop(0, '#381647');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(startX, startY + 8, 90, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw organic green leaf
  function drawLeaf(x, y, angle, scale) {
    if (scale <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#2f9e44';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-18, -12, -28, -32);
    ctx.quadraticCurveTo(-5, -24, 0, -42);
    ctx.quadraticCurveTo(5, -24, 28, -32);
    ctx.quadraticCurveTo(18, -12, 0, 0);
    ctx.fill();

    // Leaf vein
    ctx.strokeStyle = '#51cf66';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -36);
    ctx.stroke();

    ctx.restore();
  }

  // Draw a blooming multi-layered Rose
  function drawBloomingRose(flower, globalProgress, time) {
    if (globalProgress < flower.bloomAt) return;
    const bloom = Math.min(1, (globalProgress - flower.bloomAt) / 0.3);
    const size = flower.size * bloom;
    if (size <= 1) return;

    ctx.save();
    ctx.translate(flower.x, flower.y);

    // Glowing radial aura around rose
    const aura = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size * 1.6);
    aura.addColorStop(0, flower.glow + '99');
    aura.addColorStop(0.6, flower.color + '44');
    aura.addColorStop(1, 'transparent');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Draw Rose Petals Layer by Layer
    const layers = [
      { count: 7, radius: size * 0.9, petalW: size * 0.55, petalH: size * 0.65, col: flower.color },
      { count: 6, radius: size * 0.65, petalW: size * 0.45, petalH: size * 0.55, col: '#ff2366' },
      { count: 5, radius: size * 0.42, petalW: size * 0.35, petalH: size * 0.45, col: '#ff4d80' },
      { count: 4, radius: size * 0.22, petalW: size * 0.25, petalH: size * 0.32, col: '#ff759c' }
    ];

    layers.forEach((layer, lIdx) => {
      const step = (Math.PI * 2) / layer.count;
      const angleOffset = (lIdx * 0.4) + Math.sin(time * 0.002 + lIdx) * 0.05;

      for (let i = 0; i < layer.count; i++) {
        const ang = i * step + angleOffset;
        const px = Math.cos(ang) * layer.radius * bloom;
        const py = Math.sin(ang) * layer.radius * bloom;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(ang + Math.PI / 2);

        // Petal shape
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, layer.petalH);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, layer.col);
        grad.addColorStop(1, '#9e0030');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.ellipse(0, 0, layer.petalW, layer.petalH, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    });

    // Golden center pistil/stamen
    const centerGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, size * 0.2);
    centerGlow.addColorStop(0, '#fff4cc');
    centerGlow.addColorStop(0.5, '#ffd166');
    centerGlow.addColorStop(1, '#ff9e00');
    ctx.fillStyle = centerGlow;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.22 * bloom, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Animation Loop for Plant
  let animTime = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (progress < 1) {
      progress += 0.007; // Growing pace
      if (progress >= 1) {
        progress = 1;
        state.flowerGrown = true;
        triggerHeartShower(25);
      }
    }

    animTime += 16;
    drawStem(progress, canvas.width, canvas.height);

    flowers.forEach(f => {
      drawBloomingRose(f, progress, animTime);
    });

    requestAnimationFrame(animate);
  }
  animate();
}

// ==============================================================
// 6. AMBIENT BACKGROUND (Stars, Fireflies & Falling Petals)
// ==============================================================
function initAmbientBackground() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Star field
  const stars = [];
  const starCount = Math.min(100, Math.floor((window.innerWidth * window.innerHeight) / 9000));
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005
    });
  }

  // Falling Petals
  const petals = [];
  const petalCount = 28;
  for (let i = 0; i < petalCount; i++) {
    petals.push(createRandomPetal(canvas.width, canvas.height, true));
  }

  function createRandomPetal(w, h, randomY = false) {
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -20,
      size: Math.random() * 9 + 8,
      speedY: Math.random() * 1.2 + 0.8,
      speedX: Math.sin(Math.random() * Math.PI) * 0.8 - 0.4,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2,
      color: ['#ff2e75', '#ff7597', '#ffb3c6', '#d61c56'][Math.floor(Math.random() * 4)],
      swing: Math.random() * 2,
      swingSpeed: Math.random() * 0.03 + 0.01
    };
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render Stars
    stars.forEach(star => {
      star.alpha += star.speed;
      if (star.alpha > 1 || star.alpha < 0.2) star.speed = -star.speed;
      ctx.fillStyle = `rgba(255, 235, 245, ${Math.max(0, Math.min(1, star.alpha))})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Render Falling Rose Petals
    petals.forEach(p => {
      p.y += p.speedY;
      p.x += Math.sin(p.swing) * 1.2 + p.speedX;
      p.swing += p.swingSpeed;
      p.rotation += p.rotSpeed;

      if (p.y > canvas.height + 20) {
        Object.assign(p, createRandomPetal(canvas.width, canvas.height, false));
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.75;

      // Draw graceful petal shape
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.6, p.size, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(loop);
  }
  loop();
}

// ==============================================================
// 7. HEART BURST & SHOWER ANIMATIONS
// ==============================================================
function createHeartBurst(originX, originY, count = 35) {
  const container = document.getElementById('heartBurstContainer');
  if (!container) return;

  const emojis = ['💖', '❤️', '🌹', '✨', '🌸', '🕊️', '💍'];

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'burst-heart';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const distance = Math.random() * 180 + 100;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    const scale = Math.random() * 1.3 + 0.8;
    const rot = (Math.random() - 0.5) * 120;

    el.style.left = `${originX}px`;
    el.style.top = `${originY}px`;
    el.style.fontSize = `${Math.random() * 20 + 20}px`;
    el.style.setProperty('--tx', `${tx}px`);
    el.style.setProperty('--ty', `${ty}px`);
    el.style.setProperty('--s', `${scale}`);
    el.style.setProperty('--rot', `${rot}deg`);

    container.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 2600);
  }
}

function triggerHeartShower(count = 20) {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight * 0.4;
  createHeartBurst(centerX, centerY, count);
}

// ==============================================================
// 8. BUTTON CONTROLS & INTERACTIVE EVENTS
// ==============================================================
function setupControls() {
  // Voice Toggle Button
  const toggleVoiceBtn = document.getElementById('toggleVoiceBtn');
  if (toggleVoiceBtn) {
    toggleVoiceBtn.addEventListener('click', toggleVoice);
  }

  // Music Toggle Button
  const toggleMusicBtn = document.getElementById('toggleMusicBtn');
  if (toggleMusicBtn) {
    toggleMusicBtn.addEventListener('click', toggleMusic);
  }

  // Send Love / Heart Burst Button
  const sendLoveBtn = document.getElementById('sendLoveBtn');
  if (sendLoveBtn) {
    sendLoveBtn.addEventListener('click', () => {
      triggerHeartShower(30);
    });
  }

  // Read Again Voice Button
  const readAgainBtn = document.getElementById('readAgainBtn');
  if (readAgainBtn) {
    readAgainBtn.addEventListener('click', () => {
      stopVoice();
      state.voiceEnabled = true;
      const voiceIcon = document.getElementById('voiceIcon');
      if (voiceIcon) voiceIcon.className = 'fa-solid fa-volume-high';
      speakSentenceList(0);
    });
  }

  // Special Kiss Button
  const specialKissBtn = document.getElementById('specialKissBtn');
  if (specialKissBtn) {
    specialKissBtn.addEventListener('click', () => {
      triggerHeartShower(40);
      if (state.voiceEnabled && 'speechSynthesis' in window) {
        const kissUtterance = new SpeechSynthesisUtterance("Ummah! I love you so much pakhi, happy birthday!");
        const v = getBestFemaleVoice();
        if (v) kissUtterance.voice = v;
        kissUtterance.pitch = 1.35;
        window.speechSynthesis.speak(kissUtterance);
      }
    });
  }
}
