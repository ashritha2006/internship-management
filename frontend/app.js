const API_URL = 'http://localhost:5000/api/internships';
const form = document.getElementById('internshipForm');
const tableBody = document.querySelector('#internshipTable tbody');
const filterInput = document.getElementById('filterInput');

let allData = []; // Store all data fetched from backend
let filteredData = []; // Store filtered data

// ---------- Tabs ----------
function showTab(tabName) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
}

// ---------- Fetch Records ----------
async function fetchRecords() {
  const res = await fetch(API_URL);
  allData = await res.json();
  filteredData = allData; // Initially, filtered data = all data
  renderTable(filteredData);
}

// ---------- Render Table ----------
function renderTable(data) {
  tableBody.innerHTML = '';
  data.forEach(record => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${record.studentName}</td>
      <td>${record.rollNumber}</td>
      <td>${record.department}</td>
      <td>${record.email}</td>
      <td>${record.companyName}</td>
      <td>${record.location}</td>
      <td>${new Date(record.startDate).toLocaleDateString()}</td>
      <td>${new Date(record.endDate).toLocaleDateString()}</td>
      <td>${record.duration}</td>
      <td>${record.stipend}</td>
      <td>${record.mentorName}</td>
      <td>${record.mentorContact}</td>
      <td>${record.mentorRole}</td>
      <td>
        <button onclick="editRecord('${record._id}')">Update</button>
        <button onclick="deleteRecord('${record._id}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// ---------- Add / Update ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const record = {
    studentName: document.getElementById('studentName').value,
    rollNumber: document.getElementById('rollNumber').value,
    department: document.getElementById('department').value,
    email: document.getElementById('email').value,
    companyName: document.getElementById('companyName').value,
    location: document.getElementById('location').value,
    startDate: document.getElementById('startDate').value,
    endDate: document.getElementById('endDate').value,
    duration: document.getElementById('duration').value,
    stipend: document.getElementById('stipend').value,
    mentorName: document.getElementById('mentorName').value,
    mentorContact: document.getElementById('mentorContact').value,
    mentorRole: document.getElementById('mentorRole').value,
  };

  const updateId = form.dataset.updateId;
  if (updateId) {
    await fetch(`${API_URL}/${updateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    form.dataset.updateId = '';
    alert('Record updated successfully!');
  } else {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    alert('Record added successfully!');
  }

  form.reset();
  fetchRecords();
  showTab('table');
});

// ---------- Edit ----------
async function editRecord(id) {
  const record = allData.find(r => r._id === id);
  if (!record) return alert('Record not found!');

  document.getElementById('studentName').value = record.studentName;
  document.getElementById('rollNumber').value = record.rollNumber;
  document.getElementById('department').value = record.department;
  document.getElementById('email').value = record.email;
  document.getElementById('companyName').value = record.companyName;
  document.getElementById('location').value = record.location;
  document.getElementById('startDate').value = record.startDate.split('T')[0];
  document.getElementById('endDate').value = record.endDate.split('T')[0];
  document.getElementById('duration').value = record.duration;
  document.getElementById('stipend').value = record.stipend;
  document.getElementById('mentorName').value = record.mentorName;
  document.getElementById('mentorContact').value = record.mentorContact;
  document.getElementById('mentorRole').value = record.mentorRole;

  form.dataset.updateId = record._id;
  showTab('form');
}

// ---------- Delete ----------
async function deleteRecord(id) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  fetchRecords();
}

// ---------- Filter ----------
function applyFilter() {
  const filterValue = filterInput.value.toLowerCase();

  filteredData = allData.filter(record => {
    // Check all properties of the record
    return Object.values(record).some(value => {
      if (value) {
        // Convert to string and lowercase for comparison
        return value.toString().toLowerCase().includes(filterValue);
      }
      return false;
    });
  });

  renderTable(filteredData);
}

// ---------- Export Filtered ----------
function exportFiltered() {
  const ids = filteredData.map(r => r._id).join(',');
  window.open(`${API_URL}/export?ids=${ids}`, '_blank');
}

// ---------- Initial Load ----------
fetchRecords();
