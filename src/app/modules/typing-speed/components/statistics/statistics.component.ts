import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'ts-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsComponent {
  @Input() accuracyPercentage?: number;
  @Input() charsPerMinute?: number;
  @Input() wordsPerMinute?: number;
}
