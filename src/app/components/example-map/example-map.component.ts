import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';


@Component({
  selector: 'app-example-map',
  templateUrl: './example-map.component.html',
  styleUrls: ['./example-map.component.css']
})
export class ExampleMapComponent implements OnInit, AfterViewInit {

  markers = [
    { lat: 13.7643345, lng: 100.5684626 },
    { lat: 13.7443645, lng: 100.5584626 },
  ];

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // this.buildMap(this.center, this._zoom);
    // const mapElem: HTMLElement = this.document.getElementById('map');
    // const location = new MapLocation(13.7643345, 100.5684626);
    // const mapOptions = new MapOptions(location);
    // mapOptions.zoom = 11;
    // const map = new ActMap(mapElem, mapOptions);
    // map.addMarker(location);
    // console.log('map ', map);
  }

}
