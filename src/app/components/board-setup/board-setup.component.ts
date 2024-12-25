import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Color } from 'src/app/classes/model/colors.class';
import { SetupContainer } from 'src/app/classes/model/setup-container.class';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-board-setup',
  templateUrl: './board-setup.component.html',
  styleUrls: ['./board-setup.component.scss']
})
export class BoardSetupComponent implements OnInit, OnDestroy {

  filling: boolean = false;
  sourceContainersWidth: number;
  private subscription: Subscription | undefined;

  constructor(public mainService: MainService) {
    this.calculateSourceContainersWidth();
  }

  ngOnInit(): void {
    this.subscription = this.mainService.screenChanged$.subscribe(()=> this.calculateSourceContainersWidth());
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  drop(event: CdkDragDrop<Color[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  getConnectedLists(currentId: string): string[] {
    const array: string[] = [
      ...this.mainService.sourceContainers.map(c => c.id),
      ...this.mainService.setupContainers1.map(c => c.id),
      ...this.mainService.setupContainers2.map(c => c.id)];
    return array.filter(id => id !== currentId);
  }

  getItemStyle(color: Color) {
    return { 'background-color': color };
  }

  canDrop(container: SetupContainer): () => boolean {
    return () => {
      return container.colors.length < this.mainService.CONTAINER_SIZE;
    }
  }

  clearClick() {
    // TODO: Ask confirmation
    this.clearBoard();
  }

  private clearBoard() {
    this.mainService.createSourceContainers();
    this.clearContainers();
  }

  private clearContainers() {
    this.mainService.setupContainers1.forEach(container => container.colors = []);
    this.mainService.setupContainers2.forEach(container => container.colors = []);
  }

  async fillRandomly() {
    this.filling = true;
    let sourceContainers = this.mainService.sourceContainers.filter(container => container.colors.length > 0);
    if (sourceContainers.length === 0) {
      this.clearBoard();
    }
    sourceContainers = this.mainService.sourceContainers.filter(container => container.colors.length > 0);
    while (sourceContainers.length > 0) {
      const sourceIndex = this.getRandomInt(0, sourceContainers.length - 1);
      const color = sourceContainers[sourceIndex].colors.pop();
      await this.pause(10);
      const setupContainers = [
        ...this.mainService.setupContainers1.filter(container => container.colors.length < this.mainService.CONTAINER_SIZE),
        ...this.mainService.setupContainers2.filter(container => container.colors.length < this.mainService.CONTAINER_SIZE)];
      const setupIndex = this.getRandomInt(0, setupContainers.length - 3);
      setupContainers[setupIndex].colors.splice(0, 0, color!);
      sourceContainers = this.mainService.sourceContainers.filter(container => container.colors.length > 0);
      await this.pause(20);
    }
    this.filling = false;
  }

  async pause(delay: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, delay));
  }

  private getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  saveClick() {
    const sourceContainersString = JSON.stringify(this.mainService.sourceContainers);
    const containersString1 = JSON.stringify(this.mainService.setupContainers1);
    const containersString2 = JSON.stringify(this.mainService.setupContainers2);
    localStorage.setItem(MainService.STORAGE_KEY + "-source", sourceContainersString);
    localStorage.setItem(MainService.STORAGE_KEY + "-containers-1", containersString1);
    localStorage.setItem(MainService.STORAGE_KEY + "-containers-2", containersString2);
  }

  loadClick() {
    const sourceContainersString = localStorage.getItem(MainService.STORAGE_KEY + "-source");
    const containersString1 = localStorage.getItem(MainService.STORAGE_KEY + "-containers-1");
    const containersString2 = localStorage.getItem(MainService.STORAGE_KEY + "-containers-2");
    if (sourceContainersString && containersString1 && containersString2) {
      this.mainService.sourceContainers = JSON.parse(sourceContainersString!);
      this.mainService.setupContainers1 = JSON.parse(containersString1!);
      this.mainService.setupContainers2 = JSON.parse(containersString2!);
    }
  }

  solveClick() {
    this.mainService.solve(this.mainService.setupContainers1, this.mainService.setupContainers2);
  }

  private calculateSourceContainersWidth() {
    let itemWidth: number;
    let containerItemsGap: number;
    if (this.mainService.isMobile) {
      itemWidth = this.mainService.itemWidthSmall;
      containerItemsGap = this.mainService.containerItemsGapSmall;
    } else {
      itemWidth = this.mainService.itemWidthLarge;
      containerItemsGap = this.mainService.containerItemsGapLarge;
    }
    this.sourceContainersWidth = (this.mainService.containersCount - 2) * itemWidth + containerItemsGap * (this.mainService.containersCount - 3);
  }
}
