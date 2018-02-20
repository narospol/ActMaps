import {Injectable, NgZone} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';

import {ActMarker} from './../../directives/marker';

import {GoogleMapsAPIWrapper} from './../google-maps-api-wrapper';
import {Marker} from './../google-maps-types';

// tslint:disable
declare var google: any;

@Injectable()
export class MarkerManager {
  protected _markers: Map<ActMarker, Promise<Marker>> =
      new Map<ActMarker, Promise<Marker>>();

  constructor(protected _mapsWrapper: GoogleMapsAPIWrapper, protected _zone: NgZone) {}

  deleteMarker(marker: ActMarker): Promise<void> {
    const m = this._markers.get(marker);
    if (m == null) {
      // marker already deleted
      return Promise.resolve();
    }
    return m.then((m: Marker) => {
      return this._zone.run(() => {
        m.setMap(null);
        this._markers.delete(marker);
      });
    });
  }

  updateMarkerPosition(marker: ActMarker): Promise<void> {
    return this._markers.get(marker).then(
        (m: Marker) => m.setPosition({lat: marker.latitude, lng: marker.longitude}));
  }

  updateTitle(marker: ActMarker): Promise<void> {
    return this._markers.get(marker).then((m: Marker) => m.setTitle(marker.title));
  }

  updateLabel(marker: ActMarker): Promise<void> {
    return this._markers.get(marker).then((m: Marker) => { m.setLabel(marker.label); });
  }

  updateDraggable(marker: ActMarker): Promise<void> {
    return this._markers.get(marker).then((m: Marker) => m.setDraggable(marker.draggable));
  }

  updateIcon(marker: ActMarker): Promise<void> {
    return this._markers.get(marker).then((m: Marker) => m.setIcon(marker.iconUrl));
  }

  updateOpacity(marker: ActMarker): Promise<void> {
    return this._markers.get(marker).then((m: Marker) => m.setOpacity(marker.opacity));
  }

  updateVisible(marker: ActMarker): Promise<void> {
    return this._markers.get(marker).then((m: Marker) => m.setVisible(marker.visible));
  }

  updateZIndex(marker: ActMarker): Promise<void> {
    return this._markers.get(marker).then((m: Marker) => m.setZIndex(marker.zIndex));
  }

  updateClickable(marker: ActMarker): Promise<void> {
    return this._markers.get(marker).then((m: Marker) => m.setClickable(marker.clickable));
  }

  updateAnimation(marker: ActMarker): Promise<void> {
    return this._markers.get(marker).then((m: Marker) => {
      if (typeof marker.animation === 'string') {
        m.setAnimation(google.maps.Animation[marker.animation]);
      } else {
        m.setAnimation(marker.animation);
      }
    });
  }

  addMarker(marker: ActMarker) {
    const markerPromise = this._mapsWrapper.createMarker({
      position: {lat: marker.latitude, lng: marker.longitude},
      label: marker.label,
      draggable: marker.draggable,
      icon: marker.iconUrl,
      opacity: marker.opacity,
      visible: marker.visible,
      zIndex: marker.zIndex,
      title: marker.title,
      clickable: marker.clickable,
      animation: (typeof marker.animation === 'string') ? google.maps.Animation[marker.animation] : marker.animation
    });

    this._markers.set(marker, markerPromise);
  }

  getNativeMarker(marker: ActMarker): Promise<Marker> {
    return this._markers.get(marker);
  }

  createEventObservable<T>(eventName: string, marker: ActMarker): Observable<T> {
    return Observable.create((observer: Observer<T>) => {
      this._markers.get(marker).then((m: Marker) => {
        m.addListener(eventName, (e: T) => this._zone.run(() => observer.next(e)));
      });
    });
  }
}
