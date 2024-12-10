import { Component, Input, OnInit } from '@angular/core';
import { Color } from 'src/app/classes/model/colors.class';
import { ColorModel } from '../all-colors/all-colors.component';

@Component({
  selector: 'app-all-colors-item',
  templateUrl: './all-colors-item.component.html',
  styleUrls: ['./all-colors-item.component.scss']
})
export class AllColorsItemComponent implements OnInit {

@Input() colorModel!: ColorModel;

  constructor() { }

  ngOnInit(): void {
  }

}
