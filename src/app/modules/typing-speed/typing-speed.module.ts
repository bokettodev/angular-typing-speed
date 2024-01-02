import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiGroupModule } from '@taiga-ui/core';
import { TuiRadioBlockModule } from '@taiga-ui/kit';
import { InputComponent } from './components/input/input.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { TypingSpeedComponent } from './typing-speed.component';

@NgModule({
  declarations: [TypingSpeedComponent, InputComponent, StatisticsComponent],
  imports: [CommonModule, FormsModule, TuiGroupModule, TuiRadioBlockModule],
  exports: [TypingSpeedComponent],
})
export class TypingSpeedModule {}
