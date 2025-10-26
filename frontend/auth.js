const API_URL = 'https://internship-management-buoe.onrender.com/api/auth';

// Tab switching
function showAuthTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
  
  document.querySelector(`[onclick="showAuthTab('${tabName}')"]`).classList.add('active');
  document.getElementById(`${tabName}-form`).classList.add('active');
}

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

// Student Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await fetch(`${API_URL}/login`, {
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
      showMessage('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'student-dashboard.html';
      }, 1000);
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    showMessage('Login failed. Please try again.', 'error');
  }
});

// Student Registration
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;
  
  if (password !== confirmPassword) {
    showMessage('Passwords do not match!', 'error');
    return;
  }
  
  const userData = {
    name: document.getElementById('registerName').value,
    rollNumber: document.getElementById('registerRollNumber').value,
    email: document.getElementById('registerEmail').value,
    department: document.getElementById('registerDepartment').value,
    academicYear: document.getElementById('registerAcademicYear').value,
    password: password
  };
  
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showMessage('Registration successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'student-dashboard.html';
      }, 1000);
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    showMessage('Registration failed. Please try again.', 'error');
  }
});

// Check if already logged in
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (token && user.role === 'student') {
    window.location.href = 'student-dashboard.html';
  }
});
