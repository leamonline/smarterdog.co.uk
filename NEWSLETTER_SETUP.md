# Newsletter Google Sheets Integration Setup Guide

## Overview
This guide walks you through setting up a GDPR-compliant newsletter signup system that saves email addresses to Google Sheets.

## Prerequisites
- Google Account (for Google Sheets and Apps Script)
- Access to your website repository
- Basic understanding of Google Sheets and Apps Script

---

## Step 1: Create Google Sheet

1. **Go to Google Sheets**: https://sheets.google.com
2. **Create a new spreadsheet** named "Newsletter Subscribers"
3. **Add the following headers in Row 1**:
   - **Column A**: Timestamp
   - **Column B**: Email
   - **Column C**: Consent
   - **Column D**: IP Address
   - **Column E**: Consent Date
   - **Column F**: Status

4. **Format the sheet** (optional but recommended):
   - Bold the header row
   - Freeze the header row (View > Freeze > 1 row)
   - Set column widths appropriately

5. **Copy your Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
   ```

---

## Step 2: Set Up Google Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**

2. **Delete any existing code** in the Code.gs file

3. **Copy and paste the code** from `newsletter-script.gs` in your repository

4. **Update the configuration**:
   ```javascript
   const SHEET_ID = 'YOUR_SHEET_ID_HERE'; // Paste your Sheet ID here
   const SHEET_NAME = 'Sheet1'; // Or the name of your sheet tab
   ```

5. **Save the project** (File > Save or Ctrl/Cmd + S)
   - Give it a name like "Newsletter Signup Handler"

---

## Step 3: Deploy as Web App

1. **Click "Deploy" > "New deployment"**

2. **Click the gear icon** next to "Select type" and choose **"Web app"**

3. **Configure the deployment**:
   - **Description**: "Newsletter signup endpoint"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone

4. **Click "Deploy"**

5. **Authorize the script**:
   - Click "Authorize access"
   - Choose your Google account
   - Click "Advanced" if you see a warning
   - Click "Go to [Project Name] (unsafe)" - this is your own script
   - Click "Allow"

6. **Copy the Web App URL**:
   ```
   https://script.google.com/macros/s/AKf.../exec
   ```
   ⚠️ **IMPORTANT**: Save this URL - you'll need it in the next step!

---

## Step 4: Update Frontend Code

1. **Open** `src/js/modules/newsletter.js` in your code editor

2. **Find this line** (near the top):
   ```javascript
   const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';
   ```

3. **Replace it with your Web App URL**:
   ```javascript
   const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKf.../exec';
   ```

4. **Save the file**

---

## Step 5: Build and Deploy

1. **Build the assets**:
   ```bash
   npm run build
   ```

2. **Commit the changes**:
   ```bash
   git add .
   git commit -m "Add GDPR-compliant newsletter with Google Sheets integration"
   git push
   ```

3. **Deploy to cPanel**:
   - Go to cPanel > Git™ Version Control
   - Click "Update from Remote"
   - Click "Deploy HEAD Commit"

---

## Step 6: Test the Integration

### Test Locally (Before Deploying):
1. Open `index.html` in your browser (using a local server)
2. Scroll to the newsletter section
3. Enter a test email
4. Check the consent checkbox
5. Click "Subscribe"
6. **Verify**:
   - Success message appears
   - Check your Google Sheet for the new entry
   - Verify all columns are populated correctly

### Test on Live Site:
1. Go to https://smarterdog.co.uk
2. Scroll to newsletter section
3. Perform the same test as above

### Common Issues:

**Issue**: "Script function not found: doPost"
- **Solution**: Make sure you deployed as "Web app", not "Add-on" or "API Executable"

**Issue**: "Authorization required"
- **Solution**: Re-authorize the script in Apps Script editor

**Issue**: "CORS error" in browser console
- **Solution**: Ensure deployment is set to "Who has access: Anyone"

**Issue**: Form submits but nothing appears in sheet
- **Solution**: Check SHEET_ID and SHEET_NAME match your actual sheet

---

## GDPR Compliance Checklist

✅ **Explicit Consent**: Checkbox must be ticked to subscribe
✅ **Privacy Notice**: Link to privacy policy shown
✅ **Consent Records**: Timestamp and IP logged for audit trail
✅ **Right to Withdraw**: Users can unsubscribe anytime
✅ **Data Minimization**: Only email address collected
✅ **Purpose Limitation**: Data only used for newsletter
✅ **Security**: HTTPS encryption, rate limiting
✅ **Retention**: Clear data retention policy in privacy policy
✅ **Transparency**: Updated privacy policy explains data processing

---

## Managing Subscribers

### View Subscribers:
- Open your Google Sheet
- All active subscribers have Status = "Active"

### Manually Unsubscribe Someone:
1. Find their email in the sheet
2. Change Status from "Active" to "Unsubscribed"
3. Add unsubscribe date in a new column if needed

### Export Subscriber List:
1. File > Download > CSV
2. Use CSV for your email marketing tool

### Send Newsletters:
- **Manually**: Copy emails from sheet to your email client's BCC field
- **Email Marketing Tool**: Import CSV to MailChimp, Sendinblue, etc.
- **Automated** (Advanced): Use Apps Script to send emails

---

## Security Best Practices

1. **Restrict Sheet Access**:
   - Only share with authorized team members
   - Use "Can view" permission for most users

2. **Regular Backups**:
   - File > Download > CSV (weekly recommended)

3. **Monitor for Spam**:
   - Review submissions regularly
   - Rate limiting prevents most spam (5 submissions/hour/IP)

4. **Update Privacy Policy**:
   - Privacy policy has been updated with newsletter section
   - Ensure users can access it easily

5. **Handle Unsubscribes Promptly**:
   - Respond to unsubscribe requests within 2 business days
   - Update sheet status immediately

---

## Maintenance

### Monthly Tasks:
- Review and remove any spam/fake emails
- Backup subscriber list (download CSV)
- Check deployment logs in Apps Script (View > Logs)

### When Sending Newsletters:
1. Export active subscribers from Google Sheet
2. Always use BCC (never TO or CC) when sending emails
3. Include unsubscribe link in every email
4. Track who unsubscribes and update sheet

---

## Support

### Files in This Implementation:
- `newsletter-script.gs` - Google Apps Script code
- `src/js/modules/newsletter.js` - Frontend form handler
- `src/styles/components/forms.css` - Newsletter styling
- `index.html` - Updated form with consent checkbox
- `privacy.html` - Updated GDPR privacy policy

### Useful Resources:
- Google Apps Script Docs: https://developers.google.com/apps-script
- UK GDPR Guide: https://ico.org.uk/for-organisations/guide-to-data-protection/
- Formspree Alternative: If needed for other forms

---

## Troubleshooting Script Issues

### Enable Logging:
Add this to your Apps Script for debugging:
```javascript
Logger.log('Email received: ' + email);
Logger.log('Consent: ' + consent);
```

View logs: Apps Script > Executions (left sidebar)

### Test the Script Directly:
1. In Apps Script, go to the `testFunction`
2. Click "Run"
3. Check the logs to see if it works

---

## Future Enhancements

Consider adding:
- **Double Opt-In**: Send confirmation email before adding to list
- **Email Automation**: Send welcome email on signup
- **Unsubscribe Page**: Self-service unsubscribe form
- **Analytics**: Track signup conversion rate
- **A/B Testing**: Test different signup incentives

---

## Questions?

If you need help:
1. Check the logs in Google Apps Script (Executions tab)
2. Test with a simple email first
3. Verify all URLs and IDs are correct
4. Ensure the sheet structure matches exactly

**Remember**: Always test thoroughly before going live!
