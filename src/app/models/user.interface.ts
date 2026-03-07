export interface Usuario {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    password: string;
    confirm_password: string;
    telefono: number;
    citas_reservadas: Reserva[];
    rol?: string;
  }

  export interface Valoracion {
  id: number;
  rating: number;
  comentario: string;
  fecha: string;
  usuario?: Usuario;
  reserva?: Reserva;
  usuario_id: number;
  reserva_id: number;
}
  
  export interface ValoracionesResponse {
    valoraciones: Valoracion[];
  }
 export interface Reserva {
  id: number;
  estado: string;
  dia: string;
  hora: string;
  usuario_id: number;
  vehiculo_id: number;
  vehiculo_model: string;
  usuario?: Usuario;
  vehiculo?: Catalogo;
  image_url: string[];
  valoracion?: number;
  valoracion_id?: number;
  valoracion_comentario?: string;
  valoracion_servicio?: number;
  valoracion_fecha?: string;
}

  export interface Catalogo {
  id: number;
  marca: string;
  modelo: string;
  year: number;
  motor: string;
  km: number;
  description: string;
  is_favorite: boolean;
  image_url: string[];
  precio: string; 
  reservas?: Reserva[];
}


  

  export interface ReservaAnulada {
  id: number;
  estado: string;
  dia: string;
  hora: string;
  usuario_id: number;
  vehiculo_id: number;
  vehiculo_model: string;

  valoracion_id?: number;
  valoracion_comentario?: string;
  valoracion_servicio?: number;
  valoracion_fecha?: string;
}

export interface FilterDateResponse {
  status: string;
  total: number;
  vehiculo: Catalogo[];
}