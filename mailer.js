const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

// Sample email configuration
const nodemailer = require('nodemailer');
const CONFIG = require('./config');

const transporter = nodemailer.createTransport({
    host: 'x13.x10hosting.com', // Your actual SMTP server
    port: 465,                         // SSL port (usually 465)
    secure: true,                      // Use SSL
    auth: {
        user: CONFIG.email.user,
        pass: CONFIG.email.pass
    }
});

exports.sendInvoicePaidEmail = (customerEmail, invoiceId) => {
    ejs.renderFile(path.join(__dirname, 'templates/admin_notification.ejs'), { customerEmail, invoiceId }, (err, html) => {
        if (err) console.error('Template error:', err);
        else {
            transporter.sendMail({
                from: '"Invoice Manager" <sample-email@gmail.com>',
                to: 'admin@example.com',
                subject: `Invoice ${invoiceId} has been paid!`,
                html
            }, (error, info) => {
                if (error) console.error('Error sending Admin email:', error);
                else console.log('Admin Notification Email sent:', info.response);
            });
        }
    });
};

exports.sendThankYouEmail = (customerEmail, invoiceId) => {
    ejs.renderFile(path.join(__dirname, 'templates/customer_thankyou.ejs'), { invoiceId }, (err, html) => {
        if (err) console.error('Template error:', err);
        else {
            transporter.sendMail({
                from: '"Invoice Manager" <sample-email@gmail.com>',
                to: customerEmail,
                subject: `Thank you for your payment!`,
                html
            }, (error, info) => {
                if (error) console.error('Error sending Thank You email:', error);
                else console.log('Thank You Email sent:', info.response);
            });
        }
    });
};
