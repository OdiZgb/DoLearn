import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeAgoPipe } from './time-ago.pipe';
import { TruncatePipe } from './truncate.pipe';
@NgModule({
  declarations: [TruncatePipe, TimeAgoPipe],
  imports: [CommonModule],
  exports: [TruncatePipe, TimeAgoPipe]
})
export class PipesModule {}