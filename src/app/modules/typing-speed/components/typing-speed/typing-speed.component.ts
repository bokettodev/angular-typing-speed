import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-typing-speed',
  templateUrl: 'typing-speed.component.html',
  styleUrls: ['./typing-speed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypingSpeedComponent {}
