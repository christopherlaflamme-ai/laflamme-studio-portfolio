// NOTE: `src/js/portfolio-filter.js` holds a manually-kept-in-sync client-side port of this same OR-matching logic — change one, check the other.
export function filterProjectsByCategories(projects, selected) {
  if (!selected || selected.length === 0) return projects;
  const selectedSet = new Set(selected);
  return projects.filter((project) =>
    (project.categories || []).some((category) => selectedSet.has(category))
  );
}
