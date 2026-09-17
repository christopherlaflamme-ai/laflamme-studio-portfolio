const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");

module.exports = async function () {
  const { sortProjects } = await import("../../lib/sortProjects.mjs");
  const dir = path.join(__dirname, "..", "projects");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  const projects = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data } = matter(raw);
    // Derive slug from the filename rather than trusting a `slug` front-matter
    // field: Decap CMS names the file correctly via its collection-level
    // `slug: "{{slug}}"` setting, but does not reliably substitute `{{slug}}`
    // inside an arbitrary hidden field's `default` value (confirmed via a
    // live CMS test — see admin/config.yml history).
    data.slug = path.basename(file, ".md");
    return { data };
  });
  return sortProjects(projects.map((p) => p.data)).map((data) => ({
    data,
    url: `/projects/${data.slug}.html`,
  }));
};
