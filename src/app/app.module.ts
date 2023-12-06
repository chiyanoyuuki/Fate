import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatTooltipModule} from '@angular/material/tooltip';
import { CardpersoComponent } from './cardperso/cardperso.component';
import { IconepersoComponent } from './iconeperso/iconeperso.component';

@NgModule({
  declarations: [
    AppComponent,
    CardpersoComponent,
    IconepersoComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatTooltipModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
