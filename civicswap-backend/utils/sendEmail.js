const axios = require("axios");

// Ab yeh function ek Object accept karega
const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "CivicSwap",
          email: process.env.EMAIL_FROM,
        },
        to: [{ email: to }], // Yahan sahi email string jayegi
        subject: subject,
        htmlContent: html, // Yahan tera HTML render hoga
      },
      {
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      },
    );
    console.log("✅ Email sent successfully via Brevo API!");
    return response.data;
  } catch (error) {
    console.error("❌ Brevo API Error:", error.response?.data || error.message);
  }
};

module.exports = sendEmail;
