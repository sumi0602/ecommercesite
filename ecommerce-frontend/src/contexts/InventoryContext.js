import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState({});

  // Memoize fetchInventory so it is stable between renders
  const fetchInventory = useCallback(async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/inventory/${productId}`
      );
      console.log(response.json);
      const data = await response.json();
      setInventory((prev) => ({ ...prev, [productId]: data }));
      return data;
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    }
  }, []);

  const getAvailableVariants = useCallback(
    (productId) => {
      return inventory[productId]?.variants || [];
    },
    [inventory]
  );

  const checkStock = useCallback(
    (productId, color, size) => {
      const variants = getAvailableVariants(productId);
      const variant = variants.find(
        (v) => v.color === color && v.size === size
      );
      return variant ? variant.stock : 0;
    },
    [getAvailableVariants]
  );

  // Memoize the context value so consumers don't re-render unnecessarily
  const contextValue = useMemo(
    () => ({
      inventory,
      fetchInventory,
      getAvailableVariants,
      checkStock,
    }),
    [inventory, fetchInventory, getAvailableVariants, checkStock]
  );

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};
