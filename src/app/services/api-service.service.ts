import { Injectable, ResourceRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, tap } from 'rxjs';
import { Reserva, ReservaAnulada, Catalogo,Usuario, Valoracion, ValoracionesResponse, FilterDateResponse } from '../models/user.interface';
import { AuthService } from '../services/auth.service';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
private apiUrlUsuarios = 'http://localhost:8000/api/usuarios'
private apiUrlReservas = 'http://localhost:8000/api/reservas'
private apiUrlVehiculos = 'http://localhost:8000/api/vehicles'
private apiUrlCompras = 'http://localhost:8000/api/compras'
private apiUrlValoracion = 'http://localhost:8000/api/review'
private apiUrlContact = 'http://localhost:8000/contact'
private apiUrlAnuladas = 'http://localhost:8000/api/reservasAnuladas'
// private apiUrlUsuarios = 'https://hairbookingback-Vehiculoion.up.railway.app/api/usuarios'

private apiUrlReservations = 'http://localhost:8000/api/reservations' // es para q cuando pasen de la hora se eliminen en la base de datos de reservations
public Vehiculos: Catalogo[] = [];
private favorites: Catalogo[] = [];
private reserves: Reserva[] = [];
private cart: Catalogo[] = [];
public cartItemsCount = new BehaviorSubject<number>(0);
cartItemsCount$ = this.cartItemsCount.asObservable();

constructor(private http: HttpClient, private authService: AuthService) { }
 

getAllUsers(): Observable<Usuario[]> {
  return this.http.get<Usuario[]>(`${this.apiUrlUsuarios}`);
}
registerUser(usuario: Usuario): Observable<Usuario> {
  return this.http.post<Usuario>(`${this.apiUrlUsuarios}/new`, usuario);
}

loginUser(email: string, password: string): Observable<any> {
  const body = {
    email: email,
    password: password
  };

  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  return this.http.post(`${this.apiUrlUsuarios}/login`, body, httpOptions);
}
  
showProfile(id: number):Observable<Usuario>{
  return this.http.get<Usuario>(`${this.apiUrlUsuarios}/${id}`)
}
editProfile(id: number, userData: Usuario): Observable<Usuario> {
  return this.http.put<Usuario>(`${this.apiUrlUsuarios}/${id}/edit`, userData);
}
deleteUser(id: number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrlUsuarios}/delete/${id}`);
}
searchUser(name: string, apellidos: string): Observable<Usuario[]> {
  // El backend requiere ambos parámetros, así que los enviamos siempre
  const nombreParam = encodeURIComponent(name || '');
  const apellidosParam = encodeURIComponent(apellidos || '');
  return this.http.get<Usuario[]>(`${this.apiUrlUsuarios}/search?nombre=${nombreParam}&apellidos=${apellidosParam}`);
}
getReserves(): Observable<Reserva[]> {
  return this.http.get<Reserva[]>(`${this.apiUrlReservas}`);
}

getReserveByUsuario(usuario_Id: number): Observable<Reserva[]> {
  return this.http.get<Reserva[]>(`${this.apiUrlReservas}/usuario/${usuario_Id}`);
}
  // Crear reserva (payload flexible para adaptarse al backend)
  newReserve(reserva: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrlReservas}/new`, reserva);
  }
  
