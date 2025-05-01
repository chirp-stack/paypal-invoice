const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const CONFIG = require('./config');

const customerController = require('./controllers/customerController');
const subscriptionController = require('./controllers/subscriptionController');
const invoiceController = require('./controllers/invoiceController');
const authController = require('./controllers/authController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public', { index: 'signup.html' }));

app.set('io', io);

// Serve the registration page as the default route

app.post('/api/register-admin', authController.registerAdmin);
app.post('/api/login', authController.login);
app.post('/api/customers', authController.verifyToken, customerController.createCustomer);
app.post('/api/subscriptions', authController.verifyToken, subscriptionController.createSubscription);
app.post('/api/invoices', authController.verifyToken, invoiceController.sendInvoice);
app.get('/api/invoices', invoiceController.listInvoices);
app.get('/api/invoices/:id/download', invoiceController.downloadInvoice);

app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    require('./controllers/webhookController').handleWebhook(req, res, io);
});

const PORT = CONFIG.PORT || 1337;
server.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});
