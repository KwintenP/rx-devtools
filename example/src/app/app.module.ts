import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import {CommonModule} from "@angular/common";
import {KeysPipe} from "./keys.pipe";
import { MarbleComponent } from './components/marble/marble.component';

@NgModule({
  declarations: [
    AppComponent,
    KeysPipe,
    MarbleComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
