require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('./Product');

async function generateSitemap() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        // Fetch all product IDs from MongoDB
        const products = await Product.find({}, 'id');
        
        const sitemapPath = path.join(__dirname, 'sitemap.xml');
        const baseUrl = 'https://shahabmobile.com/'; // Live domain

        let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}offers</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}installments</loc>
    <priority>0.8</priority>
  </url>
`;

        products.forEach(product => {
            sitemapXml += `  <url>
    <loc>${baseUrl}product/${product.id}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.7</priority>
  </url>
`;
        });

        sitemapXml += `</urlset>`;

        fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
        console.log('✅ sitemap.xml generated successfully!');
    } catch (err) {
        console.error('❌ Sitemap Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

generateSitemap();