import React from "react";

const ThankYouPage = ({ orderData }) => {
  // Sample order data (in a real app, this would come from props or state)
  const order = orderData || {
    orderNumber: "ORD-20230527-78945",
    customer: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "(555) 123-4567",
      shippingAddress:
        "123 Main Street\nApt 4B\nNew York, NY 10001\nUnited States",
      billingAddress: "Same as shipping address",
      paymentMethod: "Credit Card (VISA ending in 4242)",
      specialInstructions: "Please deliver after 5 PM",
    },
    items: [
      { name: "Premium Wireless Headphones", quantity: 1, price: 199.99 },
      { name: "Phone Charging Dock", quantity: 2, price: 29.99 },
      { name: "Screen Protector", quantity: 1, price: 14.99 },
    ],
    shipping: 12.99,
    tax: 22.0,
    estimatedDelivery: "June 3, 2023",
  };

  // Calculate order totals
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal + order.shipping + order.tax;

  return (
    <div className="thank-you-page">
      <div className="thank-you-header">
        <h1>Thank You for Your Order!</h1>
        <p>We've received your order and are processing it now.</p>
      </div>

      <div className="confirmation-box">
        <h2>Your Order Confirmation</h2>
        <div className="order-number">
          <p>
            <strong>Unique Order Number:</strong> {order.orderNumber}
          </p>
        </div>
      </div>

      <div className="order-details">
        <h3>Customer Information</h3>
        <div className="detail-row">
          <div className="detail-label">Full Name:</div>
          <div>{order.customer.name}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Email:</div>
          <div>{order.customer.email}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Phone:</div>
          <div>{order.customer.phone}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Shipping Address:</div>
          <div className="address">
            {order.customer.shippingAddress.split("\n").map((line, i) => (
              <React.Fragment key={i}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Billing Address:</div>
          <div>{order.customer.billingAddress}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Payment Method:</div>
          <div>{order.customer.paymentMethod}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Special Instructions:</div>
          <div>{order.customer.specialInstructions}</div>
        </div>
      </div>

      <div className="order-summary">
        <h3>Order Summary</h3>
        <table className="summary-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="3">Subtotal:</td>
              <td>${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="3">Shipping:</td>
              <td>${order.shipping.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="3">Tax:</td>
              <td>${order.tax.toFixed(2)}</td>
            </tr>
            <tr className="total-row">
              <td colSpan="3">Total:</td>
              <td>${total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="confirmation-message">
        <h3>Your Order is Complete!</h3>
        <p>
          We've sent a confirmation email to{" "}
          <strong>{order.customer.email}</strong> with your order details.
        </p>
        <p>
          You'll receive another email when your order ships. Expected delivery
          date: <strong>{order.estimatedDelivery}</strong>.
        </p>
        <p>
          If you have any questions about your order, please contact our
          customer service team at support@example.com or call (800) 555-0191.
        </p>
      </div>

      <style jsx>{`
        .thank-you-page {
          font-family: "Arial", sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .thank-you-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .confirmation-box {
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 20px;
          margin-bottom: 20px;
          background-color: #f9f9f9;
        }
        .order-details {
          margin-bottom: 30px;
        }
        .detail-row {
          display: flex;
          margin-bottom: 10px;
        }
        .detail-label {
          font-weight: bold;
          width: 200px;
        }
        .address {
          white-space: pre-line;
        }
        .order-summary {
          margin-top: 30px;
        }
        .summary-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        .summary-table th,
        .summary-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .summary-table th {
          background-color: #f2f2f2;
        }
        .total-row {
          font-weight: bold;
          background-color: #f2f2f2;
        }
        .confirmation-message {
          margin-top: 30px;
          padding: 15px;
          background-color: #e8f5e9;
          border-left: 4px solid #4caf50;
        }
      `}</style>
    </div>
  );
};

export default ThankYouPage;
