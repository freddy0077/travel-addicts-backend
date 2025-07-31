import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface CustomBookingEmailData {
  name: string;
  email: string;
  phone?: string;
  destination: string;
  travelDates: string;
  travelers: number;
  budget: number;
  message: string;
}

interface BookingConfirmationEmailData {
  customerName: string;
  customerEmail: string;
  bookingReference: string;
  tourTitle: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  totalPrice: number;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor() {
    // Log all email-related environment variables for debugging
    console.log('📧 Email Environment Variables:');
    console.log('SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
    console.log('SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
    console.log('SMTP_SECURE:', process.env.SMTP_SECURE || 'NOT SET');
    console.log('SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
    console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '***SET***' : 'NOT SET');
    console.log('FROM_EMAIL:', process.env.FROM_EMAIL || 'NOT SET');
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'NOT SET');
    console.log('---');

    // Validate required environment variables
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    
    if (!smtpUser || !smtpPassword) {
      console.warn('⚠️ SMTP credentials not configured. Email service will be disabled.');
      console.warn('Please set SMTP_USER and SMTP_PASSWORD environment variables.');
      // Create a dummy transporter that won't actually send emails
      this.transporter = null as any;
      this.fromEmail = process.env.FROM_EMAIL || 'noreply@traveladdicts.com';
      return;
    }

    // Email configuration from environment variables
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.zoho.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    };

    this.fromEmail = process.env.FROM_EMAIL || 'noreply@traveladdicts.com';
    
    console.log('📧 Initializing email service with config:', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.auth.user,
      from: this.fromEmail
    });
    
    // Create transporter
    this.transporter = nodemailer.createTransport(config);
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // Check if email service is properly configured
      if (!this.transporter) {
        console.warn('⚠️ Email service not configured. Skipping email send.');
        return false;
      }

      const mailOptions = {
        from: emailData.from || this.fromEmail,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
      };

