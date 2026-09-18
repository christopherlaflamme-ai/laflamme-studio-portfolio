(function () {
  var MIN_DISPLAY_MS = 700;
  var FALLBACK_MS = 4000;
  var start = Date.now();
  var hidden = false;

  function hideLoader() {
    if (hidden) return;
    hidden = true;

    var overlay = document.querySelector(".page-overlay");
    var elapsed = Date.now() - start;
    var wait = Math.max(0, MIN_DISPLAY_MS - elapsed);

    window.setTimeout(function () {
      document.documentElement.classList.remove("is-loading");
      if (overlay) overlay.classList.add("is-hidden");
      window.dispatchEvent(new CustomEvent("site:loaded"));
    }, wait);
  }

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader);
  }

  // Safety net: never let a slow or failed load event leave the overlay stuck.
  window.setTimeout(hideLoader, FALLBACK_MS);
})();
