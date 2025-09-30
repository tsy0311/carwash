const nodemailer = require('nodemailer');
const config = require('../config');

// Create email transporter
const createTransporter = () => {
  // Prefer OAuth2 if enabled and credentials present
  if (
    config.EMAIL.OAUTH?.ENABLED &&
    config.EMAIL.OAUTH.CLIENT_ID &&
    config.EMAIL.OAUTH.CLIENT_SECRET &&
    config.EMAIL.OAUTH.REFRESH_TOKEN
  ) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: config.EMAIL.USER,
        clientId: config.EMAIL.OAUTH.CLIENT_ID,
        clientSecret: config.EMAIL.OAUTH.CLIENT_SECRET,
        refreshToken: config.EMAIL.OAUTH.REFRESH_TOKEN,
        accessToken: config.EMAIL.OAUTH.ACCESS_TOKEN || undefined
      },
      logger: config.NODE_ENV !== 'production',
      debug: config.NODE_ENV !== 'production'
    });
  }

  // Fallback to SMTP user/pass
  return nodemailer.createTransport({
    host: config.EMAIL.HOST,
    port: Number(config.EMAIL.PORT),
    secure: Number(config.EMAIL.PORT) === 465,
    auth: {
      user: config.EMAIL.USER,
      pass: config.EMAIL.PASS
    },
    logger: config.NODE_ENV !== 'production',
    debug: config.NODE_ENV !== 'production'
  });
};

// Email templates
const templates = {
  contact: (data) => ({
    subject: data.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #000; color: #C19A6B; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">AUTOBATH</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">DETAILING & ACCESSORIES</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #000; margin-bottom: 20px;">New Contact Form Submission</h2>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="color: #C19A6B; margin-top: 0;">Contact Details</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Service:</strong> ${data.service}</p>
            <p><strong>Submitted:</strong> ${data.timestamp}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 5px;">
            <h3 style="color: #C19A6B; margin-top: 0;">Message</h3>
            <p style="white-space: pre-wrap;">${data.message}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="mailto:${data.email}" 
               style="background: #C19A6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reply to Customer
            </a>
          </div>
        </div>
        
        <div style="background: #000; color: #C19A6B; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">AUTOBATH - Premium Car Detailing Services</p>
          <p style="margin: 5px 0 0 0;">13 jalan rakan 12/2 Cheras, 43200 Kajang, Selangor</p>
        </div>
      </div>
    `
  }),

  customerConfirmation: (data) => ({
    subject: 'Thank you for contacting AUTOBATH',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #000; color: #C19A6B; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">AUTOBATH</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">DETAILING & ACCESSORIES</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #000; margin-bottom: 20px;">Thank You, ${data.name}!</h2>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <p>We have received your inquiry about <strong>${data.service}</strong> and will get back to you within 24 hours.</p>
            
            <p>In the meantime, feel free to:</p>
            <ul>
              <li>Visit our website for more information about our services</li>
              <li>Follow us on social media for updates and tips</li>
              <li>Call us directly at (+60) 163399533 for urgent inquiries</li>
            </ul>
          </div>
          
          <div style="background: #C19A6B; color: white; padding: 20px; border-radius: 5px; text-align: center;">
            <h3 style="margin-top: 0;">Our Services</h3>
            <p>• Exterior Detailing</p>
            <p>• Interior Detailing</p>
            <p>• Premium Package</p>
            <p>• Product Sales</p>
          </div>
        </div>
        
        <div style="background: #000; color: #C19A6B; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">AUTOBATH - Premium Car Detailing Services</p>
          <p style="margin: 5px 0 0 0;">13 jalan rakan 12/2 Cheras, 43200 Kajang, Selangor</p>
          <p style="margin: 5px 0 0 0;">Phone: (+60) 163399533 | Email: autobath36@gmail.com</p>
        </div>
      </div>
    `
  }),

  orderConfirmation: (data) => ({
    subject: `Order Confirmation - ${data.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #000; color: #C19A6B; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">AUTOBATH</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">DETAILING & ACCESSORIES</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #000; margin-bottom: 20px;">Order Confirmation</h2>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <p><strong>Order ID:</strong> ${data.orderId}</p>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Total Amount:</strong> RM ${data.totalAmount}</p>
            <p><strong>Order Date:</strong> ${data.orderDate}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 5px;">
            <h3 style="color: #C19A6B; margin-top: 0;">Order Items</h3>
            ${data.items.map(item => `
              <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <p style="margin: 0;"><strong>${item.name}</strong></p>
                <p style="margin: 5px 0 0 0;">Quantity: ${item.quantity} × RM ${item.price}</p>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div style="background: #000; color: #C19A6B; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">AUTOBATH - Premium Car Detailing Services</p>
          <p style="margin: 5px 0 0 0;">13 jalan rakan 12/2 Cheras, 43200 Kajang, Selangor</p>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (emailData) => {
  try {
    const transporter = createTransporter();
    
    // Get template
    const templateKey = emailData.template === 'customer-confirmation' ? 'customerConfirmation' : emailData.template;
    const template = templates[templateKey];
    if (!template) {
      throw new Error(`Template '${emailData.template}' not found`);
    }

    // Generate email content
    const emailContent = template(emailData.data);

    // Email options
    const mailOptions = {
      from: {
        name: 'AUTOBATH',
        address: config.EMAIL.USER
      },
      to: emailData.to,
      replyTo: emailData.data?.email || undefined,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;

  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = {
  sendEmail
};
