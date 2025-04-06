import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameController } from 'src/app/classes/controller/game-controller.class';
import { MAX_CONTAINER_COUNT, OPACITY_DELAY } from 'src/app/classes/model/const.class';
import { GameService } from 'src/app/services/game.service';
import { MainService, TView } from 'src/app/services/main.service';
import { StatisticsService } from 'src/app/services/statistics.service';

export interface PlayedDialogData {
  stepCount: number;
}

export interface PlayedDialogResult {
  view: TView;
}


@Component({
  selector: 'app-played-dialog',
  templateUrl: './played-dialog.component.html',
  styleUrls: ['./played-dialog.component.scss']
})
export class PlayedDialogComponent implements OnInit {

  protected gameCount: number = 0;
  protected previousStepCount: number;
  protected stepCount: number;
  protected statText: string;

  constructor(public mainService: MainService, public gameService: GameService,
    public dialogRef: MatDialogRef<PlayedDialogComponent, PlayedDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: PlayedDialogData, private statisticsService: StatisticsService)
  {
    this.stepCount = data.stepCount;
    const hash = GameController.getGameHash(this.gameService.getContainers());
    this.gameCount = this.statisticsService.getGameCount();
    this.statText = `Кількість розв'язаних пазлів ${this.gameCount}`;
    this.previousStepCount = this.statisticsService.getStepCount(hash);
    this.statisticsService.updateStepCount(hash, data.stepCount);
    this.statisticsService.save();
  }

  ngOnInit(): void {
  }

  protected onPlayClick() {
    this.gameService.createRandomGame(MAX_CONTAINER_COUNT - 2, MAX_CONTAINER_COUNT);
    this.dialogRef.close({ view: 'play' });
  }

  protected onPlayAgainClick() {
    this.gameService.playContainers = this.gameService.getContainers();
    this.gameService.steps = [];
    this.dialogRef.close({ view: 'play' });
  }

  protected onShareClick() {
    // this.dialogRef.close({ text: "play" });
  }

  protected onCustomizeClick() {
    this.mainService.setView('setup');
    setTimeout(() => this.dialogRef.close(), OPACITY_DELAY);
    this.dialogRef.close();
  }

  protected onMainMenuClick() {
    this.mainService.setView('menu');
    setTimeout(() => this.dialogRef.close(), OPACITY_DELAY);
  }

}
