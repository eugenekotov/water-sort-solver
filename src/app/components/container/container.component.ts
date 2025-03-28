import { Component, Input } from '@angular/core';
import { PlayContainer } from 'src/app/classes/model/play-container.class';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent {

  @Input() container!: PlayContainer;
  @Input() showActive: boolean = false;

  constructor(public mainService: MainService) { }

  getItemId(containerIndex: number, itemIndex: number): string {
    return ContainerComponent.getItemId(containerIndex, itemIndex);
  }

  public static getItemId(containerIndex: number, itemIndex: number): string {
    return "container" + containerIndex + "item" + itemIndex;
  }

}
