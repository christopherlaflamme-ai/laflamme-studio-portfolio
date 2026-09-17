export function sortProjects(projects) {
  return projects.slice().sort((a, b) => {
    const aFeatured = a.featured ? 1 : 0;
    const bFeatured = b.featured ? 1 : 0;
    if (aFeatured !== bFeatured) return bFeatured - aFeatured;

    if (aFeatured && bFeatured) {
      const aOrder = a.featured_order ?? Infinity;
      const bOrder = b.featured_order ?? Infinity;
      if (aOrder !== bOrder) return aOrder - bOrder;
    }

    return (b.year || 0) - (a.year || 0);
  });
}
