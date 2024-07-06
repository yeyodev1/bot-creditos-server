interface Meta {
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total_count: number;
}

interface ObjectItem {
  ape_y_nom: string;
  cuil: string;
  cuit: string;
  email: string;
  fecha_nac: string;
  id: number;
  razon_soc: string;
  resource_uri: string;
  tel_cod_area: string;
  tel_numero: string;
}

export interface ApiResponseBank {
  meta: Meta;
  objects: ObjectItem[];
}
