// components/InventoryUpdate.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const InventoryUpdate = () => {
  const { productId } = useParams();
  const [inventory, setInventory] = useState(null);
  const [updates, setUpdates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`/api/inventory/${productId}`);
        const data = await response.json();
        setInventory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, [productId]);

  const handleQuantityChange = (variantIndex, newQuantity) => {
    setUpdates(prev => ({
      ...prev,
      [variantIndex]: Math.max(0, parseInt(newQuantity) || 0)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/inventory/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variants: Object.entries(updates).map(([index, quantity]) => ({
            color: inventory.variants[index].color,
            size: inventory.variants[index].size,
            quantity
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Update failed');
      }

      const updatedInventory = await response.json();
      setInventory(updatedInventory);
      setUpdates({});
      alert('Inventory updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading inventory...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!inventory) return <div>Inventory not found</div>;

  return (
    <div className="inventory-update">
      <h2>Update Inventory</h2>
      <form onSubmit={handleSubmit}>
        <table>
          <thead>
            <tr>
              <th>Color</th>
              <th>Size</th>
              <th>Current Stock</th>
              <th>New Stock</th>
            </tr>
          </thead>
          <tbody>
            {inventory.variants.map((variant, index) => (
              <tr key={`${variant.color}-${variant.size}`}>
                <td>{variant.color}</td>
                <td>{variant.size}</td>
                <td>{variant.quantity}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={updates[index] !== undefined ? updates[index] : variant.quantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="submit" disabled={isLoading || Object.keys(updates).length === 0}>
          {isLoading ? 'Updating...' : 'Update Inventory'}
        </button>
      </form>
    </div>
  );
};

export default InventoryUpdate;