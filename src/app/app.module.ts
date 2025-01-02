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
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TourItemComponent } from './components/tour-item/tour-item.component';
import { MatIconModule } from '@angular/material/icon';
import { TourComponent } from './components/tour/tour.component';
import { LangBarComponent } from './components/lang-bar/lang-bar.component';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

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
    TourItemComponent,
    TourComponent,
    LangBarComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    DragDropModule,
    MatButtonModule,
    MatSliderModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    HttpClientModule,
    MatTooltipModule,
    MatIconModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
