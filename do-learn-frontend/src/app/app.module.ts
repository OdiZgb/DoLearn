import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component'; // Ensure this import is correct

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule], // Other modules you may use
  bootstrap: [AppComponent]
})
export class AppModule {}
