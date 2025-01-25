import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, Subscription } from 'rxjs';
import { Color } from 'src/app/classes/model/colors.class';
import { CONTAINER_SIZE, MAX_CONTAINER_COUNT, MIN_CONTAINER_COUNT, STORAGE_KEY } from 'src/app/classes/model/const.class';
import { SourceItem } from 'src/app/classes/model/item.class';
import { SetupContainer } from 'src/app/classes/model/setup-container.class';
import { MovingItem } from 'src/app/classes/moving-controller.class';
import { getRandomInt } from 'src/app/classes/utils.class';
import { MainService } from 'src/app/services/main.service';
import { Tour, TourItem, TourService } from 'src/app/services/tour.service';

@Component({
  selector: 'app-board-setup',
  templateUrl: './board-setup.component.html',
  styleUrls: ['./board-setup.component.scss']
})
export class BoardSetupComponent implements OnInit, AfterViewInit, OnDestroy {

  filling: boolean = false;
  sourceContainersWidth: number;
  private subscription: Subscription | undefined;
  tour: Tour;
  saveEnabled: boolean = false;
  loadEnabled: boolean = false;

  movingItem: MovingItem = new MovingItem();

  constructor(public mainService: MainService, public tourService: TourService) {
    this.calculateSourceContainersWidth();
    this.checkSaveEnabled();
    this.checkLoadEnabled();
  }

  ngOnInit(): void {
    this.subscription = this.mainService.screenChanged$.pipe(debounceTime(500)).subscribe(() => {
      setTimeout(() => {
        this.calculateSourceContainersWidth();
        this.createTour();
      }, 1000);
    });
  }

