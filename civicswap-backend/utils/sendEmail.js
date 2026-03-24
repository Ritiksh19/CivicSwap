const axios = require("axios");

// Yeh naya function banega email bhejne ke liye
const sendEmail = async (userEmail, subject, textContent) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "CivicSwap",
          email: process.env.EMAIL_FROM, // Tumhara harshittrivedi24@gmail.com
        },
        to: [{ email: userEmail }],
        subject: subject,
        textContent: textContent,
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

// Example ki isko call kaise karna hai:
// await sendEmail(req.body.email, "Request Sent", "Your borrow request was sent successfully!");
