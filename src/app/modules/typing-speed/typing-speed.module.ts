import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InputComponent } from './components/input/input.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { TypingSpeedComponent } from './typing-speed.component';

@NgModule({
  declarations: [TypingSpeedComponent, InputComponent, StatisticsComponent],
  imports: [CommonModule],
  exports: [TypingSpeedComponent],
})
export class TypingSpeedModule {}
