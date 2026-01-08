const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const scoreDisp = document.getElementById("scoreDisp");
const lifeDisp = document.getElementById("lifeDisp");
const speedSelect = document.getElementById("speedSelect");

let score = 0;
let lives = 10;
let gameActive = false;
let player = { x: 180, y: 450, w: 40, h: 30 };
let lasers = [];
let enemies = [];
let keys = {};

// Handle Inputs
window.addEventListener("keydown", e => keys[e.code] = true);
window.addEventListener("keyup", e => keys[e.code] = false);

function spawnEnemy() {
    const multiplier = parseInt(speedSelect.value);
    enemies.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        w: 30,
        h: 30,
        speed: (Math.random() * 2 + 1) * multiplier
    });
}

function start() {
    score = 0;
    lives = 10;
    enemies = [];
    lasers = [];
    gameActive = true;
    updateUI();
    gameLoop();
}

function updateUI() {
    scoreDisp.innerText = score;
    lifeDisp.innerText = lives;
}

function gameLoop() {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move Player
    if (keys["ArrowLeft"] && player.x > 0) player.x -= 5;
    if (keys["ArrowRight"] && player.x < canvas.width - player.w) player.x += 5;
    
    // Shoot Laser
    if (keys["Space"]) {
        if (lasers.length === 0 || lasers[lasers.length - 1].y < player.y - 20) {
            lasers.push({ x: player.x + player.w / 2 - 2, y: player.y, w: 4, h: 10 });
        }
    }

    // Draw Player
    ctx.fillStyle = "#00d2ff";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // Laser Logic
    ctx.fillStyle = "#fff";
    lasers.forEach((l, i) => {
        l.y -= 7;
        ctx.fillRect(l.x, l.y, l.w, l.h);
        if (l.y < 0) lasers.splice(i, 1);
    });

    // Enemy Logic
    if (Math.random() < 0.03) spawnEnemy();
    enemies.forEach((en, i) => {
        en.y += en.speed;
        ctx.fillStyle = "#ff4757";
        ctx.beginPath();
        ctx.arc(en.x + 15, en.y + 15, 15, 0, Math.PI * 2);
        ctx.fill();

        // Collision: Enemy vs Laser
        lasers.forEach((l, li) => {
            if (l.x < en.x + en.w && l.x + l.w > en.x && l.y < en.y + en.h && l.y + l.h > en.y) {
                enemies.splice(i, 1);
                lasers.splice(li, 1);
                score += 10;
                updateUI();
            }
        });

        // Collision: Enemy vs Player
        if (player.x < en.x + en.w && player.x + player.w > en.x && player.y < en.y + en.h && player.y + player.h > en.y) {
            enemies.splice(i, 1);
            lives--;
            updateUI();
            if (lives <= 0) {
                gameActive = false;
                alert("Mission Failed! Final Score: " + score);
            }
        }

        if (en.y > canvas.height) enemies.splice(i, 1);
    });

    requestAnimationFrame(gameLoop);
}

startBtn.addEventListener("click", start);