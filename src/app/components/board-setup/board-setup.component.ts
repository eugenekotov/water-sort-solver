import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Color } from 'src/app/classes/model/colors.class';
import { SetupContainer } from 'src/app/classes/model/setup-container.class';
import { MainService } from 'src/app/services/main.service';
import { Tour, TourItem, TourService } from 'src/app/services/tour.service';

@Component({
  selector: 'app-board-setup',
  templateUrl: './board-setup.component.html',
  styleUrls: ['./board-setup.component.scss']
})
export class BoardSetupComponent implements OnInit, OnDestroy {

  filling: boolean = false;
  sourceContainersWidth: number;
  private subscription: Subscription | undefined;
  tour: Tour;

  constructor(public mainService: MainService, public tourService: TourService) {
    this.calculateSourceContainersWidth();
    this.createTour();
  }

  ngOnInit(): void {
    this.subscription = this.mainService.screenChanged$.subscribe(() => this.calculateSourceContainersWidth());
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
    // TODO: confirm lost current data
    const sourceContainersString = localStorage.getItem(MainService.STORAGE_KEY + "-source");
    const containersString1 = localStorage.getItem(MainService.STORAGE_KEY + "-containers-1");
    const containersString2 = localStorage.getItem(MainService.STORAGE_KEY + "-containers-2");
    if (sourceContainersString && containersString1 && containersString2) {
      const sourceContainers = JSON.parse(sourceContainersString);
      const setupContainers1 = JSON.parse(containersString1);
      const setupContainers2 = JSON.parse(containersString2);
      this.mainService.containerCount = setupContainers1.length + setupContainers2.length;
      this.mainService.sourceContainers = sourceContainers;
      this.mainService.setupContainers1 = setupContainers1;
      this.mainService.setupContainers2 = setupContainers2;
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
    this.sourceContainersWidth = (this.mainService.containerCount - 2) * itemWidth + containerItemsGap * (this.mainService.containerCount - 3);
  }

  addContainer() {
    if (this.mainService.containerCount < MainService.MAX_CONTAINER_COUNT) {
      this.mainService.containerCount++;
      this.addSourceContainer();
      this.addSetupContainer();
      this.mainService.saveContainerCount();
    }
  }

  private addSetupContainer() {
    this.mainService.setupContainers2.push({ id: 'setup-container' + (this.mainService.containerCount - 1), colors: [] });
    this.mainService.balanceSetupContainers();
  }


  private addSourceContainer() {
    const color = Object.values(Color)[this.mainService.containerCount - 3];
    this.mainService.sourceContainers.push({ id: 'source-container' + (this.mainService.containerCount - 3), colors: [color, color, color, color] });
  }

  removeContainer() {
    if (MainService.MIN_CONTAINER_COUNT < this.mainService.containerCount) {
      this.mainService.containerCount--;
      this.removeSourceContainer();
      this.removeSetupContainer();
      this.mainService.saveContainerCount();
    }
  }

  private removeSourceContainer() {
    const color = Object.values(Color)[this.mainService.containerCount - 2];
    this.mainService.sourceContainers.pop();
    // remove color from setup containers
    [...this.mainService.setupContainers1, ...this.mainService.setupContainers2].forEach(container => {
      let i = 0;
      while (i < container.colors.length) {
        if (container.colors[i] === color) {
          container.colors.splice(i, 1);
        } else {
          i++;
        }
      }
    });
  }

  private removeSetupContainer() {
    let container;
    if (this.mainService.setupContainers2.length > 0) {
      container = this.mainService.setupContainers2.pop();
    } else {
      container = this.mainService.setupContainers1.pop();
    }
    // move colors back to source
    container!.colors.forEach(color => {
      const index = Object.values(Color).indexOf(color);
      this.mainService.sourceContainers[index].colors.push(color);
    });
    this.mainService.balanceSetupContainers();
  }

  private createTour() {
    this.tour = new Tour();

    const tourItem1 = new TourItem();
    tourItem1.top = "-40px";
    tourItem1.left = "-10px";
    tourItem1.width = "300px";
    tourItem1.arrow = "right-down";
    tourItem1.text = "This is colors. You may drag them and drop to containers below"
    tourItem1.delay = 2000;

    this.tour.tourItems.push(tourItem1);

    const tourItem2 = new TourItem();
    tourItem2.top = "200px";
    tourItem2.left = "500px";
    tourItem2.width = "400px";
    tourItem2.arrow = "left";
    tourItem2.text = "These buttons to add or remove colors"
    tourItem2.delay = 2000;
    this.tour.tourItems.push(tourItem2);

    const tourItem3 = new TourItem();
    tourItem3.top = "180px";
    tourItem3.left = "0px";
    tourItem3.width = "500px";
    tourItem3.arrow = "down";
    tourItem3.text = "These are containers. The application will sort colors in containers"
    tourItem3.delay = 2000;
    this.tour.tourItems.push(tourItem3);


  }

}
