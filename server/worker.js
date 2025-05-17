const { parentPort } = require('worker_threads');
const { createCanvas } = require('canvas');

const FPS = 30;
const WIDTH = 640;
const HEIGHT = 480;
const BALL_RADIUS = 20;

let x = 100, y = 100, dx = 2, dy = 3;

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

function drawFrame() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = 'blue';
  ctx.beginPath();
  ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  x += dx;
  y += dy;

  if (x < BALL_RADIUS || x > WIDTH - BALL_RADIUS) dx *= -1;
  if (y < BALL_RADIUS || y > HEIGHT - BALL_RADIUS) dy *= -1;

  const frame = canvas.toBuffer('image/jpeg'); // Or raw data for encoding
  parentPort.postMessage({ frame, x, y });
}

setInterval(drawFrame, 1000 / FPS);
