(() => {
  const SCALE = 4;
  const root = document.documentElement;

  let isActive = false;
  let previousTransform = "";
  let previousOrigin = "";
  let lastMouseX = window.innerWidth / 2;
  let lastMouseY = window.innerHeight / 2;
  let lastRightDownTime = 0;
  let lastRightDownX = 0;
  let lastRightDownY = 0;
  let suppressNextContextMenu = false;

  const DOUBLE_CLICK_MS = 350;
  const MAX_MOVE_PX = 24;

  const applyMagnification = (x, y) => {
    root.style.transformOrigin = `${x}px ${y}px`;
    root.style.transform = `scale(${SCALE})`;
  };

  const onMouseMove = (event) => {
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    if (isActive) {
      applyMagnification(event.clientX, event.clientY);
    }
  };

  const deactivate = () => {
    if (!isActive) {
      return;
    }

    isActive = false;
    root.style.transform = previousTransform;
    root.style.transformOrigin = previousOrigin;
    document.removeEventListener("click", deactivate, true);
  };

  const activate = () => {
    if (isActive) {
      return;
    }

    isActive = true;
    previousTransform = root.style.transform;
    previousOrigin = root.style.transformOrigin;

    applyMagnification(lastMouseX, lastMouseY);
    document.addEventListener("click", deactivate, true);
  };

  const onMouseDown = (event) => {
    if (event.button !== 2) {
      return;
    }

    const now = Date.now();
    const dx = event.clientX - lastRightDownX;
    const dy = event.clientY - lastRightDownY;
    const distance = Math.hypot(dx, dy);
    const isRightDoubleClick =
      now - lastRightDownTime <= DOUBLE_CLICK_MS && distance <= MAX_MOVE_PX;

    lastRightDownTime = now;
    lastRightDownX = event.clientX;
    lastRightDownY = event.clientY;

    if (!isRightDoubleClick) {
      return;
    }

    suppressNextContextMenu = true;

    if (isActive) {
      deactivate();
      return;
    }

    activate();
  };

  const onContextMenu = (event) => {
    if (!suppressNextContextMenu) {
      return;
    }

    suppressNextContextMenu = false;
    event.preventDefault();
  };

  document.addEventListener("mousemove", onMouseMove, true);
  document.addEventListener("mousedown", onMouseDown, true);
  document.addEventListener("contextmenu", onContextMenu, true);
})();
