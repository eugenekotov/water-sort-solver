import { Component, Input, OnInit } from '@angular/core';
import { Container } from 'src/app/classes/container.class';
import { BoardService } from 'src/app/services/board.service';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {

  @Input() container!: Container;

  constructor(public borderService: BoardService) { }

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
