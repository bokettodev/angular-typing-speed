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
import {WORDS_EN} from "@shared/constants";
import {interval, startWith, SubscriptionLike} from "rxjs";

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

  readonly enteredWords: EnteredWord[] = [];
  readonly wordsToEnter = WORDS_EN.slice(0, 15);
  enteringWord?: { entered: string, toEnter: string, target: string, correct?: boolean };
  timerIntervalSub?: SubscriptionLike;

  constructor(@SkipSelf() private readonly parentCdRef: ChangeDetectorRef) {
  }

  @HostListener('window:resize')
  @HostBinding('style.--progressBarLengthPx')
  get progressBarLengthPx(): number {
    return (this.progressBarElementRef.nativeElement.clientWidth + this.progressBarElementRef.nativeElement.clientHeight) * 2;
  }

  ngOnDestroy(): void {
    this.timerIntervalSub?.unsubscribe();
  }

  onInput(): void {
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

  @HostListener('click')
  private focusOnInput(): void {
    this.inputElementRef.nativeElement.focus();
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
    this.enteredWords.push({
      word: this.enteringWord.entered,
      correct: this.enteringWord.entered === this.enteringWord.target
    });
    this.onEnteredWordsUpdate.emit(this.enteredWords);
    this.enteringWord = undefined;
    this.wordsToEnter.push(WORDS_EN[this.enteredWords.length + this.wordsToEnter.length]);
  }

  private startInterval(): void {
    this.timerIntervalSub?.unsubscribe();
    const timerTotalSeconds = 60;
    let timerLeftSeconds = timerTotalSeconds;

    this.timerIntervalSub = interval(1000).pipe(startWith(null)).subscribe(() => {
      if (timerLeftSeconds) {
        timerLeftSeconds -= 1;

        const progressBarHiddenRatio = 1 - timerLeftSeconds / timerTotalSeconds;
        this.progressBarHiddenLengthPx = +(this.progressBarLengthPx * progressBarHiddenRatio).toFixed();
        this.parentCdRef.detectChanges();
      } else {
        this.timerIntervalSub?.unsubscribe();
      }
    });
  }
}
