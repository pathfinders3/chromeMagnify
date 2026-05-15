(() => {
  const LENS_W = 800;
  const LENS_H = 400;
  const SCALE = 3;
  const DOUBLE_CLICK_MS = 350;
  const MAX_MOVE_PX = 24;

  let isActive = false;
  let lastMouseX = window.innerWidth / 2;
  let lastMouseY = window.innerHeight / 2;
  let lastRightDownTime = 0;
  let lastRightDownX = 0;
  let lastRightDownY = 0;
  let suppressNextContextMenu = false;
  let lensCanvas = null;
  let lensCtx = null;
  let screenshotImg = null;

  const createLens = () => {
    lensCanvas = document.createElement("canvas");
    lensCanvas.width = LENS_W;
    lensCanvas.height = LENS_H;
    Object.assign(lensCanvas.style, {
      position: "fixed",
      width: LENS_W + "px",
      height: LENS_H + "px",
      border: "2px solid #444",
      borderRadius: "6px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
      pointerEvents: "none",
      zIndex: "2147483647",
    });
    document.documentElement.appendChild(lensCanvas);
    lensCtx = lensCanvas.getContext("2d");
  };

  const removeLens = () => {
    lensCanvas?.remove();
    lensCanvas = null;
    lensCtx = null;
    screenshotImg = null;
  };

  const positionLens = (mx, my) => {
    if (!lensCanvas) return;
    // 커서 위에 렌즈 표시; 화면 위쪽 여백 부족 시 커서 아래로
    let lx = mx - LENS_W / 2;
    let ly = my - LENS_H - 16;
    if (ly < 0) ly = my + 16;
    lx = Math.max(0, Math.min(window.innerWidth - LENS_W, lx));
    ly = Math.max(0, Math.min(window.innerHeight - LENS_H, ly));
    lensCanvas.style.left = lx + "px";
    lensCanvas.style.top = ly + "px";
  };

  const drawLens = (mx, my) => {
    if (!lensCtx) return;
    lensCtx.clearRect(0, 0, LENS_W, LENS_H);

    if (!screenshotImg) {
      lensCtx.fillStyle = "rgba(0,0,0,0.75)";
      lensCtx.fillRect(0, 0, LENS_W, LENS_H);
      lensCtx.fillStyle = "#fff";
      lensCtx.font = "13px sans-serif";
      lensCtx.textAlign = "center";
      lensCtx.textBaseline = "middle";
      lensCtx.fillText("캡처 중...", LENS_W / 2, LENS_H / 2);
      return;
    }

    // 화면 캡처 이미지는 devicePixelRatio 배율로 저장됨
    const dpr = window.devicePixelRatio || 1;
    // 렌즈가 보여줄 원본 CSS 픽셀 영역: LENS_W/SCALE × LENS_H/SCALE
    const srcCssW = LENS_W / SCALE;
    const srcCssH = LENS_H / SCALE;
    const srcX = (mx - srcCssW / 2) * dpr;
    const srcY = (my - srcCssH / 2) * dpr;

    lensCtx.drawImage(
      screenshotImg,
      srcX, srcY, srcCssW * dpr, srcCssH * dpr,
      0, 0, LENS_W, LENS_H
    );

    // 십자선
    lensCtx.strokeStyle = "rgba(255, 70, 70, 0.65)";
    lensCtx.lineWidth = 1;
    lensCtx.beginPath();
    lensCtx.moveTo(LENS_W / 2, 0);
    lensCtx.lineTo(LENS_W / 2, LENS_H);
    lensCtx.moveTo(0, LENS_H / 2);
    lensCtx.lineTo(LENS_W, LENS_H / 2);
    lensCtx.stroke();
  };

  const deactivate = () => {
    if (!isActive) return;
    isActive = false;
    removeLens();
    document.removeEventListener("click", deactivate, true);
  };

  const activate = () => {
    if (isActive) return;
    isActive = true;
    screenshotImg = null;

    chrome.runtime.sendMessage({ type: "CAPTURE_TAB" }, (response) => {
      if (!isActive) return;
      if (!response?.dataUrl) {
        deactivate();
        return;
      }
      const img = new Image();
      img.onload = () => {
        if (!isActive) return;
        screenshotImg = img;
        if (!lensCanvas) createLens();
        positionLens(lastMouseX, lastMouseY);
        drawLens(lastMouseX, lastMouseY);
      };
      img.onerror = () => {
        if (!isActive) return;
        deactivate();
      };
      img.src = response.dataUrl;
    });

    document.addEventListener("click", deactivate, true);
  };

  const onMouseMove = (event) => {
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    if (isActive) {
      positionLens(event.clientX, event.clientY);
      drawLens(event.clientX, event.clientY);
    }
  };

  const onMouseDown = (event) => {
    if (event.button !== 2) return;

    const now = Date.now();
    const dx = event.clientX - lastRightDownX;
    const dy = event.clientY - lastRightDownY;
    const isRightDoubleClick =
      now - lastRightDownTime <= DOUBLE_CLICK_MS &&
      Math.hypot(dx, dy) <= MAX_MOVE_PX;

    lastRightDownTime = now;
    lastRightDownX = event.clientX;
    lastRightDownY = event.clientY;

    if (!isRightDoubleClick) return;

    suppressNextContextMenu = true;
    isActive ? deactivate() : activate();
  };

  const onContextMenu = (event) => {
    if (!suppressNextContextMenu) return;
    suppressNextContextMenu = false;
    event.preventDefault();
  };

  document.addEventListener("mousemove", onMouseMove, true);
  document.addEventListener("mousedown", onMouseDown, true);
  document.addEventListener("contextmenu", onContextMenu, true);
})();
