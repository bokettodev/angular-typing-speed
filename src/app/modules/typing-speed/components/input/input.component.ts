import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  OnDestroy,
  Output,
  SkipSelf,
  ViewChild,
} from '@angular/core';
import { EnteredWord } from '@modules/typing-speed/interfaces';
import { INSPIRATIONAL_PHRASES } from '@shared/constants';
import { WORDS_RU } from '@shared/constants/words-ru.const';
import { randomItemFromArray, shuffleArray } from '@shared/functions';
import { SubscriptionLike, timer } from 'rxjs';

@Component({
  selector: 'ts-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements OnDestroy {
  @ViewChild('inputRef', { static: true })
  readonly inputElementRef!: ElementRef<HTMLInputElement>;
  @Output() readonly onEnteredWordsUpdate = new EventEmitter<EnteredWord[]>();

  readonly wordsList = shuffleArray(WORDS_RU);
  readonly wordsToEnter = this.wordsList.slice(0, 15);
  enteredWords?: EnteredWord[];
  enteringWord?: {
    entered: string;
    toEnter: string;
    target: string;
    correct?: boolean;
  };
  restartText?: string;

  @HostBinding('style.--progress-bar-scale-x')
  private progressBarScaleX?: number;

  @HostBinding('style.--progress-bar-scale-x-animation-seconds')
  private progressBarScaleXAnimationSeconds?: number;

  private timerSub?: SubscriptionLike;

  constructor(
    @SkipSelf() private readonly parentCdRef: ChangeDetectorRef,
    private readonly cdRef: ChangeDetectorRef
  ) {}

  get disabled(): boolean {
    return !!this.restartText;
  }

  ngOnDestroy(): void {
    this.dropTimer();
  }

  onInput(): void {
    if (this.disabled) {
      return;
    }

    const letter = this.inputElementRef.nativeElement.value.trim();
    this.inputElementRef.nativeElement.value = '';
    if (!letter) {
      return;
    }

    this.addLetterToEnteringWord(letter);
    if (!this.timerSub) {
      this.runTimer();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.disabled) {
      return;
    }
    switch (event.key) {
      case 'Backspace': {
        this.removeLastLetterFromEnteringWord();
        break;
      }
      case ' ': {
        this.completeEnteredWord();
        break;
      }
    }
  }

  reset(): void {
    this.enteredWords = undefined;
    this.enteringWord = undefined;
    this.onEnteredWordsUpdate.emit(this.enteredWords);
    this.progressBarScaleXAnimationSeconds = 0.5;
    this.progressBarScaleX = 1;
    this.restartText = undefined;
  }

  @HostListener('click')
  private focusOnInput(): void {
    if (this.disabled) {
      return;
    }
    this.inputFocus();
  }

  private inputFocus(): void {
    this.inputElementRef.nativeElement.focus();
  }

  private inputBlur(): void {
    this.inputElementRef.nativeElement.blur();
  }

  private addLetterToEnteringWord(letter: string): void {
    if (!this.enteringWord) {
      const targetWord = this.wordsToEnter.shift()!;
      this.enteringWord = {
        entered: letter,
        toEnter: targetWord,
        target: targetWord,
      };
    } else {
      this.enteringWord.entered += letter;
    }

    this.enteringWord.correct =
      this.enteringWord.target.slice(0, this.enteringWord.entered.length) ===
      this.enteringWord.entered;

    if (this.enteringWord.correct && this.enteringWord.toEnter) {
      this.enteringWord.toEnter = this.enteringWord.toEnter.slice(1);
    }
  }

  private removeLastLetterFromEnteringWord(): void {
    if (!this.enteringWord?.entered) {
      return;
    }

    if (
      this.enteringWord.entered ===
      this.enteringWord.target.slice(0, this.enteringWord.entered.length)
    ) {
      const targetLetter =
        this.enteringWord.entered[this.enteringWord.entered.length - 1];
      this.enteringWord.toEnter = `${targetLetter}${this.enteringWord.toEnter}`;
    }
    this.enteringWord.entered = this.enteringWord.entered.slice(0, -1);

    this.enteringWord.correct =
      this.enteringWord.target.slice(0, this.enteringWord.entered.length) ===
      this.enteringWord.entered;
  }

  private completeEnteredWord(): void {
    if (!this.enteringWord?.entered) {
      return;
    }

    if (!this.enteredWords) {
      this.enteredWords = [];
    }
    this.enteredWords.push({
      word: this.enteringWord.entered,
      correct: this.enteringWord.entered === this.enteringWord.target,
    });

    this.onEnteredWordsUpdate.emit(this.enteredWords);
    this.enteringWord = undefined;
    this.wordsToEnter.push(
      this.wordsList[this.enteredWords.length + this.wordsToEnter.length]
    );
  }

  private runTimer(): void {
    this.dropTimer();
    this.progressBarScaleXAnimationSeconds = 60;
    this.progressBarScaleX = 0;
    const timerMilliseconds = 60000;

    this.timerSub = timer(timerMilliseconds).subscribe(() => {
      this.dropTimer();
      this.inputBlur();
      this.restartText = randomItemFromArray(INSPIRATIONAL_PHRASES);
      this.cdRef.detectChanges();
    });
  }

  private dropTimer(): void {
    this.timerSub?.unsubscribe();
    this.timerSub = undefined;
  }
}
