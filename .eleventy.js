module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("admin");

  eleventyConfig.addCollection("allProjects", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/projects/*.md")
  );
  eleventyConfig.addCollection("allCategories", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/categories/*.md")
  );

  eleventyConfig.addFilter("featuredOnly", (projects) =>
    (projects || []).filter((p) => p.data.featured)
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
};
