(function () {
  const filterBar = document.getElementById("category-filter-bar");
  const grid = document.getElementById("project-grid");
  if (!filterBar || !grid) return;

  // Matches the .reveal-item transition duration in the stylesheet, so the
  // fade-out and the item's own scroll-reveal transition never disagree.
  const TRANSITION_MS = 1400;

  const buttons = Array.from(filterBar.querySelectorAll("[data-category]"));
  const items = Array.from(grid.querySelectorAll(".project-item"));
  const selected = new Set();
  let isFirstRun = true;

  function applyFilter() {
    items.forEach((item) => {
      const categories = (item.dataset.categories || "").split(",").filter(Boolean);
      const matches = selected.size === 0 || categories.some((c) => selected.has(c));

      if (isFirstRun) {
        item.hidden = !matches;
        return;
      }

      if (matches) {
        if (item.hidden) {
          item.classList.add("is-filtering");
          item.hidden = false;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              item.classList.remove("is-filtering");
            });
          });
        }
      } else if (!item.hidden) {
        item.classList.add("is-filtering");
        window.setTimeout(() => {
          item.hidden = true;
          item.classList.remove("is-filtering");
        }, TRANSITION_MS);
      }
    });
    buttons.forEach((btn) => {
      btn.classList.toggle("w--current", selected.has(btn.dataset.category));
    });
    isFirstRun = false;
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;
      if (selected.has(category)) {
        selected.delete(category);
      } else {
        selected.add(category);
      }
      applyFilter();
    });
  });

  applyFilter();
})();
