import { Component, OnInit } from '@angular/core';
import { Color } from 'src/app/classes/model/colors.class';

export class ColorModel {
  color: Color;
  count: number;
}

@Component({
  selector: 'app-all-colors',
  templateUrl: './all-colors.component.html',
  styleUrls: ['./all-colors.component.scss']
})
export class AllColorsComponent implements OnInit {

  private static readonly COUNT = 4;

  colorModels: ColorModel[] = Object.values(Color).map(color => ({color: color, count: 4}));

  constructor() {
  }

  ngOnInit(): void {
  }

}
