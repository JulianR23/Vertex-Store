const tsJest = require("ts-jest");

const tsJestTransformer = tsJest.default.createTransformer({
  tsconfig: "tsconfig.test.json",
  diagnostics: false,
});

module.exports = {
  process(sourceText, sourcePath, options) {
    const modified = sourceText.replace(/import\.meta\.env/g, "process.env");
    return tsJestTransformer.process(modified, sourcePath, options);
  },
  getCacheKey(sourceText, sourcePath, options) {
    return tsJestTransformer.getCacheKey(sourceText, sourcePath, options);
  },
};
