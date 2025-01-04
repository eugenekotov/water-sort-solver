import { AfterViewInit, Component, HostListener } from '@angular/core';
import { MainService } from './services/main.service';
import { TourService } from './services/tour.service';


// TODO: prevent reloading page with unsaved data
// TODO: fat buttons style
// TODO: dark schema
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
    this.mainService.screenResized$.next();
  }

  ngOnInit() {
    document.body.classList.toggle("dark-theme");
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile !== this.mainService.isMobile) {
      this.mainService.isMobile = isMobile;
    }
  }

  ngAfterViewInit(): void {
    this.mainService.setMode("setup");
  }

}
