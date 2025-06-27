import useApi from '../../hooks/useApi';
import { useAppContext } from '../../contexts/AppContext';
import Card from '../Card';
import LoadingSpinner from '../LoadingSpinner';

const ProductsSection = () => {
  const { data, loading, error } = useApi('/api/products');
  const { cart, addToCart, removeFromCart } = useAppContext();

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error: {error}</div>;

  const products = data?.products || []; // <-- extract the array

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
        <div className="flex justify-end">
          <button
            onClick={removeFromCart}
            className="btn btn-danger"
          >
            Clear Cart
          </button>
        </div>
      )}
    </section>
  );
};


export default ProductsSection;