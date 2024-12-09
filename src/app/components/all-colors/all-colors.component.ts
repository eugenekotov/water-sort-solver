import { Component, OnInit } from '@angular/core';
import { Color } from 'src/app/classes/model/colors.class';

@Component({
  selector: 'app-all-colors',
  templateUrl: './all-colors.component.html',
  styleUrls: ['./all-colors.component.scss']
})
export class AllColorsComponent implements OnInit {

  private static readonly COUNT = 4;

  colors: Color[] = Object.values(Color);

  constructor() {
  }

  ngOnInit(): void {
  }

}
