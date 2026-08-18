"use strict";

const Particles = [];
const Trails = [];
const Shockwaves = [];

function createParticles(
  x,
  y,
  color = "#00f7ff",
  amount = 20,
  speed = 250
) {
  for (let i = 0; i < amount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity =
      Math.random() * speed + speed * 0.2;

    Particles.push({
      x,
      y,

      velocityX:
        Math.cos(angle) * velocity,

      velocityY:
        Math.sin(angle) * velocity,

      radius:
        Math.random() * 4 + 1,

      life:
        Math.random() * 0.6 + 0.35,

      maximumLife: 1,

      color
    });
  }
}

function createTrail(
  x,
  y,
  radius = 14,
  color = "#00f7ff"
) {
  Trails.push({
    x,
    y,
    radius,
    life: 1,
    color
  });
}

function createShockwave(
  x,
  y,
  color = "#00f7ff",
  startingRadius = 10,
  maximumRadius = 160
) {
  Shockwaves.push({
    x,
    y,
    radius: startingRadius,
    maximumRadius,
    life: 1,
    color
  });
}

function updateParticles(deltaTime) {
  for (
    let i = Particles.length - 1;
    i >= 0;
    i--
  ) {
    const particle = Particles[i];

    particle.x +=
      particle.velocityX * deltaTime;

    particle.y +=
      particle.velocityY * deltaTime;

    particle.velocityX *=
      Math.pow(0.03, deltaTime);

    particle.velocityY *=
      Math.pow(0.03, deltaTime);

    particle.life -= deltaTime;

    if (particle.life <= 0) {
      Particles.splice(i, 1);
    }
  }

  for (
    let i = Trails.length - 1;
    i >= 0;
    i--
  ) {
    const trail = Trails[i];

    trail.life -= deltaTime * 3;
    trail.radius *=
      Math.pow(0.2, deltaTime);

    if (trail.life <= 0) {
      Trails.splice(i, 1);
    }
  }

  for (
    let i = Shockwaves.length - 1;
    i >= 0;
    i--
  ) {
    const wave = Shockwaves[i];

    wave.life -= deltaTime * 1.6;

    wave.radius +=
      (
        wave.maximumRadius -
        wave.radius
      ) *
      deltaTime *
      5;

    if (wave.life <= 0) {
      Shockwaves.splice(i, 1);
    }
  }
}

function drawTrails() {
  for (const trail of Trails) {
    ctx.globalAlpha =
      Math.max(0, trail.life) * 0.5;

    const glow =
      ctx.createRadialGradient(
        trail.x,
        trail.y,
        0,

        trail.x,
        trail.y,
        trail.radius
      );

    glow.addColorStop(
      0,
      trail.color
    );

    glow.addColorStop(
      1,
      "rgba(0,247,255,0)"
    );

    ctx.fillStyle = glow;

    ctx.beginPath();

    ctx.arc(
      trail.x,
      trail.y,
      trail.radius,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function drawParticles() {
  for (const particle of Particles) {
    ctx.globalAlpha =
      Math.max(
        0,
        particle.life /
        particle.maximumLife
      );

    ctx.fillStyle =
      particle.color;

    ctx.shadowBlur = 16;
    ctx.shadowColor =
      particle.color;

    ctx.beginPath();

    ctx.arc(
      particle.x,
      particle.y,
      particle.radius,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

function drawShockwaves() {
  for (const wave of Shockwaves) {
    ctx.globalAlpha =
      Math.max(0, wave.life);

    ctx.strokeStyle =
      wave.color;

    ctx.lineWidth =
      4 * wave.life;

    ctx.shadowBlur = 22;
    ctx.shadowColor =
      wave.color;

    ctx.beginPath();

    ctx.arc(
      wave.x,
      wave.y,
      wave.radius,
      0,
      Math.PI * 2
    );

    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}