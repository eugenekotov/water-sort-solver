import { AfterViewInit, Component, HostListener } from '@angular/core';
import { MainService } from './services/main.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  constructor(public mainService: MainService) {
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.mainService.isMobile = window.innerWidth <= 768;
  }

  ngAfterViewInit(): void {
    this.mainService.setMode("setup");
  }

}
