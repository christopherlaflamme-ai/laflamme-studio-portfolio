(function () {
  const filterBar = document.getElementById("category-filter-bar");
  const grid = document.getElementById("project-grid");
  if (!filterBar || !grid) return;

  const buttons = Array.from(filterBar.querySelectorAll("[data-category]"));
  const items = Array.from(grid.querySelectorAll(".project-item"));
  const selected = new Set();

  function applyFilter() {
    items.forEach((item) => {
      const categories = (item.dataset.categories || "").split(",").filter(Boolean);
      const matches = selected.size === 0 || categories.some((c) => selected.has(c));
      item.hidden = !matches;
    });
    buttons.forEach((btn) => {
      btn.classList.toggle("w--current", selected.has(btn.dataset.category));
    });
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
