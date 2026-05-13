(() => {
  const SCALE = 4;
  const root = document.documentElement;

  let isActive = false;
  let previousTransform = "";
  let previousOrigin = "";

  const applyMagnification = (x, y) => {
    root.style.transformOrigin = `${x}px ${y}px`;
    root.style.transform = `scale(${SCALE})`;
  };

  const onMouseMove = (event) => {
    applyMagnification(event.clientX, event.clientY);
  };

  const deactivate = () => {
    if (!isActive) {
      return;
    }

    isActive = false;
    root.style.transform = previousTransform;
    root.style.transformOrigin = previousOrigin;
    document.removeEventListener("mousemove", onMouseMove, true);
    document.removeEventListener("click", onClickWhileActive, true);
  };

  const onClickWhileActive = () => {
    deactivate();
  };

  const activate = () => {
    if (isActive) {
      return;
    }

    isActive = true;
    previousTransform = root.style.transform;
    previousOrigin = root.style.transformOrigin;

    applyMagnification(window.innerWidth / 2, window.innerHeight / 2);
    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("click", onClickWhileActive, true);
  };

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
