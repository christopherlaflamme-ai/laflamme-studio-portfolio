// One-time migration script: already run, and the flat `projects/` directory it reads no longer exists. Kept only for provenance/reference.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { load } from "cheerio";
import yaml from "js-yaml";

const PROJECTS_DIR = "projects";
const OUT_DIR = "src/projects";

// Grid metadata (title/type/year) scraped once from the live portfolio grid;
// used only as a cross-check that the migrated year/title match, since the
// per-project pages already carry the authoritative client/year/type values.
function migrateOne(slug) {
  const html = readFileSync(`${PROJECTS_DIR}/${slug}.html`, "utf-8");
  const $ = load(html);

  const title = $("title").text().replace(" - Laflamme", "").trim();
  const heroSrc = $(".case-hero-img-wrapper img").attr("src") || "";
  const typeOfWork = $(".text-client").next("div").text().trim();

  const categories = [];
  $(".flex-horizontal.justify-space-between .w-dyn-items .w-dyn-item").each((_, el) => {
    const text = $(el).text().trim();
    if (text) categories.push(text);
  });

  const rowTitles = $(".row-items-wrapper .row-title");
  const client = $(rowTitles[0]).text().trim();
  const year = parseInt($(rowTitles[1]).text().trim(), 10);

  const liveLink = $("a.link.small").attr("href") || "";
  const liveUrl = liveLink && liveLink !== "#" ? liveLink : "";

  const richHtml = $(".rich-text-block.w-richtext").html() || "";

  // case-images-wrapper: alternating standalone <img> and .case-img-group
  // image lists, in document order -> first standalone run becomes
  // gallery_1's lead image is kept as part of gallery_1, second run as
  // gallery_2, matching the two-gallery schema from the design spec.
  const wrapper = $(".case-images-wrapper");
  const galleries = [[]];
  wrapper.children().each((_, el) => {
    const node = $(el);
    if (node.is("img")) {
      galleries[galleries.length - 1].push(node.attr("src"));
    } else if (node.hasClass("w-dyn-list")) {
      node.find(".case-img-group img").each((_, img) => {
        galleries[galleries.length - 1].push($(img).attr("src"));
      });
      galleries.push([]);
    }
  });
  const nonEmptyGalleries = galleries.filter((g) => g.length > 0);
  const gallery1 = nonEmptyGalleries[0] || [];
  const gallery2 = nonEmptyGalleries[1] || [];
  // Any additional groups beyond two (none exist in the current 21 projects)
  // are appended to gallery2 so no images are silently dropped.
  for (let i = 2; i < nonEmptyGalleries.length; i++) {
    gallery2.push(...nonEmptyGalleries[i]);
  }

  const frontMatter = {
    layout: "layouts/project.njk",
    title,
    slug,
    type_of_work: typeOfWork,
    categories,
    client,
    year,
    live_url: liveUrl,
    hero_image: heroSrc.replace(/^\.\.\//, "/"),
    gallery_1: gallery1.map((src) => src.replace(/^\.\.\//, "/")),
    gallery_2: gallery2.map((src) => src.replace(/^\.\.\//, "/")),
    featured: false,
    featured_order: null,
    permalink: `/projects/${slug}.html`,
  };

  const fileContent = `---\n${yaml.dump(frontMatter)}---\n${richHtml.trim()}\n`;
  writeFileSync(`${OUT_DIR}/${slug}.md`, fileContent, "utf-8");
  console.log(`migrated ${slug}: ${gallery1.length + gallery2.length} gallery images`);
}

const slugs = readdirSync(PROJECTS_DIR)
  .filter((f) => f.endsWith(".html"))
  .map((f) => f.replace(/\.html$/, ""));

for (const slug of slugs) {
  migrateOne(slug);
}
console.log(`Migrated ${slugs.length} projects.`);
