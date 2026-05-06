const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

const sendBookingConfirmation = async (bookingData) => {
  const { customerInfo, bookingReference, totalPrice, selectedHotel, selectedActivities } = bookingData;

  const subject = `Booking Confirmation - ${bookingReference}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Egypt Holiday Booking Confirmation</h2>
      <p>Dear ${customerInfo.firstName} ${customerInfo.lastName},</p>

      <p>Thank you for booking with Egypt Holiday! Your booking has been confirmed.</p>

      <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
        <h3>Booking Details:</h3>
        <p><strong>Booking Reference:</strong> ${bookingReference}</p>
        <p><strong>Total Price:</strong> $${totalPrice}</p>
        <p><strong>Hotel:</strong> ${selectedHotel.name}</p>
        ${selectedActivities && selectedActivities.length > 0 ?
          `<p><strong>Activities:</strong> ${selectedActivities.map(activity => activity.name).join(', ')}</p>` :
          ''
        }
      </div>

      <p>We look forward to welcoming you to Egypt!</p>

      <p>Best regards,<br>Egypt Holiday Team</p>
    </div>
  `;

  return await sendEmail(customerInfo.email, subject, html);
};

module.exports = {
  sendEmail,
  sendBookingConfirmation,
};