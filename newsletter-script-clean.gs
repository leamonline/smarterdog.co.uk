/**
 * Google Apps Script for Newsletter Signup - GDPR Compliant
 */

// CONFIGURATION
var SHEET_ID = '18S_BUfSkc_K4OjjUA3hJEtrYxbEa0fOvq_m1Of_o9ho';
var SHEET_NAME = 'Sheet1';
var RATE_LIMIT_MINUTES = 60;
var MAX_SUBMISSIONS_PER_IP = 5;

function doPost(e) {
  try {
    Logger.log('=== Newsletter Signup Request ===');
    Logger.log('Raw request: ' + JSON.stringify(e));

    var email, consent, ip;

    if (e.postData && e.postData.contents) {
      var params = JSON.parse(e.postData.contents);
      email = params.email;
      consent = params.consent;
      ip = getClientIp(e);
      Logger.log('Parsed JSON - Email: ' + email + ', Consent: ' + consent);
    } else if (e.parameter) {
      email = e.parameter.email;
      consent = e.parameter.consent;
      ip = getClientIp(e);
      Logger.log('URL params - Email: ' + email + ', Consent: ' + consent);
    } else {
      Logger.log('ERROR: No data received');
      return createResponse(false, 'No data received');
    }

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

    if (!checkRateLimit(ip)) {
      Logger.log('ERROR: Rate limit exceeded for IP: ' + ip);
      return createResponse(false, 'Too many requests. Please try again later.');
    }

    if (isDuplicateEmail(email)) {
      Logger.log('ERROR: Duplicate email: ' + email);
      return createResponse(false, 'This email is already subscribed');
    }

    var timestamp = new Date();
    var consentDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

    Logger.log('Opening sheet: ' + SHEET_ID);
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

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
    return createResponse(false, 'An error occurred. Please try again.');
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('Newsletter signup endpoint is working. Use POST to submit.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function validateEmail(email) {
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isDuplicateEmail(email) {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (data[i][1] && data[i][1].toString().toLowerCase() === email.toLowerCase() && data[i][5] === 'Active') {
        return true;
      }
    }
    return false;
  } catch (error) {
    Logger.log('Error checking duplicates: ' + error.message);
    return false;
  }
}

function checkRateLimit(ip) {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    var data = sheet.getDataRange().getValues();
    var cutoffTime = new Date(Date.now() - (RATE_LIMIT_MINUTES * 60 * 1000));

    var count = 0;
    for (var i = 1; i < data.length; i++) {
      var rowTimestamp = new Date(data[i][0]);
      var rowIp = data[i][3];

      if (rowIp === ip && rowTimestamp > cutoffTime) {
        count++;
      }
    }

    return count < MAX_SUBMISSIONS_PER_IP;
  } catch (error) {
    Logger.log('Error checking rate limit: ' + error.message);
    return true;
  }
}

function getClientIp(e) {
  try {
    if (e.parameter && e.parameter['X-Forwarded-For']) {
      return e.parameter['X-Forwarded-For'].split(',')[0].trim();
    }
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

function testNewsletter() {
  Logger.clear();

  var testData = {
    email: 'test2@example.com',
    consent: 'true'
  };

  var e = {
    postData: {
      contents: JSON.stringify(testData),
      type: 'application/json'
    },
    parameter: {},
    contentLength: JSON.stringify(testData).length
  };

  Logger.log('Testing with email: ' + testData.email);
  var result = doPost(e);
  Logger.log('Test result: ' + result.getContent());
}
