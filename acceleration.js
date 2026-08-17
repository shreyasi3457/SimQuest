
(function () {
  const canvas = document.getElementById('acc-canvas');
  if (!canvas) return; 

  const ctx = canvas.getContext('2d');
  const valEl = document.getElementById('acc-val');
  const slider = document.getElementById('acc-slider');
  const playBtn = document.getElementById('acc-play');
  const resetBtn = document.getElementById('acc-reset');

  const PX_PER_M = 40;     
  const CONST_V = 2;      
  const START_V = 2;           
  const TRACK_LEFT = 40;
  const TRACK_RIGHT = canvas.width - 40;
  const TRACK_LEN_M = (TRACK_RIGHT - TRACK_LEFT) / PX_PER_M;

  const TRACK_Y_CONST = 90;   
  const TRACK_Y_ACCEL = 210; 

  let accel = 0;
  let playing = false;
  let lastTime = null;

  let xConstM = 0;   
  let xAccelM = 0;  
  let vAccel = START_V;

  slider.addEventListener('input', () => {
    accel = parseFloat(slider.value);
    valEl.textContent = accel.toFixed(1);
  });

  function wrap(x, max) {
    return ((x % max) + max) % max;
  }

  function drawArrow(x, y, lengthPx, color) {
    if (Math.abs(lengthPx) < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + lengthPx, y);
    ctx.stroke();

    const dir = Math.sign(lengthPx);
    ctx.beginPath();
    ctx.moveTo(x + lengthPx, y);
    ctx.lineTo(x + lengthPx - dir * 8, y - 6);
    ctx.lineTo(x + lengthPx - dir * 8, y + 6);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- track lines ---
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    [TRACK_Y_CONST, TRACK_Y_ACCEL].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(TRACK_LEFT, y);
      ctx.lineTo(TRACK_RIGHT, y);
      ctx.stroke();
    });

    // --- labels ---
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#8be08b';
    ctx.fillText('Constant velocity', TRACK_LEFT, TRACK_Y_CONST - 45);
    ctx.fillStyle = '#5fd0ff';
    ctx.fillText('Your object', TRACK_LEFT, TRACK_Y_ACCEL - 45);

    // --- green object (constant velocity) ---
    const pxConst = TRACK_LEFT + wrap(xConstM, TRACK_LEN_M) * PX_PER_M;
    ctx.beginPath();
    ctx.fillStyle = '#4caf50';
    ctx.arc(pxConst, TRACK_Y_CONST, 13, 0, Math.PI * 2);
    ctx.fill();
    drawArrow(pxConst, TRACK_Y_CONST - 25, CONST_V * 15, '#8be08b');

    // --- blue object (your acceleration) ---
    const pxAccel = TRACK_LEFT + wrap(xAccelM, TRACK_LEN_M) * PX_PER_M;
    ctx.beginPath();
    ctx.fillStyle = '#5fd0ff';
    ctx.arc(pxAccel, TRACK_Y_ACCEL, 13, 0, Math.PI * 2);
    ctx.fill();
    drawArrow(pxAccel, TRACK_Y_ACCEL - 25, vAccel * 15, '#5fd0ff');

    // --- readouts ---
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#eaeaf0';
    ctx.fillText(`v = ${CONST_V.toFixed(1)} m/s`, TRACK_LEFT, TRACK_Y_CONST + 35);
    ctx.fillText(`v = ${vAccel.toFixed(1)} m/s`, TRACK_LEFT, TRACK_Y_ACCEL + 35);

    // --- who's ahead ---
    const gap = xAccelM - xConstM;
    let gapText;
    if (Math.abs(gap) < 0.05) gapText = "They're tied!";
    else if (gap > 0) gapText = `Blue is ahead by ${gap.toFixed(1)} m`;
    else gapText = `Blue is behind by ${Math.abs(gap).toFixed(1)} m`;

    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#f6a745';
    ctx.fillText(gapText, TRACK_LEFT, 270);
  }

  function step(timestamp) {
    if (!playing) return;
    if (lastTime === null) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    xConstM += CONST_V * dt;
    vAccel += accel * dt;
    xAccelM += vAccel * dt;

    drawScene();
    requestAnimationFrame(step);
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      playing = !playing;
      lastTime = null;
      if (playing) requestAnimationFrame(step);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      playing = false;
      lastTime = null;
      xConstM = 0;
      xAccelM = 0;
      vAccel = START_V;
      drawScene();
    });
  }

  drawScene();
})();
