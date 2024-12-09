import { Component, Input, OnInit } from '@angular/core';
import { Item } from 'src/app/classes/item.class';
import { MovingItem } from 'src/app/classes/moving-item.class';
import { BoardService } from 'src/app/services/board.service';

@Component({
  selector: 'app-moving-item',
  templateUrl: './moving-item.component.html',
  styleUrls: ['./moving-item.component.scss']
})
export class MovingItemComponent implements OnInit {

  @Input() item: MovingItem;

  constructor(public boardService: BoardService) { }

  ngOnInit(): void {
  }

  getStyle() {
    return {
      'background-color': this.item.color,
      'position': 'absolute',
      'top': this.item.top,
      'left': this.item.left,
    };
  }

}
