export function filterProjectsByCategories(projects, selected) {
  if (!selected || selected.length === 0) return projects;
  const selectedSet = new Set(selected);
  return projects.filter((project) =>
    (project.categories || []).some((category) => selectedSet.has(category))
  );
}
