(function () {
  var heroTargets = document.querySelectorAll(".hero-reveal");
  var scrollTargets = document.querySelectorAll(
    ".animation-reveal-1, .animation-reveal-2, .reveal-item"
  );

  function revealHero() {
    heroTargets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  if (heroTargets.length) {
    window.addEventListener("site:loaded", revealHero, { once: true });
    // If the loader script never fires (e.g. this page has no overlay),
    // reveal the hero content right away instead of waiting forever.
    if (!document.querySelector(".page-overlay")) {
      revealHero();
    }
  }

  if (!scrollTargets.length) return;

  if (!("IntersectionObserver" in window)) {
    scrollTargets.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  scrollTargets.forEach(function (el) {
    observer.observe(el);
  });
})();
