// ==========================================
// SINTESI AUDIO (Senza file esterni)
// ==========================================
const playBeep = (freq = 440, type = 'sine', duration = 0.08) => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
        osc.stop(ctx.currentTime + duration);
    } catch (e) {}
};

// ==========================================
// PENITENZE DELLA RUOTA DELLA SFORTUNA
// ==========================================
const penalties = [
    { label: "📜 Pergamena", text: "Firma la Pergamena Fisica scrivendo: Nome, Cognome, IG e il tuo Peggior Incubo!" },
    { label: "📸 Selfie", text: "Scattati un selfie divertente insieme a me dal vivo!" },
    { label: "💬 Complimento", text: "Fammi il complimento più assurdo che ti viene in mente nei prossimi 10 secondi!" },
    { label: "😱 Fobia", text: "Rivelami a voce la cosa di cui hai più paura al mondo." },
    { label: "📲 IG Follow", text: "Clicca qui sotto e seguimi subito su Instagram per cancellare il debito!" },
    { label: "👻 Risata", text: "Fai la tua migliore e più diabolica risata da cattivo ad alta voce!" }
];

const colors = ["#ff6600", "#8a2be2", "#ff0055", "#00ffcc", "#9900cc", "#cc3300"];

let currentAngle = 0;
let isSpinning = false;

// ==========================================
// LOGICA RUOTA DELLA SFORTUNA
// ==========================================
function drawWheel() {
    const canvas = document.getElementById('wheel-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const numSlices = penalties.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    const radius = canvas.width / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numSlices; i++) {
        const angle = currentAngle + i * sliceAngle;
        
        ctx.beginPath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, angle, angle + sliceAngle);
        ctx.lineTo(radius, radius);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#08030b";
        ctx.stroke();

        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(angle + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 15px 'Share Tech Mono', monospace";
        ctx.fillText(penalties[i].label, radius - 15, 5);
        ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(radius, radius, 25, 0, 2 * Math.PI);
    ctx.fillStyle = "#08030b";
    ctx.fill();
    ctx.strokeStyle = "#ff0055";
    ctx.lineWidth = 3;
    ctx.stroke();
}

function spinWheel() {
    if (isSpinning) return;
    if (localStorage.getItem('halloween_penalty')) return;

    isSpinning = true;
    document.getElementById('spin-btn').classList.add('hidden');

    const spinAngle = Math.floor(Math.random() * 360) + 1440;
    const duration = 4000;
    const start = performance.now();

    function animate(time) {
        let elapsed = time - start;
        let progress = Math.min(elapsed / duration, 1);
        let easeOut = 1 - Math.pow(1 - progress, 3);
        currentAngle = (easeOut * (spinAngle * Math.PI / 180)) % (2 * Math.PI);
        
        drawWheel();

        if (Math.floor(elapsed / 150) % 2 === 0) {
            playBeep(350, 'triangle', 0.03);
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            determineWinner();
        }
    }

    requestAnimationFrame(animate);
}

function determineWinner() {
    const numSlices = penalties.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    
    let normalizedAngle = (1.5 * Math.PI - currentAngle) % (2 * Math.PI);
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

    const winningIndex = Math.floor(normalizedAngle / sliceAngle);
    const wonPenalty = penalties[winningIndex];

    localStorage.setItem('halloween_choice', 'trick');
    localStorage.setItem('halloween_penalty', wonPenalty.text);

    showPenaltyResult(wonPenalty.text);
    playBeep(523.25, 'sine', 0.3);
}

function showPenaltyResult(text) {
    document.getElementById('penalty-text').innerText = text;
    document.getElementById('penalty-result').classList.remove('hidden');
    document.getElementById('spin-btn').classList.add('hidden');
}

// ==========================================
// GESTIONE SCELTE
// ==========================================
function makeChoice(choice) {
    localStorage.setItem('halloween_choice', choice);
    renderChoice(choice);
}

function renderChoice(choice) {
    document.getElementById('choice-step').classList.remove('active');

    if (choice === 'treat') {
        document.getElementById('treat-step').classList.add('active');
        playBeep(587.33, 'triangle', 0.3);
    } else if (choice === 'trick') {
        document.getElementById('trick-step').classList.add('active');
        drawWheel();

        const savedPenalty = localStorage.getItem('halloween_penalty');
        if (savedPenalty) {
            showPenaltyResult(savedPenalty);
        }
    }
}

// ==========================================
// COMANDO E TAP SEGRETO DI RESET PER I TEST
// ==========================================
function resetTest() {
    localStorage.removeItem('halloween_choice');
    localStorage.removeItem('halloween_penalty');
    location.reload();
}

// 1. Reset da tastiera (Tasto 'R')
window.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        resetTest();
    }
});

// 2. Reset da Touch/Mouse (5 click veloci sul titolo)
let tapCount = 0;
let tapTimer;

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('gothic-title')) {
        tapCount++;
        clearTimeout(tapTimer);

        if (tapCount >= 5) {
            resetTest();
        } else {
            tapTimer = setTimeout(() => {
                tapCount = 0;
            }, 1200);
        }
    }
});

// ==========================================
// INIZIALIZZAZIONE PAGINA
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    const savedChoice = localStorage.getItem('halloween_choice');
    if (savedChoice) {
        renderChoice(savedChoice);
    } else {
        drawWheel();
    }
});