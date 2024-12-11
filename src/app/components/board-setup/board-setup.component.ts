import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Color } from 'src/app/classes/model/colors.class';
import { BoardService } from 'src/app/services/board.service';
import { ContainerComponent } from '../container/container.component';
import { Solution } from 'src/app/classes/model/solution.class';
import { Container } from 'src/app/classes/container.class';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board-setup',
  templateUrl: './board-setup.component.html',
  styleUrls: ['./board-setup.component.scss']
})
export class BoardSetupComponent implements OnInit, AfterViewInit {

  itemsElements: HTMLElement[] = [];
  solution: Solution = new Solution();
  stepIndex: number = 0;
  inProgress: boolean = false;

  constructor(public boardService: BoardService) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
  }

  getContainerId(index: number): string {
    return "container" + index;
  }

  clearClick() {

  }

  saveClick() {

  }

}
