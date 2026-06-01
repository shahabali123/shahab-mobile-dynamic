const fs = require('fs');
const path = require('path');

// Path to your products.js file
const productsPath = path.join(__dirname, 'products.js');
// Path where sitemap.xml will be generated
const sitemapPath = path.join(__dirname, 'sitemap.xml');

// Dynamically load products.js to get the 'products' array
const productsContent = fs.readFileSync(productsPath, 'utf8');
let products = [];
// Execute the content of products.js in a temporary context
// This assumes products.js defines a global 'products' array.
eval(productsContent + '\n products = products;');

if (!Array.isArray(products)) {
    console.error('Error: Could not load products array from products.js. Ensure products.js defines a global "products" array.');
    process.exit(1);
}

const baseUrl = 'https://shahabmobile.netlify.app/'; // Apni website ka base URL yahan set karein

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}offers.html</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}installments.html</loc>
    <priority>0.8</priority>
  </url>
`;

products.forEach(product => {
    sitemapXml += `  <url>
    <loc>${baseUrl}product.html?id=${product.id}</loc>
    <priority>0.7</priority>
  </url>
`;
});

sitemapXml += `</urlset>`;

fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
console.log('sitemap.xml generated successfully with all product links!');