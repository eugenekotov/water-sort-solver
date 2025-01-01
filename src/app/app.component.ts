import { AfterViewInit, Component, HostListener } from '@angular/core';
import { MainService } from './services/main.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  // TODO: Add select language component

  constructor(public mainService: MainService, private translate: TranslateService) {
    const browserLang = this.translate.getBrowserLang();
    this.translate.setDefaultLang('uk');
    this.translate.use(browserLang?.match(/en|uk/) ? browserLang : 'en');
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
