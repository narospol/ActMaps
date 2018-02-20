import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Injectable, NgZone } from '@angular/core';

import { GoogleMapsAPIWrapper } from '../google-maps-api-wrapper';
import { InfoWindow, InfoWindowOptions, Size, google } from '../google-maps-types';
import { MarkerManager } from './marker-manager';
import { ActInfoMarker } from '../../directives/info-marker';
import { ActPopOver } from '../../directives/pop-over';


@Injectable()
export class InfoMarkerManager {
  private _infoMarkers: Map<String, ActInfoMarker> = new Map<String, ActInfoMarker>();
  private _popOvers: Map<String, ActPopOver> = new Map<String, ActPopOver>();

  constructor(
    private _zone: NgZone,
    private _mapsWrapper: GoogleMapsAPIWrapper) { }

  addInfoMarker(key: String, infoWindow: ActInfoMarker) {
    this._infoMarkers.set(key, infoWindow);
  }

  deleteInfoMarker(key: String): boolean {
    return this._infoMarkers.delete(key);
  }

  getMarker(key: String): ActInfoMarker {
    return this._infoMarkers.get(key);
  }

  addPopOver(key: String, popOver: ActPopOver) {
    this._popOvers.set(key, popOver);
  }

  deletePopOver(key: String): boolean {
    return this._popOvers.delete(key);
  }

  getPopOver(key: String): ActPopOver {
    return this._popOvers.get(key);
  }
}
