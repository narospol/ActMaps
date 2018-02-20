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


declare var System: any;
// tslint:disable
let markerId = 0;
@Component({
  selector: 'act-info-marker',
  template: `
  <div id="outWrapper" #outerWrapper>
    <div id="contentContainer" style="display: none;" #viewContainer>
      <ng-content></ng-content>
    </div>
  </div>
  `
})
export class ActInfoMarker implements AfterViewInit, OnDestroy, OnChanges {
  @Input() latitude: number;
  @Input() longitude: number;
  @Input() isOpen: boolean = true;
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
  @Input() openOnMarkerClick: boolean = true;
  @Input() closeOnMapClick: boolean = true;
  @Input() wrapperClass: string;
  @Input() closeWhenOthersOpen: boolean = false;
  @Input() showCloseButton: boolean = false;
  @Input() panOnOpen: boolean = true;

  @Output() isOpenChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() beforeOpen: EventEmitter<void> = new EventEmitter<void>();
  @Output() afterClose: EventEmitter<void> = new EventEmitter<void>();


  @ViewChild('outerWrapper', { read: ElementRef }) _outerWrapper: ElementRef;
  @ViewChild('viewContainer', { read: ViewContainerRef }) _viewContainerRef: ViewContainerRef;
  @ContentChild(TemplateRef) _templateRef: TemplateRef<any>;

  key: String = "ActInfoMarker";

  protected _nativePopOver: any;
  protected _popOverInitialized: Promise<any> | null = null;

  constructor(
    private _wrapper: GoogleMapsAPIWrapper,
    private _manager: InfoMarkerManager,
    private _loader: MapsAPILoader
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (this._nativePopOver == null) {
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
    // const m = this._manager != null ? this._manager.getNativeWindow(this._popOver.key) : null;
    this._popOverInitialized = this._loader.load()
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
          openOnMarkerClick: this.openOnMarkerClick,
          closeWhenOthersOpen: this.closeWhenOthersOpen,
          showCloseButton: false,
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
        this._nativePopOver = new elems[0](options);
      });
    this._popOverInitialized.then(() => {
      if (this.isOpen) {
        this._openInfoWindow();
      }
      this.key = `${this.key}-${++markerId}`;
      this._manager.addInfoMarker(this.key, this);
    });
  }

  protected _openInfoWindow() {
    this._popOverInitialized.then(() => {
      this._createViewContent();
      this._nativePopOver.open();
    });
  }

  protected _closeInfoWindow() {
    this._popOverInitialized.then(() => {
      this._nativePopOver.close();
    });
  }

  protected _createViewContent() {
    if (this._viewContainerRef.length === 1) {
      return;
    }
    const evr = this._viewContainerRef.createEmbeddedView(this._templateRef);
    this._nativePopOver.setContent(this._outerWrapper.nativeElement);
    // we have to run this in a separate cycle.
    setTimeout(() => {
      evr.detectChanges();
    });
  }

  protected _updatePosition() {
    this._nativePopOver.setPosition({
      lat: this.latitude,
      lng: this.longitude
    });
  }

  openStatus(): boolean {
    return this._nativePopOver && this._nativePopOver.isOpen();
  }

  ngOnDestroy() {
    if (this._nativePopOver) {
      this._nativePopOver.destroy();
    }
  }
}
