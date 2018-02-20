import { LAZY_MAPS_API_CONFIG, LazyMapsAPILoaderConfigLiteral } from './services/maps-api-loader/lazy-maps-api-loader';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { ActCircle } from './directives/circle';
import { ActInfoMarker } from './directives/info-marker';
import { ActInfoWindow } from './directives/info-window';
import { ActMap } from './directives/map';
import { ActMarker } from './directives/marker';
import { ActPopOver } from './directives/pop-over';
import { BROWSER_GLOBALS_PROVIDERS } from './utils/browser-globals';
import { LazyMapsAPILoader } from './services/maps-api-loader/lazy-maps-api-loader';
import { MapsAPILoader } from './services/maps-api-loader/maps-api-loader';

export function coreDirectives() {
  return [
    ActMap, ActMarker,
    ActInfoWindow, ActInfoMarker,
    ActCircle,
    ActPopOver
  ];
}


@NgModule({ declarations: coreDirectives(), exports: coreDirectives() })
export class ActMapModule {
  static forRoot(lazyMapsAPILoaderConfig?: LazyMapsAPILoaderConfigLiteral): ModuleWithProviders {
    return {
      ngModule: ActMapModule,
      providers: [
        ...BROWSER_GLOBALS_PROVIDERS,
        { provide: MapsAPILoader, useClass: LazyMapsAPILoader },
        { provide: LAZY_MAPS_API_CONFIG, useValue: lazyMapsAPILoaderConfig }
      ],
    };
  }
}
