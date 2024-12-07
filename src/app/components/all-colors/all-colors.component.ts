import { Component, OnInit } from '@angular/core';
import { Color } from 'src/app/classes/colors.class';

@Component({
  selector: 'app-all-colors',
  templateUrl: './all-colors.component.html',
  styleUrls: ['./all-colors.component.scss']
})
export class AllColorsComponent implements OnInit {

  private static readonly COUNT = 4;

  colors: Color[] = [];

  constructor() {
    this.generateAllColors();
  }

  private generateAllColors() {
    Object.values(Color).forEach(color => this.colors.push(...Array(4).fill(color)));
  }

  ngOnInit(): void {
  }

}
