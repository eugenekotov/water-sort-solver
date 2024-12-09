import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Color } from 'src/app/classes/model/colors.class';
import { BoardService } from 'src/app/services/board.service';
import { ContainerComponent } from '../container/container.component';
import { Solution } from 'src/app/classes/model/solution.class';
import { Container } from 'src/app/classes/container.class';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit, AfterViewInit {

  itemsElements: HTMLElement[] = [];
  solution: Solution = new Solution();
  stepIndex: number = 0;

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

  getContainerId(index: number): string {
    return "container" + index;
  }

  moveTo0() {
    this.boardService.movingItem.top = "0px";
    this.boardService.movingItem.left = "0px";
  }

  moveToContainer() {
  }

  makeStep() {

    const iFrom = this.solution.steps[this.stepIndex].iFrom;
    const iTo = this.solution.steps[this.stepIndex].iTo;

    const color = this.boardService.containers[iFrom].peek();
    this.boardService.movingItem.color = color;
    // show moving item
    const itemIndex = this.boardService.containers[iFrom].size() - 1;
    this.setMovingItemPosition(iFrom, itemIndex);
    this.boardService.containers[iFrom].pop();
    this.boardService.movingItem.hidden = false;
    setTimeout(() => {
      this.moveItem(iTo).then(_ => {
        this.boardService.containers[iTo].push(color);
        this.boardService.movingItem.hidden = true;
        this.stepIndex++;
      });
    }, 100);


  }

  private setMovingItemPosition(containerIndex: number, itemIndex: number) {
    const index = containerIndex * Container.MAX_SIZE + itemIndex;
    const itemElement = this.itemsElements[index];
    const movingElement = document.getElementById("moving");
    const itemRect = itemElement!.getBoundingClientRect();
    const parentMovingElement = movingElement!.parentElement!.getBoundingClientRect();
    const top = itemRect.top - parentMovingElement.top;
    const left = itemRect.left - parentMovingElement.left;
    this.boardService.movingItem.top = `${top}px`;
    this.boardService.movingItem.left = `${left}px`;
  }

  private moveItem(iTo: number): Promise<void> {
    return new Promise(resolve => {
      const itemIndex = this.boardService.containers[iTo].size();
      this.setMovingItemPosition(iTo, itemIndex);
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }

}
