const API_URL = 'http://localhost:5000/api/auth';

// Show message
function showMessage(message, type = 'error') {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

// Admin Login
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPassword').value;
  
  try {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showMessage('Admin login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 1000);
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    showMessage('Login failed. Please try again.', 'error');
  }
});

// Check if already logged in
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (token && user.role === 'admin') {
    window.location.href = 'admin-dashboard.html';
  }
});
