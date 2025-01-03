import { AfterViewInit, Component, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MainService } from './services/main.service';
import { TourService } from './services/tour.service';


// TODO: prevent reloading page with unsaved data
// TODO: fat buttons style
// TODO: dark schema
// TODO: full screen on mobile
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  constructor(public mainService: MainService, private tourService: TourService) {
  }

  @HostListener('window:resize', [])
  onResize() {
    this.tourService.terminateTour();
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
