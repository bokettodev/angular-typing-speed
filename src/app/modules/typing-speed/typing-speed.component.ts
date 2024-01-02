import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EnteredWord } from './interfaces/entered-word.interface';

@Component({
  selector: 'ts-typing-speed',
  templateUrl: 'typing-speed.component.html',
  styleUrls: ['./typing-speed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypingSpeedComponent {
  wordsPerMinute = 0;
  charsPerMinute = 0;
  accuracyPercentage = 0;

  onEnteredWordsUpdate(enteredWords: EnteredWord[]): void {
    enteredWords = enteredWords || [];
    const correctWords = enteredWords
      .filter((w) => w.correct)
      .map((w) => w.word);
    this.wordsPerMinute = correctWords.length;
    this.charsPerMinute = correctWords.join('').length;
    this.accuracyPercentage = +(
      (correctWords.length / enteredWords.length) *
      100
    ).toFixed();
  }
}
