const db = require('../database');
const { sendInvoicePaidEmail, sendThankYouEmail } = require('../mailer');

exports.handleWebhook = (req, res, io) => {
    const body = JSON.parse(req.body.toString());

    console.log('Received Webhook Event:', body.event_type);

    if (body.event_type === 'INVOICING.INVOICE.PAID') {
        const paypalInvoiceId = body.resource.id;

        db.get('SELECT customers.email FROM invoices JOIN customers ON invoices.customer_id = customers.id WHERE invoices.paypal_invoice_id = ?', [paypalInvoiceId], (err, row) => {
            if (err || !row) {
                console.error('DB lookup error:', err);
                return res.status(500).send('Customer not found');
            }

            db.run('UPDATE invoices SET status = ? WHERE paypal_invoice_id = ?', ['paid', paypalInvoiceId], function(err) {
                if (err) {
                    console.error('DB update error:', err);
                    return res.status(500).send('Database update failed');
                }

                sendInvoicePaidEmail(row.email, paypalInvoiceId);
                sendThankYouEmail(row.email, paypalInvoiceId);

                io.emit('invoicePaid', { invoiceId: paypalInvoiceId });

                console.log(`Invoice ${paypalInvoiceId} marked as PAID and emails sent!`);
                res.sendStatus(200);
            });
        });
    } else {
        res.sendStatus(200);
    }
};