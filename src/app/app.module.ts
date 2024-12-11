import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ContainerComponent } from './components/container/container.component';
import { AllColorsItemComponent } from './components/all-colors-item/all-colors-item.component';
import { BoardComponent } from './components/board/board.component';
import { AllColorsComponent } from './components/all-colors/all-colors.component';
import { ItemComponent } from './components/item/item.component';
import { MovingItemComponent } from './components/moving-item/moving-item.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';


@NgModule({
  declarations: [
    AppComponent,
    ContainerComponent,
    AllColorsItemComponent,
    BoardComponent,
    AllColorsComponent,
    ItemComponent,
    MovingItemComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    DragDropModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
