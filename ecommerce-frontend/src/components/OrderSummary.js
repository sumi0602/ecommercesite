import React from "react";

const OrderSummary = ({ cartItems }) => {
  if (!cartItems || cartItems.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-md shadow-md max-w-md mx-auto">
      <h3 className="text-2xl font-semibold mb-4">Order Summary</h3>
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-4">
            <img
              src={`/img/${item.image}`}
              alt={item.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-800">
                {item.name} - {item.color}{" "}
                <span className="text-gray-600">× {item.quantity}</span>
              </p>
            </div>
            <p className="font-semibold text-gray-900">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
      <hr className="my-4 border-gray-300" />
      <p className="text-lg font-bold text-right">
        Total: $
        {cartItems
          .reduce((sum, item) => sum + item.price * item.quantity, 0)
          .toFixed(2)}
      </p>
    </div>
  );
};

export default OrderSummary;
