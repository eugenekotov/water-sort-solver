import { Component, OnInit } from '@angular/core';
import { Color } from 'src/app/classes/color.class';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {

  items: Color[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
