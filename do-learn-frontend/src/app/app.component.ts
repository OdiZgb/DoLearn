import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-root',
  
  imports: [RouterModule], // for <router-outlet> and routerLink
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'DoLearn';
}
