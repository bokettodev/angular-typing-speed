import {ChangeDetectionStrategy, Component, ElementRef, ViewChild} from "@angular/core";

@Component({
  selector: 'ts-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {
  @ViewChild('inputRef', {static: true}) readonly inputElementRef!: ElementRef<HTMLInputElement>

  readonly enteredWords: { word: string, correct?: boolean }[] = [];
  readonly wordsToEnter = ["also", "store", "soldier", "verse", "plaster"];
  enteringWord?: { entered: string, toEnter: string, target: string, correct?: boolean };

  onInput(): void {
    const letter = this.inputElementRef.nativeElement.value.trim();
    this.inputElementRef.nativeElement.value = '';
    if (!letter) {
      return;
    }
    this.addLetterToEnteringWord(letter);
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
    this.enteringWord = undefined;
  }
}
