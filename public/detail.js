// Google Sheets CRUD Application - Detail Page
// Frontend JavaScript

// State
let rowData = null;
let headers = [];
let isLoading = false;

// DOM Elements
const backBtn = document.getElementById('backBtn');
const detailContent = document.getElementById('detailContent');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const statusBar = document.getElementById('status');

// API Base URL
const API_BASE = window.location.origin;

// Get row number from URL parameter
function getRowNumber() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('row')) || null;
}

// Initialize the application
async function init() {
    const rowNumber = getRowNumber();
    
    if (!rowNumber) {
        showError('No contact specified. Please select a contact from the list.');
        return;
    }
    
    showLoading();
    await fetchHeaders();
    await fetchRowData(rowNumber);
    setupEventListeners();
}

// Show loading state
function showLoading() {
    isLoading = true;
    loadingEl.style.display = 'flex';
    detailContent.innerHTML = '';
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
        headers = ['id', 'name', 'email', 'phone_number', 'address', 'status'];
    }
}

// Fetch single row data
async function fetchRowData(rowNumber) {
    try {
        const response = await fetch(`${API_BASE}/api/data/row/${rowNumber}`);
        if (!response.ok) {
            throw new Error('Failed to fetch row data');
        }
        rowData = await response.json();
        renderDetail();
        hideLoading();
        updateStatus(`Loaded contact from row ${rowNumber}`);
    } catch (error) {
        console.error('Error fetching row data:', error);
        showError('Failed to load contact details. Please try again.');
    }
}

// Render detail view
function renderDetail() {
    if (!rowData) {
        showError('No data available to display.');
        return;
    }
    
    detailContent.innerHTML = '';
    
    // Create detail card
    const card = document.createElement('div');
    card.className = 'detail-card';
    
    // Add title
    const title = document.createElement('h2');
    const name = rowData.name || rowData.first_name || rowData.full_name || 'Unknown Contact';
    title.textContent = name;
    title.className = 'detail-title';
    card.appendChild(title);
    
    // Create detail grid
    const grid = document.createElement('div');
    grid.className = 'detail-grid';
    
    // Add all fields
    headers.forEach(header => {
        const key = header.toLowerCase().replace(/\s+/g, '_');
        const value = rowData[key] || '';
        
        // Skip if no value
        if (!value && value !== 0) return;
        
        const field = document.createElement('div');
        field.className = 'detail-field';
        
        const label = document.createElement('div');
        label.className = 'detail-label';
        label.textContent = header;
        
        const val = document.createElement('div');
        val.className = 'detail-value';
        val.textContent = value;
        
        field.appendChild(label);
        field.appendChild(val);
        grid.appendChild(field);
    });
    
    card.appendChild(grid);
    detailContent.appendChild(card);
}

// Setup event listeners
function setupEventListeners() {
    // Back button
    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
