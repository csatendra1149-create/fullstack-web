const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email options
    const mailOptions = {
      from: `HomeTaste Flavours <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF6B35, #4CAF50); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🏠 HomeTaste Flavours</h1>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              ${options.text}
            </p>
          </div>
          <div style="background: #1a1a2e; padding: 20px; text-align: center; color: white;">
            <p style="margin: 5px 0;">📧 c.satendra1149@gmail.com</p>
            <p style="margin: 5px 0;">📱 +977 9807258278</p>
            <p style="margin: 10px 0; font-size: 14px; color: #aaa;">
              © 2025 HomeTaste Flavours. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = { sendEmail };