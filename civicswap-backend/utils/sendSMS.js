const SibApiV3Sdk = require("@getbrevo/brevo");

const sendSMS = async ({ to, message }) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalSMSApi();
    apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

    const sendTransacSms = new SibApiV3Sdk.SendTransacSms();
    sendTransacSms.sender = "CivicSwap";
    sendTransacSms.recipient = to;
    sendTransacSms.content = message;

    await apiInstance.sendTransacSms(sendTransacSms);
    console.log(`SMS sent to ${to}`);
  } catch (error) {
    console.error("SMS error:", error.message);
  }
};

module.exports = sendSMS;
