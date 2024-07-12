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
}

export let objectDataSheet: UserRowData = {
  cuil: '',
  cuit: '',
  email: '',
  'codigo de area': '',
  'resto del numero': '',
  'nro de beneficio': '',
  'foto de anverso dni': '',
  'foto de verso dni': '',
  'ultimo recibo de haberes': '',
}

export async function addRowsToSheet(updateFieldName: keyof UserRowData, updateFieldValue: string ,sheetIndex?: number ): Promise<void> {
  const sheet = await getSheetByIndex(sheetIndex);
  const rows = await sheet.getRows<UserRowData>();

  if(updateFieldName === 'resto del numero'){
    await sheet.addRow(objectDataSheet)
  } else {
    const rowUpdateIndex = rows.findIndex(row => row.get('resto del numero') === objectDataSheet['resto del numero']);
    rows[rowUpdateIndex].set(updateFieldName, updateFieldValue);
    await rows[rowUpdateIndex].save();
  }
}