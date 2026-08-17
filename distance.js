/* ============================================
   DISTANCE VS DISPLACEMENT
   Click/drag on the canvas to draw a path.
   Distance  = total length of everything you drew.
   Displacement = straight line from where you
                  started to where you let go.
   ============================================ */

(function () {
  const canvas = document.getElementById('dd-canvas');
  if (!canvas) return; // this section isn't on the page — do nothing

  const ctx = canvas.getContext('2d');
  const distanceEl = document.getElementById('dd-distance');
  const displacementEl = document.getElementById('dd-displacement');
  const playBtn = document.getElementById('dd-play');
  const resetBtn = document.getElementById('dd-reset');

  const PX_PER_M = 20; // pixels treated as "1 meter" for the displayed numbers

  let points = [];
  let drawing = false;
  let playTimer = null;

  function getPos(evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const cy = evt.touches ? evt.touches[0].clientY : evt.clientY;
    return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
  }

  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  function drawDot(p, color, r) {
    r = r || 7;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function render() {
    drawGrid();
    if (points.length === 0) return;

    // the path itself, in blue
    ctx.strokeStyle = '#5fd0ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();

    // dashed line = displacement, in orange
    if (points.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#f6a745';
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.stroke();
      ctx.restore();
    }

    drawDot(points[0], '#4caf50'); // start = green
    if (points.length > 1) drawDot(points[points.length - 1], '#f66546'); // end = red
  }

  function distance() {
    let d = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      d += Math.sqrt(dx * dx + dy * dy);
    }
    return d / PX_PER_M;
  }

  function displacement() {
    if (points.length < 2) return 0;
    const dx = points[points.length - 1].x - points[0].x;
    const dy = points[points.length - 1].y - points[0].y;
    return Math.sqrt(dx * dx + dy * dy) / PX_PER_M;
  }

  function updateStats() {
    distanceEl.textContent = 'Distance: ' + distance().toFixed(1) + ' m';
    displacementEl.textContent = 'Displacement: ' + displacement().toFixed(1) + ' m';
  }

  function start(evt) {
    clearInterval(playTimer);
    points = [getPos(evt)];
    drawing = true;
    render();
    updateStats();
    evt.preventDefault();
  }

  function move(evt) {
    if (!drawing) return;
    const p = getPos(evt);
    const last = points[points.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) > 3) {
      points.push(p);
      render();
      updateStats();
    }
    evt.preventDefault();
  }

  function stop() {
    drawing = false;
  }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', stop);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', stop);

  if (playBtn) {
    playBtn.addEventListener('click', function () {
      if (points.length < 2) return;
      clearInterval(playTimer);
      let i = 0;
      playTimer = setInterval(function () {
        render();
        drawDot(points[i], '#ffffff', 9);
        i++;
        if (i >= points.length) clearInterval(playTimer);
      }, 20);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      clearInterval(playTimer);
      points = [];
      drawGrid();
      distanceEl.textContent = 'Distance: 0 m';
      displacementEl.textContent = 'Displacement: 0 m';
    });
  }

  drawGrid();
})();