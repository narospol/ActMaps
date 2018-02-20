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
import { ActInfoMarker } from './info-marker';


declare var System: any;
// tslint:disable
@Component({
  selector: 'act-pop-over',
  template: `
    <div #outerWrapper>
      <div #viewContainer></div>
    </div>
    <ng-content></ng-content>`
})
export class ActPopOver implements AfterViewInit, OnDestroy, OnChanges {
  @Input() key: String;
  @Input() latitude: number;
  @Input() longitude: number;
  @Input() isOpen: boolean = false;
  @Input() placement: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() maxWidth: number | string = 200;
  @Input() maxHeight: number | string = 200;
  @Input() backgroundColor: string;
  @Input() padding: string;
  @Input() border: { width: string; color: string } | boolean = false;
  @Input() borderRadius: string;
  @Input() fontColor: string;
  @Input() fontSize: string;
  @Input() pointer: string | boolean = false;
  @Input() shadow: boolean | { h?: string, v?: string, blur: string, spread: string, opacity: number, color: string };
  @Input() openOnMarkerClick: boolean = true;
  @Input() closeOnMapClick: boolean = true;
  @Input() wrapperClass: string;
  @Input() closeWhenOthersOpen: boolean = true;
  @Input() panOnOpen: boolean = true;

  @Output() isOpenChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() beforeOpen: EventEmitter<void> = new EventEmitter<void>();
  @Output() afterClose: EventEmitter<void> = new EventEmitter<void>();


  @ViewChild('outerWrapper', { read: ElementRef }) _outerWrapper: ElementRef;
  @ViewChild('viewContainer', { read: ViewContainerRef }) _viewContainerRef: ViewContainerRef;
  @ContentChild(TemplateRef) _templateRef: TemplateRef<any>;

  protected _nativePopOver: any;
  protected _popOverInitialized: Promise<any> | null = null;

  constructor(
    @Optional() @Host() @SkipSelf() private _infoMarker: ActInfoMarker,
    private _wrapper: GoogleMapsAPIWrapper,
    private _manager: InfoMarkerManager,
    private _loader: MapsAPILoader
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (this._nativePopOver == null) {
      return;
    }
    if ('isOpen' in changes && this.isOpen) {
      this.openPopOver();
    } else if ('isOpen' in changes && !this.isOpen) {
      this.closePopOver();
    }
    if (('latitude' in changes || 'longitude' in changes) && this._infoMarker == null) {
      this._updatePosition();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createPopOver();
    }, 500);
  }

  protected createPopOver() {
    const m = this._manager !== null && this._infoMarker !== null ? this._manager.getMarker(this._infoMarker.key) : null;
    this._popOverInitialized = this._loader.load()
      .then(() => System.import('../pop-over.js'))
      .then((module: any) => Promise.all([module, m, this._wrapper.getNativeMap()]))
      .then((elems) => {
        const options: any = {
          classPrefix: 'pop-',
          eventPrefix: 'pop-over-window-',
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
          offset: { top: '-50px' },
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
          options.position = {
            lat: options.marker.latitude,
            lng: options.marker.longitude
          };
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
        this.openPopOver();
      }
      this._manager.addPopOver(this.key, this);
    });
  }

  public openPopOver() {
    this._popOverInitialized.then(() => {
      this._createViewContent();
      this._nativePopOver.open();
    });
  }

  public closePopOver() {
    this._popOverInitialized.then(() => {
      this._nativePopOver.close();
    });
  }

  public togglePopOver() {
    this._popOverInitialized.then(() => {
      this._nativePopOver.isOpen() ? this._nativePopOver.close() : this._nativePopOver.open();
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
