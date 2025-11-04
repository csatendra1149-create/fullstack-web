const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (to, message) => {
  try {
    // Format phone number (add +977 for Nepal if not present)
    let formattedPhone = to;
    if (!to.startsWith('+')) {
      formattedPhone = `+977${to}`;
    }

    // Send SMS
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log('✅ SMS sent successfully:', result.sid);
    return {
      success: true,
      messageId: result.sid
    };
  } catch (error) {
    console.error('❌ SMS sending failed:', error);
    
    // For development: log the message instead of sending
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 [DEV] SMS Message:', {
        to,
        message
      });
      return {
        success: true,
        messageId: 'dev_' + Date.now()
      };
    }
    
    throw new Error('Failed to send SMS');
  }
};

// Send OTP via SMS
const sendOTPSMS = async (phone, otp) => {
  const message = `Your HomeTaste Flavours verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
  return await sendSMS(phone, message);
};

// Send order notification
const sendOrderNotification = async (phone, orderNumber, status) => {
  const statusMessages = {
    'confirmed': `Your order #${orderNumber} has been confirmed! Your meal is being prepared with love. 🍛`,
    'ready_for_pickup': `Your order #${orderNumber} is ready for pickup! Our delivery partner will collect it soon. 📦`,
    'out_for_delivery': `Your order #${orderNumber} is on its way! Get ready to enjoy your home-cooked meal. 🚴`,
    'delivered': `Your order #${orderNumber} has been delivered! Enjoy your meal! ❤️`
  };
  
  const message = statusMessages[status] || `Order #${orderNumber} status: ${status}`;
  return await sendSMS(phone, message);
};

module.exports = {
  sendSMS,
  sendOTPSMS,
  sendOrderNotification
};