"use strict";

/*=========================================
     CRIMSON WARDEN — ATTACK SYSTEM
=========================================*/

const WardenBullets = [];
const CrimsonCages = [];


/*=========================================
          WARDEN BULLET
=========================================*/

class WardenBullet {

  constructor(
    x,
    y,
    angle,
    speed = 260,
    radius = 7,
    damage = 10
  ) {

    this.x = x;
    this.y = y;

    this.angle = angle;

    this.speed = speed;

    this.radius = radius;

    this.damage = damage;

    this.life = 6;

    this.dead = false;
  }


  update(deltaTime) {

    this.x +=
      Math.cos(this.angle) *
      this.speed *
      deltaTime;


    this.y +=
      Math.sin(this.angle) *
      this.speed *
      deltaTime;


    this.life -=
      deltaTime;


    /* TRAIL */

    if (
      typeof createTrail ===
      "function"
    ) {

      createTrail(
        this.x,
        this.y,
        10,
        "#ff174f"
      );
    }


    /* PLAYER COLLISION */

    if (
      player &&
      !player.dashing &&
      player.invincibleTimer <= 0 &&
      !player.overdriveActive
    ) {

      const distance =
        Math.hypot(
          this.x - player.x,
          this.y - player.y
        );


      if (
        distance <
        this.radius +
        player.radius
      ) {

        damagePlayer(
          this.damage
        );


        this.dead = true;


        if (
          typeof createImpactFX ===
          "function"
        ) {

          createImpactFX(
            this.x,
            this.y,
            "#ff174f",
            1.5
          );
        }


        return;
      }
    }


    /* REMOVE */

    if (
      this.life <= 0 ||
      this.x < -100 ||
      this.x > Game.width + 100 ||
      this.y < -100 ||
      this.y > Game.height + 100
    ) {

      this.dead = true;
    }
  }


