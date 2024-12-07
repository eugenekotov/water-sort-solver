import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ContainerComponent } from './components/container/container.component';
import { ItemComponent } from './components/item/item.component';
import { BoardComponent } from './components/board/board.component';
import { AllColorsComponent } from './components/all-colors/all-colors.component';

@NgModule({
  declarations: [
    AppComponent,
    ContainerComponent,
    ItemComponent,
    BoardComponent,
    AllColorsComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