  ngAfterViewInit(): void {
    this.createTour();
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
      this.checkSaveEnabled();
    }
  }

  private checkSaveEnabled() {
    this.saveEnabled = this.mainService.getSetupContainersItems() > 0;
  }

  getConnectedLists(currentId: string): string[] {
    const array: string[] = [
      ...this.mainService.setupContainers1.map(c => c.id),
      ...this.mainService.setupContainers2.map(c => c.id)];
    return array.filter(id => id !== currentId);
  }

  getSourceItemStyle(container: SourceItem) {
    let result: any = { 'background-color': container.color };
    if (container.count > 0) {
      result['opacity'] = 1;
    } else {
      result['opacity'] = 0.2;
    }
    return result;
  }

  getItemStyle(color: Color) {
    return { 'background-color': color };
  }


  canDrop(container: SetupContainer): () => boolean {
    return () => {
      return container.colors.length < CONTAINER_SIZE;
    }
  }

  clearClick() {
    // TODO: Ask confirmation
    this.clearBoard();
  }

  private clearBoard() {
    // this.createSourceContainers();
    this.mainService.sourceContainers.forEach(container => container.count = CONTAINER_SIZE);
    this.clearContainers();
    this.checkSaveEnabled();
  }

  private clearContainers() {
    this.mainService.setupContainers1.forEach(container => container.colors = []);
    this.mainService.setupContainers2.forEach(container => container.colors = []);
  }

  async fillRandomly() {
    this.filling = true;
    let sourceItems = this.mainService.sourceContainers.filter(container => container.count > 0);
    if (sourceItems.length === 0) {
      this.clearBoard();
    }
    sourceItems = this.mainService.sourceContainers.filter(container => container.count > 0);
    while (sourceItems.length > 0) {
      const sourceIndex = getRandomInt(0, sourceItems.length - 1);
      sourceItems[sourceIndex].count--;
      await this.pause(10);
      const setupContainers = [
        ...this.mainService.setupContainers1.filter(container => container.colors.length < CONTAINER_SIZE),
        ...this.mainService.setupContainers2.filter(container => container.colors.length < CONTAINER_SIZE)];
      const setupIndex = getRandomInt(0, setupContainers.length - 3);
      setupContainers[setupIndex].colors.splice(0, 0, sourceItems[sourceIndex].color!);
      sourceItems = this.mainService.sourceContainers.filter(container => container.count > 0);
      await this.pause(20);
    }
    this.filling = false;
    this.checkSaveEnabled();
  }

  async pause(delay: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, delay));
  }

  saveClick() {
    const sourceContainersString = JSON.stringify(this.mainService.sourceContainers);
    const containersString1 = JSON.stringify(this.mainService.setupContainers1);
    const containersString2 = JSON.stringify(this.mainService.setupContainers2);
    localStorage.setItem(STORAGE_KEY + "-source", sourceContainersString);
    localStorage.setItem(STORAGE_KEY + "-containers-1", containersString1);
    localStorage.setItem(STORAGE_KEY + "-containers-2", containersString2);
    this.saveEnabled = false;
    this.checkLoadEnabled();
  }

  private checkLoadEnabled() {
    const sourceContainersString = localStorage.getItem(STORAGE_KEY + "-source");
    const containersString1 = localStorage.getItem(STORAGE_KEY + "-containers-1");
    const containersString2 = localStorage.getItem(STORAGE_KEY + "-containers-2");
    this.loadEnabled = (sourceContainersString !== null && containersString1 !== null && containersString2 !== null);
  }

  loadClick() {
    // TODO: confirm lost current data
    const sourceContainersString = localStorage.getItem(STORAGE_KEY + "-source");
    const containersString1 = localStorage.getItem(STORAGE_KEY + "-containers-1");
    const containersString2 = localStorage.getItem(STORAGE_KEY + "-containers-2");
    if (sourceContainersString !== null && containersString1 !== null && containersString2 !== null) {
      const sourceContainers = JSON.parse(sourceContainersString);
      const setupContainers1 = JSON.parse(containersString1);
      const setupContainers2 = JSON.parse(containersString2);
      this.mainService.containerCount = setupContainers1.length + setupContainers2.length;
      this.mainService.sourceContainers = sourceContainers;
      this.mainService.setupContainers1 = setupContainers1;
      this.mainService.setupContainers2 = setupContainers2;
    }
  }


  playClick() {
    // TODO: Show warning if board is not filled
    this.mainService.play(this.mainService.setupContainers1, this.mainService.setupContainers2);
  }

  solveClick() {
    // TODO: Show warning if board is not filled
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
    if (this.mainService.containerCount < MAX_CONTAINER_COUNT) {
      this.mainService.containerCount++;
      this.addSourceContainer();
      this.addSetupContainer();
      this.mainService.saveContainerCount();
      this.checkSaveEnabled();
    }
  }

  private addSetupContainer() {
    this.mainService.setupContainers2.push({ id: 'setup-container' + (this.mainService.containerCount - 1), colors: [] });
    this.mainService.balanceSetupContainers();
  }


  private addSourceContainer() {
    const color = Object.values(Color)[this.mainService.containerCount - 3];
    this.mainService.sourceContainers.push(new SourceItem(color));
  }

  removeContainer() {
    if (MIN_CONTAINER_COUNT < this.mainService.containerCount) {
      this.mainService.containerCount--;
      this.removeSourceContainer();
      this.removeSetupContainer();
      this.mainService.saveContainerCount();
      this.checkSaveEnabled();
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
      this.mainService.sourceContainers[index].count++;
    });
    this.mainService.balanceSetupContainers();
  }

  onSourceContainerClick(event: any, item: SourceItem) {
    event.stopPropagation();
    if (item.selected) {
      item.selected = !item.selected;
      console.log("unselect");
    } else {
      item.selected = !item.selected;
      console.log("select");
    }
  }

  onMovingItemClick() {

  }

  private createTour() {
    this.tour = new Tour();
    this.tour.tourItems.push(new TourItem().setWidth(350).setText("SETUP.TOUR.COLORS")
      .setElement(document.getElementById("source-containers")!));

    this.tour.tourItems.push(new TourItem().setWidth(250).setText("SETUP.TOUR.B_ADD")
      .setElement(document.getElementById("buttons-add-remove")!));

    this.tour.tourItems.push(new TourItem().setWidth(300).setText("SETUP.TOUR.CONTAINERS")
      .setElement(document.getElementById("containers")!));

    this.tour.tourItems.push(new TourItem().setWidth(250).setText("SETUP.TOUR.B_CLEAR")
      .setElement(document.getElementById("button-clear")!));

    this.tour.tourItems.push(new TourItem().setWidth(250).setText("SETUP.TOUR.B_FILL")
      .setElement(document.getElementById("button-fill")!));

    this.tour.tourItems.push(new TourItem().setWidth(250).setText("SETUP.TOUR.B_SAVE")
      .setElement(document.getElementById("button-save")!));

    this.tour.tourItems.push(new TourItem().setWidth(250).setText("SETUP.TOUR.B_LOAD")
      .setElement(document.getElementById("button-load")!));

    this.tour.tourItems.push(new TourItem().setWidth(250).setText("SETUP.TOUR.B_SOLVE")
      .setElement(document.getElementById("button-solve")!));

    this.tour.tourItems.push(new TourItem().setWidth(250).setText("SETUP.TOUR.B_PLAY")
      .setElement(document.getElementById("button-play")!));

  }

}
