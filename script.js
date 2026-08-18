/*=========================================
        NEON RIFT ENGINE
=========================================*/

"use strict";

/*=========================
        CANVAS
=========================*/

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


/*=========================
      GAME VARIABLES
=========================*/

const Game = {
  width: window.innerWidth,
  height: window.innerHeight,

  running: false,
  paused: false,

  time: 0,
  delta: 0,
  lastTime: 0,

  fps: 60,
  frame: 0,

  score: 0,
  combo: 1,
  wave: 1,

  level: 1,
  xp: 0,
  xpNeeded: 100,

  fireRateMultiplier: 1,
  bulletDamage: 1,
  bulletSpeedMultiplier: 1,
  extraBullets: 0
};


/*=========================
        RESIZE
=========================*/

function resizeGame() {
  Game.width = window.innerWidth;
  Game.height = window.innerHeight;

  canvas.width = Game.width;
  canvas.height = Game.height;
}

resizeGame();

window.addEventListener(
  "resize",
  resizeGame
);


/*=========================
      INPUT SYSTEM
=========================*/

const Keys = {};

window.addEventListener(
  "keydown",
  (e) => {

    const key =
      e.key.toLowerCase();

    Keys[key] = true;

    /* OVERDRIVE */

    if (
      key === "q" &&
      typeof activateOverdrive ===
        "function"
    ) {
      activateOverdrive();
    }

    /* DASH */

    if (e.code === "Space") {
      e.preventDefault();

      if (
        typeof player !==
          "undefined" &&
        Game.running &&
        !Game.paused
      ) {
        player.dash();
      }
    }
  }
);


window.addEventListener(
  "keyup",
  (e) => {

    Keys[
      e.key.toLowerCase()
    ] = false;

  }
);


/*=========================
          MOUSE
=========================*/

const Mouse = {
  x: 0,
  y: 0,
  down: false
};


window.addEventListener(
  "mousemove",
  (e) => {

    Mouse.x = e.clientX;
    Mouse.y = e.clientY;

  }
);


window.addEventListener(
  "mousedown",
  () => {

    Mouse.down = true;

  }
);


window.addEventListener(
  "mouseup",
  () => {

    Mouse.down = false;

  }
);


/* Prevent shooting from staying active
   when cursor leaves window */

window.addEventListener(
  "blur",
  () => {

    Mouse.down = false;

    for (const key in Keys) {
      Keys[key] = false;
    }

  }
);


/*=========================
        CAMERA
=========================*/

const Camera = {
  x: 0,
  y: 0,
  shake: 0
};


/*=========================
       STARFIELD
=========================*/

const Stars = [];


function createStars() {

  Stars.length = 0;

  const amount =
    Math.min(
      250,
      Math.floor(
        Game.width *
        Game.height /
        5000
      )
    );

  for (
    let i = 0;
    i < amount;
    i++
  ) {

    Stars.push({
      x:
        Math.random() *
        Game.width,

      y:
        Math.random() *
        Game.height,

      size:
        Math.random() *
        2 +
        0.5,

      speed:
        Math.random() *
        2 +
        0.3,

      alpha:
        Math.random()
    });

  }
}



/*=========================
      DRAW BACKGROUND
=========================*/

function drawBackground() {

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      Game.height
    );

  gradient.addColorStop(
    0,
    "#02030b"
  );

  gradient.addColorStop(
    0.5,
    "#08071a"
  );

  gradient.addColorStop(
    1,
    "#020205"
  );

  ctx.fillStyle = gradient;

  ctx.fillRect(
    0,
    0,
    Game.width,
    Game.height
  );


  for (const star of Stars) {

    /*
      Stars keep moving even while menu
      is open, giving the background life.
    */

    star.y += star.speed;

    if (
      star.y >
      Game.height + 5
    ) {

      star.y = -5;

      star.x =
        Math.random() *
        Game.width;

    }


    ctx.globalAlpha =
      0.2 +
      star.alpha *
      0.8;

    ctx.fillStyle =
      "#ffffff";

    ctx.beginPath();

    ctx.arc(
      star.x,
      star.y,
      star.size,
      0,
      Math.PI * 2
    );

    ctx.fill();

  }


  ctx.globalAlpha = 1;

  /*=========================
      BOSS WARNING SKY
=========================*/

