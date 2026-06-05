const player = document.getElementById("player");
const world = document.getElementById("world");
const hpBar = document.getElementById("playerHPBar");

/* =========================
GAME STATE (NEW)
========================= */

let gameOver = false;

/* =========================
RESULT SYSTEM (NEW)
========================= */

function showResult(text) {
    gameOver = true;

    const screen = document.getElementById("resultScreen");
    const resultText = document.getElementById("resultText");

    screen.style.display = "flex";
    resultText.innerText = text;
}

function restartGame() {
    location.reload();
}

/* =========================
PLAYER
========================= */

let x = 100;
let y = 0;
let velocityY = 0;

let cameraX = 0;
let cameraTarget = 0;

let playerHP = 100;

let speed = 0;
let facing = 1;

let combo = 0;
let comboTimer = 0;

/* =========================
ENEMIES
========================= */

const enemies = [];

for (let i = 0; i < 9; i++) {
    enemies.push({
        x: 600 + i * 120,
        dir: 1,
        frame: 0,
        hp: 50,
        dead: false,
        el: null,
        wrapper: null,
        hpBar: null,
        attackCooldown: 0
    });
}

/* =========================
BOSS
========================= */

const boss = {
    x: 1800,
    hp: 300,
    dead: false,
    active: false,
    el: null,
    frame: 0,
    attackCooldown: 0
};

const bossAnimations = {
    boss_idle: "boss_idle.png",
    boss_dead: "boss_dead.png",
    boss_attack: [
        "boss_attack1.png",
        "boss_attack2.png",
        "boss_attack3.png",
        "boss_attack4.png",
        "boss_attack5.png",
        "boss_attack6.png",
        "boss_attack7.png",
        "boss_attack8.png",
        "boss_attack9.png",
        "boss_attack10.png",
        "boss_attack11.png",
        "boss_attack12.png",
        "boss_attack13.png"
    ]
};

const enemySpeed = 0.7;

const enemyWalkFrames = [
    "enemy_walk1.png",
    "enemy_walk2.png",
    "enemy_walk3.png"
];

/* =========================
PHYSICS
========================= */

const GROUND_Y = 70;
const gravity = 0.8;
const jumpPower = -14;
let isJumping = false;

/* =========================
MOVEMENT INPUT
========================= */

let movingLeft = false;
let movingRight = false;

/* =========================
ANIMATION
========================= */

const animations = {
    idle: ["idle.png", "idle1.png"],
    walk: ["walk1.png", "walk2.png", "walk3.png"],
    jump: ["jump.png"],
    punch: ["punch.png", "punch1.png", "punch2.png"]
};

let frameIndex = 0;
let animTimer = null;
let playerState = "idle";

function playAnimation(name) {
    if (playerState === name) return;

    playerState = name;
    frameIndex = 0;

    clearInterval(animTimer);

    animTimer = setInterval(() => {
        const frames = animations[playerState];
        player.src = "sprites/" + frames[frameIndex];
        frameIndex = (frameIndex + 1) % frames.length;
    }, 120);

    if (name === "punch") {
        setTimeout(() => playAnimation("idle"), 300);
    }
}

/* =========================
CONTROLS
========================= */

function startMoveLeft() {
    movingLeft = true;
    facing = -1;
    playAnimation("walk");
}

function startMoveRight() {
    movingRight = true;
    facing = 1;
    playAnimation("walk");
}

function stopMove() {
    movingLeft = false;
    movingRight = false;
    playAnimation("idle");
}

function jump() {
    if (isJumping) return;
    isJumping = true;
    velocityY = jumpPower;
    playAnimation("jump");
}

/* =========================
ATTACK SYSTEM
========================= */

function isHit(enemy) {
    return Math.abs(enemy.x - x) < 90;
}

function punch() {
    playAnimation("punch");

    let hit = false;

    enemies.forEach(e => {
        if (!e.dead && isHit(e)) {
            e.hp -= 10;
            e.x += facing * 40;
            hit = true;

            if (e.hp <= 0) dieEnemy(e);
        }
    });

    if (boss.active && !boss.dead && Math.abs(boss.x - x) < 140) {
        boss.hp -= 10;
        hit = true;

        if (boss.hp <= 0) bossDie();
    }

    if (hit) {
        combo++;
        comboTimer = 60;
        player.style.opacity = 1;
    }
}

/* =========================
ENEMY AI
========================= */

