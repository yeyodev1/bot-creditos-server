import { GoogleSpreadsheetRow } from "google-spreadsheet";
import { getSheetByIndex } from "../services/SheetService";

type RowCellData = string | number | boolean | Date;
type RowData = Record<string, RowCellData>;

export const objectDataSheet: RowData = {
  nombre: '',
  cuil: '',
  cuit: '',
  email: '',
  "codigo de area": '',
  "resto del numero": '',
  "nro de beneficio": '',
  "foto de anverso dni": '',
  "foto de verso dni": '',
  "ultimo recibo de haberes": '',
}

export async function addRowsToSheet(sheetIndex?: number): Promise<GoogleSpreadsheetRow<Record<string, any>> | undefined>{
  const sheet = await getSheetByIndex(sheetIndex);
  const isValidObject = Object.entries(objectDataSheet).every(([_, value]) => value !== '');

  if(isValidObject) return sheet.addRow(objectDataSheet);
}