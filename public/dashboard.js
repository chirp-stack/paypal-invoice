

let token = localStorage.getItem('token') || '';; 

const socket = io();

socket.on('invoicePaid', (data) => {
  console.log('Real-time: Invoice Paid', data);
  fetchInvoices();
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    })
  });
  if (res.ok) {
    const data = await res.json();
    token = data.token;
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';
    fetchInvoices();
  } else {
    alert('Login failed');
  }
});

async function fetchInvoices() {
  const res = await fetch('/api/invoices');
  const invoices = await res.json();
  const list = document.getElementById('invoiceList');
  list.innerHTML = '';
  invoices.forEach(invoice => {
    const item = document.createElement('li');
    item.className = 'list-group-item';
    item.innerHTML = `#${invoice.id} - ${invoice.name} - ${invoice.description} - ${invoice.status} 
      <a href="/api/invoices/${invoice.id}/download" target="_blank" class="btn btn-sm btn-outline-primary ms-3">Download PDF</a>`;
    list.appendChild(item);
  });
}

document.getElementById('customerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': token },
    body: JSON.stringify({
      name: document.getElementById('name').value,
      email: document.getElementById('email').value
    })
  });
  alert('Customer created');
});

document.getElementById('subscriptionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  await fetch('/api/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': token },
    body: JSON.stringify({
      customer_id: document.getElementById('customer_id').value,
      description: document.getElementById('description').value,
      price: document.getElementById('price').value
    })
  });
  alert('Subscription created');
});

document.getElementById('invoiceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  await fetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': token },
    body: JSON.stringify({
      customer_id: document.getElementById('invoice_customer_id').value,
      subscription_id: document.getElementById('invoice_subscription_id').value
    })
  });
  alert('Invoice sent');
  fetchInvoices();
});