import { Component, Input, OnInit } from '@angular/core';
import { Color } from 'src/app/classes/colors.class';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {

@Input()
color: Color | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
