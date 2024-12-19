import { AfterViewInit, Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MainService } from './services/main.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  constructor(private breakpointObserver: BreakpointObserver, public mainService: MainService) {
  }

  ngOnInit() {
    this.breakpointObserver.observe(Breakpoints.Handset).subscribe({ next: result => this.mainService.isMobile = result.matches });
  }

  ngAfterViewInit(): void {
    this.mainService.setMode("setup");
  }

}
