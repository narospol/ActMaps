import { Component, ElementRef, EventEmitter, OnChanges, OnDestroy, OnInit, SimpleChanges, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { MouseEvent } from '../map-types';
import { GoogleMapsAPIWrapper } from '../services/google-maps-api-wrapper';
import {
  // FullscreenControlOptions,
  LatLng, LatLngLiteral,
  // MapTypeControlOptions,
  MapTypeId,
  // PanControlOptions,
  // RotateControlOptions,
  // ScaleControlOptions,
  // StreetViewControlOptions,
  // ZoomControlOptions
} from '../services/google-maps-types';
import { LatLngBounds, LatLngBoundsLiteral, MapTypeStyle } from '../services/google-maps-types';
import { CircleManager } from '../services/managers/circle-manager';
import { InfoWindowManager } from '../services/managers/info-window-manager';
import { MarkerManager } from '../services/managers/marker-manager';
import { InfoMarkerManager } from '../services/managers/info-marker-manager';

// tslint:disable
@Component({
  selector: 'act-map',
  providers: [
    GoogleMapsAPIWrapper, MarkerManager, InfoWindowManager, InfoMarkerManager, CircleManager,
  ],
  host: {
    '[class.google-map-container]': 'true'
  },
  styles: [`
    .act-map-container-inner {
      width: inherit;
      height: inherit;
    }
    .act-map-content {
      display:none;
    }
  `],
  template: `
    <div class='act-map-container-inner google-map-container-inner'></div>
    <div class='act-map-content'>
      <ng-content></ng-content>
    </div>
  `
})
export class ActMap implements OnChanges, OnInit, OnDestroy {
  @Input() longitude: number = 0;
  @Input() latitude: number = 0;
  @Input() zoom: number = 8;
  @Input() minZoom: number;
  @Input() maxZoom: number;
  @Input('mapDraggable') draggable: boolean = true;
  @Input() disableDoubleClickZoom: boolean = false;
  @Input() disableDefaultUI: boolean = false;
  @Input() scrollwheel: boolean = true;
  @Input() backgroundColor: string;
  @Input() draggableCursor: string;
  @Input() draggingCursor: string;
  @Input() keyboardShortcuts: boolean = true;
  @Input() zoomControl: boolean = true;
  // @Input() zoomControlOptions: ZoomControlOptions;
  @Input() styles: MapTypeStyle[] = [];
  @Input() usePanning: boolean = false;
  @Input() streetViewControl: boolean = true;
  // @Input() streetViewControlOptions: StreetViewControlOptions;
  @Input() fitBounds: LatLngBoundsLiteral | LatLngBounds = null;
  @Input() scaleControl: boolean = false;
  // @Input() scaleControlOptions: ScaleControlOptions;
  @Input() mapTypeControl: boolean = false;
  // @Input() mapTypeControlOptions: MapTypeControlOptions;
  @Input() panControl: boolean = false;
  // @Input() panControlOptions: PanControlOptions;
  @Input() rotateControl: boolean = false;
  // @Input() rotateControlOptions: RotateControlOptions;
  @Input() fullscreenControl: boolean = false;
  // @Input() fullscreenControlOptions: FullscreenControlOptions;
  @Input() mapTypeId: 'roadmap' | 'hybrid' | 'satellite' | 'terrain' | string = 'roadmap';
  @Input() clickableIcons: boolean = true;

  /**
   * This setting controls how gestures on the map are handled.
   * Allowed values:
   * - 'cooperative' (Two-finger touch gestures pan and zoom the map. One-finger touch gestures are not handled by the map.)
   * - 'greedy'      (All touch gestures pan or zoom the map.)
   * - 'none'        (The map cannot be panned or zoomed by user gestures.)
   * - 'auto'        [default] (Gesture handling is either cooperative or greedy, depending on whether the page is scrollable or not.
   */
  @Input() gestureHandling: 'cooperative' | 'greedy' | 'none' | 'auto' = 'auto';

  /**
   * Map option attributes that can change over time
   */
  private static _mapOptionsAttributes: string[] = [
    'disableDoubleClickZoom', 'scrollwheel', 'draggable', 'draggableCursor', 'draggingCursor',
    'keyboardShortcuts', 'zoomControl', 'zoomControlOptions', 'styles', 'streetViewControl',
    'streetViewControlOptions', 'zoom', 'mapTypeControl', 'mapTypeControlOptions', 'minZoom',
    'maxZoom', 'panControl', 'panControlOptions', 'rotateControl', 'rotateControlOptions',
    'fullscreenControl', 'fullscreenControlOptions', 'scaleControl', 'scaleControlOptions',
    'mapTypeId', 'clickableIcons', 'gestureHandling'
  ];

  private _observableSubscriptions: Subscription[] = [];

  @Output() mapClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output() mapRightClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output() mapDblClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output() centerChange: EventEmitter<LatLngLiteral> = new EventEmitter<LatLngLiteral>();
  @Output() boundsChange: EventEmitter<LatLngBounds> = new EventEmitter<LatLngBounds>();
  @Output() mapTypeIdChange: EventEmitter<MapTypeId> = new EventEmitter<MapTypeId>();
  @Output() idle: EventEmitter<void> = new EventEmitter<void>();
  @Output() zoomChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() mapReady: EventEmitter<any> = new EventEmitter<any>();

  constructor(private _elem: ElementRef, private _mapsWrapper: GoogleMapsAPIWrapper) { }

  /** @internal */
  ngOnInit() {
    // todo: this should be solved with a new component and a viewChild decorator
    const container = this._elem.nativeElement.querySelector('.act-map-container-inner');
    this._initMapInstance(container);
  }

  private _initMapInstance(el: HTMLElement) {
    this._mapsWrapper.createMap(el, {
      center: { lat: this.latitude || 0, lng: this.longitude || 0 },
      zoom: this.zoom,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      disableDefaultUI: this.disableDefaultUI,
      disableDoubleClickZoom: this.disableDoubleClickZoom,
      scrollwheel: this.scrollwheel,
      backgroundColor: this.backgroundColor,
      draggable: this.draggable,
      draggableCursor: this.draggableCursor,
      draggingCursor: this.draggingCursor,
      keyboardShortcuts: this.keyboardShortcuts,
      styles: this.styles,
      zoomControl: this.zoomControl,
      // zoomControlOptions: this.zoomControlOptions,
      streetViewControl: this.streetViewControl,
      // streetViewControlOptions: this.streetViewControlOptions,
      scaleControl: this.scaleControl,
      // scaleControlOptions: this.scaleControlOptions,
      mapTypeControl: this.mapTypeControl,
      // mapTypeControlOptions: this.mapTypeControlOptions,
      panControl: this.panControl,
      // panControlOptions: this.panControlOptions,
      rotateControl: this.rotateControl,
      // rotateControlOptions: this.rotateControlOptions,
      fullscreenControl: this.fullscreenControl,
      // fullscreenControlOptions: this.fullscreenControlOptions,
      mapTypeId: this.mapTypeId,
      clickableIcons: this.clickableIcons,
      gestureHandling: this.gestureHandling
    })
      .then(() => this._mapsWrapper.getNativeMap())
      .then(map => this.mapReady.emit(map));

    // register event listeners
    this._handleMapCenterChange();
    this._handleMapZoomChange();
    this._handleMapMouseEvents();
    this._handleBoundsChange();
    this._handleMapTypeIdChange();
    this._handleIdleEvent();
  }

  /** @internal */
  ngOnDestroy() {
    // unsubscribe all registered observable subscriptions
    this._observableSubscriptions.forEach((s) => s.unsubscribe());
  }

  /* @internal */
  ngOnChanges(changes: SimpleChanges) {
    this._updateMapOptionsChanges(changes);
    this._updatePosition(changes);
  }

  private _updateMapOptionsChanges(changes: SimpleChanges) {
    let options: { [propName: string]: any } = {};
    let optionKeys =
      Object.keys(changes).filter(k => ActMap._mapOptionsAttributes.indexOf(k) !== -1);
    optionKeys.forEach((k) => { options[k] = changes[k].currentValue; });
    this._mapsWrapper.setMapOptions(options);
  }

  /**
   * Triggers a resize event on the google map instance.
   * When recenter is true, the of the google map gets called with the current lat/lng values or fitBounds value to recenter the map.
   * Returns a promise that gets resolved after the event was triggered.
   */
  triggerResize(recenter: boolean = true): Promise<void> {
    // Note: When we would trigger the resize event and show the map in the same turn (which is a
    // common case for triggering a resize event), then the resize event would not
    // work (to show the map), so we trigger the event in a timeout.
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        return this._mapsWrapper.triggerMapEvent('resize').then(() => {
          if (recenter) {
            this.fitBounds != null ? this._fitBounds() : this._setCenter();
          }
          resolve();
        });
      });
    });
  }

  private _updatePosition(changes: SimpleChanges) {
    if (changes['latitude'] == null && changes['longitude'] == null &&
      changes['fitBounds'] == null) {
      // no position update needed
      return;
    }

    // we prefer fitBounds in changes
    if (changes['fitBounds'] && this.fitBounds != null) {
      this._fitBounds();
      return;
    }

    if (typeof this.latitude !== 'number' || typeof this.longitude !== 'number') {
      return;
    }
    this._setCenter();
  }

  private _setCenter() {
    let newCenter = {
      lat: this.latitude,
      lng: this.longitude,
    };
    if (this.usePanning) {
      this._mapsWrapper.panTo(newCenter);
    } else {
      this._mapsWrapper.setCenter(newCenter);
    }
  }

  private _fitBounds() {
    if (this.usePanning) {
      this._mapsWrapper.panToBounds(this.fitBounds);
      return;
    }
    this._mapsWrapper.fitBounds(this.fitBounds);
  }

  private _handleMapCenterChange() {
    const s = this._mapsWrapper.subscribeToMapEvent<void>('center_changed').subscribe(() => {
      this._mapsWrapper.getCenter().then((center: LatLng) => {
        this.latitude = center.lat();
        this.longitude = center.lng();
        this.centerChange.emit(<LatLngLiteral>{ lat: this.latitude, lng: this.longitude });
      });
    });
    this._observableSubscriptions.push(s);
  }

  private _handleBoundsChange() {
    const s = this._mapsWrapper.subscribeToMapEvent<void>('bounds_changed').subscribe(() => {
      this._mapsWrapper.getBounds().then(
        (bounds: LatLngBounds) => { this.boundsChange.emit(bounds); });
    });
    this._observableSubscriptions.push(s);
  }

  private _handleMapTypeIdChange() {
    const s = this._mapsWrapper.subscribeToMapEvent<void>('maptypeid_changed').subscribe(() => {
      this._mapsWrapper.getMapTypeId().then(
        (mapTypeId: MapTypeId) => { this.mapTypeIdChange.emit(mapTypeId); });
    });
    this._observableSubscriptions.push(s);
  }

  private _handleMapZoomChange() {
    const s = this._mapsWrapper.subscribeToMapEvent<void>('zoom_changed').subscribe(() => {
      this._mapsWrapper.getZoom().then((z: number) => {
        this.zoom = z;
        this.zoomChange.emit(z);
      });
    });
    this._observableSubscriptions.push(s);
  }

  private _handleIdleEvent() {
    const s = this._mapsWrapper.subscribeToMapEvent<void>('idle').subscribe(
      () => { this.idle.emit(void 0); });
    this._observableSubscriptions.push(s);
  }

  private _handleMapMouseEvents() {
    interface Emitter {
      emit(value: any): void;
    }
    type Event = { name: string, emitter: Emitter };

    const events: Event[] = [
      { name: 'click', emitter: this.mapClick },
      { name: 'rightclick', emitter: this.mapRightClick },
      { name: 'dblclick', emitter: this.mapDblClick },
    ];

    events.forEach((e: Event) => {
      const s = this._mapsWrapper.subscribeToMapEvent<{ latLng: LatLng }>(e.name).subscribe(
        (event: { latLng: LatLng }) => {
          const value = <MouseEvent>{ coords: { lat: event.latLng.lat(), lng: event.latLng.lng() } };
          e.emitter.emit(value);
        });
      this._observableSubscriptions.push(s);
    });
  }
}
