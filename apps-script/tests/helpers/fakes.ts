/** In-memory fakes of the Google services used by the endpoint. */
import type { AppsScriptContext } from './loadAppsScript';

type Cell = string | number | boolean | Date;

/**
 * A minimal Sheet: rows of cells, 1-based like SpreadsheetApp. As in Google Sheets, a written
 * value with a leading apostrophe is stored as text without it; `written` keeps the raw values.
 */
export class FakeSheet {
  rows: Cell[][] = [];
  written: Cell[][] = [];
  maxRows = 1000;
  frozenRows = 0;
  formats: string[] = [];
  validations: string[] = [];
  boldHeader = false;
  failAppend = false;
  failRead = false;

  private store(value: Cell): Cell {
    return typeof value === 'string' && value.startsWith("'") ? value.slice(1) : value;
  }

  getLastRow(): number {
    if (this.failRead) throw new Error('read failed');
    return this.rows.length;
  }

  getMaxRows(): number {
    return this.maxRows;
  }

  setFrozenRows(n: number): void {
    this.frozenRows = n;
  }

  appendRow(values: Cell[]): void {
    if (this.failAppend) throw new Error('append failed');
    this.written.push(values.slice());
    this.rows.push(values.map((v) => this.store(v)));
  }

  getRange(row: number, column: number, numRows = 1, numColumns = 1): FakeRange {
    return new FakeRange(this, row, column, numRows, numColumns);
  }

  cell(row: number, column: number): Cell {
    return this.rows[row - 1]?.[column - 1] ?? '';
  }

  setCell(row: number, column: number, value: Cell): void {
    while (this.rows.length < row) this.rows.push([]);
    this.rows[row - 1][column - 1] = this.store(value);
  }
}

export class FakeRange {
  constructor(
    private sheet: FakeSheet,
    private row: number,
    private column: number,
    private numRows: number,
    private numColumns: number,
  ) {}

  getValues(): Cell[][] {
    if (this.sheet.failRead) throw new Error('read failed');
    const out: Cell[][] = [];
    for (let r = 0; r < this.numRows; r++) {
      const line: Cell[] = [];
      for (let c = 0; c < this.numColumns; c++) line.push(this.sheet.cell(this.row + r, this.column + c));
      out.push(line);
    }
    return out;
  }

  setValues(values: Cell[][]): FakeRange {
    values.forEach((line, r) => line.forEach((v, c) => this.sheet.setCell(this.row + r, this.column + c, v)));
    return this;
  }

  setValue(value: Cell): FakeRange {
    this.sheet.setCell(this.row, this.column, value);
    return this;
  }

  setFontWeight(weight: string): FakeRange {
    if (this.row === 1 && weight === 'bold') this.sheet.boldHeader = true;
    return this;
  }

  setNumberFormat(format: string): FakeRange {
    this.sheet.formats.push(`${this.column}:${this.row}+${this.numRows}:${format}`);
    return this;
  }

  setDataValidation(rule: { values: string[] }): FakeRange {
    this.sheet.validations.push(`${this.column}:${this.row}+${this.numRows}:${rule.values.join('|')}`);
    return this;
  }

  getRow(): number {
    return this.row;
  }

  createTextFinder(text: string) {
    let entire = false;
    let matchCase = false;
    const finder = {
      matchEntireCell: (v: boolean) => ((entire = v), finder),
      matchCase: (v: boolean) => ((matchCase = v), finder),
      findNext: () => {
        for (let r = 0; r < this.numRows; r++) {
          const raw = String(this.sheet.cell(this.row + r, this.column));
          const a = matchCase ? raw : raw.toLowerCase();
          const b = matchCase ? text : text.toLowerCase();
          if (entire ? a === b : a.includes(b)) return new FakeRange(this.sheet, this.row + r, this.column, 1, 1);
        }
        return null;
      },
    };
    return finder;
  }
}

export class FakeSpreadsheet {
  sheets = new Map<string, FakeSheet>();
  getSheetByName(name: string): FakeSheet | null {
    return this.sheets.get(name) ?? null;
  }
  insertSheet(name: string): FakeSheet {
    const sheet = new FakeSheet();
    this.sheets.set(name, sheet);
    return sheet;
  }
}

export function newDataValidation() {
  const rule = { values: [] as string[], allowInvalid: true };
  const builder = {
    requireValueInList: (values: string[]) => ((rule.values = values), builder),
    setAllowInvalid: (v: boolean) => ((rule.allowInvalid = v), builder),
    build: () => rule,
  };
  return builder;
}

export class FakeMailer {
  sent: AppsScriptContext[] = [];
  quota = 100;
  failKinds = new Set<string>();
  getRemainingDailyQuota(): number {
    return this.quota;
  }
  sendEmail(message: AppsScriptContext): void {
    if (this.failKinds.has(message.kind)) throw new Error('send failed');
    this.sent.push(message);
  }
}

export class FakeLock {
  held = false;
  available = true;
  acquisitions = 0;
  tryLock(): boolean {
    if (!this.available || this.held) return false;
    this.held = true;
    this.acquisitions++;
    return true;
  }
  releaseLock(): void {
    this.held = false;
  }
}
