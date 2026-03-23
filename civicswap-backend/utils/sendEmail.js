const brevo = require('@getbrevo/brevo');

const sendEmail = async ({ to, subject, html }) => {
  try {
    // 1. API Client configure karein
    let defaultClient = brevo.ApiClient.instance;
    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY; // Apna naya API key .env se lein

    let apiInstance = new brevo.TransactionalEmailsApi();
    let sendSmtpEmail = new brevo.SendSmtpEmail();

    // 2. Email ka data set karein
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;

    // Sender wahi hona chahiye jo Brevo mein verified hai (Aapka login email)
    sendSmtpEmail.sender = { 
      name: "Civic Swap", 
      email: process.env.EMAIL_USER // Make sure ye a5cce6001@smtp-brevo.com ho
    };

    // Brevo mein 'to' hamesha ek array of objects hota hai
    sendSmtpEmail.to = [{ email: to }]; 

    // 3. Email send karein
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Email sent successfully to ${to}. Message ID: ${result.messageId}`);
    
  } catch (error) {
    // Brevo API errors ko thoda detail mein print karne ke liye
    console.error('Email API error:', error.response ? error.response.text : error.message);
  }
};

module.exports = sendEmail;