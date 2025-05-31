import React, { useState, useEffect, useMemo } from "react";
import { useInventory } from "../contexts/InventoryContext";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { fetchInventory, getAvailableVariants } = useInventory();
  const { addToCart, items: cartItems } = useCart();
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [stockMessage, setStockMessage] = useState("");
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [fetched, setFetched] = useState(false);
  const navigate = useNavigate();

  // Fetch inventory once
  useEffect(() => {
    if (!fetched) {
      fetchInventory(product._id).then(() => setFetched(true));
    }
  }, [fetchInventory, product._id, fetched]);

  const variants = useMemo(() => {
    return getAvailableVariants(product._id) || [];
  }, [getAvailableVariants, product._id]);

  const availableColors = useMemo(() => {
    return [...new Set(variants.map((v) => v.color))];
  }, [variants]);

  // Update sizes when color changes
  useEffect(() => {
    if (selectedColor) {
      const sizes = variants
        .filter((v) => v.color === selectedColor && v.stock > 0)
        .map((v) => v.size);
      setAvailableSizes(sizes);
      setSelectedSize("");
    }
  }, [selectedColor, variants]);

  // Update stock message and availability
  useEffect(() => {
    if (selectedColor && selectedSize) {
      const variant = variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      );

      const cartItem = cartItems.find(
        (item) =>
          item.productId === product._id &&
          item.color === selectedColor &&
          item.size === selectedSize
      );

      const availableQuantity = variant
        ? variant.stock - (cartItem?.quantity || 0)
        : 0;

      setStockMessage(
        availableQuantity > 0
          ? `${availableQuantity} available in stock`
          : "Out of stock"
      );
      setIsOutOfStock(availableQuantity <= 0);
      setCartQuantity(cartItem?.quantity || 0);

      if (quantity > availableQuantity) {
        setQuantity(Math.max(1, availableQuantity));
      }
    }
  }, [selectedColor, selectedSize, quantity, product._id, variants, cartItems]);

  const getMaxQuantity = () => {
    if (!selectedColor || !selectedSize) return 1;

    const variant = variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );

    const cartItem = cartItems.find(
      (item) =>
        item.productId === product._id &&
        item.color === selectedColor &&
        item.size === selectedSize
    );

    return variant ? variant.stock - (cartItem?.quantity || 0) : 1;
  };

  const handleBuyNow = () => {
    if (!selectedColor || !selectedSize) {
      alert("Please select color and size");
      return;
    }

    const variant = variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );

    const cartItem = cartItems.find(
      (item) =>
        item.productId === product._id &&
        item.color === selectedColor &&
        item.size === selectedSize
    );

    const availableQuantity = variant.stock - (cartItem?.quantity || 0);

    if (quantity > availableQuantity) {
      alert(`Only ${availableQuantity} items available.`);
      return;
    }

    const itemToAdd = {
      id: `${product._id}-${selectedColor}-${selectedSize}`,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      color: selectedColor,
      size: selectedSize,
      quantity,
      stock: variant.stock,
    };
    console.log(itemToAdd);
    try {
      addToCart(itemToAdd);
      navigate("/checkout", {
        state: {
          cartItems: [...cartItems, itemToAdd],
        },
      });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="product-card">
      <img
        src={`/img/${product.image}`}
        alt={product.title}
        className="product-image"
      />
      <h3 className="product-title">{product.title}</h3>
      <p className="product-price">${product.price.toFixed(2)}</p>

      <div className="inventory-info">
        {stockMessage && (
          <div className={`stock-status ${isOutOfStock ? "out" : "in"}`}>
            {stockMessage}
            {cartQuantity > 0 && <span> ({cartQuantity} in cart)</span>}
          </div>
        )}
      </div>

      <div className="variant-selector">
        <label>Color:</label>
        <select
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
        >
          <option value="">Select color</option>
          {availableColors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>

      <div className="variant-selector">
        <label>Size:</label>
        <select
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          disabled={!selectedColor || availableSizes.length === 0}
        >
          <option value="">Select size</option>
          {availableSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="quantity-selector">
        <label>Quantity:</label>
        <div className="quantity-controls">
          <button
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            disabled={quantity <= 1}
          >
            -
          </button>
          <span>{quantity}</span>
          <button
            onClick={() =>
              setQuantity((prev) => Math.min(getMaxQuantity(), prev + 1))
            }
            disabled={quantity >= getMaxQuantity()}
          >
            +
          </button>
        </div>
      </div>

      <button
        className="buy-now-btn"
        onClick={handleBuyNow}
        disabled={
          !selectedColor || !selectedSize || stockMessage.includes("Out")
        }
        style={{ marginLeft: "10px" }}
      >
        Buy Now
      </button>
    </div>
  );
};

export default ProductCard;
