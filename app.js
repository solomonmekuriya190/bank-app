// REST Endpoints (Using JSONPlaceholder Mock API)
const USER_API = 'https://jsonplaceholder.typicode.com/users/1';
const TRANSACTIONS_API = 'https://jsonplaceholder.typicode.com/todos?_limit=6';

document.addEventListener('DOMContentLoaded', () => {
  fetchUserProfile();
  fetchTransactions();

  // Attach Event Listener for Form Submission
  document.getElementById('transfer-form').addEventListener('submit', handleTransfer);

  // Manual Refresh Event
  document.getElementById('refresh-btn').addEventListener('click', () => {
    fetchTransactions();
    showAlert('Transaction records updated!', 'info');
  });
});

// 1. GET Request: Load User Profile
async function fetchUserProfile() {
  try {
    const response = await fetch(USER_API);
    if (!response.ok) throw new Error('Network response was not ok');

    const user = await response.json();
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D6EFD&color=fff`;
  } catch (error) {
    console.error('Error fetching profile:', error);
    document.getElementById('user-name').textContent = 'Profile Unavailable';
  }
}

// 2. GET Request: Fetch Transaction List
async function fetchTransactions() {
  const tableBody = document.getElementById('transaction-rows');

  try {
    const response = await fetch(TRANSACTIONS_API);
    if (!response.ok) throw new Error('Failed to retrieve transactions');

    const transactions = await response.json();

    // Dynamically insert records into Bootstrap Table
    tableBody.innerHTML = transactions.map(item => `
      <tr>
        <td><strong>#TXN-${item.id}</strong></td>
        <td>${item.title}</td>
        <td>
          <span class="badge ${item.completed ? 'bg-success' : 'bg-warning text-dark'}">
            ${item.completed ? 'Completed' : 'Pending'}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-light border" onclick="viewDetails(${item.id})">
            <i class="fa-solid fa-eye"></i> View
          </button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('API Error:', error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger py-4">
          Error loading transactions from server.
        </td>
      </tr>
    `;
  }
}

// 3. POST Request: Submit Transaction Data
async function handleTransfer(e) {
  e.preventDefault();

  const recipient = document.getElementById('recipient').value;
  const amount = document.getElementById('amount').value;
  const sendBtn = document.getElementById('send-btn');

  // Set Loading State
  sendBtn.disabled = true;
  sendBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

  const payload = {
    title: `Transfer to ${recipient} ($${amount})`,
    completed: true,
    userId: 1
  };

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Post request failed');

    const result = await response.json();

    // Hide Bootstrap Modal
    const modalEl = document.getElementById('transferModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    // Reset Form Fields
    document.getElementById('transfer-form').reset();

    // Display Success Feedback
    showAlert(`Successfully transferred $${amount} to ${recipient}! (Ref ID: ${result.id})`, 'success');

  } catch (error) {
    console.error('Transfer Error:', error);
    showAlert('Transaction failed. Please try again later.', 'danger');
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerText = 'Confirm Transfer';
  }
}

// Helper: Show Bootstrap Alert Notifications
function showAlert(message, type) {
  const alertContainer = document.getElementById('alert-container');
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;

  setTimeout(() => {
    alertContainer.innerHTML = '';
  }, 4000);
}

// Helper: Transaction Modal Trigger
function viewDetails(id) {
  alert(`Viewing details for Transaction ID: #TXN-${id}`);
}