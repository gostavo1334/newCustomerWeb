# Google Sheets CRUD Web Application

A web application that allows users to fetch, edit, delete, and add data from Google Sheets.

## Features

- **Fetch Data**: Automatically load data from your Google Sheet
- **Add Rows**: Add new rows to your spreadsheet
- **Edit Rows**: Update existing rows
- **Delete Rows**: Remove rows from your spreadsheet
- **Auto-refresh**: Data automatically refreshes every 30 seconds
- **Responsive Design**: Works on desktop and mobile devices
- **Clean UI**: Modern, intuitive interface

## Quick Start

### Prerequisites

1. **Node.js** (version 14 or higher)
2. **Google Cloud Project** with Google Sheets API enabled
3. **Google Sheet** that you want to connect to

### Step 1: Clone and Install

```bash
cd google-sheets-crud-app
npm install
```

### Step 2: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Navigate to APIs & Services > Library
   - Search for "Google Sheets API"
   - Click Enable

### Step 3: Create Service Account

1. In Google Cloud Console, go to **IAM & Admin > Service Accounts**
2. Click **Create Service Account**
3. Fill in the details and click **Create**
4. Under **Keys** tab, click **Add Key > Create New Key**
5. Select **JSON** format and click **Create**
6. Save the downloaded JSON file as `credentials.json` in your project root

### Step 4: Share Google Sheet with Service Account

1. Open your Google Sheet
2. Click **Share** button
3. Add the email address from your `credentials.json` file (looks like `your-service-account@project-id.iam.gserviceaccount.com`)
4. Grant **Editor** permissions

### Step 5: Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file:
   ```
   SPREADSHEET_ID=your-spreadsheet-id
   SHEET_NAME=Sheet1
   PORT=3000
   ```
   
   To get your `SPREADSHEET_ID`, look at your Google Sheet URL:
   `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

### Step 6: Run the Application

```bash
npm start
```

Then open your browser to: [http://localhost:3000](http://localhost:3000)

### For Development (with auto-restart)

```bash
npm install -g nodemon  # If not already installed
npm run dev
```

## Usage

### Data Format

The application will automatically detect column headers from the first row of your Google Sheet. Each column becomes a field that can be edited.

### Example Spreadsheet Structure

| id | name    | email           | status   |
|----|---------|-----------------|----------|
| 1  | John    | john@test.com   | Active   |
| 2  | Jane    | jane@test.com   | Inactive |

### Features in Action

- **View Data**: All data from your sheet is displayed in a table
- **Add Row**: Click "Add New Row" button, fill the form, and save
- **Edit Row**: Click the "Edit" button on any row, modify values, and save
- **Delete Row**: Click the "Delete" button and confirm to remove a row
- **Refresh**: Click "Refresh Data" or wait for auto-refresh

## Project Structure

```
google-sheets-crud-app/
├── server.js              # Backend server with Google Sheets API
├── package.json           # Dependencies and scripts
├── .env.example           # Environment configuration template
├── README.md              # This file
└── public/
    ├── index.html         # Frontend HTML
    ├── style.css          # Styles
    └── script.js          # Frontend JavaScript
```

## API Endpoints

| Method | Endpoint       | Description                     |
|--------|----------------|---------------------------------|
| GET    | /api/data      | Get all data from the sheet      |
| POST   | /api/data      | Add new row to the sheet         |
| PUT    | /api/data/:row | Update existing row              |
| DELETE | /api/data/:row | Delete row from the sheet        |
| GET    | /api/headers    | Get column headers from the sheet|

## Customization

### Change Column Headers

Edit your Google Sheet's first row to change the column headers. The application will automatically detect and use them.

### Change Styling

Modify `public/style.css` to customize the appearance.

### Add Validation

Edit `public/script.js` to add client-side validation for form fields.

## Troubleshooting

### "Failed to load data from Google Sheets"

1. Check that your `credentials.json` file is in the correct location
2. Verify that the service account email has **Editor** access to the spreadsheet
3. Ensure the `SPREADSHEET_ID` in your `.env` file is correct
4. Check that the Google Sheets API is enabled in your Google Cloud project

### "Permission denied" or "403 Forbidden"

- Make sure you've shared the Google Sheet with the service account email
- Ensure the service account has the **Editor** role, not just Viewer

### "Could not load the default credentials"

- Verify that `credentials.json` exists in your project root
- Check that the file path in `.env` is correct (or use the default)

### Port already in use

Change the `PORT` in your `.env` file to a different number (e.g., 3001, 8080).

## Security Notes

- **Service Account Credentials**: Never commit your `credentials.json` file to version control. Add it to your `.gitignore`.
- **HTTPS**: For production use, always use HTTPS and consider adding authentication to your endpoints.
- **CORS**: The application has CORS enabled for development. For production, restrict CORS to your domain.

## Deploying to Production

For production deployment:

1. Add authentication (e.g., JWT, OAuth) to protect your API endpoints
2. Use environment variables for all sensitive data
3. Set up HTTPS
4. Consider rate limiting for the API
5. Add proper error handling and logging

## Technologies Used

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express
- **Google Sheets API**: googleapis Node.js client
- **Styling**: Custom CSS with modern design

## License

MIT License
