import { getSheetByIndex } from '../services/SheetService';

type UserRowData = {
  cuil: string;
  cuit: string;
  email: string;
  ['codigo de area']: string;
  ['resto del numero']: string;
  ['nro de beneficio']: string;
  ['foto de anverso dni']: string;
  ['foto de verso dni']: string;
  ['ultimo recibo de haberes']: string;
  ['certificado de haberes']: string;
  ['token']: string;
}

let token: string | null = null;

export async function addRowsToSheet(updateFieldName: keyof UserRowData, updateFieldValue: string ,sheetIndex?: number ): Promise<void> {
  const sheet = await getSheetByIndex(sheetIndex);
  const rows = await sheet.getRows<UserRowData>();

  if(updateFieldName == 'token'){
    token = updateFieldValue;
    await sheet.addRow({ 'token': updateFieldValue });
  } else {
    const rowUpdateIndex = rows.findIndex(row => row.get('token') === token);
    rows[rowUpdateIndex].set(updateFieldName, updateFieldValue);
    await rows[rowUpdateIndex].save();
  }
}