import React, { useState } from "react";

const CheckoutForm = ({ cartItems, onTransactionComplete }) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
  });

  const [simulationCode, setSimulationCode] = useState("1"); // Default: Approved
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!customerInfo.name) newErrors.name = "Name is required";
    if (!customerInfo.email.includes("@"))
      newErrors.email = "Valid email required";
    if (!customerInfo.address) newErrors.address = "Address is required";
    if (paymentInfo.cardNumber.replace(/\s/g, "").length !== 16)
      newErrors.cardNumber = "Invalid card number";
    if (!paymentInfo.expiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/))
      newErrors.expiry = "MM/YY required";
    if (paymentInfo.cvv.length !== 3 && paymentInfo.cvv.length !== 4)
      newErrors.cvv = "Invalid CVV";
    if (!paymentInfo.cardName) newErrors.cardName = "Cardholder name required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const orderPayload = {
      customer: customerInfo,
      payment: {
        ...paymentInfo,
        cardNumber: paymentInfo.cardNumber.slice(-4), // only last 4 digits for storage
      },
      cartItems,
      simulationCode,
    };

    try {
      const response = await fetch("http://localhost:5000/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (response.ok) {
        onTransactionComplete({
          status: data.status,
          message: data.message,
          orderId: data.orderId,
          transactionId: data.transactionId,
          amount: data.amount,
          cartItems: data.cartItems,
          payment: data.payment,
          customeremail: customerInfo.email,
        });
      } else {
        onTransactionComplete({
          status: "error",
          message: data.message || "Checkout failed",
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      onTransactionComplete({
        status: "error",
        message: "Something went wrong. Please try again.",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in customerInfo) {
      setCustomerInfo({ ...customerInfo, [name]: value });
    } else {
      setPaymentInfo({ ...paymentInfo, [name]: value });
    }
  };

  const formatCardNumber = (value) => {
    return value
      .replace(/\s?/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim()
      .substr(0, 19);
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      {/* Customer Info */}
      <section className="form-section">
        <h3>Customer Information</h3>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={customerInfo.name}
            onChange={handleInputChange}
            className={errors.name ? "error" : ""}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={customerInfo.email}
            onChange={handleInputChange}
            className={errors.email ? "error" : ""}
          />
          {errors.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={customerInfo.address}
            onChange={handleInputChange}
            className={errors.address ? "error" : ""}
          />
          {errors.address && (
            <span className="error-message">{errors.address}</span>
          )}
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={customerInfo.phone}
            onChange={handleInputChange}
          />
        </div>
      </section>

      {/* Payment Info */}
      <section className="form-section">
        <h3>Payment Details</h3>
        <div className="form-group">
          <label>Cardholder Name</label>
          <input
            type="text"
            name="cardName"
            value={paymentInfo.cardName}
            onChange={handleInputChange}
            className={errors.cardName ? "error" : ""}
          />
          {errors.cardName && (
            <span className="error-message">{errors.cardName}</span>
          )}
        </div>

        <div className="form-group">
          <label>Card Number</label>
          <input
            type="text"
            name="cardNumber"
            value={formatCardNumber(paymentInfo.cardNumber)}
            onChange={(e) =>
              setPaymentInfo({
                ...paymentInfo,
                cardNumber: e.target.value.replace(/\s/g, ""),
              })
            }
            maxLength={19}
            placeholder="1234 5678 9012 3456"
            className={errors.cardNumber ? "error" : ""}
          />
          {errors.cardNumber && (
            <span className="error-message">{errors.cardNumber}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Expiry Date</label>
            <input
              type="text"
              name="expiry"
              value={paymentInfo.expiry}
              onChange={(e) => {
                let value = e.target.value;
                if (value.length === 2 && !value.includes("/")) {
                  value = value + "/";
                }
                setPaymentInfo({ ...paymentInfo, expiry: value });
              }}
              maxLength={5}
              placeholder="MM/YY"
              className={errors.expiry ? "error" : ""}
            />
            {errors.expiry && (
              <span className="error-message">{errors.expiry}</span>
            )}
          </div>

          <div className="form-group">
            <label>CVV</label>
            <input
              type="text"
              name="cvv"
              value={paymentInfo.cvv}
              onChange={(e) =>
                setPaymentInfo({
                  ...paymentInfo,
                  cvv: e.target.value.replace(/\D/g, ""),
                })
              }
              maxLength={4}
              className={errors.cvv ? "error" : ""}
            />
            {errors.cvv && <span className="error-message">{errors.cvv}</span>}
          </div>
        </div>
      </section>

      {/* Simulation Selector */}
      <section className="form-section">
        <h3>Simulate Transaction</h3>
        <div className="form-group">
          <label>Choose Outcome</label>
          <select
            value={simulationCode}
            onChange={(e) => setSimulationCode(e.target.value)}
          >
            <option value="1">✅ Approved Transaction</option>
            <option value="2">❌ Declined Transaction</option>
            <option value="3">⚠️ Gateway Failure</option>
          </select>
        </div>
      </section>

      <button
        type="submit"
        className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 transition-colors duration-200"
      >
        Complete Purchase
      </button>
    </form>
  );
};

export default CheckoutForm;
