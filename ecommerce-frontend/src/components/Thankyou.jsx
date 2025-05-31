import React from "react";
import { useLocation } from "react-router-dom";

const ThankYouPage = () => {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center text-red-600 text-lg font-semibold">
        No order data found. Please complete your purchase.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        Thank You for Your Order!
      </h1>
      <p className="text-gray-700 mb-6">
        Order <span className="font-semibold">#{order.id}</span> has been
        confirmed.
      </p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
        <p className="text-sm text-gray-500 mb-4">
          Date: {new Date(order.date).toLocaleString()}
        </p>

        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-4">
                <img
                  src={`/img/${item.image}`}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <h3 className="text-lg font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                  <p className="text-sm text-gray-500">
                    Price: ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right text-lg font-bold">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between text-gray-700 mb-1">
            <span>Subtotal:</span>
            <span>${order.payment.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700 mb-1">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between font-semibold text-lg text-black">
            <span>Total:</span>
            <span>${order.payment.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">What's Next?</h2>
        <p className="text-sm text-gray-600">
          A confirmation email has been sent to{" "}
          <span className="font-medium">{order.customeremail}</span>.
        </p>
        <p className="text-sm text-gray-600">
          You’ll receive another email when your order ships.
        </p>
      </div>
    </div>
  );
};

export default ThankYouPage;
