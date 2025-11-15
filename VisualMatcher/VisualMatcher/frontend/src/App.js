import React, { useState, useEffect } from 'react';
import { Upload, Search, X, Filter, ShoppingBag, Laptop, Home, Dumbbell, Shirt } from 'lucide-react';
import './App.css';

const App = () => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [results, setResults] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [minSimilarity, setMinSimilarity] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('search');

  const API_BASE = 'http://localhost:3001';

  const categories = [
    { id: 'all', name: 'All Products', icon: ShoppingBag },
    { id: 'electronics', name: 'Electronics', icon: Laptop },
    { id: 'fashion', name: 'Fashion', icon: Shirt },
    { id: 'home', name: 'Home & Kitchen', icon: Home },
    { id: 'sports', name: 'Sports & Fitness', icon: Dumbbell }
  ];

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products || []);
        console.log(`📦 Loaded ${data.products.length} products`);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setImageUrl('');
      setError('');
    }
  };

  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    setError('');
  };

  const handleUrlSubmit = () => {
    if (imageUrl) {
      setPreviewUrl(imageUrl);
      setFile(null);
      setError('');
    }
  };

  const handleSearch = async () => {
    if (!file && !imageUrl) {
      setError('Please upload an image or provide an image URL');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const formData = new FormData();
      
      if (file) {
        formData.append('image', file);
        console.log('📤 Uploading file:', file.name);
      } else {
        formData.append('imageUrl', imageUrl);
        console.log('📤 Using image URL:', imageUrl);
      }

      const response = await fetch(`${API_BASE}/api/search`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('📥 Search response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Search failed');
      }

      if (data.results && data.results.length > 0) {
        setResults(data.results);
        // Keep tab as 'search' to show results
        setActiveTab('search');
        console.log(`✅ Found ${data.results.length} results`);
      } else {
        setError('No similar products found');
      }
    } catch (err) {
      console.error('❌ Search error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setFile(null);
    setImageUrl('');
    setPreviewUrl('');
    setResults([]);
    setError('');
  };

  // Filter results based on similarity and category
  const filteredResults = results.filter(result => {
    const meetsMinSimilarity = result.similarity >= minSimilarity;
    const meetsCategory = selectedCategory === 'all' || result.category === selectedCategory;
    return meetsMinSimilarity && meetsCategory;
  });

  // Filter products for browse tab
  const filteredProducts = products.filter(product => 
    selectedCategory === 'all' || product.category === selectedCategory
  );

  const CategoryIcon = ({ categoryId }) => {
    const category = categories.find(c => c.id === categoryId);
    const Icon = category?.icon || ShoppingBag;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-3">
            Visual Product Matcher
          </h1>
          <p className="text-gray-600 text-lg">AI-powered image search across {products.length}+ products</p>
        </header>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'search'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Search className="inline h-5 w-5 mr-2" />
            Search
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'browse'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag className="inline h-5 w-5 mr-2" />
            Browse Products
          </button>
        </div>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <>
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Upload Product Image
                  </label>
                  <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center hover:border-indigo-500 hover:bg-indigo-50 transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="mx-auto h-16 w-16 text-indigo-400 mb-3" />
                      <span className="text-sm text-gray-600 block">Click to upload or drag and drop</span>
                      <span className="text-xs text-gray-400 mt-1 block">PNG, JPG up to 10MB</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Or Paste Image URL
                  </label>
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={handleUrlChange}
                      placeholder="https://example.com/product-image.jpg"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleUrlSubmit}
                      className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition font-medium"
                    >
                      Load Image
                    </button>
                  </div>
                </div>
              </div>

              {previewUrl && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-80 rounded-xl shadow-lg"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handleSearch}
                disabled={loading || (!file && !imageUrl)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-3 font-semibold text-lg shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full" />
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <Search className="h-6 w-6" />
                    Find Similar Products
                  </>
                )}
              </button>
            </div>

            {/* Results Section - Now visible after search */}
            {results.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex flex-wrap gap-4 mb-6 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-indigo-600" />
                    <span className="font-semibold text-gray-800">Filters:</span>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Similarity:</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={minSimilarity}
                      onChange={(e) => setMinSimilarity(Number(e.target.value))}
                      className="w-32"
                    />
                    <span className="text-sm font-bold text-indigo-600 min-w-[50px]">{minSimilarity}%</span>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Category:</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    Showing {filteredResults.length} of {results.length} results
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-indigo-600">✨</span>
                  Similar Products ({filteredResults.length})
                </h2>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredResults.map((product) => (
                    <div key={product.id} className="group border-2 border-gray-100 rounded-xl overflow-hidden hover:shadow-2xl hover:border-indigo-300 transition-all duration-300">
                      <div className="relative overflow-hidden bg-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          {product.similarity}% match
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <CategoryIcon categoryId={product.category} />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {product.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-indigo-600">${product.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Browse Products Tab */}
        {activeTab === 'browse' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {cat.name}
                  </button>
                );
              })}
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {categories.find(c => c.id === selectedCategory)?.name} 
              <span className="text-indigo-600 ml-2">({filteredProducts.length})</span>
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group border-2 border-gray-100 rounded-xl overflow-hidden hover:shadow-2xl hover:border-indigo-300 transition-all duration-300">
                  <div className="relative overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <CategoryIcon categoryId={product.category} />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-indigo-600">${product.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;