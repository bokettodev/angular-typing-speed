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
  ViewChild
} from "@angular/core";
import {EnteredWord} from "@modules/typing-speed/interfaces";
import {INSPIRATIONAL_PHRASES, WORDS_EN} from "@shared/constants";
import {interval, startWith, SubscriptionLike} from "rxjs";
import {randomItemFromArray, shuffleArray} from "@shared/functions";

@Component({
  selector: 'ts-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements OnDestroy {
  @Output() readonly onEnteredWordsUpdate = new EventEmitter<EnteredWord[]>();

  @ViewChild('inputRef', {static: true}) readonly inputElementRef!: ElementRef<HTMLInputElement>;
  @ViewChild('progressBarRef', {static: true}) readonly progressBarElementRef!: ElementRef<SVGElement>;

  @HostBinding('style.--progressBarHiddenLengthPx')
  progressBarHiddenLengthPx = 0;

  readonly wordsList = shuffleArray(WORDS_EN);
  readonly wordsToEnter = this.wordsList.slice(0, 15);
  enteredWords?: EnteredWord[];
  enteringWord?: { entered: string, toEnter: string, target: string, correct?: boolean };
  timerIntervalSub?: SubscriptionLike;
  restartText?: string;

  constructor(@SkipSelf() private readonly parentCdRef: ChangeDetectorRef, private readonly cdRef: ChangeDetectorRef) {
  }

  @HostListener('window:resize')
  @HostBinding('style.--progressBarLengthPx')
  get progressBarLengthPx(): number {
    return (this.progressBarElementRef.nativeElement.clientWidth + this.progressBarElementRef.nativeElement.clientHeight) * 2;
  }

  get disabled(): boolean {
    return !!this.restartText;
  }

  ngOnDestroy(): void {
    this.stopInterval();
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
    if (!this.timerIntervalSub) {
      this.startInterval();
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
    this.progressBarHiddenLengthPx = 0;
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
      this.enteringWord = {entered: letter, toEnter: targetWord, target: targetWord};
    } else {
      this.enteringWord.entered += letter;
    }

    this.enteringWord.correct = this.enteringWord.target.slice(0, this.enteringWord.entered.length) === this.enteringWord.entered;

    if (this.enteringWord.correct && this.enteringWord.toEnter) {
      this.enteringWord.toEnter = this.enteringWord.toEnter.slice(1);
    }
  }

  private removeLastLetterFromEnteringWord(): void {
    if (!this.enteringWord?.entered) {
      return;
    }

    if (this.enteringWord.entered === this.enteringWord.target.slice(0, this.enteringWord.entered.length)) {
      const targetLetter = this.enteringWord.entered[this.enteringWord.entered.length - 1];
      this.enteringWord.toEnter = `${targetLetter}${this.enteringWord.toEnter}`;
    }
    this.enteringWord.entered = this.enteringWord.entered.slice(0, -1);

    this.enteringWord.correct = this.enteringWord.target.slice(0, this.enteringWord.entered.length) === this.enteringWord.entered;
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
      correct: this.enteringWord.entered === this.enteringWord.target
    });

    this.onEnteredWordsUpdate.emit(this.enteredWords);
    this.enteringWord = undefined;
    this.wordsToEnter.push(this.wordsList[this.enteredWords.length + this.wordsToEnter.length]);
  }

  private startInterval(): void {
    this.stopInterval();
    const timerTotalSeconds = 60;
    let timerLeftSeconds = timerTotalSeconds;

    this.timerIntervalSub = interval(1000).pipe(startWith(null)).subscribe(() => {
      if (timerLeftSeconds) {
        timerLeftSeconds -= 1;

        const progressBarHiddenRatio = 1 - timerLeftSeconds / timerTotalSeconds;
        this.progressBarHiddenLengthPx = +(this.progressBarLengthPx * progressBarHiddenRatio).toFixed();
        this.parentCdRef.detectChanges();
      } else {
        this.stopInterval();
        this.restartText = randomItemFromArray(INSPIRATIONAL_PHRASES)
        this.inputBlur();
        this.cdRef.detectChanges();
      }
    });
  }

  private stopInterval(): void {
    this.timerIntervalSub?.unsubscribe();
    this.timerIntervalSub = undefined;
  }
}
