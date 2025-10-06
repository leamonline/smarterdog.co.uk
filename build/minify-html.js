const fs = require('fs').promises;
const path = require('path');
const minify = require('html-minifier').minify;

const htmlMinifyOptions = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: true
};

async function minifyHtmlFiles() {
  try {
    const rootDir = path.join(__dirname, '..');
    const files = await fs.readdir(rootDir);
    const htmlFiles = files.filter(file => file.endsWith('.html'));

    console.log(`Minifying ${htmlFiles.length} HTML files...`);

    for (const file of htmlFiles) {
      const filePath = path.join(rootDir, file);
      const html = await fs.readFile(filePath, 'utf8');

      // Update CSS/JS references to use minified versions
      const updated = html
        .replace(/styles\.css\?v=\d+/g, 'dist/css/styles.min.css')
        .replace(/script\.js/g, 'dist/js/script.min.js');

      const minified = minify(updated, htmlMinifyOptions);

      // Save to dist directory
      const distPath = path.join(rootDir, 'dist', file);
      await fs.mkdir(path.dirname(distPath), { recursive: true });
      await fs.writeFile(distPath, minified, 'utf8');

      console.log(`✓ Minified ${file}`);
    }

    console.log('✓ All HTML files minified');
  } catch (error) {
    console.error('Error minifying HTML:', error);
    process.exit(1);
  }
}

minifyHtmlFiles();
