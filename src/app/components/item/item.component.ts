import { Component, Input, OnInit } from '@angular/core';
import { Color } from 'src/app/classes/model/colors.class';
import { Item } from 'src/app/classes/item.class';
import { BoardService } from 'src/app/services/board.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {

  @Input() item: Item;

  constructor(public boardService: BoardService) { }

  ngOnInit(): void {
  }

  getStyle() {
    return {
      'opacity': 0.5,
    };
  }

}
