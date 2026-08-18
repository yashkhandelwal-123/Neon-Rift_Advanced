"use strict";

/*=========================================
       NEON RIFT — BOSS ATTACKS
=========================================*/

/*
  Handles:
  - radial bullet hell
  - homing void orbs
  - spiral attacks
  - burst attacks
  - charge scheduling
*/


const BossAttackBullets = [];


/*=========================================
          BOSS ATTACK BULLET
=========================================*/

class VoidBullet {
  constructor(
    x,
    y,
    angle,
    speed = 240,
    homing = false,
    color = "#ff2b72"
  ) {
    this.x = x;
    this.y = y;

    this.angle = angle;
    this.speed = speed;

    this.homing = homing;

    this.color = color;

    this.radius =
      homing ? 10 : 7;

    this.life = 8;

    this.dead = false;

    this.rotation =
      Math.random() *
      Math.PI *
      2;
  }


  update(deltaTime) {

    /*=========================
             HOMING
    =========================*/

    if (
      this.homing &&
      typeof player !== "undefined"
    ) {

      const targetAngle =
        Math.atan2(
          player.y - this.y,
          player.x - this.x
        );


      let difference =
        targetAngle -
        this.angle;


      difference =
        Math.atan2(
          Math.sin(
            difference
          ),
          Math.cos(
            difference
          )
        );


      this.angle +=
        difference *
        deltaTime *
        1.8;
    }


    /*=========================
            MOVEMENT
    =========================*/

    this.x +=
      Math.cos(
        this.angle
      ) *
      this.speed *
      deltaTime;


    this.y +=
      Math.sin(
        this.angle
      ) *
      this.speed *
      deltaTime;


    this.rotation +=
      deltaTime *
      6;


    this.life -=
      deltaTime;


    /*=========================
          OUT OF BOUNDS
    =========================*/

    if (
      this.life <= 0 ||
      this.x < -120 ||
      this.x >
        Game.width + 120 ||
      this.y < -120 ||
      this.y >
        Game.height + 120
    ) {

      this.dead = true;

    }


    /*=========================
        PLAYER COLLISION
    =========================*/

    if (
      !this.dead &&
      typeof player !==
        "undefined"
    ) {

      const distance =
        Math.hypot(
          this.x -
            player.x,
          this.y -
            player.y
        );


      if (
        distance <
        this.radius +
        player.radius
      ) {

        if (
          player.dashing ||
          player.invincibleTimer > 0 ||
          player.overdriveActive
        ) {

          this.dead = true;


          createParticles(
            this.x,
            this.y,
            "#00f7ff",
            7,
            140
          );

        } else {

          this.dead = true;

          damagePlayer(
            this.homing
              ? 18
              : 14
          );

        }
      }
    }
  }


  draw() {

    ctx.save();


    ctx.translate(
      this.x,
      this.y
    );


    ctx.rotate(
      this.rotation
    );


    ctx.shadowBlur =
      this.homing
        ? 30
        : 20;


    ctx.shadowColor =
      this.color;


    ctx.fillStyle =
      this.color;


    ctx.strokeStyle =
      "#ffffff";


    ctx.lineWidth =
      this.homing
        ? 2.5
        : 2;


    ctx.beginPath();


    if (
      this.homing
    ) {

      for (
        let i = 0;
        i < 6;
        i++
      ) {

        const angle =
          Math.PI *
          2 *
          i /
          6;


        const radius =
          i % 2 === 0
            ? this.radius
            : this.radius * 0.55;


        const x =
          Math.cos(angle) *
          radius;


        const y =
          Math.sin(angle) *
          radius;


        if (
          i === 0
        ) {

          ctx.moveTo(
            x,
            y
          );

        } else {

          ctx.lineTo(
            x,
            y
          );

        }
      }


      ctx.closePath();

    } else {

      ctx.rect(
        -this.radius,
        -this.radius,
        this.radius * 2,
        this.radius * 2
      );

    }


    ctx.fill();
    ctx.stroke();


    ctx.restore();
  }
}


