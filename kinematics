/* ============================================================
   KINEMATICS PAGE — interactive canvas simulations
   Three independent sections:
     1. Distance vs Displacement (draw-your-own-path)
     2. Acceleration (slider + live velocity arrow)
     3. Constant Acceleration (v0 / a / t sliders + graphs)
   ============================================================ */


/* ============================================================
   SECTION 1 — DISTANCE VS DISPLACEMENT
   User draws a path with mouse/touch. We track every point,
   then compute:
     distance     = sum of every little segment length
     displacement = straight line from first point to last point
   ============================================================ */

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const distanceEl = document.getElementById('distance');
const displacementEl = document.getElementById('displacement');

const PX_PER_M = 20; // how many pixels count as "1 meter" for display purposes

let pathPoints = [];
let isDrawingPath = false;
let playPathInterval = null;

function getCanvasPos(evt) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
  const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x <= canvas.width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawDot(p, color, radius = 7) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawStoredPath() {
  drawGrid();
  if (pathPoints.length === 0) return;

  // the traveled path, in blue
  ctx.strokeStyle = '#5fd0ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
  for (let i = 1; i < pathPoints.length; i++) {
    ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
  }
  ctx.stroke();

  // dashed straight line showing displacement, in orange
  if (pathPoints.length > 1) {
    ctx.save();
    ctx.strokeStyle = '#f6a745';
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    ctx.lineTo(pathPoints[pathPoints.length - 1].x, pathPoints[pathPoints.length - 1].y);
    ctx.stroke();
    ctx.restore();
  }

  drawDot(pathPoints[0], '#4caf50'); // start = green
  if (pathPoints.length > 1) {
    drawDot(pathPoints[pathPoints.length - 1], '#f66546'); // end = red
  }
}

function calcDistance() {
  let d = 0;
  for (let i = 1; i < pathPoints.length; i++) {
    const dx = pathPoints[i].x - pathPoints[i - 1].x;
    const dy = pathPoints[i].y - pathPoints[i - 1].y;
    d += Math.sqrt(dx * dx + dy * dy);
  }
  return d / PX_PER_M;
}

function calcDisplacement() {
  if (pathPoints.length < 2) return 0;
  const first = pathPoints[0];
  const last = pathPoints[pathPoints.length - 1];
  const dx = last.x - first.x;
  const dy = last.y - first.y;
  return Math.sqrt(dx * dx + dy * dy) / PX_PER_M;
}

function updatePathStats() {
  distanceEl.textContent = `Distance: ${calcDistance().toFixed(1)} m`;
  displacementEl.textContent = `Displacement: ${calcDisplacement().toFixed(1)} m`;
}

function handlePathStart(evt) {
  clearInterval(playPathInterval);
  pathPoints = [];
  isDrawingPath = true;
  pathPoints.push(getCanvasPos(evt));
  drawStoredPath();
  updatePathStats();
  evt.preventDefault();
}

function handlePathMove(evt) {
  if (!isDrawingPath) return;
  const p = getCanvasPos(evt);
  const last = pathPoints[pathPoints.length - 1];
  const dx = p.x - last.x;
  const dy = p.y - last.y;
  // only record a new point if the mouse has moved enough (keeps the array small)
  if (Math.sqrt(dx * dx + dy * dy) > 3) {
    pathPoints.push(p);
    drawStoredPath();
    updatePathStats();
  }
  evt.preventDefault();
}

function handlePathEnd() {
  isDrawingPath = false;
}

canvas.addEventListener('mousedown', handlePathStart);
canvas.addEventListener('mousemove', handlePathMove);
window.addEventListener('mouseup', handlePathEnd);
canvas.addEventListener('touchstart', handlePathStart, { passive: false });
canvas.addEventListener('touchmove', handlePathMove, { passive: false });
canvas.addEventListener('touchend', handlePathEnd);

