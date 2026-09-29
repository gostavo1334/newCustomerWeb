// Google Sheets CRUD Application
// Frontend JavaScript

// State
let currentData = [];
let headers = [];
let isLoading = false;

// DOM Elements
const tableHeader = document.getElementById('tableHeader');
const tableBody = document.getElementById('tableBody');
const refreshBtn = document.getElementById('refreshBtn');
const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const dataForm = document.getElementById('dataForm');
const formFields = document.getElementById('formFields');
const modalTitle = document.getElementById('modalTitle');
const statusBar = document.getElementById('status');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');

// Current editing state
let currentRow = null;

// API Base URL
const API_BASE = window.location.origin;

// Check if a column should be displayed on index page
// We want: Name, Phone Number, Address
function shouldDisplayColumn(header) {
  const normalized = header.toLowerCase().trim();
  
  // Match NAME columns
  if (normalized === 'name' || 
      normalized.includes('name') ||
      normalized === 'first_name' || 
      normalized === 'full_name' ||
      normalized.includes('first name') ||
      normalized.includes('full name')) {
    return true;
  }
  
  // Match PHONE NUMBER columns
  if (normalized === 'phone' || 
      normalized === 'phone_number' ||
      normalized.includes('phone') ||
      normalized === 'mobile' ||
      normalized.includes('mobile') ||
      normalized === 'contact_number' ||
      normalized.includes('contact') ||
      normalized.includes('tel') ||
      normalized.includes('cell')) {
    return true;
  }
  
  // Match ADDRESS columns
  if (normalized === 'address' || 
      normalized.includes('address') ||
      normalized === 'home_address' ||
      normalized.includes('location') ||
      normalized.includes('city') ||
      normalized.includes('street') ||
      normalized.includes('residence')) {
    return true;
  }
  
  return false;
}

// Initialize the application
async function init() {
    showLoading();
    await fetchHeaders();
    await fetchData();
    setupEventListeners();
}

// Show loading state
function showLoading() {
    isLoading = true;
    loadingEl.style.display = 'flex';
    tableHeader.innerHTML = '<tr></tr>';
    tableBody.innerHTML = '';
    errorEl.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    isLoading = false;
    loadingEl.style.display = 'none';
}

// Show error
function showError(message) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    hideLoading();
}

// Update status
function updateStatus(message) {
    statusBar.textContent = message;
    setTimeout(() => {
        statusBar.textContent = '';
    }, 3000);
}

// Fetch headers from the sheet
async function fetchHeaders() {
    try {
        const response = await fetch(`${API_BASE}/api/headers`);
        if (!response.ok) {
            throw new Error('Failed to fetch headers');
        }
        headers = await response.json();
    } catch (error) {
        console.error('Error fetching headers:', error);
        // Use default headers
        headers = ['id', 'name', 'email', 'status'];
    }
}

// Fetch data from the sheet
async function fetchData() {
    try {
        const response = await fetch(`${API_BASE}/api/data`);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        currentData = await response.json();
        renderTable();
        hideLoading();
        updateStatus(`Loaded ${currentData.length} rows from Google Sheets`);
    } catch (error) {
        console.error('Error fetching data:', error);
        showError('Failed to load data from Google Sheets. Please check your connection and credentials.');
    }
}

// Render table with data
function renderTable() {
    // Get display columns that exist in headers
    let displayHeaders = headers.filter(h => shouldDisplayColumn(h));
    
    // Fallback: if no columns match, show all headers
    if (displayHeaders.length === 0) {
      displayHeaders = [...headers];
    }
    
    // Render header
    const headerRow = tableHeader.querySelector('tr');
    headerRow.innerHTML = '';
    
    displayHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    
    // Add actions header
    const actionsTh = document.createElement('th');
    actionsTh.textContent = 'Actions';
    headerRow.appendChild(actionsTh);
    
    // Render body
    tableBody.innerHTML = '';
    
    if (currentData.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = displayHeaders.length + 1;
        td.textContent = 'No data available. Click "Add New Row" to add data.';
        td.style.textAlign = 'center';
        td.style.padding = '40px';
        td.style.color = '#718096';
        tr.appendChild(td);
        tableBody.appendChild(tr);
        return;
    }
    
    currentData.forEach((row, index) => {
        const tr = document.createElement('tr');
        
        // Add data cells - only for display columns
        displayHeaders.forEach(header => {
            const key = header.toLowerCase().replace(/\s+/g, '_');
            const td = document.createElement('td');
            td.textContent = row[key] || '';
            tr.appendChild(td);
        });
        
        // Add actions cell
        const actionsTd = document.createElement('td');
        actionsTd.className = 'actions';
        
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-info btn-sm';
        viewBtn.textContent = 'View';
        viewBtn.addEventListener('click', () => viewDetails(row));
        actionsTd.appendChild(viewBtn);
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-primary btn-sm';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => openEditModal(row));
        actionsTd.appendChild(editBtn);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger btn-sm';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => confirmDelete(row));
        actionsTd.appendChild(deleteBtn);
        
        tr.appendChild(actionsTd);
        tableBody.appendChild(tr);
    });
}

// View details for a row
function viewDetails(row) {
    const rowNumber = row._row || (currentData.indexOf(row) + 2);
    window.location.href = `detail.html?row=${rowNumber}`;
}

// Open modal for adding new row
function openAddModal() {
    currentRow = null;
    modalTitle.textContent = 'Add New Row';
    populateForm({});
    modal.style.display = 'flex';
}

// Open modal for editing row
function openEditModal(row) {
    currentRow = row;
    modalTitle.textContent = 'Edit Row';
    populateForm(row);
    modal.style.display = 'flex';
}

