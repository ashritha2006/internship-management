const API_URL = 'https://internship-management-buoe.onrender.com/api/internships';
let allInternships = [];
let filteredInternships = [];

// Check authentication
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token || user.role !== 'admin') {
    window.location.href = 'admin-login.html';
    return;
  }
  
  fetchInternships();
});

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
      allInternships = await response.json();
      filteredInternships = allInternships;
      renderTable();
      updateStats();
    } else {
      console.error('Failed to fetch internships');
    }
  } catch (error) {
    console.error('Error fetching internships:', error);
  }
}

// Update statistics
function updateStats() {
  const totalCount = allInternships.length;
  const pendingCount = allInternships.filter(i => i.status === 'pending').length;
  const approvedCount = allInternships.filter(i => i.status === 'approved').length;
  const declinedCount = allInternships.filter(i => i.status === 'declined').length;
  const withAffidavitCount = allInternships.filter(i => i.affidavit === 'Yes').length;
  const withoutAffidavitCount = allInternships.filter(i => i.affidavit === 'No').length;
  
  document.getElementById('totalCount').textContent = totalCount;
  document.getElementById('pendingCount').textContent = pendingCount;
  document.getElementById('approvedCount').textContent = approvedCount;
  document.getElementById('declinedCount').textContent = declinedCount;
  document.getElementById('withAffidavitCount').textContent = withAffidavitCount;
  document.getElementById('withoutAffidavitCount').textContent = withoutAffidavitCount;
}

// Render table
function renderTable() {
  const tbody = document.querySelector('#internshipTable tbody');
  tbody.innerHTML = '';
  
  filteredInternships.forEach(internship => {
    const tr = document.createElement('tr');
    
    // Highlight rows with "No" affidavit
    if (internship.affidavit === 'No' && internship.status === 'pending') {
      tr.style.backgroundColor = '#ffe6e6';
      tr.style.borderLeft = '4px solid #dc3545';
    } else if (internship.affidavit === 'Yes' && internship.status === 'pending') {
      tr.style.backgroundColor = '#e6ffe6';
      tr.style.borderLeft = '4px solid #28a745';
    }
    
    tr.innerHTML = `
      <td>${internship.studentName}</td>
      <td>${internship.rollNumber}</td>
      <td>${internship.department}</td>
      <td>${internship.email}</td>
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
      <td>${internship.academicYear}</td>
      <td>
        <span class="status-badge status-${internship.status}">
          ${internship.status.charAt(0).toUpperCase() + internship.status.slice(1)}
        </span>
      </td>
      <td>
        ${internship.status === 'pending' ? `
          <button onclick="approveInternship('${internship._id}', 'approved')" class="btn-small btn-success">Approve</button>
          <button onclick="approveInternship('${internship._id}', 'declined')" class="btn-small btn-danger">Decline</button>
        ` : `
          <span class="text-muted">${internship.status.charAt(0).toUpperCase() + internship.status.slice(1)}</span>
        `}
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  // Update bulk action info
  updateBulkActionInfo();
}

// Approve/Decline internship
async function approveInternship(id, status) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    
    if (response.ok) {
      alert(`Internship ${status} successfully!`);
      fetchInternships();
    } else {
      const error = await response.json();
      alert(error.message);
    }
  } catch (error) {
    alert('Failed to update internship status. Please try again.');
  }
}

// Apply search filter
function applySearch() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  
  filteredInternships = allInternships.filter(internship => {
    return (
      internship.studentName.toLowerCase().includes(searchTerm) ||
      internship.rollNumber.toLowerCase().includes(searchTerm) ||
      internship.companyName.toLowerCase().includes(searchTerm) ||
      internship.department.toLowerCase().includes(searchTerm) ||
      internship.email.toLowerCase().includes(searchTerm)
    );
  });
  
  renderTable();
}

// Apply filters
function applyFilter() {
  const statusFilter = document.getElementById('statusFilter').value;
  const affidavitFilter = document.getElementById('affidavitFilter').value;
  const departmentFilter = document.getElementById('departmentFilter').value;
  
  filteredInternships = allInternships.filter(internship => {
    let matches = true;
    
    if (statusFilter && internship.status !== statusFilter) {
      matches = false;
    }
    
    if (affidavitFilter && internship.affidavit !== affidavitFilter) {
      matches = false;
    }
    
    if (departmentFilter && internship.department !== departmentFilter) {
      matches = false;
    }
    
    return matches;
  });
  
  renderTable();
}

// Export filtered data
function exportFiltered() {
  const ids = filteredInternships.map(i => i._id).join(',');
  const token = localStorage.getItem('token');
  
  // Create a temporary link to download the file
  const link = document.createElement('a');
  link.href = `${API_URL}/export?ids=${ids}`;
  link.style.display = 'none';
  
  // Add authorization header by modifying the fetch request
  fetch(`${API_URL}/export?ids=${ids}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = 'internships.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  })
  .catch(error => {
    console.error('Export failed:', error);
    alert('Failed to export data. Please try again.');
  });
}

// Update bulk action info
function updateBulkActionInfo() {
  const pendingNoAffidavit = allInternships.filter(i => i.status === 'pending' && i.affidavit === 'No').length;
  const pendingYesAffidavit = allInternships.filter(i => i.status === 'pending' && i.affidavit === 'Yes').length;
  
  const info = `Pending: ${pendingYesAffidavit} with "Yes" affidavit, ${pendingNoAffidavit} with "No" affidavit`;
  document.getElementById('bulkActionInfo').textContent = info;
}

// Decline all with "No" affidavit
async function declineAllNoAffidavit() {
  const noAffidavitPending = allInternships.filter(i => i.status === 'pending' && i.affidavit === 'No');
  
  if (noAffidavitPending.length === 0) {
    alert('No pending applications with "No" affidavit found.');
    return;
  }
  
  if (!confirm(`Are you sure you want to decline ${noAffidavitPending.length} application(s) with "No" affidavit?`)) {
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    let successCount = 0;
    let failCount = 0;
    
    for (const internship of noAffidavitPending) {
      try {
        const response = await fetch(`${API_URL}/${internship._id}/approve`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'declined' })
        });
        
        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }
    
    alert(`Successfully declined ${successCount} application(s). ${failCount > 0 ? `Failed to decline ${failCount} application(s).` : ''}`);
    fetchInternships();
  } catch (error) {
    alert('Failed to decline applications. Please try again.');
  }
}

// Approve all with "Yes" affidavit
async function approveAllYesAffidavit() {
  const yesAffidavitPending = allInternships.filter(i => i.status === 'pending' && i.affidavit === 'Yes');
  
  if (yesAffidavitPending.length === 0) {
    alert('No pending applications with "Yes" affidavit found.');
    return;
  }
  
  if (!confirm(`Are you sure you want to approve ${yesAffidavitPending.length} application(s) with "Yes" affidavit?`)) {
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    let successCount = 0;
    let failCount = 0;
    
    for (const internship of yesAffidavitPending) {
      try {
        const response = await fetch(`${API_URL}/${internship._id}/approve`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'approved' })
        });
        
        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }
    
    alert(`Successfully approved ${successCount} application(s). ${failCount > 0 ? `Failed to approve ${failCount} application(s).` : ''}`);
    fetchInternships();
  } catch (error) {
    alert('Failed to approve applications. Please try again.');
  }
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'admin-login.html';
}
