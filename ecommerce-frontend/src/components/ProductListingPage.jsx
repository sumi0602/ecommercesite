import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useInventory } from "../contexts/InventoryContext";

const ProductListingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { fetchInventory } = useInventory();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/products");

        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();

        const results = await Promise.allSettled(
          data.map((product) => fetchInventory(product._id))
        );

        const productsWithInventory = data.map((product, index) => ({
          ...product,
          inventory:
            results[index].status === "fulfilled" ? results[index].value : null,
        }));

        setProducts(productsWithInventory);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [fetchInventory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-700">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">All Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductListingPage;
