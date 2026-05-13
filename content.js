(() => {
  const SCALE = 4;
  const root = document.documentElement;

  let isActive = false;
  let previousTransform = "";
  let previousOrigin = "";
  let lastMouseX = window.innerWidth / 2;
  let lastMouseY = window.innerHeight / 2;

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

  document.addEventListener("mousemove", onMouseMove, true);

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== "TOGGLE_MAGNIFY") {
      return;
    }

    if (isActive) {
      deactivate();
      return;
    }

    activate();
  });
})();
