import { Component, Input, OnInit } from '@angular/core';
import { Container } from 'src/app/classes/container.class';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {

  @Input()
  container: Container = new Container();

  constructor() { }

  ngOnInit(): void {
  }

}
