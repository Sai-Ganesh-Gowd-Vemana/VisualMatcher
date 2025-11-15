const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Load products from JSON
const productsPath = path.join(__dirname, 'product.json');
let products = [];

try {
  const rawData = fs.readFileSync(productsPath, 'utf-8');
  products = JSON.parse(rawData);
  console.log(`✅ Loaded ${products.length} products`);
} catch (err) {
  console.error('❌ Error loading products:', err);
  products = [];
}

// Generate consistent hash for similarity
function stringToHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Generate fake similarity score (0-100)
function generateSimilarity(inputString, productId, category) {
  const combined = `${inputString}-${productId}-${category}`;
  const hash = stringToHash(combined);
  
  // Make certain categories more similar to certain inputs
  let baseSimilarity = 50;
  
  // Add some category-based bias for more realistic results
  if (inputString.toLowerCase().includes('headphone') && category === 'electronics') baseSimilarity += 20;
  if (inputString.toLowerCase().includes('shoe') && category === 'fashion') baseSimilarity += 20;
  if (inputString.toLowerCase().includes('lamp') && category === 'home') baseSimilarity += 20;
  if (inputString.toLowerCase().includes('sport') && category === 'sports') baseSimilarity += 20;
  
  const score = baseSimilarity + (hash % 51); // Add 0-50
  return Math.min(score, 100); // Cap at 100
}

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Visual Product Matcher API is running!',
    loadedProducts: products.length 
  });
});

// Get all products
app.get('/api/products', (req, res) => {
  res.json({ 
    success: true,
    count: products.length,
    products: products 
  });
});

// Search for similar products
app.post('/api/search', upload.single('image'), (req, res) => {
  try {
    const file = req.file;
    const imageUrl = req.body.imageUrl;
    
    if (!file && !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an image file or image URL',
        results: []
      });
    }
    
    // Create input string for similarity generation
    const inputKey = file 
      ? (file.originalname || file.mimetype || 'uploaded-file')
      : imageUrl || 'no-url';
    
    console.log(`🔍 Searching with input: ${inputKey}`);
    
    // Generate results with similarity scores
    const results = products.map(product => {
      const similarity = generateSimilarity(
        inputKey, 
        product.id, 
        product.category
      );
      
      return {
        ...product,
        similarity: Math.round(similarity)
      };
    });
    
    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity);
    
    console.log(`📊 Generated ${results.length} results`);
    console.log(`📈 Similarity range: ${results[results.length-1]?.similarity}% - ${results[0]?.similarity}%`);
    
    res.json({
      success: true,
      query: inputKey,
      count: results.length,
      results: results
    });
    
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      results: []
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Loaded ${products.length} products`);
});