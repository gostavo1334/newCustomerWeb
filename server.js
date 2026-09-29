require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Configuration - User should set these in .env
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || 'your-spreadsheet-id';
const SHEET_NAME = process.env.SHEET_NAME || 'Sheet1';
const RANGE = `${SHEET_NAME}!A:Z`;

// Helper function to get headers from the sheet
async function getHeaders() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!1:1`,
    });
    return response.data.values[0] || ['id', 'name', 'email', 'status'];
  } catch (error) {
    console.error('Error getting headers:', error.message);
    return ['id', 'name', 'email', 'status'];
  }
}

// Get all data from the sheet
app.get('/api/data', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });
    
    const headers = (await getHeaders()).map(h => h.toLowerCase().replace(/\s+/g, '_'));
    const rows = response.data.values || [];
    
    // Skip header row and convert to objects
    const data = rows.slice(1).map((row, index) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] || '';
      });
      obj._row = index + 2; // Track original row number for updates
      return obj;
    });
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from Google Sheets' });
  }
});

// Get single row by row number
app.get('/api/data/row/:row', async (req, res) => {
  try {
    const rowNumber = parseInt(req.params.row);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!${rowNumber}:${rowNumber}`,
    });
    
    const headers = (await getHeaders()).map(h => h.toLowerCase().replace(/\s+/g, '_'));
    const row = response.data.values[0] || [];
    
    // Convert to object
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    obj._row = rowNumber; // Track original row number
    
    res.json(obj);
  } catch (error) {
    console.error('Error fetching single row:', error.message);
    res.status(500).json({ error: 'Failed to fetch row from Google Sheets' });
  }
});

// Add new row
app.post('/api/data', async (req, res) => {
  try {
    const newData = req.body;
    const headers = await getHeaders();
    
    // Create row array in the same order as headers
    const row = headers.map(header => {
      const key = header.toLowerCase().replace(/\s+/g, '_');
      return newData[key] || '';
    });
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
    
    res.json({ message: 'Data added successfully', row: response.data.updates.updatedRange });
  } catch (error) {
    console.error('Error adding data:', error.message);
    res.status(500).json({ error: 'Failed to add data to Google Sheets' });
  }
});

// Update existing row
app.put('/api/data/:row', async (req, res) => {
  try {
    const rowNumber = parseInt(req.params.row);
    const updatedData = req.body;
    const headers = await getHeaders();
    
    // Create row array in the same order as headers
    const row = headers.map(header => {
      const key = header.toLowerCase().replace(/\s+/g, '_');
      return updatedData[key] || '';
    });
    
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${rowNumber}:Z${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
    
    res.json({ message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error updating data:', error.message);
    res.status(500).json({ error: 'Failed to update data in Google Sheets' });
  }
});

// Delete row
app.delete('/api/data/:row', async (req, res) => {
  try {
    const rowNumber = parseInt(req.params.row);
    
    // Delete by clearing the row
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${rowNumber}:Z${rowNumber}`,
    });
    
    res.json({ message: 'Row deleted successfully' });
  } catch (error) {
    console.error('Error deleting data:', error.message);
    res.status(500).json({ error: 'Failed to delete data from Google Sheets' });
  }
});

// Get sheet info (headers)
app.get('/api/headers', async (req, res) => {
  try {
    const headers = await getHeaders();
    res.json(headers);
  } catch (error) {
    console.error('Error getting headers:', error.message);
    res.status(500).json({ error: 'Failed to get headers' });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Access the application at http://localhost:${PORT}`);
});

module.exports = app;
