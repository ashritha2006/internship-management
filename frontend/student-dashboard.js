const API_URL = 'https://internship-management-buoe.onrender.com/api/internships';
let allInternships = [];
let filteredInternships = [];
let currentUser = null;
let previousInternships = []; // Store previous state for comparison

// Check authentication
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token || user.role !== 'student') {
    window.location.href = 'login.html';
    return;
  }
  
  currentUser = user;
  document.getElementById('userInfo').textContent = `${user.name} (${user.rollNumber})`;
  
  fetchInternships();
  updateStats();
  
  // Auto-refresh every 30 seconds to check for status updates
  setInterval(() => {
    fetchInternships();
  }, 30000);
});

// Tab switching
function showTab(tabName) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  
  document.getElementById(tabName).classList.add('active');
  document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
}

// Fetch internships
async function fetchInternships() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const newInternships = await response.json();
      
      // Check for status changes
      if (previousInternships.length > 0) {
        checkForStatusChanges(previousInternships, newInternships);
      }
      
      allInternships = newInternships;
      filteredInternships = allInternships;
      previousInternships = [...newInternships]; // Deep copy for next comparison
      
      renderTable();
      updateStats();
    } else {
      console.error('Failed to fetch internships');
    }
  } catch (error) {
    console.error('Error fetching internships:', error);
  }
}

// Check for status changes and show notifications
function checkForStatusChanges(oldInternships, newInternships) {
  oldInternships.forEach(oldInternship => {
    const newInternship = newInternships.find(i => i._id === oldInternship._id);
    
    if (newInternship && oldInternship.status !== newInternship.status) {
      showStatusChangeNotification(oldInternship, newInternship);
    }
  });
}

// Show notification for status changes
function showStatusChangeNotification(oldInternship, newInternship) {
  const notification = document.createElement('div');
  notification.className = 'status-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${newInternship.status === 'approved' ? '#d4edda' : '#f8d7da'};
    color: ${newInternship.status === 'approved' ? '#155724' : '#721c24'};
    border: 1px solid ${newInternship.status === 'approved' ? '#c3e6cb' : '#f5c6cb'};
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;
  
  notification.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">
      ${newInternship.status === 'approved' ? '✅ Approved!' : '❌ Declined'}
    </div>
    <div style="font-size: 14px;">
      <strong>${newInternship.companyName}</strong><br>
      Status changed from <em>${oldInternship.status}</em> to <em>${newInternship.status}</em>
    </div>
    <button onclick="this.parentElement.remove()" style="
      position: absolute;
      top: 5px;
      right: 10px;
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: inherit;
    ">×</button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Update statistics
async function updateStats() {
  const approvedCount = allInternships.filter(i => i.status === 'approved').length;
  const pendingCount = allInternships.filter(i => i.status === 'pending').length;
  const totalCount = allInternships.length;
  
  document.getElementById('approvedCount').textContent = approvedCount;
  document.getElementById('pendingCount').textContent = pendingCount;
  document.getElementById('totalCount').textContent = totalCount;
}

// Render table
function renderTable() {
  const tbody = document.querySelector('#internshipTable tbody');
  tbody.innerHTML = '';
  
  filteredInternships.forEach(internship => {
    const tr = document.createElement('tr');
    
    // Add visual indicators for status changes
    if (internship.status === 'approved') {
      tr.style.backgroundColor = '#e6ffe6';
      tr.style.borderLeft = '4px solid #28a745';
    } else if (internship.status === 'declined') {
      tr.style.backgroundColor = '#ffe6e6';
      tr.style.borderLeft = '4px solid #dc3545';
    }
    
    tr.innerHTML = `
      <td>${internship.companyName}</td>
      <td>${internship.location}</td>
      <td>${new Date(internship.startDate).toLocaleDateString()}</td>
      <td>${new Date(internship.endDate).toLocaleDateString()}</td>
      <td>${internship.duration}</td>
      <td>${internship.semester}</td>
      <td>
        <span style="font-weight: bold; color: ${internship.affidavit === 'Yes' ? '#28a745' : '#dc3545'};">
          ${internship.affidavit}
        </span>
      </td>
      <td>
        <span class="status-badge status-${internship.status}">
          ${internship.status.charAt(0).toUpperCase() + internship.status.slice(1)}
        </span>
        ${internship.approvedAt ? `<br><small style="color: #666;">Updated: ${new Date(internship.approvedAt).toLocaleDateString()}</small>` : ''}
      </td>
      <td>
        ${internship.status === 'pending' ? `
          <button onclick="editInternship('${internship._id}')" class="btn-small">Edit</button>
          <button onclick="deleteInternship('${internship._id}')" class="btn-small btn-danger">Delete</button>
        ` : `
          <span class="text-muted">${internship.status.charAt(0).toUpperCase() + internship.status.slice(1)}</span>
        `}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Add internship
document.getElementById('internshipForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    companyName: document.getElementById('companyName').value,
    location: document.getElementById('location').value,
    startDate: document.getElementById('startDate').value,
    endDate: document.getElementById('endDate').value,
    duration: document.getElementById('duration').value,
    stipend: document.getElementById('stipend').value,
    mentorName: document.getElementById('mentorName').value,
    mentorContact: document.getElementById('mentorContact').value,
    semester: document.getElementById('semester').value,
    affidavit: document.getElementById('affidavit').value
  };
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      alert('Internship added successfully!');
      document.getElementById('internshipForm').reset();
      fetchInternships();
      showTab('table');
    } else {
      const error = await response.json();
      alert(error.message);
    }
  } catch (error) {
    alert('Failed to add internship. Please try again.');
  }
});

// Edit internship
async function editInternship(id) {
  const internship = allInternships.find(i => i._id === id);
  if (!internship) return;
  
  // Populate form with internship data
  document.getElementById('companyName').value = internship.companyName;
  document.getElementById('location').value = internship.location;
  document.getElementById('startDate').value = internship.startDate.split('T')[0];
  document.getElementById('endDate').value = internship.endDate.split('T')[0];
  document.getElementById('duration').value = internship.duration;
  document.getElementById('stipend').value = internship.stipend || '';
  document.getElementById('mentorName').value = internship.mentorName || '';
  document.getElementById('mentorContact').value = internship.mentorContact || '';
  document.getElementById('semester').value = internship.semester;
  document.getElementById('affidavit').value = internship.affidavit;
  
  // Store the ID for update
  document.getElementById('internshipForm').dataset.updateId = id;
  
  showTab('form');
}

// Delete internship
async function deleteInternship(id) {
  if (!confirm('Are you sure you want to delete this internship?')) return;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      alert('Internship deleted successfully!');
      fetchInternships();
    } else {
      alert('Failed to delete internship.');
    }
  } catch (error) {
    alert('Failed to delete internship. Please try again.');
  }
}

// Filter by year
function filterByYear() {
  const year = document.getElementById('yearFilter').value;
  if (year) {
    filteredInternships = allInternships.filter(i => i.academicYear === year);
  } else {
    filteredInternships = allInternships;
  }
  renderTable();
}

// Filter by status
function filterByStatus() {
  const status = document.getElementById('statusFilter').value;
  if (status) {
    filteredInternships = allInternships.filter(i => i.status === status);
  } else {
    filteredInternships = allInternships;
  }
  renderTable();
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}
