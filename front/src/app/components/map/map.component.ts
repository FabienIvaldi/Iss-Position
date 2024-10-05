import { Component, OnInit, OnDestroy } from '@angular/core';
import { IssLocationService } from '../../services/iss-location.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [IssLocationService],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  location: any;
  error: string | null = null;
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  private intervalId: any; // Pour stocker l'ID de l'intervalle

  constructor(private issLocation: IssLocationService) { }

  ngOnInit() {
    this.initMap(); // Initialisation de la carte
    this.fetchIssLocation(); // Récupérer la localisation de l'ISS
    this.startTracking(); // Commencer le suivi en temps réel
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId); 
    }
  }

  fetchIssLocation() {
    this.issLocation.getData().subscribe(
      (data) => {
        this.location = data;
        this.error = null; 
        this.updateMarker(); 
      },
      (error) => {
        this.error = 'Erreur lors de la récupération des données.';
        console.error(error); 
      }
    );
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [48.8566, 2.3522], 
      zoom: 3 
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>, under <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="https://openstreetmap.org">OpenStreetMap</a>, under <a href="https://www.openstreetmap.org/copyright">ODbL</a>.',

    }).addTo(this.map);

    const customIcon = L.icon({
      iconUrl: 'assets/icon.png',
      iconSize: [50, 50],
      iconAnchor: [12, 41],
      popupAnchor: [13, -34],
      shadowUrl: '',
      shadowSize: [41, 41]
    });

    // Initialiser le marqueur avec des coordonnées par défaut
    this.marker = L.marker([48.8566, 2.3522], { icon: customIcon }).addTo(this.map);
    this.marker.bindPopup("Position de l'iss").openPopup();
  }

  private updateMarker(): void {
    if (this.location && this.location.iss_position) {
      const latitude = this.location.iss_position.latitude;
      const longitude = this.location.iss_position.longitude;

      // Mettre à jour la position du marqueur
      this.marker?.setLatLng([latitude, longitude]);
      this.marker?.setPopupContent('ISS Position: ' + latitude.toFixed(2) + ', ' + longitude.toFixed(2));
      this.map?.setView([latitude, longitude], 1); // Centrer la carte sur l'ISS
    }
  }

  private startTracking(): void {
    this.intervalId = setInterval(() => {
      this.fetchIssLocation(); 
    }, 100); // Par exemple, toutes les 5 secondes
  }
}
