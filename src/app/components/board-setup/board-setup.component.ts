import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { concatMap, debounceTime, Observable, Subject, Subscriber, Subscription, tap } from 'rxjs';
import { Color } from 'src/app/classes/model/colors.class';
import { CONTAINER_SIZE, MAX_CONTAINER_COUNT, MAX_CONTAINER_COUNT_IN_LINE, MIN_CONTAINER_COUNT, STORAGE_KEY } from 'src/app/classes/model/const.class';
import { GameContainer } from 'src/app/classes/model/game/game-container.class';
import { GameSourceItem } from 'src/app/classes/model/game/game-source-item.class';
import { MovingItem, Position } from 'src/app/classes/model/item.class';
import { MovingController } from 'src/app/classes/moving-controller.class';
import { Utils } from 'src/app/classes/utils.class';
import { GameService } from 'src/app/services/game.service';
import { MainService, TView } from 'src/app/services/main.service';
import { Tour, TourItem, TourService } from 'src/app/services/tour.service';

type TClick = "on-source" | "on-container";

class ClickEvent {
  clickType: TClick;
  object: GameSourceItem | GameContainer;
}

@Component({
  selector: 'app-board-setup',
  templateUrl: './board-setup.component.html',
  styleUrls: ['./board-setup.component.scss']
})
export class BoardSetupComponent implements OnInit, AfterViewInit, OnDestroy {

  protected utils = Utils;
  protected readonly view: TView = 'setup';

  private clickSubject$ = new Subject<ClickEvent>();
  private clickSubjectSubscription: Subscription | undefined = undefined;

  private screenResizedSubscription: Subscription | undefined = undefined;
  private screenChagedSubscription: Subscription | undefined;

  tour: Tour | undefined;
  hasGame: boolean = false;
  loadEnabled: boolean = false;

  private selectedSourceItem: GameSourceItem | undefined;

  setupContainers1: GameContainer[] = [];
  setupContainers2: GameContainer[] = [];

  setupContainerPositions1: GameContainer[] = [];
  setupContainerPositions2: GameContainer[] = [];

  movingItem: MovingItem = new MovingItem();
  private sourceItemElements: Map<Color, HTMLElement> = new Map<Color, HTMLElement>();
  private parentElementRect: DOMRect;

  constructor(public mainService: MainService, public gameService: GameService, public tourService: TourService) {
    this.createSetupContainers();
    this.createSetupContainerPositions();
    this.checkHasGame();
    this.checkLoadEnabled();
    this.createClickSubject();
  }

  ngOnInit(): void {
    this.screenChagedSubscription = this.mainService.screenChanged$
      .pipe(debounceTime(500)).subscribe(() => this.tour = undefined);
    this.screenResizedSubscription = this.mainService.screenResized$
      .pipe(tap(() => this.stopMovingProcess()))
      .pipe(debounceTime(500)).subscribe(() => {
        setTimeout(() => this.onScreenResized(), 100);
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

  private createSetupContainerPositions() {
    this.setupContainerPositions1 = this.setupContainers1.map(container => this.createContainerPosition(container));
    this.setupContainerPositions2 = this.setupContainers2.map(container => this.createContainerPosition(container));
  }

  private createContainerPosition(container: GameContainer): GameContainer {
    const result = new GameContainer(container.index);
    result.colors = Array<Color>(CONTAINER_SIZE).fill(Color.RED);
    return result;
  }

  private onScreenResized() {
    this.getSourceItemElements();
  }

  private getSourceItemElements() {
    setTimeout(() => {
      this.sourceItemElements.clear();
      this.gameService.sourceItems.items.forEach(value => {
        const element = document.getElementById(value.color);
        if (element) {
          this.sourceItemElements.set(value.color, element);
        } else {
          throw new Error("Cannot find HTML element of source item");
        }
      });
      this.parentElementRect = document.getElementById("moving")!.parentElement!.parentElement!.getBoundingClientRect();
    }, 0);
  }

  private getSetupContainersItemElement(containerIndex: number, itemIndex: number): HTMLElement | null {
    return document.getElementById(Utils.getContainerItemId(containerIndex, itemIndex));
  }

  onSetupContainerClick(event: any, container: GameContainer) {
    event.stopPropagation();
    this.clickSubject$.next({ clickType: "on-container", object: container });
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
      this.checkHasGame();
    }
  }

  private checkHasGame() {
    this.hasGame = this.gameService.setupContainers.some(container => container.colors.length > 0);
  }

  private createSetupContainers() {
    const containerCount = this.gameService.setupContainers.length;
    if (containerCount <= MAX_CONTAINER_COUNT_IN_LINE) {
      this.setupContainers1 = this.gameService.setupContainers;
      this.setupContainers2 = [];
    } else {
      this.setupContainers1 = [];
      this.setupContainers2 = [];
      const halfOfContainerCount = Math.ceil(containerCount / 2);
      for (let i = 0; i < halfOfContainerCount; i++) {
        this.setupContainers1.push(this.gameService.setupContainers[i]);
      }
      for (let i = halfOfContainerCount; i < containerCount; i++) {
        this.setupContainers2.push(this.gameService.setupContainers[i]);
      }
    }
  }

  protected getConnectedLists(currentId: string): string[] {
    return Array<number>(this.gameService.setupContainers.length).fill(0).map((_, index) => Utils.getContainerId(index)).filter(id => id !== currentId);
  }

  protected getSourceItemStyle(item: GameSourceItem) {
    let result: any = { 'background-color': item.color };

    if (item.count > 0) {
      result['opacity'] = 1;
    } else {
      result['opacity'] = 0.2;
    }
    return result;
  }

  protected getItemStyle(color: Color) {
    return { 'background-color': color };
  }


  protected canDrop(container: GameContainer): () => boolean {
    return () => {
      return container.colors.length < CONTAINER_SIZE;
    }
  }

  protected clearClick() {
    // TODO: Ask confirmation
    this.clearBoard();
  }

  private clearBoard() {
    this.gameService.clearSetup();
    this.checkHasGame();
  }

  fillRandomly() {
    this.gameService.fillRandomSetup();
    this.createSetupContainers();
    this.checkHasGame();
  }

  async pause(delay: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, delay));
  }

