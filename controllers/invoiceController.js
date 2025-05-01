const db = require('../database');
const { createAndSendInvoice } = require('../paypal');
const PDFDocument = require('pdfkit');

exports.sendInvoice = (req, res) => {
    const { customer_id, subscription_id } = req.body;
    db.get('SELECT customers.email, subscriptions.description, subscriptions.price FROM customers JOIN subscriptions ON customers.id = subscriptions.customer_id WHERE customers.id = ? AND subscriptions.id = ?', [customer_id, subscription_id], async (err, row) => {
        if (err || !row) return res.status(500).send('Not found');
        try {
            const paypalInvoiceId = await createAndSendInvoice(row.email, row.description, row.price);
            db.run('INSERT INTO invoices (customer_id, subscription_id, paypal_invoice_id, status) VALUES (?, ?, ?, ?)', [customer_id, subscription_id, paypalInvoiceId, 'sent'], function(err) {
                if (err) return res.status(500).send(err);
                res.json({ id: this.lastID, paypal_invoice_id: paypalInvoiceId });
            });
        } catch (error) {
            res.status(500).send(error.message);
        }
    });
};

exports.listInvoices = (req, res) => {
    db.all('SELECT invoices.id, customers.name, subscriptions.description, invoices.status FROM invoices JOIN customers ON invoices.customer_id = customers.id JOIN subscriptions ON invoices.subscription_id = subscriptions.id', [], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
};

exports.downloadInvoice = (req, res) => {
    const { id } = req.params;
    db.get('SELECT invoices.id, customers.name, customers.email, subscriptions.description, subscriptions.price FROM invoices JOIN customers ON invoices.customer_id = customers.id JOIN subscriptions ON invoices.subscription_id = subscriptions.id WHERE invoices.id = ?', [id], (err, invoice) => {
        if (err || !invoice) return res.status(404).send('Not found');
        const doc = new PDFDocument();
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice.id}.pdf`);
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);
        doc.image('https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg', 50, 45, { width: 100 });
        doc.moveDown();
        doc.fontSize(25).text('Invoice', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Invoice ID: ${invoice.id}`);
        doc.text(`Customer Name: ${invoice.name}`);
        doc.text(`Item: ${invoice.description}`);
        doc.text(`Amount: $${invoice.price}`);
        doc.end();
    });
};