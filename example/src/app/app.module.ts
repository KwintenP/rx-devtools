import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import {CommonModule} from "@angular/common";
import {KeysPipe} from "./keys.pipe";
import { MarbleComponent } from './components/marble/marble.component';
import { MarbleLineComponent } from './components/marble-line/marble-line.component';
import { MarbleDiagramComponent } from './components/marble-diagram/marble-diagram.component';
import { OperatorComponent } from './components/operator/operator.component';
import {TooltipModule} from "ngx-tooltip";

@NgModule({
  declarations: [
    AppComponent,
    KeysPipe,
    MarbleComponent,
    MarbleLineComponent,
    MarbleDiagramComponent,
    OperatorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    CommonModule,
    TooltipModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
