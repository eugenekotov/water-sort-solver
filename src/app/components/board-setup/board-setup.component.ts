import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, ViewEncapsulation } from '@angular/core';
import { Color } from 'src/app/classes/model/colors.class';
import { SetupContainer } from 'src/app/classes/model/setup-container.class';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-board-setup',
  templateUrl: './board-setup.component.html',
  styleUrls: ['./board-setup.component.scss']
})
export class BoardSetupComponent {

  constructor(public mainService: MainService) {
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
    const array: string[] = [...this.mainService.sourceContainers.map(c => c.id), ...this.mainService.setupContainers.map(c => c.id)];
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
    this.mainService.createSourceContainers();
    this.clearContainers();
  }

  private clearContainers() {
    this.mainService.setupContainers.forEach(container => container.colors = []);
  }

  saveClick() {
    const sourceContainersString = JSON.stringify(this.mainService.sourceContainers);
    const containersString = JSON.stringify(this.mainService.setupContainers);
    localStorage.setItem("water-sort-solver-source", sourceContainersString);
    localStorage.setItem("water-sort-solver-containers", containersString);
  }

  loadClick() {
    const sourceContainersString = localStorage.getItem("water-sort-solver-source");
    const containersString = localStorage.getItem("water-sort-solver-containers");
    if (sourceContainersString && containersString) {
      this.mainService.sourceContainers = JSON.parse(sourceContainersString!);
      this.mainService.setupContainers = JSON.parse(containersString!);
    }
  }

  solveClick() {
    this.mainService.solve(this.mainService.setupContainers);
  }

}