if (
  typeof BossSystemV2 !== "undefined" &&
  BossSystemV2.cinematic
) {

  const flash =
    Math.sin(Game.time * 18) * 0.5 + 0.5;

  ctx.fillStyle =
    `rgba(
      120,
      0,
      180,
      ${0.08 + flash * 0.08}
    )`;

  ctx.fillRect(
    0,
    0,
    Game.width,
    Game.height
  );
}

}


/*=========================
          UPDATE
=========================*/

function update() {

  if (
    !Game.running ||
    Game.paused
  ) {
    return;
  }


  player.update(
    Game.delta
  );


  updateParticles(
    Game.delta
  );

  updateAfterImages(
    Game.delta
  );

  updateOverdriveArcs(
    Game.delta
  );

  updateImpactFX(
    Game.delta
  );

  updateOverdriveActivationFX(
    Game.delta
  );

  updateEnemies(
    Game.delta
  );


  updatePlayerBullets(
    Game.delta
  );


  updateBossV2(
  Game.delta
  ); 

  updateBoss2(
  Game.delta
  );

  updateWorld(
    Game.delta
  );

  if (
  typeof BossSystemV2 !== "undefined" &&
  BossSystemV2.cinematic
) {

  Camera.shake =
    Math.max(
      Camera.shake,
      4
    );

}

  updateBossRageFX(
    Game.delta
  );

  Camera.shake *=
    Math.pow(
      0.001,
      Game.delta
    );


  updateHUD();

}


/*=========================
           DRAW
=========================*/

function draw() {

  ctx.save();


  /* CAMERA SHAKE */

  const shakeX =
    (
      Math.random() -
      0.5
    ) *
    Camera.shake;

  const shakeY =
    (
      Math.random() -
      0.5
    ) *
    Camera.shake;


  ctx.translate(
    shakeX,
    shakeY
  );


  /* BACKGROUND */

  drawBackground();

  drawNebula();
  drawFog();

  drawGrid();
  drawRift();
  drawRiftPulses();


  /* GAME OBJECTS */

  if (Game.running) {

    drawTrails();

    drawAfterImages();

    drawOverdriveArcs();

    drawOverdriveActivationFX();

    drawMeteors();

    drawEnemies();

    drawPlayerBullets();

    drawBossV2();

    drawBoss2();

    player.draw();

    drawParticles();

    drawImpactFX();

    drawShockwaves();

    drawBossRageFX();

  }


  ctx.restore();


  /* LIGHTNING */

  drawLightningFlash();


  /*=========================
      OVERDRIVE OVERLAY
  =========================*/

  if (
    typeof player !==
      "undefined" &&
    player.overdriveActive
  ) {

    ctx.save();

    ctx.fillStyle =
      "rgba(255, 0, 70, 0.08)";

    ctx.fillRect(
      0,
      0,
      Game.width,
      Game.height
    );

    ctx.restore();

  }

}


/*=========================
        UI ELEMENTS
=========================*/

const startButton =
  document.getElementById(
    "startButton"
  );

const startScreen =
  document.getElementById(
    "startScreen"
  );

const healthBar =
  document.getElementById(
    "healthBar"
  );

const dashBar =
  document.getElementById(
    "dashBar"
  );

const overdriveBar =
  document.getElementById(
    "overdriveBar"
  );

const healthText =
  document.getElementById(
    "healthText"
  );

const dashText =
  document.getElementById(
    "dashText"
  );

const overdriveText =
  document.getElementById(
    "overdriveText"
  );

const scoreText =
  document.getElementById(
    "scoreText"
  );

const comboText =
  document.getElementById(
    "comboText"
  );

const timeText =
  document.getElementById(
    "timeText"
  );

const waveText =
  document.getElementById(
    "waveText"
  );

const gameOverScreen =
  document.getElementById(
    "gameOverScreen"
  );

const finalScoreText =
  document.getElementById(
    "finalScoreText"
  );

const restartButton =
  document.getElementById(
    "restartButton"
  );


/*=========================
       START GAME
=========================*/

