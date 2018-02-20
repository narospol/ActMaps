import { Component, ElementRef, EventEmitter, OnChanges, OnDestroy, OnInit, SimpleChange, Output, Input } from '@angular/core';

import {InfoWindowManager} from '../services/managers/info-window-manager';

import {ActMarker} from './marker';

// tslint:disable
let infoWindowId = 0;
@Component({
  selector: 'act-info-window',
  template: `
    <div class='act-info-window-content'>
      <ng-content></ng-content>
    </div>
  `
})
export class ActInfoWindow implements OnDestroy, OnChanges, OnInit {
  @Input() latitude: number;
  @Input() longitude: number;
  @Input() disableAutoPan: boolean;
  @Input() zIndex: number;
  @Input() maxWidth: number;
  
  hostMarker: ActMarker;
  content: Node;
  @Input() isOpen: boolean = false;
  @Output() infoWindowClose: EventEmitter<void> = new EventEmitter<void>();

  private static _infoWindowOptionsInputs: string[] = ['disableAutoPan', 'maxWidth'];
  private _infoWindowAddedToManager: boolean = false;
  private _id: string = (infoWindowId++).toString();

  constructor(private _infoWindowManager: InfoWindowManager, private _el: ElementRef) {}

  ngOnInit() {
    this.content = this._el.nativeElement.querySelector('.act-info-window-content');
    this._infoWindowManager.addInfoWindow(this);
    this._infoWindowAddedToManager = true;
    this._updateOpenState();
    this._registerEventListeners();
  }

  /** @internal */
  ngOnChanges(changes: {[key: string]: SimpleChange}) {
    if (!this._infoWindowAddedToManager) {
      return;
    }
    if ((changes['latitude'] || changes['longitude']) && typeof this.latitude === 'number' &&
        typeof this.longitude === 'number') {
      this._infoWindowManager.setPosition(this);
    }
    if (changes['zIndex']) {
      this._infoWindowManager.setZIndex(this);
    }
    if (changes['isOpen']) {
      this._updateOpenState();
    }
    this._setInfoWindowOptions(changes);
  }

  private _registerEventListeners() {
    this._infoWindowManager.createEventObservable('closeclick', this).subscribe(() => {
      this.isOpen = false;
      this.infoWindowClose.emit();
    });
  }

  private _updateOpenState() {
    this.isOpen ? this.open() : this.close();
  }

  private _setInfoWindowOptions(changes: {[key: string]: SimpleChange}) {
    let options: {[propName: string]: any} = {};
    let optionKeys = Object.keys(changes).filter(
        k => ActInfoWindow._infoWindowOptionsInputs.indexOf(k) !== -1);
    optionKeys.forEach((k) => { options[k] = changes[k].currentValue; });
    this._infoWindowManager.setOptions(this, options);
  }

  open(): Promise<void> { return this._infoWindowManager.open(this); }
  close(): Promise<void> {
    return this._infoWindowManager.close(this).then(() => { this.infoWindowClose.emit(); });
  }

  /** @internal */
  id(): string { return this._id; }

  /** @internal */
  toString(): string { return 'ActInfoWindow-' + this._id.toString(); }

  /** @internal */
  ngOnDestroy() { this._infoWindowManager.deleteInfoWindow(this); }
}
