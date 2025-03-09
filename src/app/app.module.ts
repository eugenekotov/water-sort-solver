import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppComponent } from './app.component';
import { BoardInProgressComponent } from './components/board-in-progress/board-in-progress.component';
import { BoardNoSolutionComponent } from './components/board-no-solution/board-no-solution.component';
import { BoardPlayComponent } from './components/board-play/board-play.component';
import { BoardSetupComponent } from './components/board-setup/board-setup.component';
import { BoardSolveComponent } from './components/board-solve/board-solve.component';
import { ContainerComponent } from './components/container/container.component';
import { ItemComponent } from './components/item/item.component';
import { MovingItemComponent } from './components/moving-item/moving-item.component';
import { TourItemComponent } from './components/tour-item/tour-item.component';
import { TourComponent } from './components/tour/tour.component';
import { SettingsComponent } from './components/settings/settings.component';
import { MenuComponent } from './components/menu/menu.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { SaveGameComponent } from './components/save-game/save-game.component';
import { LoadGameComponent } from './components/load-game/load-game.component';

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
    BoardPlayComponent,
    SettingsComponent,
    MenuComponent,
    SaveGameComponent,
    LoadGameComponent
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
    BrowserAnimationsModule,
    MatMenuModule,
    MatDividerModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
