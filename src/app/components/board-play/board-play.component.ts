import { Component, OnInit } from '@angular/core';
import { Item, itemCreate } from 'src/app/classes/model/item.class';
import { MainService } from 'src/app/services/main.service';
import { PlayStep } from '../board-solve/board-solve.component';
import { Subject, Subscription } from 'rxjs';
import { PlayContainer } from 'src/app/classes/model/play-container.class';

@Component({
  selector: 'app-board-play',
  templateUrl: './board-play.component.html',
  styleUrls: ['./board-play.component.scss']
})
export class BoardPlayComponent implements OnInit {

  playContainers: PlayContainer[] = [];
  private screenResizedSubscription: Subscription | undefined = undefined;

  completeStepIndex: number = 0;

  readonly minSpeed = 1;
  readonly maxSpeed = 20;
  readonly defaultSpeed = 5;
  speed: number = this.defaultSpeed;

  playing: boolean = false;

  private stepsSubject$ = new Subject<PlayStep>();
  movingItem: Item; // Item for moving animation


  constructor(public mainService: MainService) {
    this.movingItem = itemCreate(undefined, 0, true);
  }

  ngOnInit(): void {
    this.loadSpeed();
  }

  getContainerId(index: number): string {
    return "container" + index;
  }

  speedChanged(event: any) {
    const speed = Number(event);
    this.saveSpeed(speed);
  }

  private loadSpeed() {
    let speed = Number(localStorage.getItem(MainService.STORAGE_KEY + "-speed"));
    if (speed < this.minSpeed || this.maxSpeed < speed) {
      speed = this.defaultSpeed;
    }
    this.speed = speed;
  }

  private saveSpeed(speed: number) {
    localStorage.setItem(MainService.STORAGE_KEY + "-speed", String(speed));
  }

  setupClick() {
    this.mainService.setMode("setup");
  }

}