/*=========================================
       UPDATE BOSS ATTACK SYSTEM
=========================================*/

function updateVoidTitanAttacks(
  boss,
  deltaTime
) {

  if (
    !boss ||
    boss.dead ||
    boss.entering ||
    boss.invincible
  ) {
    return;
  }


  boss.attackTimer -=
    deltaTime;


  boss.specialTimer -=
    deltaTime;


  if (
    typeof boss.chargeCooldown ===
    "undefined"
  ) {

    boss.chargeCooldown =
      6;

  }


  boss.chargeCooldown -=
    deltaTime;


  /*=========================
        NORMAL ATTACK
  =========================*/

  if (
    boss.attackTimer <= 0
  ) {

    chooseVoidTitanAttack(
      boss
    );


    boss.attackTimer =
      boss.phase === 1
        ? 2.4
        : boss.phase === 2
          ? 1.65
          : 1.05;
  }


  /*=========================
       SPECIAL ATTACK
  =========================*/

  if (
    boss.specialTimer <= 0
  ) {

    if (
      boss.phase >= 2
    ) {

      homingVoidSwarm(
        boss,
        boss.phase === 3
          ? 10
          : 6
      );

    } else {

      burstAttack(
        boss
      );
    }


    boss.specialTimer =
      boss.phase === 3
        ? 4.5
        : 6.5;
  }


  /*=========================
          CHARGE
  =========================*/

  if (
    boss.phase >= 2 &&
    boss.chargeCooldown <= 0 &&
    typeof prepareVoidTitanCharge ===
      "function"
  ) {

    prepareVoidTitanCharge(
      boss
    );


    boss.chargeCooldown =
      boss.phase === 3
        ? 4
        : 6;
  }


  if (
    typeof updateVoidTitanCharge ===
      "function"
  ) {

    updateVoidTitanCharge(
      boss,
      deltaTime
    );
  }


  /*=========================
       UPDATE BULLETS
  =========================*/

  for (
    let i =
      BossAttackBullets.length - 1;
    i >= 0;
    i--
  ) {

    BossAttackBullets[i].update(
      deltaTime
    );


    if (
      BossAttackBullets[i].dead
    ) {

      BossAttackBullets.splice(
        i,
        1
      );
    }
  }
}


/*=========================================
        CHOOSE ATTACK
=========================================*/

function chooseVoidTitanAttack(
  boss
) {

  const chance =
    Math.random();


  /*=========================
          PHASE 1
  =========================*/

  if (
    boss.phase === 1
  ) {

    if (
      chance < 0.6
    ) {

      radialAttack(
        boss,
        18,
        220
      );

    } else {

      burstAttack(
        boss
      );

    }

    return;
  }


  /*=========================
          PHASE 2
  =========================*/

  if (
    boss.phase === 2
  ) {

    if (
      chance < 0.4
    ) {

      radialAttack(
        boss,
        24,
        255
      );

    } else if (
      chance < 0.75
    ) {

      spiralAttack(
        boss,
        3,
        8
      );

    } else {

      homingVoidSwarm(
        boss,
        6
      );

    }

    return;
  }


  /*=========================
          PHASE 3
  =========================*/

  if (
    boss.phase === 3
  ) {

    if (
      chance < 0.33
    ) {

      radialAttack(
        boss,
        34,
        300
      );

    } else if (
      chance < 0.66
    ) {

      spiralAttack(
        boss,
        5,
        10
      );

    } else {

      homingVoidSwarm(
        boss,
        10
      );

    }
  }
}


/*=========================================
          RADIAL ATTACK
=========================================*/

