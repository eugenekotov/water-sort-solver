import { Component, Input, OnInit } from '@angular/core';
import { Item } from 'src/app/classes/model/item.class';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {

  @Input() item!: Item;

  constructor(public mainService: MainService) { }

  ngOnInit(): void {
  }

}
