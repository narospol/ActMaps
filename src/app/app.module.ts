import { ActMapModule } from './utilities/act-map/act-map.module';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { ExampleMapComponent } from './components/example-map/example-map.component';
import { NgModule } from '@angular/core';
import { PopOverContentComponent } from './components/pop-over-content/pop-over-content.component';

@NgModule({
  declarations: [
    AppComponent,
    ExampleMapComponent,
    PopOverContentComponent
  ],
  imports: [
    BrowserModule,
    ActMapModule.forRoot({ apiKey: 'AIzaSyBnniVOg-2DYbZUpP1z3stloa1lvUFcQ34' }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