// Populate form with data
function populateForm(data) {
    formFields.innerHTML = '';
    
    // Options for dropdowns
    const customerTypeOptions = [
        'អ្នកលក់ដុំ',
        'អ្នកលក់រាយ'
    ];
    
    const cargoTypeOptions = [
        'ខោអាវ គ្រឿង​ក្រអូប ក្រោម 1kg',
        'របស់តូច ក្រោម 3kg',
        'អីវ៉ាន់កេស ក្រោម 5Kg',
        'កេស បេ ក្រោម 10 គីឡូ',
        'កេស បេ',
        'ក្រោម 30 គីឡូ',
        'កេស បេ ក្រោម 50 គីឡូ',
        'ក្រោម 100 គីឡួ',
        'លើស 100 គីឡួ'
    ];
    
    const meetingNumberOptions = ['1', '2', '3', '4', '5'];
    
    const contactMethodOptions = [
        'ទៅជួបផ្ទាល់',
        'តាមលេខទូរស័ព្ទ',
        'តាម Telegram',
        'ផ្សេងៗ'
    ];
    
    const resultOptions = [
        'ប្រើសេវាយើងហើយ',
        'គាត់កំពុងសិក្សា',
        'បដិសេធមិនប្រើ',
        'លែងប្រើទៀត'
    ];
    
    headers.forEach(header => {
        const key = header.toLowerCase().replace(/\s+/g, '_');
        const group = document.createElement('div');
        group.className = 'form-group';
        
        const label = document.createElement('label');
        label.textContent = header;
        label.htmlFor = key;
        
        // Check what type of field this is
        const normalizedHeader = header.toLowerCase();
        const isCustomerType = normalizedHeader.includes('customer') && 
                             (normalizedHeader.includes('type') || normalizedHeader.includes('kind'));
        const isCargoType = (normalizedHeader.includes('cargo') || normalizedHeader.includes('section')) &&
                           (normalizedHeader.includes('type') || normalizedHeader.includes('kind') || normalizedHeader.includes('/'));
        const isMeetingNumber = normalizedHeader.includes('meeting') && 
                               normalizedHeader.includes('number') &&
                               normalizedHeader.includes('customer');
        const isContactMethod = normalizedHeader.includes('contact') && 
                               (normalizedHeader.includes('method') || normalizedHeader.includes('way'));
        const isResult = normalizedHeader.includes('result');
        
        let inputElement;
        if (isCustomerType) {
            // Create dropdown for Customer's Type
            inputElement = createDropdown(key, customerTypeOptions, data[key]);
        } else if (isCargoType) {
            // Create dropdown for Section/Type of Cargo
            inputElement = createDropdown(key, cargoTypeOptions, data[key]);
        } else if (isMeetingNumber) {
            // Create dropdown for Number of meeting Customer
            inputElement = createDropdown(key, meetingNumberOptions, data[key]);
        } else if (isContactMethod) {
            // Create dropdown for Contact Method
            inputElement = createDropdown(key, contactMethodOptions, data[key]);
        } else if (isResult) {
            // Create dropdown for Result
            inputElement = createDropdown(key, resultOptions, data[key]);
        } else {
            // Regular text input
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.id = key;
            inputElement.name = key;
            inputElement.value = data[key] || '';
        }
        
        group.appendChild(label);
        group.appendChild(inputElement);
        formFields.appendChild(group);
    });
}

// Helper function to create a dropdown select element
function createDropdown(id, options, selectedValue) {
    const select = document.createElement('select');
    select.id = id;
    select.name = id;
    
    options.forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText;
        option.textContent = optionText;
        if (optionText === selectedValue) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    
    return select;
}

// Confirm delete
function confirmDelete(row) {
    if (confirm(`Are you sure you want to delete this row? This cannot be undone.`)) {
        deleteRow(row);
    }
}

// Delete row
async function deleteRow(row) {
    if (isLoading) return;
    
    try {
        showLoading();
        const rowNumber = row._row || (currentData.indexOf(row) + 2);
        
        const response = await fetch(`${API_BASE}/api/data/${rowNumber}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete row');
        }
        
        updateStatus('Row deleted successfully!');
        await fetchData();
    } catch (error) {
        console.error('Error deleting row:', error);
        showError('Failed to delete row. Please try again.');
    }
}

// Save data (add or update)
async function saveData(data) {
    if (isLoading) return;
    
    try {
        showLoading();
        closeModal.click();
        
        if (currentRow) {
            // Update existing row
            const rowNumber = currentRow._row || (currentData.indexOf(currentRow) + 2);
            const response = await fetch(`${API_BASE}/api/data/${rowNumber}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update row');
            }
            
            updateStatus('Row updated successfully!');
        } else {
            // Add new row
            const response = await fetch(`${API_BASE}/api/data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                throw new Error('Failed to add row');
            }
            
            updateStatus('Row added successfully!');
        }
        
        await fetchData();
    } catch (error) {
        console.error('Error saving data:', error);
        showError('Failed to save data. Please try again.');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Refresh button
    refreshBtn.addEventListener('click', fetchData);
    
    // Add button
    addBtn.addEventListener('click', openAddModal);
    
    // Close modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Form submit
    dataForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {};
        headers.forEach(header => {
            const key = header.toLowerCase().replace(/\s+/g, '_');
            const input = document.getElementById(key);
            formData[key] = input ? input.value : '';
        });
        
        saveData(formData);
    });
    
    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Auto-refresh every 30 seconds
    setInterval(fetchData, 30000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
