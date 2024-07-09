import { GoogleSpreadsheetRow } from "google-spreadsheet";
import { getSheetByIndex } from "../services/SheetService";

type RowCellData = string | number | boolean | Date;
type RowData = Record<string, RowCellData>;

interface AddRowsToSheetParams {
  sheetIndex?: number;
  data: RowData[];
}

export async function addRowsToSheet({sheetIndex, data}: AddRowsToSheetParams): Promise<GoogleSpreadsheetRow<Record<string, any>>[]>{
  const sheet = await getSheetByIndex(sheetIndex);
  return sheet.addRows(data);
}