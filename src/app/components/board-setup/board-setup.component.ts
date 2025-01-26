import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { concatMap, debounceTime, Observable, Subject, Subscriber, Subscription, tap } from 'rxjs';
import { Color } from 'src/app/classes/model/colors.class';
import { CONTAINER_SIZE, MAX_CONTAINER_COUNT, MIN_CONTAINER_COUNT, STORAGE_KEY } from 'src/app/classes/model/const.class';
import { MovingItem, Position, SourceItem } from 'src/app/classes/model/item.class';
import { SetupContainer } from 'src/app/classes/model/setup-container.class';
import { MovingController } from 'src/app/classes/moving-controller.class';
import { getRandomInt } from 'src/app/classes/utils.class';
import { MainService } from 'src/app/services/main.service';
import { Tour, TourItem, TourService } from 'src/app/services/tour.service';

type TClick = "on-source" | "on-container";

class ClickEvent {
  clickType: TClick;
  object: SourceItem | SetupContainer;
}

@Component({
  selector: 'app-board-setup',
  templateUrl: './board-setup.component.html',
  styleUrls: ['./board-setup.component.scss']
})
export class BoardSetupComponent implements OnInit, AfterViewInit, OnDestroy {

  private screenResizedSubscription: Subscription | undefined = undefined;

  private clickSubject$ = new Subject<ClickEvent>();
  private clickSubjectSubscription: Subscription | undefined = undefined;

  filling: boolean = false;
  sourceContainersWidth: number;
  private screenChagedSubscription: Subscription | undefined;
  tour: Tour;
  saveEnabled: boolean = false;
  loadEnabled: boolean = false;

  movingItem: MovingItem = new MovingItem();
  sourceItemElements: Map<Color, HTMLElement> = new Map<Color, HTMLElement>();
  private parentElementRect: DOMRect;

  constructor(public mainService: MainService, public tourService: TourService) {
    this.calculateSourceContainersWidth();
    this.checkSaveEnabled();
    this.checkLoadEnabled();
    this.createClickSubject();
  }

  ngOnInit(): void {
    this.screenChagedSubscription = this.mainService.screenChanged$.pipe(debounceTime(500)).subscribe(() => {
      setTimeout(() => {
        this.calculateSourceContainersWidth();
        this.createTour();
      }, 1000);
    });

    this.screenResizedSubscription = this.mainService.screenResized$.subscribe(() => {
      setTimeout(() => this.onScreenResized(), 500); // TODO: Add debounceTime(500)
    });
  }

  ngAfterViewInit(): void {
    this.createTour();
    this.onScreenResized();
  }

  ngOnDestroy(): void {
    this.screenResizedSubscription?.unsubscribe();
    this.screenChagedSubscription?.unsubscribe();
    this.clickSubjectSubscription?.unsubscribe();
  }

  private createClickSubject() {
    this.clickSubjectSubscription = this.clickSubject$.pipe(
      concatMap(click => this.handleClick(click)))
      .subscribe();
  }

  private onScreenResized() {
    this.getSourceItemElements();
  }

  private getSourceItemElements() {
    this.sourceItemElements.clear();
    Object.values(Color).forEach(value => {
      const element = document.getElementById(value);
      if (element) {
        this.sourceItemElements.set(value, element);
      }
    });
    this.parentElementRect = document.getElementById("moving")!.parentElement!.parentElement!.getBoundingClientRect();
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

  getSourceItemStyle(item: SourceItem) {
    let result: any = { 'background-color': item.color };

    if (item.count > 0) {
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
    this.mainService.sourceItems.forEach(container => container.count = CONTAINER_SIZE);
    this.clearContainers();
    this.checkSaveEnabled();
  }

  private clearContainers() {
    this.mainService.setupContainers1.forEach(container => container.colors = []);
    this.mainService.setupContainers2.forEach(container => container.colors = []);
  }

  async fillRandomly() {
    this.filling = true;
    let sourceItems = this.mainService.sourceItems.filter(container => container.count > 0);
    if (sourceItems.length === 0) {
      this.clearBoard();
    }
    sourceItems = this.mainService.sourceItems.filter(container => container.count > 0);
    while (sourceItems.length > 0) {
      const sourceIndex = getRandomInt(0, sourceItems.length - 1);
      sourceItems[sourceIndex].count--;
      await this.pause(10);
      const setupContainers = [
        ...this.mainService.setupContainers1.filter(container => container.colors.length < CONTAINER_SIZE),
        ...this.mainService.setupContainers2.filter(container => container.colors.length < CONTAINER_SIZE)];
      const setupIndex = getRandomInt(0, setupContainers.length - 3);
      setupContainers[setupIndex].colors.splice(0, 0, sourceItems[sourceIndex].color!);
      sourceItems = this.mainService.sourceItems.filter(container => container.count > 0);
      await this.pause(20);
    }
    this.filling = false;
    this.checkSaveEnabled();
  }

  async pause(delay: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, delay));
  }

