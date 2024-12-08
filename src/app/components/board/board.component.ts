import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Color } from 'src/app/classes/colors.class';
import { BoardService } from 'src/app/services/board.service';
import { ContainerComponent } from '../container/container.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit, AfterViewInit {

  color: Color = Color.RED;
  top: number = 0;
  left: number = 0;
  containersElements: HTMLElement[] = [];
  itemsElements: HTMLElement[] = [];
  @ViewChild("relativeContainer") relativeContainer: ElementRef;
  @ViewChild("boardContainer") boardContainer: ElementRef;

  constructor(public boardService: BoardService) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.getContainersElements();
    this.getItemsElements();
    this.setItemPosition();
  }

  private getContainersElements() {
    for (let i = 0; i < this.boardService.containers.length; i++) {
      this.containersElements.push(document.getElementById(this.getContainerId(i))!);
    }
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
    const itemIndex = 3;
    const index = containerIndex * 2 + itemIndex
    const itemElement = this.itemsElements[index];
    console.log(itemElement);

    const rect2 = this.relativeContainer.nativeElement.getBoundingClientRect();
    console.log("relativeContainer", rect2);

    const rect3 = this.boardContainer.nativeElement.getBoundingClientRect();
    console.log("boardContainer", rect3);

    const rect = itemElement.getBoundingClientRect();
    // console.log(rect);
    const computedStyle = window.getComputedStyle(itemElement);
    const marginTop = parseInt(computedStyle.getPropertyValue('margin-top'));
    const marginLeft = parseInt(computedStyle.getPropertyValue('margin-left'));
    const paddingTop = parseInt(computedStyle.getPropertyValue('padding-top'));
    const paddingLeft = parseInt(computedStyle.getPropertyValue('padding-left'));
    // console.log(marginTop, marginLeft, paddingTop, paddingLeft);

    const top = rect.top - paddingTop - marginTop - 187;
    const left = rect.left - paddingLeft - marginLeft-25;
    this.boardService.item.top = top + "px";
    this.boardService.item.left = left + "px";


    // const childRect = child.getBoundingClientRect();
    // const parentRect = parent.getBoundingClientRect();

    // return {
    //   top: childRect.top - parentRect.top,
    //   left: childRect.left - parentRect.left
    // };




    // const containerElement = this.containersElements[this.boardService.item.containerIndex];
    // const rect = containerElement.getBoundingClientRect();
    // console.log(rect);
    // const computedStyle1 = window.getComputedStyle(containerElement);

    // const marginTop1 = parseInt(computedStyle1.getPropertyValue('margin-top'));
    // const marginLeft1 = parseInt(computedStyle1.getPropertyValue('margin-left'));
    // const paddingTop1 = parseInt(computedStyle1.getPropertyValue('padding-top'));
    // const paddingLeft1 = parseInt(computedStyle1.getPropertyValue('padding-left'));

    // console.log(marginTop1, marginLeft1, paddingTop1, paddingLeft1);

    // const rect2 = this.relativeContainer.nativeElement.getBoundingClientRect();
    // console.log(rect2);

    // const computedStyle2 = window.getComputedStyle(this.relativeContainer.nativeElement);
    // const marginTop = parseInt(computedStyle2.getPropertyValue('margin-top'));
    // const marginLeft = parseInt(computedStyle2.getPropertyValue('margin-left'));
    // const paddingTop = parseInt(computedStyle2.getPropertyValue('padding-top'));
    // const paddingLeft = parseInt(computedStyle2.getPropertyValue('padding-left'));
    // const top = rect.top - rect2.top - paddingTop - marginTop;
    // const left = rect.left - rect2.left - paddingLeft - marginLeft;
    // this.boardService.item.top = top + "px";
    // this.boardService.item.left = left + "px";
  }


  getContainerId(index: number): string {
    return "container" + index;
  }

  moveTo0() {
    this.boardService.item.top = "0px";
    this.boardService.item.left = "0px";
  }

  moveToContainer() {
    this.setItemPosition();
  }

}
