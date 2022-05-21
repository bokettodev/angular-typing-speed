import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {InputComponent, TypingSpeedComponent} from './components';

@NgModule({
  declarations: [InputComponent, TypingSpeedComponent],
  imports: [CommonModule],
  exports: [TypingSpeedComponent],
})
export class TypingSpeedModule {
}