newReserveByAdmin(reservas: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrlReservas}/admin/new`, reservas);
}

editReserve(id: number, reservaData: Reserva): Observable<Reserva> {
  return this.http.put<Reserva>(`${this.apiUrlReservas}/${id}/edit`, reservaData);
}
deleteReserve(id: number): Observable<Reserva> { //elimina directamente sin mover a reserva_anuladas
  return this.http.delete<Reserva>(`${this.apiUrlReservas}/delete/${id}`);
}

deleteReserves(id: number): Observable<Reserva> { //elimina directamente sin mover a reserva_anuladas
  return this.http.delete<Reserva>(`${this.apiUrlReservas}/eliminar/${id}`);
}
filterReserveActivas(): Observable<Reserva[]> {
  return this.http.get<Reserva[]>(`${this.apiUrlReservas}/filter?tipo=activas`);
}

filterReserveExpiradas(): Observable<Reserva[]> {
  return this.http.get<Reserva[]>(`${this.apiUrlReservas}/filter?tipo=expiradas`);
}

filterByPrice(minPrice?: number, maxPrice?: number): Observable<any> {
  let url = `${this.apiUrlVehiculos}/filter/price`;
  const params: { [key: string]: string } = {};
  
  if (minPrice !== undefined) {
    params['min_price'] = minPrice.toString();
  }
  if (maxPrice !== undefined) {
    params['max_price'] = maxPrice.toString();
  }
  
  return this.http.get(url, { params });
}

filterByDate(date: Date): Observable<FilterDateResponse> {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const fechaStr = `${year}-${month}-${day}`;
    const url = `${this.apiUrlCompras}/filter/date?fecha=${fechaStr}`;
    
    return this.http.get<FilterDateResponse>(url).pipe(
      tap({
        next: (_response) => {},
        error: (error) => console.error('API Error:', error)
      })
    );
}

getValoraciones(): Observable<ValoracionesResponse> {
  return this.http.get<ValoracionesResponse>(`${this.apiUrlValoracion}/list`);
}
getValoracionById(id: number): Observable<Valoracion> {
  return this.http.get<Valoracion>(`${this.apiUrlValoracion}/${id}`);
}
newValoracion(valoracion: any): Observable<any> {
  const payload: any = {
    rating: valoracion.rating,
    comentario: valoracion.comentario || valoracion.comment,
    usuario_id: valoracion.usuario_id,
    reserva_id: valoracion.reserva_id,
    created_at: valoracion.created_at || valoracion.fecha || new Date().toISOString()
  };
  
  console.log('Enviando payload al backend:', payload);
  
  return this.http.post<any>(`${this.apiUrlValoracion}/new`, payload,
    { headers: { 'Content-Type': 'application/json' } }
  );
}
editValoracion(id: number, valoracionData: Valoracion): Observable<Valoracion> {
  return this.http.put<Valoracion>(`${this.apiUrlValoracion}/${id}/edit`, valoracionData);
}

deleteReservaAnulada(id:number):Observable <ReservaAnulada>{
  return this.http.delete<ReservaAnulada>(`${this.apiUrlAnuladas}/delete/${id}`);
}
deleteValoracion(id: number): Observable<Valoracion> {
  return this.http.delete<Valoracion>(`${this.apiUrlValoracion}/delete/${id}`);
}
deleteAllReserves(): Observable<any> {
  return this.http.delete<any>(`${this.apiUrlReservas}/delete`);
}

getReservasAnuladas():Observable<ReservaAnulada[]>{
  return this.http.get<ReservaAnulada[]>(`${this.apiUrlAnuladas}/list`);
}

getNumeroReservasByUsuarioId(usuario_Id: number){
  return this.http.get<{
    totalReservas: number;
  }>(`${this.apiUrlReservas}/usuario/${usuario_Id}/count`);}

removeReserve(reserveId: number) {
  this.reserves = this.reserves.filter((r) => r.id !== reserveId);
}

getReserveById(id: number): Observable<Reserva> {
  return this.http.get<Reserva>(`${this.apiUrlReservas}/${id}`);
}


getAllVehiculos(): Observable<Catalogo[]> {
  const userId = this.authService.getUserId();
  const params = userId ? `?usuario_id=${userId}` : '';
  return this.http.get<Catalogo[]>(`${this.apiUrlVehiculos}${params}`);
}

getVehiculos(): Catalogo[] {
  return this.Vehiculos;
}



updateVehiculoFavorite(VehiculoId: number, isFavorite: boolean): Observable<any> {
  const userId = this.authService.getUserId();
  return this.http.post(`${this.apiUrlVehiculos}/favoritos/${VehiculoId}`, { 
    usuario_id: userId,
    isFavorite: isFavorite 
  });
}

getFavoritesByUsuarioId(usuario_Id: number): Observable<any> {
  return this.http.get(`${this.apiUrlVehiculos}/favoritos/usuario/${usuario_Id}`);
}

addFavorite(Vehiculo: Catalogo) {
  const existingFavorite = this.favorites.find(p => p.id === Vehiculo.id);
  if (!existingFavorite) {
    const VehiculoToAdd = { ...Vehiculo, is_favorite: true };
    this.favorites.push(VehiculoToAdd);
  }
}

deleteVehiculoFav(id: number): Observable<Catalogo> {
  return this.http.delete<Catalogo>(`${this.apiUrlVehiculos}/delete/${id}`);
}



sendContactForm(contactData: {
  name: string;
  apellidos: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): Observable<any> {
  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };
  
  return this.http.post<any>(this.apiUrlContact, contactData, httpOptions);
}

} 