function playPath() {
  if (pathPoints.length < 2) return;
  clearInterval(playPathInterval);
  let idx = 0;
  playPathInterval = setInterval(() => {
    drawStoredPath();
    drawDot(pathPoints[idx], '#ffffff', 9); // moving marker
    idx++;
    if (idx >= pathPoints.length) {
      clearInterval(playPathInterval);
    }
  }, 20);
}

function resetPath() {
  clearInterval(playPathInterval);
  pathPoints = [];
  drawGrid();
  distanceEl.textContent = 'Distance: 0 m';
  displacementEl.textContent = 'Displacement: 0 m';
}

drawGrid();


/* ============================================================
   SECTION 2 — ACCELERATION
   A single slider controls acceleration. Play/Pause runs a
   physics loop (v += a*dt, x += v*dt) so kids can see how
   acceleration bends the velocity over time.
   ============================================================ */

const accelCanvas = document.getElementById('accelCanvas');
const accelCtx = accelCanvas.getContext('2d');
const accelValEl = document.getElementById('accelVal');
const accelSlider = document.getElementById('accelSlider');

const ACCEL_TRACK_Y = 150;

let accel = 0;
let accelPlaying = false;
let accelLastTime = null;
let accelX = accelCanvas.width / 2;
let accelV = 0;
let velocityHistory = [];

accelSlider.addEventListener('input', () => {
  accel = parseFloat(accelSlider.value);
  accelValEl.textContent = accel.toFixed(1);
});

function drawAccelScene() {
  accelCtx.clearRect(0, 0, accelCanvas.width, accelCanvas.height);

  // track line
  accelCtx.strokeStyle = 'rgba(255,255,255,0.2)';
  accelCtx.lineWidth = 2;
  accelCtx.beginPath();
  accelCtx.moveTo(30, ACCEL_TRACK_Y);
  accelCtx.lineTo(accelCanvas.width - 30, ACCEL_TRACK_Y);
  accelCtx.stroke();

  const clampedX = Math.max(30, Math.min(accelCanvas.width - 30, accelX));

  // the moving object
  accelCtx.beginPath();
  accelCtx.fillStyle = '#5fd0ff';
  accelCtx.arc(clampedX, ACCEL_TRACK_Y, 14, 0, Math.PI * 2);
  accelCtx.fill();

  // velocity arrow (length/direction shows current velocity)
  const arrowLen = accelV * 25;
  accelCtx.strokeStyle = '#f6a745';
  accelCtx.lineWidth = 3;
  accelCtx.beginPath();
  accelCtx.moveTo(clampedX, ACCEL_TRACK_Y - 30);
  accelCtx.lineTo(clampedX + arrowLen, ACCEL_TRACK_Y - 30);
  accelCtx.stroke();

  if (Math.abs(arrowLen) > 2) {
    const dir = Math.sign(arrowLen);
    accelCtx.beginPath();
    accelCtx.moveTo(clampedX + arrowLen, ACCEL_TRACK_Y - 30);
    accelCtx.lineTo(clampedX + arrowLen - dir * 8, ACCEL_TRACK_Y - 36);
    accelCtx.lineTo(clampedX + arrowLen - dir * 8, ACCEL_TRACK_Y - 24);
    accelCtx.closePath();
    accelCtx.fillStyle = '#f6a745';
    accelCtx.fill();
  }

  accelCtx.fillStyle = '#eaeaf0';
  accelCtx.font = '14px sans-serif';
  accelCtx.fillText(`v = ${accelV.toFixed(2)} m/s`, 30, 30);

  // small live velocity-time trace
  const graphX = 30, graphY = 220, graphW = accelCanvas.width - 60, graphH = 60;
  accelCtx.strokeStyle = 'rgba(255,255,255,0.15)';
  accelCtx.strokeRect(graphX, graphY, graphW, graphH);
  accelCtx.fillStyle = '#eaeaf0';
  accelCtx.font = '12px sans-serif';
  accelCtx.fillText('v-t', graphX, graphY - 6);

  if (velocityHistory.length > 1) {
    accelCtx.strokeStyle = '#5fd0ff';
    accelCtx.lineWidth = 2;
    accelCtx.beginPath();
    velocityHistory.forEach((v, i) => {
      const px = graphX + (i / (velocityHistory.length - 1)) * graphW;
      const py = graphY + graphH / 2 - v * 8;
      const clampedY = Math.max(graphY, Math.min(graphY + graphH, py));
      if (i === 0) accelCtx.moveTo(px, clampedY);
      else accelCtx.lineTo(px, clampedY);
    });
    accelCtx.stroke();
  }
}

