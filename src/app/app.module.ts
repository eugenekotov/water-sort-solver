import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppComponent } from './app.component';
import { BoardSetupComponent } from './components/board-setup/board-setup.component';
import { MatButtonModule } from '@angular/material/button';
import { BoardSolveComponent } from './components/board-solve/board-solve.component';
import { ContainerComponent } from './components/container/container.component';
import { ItemComponent } from './components/item/item.component';
import { MovingItemComponent } from './components/moving-item/moving-item.component';
import { BoardInProgressComponent } from './components/board-in-progress/board-in-progress.component';
import { BoardNoSolutionComponent } from './components/board-no-solution/board-no-solution.component';
import { MatSliderModule } from '@angular/material/slider';

@NgModule({
  declarations: [
    AppComponent,
    BoardSetupComponent,
    BoardSolveComponent,
    ContainerComponent,
    ItemComponent,
    MovingItemComponent,
    BoardInProgressComponent,
    BoardNoSolutionComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    DragDropModule,
    MatButtonModule,
    MatSliderModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
