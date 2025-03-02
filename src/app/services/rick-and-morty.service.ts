import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RickAndMortyService {
  private baseUrl = 'https://rickandmortyapi.com/api';

  constructor(private http: HttpClient) {}


    // Obtener todos los personajes con paginación y filtros
    getCharacters(page: number = 1, filters?: { name?: string; status?: string, species?: string }): Observable<any> {
      let url = `${this.baseUrl}/character/?page=${page}`;

      if (filters) {
        if (filters.name) {
          url += `&name=${filters.name}`;
        }
        if (filters.status) {
          url += `&status=${filters.status}`;
        }
        if (filters.species) {
          url += `&species=${filters.species}`;
        }
      }

      return this.http.get(url).pipe(
        catchError(() => of({ info: { count: 0, pages: 0 }, results: [] })) // Manejar errores
      );
    }

    // Método para buscar en todas las páginas
    searchAllPages(filters?: { name?: string; status?: string }): Observable<any[]> {
      return this.getCharacters(1, filters).pipe(
        switchMap(firstPage => {
          if (firstPage.info.pages === 0) {
            return of([]);
          }

          const totalPages = firstPage.info.pages;

          // Crear un array de observables para todas las páginas
          const requests: Observable<any>[] = [];
          for (let i = 1; i <= totalPages; i++) {
            requests.push(this.getCharacters(i, filters));
          }

          // Combinar los resultados de todas las páginas
          return forkJoin(requests).pipe(
            map(responses => {

              return responses.reduce((acc, response) => acc.concat(response.results), []);
            })
          );
        }),
        catchError(() => of([])) // Manejar errores
      );
    }

    // Obtener detalles de un personaje por ID
    getCharacterById(id: number): Observable<any> {
      return this.http.get(`${this.baseUrl}/character/${id}`);
    }

    // Obtener información de la ubicación
    getLocation(id: number): Observable<any> {
      return this.http.get(`${this.baseUrl}/location/${id}`);
    }

    // Obtener información del episodio
    getEpisode(id: number): Observable<any> {
      return this.http.get(`${this.baseUrl}/episode/${id}`);
    }

    getSpecies(): Observable<string[]> {
      return this.getCharacters(1).pipe(
        switchMap(firstPage => {
          if (firstPage.info.pages === 0) {
            return of([]);
          }

          const totalPages = firstPage.info.pages;

          // Crear un array de observables para todas las páginas
          const requests: Observable<any>[] = [];
          for (let i = 1; i <= totalPages; i++) {
            requests.push(this.getCharacters(i));
          }

          // Combinar los resultados de todas las páginas
          return forkJoin(requests).pipe(
            map(responses => {
              const speciesSet = new Set<string>();
              responses.forEach(response => {
                response.results.forEach((character: any) => {
                  speciesSet.add(character.species);
                });
              });
              return Array.from(speciesSet);
            })
          );
        }),
        catchError(() => of([]))
      );
    }
}
