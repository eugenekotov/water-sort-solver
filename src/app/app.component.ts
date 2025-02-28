import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { MainService } from './services/main.service';
import { TourService } from './services/tour.service';


// TODO: prevent reloading page with unsaved data
// TODO: Full screen button
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  title = "Water sort solver";

  constructor(public mainService: MainService, private tourService: TourService) {
  }

  @HostListener('window:resize', [])
  onResize() {
    this.tourService.terminateTour();
    this.checkScreenSize();
    this.mainService.screenResized$.next();
  }

  @HostListener('window:fullscreenchange', ['$event'])
  @HostListener('window:webkitfullscreenchange', ['$event'])
  @HostListener('window:mozfullscreenchange', ['$event'])
  @HostListener('window:MSFullscreenChange', ['$event'])
  screenChange(event: any) {
    console.log(event);
  }


  ngOnInit() {
    this.mainService.mainElement = document.documentElement;
    this.mainService.document = document;
    this.checkScreenSize();
    this.mainService.loadTheme();
  }

  private checkScreenSize() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile !== this.mainService.isMobile) {
      this.mainService.isMobile = isMobile;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.mainService.setView("menu"), 1000);
  }

}
