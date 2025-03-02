import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { RickAndMortyService } from '../../services/rick-and-morty.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DetailsComponent } from "../details/details.component";
import { FavoritesComponent } from '../favorites/favorites.component';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../header/header.component';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import {MatCardModule} from '@angular/material/card';

import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
@Component({
  selector: 'app-list',
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatProgressSpinnerModule, FormsModule, MatButtonModule, DetailsComponent, FavoritesComponent, MatIconModule, HeaderComponent, CdkAccordionModule, MatCardModule, MatListModule, MatExpansionModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  constructor(private _rickAndMortyService: RickAndMortyService) { }
  displayedColumns: string[] = ['name', 'gender', 'status', 'species', 'location', 'type', 'created', 'details', 'favorite'];
  dataSource = new MatTableDataSource<any>();
  totalPages: number = 1;
  currentPage: number = 1;
  totalItems: number = 0;
  pageSize: number = 20;
  noResultsFound: boolean = false;
  isLoading: boolean = false;
  speciesList: string[] = [];
  nameFilter: string = '';
  speciesFilter: string = '';
  selectedCharacter: any = null;
  favoriteCharacters: any[] = []; // Array para almacenar favoritos
  isMobile: boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  ngOnInit(): void {
    this.loadData(this.currentPage);
    this.getSpeciesList();

    this.checkDevice();
  }

  // Obtener lista de especies
  getSpeciesList(): void {
    this._rickAndMortyService.getSpecies().subscribe(species => {
      this.speciesList = species;
    });
  }


  applySpeciesFilter(event: any): void {
    this.speciesFilter = event.value;
    this.currentPage = 1;
    this.loadData(this.currentPage, this.nameFilter, this.speciesFilter);
  }

  // Cargar los datos de la página seleccionada
  loadData(page: number, nameFilter: string = '', speciesFilter: string = ''): void {
    this.isLoading = true;

    this._rickAndMortyService.getCharacters(page, { name: nameFilter, species: speciesFilter }).subscribe({
      next: (data) => {
        console.log('Datos recibidos de la API:', data);
        this.dataSource.data = data.results;
        this.totalItems = data.info.count;
        this.totalPages = data.info.pages;
        this.noResultsFound = data.results.length === 0;


        // Actualizar el paginador
        if (this.paginator) {
          this.paginator.length = this.totalItems;
          this.paginator.pageIndex = page - 1;
        }
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.noResultsFound = true;
        this.dataSource.data = [];
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Cambiar de página y cargar los datos correspondientes
  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.loadData(this.currentPage, this.nameFilter, this.speciesFilter);
  }

  // Método para aplicar el filtro por nombre
  applyFilter(event: Event) {
    this.nameFilter = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.currentPage = 1;
    this.loadData(this.currentPage, this.nameFilter, this.speciesFilter);
  }
  // Método para limpiar todos los filtros
  clearFilter(): void {
    this.nameFilter = '';
    this.speciesFilter = '';
    this.currentPage = 1;
    this.loadData(this.currentPage);
  }

  onViewDetails(character: any): void {
    console.log('Detalles del personaje:', character);
    this.selectedCharacter = character;
  }

  // Método para marcar/desmarcar como favorito
  toggleFavorite(character: any): void {
    const index = this.favoriteCharacters.findIndex(fav => fav.id === character.id);
    if (index === -1) {
      this.favoriteCharacters.push(character);
    } else {
      this.favoriteCharacters.splice(index, 1);
    }
  }

  isFavorite(character: any): boolean {
    return this.favoriteCharacters.some(fav => fav.id === character.id);
  }

  // Método para mostrar detalles de un favorito
  showFavoriteDetails(character: any): void {
    this.selectedCharacter = character;
  }

  @HostListener('window:resize', [])
  checkDevice(){
    this.isMobile = window.innerWidth <= 768;
    console.log('isMobile:', this.isMobile);
  }

}
