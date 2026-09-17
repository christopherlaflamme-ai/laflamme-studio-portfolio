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
