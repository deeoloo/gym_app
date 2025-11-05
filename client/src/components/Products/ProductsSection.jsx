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
  if (error)
    return (
      <div className="mx-auto max-w-5xl my-6 rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3">
        Error: {error}
      </div>
    );

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-green-800 mb-6">
        Fitness Products
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {products.length > 0 ? (
          products.map((product) => (
            <Card
              key={product.id}
              type="product"
              data={product}
              onAction={() => addToCart(product)}
            />
          ))
        ) : (
          <div className="col-span-full rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm p-6 text-center">
            No products found.
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="flex items-center justify-between gap-4 bg-white border border-gray-100 rounded-2xl shadow-md px-4 py-3">
          <p className="text-gray-800">
            <span className="font-semibold text-green-700">{cart.length}</span>{' '}
            item(s) in cart
          </p>
          <button
            onClick={removeFromCart}
            className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-white font-semibold shadow-md hover:bg-orange-600 transition"
          >
            Clear Cart
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductsSection;
