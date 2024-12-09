import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Color } from 'src/app/classes/model/colors.class';
import { BoardService } from 'src/app/services/board.service';
import { ContainerComponent } from '../container/container.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit, AfterViewInit {

  itemsElements: HTMLElement[] = [];

  constructor(public boardService: BoardService) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.getItemsElements();
  }

  private getItemsElements() {
    for (let containerIndex = 0; containerIndex < this.boardService.containers.length; containerIndex++) {
      const container = this.boardService.containers[containerIndex];
      for (let itemIndex = 0; itemIndex < container.items.length; itemIndex++) {
        this.itemsElements.push(document.getElementById(ContainerComponent.getItemId(containerIndex, itemIndex))!);
      }
    }
  }

  private setItemPosition() {
    const containerIndex = 7;
    const itemIndex = 2;
    const index = containerIndex * 2 + itemIndex
    const itemElement = this.itemsElements[index];

    const movingElement = document.getElementById("moving");
    const itemRect = itemElement!.getBoundingClientRect();

    const parentMovingElement = movingElement!.parentElement!.getBoundingClientRect();

    const top = itemRect.top - parentMovingElement.top;
    const left = itemRect.left - parentMovingElement.left;

    this.boardService.movingItem.top = `${top}px`;
    this.boardService.movingItem.left = `${left}px`;
  }


  getContainerId(index: number): string {
    return "container" + index;
  }

  moveTo0() {
    this.boardService.movingItem.top = "0px";
    this.boardService.movingItem.left = "0px";
  }

  moveToContainer() {
    this.setItemPosition();
  }

}
