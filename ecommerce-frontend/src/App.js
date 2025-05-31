// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CheckoutPage from "./components/CheckoutPage";
import Thankyou from "./components/Thankyou";
import "./App.css";

import { CartProvider } from "./contexts/CartContext";
import { InventoryProvider } from "./contexts/InventoryContext";
import ProductListingPage from "./components/ProductListingPage";

function App() {
  return (
    <InventoryProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<ProductListingPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/thank-you" element={<Thankyou />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </InventoryProvider>
  );
}

export default App;
