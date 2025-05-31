const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
  port: process.env.MAILTRAP_PORT || 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

const sendOrderConfirmation = async (order, customerEmail) => {
  try {
    const mailOptions = {
      from: '"Your Store" <no-reply@yourstore.com>',
      to: customerEmail,
      subject: `Order Confirmation #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for your order!</h2>
          <p>Your order #${
            order._id
          } has been received and is being processed.</p>
          
          <h3 style="color: #333; margin-top: 20px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Price</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr>
                <td> <img src="https://yourstore.com/img/${item.image}" alt="${
                    item.name
                  }" style="max-width: 50px;" /></td>

                  <td style="padding: 10px; border: 1px solid #ddd;">${
                    item.name
                  }</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">$${item.price.toFixed(
                    2
                  )}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${
                    item.quantity
                  }</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">$${(
                    item.price * item.quantity
                  ).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; border: 1px solid #ddd;"><strong>Total:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>$${order.payment.amount.toFixed(
                  2
                )}</strong></td>
              </tr>
            </tfoot>
          </table>
          
          <h3 style="color: #333; margin-top: 20px;">Shipping Details</h3>
          <p>${order.customer.name}<br>
          ${order.customer.address}<br>
          ${order.customer.phone ? `Phone: ${order.customer.phone}<br>` : ""}
          Email: ${order.customer.email}</p>
          
          <p style="margin-top: 30px;">If you have any questions, please contact us at support@yourstore.com</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const sendPaymentFailedEmail = async (order, customerEmail) => {
  try {
    const mailOptions = {
      from: '"Your Store" <no-reply@yourstore.com>',
      to: customerEmail,
      subject: `Payment Failed for Order #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d9534f;">Payment Failed</h2>
          <p>We were unable to process your payment for order #${order._id}.</p>
          <p>Please check your payment information and try again.</p>
          
          <a href="https://yourstore.com/checkout?order=${order._id}" 
             style="display: inline-block; padding: 10px 20px; background-color: #337ab7; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px;">
            Retry Payment
          </a>
          
          <p style="margin-top: 30px;">If you believe this is an error, please contact us at support@yourstore.com</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Payment failed email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending payment failed email:", error);
    throw error;
  }
};
module.exports = { sendOrderConfirmation, sendPaymentFailedEmail };
