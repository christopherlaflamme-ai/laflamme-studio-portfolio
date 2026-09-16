module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/images");
  // NOTE: no passthrough copy for `admin/` here — Task 1 deletes the old
  // Webflow-only files under admin/, leaving the directory empty/absent
  // until Task 7 recreates it with the real Decap CMS files. Adding the
  // passthrough copy before the directory exists again risks an Eleventy
  // build error over a missing source path; Task 7 adds this line instead.

  eleventyConfig.addCollection("allProjects", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/projects/*.md")
  );
  eleventyConfig.addCollection("allCategories", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/categories/*.md")
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
