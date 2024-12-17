import { Component, Input, OnInit } from '@angular/core';
import { PlayContainer } from 'src/app/classes/play-container.class';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {

  @Input() container!: PlayContainer;

  constructor(public mainService: MainService) { }

  ngOnInit(): void {
  }

  getItemId(containerIndex: number, itemIndex: number) {
    return ContainerComponent.getItemId(containerIndex, itemIndex);
  }

  public static getItemId(containerIndex: number, itemIndex: number): string {
    return "container" + containerIndex + "item" + itemIndex;
  }

  drop(event: any) {
    console.log("Drop on the board", event);
  }

}
