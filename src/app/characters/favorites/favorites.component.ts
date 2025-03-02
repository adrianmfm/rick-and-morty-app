import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-favorites',
  imports: [CommonModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent {
  @Input() favoriteCharacters: any[] = [];
  @Output() favoriteSelected = new EventEmitter<any>();


  ngOnit(): void {
  }

  // Método para mostrar detalles de un favorito
  showFavoriteDetails(character: any): void {
    this.favoriteSelected.emit(character);
  }
}
