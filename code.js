  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  let points = [];
  let drawing = false;
  let playing = false;
  let animIndex = 0;

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  canvas.addEventListener("mousedown", (e) => {
    if (playing) return;
    drawing = true;
    points = [];
    points.push(getMousePos(e));
    draw();
    updateValues();
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!drawing || playing) return;
    const pos = getMousePos(e);

    const last = points[points.length - 1];
    const minDist = 2; // prevents oversampling jitter

    if (Math.hypot(pos.x - last.x, pos.y - last.y) > minDist) {
      points.push(pos);
      draw();
      updateValues();
    }
  });

  canvas.addEventListener("mouseup", () => {
    drawing = false;
  });

  canvas.addEventListener("mouseleave", () => {
    drawing = false;
  });

  function distanceBetween(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }

  function totalDistance() {
    let d = 0;
    for (let i = 1; i < points.length; i++) {
      d += distanceBetween(points[i - 1], points[i]);
    }
    return d;
  }

  function displacement() {
    if (points.length < 2) return 0;
    return distanceBetween(points[0], points[points.length - 1]);
  }

  function updateValues() {
    document.getElementById("distance").textContent =
      `Distance: ${totalDistance().toFixed(1)} m`;

    document.getElementById("displacement").textContent =
      `Displacement: ${displacement().toFixed(1)} m`;
  }

  function drawGrid() {
    ctx.strokeStyle = "#1f2540";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    // Path (distance)
    if (points.length > 1) {
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (const p of points) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    // Displacement arrow
    if (points.length > 1) {
      const start = points[0];
      const end = points[points.length - 1];
      ctx.strokeStyle = "#6cf";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    // Start point
    if (points.length > 0) {
      ctx.fillStyle = "#2ecc71";
      ctx.beginPath();
      ctx.arc(points[0].x, points[0].y, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // End point
    if (points.length > 1) {
      const end = points[points.length - 1];
      ctx.fillStyle = "#e74c3c";
      ctx.beginPath();
      ctx.arc(end.x, end.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function playPath() {
    if (points.length < 2) return;
    playing = true;
    animIndex = 0;

    function animate() {
      draw();

      if (animIndex < points.length) {
        const p = points[animIndex];
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fill();
        animIndex++;
        requestAnimationFrame(animate);
      } else {
        playing = false;
      }
    }

    animate();
  }

  function resetPath() {
    points = [];
    playing = false;
    updateValues();
    draw();
  }

  draw();



  // ===== ACCELERATION SECTION =====
(function () {
  const canvas = document.getElementById("accelCanvas");
  if (!canvas) return; // prevents errors if section isn't on page

  const ctx = canvas.getContext("2d");

  let x = canvas.width / 2;
  let v = 0;
  let a = 0;

  let playing = false;
  let lastTime = null;

  const slider = document.getElementById("accelSlider");
  const accelVal = document.getElementById("accelVal");

  slider.addEventListener("input", () => {
    a = parseFloat(slider.value);
    accelVal.textContent = a.toFixed(1);
  });

  function resetMotion() {
    x = canvas.width / 2;
    v = 0;
    playing = false;
    lastTime = null;
    draw();
  }

  function togglePlay() {
    playing = !playing;
    if (playing) requestAnimationFrame(update);
  }

  function update(timestamp) {
    if (!playing) return;

    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    v += a * dt;
    x += v * 60 * dt;

    x = Math.max(20, Math.min(canvas.width - 20, x));

    draw();
    requestAnimationFrame(update);
  }

  function drawArrow(x, y, length, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + length, y);
    ctx.lineTo(x + length - Math.sign(length) * 10, y - 6);
    ctx.lineTo(x + length - Math.sign(length) * 10, y + 6);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#1f2540";
    ctx.beginPath();
    ctx.moveTo(40, canvas.height / 2 + 30);
    ctx.lineTo(canvas.width - 40, canvas.height / 2 + 30);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, canvas.height / 2, 12, 0, Math.PI * 2);
    ctx.fill();

    drawArrow(x, canvas.height / 2 - 30, v * 10, "#ffd166");
    drawArrow(x, canvas.height / 2 - 60, a * 40, "#6cf");
  }

  // Expose only what HTML needs
  window.togglePlay = togglePlay;
  window.resetMotion = resetMotion;

  draw();
})();


(function () {
  const canvas = document.getElementById("constAccelCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const v0Slider = document.getElementById("v0Slider");
  const aSlider = document.getElementById("aSlider");
  const tSlider = document.getElementById("tSlider");

  const v0Val = document.getElementById("v0Val");
  const aVal = document.getElementById("aVal");
  const tVal = document.getElementById("tVal");

  const mathBox = document.getElementById("mathBox");

  let x0 = canvas.width / 2;
  let x = x0;
  let v0 = 0;
  let a = 0;
  let t = 0;

  let playing = false;
  let lastTime = null;

  function updateFromSliders() {
    v0 = parseFloat(v0Slider.value);
    a = parseFloat(aSlider.value);
    t = parseFloat(tSlider.value);

    v0Val.textContent = v0.toFixed(1);
    aVal.textContent = a.toFixed(1);
    tVal.textContent = t.toFixed(1);

const rawX = x0 + (v0 * t + 0.5 * a * t * t) * 20;
x = Math.max(40, Math.min(canvas.width - 40, rawX));    draw();
  }

  v0Slider.addEventListener("input", updateFromSliders);
  aSlider.addEventListener("input", updateFromSliders);
  tSlider.addEventListener("input", updateFromSliders);

  function playConstAccel() {
    playing = true;
    lastTime = null;
    t = 0;
    tSlider.value = 0;
    requestAnimationFrame(animate);
  }

  function resetConstAccel() {
    playing = false;
    t = 0;
    x = x0;
    tSlider.value = 0;
    draw();
  }

  function toggleMath() {
    mathBox.style.display =
      mathBox.style.display === "none" ? "block" : "none";
  }

  function animate(timestamp) {
    if (!playing) return;

    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    t += dt;
    tSlider.value = t.toFixed(1);
    tVal.textContent = t.toFixed(1);

const rawX = x0 + (v0 * t + 0.5 * a * t * t) * 20;
x = Math.max(40, Math.min(canvas.width - 40, rawX));
    draw();
    requestAnimationFrame(animate);
  }

  function drawArrow(x, y, length, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + length, y);
    ctx.lineTo(x + length - Math.sign(length) * 10, y - 6);
    ctx.lineTo(x + length - Math.sign(length) * 10, y + 6);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Track
    ctx.strokeStyle = "#1f2540";
    ctx.beginPath();
    ctx.moveTo(40, canvas.height / 2 + 30);
    ctx.lineTo(canvas.width - 40, canvas.height / 2 + 30);
    ctx.stroke();

    // Object
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, canvas.height / 2, 12, 0, Math.PI * 2);
    ctx.fill();

    // Velocity arrow
    const v = v0 + a * t;
    drawArrow(x, canvas.height / 2 - 30, v * 8, "#ffd166");

    // Acceleration arrow (constant)
    drawArrow(x, canvas.height / 2 - 60, a * 40, "#6cf");
  }

  // Expose minimal API
  window.playConstAccel = playConstAccel;
  window.resetConstAccel = resetConstAccel;
  window.toggleMath = toggleMath;

  updateFromSliders();
})();