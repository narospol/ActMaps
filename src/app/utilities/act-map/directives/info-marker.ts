import {
  Host, SkipSelf, OnChanges, AfterViewInit, EventEmitter, Input, SimpleChanges,
  ViewContainerRef, TemplateRef, Output, Optional, OnDestroy,
  ElementRef, Component, ViewChild, ContentChild } from '@angular/core';
import { GoogleMapsAPIWrapper } from '../services/google-maps-api-wrapper';
import { MarkerManager } from '../services/managers/marker-manager';
import { ActMarker } from './marker';
import { MapsAPILoader } from '../services/maps-api-loader/maps-api-loader';
import { ActInfoWindow } from './info-window';
import { InfoMarkerManager } from '../services/managers/info-marker-manager';
import { ActPopOver } from './pop-over';


declare var System: any;
// tslint:disable
@Component({
  selector: 'act-info-marker',
  template: `
  <div id="outWrapper" #outerWrapper>
    <div style="display: none;" #viewContainer>
      <ng-content></ng-content>
    </div>
  </div>
  `
})
export class ActInfoMarker implements AfterViewInit, OnDestroy, OnChanges {
  @Input() key: String = "Marker";
  @Input() latitude: number;
  @Input() longitude: number;
  @Input() placement: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() maxWidth: number | string = 200;
  @Input() maxHeight: number | string = 200;
  @Input() backgroundColor: string;
  @Input() padding: string;
  @Input() border: { width: string; color: string } | boolean;
  @Input() borderRadius: string;
  @Input() fontColor: string;
  @Input() fontSize: string;
  @Input() pointer: string | boolean;
  @Input() shadow: boolean | { h?: string, v?: string, blur: string, spread: string, opacity: number, color: string };
  @Input() wrapperClass: string;
  @Input() showCloseButton: boolean = false;
  @Input() panOnOpen: boolean = true;
  
  @Output() isOpenChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() beforeOpen: EventEmitter<void> = new EventEmitter<void>();
  @Output() afterClose: EventEmitter<void> = new EventEmitter<void>();
  
  
  @ViewChild('outerWrapper', { read: ElementRef }) _outerWrapper: ElementRef;
  @ViewChild('viewContainer', { read: ViewContainerRef }) _viewContainerRef: ViewContainerRef;
  @ContentChild(TemplateRef) _templateRef: TemplateRef<any>;
  
  _popOver: ActPopOver;
  isOpen: boolean = true;
  closeOnMapClick: boolean = false;
  
  protected _nativeInfoMarker: any;
  protected _infoMarkerInitialized: Promise<any> | null = null;

  constructor(
    private _wrapper: GoogleMapsAPIWrapper,
    private _manager: InfoMarkerManager,
    private _loader: MapsAPILoader
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (this._nativeInfoMarker == null) {
      return;
    }
    if ('isOpen' in changes && this.isOpen) {
      this._openInfoWindow();
    } else if ('isOpen' in changes && !this.isOpen) {
      this._closeInfoWindow();
    }
    if ('latitude' in changes || 'longitude' in changes) {
      this._updatePosition();
    }
  }

  ngAfterViewInit() {
    this.createInfoMarker();
    setTimeout(() => {
      this._popOver = this._manager.getPopOver(this.key);
      console.log('popOver ', this._popOver);
    }, 1e3);
  }

  protected createInfoMarker() {
    this._infoMarkerInitialized = this._loader.load()
    .then(() => System.import('../pop-over.js'))
    .then((module: any) => Promise.all([module, null, this._wrapper.getNativeMap()]))
    .then((elems) => {
      const options: any = {
        classPrefix: 'info-marker-',
        eventPrefix: 'info-marker-window-',
        map: elems[2],
        content: '',
        placement: this.placement,
        maxWidth: this.maxWidth,
        maxHeight: this.maxHeight,
        backgroundColor: this.backgroundColor,
        padding: this.padding,
        border: this.border,
        borderRadius: this.borderRadius,
        fontColor: this.fontColor,
        pointer: this.pointer,
        shadow: this.shadow,
        closeOnMapClick: this.closeOnMapClick,
        closeWhenOthersOpen: false,
        showCloseButton: false,
        isHandleBackground: true,
        panOnOpen: this.panOnOpen,
        wrapperClass: this.wrapperClass,
        callbacks: {
          beforeOpen: () => {
            this._createViewContent();
            this.beforeOpen.emit();
          },
          afterOpen: () => {
            this.isOpenChange.emit(this.openStatus());
          },
          afterClose: () => {
            this.afterClose.emit();
            this.isOpenChange.emit(this.openStatus());
          },
          bgClicked: () => {
            this._popOver && this._popOver.togglePopOver();
          },
          bgHoverEnter: () => {
            // this._popOver && this._popOver.openPopOver();
          },
          bgHoverLeave: () => {
            // this._popOver && this._popOver.closePopOver();
          }
        }
      };
      if (elems[1] != null) {
        options.marker = elems[1];
      } else {
        options.position = {
          lat: this.latitude,
          lng: this.longitude
        };
      }
      this._nativeInfoMarker = new elems[0](options);
    });
    this._infoMarkerInitialized.then(() => {
      if (this.isOpen) {
        this._openInfoWindow();
      }
      this._manager.addInfoMarker(this.key, this);
    });
  }

  protected _openInfoWindow() {
    this._infoMarkerInitialized.then(() => {
      this._createViewContent();
      this._nativeInfoMarker.open();
    });
  }

  protected _closeInfoWindow() {
    this._infoMarkerInitialized.then(() => {
      this._nativeInfoMarker.close();
    });
  }

  protected _createViewContent() {
    if (this._viewContainerRef.length === 1) {
      return;
    }
    const evr = this._viewContainerRef.createEmbeddedView(this._templateRef);
    this._nativeInfoMarker.setContent(this._outerWrapper.nativeElement);
    // we have to run this in a separate cycle.
    setTimeout(() => {
      evr.detectChanges();
    });
  }

  protected _updatePosition() {
    this._nativeInfoMarker.setPosition({
      lat: this.latitude,
      lng: this.longitude
    });
  }

  openStatus(): boolean {
    return this._nativeInfoMarker && this._nativeInfoMarker.isOpen();
  }

  getMap() {
    return this._nativeInfoMarker.map;
  }

  ngOnDestroy() {
    if (this._nativeInfoMarker) {
      this._nativeInfoMarker.destroy();
    }
  }
}
