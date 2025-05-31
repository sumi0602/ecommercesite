import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [transactionResult, setTransactionResult] = useState(null);

  useEffect(() => {
    if (!location.state?.cartItems || location.state.cartItems.length === 0) {
      navigate("/");
    } else {
      setCartItems(location.state.cartItems);
    }
  }, [location, navigate]);

  const handleTransactionComplete = (result) => {
    console.log(result);
    if (result.status === "approved") {
      navigate("/thank-you", {
        state: {
          order: {
            id: result.orderId,
            status: result.status,
            date: new Date().toISOString(),
            items: cartItems.map((item) => ({
              productId: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })),
            payment: {
              method: "Credit Card",
              lastFour: result.payment.lastFour,
              amount: result.amount,
              transactionId: result.transactionId,
            },
            customeremail: result.customeremail,
            shipping: {
              method: "Standard",
              estimatedDelivery: new Date(
                Date.now() + 3 * 24 * 60 * 60 * 1000
              ).toISOString(),
            },
          },
        },
      });
    } else {
      setTransactionResult(result);
    }
  };

  if (!cartItems.length) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Checkout</h2>

      {transactionResult ? (
        <div className="bg-white shadow rounded p-6 text-center">
          <h3
            className={`text-xl font-semibold mb-2 ${
              transactionResult.status === "approved"
                ? "text-green-600"
                : transactionResult.status === "declined"
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {transactionResult.status === "approved"
              ? "Payment Successful!"
              : transactionResult.status === "declined"
              ? "Payment Declined"
              : "Payment Error"}
          </h3>
          <p className="mb-2">{transactionResult.message}</p>
          {transactionResult.status === "approved" && (
            <p className="font-medium mb-4">
              Order ID: {transactionResult.orderId}
            </p>
          )}
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          >
            Back to Home
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow rounded p-6">
            <CheckoutForm
              cartItems={cartItems}
              onTransactionComplete={handleTransactionComplete}
            />
          </div>
          <div className="bg-white shadow rounded p-6">
            <OrderSummary cartItems={cartItems} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
