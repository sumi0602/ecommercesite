const approvedTemplate = (order) => `
console.log("myorder"+ order);
  <h2>Thank you for your order, ${order.customer.name}!</h2>
  <p>Your order <strong>#${order._id}</strong> has been confirmed.</p>
  <p><strong>Items:</strong></p>
  <ul>
    ${order.items
      .map(
        (item) => `<li>${item.variant} - $${item.price} x ${item.quantity}</li>`
      )
      .join("")}
  </ul>
  <p><strong>Total:</strong> $${order.payment.amount}</p>
`;

const declinedTemplate = (order) => `
  <h2>Sorry, ${order.customer.name}</h2>
  <p>Your transaction for order <strong>#${order._id}</strong> was declined.</p>
  <p>Please check your payment details or contact support.</p>
`;

module.exports = { approvedTemplate, declinedTemplate };
