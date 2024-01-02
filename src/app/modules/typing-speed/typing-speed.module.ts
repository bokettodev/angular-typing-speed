import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {InputComponent, StatisticsComponent, TypingSpeedComponent} from './components';

@NgModule({
  declarations: [InputComponent, StatisticsComponent, TypingSpeedComponent],
  imports: [CommonModule],
  exports: [TypingSpeedComponent],
})
export class TypingSpeedModule {
}