function enemyAttackLogic(e) {
    if (e.dead) return;

    let dist = Math.abs(e.x - x);

    if (dist < 200) {
        e.dir = e.x < x ? 1 : -1;
    } else {
        if (e.x < 300) e.dir = 1;
        if (e.x > 1500) e.dir = -1;
    }

    if (dist < 50 && e.attackCooldown <= 0) {
        playerHP -= 2;
        e.attackCooldown = 50;

        player.style.opacity = 0.5;
        setTimeout(() => player.style.opacity = 1, 80);
    }

    if (e.attackCooldown > 0) e.attackCooldown--;
}

/* =========================
DEATH
========================= */

function dieEnemy(e) {
    e.dead = true;
    e.el.src = "sprites/enemy_dead.png";
    e.hpBar.style.display = "none";
    e.dir = 0;

    checkBossSpawn();
}

function bossDie() {
    boss.dead = true;
    boss.el.src = "sprites/" + bossAnimations.boss_dead;
}

/* =========================
BOSS SPAWN
========================= */

function checkBossSpawn() {
    if (enemies.every(e => e.dead)) {
        boss.active = true;
        boss.x = enemies[enemies.length - 1].x + 300;
    }
}

/* =========================
INIT
========================= */

function initEnemies() {
    enemies.forEach(e => {
        const wrapper = document.createElement("div");
        wrapper.style.position = "absolute";

        const hpBg = document.createElement("div");
        hpBg.style.width = "60px";
        hpBg.style.height = "6px";
        hpBg.style.background = "#555";

        const hpFill = document.createElement("div");
        hpFill.style.width = "100%";
        hpFill.style.height = "100%";
        hpFill.style.background = "white";

        hpBg.appendChild(hpFill);

        const img = document.createElement("img");
        img.src = "sprites/enemy_walk1.png";
        img.style.width = "90px";

        wrapper.appendChild(hpBg);
        wrapper.appendChild(img);

        world.appendChild(wrapper);

        e.el = img;
        e.wrapper = wrapper;
        e.hpBar = hpFill;
    });

    const bossImg = document.createElement("img");
    bossImg.src = "sprites/boss_idle.png";
    bossImg.style.width = "320px";
    bossImg.style.position = "absolute";

    world.appendChild(bossImg);
    boss.el = bossImg;
}

/* =========================
UPDATE ENEMIES
========================= */

function updateEnemies() {
    enemies.forEach(e => {

        if (!e.dead) {
            e.x += e.dir * enemySpeed;

            e.frame++;
            const frame = enemyWalkFrames[e.frame % enemyWalkFrames.length];
            e.el.src = "sprites/" + frame;

            e.el.style.transform = `scaleX(${e.dir})`;
        }

        e.wrapper.style.left = e.x + "px";
        e.wrapper.style.bottom = GROUND_Y + "px";

        e.hpBar.style.width = (Math.max(e.hp, 0) / 50) * 100 + "%";

        enemyAttackLogic(e);
    });

    /* ================= BOSS ================= */

    if (boss.active && !boss.dead) {

        boss.el.style.left = boss.x + "px";
        boss.el.style.bottom = GROUND_Y + "px";

        boss.frame++;

        let dist = Math.abs(boss.x - x);

        if (dist < 200) {
            const frame = bossAnimations.boss_attack[boss.frame % bossAnimations.boss_attack.length];
            boss.el.src = "sprites/" + frame;

            if (boss.attackCooldown <= 0) {
                playerHP -= 3;
                boss.attackCooldown = 40;
            }
        } else {
            boss.el.src = "sprites/boss_idle.png";
        }

        if (boss.attackCooldown > 0) boss.attackCooldown--;

        boss.el.style.transform = boss.x < x ? "scaleX(1)" : "scaleX(-1)";
    }

    hpBar.style.width = playerHP + "%";

    if (comboTimer > 0) comboTimer--;
    else combo = 0;

    /* ================= DEFEAT ================= */
    if (playerHP <= 0 && !gameOver) {
        showResult("DEFEAT");
    }

    /* ================= VICTORY ================= */
    if (boss.dead && !gameOver) {
        showResult("VICTORY");
    }
}

/* =========================
GAME LOOP
========================= */

function update() {

    if (gameOver) return;

    if (movingLeft) speed = -4;
    else if (movingRight) speed = 4;
    else speed *= 0.8;

    x += speed;

    velocityY += gravity;
    y += velocityY;

    if (y >= 0) {
        y = 0;
        velocityY = 0;
        isJumping = false;
    }

    player.style.left = x + "px";
    player.style.bottom = (GROUND_Y - y) + "px";

    player.style.transform = `scaleX(${facing})`;

    cameraTarget = x - 200;
    cameraX += (cameraTarget - cameraX) * 0.1;

    world.style.transform = `translateX(${-cameraX}px)`;

    updateEnemies();

    requestAnimationFrame(update);
}

initEnemies();
update();