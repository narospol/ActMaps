import {Directive, EventEmitter, OnChanges, OnDestroy, SimpleChange,
  AfterContentInit, ContentChildren, QueryList, Input, Output
} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import {MouseEvent} from '../map-types';
import * as mapTypes from '../services/google-maps-types';
import {MarkerManager} from '../services/managers/marker-manager';

import {ActInfoWindow} from './info-window';
import {MarkerLabel} from '../map-types';

let markerId = 0;
// tslint:disable
@Directive({
  selector: 'act-marker',
  inputs: [
    'latitude', 'longitude', 'title', 'label', 'draggable: markerDraggable', 'iconUrl',
    'openInfoWindow', 'opacity', 'visible', 'zIndex', 'animation'
  ],
  outputs: ['markerClick', 'dragEnd', 'mouseOver', 'mouseOut']
})
export class ActMarker implements OnDestroy, OnChanges, AfterContentInit {
  @Input() latitude: number;
  @Input() longitude: number;
  @Input() title: string;
  @Input() label: string | MarkerLabel;
  @Input('markerDraggable') draggable: boolean = false;
  @Input() iconUrl: string;
  @Input() visible: boolean = true;
  @Input() openInfoWindow: boolean = true;
  @Input() opacity: number = 1;

  @Input() zIndex: number = 1;
  @Input('markerClickable') clickable: boolean = true;
  animation: 'BOUNCE' | 'DROP' | null;
  
  @Output() markerClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() dragEnd: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output() mouseOver: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output() mouseOut: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  @ContentChildren(ActInfoWindow) infoWindow: QueryList<ActInfoWindow> = new QueryList<ActInfoWindow>();

  private _markerAddedToManger: boolean = false;
  private _id: string;
  private _observableSubscriptions: Subscription[] = [];

  constructor(private _markerManager: MarkerManager) { this._id = (markerId++).toString(); }


  ngAfterContentInit() {
    this.handleInfoWindowUpdate();
    this.infoWindow.changes.subscribe(() => this.handleInfoWindowUpdate());
  }

  private handleInfoWindowUpdate() {
    if (this.infoWindow.length > 1) {
      throw new Error('Expected no more than one info window.');
    }
    this.infoWindow.forEach(marker => {
      marker.hostMarker = this;
    });
  }

  ngOnChanges(changes: {[key: string]: SimpleChange}) {
    if (typeof this.latitude !== 'number' || typeof this.longitude !== 'number') {
      return;
    }
    if (!this._markerAddedToManger) {
      this._markerManager.addMarker(this);
      this._markerAddedToManger = true;
      this._addEventListeners();
      return;
    }
    if (changes['latitude'] || changes['longitude']) {
      this._markerManager.updateMarkerPosition(this);
    }
    if (changes['title']) {
      this._markerManager.updateTitle(this);
    }
    if (changes['label']) {
      this._markerManager.updateLabel(this);
    }
    if (changes['draggable']) {
      this._markerManager.updateDraggable(this);
    }
    if (changes['iconUrl']) {
      this._markerManager.updateIcon(this);
    }
    if (changes['opacity']) {
      this._markerManager.updateOpacity(this);
    }
    if (changes['visible']) {
      this._markerManager.updateVisible(this);
    }
    if (changes['zIndex']) {
      this._markerManager.updateZIndex(this);
    }
    if (changes['clickable']) {
      this._markerManager.updateClickable(this);
    }
    if (changes['animation']) {
      this._markerManager.updateAnimation(this);
    }
  }

  private _addEventListeners() {
    const cs = this._markerManager.createEventObservable('click', this).subscribe(() => {
      if (this.openInfoWindow) {
        this.infoWindow.forEach(infoWindow => infoWindow.open());
      }
      this.markerClick.emit(null);
    });
    this._observableSubscriptions.push(cs);

    const ds =
        this._markerManager.createEventObservable<mapTypes.MouseEvent>('dragend', this)
            .subscribe((e: mapTypes.MouseEvent) => {
              this.dragEnd.emit(<MouseEvent>{coords: {lat: e.latLng.lat(), lng: e.latLng.lng()}});
            });
    this._observableSubscriptions.push(ds);

    const mover =
        this._markerManager.createEventObservable<mapTypes.MouseEvent>('mouseover', this)
            .subscribe((e: mapTypes.MouseEvent) => {
              this.mouseOver.emit(<MouseEvent>{coords: {lat: e.latLng.lat(), lng: e.latLng.lng()}});
            });
    this._observableSubscriptions.push(mover);

    const mout =
        this._markerManager.createEventObservable<mapTypes.MouseEvent>('mouseout', this)
            .subscribe((e: mapTypes.MouseEvent) => {
              this.mouseOut.emit(<MouseEvent>{coords: {lat: e.latLng.lat(), lng: e.latLng.lng()}});
            });
    this._observableSubscriptions.push(mout);
  }

  
  id(): string { return this._id; }

  
  toString(): string { return 'ActMarker-' + this._id.toString(); }

  
  ngOnDestroy() {
    this._markerManager.deleteMarker(this);
    // unsubscribe all registered observable subscriptions
    this._observableSubscriptions.forEach((s) => s.unsubscribe());
  }
}