  saveClick() {
    // TODO: Here should be saving setup game
    this.mainService.setView("save");
    // const sourceContainersString = JSON.stringify(this.gameService.sourceItems);
    // const containersString1 = JSON.stringify(this.setupContainers1);
    // const containersString2 = JSON.stringify(this.setupContainers2);
    // localStorage.setItem(STORAGE_KEY + "-source", sourceContainersString);
    // localStorage.setItem(STORAGE_KEY + "-containers-1", containersString1);
    // localStorage.setItem(STORAGE_KEY + "-containers-2", containersString2);
    // this.saveEnabled = false;
    // this.checkLoadEnabled();
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
      // this.mainService.containerCount = setupContainers1.length + setupContainers2.length;
      // this.mainService.sourceItems = sourceContainers;
      // this.mainService.setupContainers1 = setupContainers1;
      // this.mainService.setupContainers2 = setupContainers2;
    }
  }


  playClick() {
    // TODO: Show error if board is not filled
    this.gameService.fromSetupContainersToContainers();
    this.mainService.play();
  }

  solveClick() {
    // TODO: Show error if board is not filled
    this.gameService.fromSetupContainersToContainers();
    this.mainService.solve();
  }

  addContainer() {
    if (this.gameService.setupContainers.length < MAX_CONTAINER_COUNT) {
      this.stopMovingProcess();
      this.gameService.sourceItems.addItems(1); // add sourceitem
      this.gameService.setupContainers.push(new GameContainer(this.gameService.setupContainers.length)); // add container
      // TODO: Save as setup container count
      // this.mainService.saveContainerCount();
      this.containersCountChanged();
    }
  }

  removeContainer() {
    if (MIN_CONTAINER_COUNT < this.gameService.setupContainers.length) {
      this.stopMovingProcess();
      // this.mainService.containerCount--;
      this.removeSourceContainer();
      this.removeSetupContainer();
      // TODO: Save as setup container count
      // this.mainService.saveContainerCount();
      this.containersCountChanged();
    }
  }

  private removeSourceContainer() {
    const color = this.gameService.sourceItems.popItem().color;
    // remove color from setup containers
    this.gameService.setupContainers.forEach(container => {
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
    const container = this.gameService.setupContainers.pop();
    if (!container) {
      throw new Error("Empty container found in game");
    }
    // move colors back to source
    container.colors.forEach(color => this.gameService.sourceItems.increment(color));
  }

  private containersCountChanged() {
    this.getSourceItemElements();
    this.createSetupContainers();
    this.createSetupContainerPositions();
    this.checkHasGame();
  }

  getSourceItemId(item: GameSourceItem): string {
    return item.color as string;
  }

  onSourceItemClick(event: any, item: GameSourceItem) {
    event.stopPropagation();
    this.clickSubject$.next({ clickType: "on-source", object: item });
  }

  private handleClick(click: ClickEvent): Observable<void> {
    return new Observable(observer => {
      if (click.clickType === "on-source") { // click.object instanceof SourceItem
        const item: GameSourceItem = click.object as GameSourceItem;
        if (this.selectedSourceItem !== undefined && this.selectedSourceItem.color === item.color) {
          this.unselectSourceItem(item).then(() => this.notify(observer));
        } else {
          if (item.count > 0) {
            if (this.selectedSourceItem) {
              this.unselectSourceItem(this.selectedSourceItem).then(() => this.selectSourceItem(item).then(() => this.notify(observer)));
            } else {
              this.selectSourceItem(item).then(() => this.notify(observer));
            }
          } else {
            this.notify(observer);
          }
        }
      } else if (click.clickType === "on-container") {
        if (this.selectedSourceItem === undefined) {
          this.notify(observer);
        } else {
          const container: GameContainer = click.object as GameContainer;
          if (container.colors.length === CONTAINER_SIZE) {
            this.notify(observer);
          } else {
            this.moveSourceItem(this.selectedSourceItem, container).then(() => this.notify(observer));
          }
        }
      } else {
        const _n: never = click.clickType;
      }
    });
  }

  private notify(observer: Subscriber<void>) {
    observer.next();
    observer.complete();
  }

  private selectSourceItem(item: GameSourceItem): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        const element = this.sourceItemElements.get(item.color!);
        if (!element) {
          resolve();
          throw new Error("Cannot find HTML element of color.");
        }
        this.movingItem.color = item.color;
        const positionFrom = this.getSourcePosition(element, this.parentElementRect);
        this.movingItem.position = positionFrom;
        this.movingItem.hidden = false;
        setTimeout(() => {
          const positionTo = this.getSelectedSourcePosition(element, this.parentElementRect);
          MovingController.moving(this.movingItem, positionFrom, positionTo, this.mainService.speed).then(() => {
            this.selectedSourceItem = item;
            resolve();
          });
        }, 0);
      }, 0);
    });
  }

  private unselectSourceItem(item: GameSourceItem): Promise<void> {
    return new Promise<void>(resolve => {
      const element = this.sourceItemElements.get(item.color!);
      if (!element) {
        resolve();
        return;
      }
      const position = this.getSourcePosition(element, this.parentElementRect);
      MovingController.moving(this.movingItem, this.movingItem.position, position, this.mainService.speed).then(() => {
        this.movingItem.hidden = true;
        this.selectedSourceItem = undefined;
        resolve();
      });
    });

  }

  private moveSourceItem(item: GameSourceItem, container: GameContainer): Promise<void> {
    return new Promise<void>(resolve => {
      const positionItemHTMLElement = this.getSetupContainersItemElement(container.index, container.colors.length);
      if (!positionItemHTMLElement) {
        resolve();
        return;
      }
      const positionTo = this.getSourcePosition(positionItemHTMLElement, this.parentElementRect);
      MovingController.moving(this.movingItem, this.movingItem.position, positionTo, this.mainService.speed).then(() => {
        this.movingItem.hidden = true;
        this.selectedSourceItem = undefined;
        item.count--;
        container.colors.unshift(this.movingItem.color!);
        this.checkHasGame();
        resolve();
      });
    });
  }

  private getSourcePosition(itemElement: HTMLElement, parentRect: DOMRect): Position {
    const itemRect = itemElement.getBoundingClientRect();
    const top = itemRect.top - parentRect.top - 1;
    const left = itemRect.left - parentRect.left - 1;
    return new Position(left, top);
  }

  private getSelectedSourcePosition(itemElement: HTMLElement, parentRect: DOMRect): Position {
    const itemRect = itemElement.getBoundingClientRect();
    const top = itemRect.top - parentRect.top - itemRect.height * 0.5;
    const left = itemRect.left - parentRect.left - 1;
    return new Position(left, top);
  }

  onMovingItemClick(movingItem: MovingItem) {
    this.clickSubject$.next({ clickType: "on-source", object: this.gameService.sourceItems.getSourceItem(movingItem.color!) });
  }

  private stopMovingProcess() {
    this.movingItem.hidden = true;
    this.selectedSourceItem = undefined;
  }

  showMenu() {

  }

  startTour() {
    if (this.tour === undefined) {
      this.createTour();
    }
    this.tourService.startTour(this.tour!);
  }

  private createTour() {
    this.tour = new Tour();
    this.tour.tourItems.push(new TourItem().setWidth(350).setText("SETUP.TOUR.COLORS")
      .setElement(document.getElementById("source-containers")!));

    this.tour.tourItems.push(new TourItem().setWidth(250).setText("SETUP.TOUR.B_ADD")
      .setElement(document.getElementById("buttons-add-remove")!));

    this.tour.tourItems.push(new TourItem().setWidth(300).setText("SETUP.TOUR.CONTAINERS")
      .setElement(document.getElementById("containers")!));
  }

}
