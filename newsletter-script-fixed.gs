/**
 * Google Apps Script for Newsletter Signup - GDPR Compliant (FIXED VERSION)
 *
 * SETUP INSTRUCTIONS:
 * 1. Replace SHEET_ID with your Google Sheet ID
 * 2. Update SHEET_NAME if your sheet tab has a different name
 * 3. Deploy as Web App (Execute as: Me, Who has access: Anyone)
 */

// CONFIGURATION - CONFIGURED!
const SHEET_ID = '18S_BUfSkc_K4OjjUA3hJEtrYxbEa0fOvq_m1Of_o9ho'; // Your Google Sheet ID
const SHEET_NAME = 'Sheet1'; // Your sheet tab name
const RATE_LIMIT_MINUTES = 60;
const MAX_SUBMISSIONS_PER_IP = 5;

/**
 * Handle POST requests from newsletter form
 */
function doPost(e) {
  try {
    Logger.log('=== Newsletter Signup Request ===');
    Logger.log('Raw request: ' + JSON.stringify(e));

    // Handle both JSON and form-encoded data
    let email, consent, ip;

    if (e.postData && e.postData.contents) {
      // JSON data
      const params = JSON.parse(e.postData.contents);
      email = params.email;
      consent = params.consent;
      ip = getClientIp(e);
      Logger.log('Parsed JSON - Email: ' + email + ', Consent: ' + consent);
    } else if (e.parameter) {
      // URL-encoded data
      email = e.parameter.email;
      consent = e.parameter.consent;
      ip = getClientIp(e);
      Logger.log('URL params - Email: ' + email + ', Consent: ' + consent);
    } else {
      Logger.log('ERROR: No data received');
      return createResponse(false, 'No data received');
    }

    // Validation
    if (!email || !consent) {
      Logger.log('ERROR: Missing email or consent');
      return createResponse(false, 'Email and consent are required');
    }

    if (!validateEmail(email)) {
      Logger.log('ERROR: Invalid email format');
      return createResponse(false, 'Invalid email address');
    }

    if (consent !== 'true' && consent !== true) {
      Logger.log('ERROR: Consent not given');
      return createResponse(false, 'Consent is required to subscribe');
    }

    // Rate limiting
    if (!checkRateLimit(ip)) {
      Logger.log('ERROR: Rate limit exceeded for IP: ' + ip);
      return createResponse(false, 'Too many requests. Please try again later.');
    }

    // Check for duplicate email
    if (isDuplicateEmail(email)) {
      Logger.log('ERROR: Duplicate email: ' + email);
      return createResponse(false, 'This email is already subscribed');
    }

    // Save to sheet
    const timestamp = new Date();
    const consentDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

    Logger.log('Opening sheet: ' + SHEET_ID);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet) {
      Logger.log('ERROR: Sheet not found: ' + SHEET_NAME);
      return createResponse(false, 'Configuration error. Please contact support.');
    }

    Logger.log('Appending row to sheet...');
    sheet.appendRow([
      timestamp,
      email,
      'Yes',
      ip,
      consentDate,
      'Active'
    ]);

    Logger.log('SUCCESS: New subscriber added: ' + email);
    return createResponse(true, 'Thank you for subscribing! 🐕');

  } catch (error) {
    Logger.log('FATAL ERROR: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    return createResponse(false, 'An error occurred. Please try again. Error: ' + error.message);
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput('Newsletter signup endpoint is working. Use POST to submit.')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Validate email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check for duplicate email in sheet
 */
function isDuplicateEmail(email) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();

    // Check column B (index 1) for email, skip header row
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] && data[i][1].toString().toLowerCase() === email.toLowerCase() && data[i][5] === 'Active') {
        return true;
      }
    }
    return false;
  } catch (error) {
    Logger.log('Error checking duplicates: ' + error.message);
    return false; // Don't block signup on error
  }
}

/**
 * Rate limiting - check if IP has exceeded submission limit
 */
function checkRateLimit(ip) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const cutoffTime = new Date(Date.now() - (RATE_LIMIT_MINUTES * 60 * 1000));

    let count = 0;
    for (let i = 1; i < data.length; i++) {
      const rowTimestamp = new Date(data[i][0]);
      const rowIp = data[i][3];

      if (rowIp === ip && rowTimestamp > cutoffTime) {
        count++;
      }
    }

    return count < MAX_SUBMISSIONS_PER_IP;
  } catch (error) {
    Logger.log('Error checking rate limit: ' + error.message);
    return true; // Don't block on error
  }
}

/**
 * Get client IP address from request
 */
function getClientIp(e) {
  try {
    // Try multiple methods to get IP
    if (e.parameter && e.parameter['X-Forwarded-For']) {
      return e.parameter['X-Forwarded-For'].split(',')[0].trim();
    }
    // Apps Script doesn't provide direct access to IP, so we log 'web-app'
    return 'web-app-user';
  } catch (error) {
    return 'unknown';
  }
}

function createResponse(success, message) {
  var response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };

  Logger.log('Response: ' + JSON.stringify(response));

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function - Run this to test the script
 */
function testNewsletter() {
  Logger.clear();

  const testData = {
    email: 'test@example.com',
    consent: 'true'
  };

  const e = {
    postData: {
      contents: JSON.stringify(testData),
      type: 'application/json'
    },
    parameter: {},
    contentLength: JSON.stringify(testData).length
  };

  Logger.log('Testing with email: ' + testData.email);
  const result = doPost(e);
  Logger.log('Test result: ' + result.getContent());

  // View the logs
  const logs = Logger.getLog();
  Logger.log('\n=== FULL LOG ===\n' + logs);
}
