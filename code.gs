// Google Apps Script to handle form submission to Google Sheets
// Deploy as a web app with the following settings:
// - Execute as: Me
// - Who has access: Anyone

var sheetName = 'Members';
var scriptProp = PropertiesService.getScriptProperties();

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    var sheet = doc.getSheetByName(sheetName);
    
    // Get headers
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow() + 1;
    
    var newRow = headers.map(function(header) {
      // Convert header to camelCase to match form field names
      var fieldName = header.toLowerCase().replace(/\s+/g, '');
      return e.parameter[fieldName];
    });
    
    // Insert new row
    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e.message }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function setup() {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty('key', doc.getId());
}
