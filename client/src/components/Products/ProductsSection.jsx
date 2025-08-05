import React, { useState, useEffect } from 'react';
import Card from '../Card';
import LoadingSpinner from '../LoadingSpinner';

const ProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product) => setCart([...cart, product]);
  const removeFromCart = () => setCart([]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <section className="p-6">
      <h2 className="section-title">Fitness Products</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {products.length > 0
          ? products.map(product => (
              <Card
                key={product.id}
                type="product"
                data={product}
                onAction={() => addToCart(product)}
              />
            ))
          : <div>No products found.</div>
        }
      </div>

      {cart.length > 0 && (
        <div className="cart-summary">
          <p>{cart.length} item(s) in cart</p>
          <button onClick={removeFromCart} className="btn btn-danger">
            Clear Cart
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductsSection;