function startGame() {

  Game.running = true;
  Game.paused = false;

  Game.time = 0;

  Game.score = 0;
  Game.combo = 1;
  Game.wave = 1;


  /*
    Reset player BEFORE resetting
    upgrade system.
  */

  player.reset();


  resetEnemies();

  resetPlayerBullets();

  resetUpgradeSystem();

  resetWorld();

  resetBossV2();

  resetBoss2();

  resetEffects();


  /* MENU */

  startScreen.classList.add(
    "hidden"
  );


  gameOverScreen.classList.add(
    "hidden"
  );


  /*
    Prevent an old mouse click from
    instantly shooting after restart.
  */

  Mouse.down = false;


  updateHUD();

}


/*=========================
        END GAME
=========================*/

function endGame() {

  if (!Game.running) {
    return;
  }


  Game.running = false;
  Game.paused = false;

  Mouse.down = false;


  finalScoreText.textContent =
    "FINAL SCORE: " +
    Math.floor(
      Game.score
    );


  gameOverScreen.classList.remove(
    "hidden"
  );

}


/*=========================
        UPDATE HUD
=========================*/

function updateHUD() {

  if (
    typeof player ===
    "undefined"
  ) {
    return;
  }


  /* HEALTH */

  const healthPercentage =
    Math.max(
      0,
      Math.min(
        100,
        (
          player.health /
          player.maximumHealth
        ) *
        100
      )
    );


  healthBar.style.width =
    healthPercentage +
    "%";


  healthText.textContent =
    Math.round(
      player.health
    ) +
    "/" +
    Math.round(
      player.maximumHealth
    );


  /* DASH */

  dashBar.style.width =
    Math.max(
      0,
      Math.min(
        100,
        player.energy
      )
    ) +
    "%";


  /*
    During Overdrive dash energy
    doesn't matter.
  */

  if (
    player.overdriveActive
  ) {

    dashText.textContent =
      "OVERDRIVE";

  } else if (
    player.dashCooldown <= 0 &&
    player.energy >=
      player.dashCost
  ) {

    dashText.textContent =
      "READY";

  } else {

    dashText.textContent =
      Math.max(
        0,
        player.dashCooldown
      ).toFixed(1) +
      "s";

  }


  /* OVERDRIVE */

  overdriveBar.style.width =
    Math.max(
      0,
      Math.min(
        100,
        player.overdrive
      )
    ) +
    "%";


  if (
    player.overdriveActive
  ) {

    overdriveText.textContent =
      "ACTIVE";

  } else if (
    player.overdrive >= 100
  ) {

    overdriveText.textContent =
      "Q // READY";

  } else {

    overdriveText.textContent =
      Math.round(
        player.overdrive
      ) +
      "%";

  }


  /* SCORE */

  scoreText.textContent =
    Math.floor(
      Game.score
    )
      .toString()
      .padStart(
        6,
        "0"
      );


  /* COMBO */

  comboText.textContent =
    "x" +
    Game.combo;


  /* TIME */

  timeText.textContent =
    Game.time.toFixed(
      1
    );


  /* WAVE */

  Game.wave =
    Math.floor(
      Game.time /
      15
    ) +
    1;


  waveText.textContent =
    Game.wave;

}


/*=========================
       BUTTON EVENTS
=========================*/

startButton.addEventListener(
  "click",
  startGame
);


if (restartButton) {

  restartButton.addEventListener(
    "click",
    startGame
  );

}


/*=========================
         GAME LOOP
=========================*/

function gameLoop(time) {

  /*
    Clamp delta so switching browser
    tabs doesn't make everything teleport.
  */

  Game.delta =
    Math.min(
      (
        time -
        Game.lastTime
      ) /
      1000,
      0.033
    );


  Game.lastTime = time;


  /*
    OVERDRIVE SLOW MOTION

    All systems use Game.delta,
    so the world runs slower while
    Overdrive is active.
  */

  if (
    typeof player !==
      "undefined" &&
    player.overdriveActive
  ) {

    Game.delta *= 0.65;

  }


  /*
    Only gameplay time counts.

    Upgrade menus pause the timer.
  */

  if (
    Game.running &&
    !Game.paused
  ) {

    Game.time +=
      Game.delta;

  }


  update();

  draw();


  Game.frame++;


  requestAnimationFrame(
    gameLoop
  );

}


/*=========================
        START LOOP
=========================*/

requestAnimationFrame(
  gameLoop
);