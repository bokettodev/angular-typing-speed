import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-root',
  template: `<ts-typing-speed></ts-typing-speed>`,
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
