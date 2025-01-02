import { AfterViewInit, Component, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MainService } from './services/main.service';


// TODO: prevent reloading page with unsaved data
// TODO: bug. isMobile. tour. first step, second step, beck to fist step.
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  constructor(public mainService: MainService, private translate: TranslateService) {
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