  saveClick() {
    const sourceContainersString = JSON.stringify(this.mainService.sourceItems);
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
      this.mainService.sourceItems = sourceContainers;
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
      // TODO: regenerate HTMLelements
    }
  }

  private addSetupContainer() {
    this.mainService.setupContainers2.push({ id: 'setup-container' + (this.mainService.containerCount - 1), colors: [] });
    this.mainService.balanceSetupContainers();
  }


  private addSourceContainer() {
    const color = Object.values(Color)[this.mainService.containerCount - 3];
    this.mainService.sourceItems.push(new SourceItem(color));
  }

  removeContainer() {
    if (MIN_CONTAINER_COUNT < this.mainService.containerCount) {
      this.mainService.containerCount--;
      this.removeSourceContainer();
      this.removeSetupContainer();
      this.mainService.saveContainerCount();
      this.checkSaveEnabled();
      // TODO: regenerate HTMLelements
    }
  }

  private removeSourceContainer() {
    const color = Object.values(Color)[this.mainService.containerCount - 2];
    this.mainService.sourceItems.pop();
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
      this.mainService.sourceItems[index].count++;
    });
    this.mainService.balanceSetupContainers();
  }

  getSourceItemId(item: SourceItem): string {
    return item.color as string;
  }

  onSourceItemClick(event: any, item: SourceItem) {
    event.stopPropagation();
    this.clickSubject$.next({ clickType: "on-source", object: item });
  }

  private handleClick(click: ClickEvent): Observable<void> {
    return new Observable(observer => {
      if (click.clickType === "on-source") {
        const item: SourceItem = click.object as SourceItem;
        if (item.selected) {
          this.unselectSourceItem(item).then(() => this.notify(observer));
        } else {
          const selectItems = this.mainService.sourceItems.filter(item => item.selected);
          if (selectItems.length > 0) {
            this.unselectSourceItem(selectItems[0]).then(() => this.selectSourceItem(item).then(() => this.notify(observer)));
          } else {
            this.selectSourceItem(item).then(() => this.notify(observer));
          }
        }
      }
    });
  }

  private notify(observer: Subscriber<void>) {
    observer.next();
    observer.complete();
  }

  private selectSourceItem(item: SourceItem): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        const element = this.sourceItemElements.get(item.color!);
        if (!element) {
          resolve();
          return;
        }
        this.movingItem.color = item.color;
        const positionFrom = this.getSourcePosition(element, this.parentElementRect);
        this.movingItem.position = positionFrom;
        this.movingItem.hidden = false;
        setTimeout(() => {
          const positionTo = this.getSelectedSourcePosition(element, this.parentElementRect);
          MovingController.moving(this.movingItem, positionFrom, positionTo, this.mainService.speed).then(() => {
            item.selected = true;
            resolve();
          });
        }, 0);
      }, 0);
    });
  }

  private unselectSourceItem(item: SourceItem): Promise<void> {
    return new Promise<void>(resolve => {
      const element = this.sourceItemElements.get(item.color!);
      if (!element) {
        resolve();
        return;
      }
      const position = this.getSourcePosition(element, this.parentElementRect);
      MovingController.moving(this.movingItem, this.movingItem.position, position, this.mainService.speed).then(() => {
        this.movingItem.hidden = true;
        item.selected = false;
        resolve();
      });
    });

  }

  private getSourcePosition(itemElement: HTMLElement, parentRect: DOMRect): Position {
    const itemRect = itemElement.getBoundingClientRect();
    const top = itemRect.top - parentRect.top - 1;
    const left = itemRect.left - parentRect.left - 1;
    return new Position(top, left);
  }

  private getSelectedSourcePosition(itemElement: HTMLElement, parentRect: DOMRect): Position {
    const itemRect = itemElement.getBoundingClientRect();
    const top = itemRect.top - parentRect.top - itemRect.height * 0.5;
    const left = itemRect.left - parentRect.left - 1;
    return new Position(top, left);
  }

  onMovingItemClick(movingItem: MovingItem) {
    const item = this.mainService.sourceItems.find(sourceItem => sourceItem.color === movingItem.color);
    if (item) {
      this.clickSubject$.next({ clickType: "on-source", object: item });
    }
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
