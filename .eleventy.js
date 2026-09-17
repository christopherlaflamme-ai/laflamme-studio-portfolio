module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("admin");

  eleventyConfig.addCollection("allCategories", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/categories/*.md")
  );

  eleventyConfig.addFilter("featuredOnly", (projects) =>
    (projects || []).filter((p) => p.data.featured)
  );

  // Computes each project page's permalink from its actual filename (via a
  // plain JS function, not a templated string) rather than trusting a
  // `permalink`/`slug` value written into front matter. This is required
  // because `markdownTemplateEngine: false` (below) disables template-string
  // processing for .md files entirely, including front-matter fields — and
  // separately, Decap CMS does not reliably substitute `{{slug}}` inside an
  // arbitrary hidden field's default anyway (confirmed via a live test).
  // Eleventy's own `page.fileSlug`, by contrast, is always correct since it
  // comes directly from the real filename Decap wrote.
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: (data) => {
      if (data.page.inputPath.includes("/src/projects/")) {
        return `/projects/${data.page.fileSlug}.html`;
      }
      return data.permalink;
    },
  });

  return {
    // Project descriptions come from the CMS as Markdown; rendering them
    // through a template engine would try to parse literal `{{`/`{%` in
    // author-written copy and fail the build.
    markdownTemplateEngine: false,
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
};