  draw() {

    ctx.save();


    ctx.translate(
      this.x,
      this.y
    );


    ctx.rotate(
      this.angle
    );


    ctx.shadowBlur = 25;

    ctx.shadowColor =
      "#ff174f";


    ctx.fillStyle =
      "#ff174f";


    ctx.beginPath();

    ctx.arc(
      0,
      0,
      this.radius,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
      "#ffffff";


    ctx.beginPath();

    ctx.arc(
      0,
      0,
      this.radius * 0.38,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.restore();
  }
}


/*=========================================
           UPDATE ATTACKS
=========================================*/

function updateCrimsonWardenAttacks(
  boss,
  deltaTime
) {

  if (
    !boss ||
    boss.dead ||
    boss.entering
  ) {
    return;
  }


  boss.attackTimer -=
    deltaTime;


  boss.specialTimer -=
    deltaTime;


  /*=========================================
            AIMED BURST
  =========================================*/

  if (
    boss.attackTimer <= 0
  ) {

    fireWardenBurst(
      boss
    );


    boss.attackTimer =
      boss.phase === 3
        ? 0.75
        : boss.phase === 2
          ? 1.15
          : 1.7;
  }


  /*=========================================
           SPECIAL ATTACK
  =========================================*/

  if (
    boss.specialTimer <= 0
  ) {

    /*
      Phase 1:
      mostly normal ring.

      Phase 2/3:
      sometimes use Crimson Cage.
    */

    if (
      boss.phase >= 2 &&
      Math.random() < 0.5
    ) {

      fireCrimsonCage(
        boss
      );

    } else {

      fireWardenRing(
        boss
      );

    }


    boss.specialTimer =
      boss.phase === 3
        ? 3.2
        : boss.phase === 2
          ? 4.5
          : 6;
  }


  /*=========================================
          UPDATE PROJECTILES
  =========================================*/

  for (
    let i =
      WardenBullets.length - 1;
    i >= 0;
    i--
  ) {

    WardenBullets[i].update(
      deltaTime
    );


    if (
      WardenBullets[i].dead
    ) {

      WardenBullets.splice(
        i,
        1
      );
    }
  }


  updateCrimsonCages(
    deltaTime
  );
}


/*=========================================
            AIMED BURST
=========================================*/

function fireWardenBurst(
  boss
) {

  if (
    !player
  ) {
    return;
  }


  const baseAngle =
    Math.atan2(
      player.y - boss.y,
      player.x - boss.x
    );


  const bulletCount =
    boss.phase === 3
      ? 7
      : boss.phase === 2
        ? 5
        : 3;


  const spread =
    0.14;


  for (
    let i = 0;
    i < bulletCount;
    i++
  ) {

    const offset =
      (
        i -
        (
          bulletCount - 1
        ) /
        2
      ) *
      spread;


    WardenBullets.push(
      new WardenBullet(
        boss.x,
        boss.y,
        baseAngle + offset,

        boss.phase === 3
          ? 430
          : boss.phase === 2
            ? 360
            : 300,

        boss.phase === 3
          ? 8
          : 7,

        boss.phase === 3
          ? 14
          : 10
      )
    );
  }


  createParticles(
    boss.x,
    boss.y,
    "#ff174f",
    12,
    220
  );


  Camera.shake =
    Math.max(
      Camera.shake,
      4
    );
}


/*=========================================
          RADIAL BULLET RING
=========================================*/

function fireWardenRing(
  boss
) {

  const bulletCount =
    boss.phase === 3
      ? 24
      : boss.phase === 2
        ? 18
        : 12;


  const rotation =
    boss.rotation;


  for (
    let i = 0;
    i < bulletCount;
    i++
  ) {

    const angle =
      rotation +
      (
        Math.PI * 2 /
        bulletCount
      ) *
      i;


    WardenBullets.push(
      new WardenBullet(
        boss.x,
        boss.y,
        angle,

        boss.phase === 3
          ? 300
          : 240,

        7,

        boss.phase === 3
          ? 12
          : 9
      )
    );
  }


  createShockwave(
    boss.x,
    boss.y,
    boss.phase === 3
      ? "#ffffff"
      : "#ff8a00",
    25,
    450
  );


  createParticles(
    boss.x,
    boss.y,
    "#ff8a00",
    40,
    350
  );


  Camera.shake =
    Math.max(
      Camera.shake,
      boss.phase === 3
        ? 15
        : 9
    );
}


/*=========================================
          CRIMSON CAGE ATTACK
=========================================*/

function fireCrimsonCage(
  boss
) {

  if (
    !boss ||
    boss.dead
  ) {
    return;
  }


  const ringCount =
    boss.phase === 3
      ? 5
      : 3;


  for (
    let i = 0;
    i < ringCount;
    i++
  ) {

    CrimsonCages.push({

      x: boss.x,
      y: boss.y,

      radius:
        45 +
        i * 95,

      speed:
        boss.phase === 3
          ? 230
          : 180,

      thickness:
        boss.phase === 3
          ? 18
          : 14,

      life:
        3.2,

      damage:
        boss.phase === 3
          ? 16
          : 12,

      hitCooldown:
        0,

      dead:
        false
    });
  }


  createShockwave(
    boss.x,
    boss.y,
    "#ff174f",
    45,
    700
  );


  createParticles(
    boss.x,
    boss.y,
    "#ff174f",
    80,
    500
  );


  createParticles(
    boss.x,
    boss.y,
    "#ffffff",
    30,
    350
  );


  Camera.shake =
    Math.max(
      Camera.shake,
      18
    );


  if (
    typeof showBoss2Message ===
    "function"
  ) {

    showBoss2Message(
      "⚠ CRIMSON CAGE ⚠"
    );
  }
}


/*=========================================
          UPDATE CRIMSON CAGES
=========================================*/

function updateCrimsonCages(
  deltaTime
) {

  for (
    let i =
      CrimsonCages.length - 1;
    i >= 0;
    i--
  ) {

    const cage =
      CrimsonCages[i];


    cage.radius +=
      cage.speed *
      deltaTime;


    cage.life -=
      deltaTime;


    cage.hitCooldown =
      Math.max(
        0,
        cage.hitCooldown -
        deltaTime
      );


    /* PLAYER COLLISION */

    if (
      player &&
      !player.dashing &&
      player.invincibleTimer <= 0 &&
      !player.overdriveActive &&
      cage.hitCooldown <= 0
    ) {

      const distance =
        Math.hypot(
          player.x - cage.x,
          player.y - cage.y
        );


      const difference =
        Math.abs(
          distance -
          cage.radius
        );


      if (
        difference <
        cage.thickness +
        player.radius
      ) {

        damagePlayer(
          cage.damage
        );


        cage.hitCooldown =
          0.55;


        Camera.shake =
          Math.max(
            Camera.shake,
            12
          );


        if (
          typeof createImpactFX ===
          "function"
        ) {

          createImpactFX(
            player.x,
            player.y,
            "#ff174f",
            2
          );
        }
      }
    }


    if (
      cage.life <= 0 ||
      cage.radius >
        Math.max(
          Game.width,
          Game.height
        ) * 1.4
    ) {

      cage.dead = true;
    }


    if (
      cage.dead
    ) {

      CrimsonCages.splice(
        i,
        1
      );
    }
  }
}


/*=========================================
          DRAW CRIMSON CAGES
=========================================*/

function drawCrimsonCages() {

  for (
    const cage of
    CrimsonCages
  ) {

    ctx.save();


    const alpha =
      Math.max(
        0,
        Math.min(
          1,
          cage.life
        )
      );


    ctx.globalAlpha =
      alpha * 0.85;


    ctx.strokeStyle =
      "#ff174f";


    ctx.lineWidth =
      cage.thickness;


    ctx.shadowBlur =
      30;


    ctx.shadowColor =
      "#ff174f";


    ctx.beginPath();

    ctx.arc(
      cage.x,
      cage.y,
      cage.radius,
      0,
      Math.PI * 2
    );

    ctx.stroke();


    /* WHITE INNER EDGE */

    ctx.globalAlpha =
      alpha * 0.65;


    ctx.strokeStyle =
      "#ffffff";


    ctx.lineWidth =
      2;


    ctx.beginPath();

    ctx.arc(
      cage.x,
      cage.y,
      cage.radius,
      0,
      Math.PI * 2
    );

    ctx.stroke();


    ctx.restore();
  }
}


/*=========================================
             DRAW BULLETS
=========================================*/

function drawWardenBullets() {

  for (
    const bullet of
    WardenBullets
  ) {

    bullet.draw();
  }


  drawCrimsonCages();
}


/*=========================================
                RESET
=========================================*/

function resetWardenBullets() {

  WardenBullets.length =
    0;


  CrimsonCages.length =
    0;
}