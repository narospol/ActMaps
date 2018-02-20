// import { Component, ElementRef, EventEmitter, OnChanges, OnDestroy, OnInit, SimpleChange, Output, Input } from '@angular/core';

// import { ActMarker } from './marker';
// import { InfoMarkerManager } from '../services/managers/info-marker-manager';

// // tslint:disable
// let infoMarkerId = 0;
// @Component({
//   selector: 'act-info-marker',
//   template: `
//     <div class='act-info-marker-content'>
//       <ng-content></ng-content>
//     </div>
//   `
// })
// export class ActInfoMarker implements OnDestroy, OnChanges, OnInit {
//   @Input() latitude: number;
//   @Input() longitude: number;
//   @Input() disableAutoPan: boolean;
//   @Input() zIndex: number;
//   @Input() maxWidth: number;

//   hostMarker: ActMarker;
//   content: Node;
//   @Input() isOpen: boolean = true;
//   @Output() infoMarkerClose: EventEmitter<void> = new EventEmitter<void>();

//   private static _infoWindowOptionsInputs: string[] = ['disableAutoPan', 'maxWidth'];
//   private _infoMarkerAddedToManager: boolean = false;
//   private _id: string = (infoMarkerId++).toString();

//   constructor(private _infoMarkerManager: InfoMarkerManager, private _el: ElementRef) { }

//   ngOnInit() {
//     this.content = this._el.nativeElement.querySelector('.act-info-marker-content');
//     this._infoMarkerManager.addInfoMarker(this);
//     this._infoMarkerAddedToManager = true;
//     this._updateOpenState();
//     this._registerEventListeners();
//   }

//   /** @internal */
//   ngOnChanges(changes: { [key: string]: SimpleChange }) {
//     if (!this._infoMarkerAddedToManager) {
//       return;
//     }
//     if ((changes['latitude'] || changes['longitude']) && typeof this.latitude === 'number' &&
//       typeof this.longitude === 'number') {
//       this._infoMarkerManager.setPosition(this);
//     }
//     if (changes['zIndex']) {
//       this._infoMarkerManager.setZIndex(this);
//     }
//     if (changes['isOpen']) {
//       this._updateOpenState();
//     }
//     this._setInfoWindowOptions(changes);
//   }

//   private _registerEventListeners() {
//     this._infoMarkerManager.createEventObservable('closeclick', this).subscribe(() => {
//       this.isOpen = false;
//       this.infoMarkerClose.emit();
//       console.log('close clicked ', this);
//     });
//   }

//   private _updateOpenState() {
//     this.isOpen ? this.open() : this.close();
//   }

//   private _setInfoWindowOptions(changes: { [key: string]: SimpleChange }) {
//     let options: { [propName: string]: any } = {};
//     let optionKeys = Object.keys(changes).filter(
//       k => ActInfoMarker._infoWindowOptionsInputs.indexOf(k) !== -1);
//     optionKeys.forEach((k) => { options[k] = changes[k].currentValue; });
//     this._infoMarkerManager.setOptions(this, options);
//   }

//   open(): Promise<void> { return this._infoMarkerManager.open(this); }
//   close(): Promise<void> {
//     return this._infoMarkerManager.close(this).then(() => { this.infoMarkerClose.emit(); });
//   }

//   id(): string { return this._id; }

//   toString(): string { return 'ActInfoMarker-' + this._id.toString(); }

//   ngOnDestroy() { this._infoMarkerManager.deleteInfoWindow(this); }
// }