function radialAttack(
  boss,
  amount,
  speed
) {

  const offset =
    Game.time *
    (
      boss.phase === 3
        ? 1.2
        : 0.7
    );


  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const angle =
      offset +
      Math.PI *
      2 *
      i /
      amount;


    BossAttackBullets.push(
      new VoidBullet(
        boss.x,
        boss.y,
        angle,
        speed,
        false,
        boss.phase === 3
          ? "#ffffff"
          : "#ff2b72"
      )
    );
  }


  createShockwave(
    boss.x,
    boss.y,
    "#ff2b72",
    20,
    180
  );


  Camera.shake =
    Math.max(
      Camera.shake,
      boss.phase === 3
        ? 12
        : 8
    );


  if (
    typeof createImpactFX ===
    "function"
  ) {

    createImpactFX(
      boss.x,
      boss.y,
      "#ff2b72",
      boss.phase === 3
        ? 2.5
        : 1.5
    );
  }
}


/*=========================================
           BURST ATTACK
=========================================*/

function burstAttack(
  boss
) {

  const angleToPlayer =
    Math.atan2(
      player.y -
        boss.y,
      player.x -
        boss.x
    );


  const amount =
    boss.phase === 1
      ? 7
      : boss.phase === 2
        ? 9
        : 13;


  const spread =
    boss.phase === 3
      ? 0.11
      : 0.14;


  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const offset =
      (
        i -
        (
          amount -
          1
        ) /
        2
      ) *
      spread;


    BossAttackBullets.push(
      new VoidBullet(
        boss.x,
        boss.y,
        angleToPlayer +
          offset,
        boss.phase === 3
          ? 390
          : 330,
        false,
        "#ff2b72"
      )
    );
  }


  Camera.shake =
    Math.max(
      Camera.shake,
      7
    );
}


/*=========================================
          HOMING SWARM
=========================================*/

function homingVoidSwarm(
  boss,
  amount
) {

  if (
    typeof showBossMessage ===
      "function"
  ) {

    showBossMessage(
      "HOMING VOID SWARM"
    );
  }


  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const angle =
      Math.random() *
      Math.PI *
      2;


    BossAttackBullets.push(
      new VoidBullet(
        boss.x,
        boss.y,
        angle,
        boss.phase === 3
          ? 180
          : 145,
        true,
        boss.phase === 3
          ? "#ffffff"
          : "#ffb000"
      )
    );
  }


  createShockwave(
    boss.x,
    boss.y,
    "#ffb000",
    15,
    150
  );


  Camera.shake =
    Math.max(
      Camera.shake,
      9
    );
}


/*=========================================
          SPIRAL ATTACK
=========================================*/

function spiralAttack(
  boss,
  arms = 3,
  bulletsPerArm = 8
) {

  if (
    typeof showBossMessage ===
      "function"
  ) {

    showBossMessage(
      "VOID SPIRAL"
    );
  }


  const baseAngle =
    Game.time *
    1.6;


  for (
    let arm = 0;
    arm < arms;
    arm++
  ) {

    for (
      let i = 0;
      i < bulletsPerArm;
      i++
    ) {

      const delay =
        i * 65;


      setTimeout(
        () => {

          if (
            !Game.running ||
            !BossSystemV2.active ||
            !VoidTitanV2 ||
            VoidTitanV2.dead
          ) {
            return;
          }


          const angle =
            baseAngle +
            arm *
            Math.PI *
            2 /
            arms +
            i *
            0.14;


          BossAttackBullets.push(
            new VoidBullet(
              boss.x,
              boss.y,
              angle,
              boss.phase === 3
                ? 290
                : 240,
              false,
              boss.phase === 3
                ? "#ffffff"
                : "#ff2b72"
            )
          );

        },
        delay
      );
    }
  }


  Camera.shake =
    Math.max(
      Camera.shake,
      10
    );
}


/*=========================================
        DRAW BOSS BULLETS
=========================================*/

function drawBossAttackBullets() {

  for (
    const bullet of
    BossAttackBullets
  ) {

    bullet.draw();

  }
}


/*=========================================
        RESET ATTACK SYSTEM
=========================================*/

function resetBossAttacksV2() {

  BossAttackBullets.length =
    0;

}