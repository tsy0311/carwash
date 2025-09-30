import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaSoap, FaSprayCan, FaPumpSoap, FaTint, FaWind, FaSpa } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import api from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  // Icon mapping for products
  const productIcons = {
    'Cleaning': FaSoap,
    'Detailing': FaSprayCan,
    'Protection': FaTint,
    'Accessories': FaWind,
    'Interior': FaSpa,
    'default': FaPumpSoap
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/products');
      setProducts(response.data.products);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/products/categories/list');
      setCategories(['All', ...response.data.categories]);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const categoryFiltered = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const filteredProducts = categoryFiltered.filter(p =>
    p.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-20">
        <div className="container">
          <div className="section-title">
            <h2>Our Products</h2>
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20">
        <div className="container">
          <div className="section-title">
            <h2>Our Products</h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const isSearching = searchQuery.trim().length > 0;
  return (
    <div className="py-20">
      <div className="container">
        <div className="section-title">
          <h2>Our Products</h2>
          <p>We use and sell only the highest quality detailing products from trusted brands like Koch Chemie.</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            className="form-control text-center"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isSearching && (
          <div className="text-center text-gray-600 mb-6">{filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found</div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(category => (
            <button
              key={category}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                selectedCategory === category 
                  ? 'bg-secondary text-white shadow-lg' 
                  : 'bg-gray-200 text-gray-700 hover:bg-secondary hover:text-white'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => {
            const IconComponent = productIcons[product.category] || productIcons.default;
            
            return (
              <div key={product.id} className="card">
                <div className="flex items-center justify-center h-32 bg-gradient-to-br from-secondary/10 to-secondary/20">
                  <IconComponent className="text-6xl text-secondary" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-3">{product.name}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{product.description}</p>
                  <div className="flex justify-between items-center mb-3 text-sm text-gray-500">
                    <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full">{product.category}</span>
                    <span>Stock: {product.stock}</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-4">Sold: {product.sold ?? 0}</div>
                  <div className="text-2xl font-bold text-primary mb-4">RM {product.price.toFixed(2)}</div>
                  <button 
                    className="btn w-full flex items-center justify-center gap-2"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <FaShoppingCart /> 
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found in the selected category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
