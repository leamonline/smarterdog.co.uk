/**
 * Google Apps Script for Newsletter Signup - GDPR Compliant
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet named "Newsletter Subscribers"
 * 2. Add headers in row 1: Timestamp | Email | Consent | IP Address | Consent Date | Status
 * 3. Go to Extensions > Apps Script
 * 4. Paste this code
 * 5. Update SHEET_ID with your sheet ID (from URL)
 * 6. Deploy as Web App:
 *    - Click Deploy > New deployment
 *    - Select "Web app" type
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Copy the deployed URL and add to newsletter.js
 */

// CONFIGURATION
const SHEET_ID = 'YOUR_SHEET_ID_HERE'; // Replace with your actual sheet ID
const SHEET_NAME = 'Sheet1'; // Or your sheet tab name
const RATE_LIMIT_MINUTES = 60; // Time window for rate limiting
const MAX_SUBMISSIONS_PER_IP = 5; // Max submissions per IP in time window

/**
 * Handle POST requests from newsletter form
 */
function doPost(e) {
  try {
    // Parse request
    const params = JSON.parse(e.postData.contents);
    const email = params.email;
    const consent = params.consent;
    const ip = getClientIp(e);

    // Validation
    if (!email || !consent) {
      return createResponse(false, 'Email and consent are required');
    }

    if (!validateEmail(email)) {
      return createResponse(false, 'Invalid email address');
    }

    if (consent !== 'true') {
      return createResponse(false, 'Consent is required to subscribe');
    }

    // Rate limiting
    if (!checkRateLimit(ip)) {
      return createResponse(false, 'Too many requests. Please try again later.');
    }

    // Check for duplicate email
    if (isDuplicateEmail(email)) {
      return createResponse(false, 'This email is already subscribed');
    }

    // Save to sheet
    const timestamp = new Date();
    const consentDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    sheet.appendRow([
      timestamp,
      email,
      'Yes',
      ip,
      consentDate,
      'Active'
    ]);

    // Log success
    Logger.log(`New subscriber: ${email} from IP: ${ip}`);

    return createResponse(true, 'Thank you for subscribing! 🐕');

  } catch (error) {
    Logger.log(`Error: ${error.message}`);
    return createResponse(false, 'An error occurred. Please try again.');
  }
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
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  // Check column B (index 1) for email, skip header row
  for (let i = 1; i < data.length; i++) {
    if (data[i][1].toLowerCase() === email.toLowerCase() && data[i][5] === 'Active') {
      return true;
    }
  }
  return false;
}

/**
 * Rate limiting - check if IP has exceeded submission limit
 */
function checkRateLimit(ip) {
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
}

/**
 * Get client IP address from request
 */
function getClientIp(e) {
  try {
    // Try to get real IP from headers
    if (e.parameter && e.parameter['X-Forwarded-For']) {
      return e.parameter['X-Forwarded-For'].split(',')[0].trim();
    }
    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Create JSON response
 */
function createResponse(success, message) {
  const response = {
    success: success,
    message: message
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function - remove before deploying
 */
function testFunction() {
  const testData = {
    email: 'test@example.com',
    consent: 'true'
  };

  const e = {
    postData: {
      contents: JSON.stringify(testData)
    },
    parameter: {}
  };

  const result = doPost(e);
  Logger.log(result.getContent());
}
