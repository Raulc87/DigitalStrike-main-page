/**
 * The `leads` sheet behind the small store interface used by handleLeadRequest,
 * plus setupSheet. `spreadsheet` is a SpreadsheetApp Spreadsheet; `formatDate(date)`
 * formats a Date cell as `yyyy-MM-dd HH:mm:ss` in Costa Rica time.
 * Only Sheet/Range methods are used, so tests can pass a fake spreadsheet.
 */

function getLeadsSheet_(spreadsheet) {
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Worksheet "' + SHEET_NAME + '" not found; run setupSheet().');
  }
  return sheet;
}

function createSheetStore(spreadsheet, formatDate) {
  var sheet = getLeadsSheet_(spreadsheet);
  var width = SHEET_COLUMNS.length;

  function cellText(value) {
    if (value instanceof Date) {
      return formatDate(value);
    }
    return value === null || value === undefined ? '' : String(value);
  }

  return {
    findBySubmissionId: function (submissionId) {
      var lastRow = sheet.getLastRow();
      if (lastRow < 2) {
        return null;
      }
      var match = sheet
        .getRange(2, COLUMN.submission_id, lastRow - 1, 1)
        .createTextFinder(submissionId)
        .matchCase(true)
        .matchEntireCell(true)
        .findNext();
      if (!match) {
        return null;
      }
      var rowNumber = match.getRow();
      var values = sheet.getRange(rowNumber, 1, 1, width).getValues()[0].map(cellText);
      return { rowNumber: rowNumber, values: values };
    },

    readRecentRows: function (count) {
      var lastRow = sheet.getLastRow();
      if (lastRow < 2 || count < 1) {
        return [];
      }
      var first = Math.max(2, lastRow - count + 1);
      return sheet
        .getRange(first, 1, lastRow - first + 1, COLUMN.email)
        .getValues()
        .map(function (row) {
          return {
            submittedAt: cellText(row[COLUMN.submitted_at - 1]),
            email: cellText(row[COLUMN.email - 1]),
          };
        });
    },

    appendRow: function (values) {
      // Under the script lock, the row just appended is the last one.
      sheet.appendRow(values);
      return sheet.getLastRow();
    },

    setCell: function (rowNumber, columnNumber, value) {
      sheet.getRange(rowNumber, columnNumber).setValue(value);
    },
  };
}

function columnLetter_(columnNumber) {
  return String.fromCharCode(64 + columnNumber);
}

/**
 * Creates the `leads` worksheet if needed, writes the header (contract §6), the `status`
 * dropdown and plain-text formats. Idempotent. Refuses to overwrite a different header.
 * `newDataValidation()` is SpreadsheetApp.newDataValidation.
 */
function setupLeadsSheet(spreadsheet, newDataValidation) {
  var sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  var width = SHEET_COLUMNS.length;
  var headerRange = sheet.getRange(1, 1, 1, width);
  var current = headerRange.getValues()[0].map(function (v) {
    return String(v).trim();
  });
  var isEmpty = current.every(function (v) {
    return v === '';
  });
  var matches = current.every(function (v, i) {
    return v === SHEET_COLUMNS[i];
  });
  if (!isEmpty && !matches) {
    throw new Error('Row 1 of "' + SHEET_NAME + '" has a different header; fix it by hand first.');
  }
  headerRange.setValues([SHEET_COLUMNS]).setFontWeight('bold');
  sheet.setFrozenRows(1);

  var maxRows = Math.max(sheet.getMaxRows(), 2);
  var statusRule = newDataValidation()
    .requireValueInList(LEAD_STATUSES, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, COLUMN.status, maxRows - 1, 1).setDataValidation(statusRule);

  // Plain text everywhere except `consent` (a boolean), so Sheets never turns a stored
  // value into a date or a number (e.g. column A or a phone without "+").
  SHEET_COLUMNS.forEach(function (column) {
    if (column !== 'consent') {
      sheet.getRange(2, COLUMN[column], maxRows - 1, 1).setNumberFormat('@');
    }
  });
  return {
    sheetName: SHEET_NAME,
    columns: width,
    statusRange: columnLetter_(COLUMN.status) + '2:' + columnLetter_(COLUMN.status),
  };
}
