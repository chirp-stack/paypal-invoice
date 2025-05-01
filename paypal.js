const axios = require('axios');

// Sample Sandbox credentials
const CONFIG = require('./config');

const API_BASE = CONFIG.paypal.api_base;
const CLIENT_ID = CONFIG.paypal.client_id;
const CLIENT_SECRET = CONFIG.paypal.client_secret;

async function getAccessToken() {
    const response = await axios({
        url: `${API_BASE}/v1/oauth2/token`,
        method: 'post',
        auth: { username: CLIENT_ID, password: CLIENT_SECRET },
        headers: { 'Accept': 'application/json' },
        params: { grant_type: 'client_credentials' }
    });
    return response.data.access_token;
}

async function createAndSendInvoice(customerEmail, itemName, price) {
    const accessToken = await getAccessToken();

    const invoiceData = {
        detail: { currency_code: "USD", note: "Thank you for your business." },
        invoicer: { email_address: "sample-business@example.com" },
        primary_recipients: [{ billing_info: { email_address: customerEmail } }],
        items: [{ name: itemName, quantity: "1", unit_amount: { currency_code: "USD", value: price.toFixed(2) } }]
    };

    const createResp = await axios.post(`${API_BASE}/v2/invoicing/invoices`, invoiceData, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    const invoiceId = createResp.data.id;

    await axios.post(`${API_BASE}/v2/invoicing/invoices/${invoiceId}/send`, {}, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    return invoiceId;
}

module.exports = { createAndSendInvoice };