function accelStep(timestamp) {
  if (!accelPlaying) return;
  if (accelLastTime === null) accelLastTime = timestamp;
  const dt = (timestamp - accelLastTime) / 1000;
  accelLastTime = timestamp;

  accelV += accel * dt;
  accelX += accelV * 20 * dt;

  // bounce gently off the edges so it doesn't fly off canvas forever
  if (accelX < 30 || accelX > accelCanvas.width - 30) {
    accelV *= -0.6;
    accelX = Math.max(30, Math.min(accelCanvas.width - 30, accelX));
  }

  velocityHistory.push(accelV);
  if (velocityHistory.length > 150) velocityHistory.shift();

  drawAccelScene();
  requestAnimationFrame(accelStep);
}

function togglePlay() {
  accelPlaying = !accelPlaying;
  accelLastTime = null;
  if (accelPlaying) requestAnimationFrame(accelStep);
}

function resetMotion() {
  accelPlaying = false;
  accelLastTime = null;
  accelX = accelCanvas.width / 2;
  accelV = 0;
  velocityHistory = [];
  drawAccelScene();
}

drawAccelScene();


/* ============================================================
   SECTION 3 — CONSTANT ACCELERATION
   v0, a, and t sliders drive x = v0*t + 1/2*a*t^2.
   Moving a slider while paused re-draws the scene at that
   instant. Pressing Play animates t from 0 up to whatever
   the t-slider is currently set to.
   ============================================================ */

const constCanvas = document.getElementById('constAccelCanvas');
const constCtx = constCanvas.getContext('2d');
const v0Slider = document.getElementById('v0Slider');
const aSlider = document.getElementById('aSlider');
const tSlider = document.getElementById('tSlider');
const v0ValEl = document.getElementById('v0Val');
const aValEl = document.getElementById('aVal');
const tValEl = document.getElementById('tVal');
const mathBox = document.getElementById('mathBox');

let constV0 = 0, constA = 0, constTMax = 0;
let constPlaying = false;
let constStartTime = null;
let constCurrentT = 0;

function updateConstLabels() {
  v0ValEl.textContent = constV0.toFixed(1);
  aValEl.textContent = constA.toFixed(1);
  tValEl.textContent = constCurrentT.toFixed(1);
}

v0Slider.addEventListener('input', () => {
  constV0 = parseFloat(v0Slider.value);
  updateConstLabels();
  if (!constPlaying) drawConstScene(constCurrentT);
});
aSlider.addEventListener('input', () => {
  constA = parseFloat(aSlider.value);
  updateConstLabels();
  if (!constPlaying) drawConstScene(constCurrentT);
});
tSlider.addEventListener('input', () => {
  constCurrentT = parseFloat(tSlider.value);
  updateConstLabels();
  if (!constPlaying) drawConstScene(constCurrentT);
});

function positionAt(t) {
  return constV0 * t + 0.5 * constA * t * t;
}
function velocityAt(t) {
  return constV0 + constA * t;
}

