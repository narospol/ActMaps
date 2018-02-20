import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Injectable, NgZone } from '@angular/core';

import { GoogleMapsAPIWrapper } from '../google-maps-api-wrapper';
import { InfoWindow, InfoWindowOptions, Size, google } from '../google-maps-types';
import { MarkerManager } from './marker-manager';
import { ActInfoMarker } from '../../directives/info-marker';


@Injectable()
export class InfoMarkerManager {
  private _infoMarkers: Map<String, ActInfoMarker> = new Map<String, ActInfoMarker>();
  constructor(
    private _mapsWrapper: GoogleMapsAPIWrapper,
    private _zone: NgZone,
    private _markerManager: MarkerManager) { }

  addInfoMarker(key: String, infoWindow: ActInfoMarker) {
    this._infoMarkers.set(key, infoWindow);
  }

  deleteInfoMarker(key: String): boolean {
    return this._infoMarkers.delete(key);
  }

  getNativeWindow(key: String): ActInfoMarker {
    return this._infoMarkers.get(key);
  }
}