      console.log('📧 Attempting to send email:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return false;
    }
  }

  async sendCustomBookingNotification(bookingData: CustomBookingEmailData): Promise<boolean> {
    try {
      // Email to admin
      const adminEmailHtml = this.generateAdminCustomBookingEmail(bookingData);
      const adminEmailSent = await this.sendEmail({
        to: process.env.ADMIN_EMAIL || 'bookings@traveladdicts.org',
        subject: `New Custom Trip Request - ${bookingData.destination}`,
        html: adminEmailHtml,
      });

      // Confirmation email to customer
      const customerEmailHtml = this.generateCustomerConfirmationEmail(bookingData);
      const customerEmailSent = await this.sendEmail({
        to: bookingData.email,
        subject: 'Your Custom Trip Request - Travel Addicts',
        html: customerEmailHtml,
      });

      return adminEmailSent && customerEmailSent;
    } catch (error) {
      console.error('❌ Error sending custom booking notification:', error);
      return false;
    }
  }

  async sendBookingConfirmationEmail(bookingData: BookingConfirmationEmailData): Promise<boolean> {
    try {
      // Confirmation email to customer
      const customerEmailHtml = this.generateBookingConfirmationEmail(bookingData);
      const customerEmailSent = await this.sendEmail({
        to: bookingData.customerEmail,
        subject: `Booking Confirmed - ${bookingData.bookingReference} | Travel Addicts`,
        html: customerEmailHtml,
      });

      if (customerEmailSent) {
        console.log('✅ Booking confirmation email sent successfully for:', bookingData.bookingReference);
      } else {
        console.log('⚠️ Booking confirmation email failed for:', bookingData.bookingReference);
      }

      return customerEmailSent;
    } catch (error) {
      console.error('❌ Error sending booking confirmation email:', error);
      return false;
    }
  }

  private generateAdminCustomBookingEmail(data: CustomBookingEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Custom Trip Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #20B2AA, #FF8500); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #20B2AA; }
          .value { margin-top: 5px; }
          .highlight { background: #fff; padding: 15px; border-left: 4px solid #20B2AA; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌟 New Custom Trip Request</h1>
            <p>A new custom trip request has been submitted on Travel Addicts</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Customer Name:</div>
              <div class="value">${data.name}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${data.email}</div>
            </div>
            ${data.phone ? `
            <div class="field">
              <div class="label">Phone:</div>
              <div class="value">${data.phone}</div>
            </div>
            ` : ''}
            <div class="field">
              <div class="label">Destination:</div>
              <div class="value">${data.destination}</div>
            </div>
            <div class="field">
              <div class="label">Travel Dates:</div>
              <div class="value">${data.travelDates}</div>
            </div>
            <div class="field">
              <div class="label">Number of Travelers:</div>
              <div class="value">${data.travelers}</div>
            </div>
            <div class="field">
              <div class="label">Budget per Person:</div>
              <div class="value">$${data.budget}</div>
            </div>
            <div class="highlight">
              <div class="label">Customer Message:</div>
              <div class="value">${data.message}</div>
            </div>
            <p><strong>Please follow up with this customer within 24 hours.</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateCustomerConfirmationEmail(data: CustomBookingEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Custom Trip Request Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #20B2AA, #FF8500); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .summary { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .field { margin-bottom: 10px; }
          .label { font-weight: bold; color: #20B2AA; }
          .footer { text-align: center; margin-top: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌟 Thank You, ${data.name}!</h1>
            <p>Your custom trip request has been received</p>
          </div>
          <div class="content">
            <p>Dear ${data.name},</p>
            <p>Thank you for choosing Travel Addicts for your custom trip planning! We're excited to help you create an unforgettable travel experience.</p>
            
            <div class="summary">
              <h3>Your Request Summary:</h3>
              <div class="field">
                <span class="label">Destination:</span> ${data.destination}
              </div>
              <div class="field">
                <span class="label">Travel Dates:</span> ${data.travelDates}
              </div>
              <div class="field">
                <span class="label">Travelers:</span> ${data.travelers} people
              </div>
              <div class="field">
                <span class="label">Budget:</span> $${data.budget} per person
              </div>
            </div>

            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our travel experts will review your request within 24 hours</li>
              <li>We'll contact you to discuss your preferences in detail</li>
              <li>We'll create a personalized itinerary just for you</li>
              <li>Once approved, we'll handle all the bookings and arrangements</li>
            </ul>

            <p>If you have any questions in the meantime, feel free to contact us:</p>
            <ul>
              <li>📧 Email: bookings@traveladdicts.org</li>
              <li>📞 Phone: +233 59 387 8403</li>
              <li>🌐 Website: www.traveladdicts.org</li>
            </ul>

            <div class="footer">
              <p>Thank you for choosing Travel Addicts!</p>
              <p><em>Your journey begins with us. Welcome to the adventure.</em></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateBookingConfirmationEmail(data: BookingConfirmationEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmed - Travel Addicts</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #20B2AA, #FF8500); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #20B2AA; }
          .field { margin-bottom: 12px; display: flex; justify-content: space-between; }
          .label { font-weight: bold; color: #20B2AA; }
          .value { color: #333; }
          .highlight { background: #e8f8f5; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
          .footer { text-align: center; margin-top: 20px; color: #666; }
          .contact-info { background: #fff; padding: 15px; border-radius: 8px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Your adventure with Travel Addicts is confirmed</p>
          </div>
          <div class="content">
            <p>Dear ${data.customerName},</p>
            <p>Great news! Your booking has been confirmed and we're excited to help you create unforgettable memories.</p>
            
            <div class="highlight">
              <h3 style="margin: 0; color: #20B2AA;">Booking Reference: ${data.bookingReference}</h3>
              <p style="margin: 5px 0; color: #666;">Please keep this reference number for your records</p>
            </div>

            <div class="booking-details">
              <h3 style="color: #20B2AA; margin-top: 0;">Booking Details</h3>
              <div class="field">
                <span class="label">Tour:</span>
                <span class="value">${data.tourTitle}</span>
              </div>
              <div class="field">
                <span class="label">Destination:</span>
                <span class="value">${data.destination}</span>
              </div>
              <div class="field">
                <span class="label">Travel Dates:</span>
                <span class="value">${data.startDate} to ${data.endDate}</span>
              </div>
              <div class="field">
                <span class="label">Number of Travelers:</span>
                <span class="value">${data.travelers} people</span>
              </div>
              <div class="field">
                <span class="label">Total Amount:</span>
                <span class="value" style="font-weight: bold; color: #FF8500;">$${data.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div class="contact-info">
              <h4 style="color: #20B2AA; margin-top: 0;">What's Next?</h4>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Our team will contact you with detailed itinerary and payment instructions</li>
                <li>Please ensure all travelers have valid passports</li>
                <li>We'll send you a packing list and travel tips closer to your departure date</li>
                <li>Feel free to contact us with any questions or special requests</li>
              </ul>
            </div>

            <div class="contact-info">
              <h4 style="color: #20B2AA; margin-top: 0;">Contact Information</h4>
              <p style="margin: 5px 0;">📧 Email: bookings@traveladdicts.org</p>
              <p style="margin: 5px 0;">📞 Phone: +233 59 387 8403</p>
              <p style="margin: 5px 0;">🌐 Website: www.traveladdicts.org</p>
            </div>

            <div class="footer">
              <p><strong>Thank you for choosing Travel Addicts!</strong></p>
              <p><em>Your journey begins with us. Welcome to the adventure.</em></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
export default EmailService;
