import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RickAndMortyService } from '../../services/rick-and-morty.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details',
  imports: [CommonModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent implements OnChanges {
  @Input() selectedCharacter: any = null; // Recibe el personaje seleccionado
  originInfo: any = null; // Información del origen
  locationInfo: any = null; // Información de la localización
  resident: any = null; // Un residente del origen
  locationResident: any = null; // Un residente de la localización
  episode: any = null; // Información de un episodio
  pageSize: number = 10;

  constructor(private _rickAndMortyService: RickAndMortyService) { }

  ngOnChanges(changes: SimpleChanges): void {
    // Este método se ejecuta cuando cambia el valor de `selectedCharacter`
    if (changes['selectedCharacter'] && this.selectedCharacter) {
      this.loadDetails(this.selectedCharacter);
    }
  }

  loadDetails(character: any): void {
    this.originInfo = null;
    this.locationInfo = null;
    this.resident = null;
    this.locationResident = null;
    this.episode = null;

    // Obtener información del origen
    if (character.origin?.url) {
      const originId = this.extractIdFromUrl(character.origin.url);
      this._rickAndMortyService.getLocation(originId).subscribe(origin => {
        this.originInfo = origin;
        if (origin.residents.length > 0) {
          const residentId = this.extractIdFromUrl(origin.residents[0]);
          this._rickAndMortyService.getCharacterById(residentId).subscribe(resident => {
            this.resident = resident;
          });
        }
      });
    }

    // Obtener información de la localización
    if (character.location?.url) {
      const locationId = this.extractIdFromUrl(character.location.url);
      this._rickAndMortyService.getLocation(locationId).subscribe(location => {
        this.locationInfo = location;
        if (location.residents.length > 0) {
          const residentId = this.extractIdFromUrl(location.residents[0]);
          this._rickAndMortyService.getCharacterById(residentId).subscribe(resident => {
            this.locationResident = resident;
          });
        }
      });
    }

    // Obtener información de un episodio
    if (character.episode.length > 0) {
      this._rickAndMortyService.getEpisode(this.extractIdFromUrl(character.episode[0])).subscribe(ep => {
        this.episode = ep;
      });
    }
  }

  // Método para extraer el ID de una URL
  extractIdFromUrl(url: string): number {
    const parts = url.split('/');
    return +parts[parts.length - 1];
  }

}
