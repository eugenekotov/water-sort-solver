import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Item } from 'src/app/classes/model/item.class';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-moving-item',
  templateUrl: './moving-item.component.html',
  styleUrls: ['./moving-item.component.scss']
})
export class MovingItemComponent implements OnInit {

  @Input() item!: Item;
  @Output() click: EventEmitter<void> = new EventEmitter<void>();

  constructor(public mainService: MainService) { }

  ngOnInit(): void {
  }

  getStyle() {
    return {
      'background-color': this.item.color,
      'position': 'absolute',
      'top': this.item.top,
      'left': this.item.left,
      'transition-duration': this.item.transitionDuration
    };
  }

  onClick(event: any) {
    this.click.emit();
    event.stopPropagation();
  }

}