function drawConstScene(t) {
  constCtx.clearRect(0, 0, constCanvas.width, constCanvas.height);

  const trackY = 60;
  const originX = 60;
  const trackW = constCanvas.width - 120;
  const tMax = Math.max(parseFloat(tSlider.max) || 10, t, 0.1);

  // track
  constCtx.strokeStyle = 'rgba(255,255,255,0.2)';
  constCtx.lineWidth = 2;
  constCtx.beginPath();
  constCtx.moveTo(originX, trackY);
  constCtx.lineTo(originX + trackW, trackY);
  constCtx.stroke();

  // figure out a scale so the object stays on-track across the full time range
  let maxAbsX = 1;
  for (let tt = 0; tt <= tMax; tt += 0.2) {
    maxAbsX = Math.max(maxAbsX, Math.abs(positionAt(tt)));
  }
  const scale = (trackW / 2 - 20) / maxAbsX;

  const x = positionAt(t);
  const px = originX + trackW / 2 + x * scale;

  constCtx.beginPath();
  constCtx.fillStyle = '#5fd0ff';
  constCtx.arc(px, trackY, 12, 0, Math.PI * 2);
  constCtx.fill();

  constCtx.fillStyle = '#eaeaf0';
  constCtx.font = '14px sans-serif';
  constCtx.fillText(
    `t = ${t.toFixed(1)} s   x = ${x.toFixed(1)} m   v = ${velocityAt(t).toFixed(1)} m/s`,
    originX, 25
  );

  // position-time graph
  const graphX = originX, graphY = 110, graphW = trackW, graphH = 150;
  constCtx.strokeStyle = 'rgba(255,255,255,0.15)';
  constCtx.strokeRect(graphX, graphY, graphW, graphH);
  constCtx.fillStyle = '#eaeaf0';
  constCtx.font = '12px sans-serif';
  constCtx.fillText('Position vs Time', graphX, graphY - 6);

  constCtx.strokeStyle = '#f6a745';
  constCtx.lineWidth = 2;
  constCtx.beginPath();
  let started = false;
  for (let i = 0; i <= 100; i++) {
    const tt = (i / 100) * tMax;
    if (tt > t) break;
    const xx = positionAt(tt);
    const gx = graphX + (tt / tMax) * graphW;
    const gy = graphY + graphH / 2 - (xx / maxAbsX) * (graphH / 2 - 10);
    if (!started) {
      constCtx.moveTo(gx, gy);
      started = true;
    } else {
      constCtx.lineTo(gx, gy);
    }
  }
  constCtx.stroke();

  // marker on the graph showing the current point
  const gx = graphX + (t / tMax) * graphW;
  const gy = graphY + graphH / 2 - (x / maxAbsX) * (graphH / 2 - 10);
  constCtx.beginPath();
  constCtx.fillStyle = '#5fd0ff';
  constCtx.arc(gx, gy, 5, 0, Math.PI * 2);
  constCtx.fill();
}

function constStep(timestamp) {
  if (!constPlaying) return;
  if (constStartTime === null) constStartTime = timestamp;
  const elapsed = (timestamp - constStartTime) / 1000;
  constCurrentT = Math.min(elapsed, constTMax);
  tSlider.value = constCurrentT;
  updateConstLabels();
  drawConstScene(constCurrentT);

  if (constCurrentT >= constTMax) {
    constPlaying = false;
    return;
  }
  requestAnimationFrame(constStep);
}

function playConstAccel() {
  constPlaying = false; // stop any run already in progress
  constV0 = parseFloat(v0Slider.value);
  constA = parseFloat(aSlider.value);
  constTMax = parseFloat(tSlider.value) || 5;
  if (constTMax <= 0) constTMax = 5;
  constStartTime = null;
  constCurrentT = 0;
  constPlaying = true;
  requestAnimationFrame(constStep);
}

function resetConstAccel() {
  constPlaying = false;
  constStartTime = null;
  v0Slider.value = 0;
  aSlider.value = 0;
  tSlider.value = 0;
  constV0 = 0;
  constA = 0;
  constCurrentT = 0;
  updateConstLabels();
  drawConstScene(0);
}

function toggleMath() {
  mathBox.style.display = (mathBox.style.display === 'none' || mathBox.style.display === '')
    ? 'block'
    : 'none';
}

drawConstScene(0);
