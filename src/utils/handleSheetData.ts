import { getSheetByIndex } from '../services/SheetService';

type UserRowData = {
  ['inicio de chat']: string;
  ['final de chat']: string;
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
  ['uuid']: string;
}

let uuid: string | null = null;

export async function addRowsToSheet(updateFieldName: keyof UserRowData, updateFieldValue: string ,sheetIndex?: number ): Promise<void> {
  const sheet = await getSheetByIndex(sheetIndex);
  const rows = await sheet.getRows<UserRowData>();

  if(updateFieldName == 'uuid'){
    uuid = updateFieldValue;
    await sheet.addRow({ 'uuid': updateFieldValue });
  } else {
    const rowUpdateIndex = rows.findIndex(row => row.get('uuid') === uuid);
    rows[rowUpdateIndex].set(updateFieldName, updateFieldValue);
    await rows[rowUpdateIndex].save();
  }
}