import {Injectable, NgZone} from '@angular/core';

import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';

import {ActCircle} from '../../directives/circle';
import {GoogleMapsAPIWrapper} from '../google-maps-api-wrapper';
import * as mapTypes from '../google-maps-types';

// tslint:disable
@Injectable()
export class CircleManager {
  private _circles: Map<ActCircle, Promise<mapTypes.Circle>> =
      new Map<ActCircle, Promise<mapTypes.Circle>>();

  constructor(private _apiWrapper: GoogleMapsAPIWrapper, private _zone: NgZone) {}

  addCircle(circle: ActCircle) {
    this._circles.set(circle, this._apiWrapper.createCircle({
      center: {lat: circle.latitude, lng: circle.longitude},
      clickable: circle.clickable,
      draggable: circle.draggable,
      editable: circle.editable,
      fillColor: circle.fillColor,
      fillOpacity: circle.fillOpacity,
      radius: circle.radius,
      strokeColor: circle.strokeColor,
      strokeOpacity: circle.strokeOpacity,
      strokePosition: circle.strokePosition,
      strokeWeight: circle.strokeWeight,
      visible: circle.visible,
      zIndex: circle.zIndex
    }));
  }

  /**
   * Removes the given circle from the map.
   */
  removeCircle(circle: ActCircle): Promise<void> {
    return this._circles.get(circle).then((c) => {
      c.setMap(null);
      this._circles.delete(circle);
    });
  }

  setOptions(circle: ActCircle, options: mapTypes.CircleOptions): Promise<void> {
    return this._circles.get(circle).then((c) => c.setOptions(options));
  }

  getBounds(circle: ActCircle): Promise<mapTypes.LatLngBounds> {
    return this._circles.get(circle).then((c) => c.getBounds());
  }

  getCenter(circle: ActCircle): Promise<mapTypes.LatLng> {
    return this._circles.get(circle).then((c) => c.getCenter());
  }

  getRadius(circle: ActCircle): Promise<number> {
    return this._circles.get(circle).then((c) => c.getRadius());
  }

  setCenter(circle: ActCircle): Promise<void> {
    return this._circles.get(circle).then(
        (c) => { return c.setCenter({lat: circle.latitude, lng: circle.longitude}); });
  }

  setEditable(circle: ActCircle): Promise<void> {
    return this._circles.get(circle).then((c) => { return c.setEditable(circle.editable); });
  }

  setDraggable(circle: ActCircle): Promise<void> {
    return this._circles.get(circle).then((c) => { return c.setDraggable(circle.draggable); });
  }

  setVisible(circle: ActCircle): Promise<void> {
    return this._circles.get(circle).then((c) => { return c.setVisible(circle.visible); });
  }

  setRadius(circle: ActCircle): Promise<void> {
    return this._circles.get(circle).then((c) => { return c.setRadius(circle.radius); });
  }

  createEventObservable<T>(eventName: string, circle: ActCircle): Observable<T> {
    return Observable.create((observer: Observer<T>) => {
      let listener: mapTypes.MapsEventListener = null;
      this._circles.get(circle).then((c) => {
        listener = c.addListener(eventName, (e: T) => this._zone.run(() => observer.next(e)));
      });

      return () => {
        if (listener !== null) {
          listener.remove();
        }
      };
    });
  }
}
