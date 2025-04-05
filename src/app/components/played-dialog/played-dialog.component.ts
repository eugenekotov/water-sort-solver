import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAX_CONTAINER_COUNT } from 'src/app/classes/model/const.class';
import { GameService } from 'src/app/services/game.service';
import { MainService, TView } from 'src/app/services/main.service';

export interface PlayedDialogData {
  text: string;
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

  protected text: string;

  constructor(public mainService: MainService, public gameService: GameService,
    public dialogRef: MatDialogRef<PlayedDialogComponent, PlayedDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: PlayedDialogData)
  {
    this.text = data.text;
  }

  ngOnInit(): void {
  }

  protected onPlayClick() {
    this.dialogRef.close({ view: 'play' });
  }

  protected onShareClick() {
    // this.dialogRef.close({ text: "play" });
  }

  protected onCustomizeClick() {
    this.mainService.setView('setup');
    this.dialogRef.close();

  }


  protected onMainMenuClick() {
    this.mainService.setView('menu');
    this.dialogRef.close();
  }

}
