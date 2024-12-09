import { Component, Input, OnInit } from '@angular/core';
import { Color } from 'src/app/classes/model/colors.class';

@Component({
  selector: 'app-all-colors-item',
  templateUrl: './all-colors-item.component.html',
  styleUrls: ['./all-colors-item.component.scss']
})
export class AllColorsItemComponent implements OnInit {

@Input()
color: Color | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
