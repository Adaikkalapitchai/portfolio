import {
  Component, OnInit, OnDestroy, Output, EventEmitter,
  ElementRef, ViewChild, AfterViewInit
} from '@angular/core';

const SECRET = 'alan'; // case-insensitive unlock keyword

@Component({
  selector: 'app-gate',
  templateUrl: './gate.component.html',
  styleUrls: ['./gate.component.css']
})
export class GateComponent implements OnInit, OnDestroy, AfterViewInit {

  @Output() unlocked = new EventEmitter<void>();
  @ViewChild('nameInput') inputRef!: ElementRef<HTMLInputElement>;

  typedValue   = '';
  state: 'idle' | 'wrong' | 'unlocking' = 'idle';
  showHint     = false;
  attemptCount = 0;
  particles: { id: number; x: number; y: number; color: string; size: number }[] = [];

  // Animated typing text
  promptText   = '';
  private fullPrompt = 'Say My Name...';
  private typingTimer: ReturnType<typeof setTimeout> | null = null;
  private charIdx = 0;

  private readonly COLORS = [
    '#10b981','#f59e0b','#60a5fa','#a78bfa','#f472b6','#34d399','#fbbf24'
  ];

  ngOnInit(): void {
    this.startTypingAnimation();
  }

  ngAfterViewInit(): void {
    // Auto-focus input after typing animation
    setTimeout(() => this.inputRef?.nativeElement.focus(), 2200);
  }

  ngOnDestroy(): void {
    if (this.typingTimer) clearTimeout(this.typingTimer);
  }

  // ── Animated typing effect for the prompt ──────────────────────────────────
  private startTypingAnimation(): void {
    const type = () => {
      if (this.charIdx < this.fullPrompt.length) {
        this.promptText += this.fullPrompt[this.charIdx++];
        this.typingTimer = setTimeout(type, 80);
      }
    };
    this.typingTimer = setTimeout(type, 600); // slight delay before starting
  }

  // ── Handle input ───────────────────────────────────────────────────────────
  onInput(e: Event): void {
    this.typedValue = (e.target as HTMLInputElement).value;
    this.state = 'idle';
    this.showHint = false;

    // Check letter by letter — light up each correct character
    if (this.typedValue.toLowerCase() === SECRET) {
      this.triggerUnlock();
    }
  }

  onEnter(): void {
    if (this.typedValue.toLowerCase() === SECRET) {
      this.triggerUnlock();
    } else {
      this.triggerWrong();
    }
  }

  // ── Wrong answer ───────────────────────────────────────────────────────────
  private triggerWrong(): void {
    this.state = 'wrong';
    this.attemptCount++;
    if (this.attemptCount >= 2) this.showHint = true;

    setTimeout(() => {
      this.state = 'idle';
      this.typedValue = '';
      if (this.inputRef) this.inputRef.nativeElement.value = '';
      this.inputRef?.nativeElement.focus();
    }, 700);
  }

  // ── Correct answer — burst particles then emit unlock ─────────────────────
  private triggerUnlock(): void {
    this.state = 'unlocking';
    this.spawnParticles();
    setTimeout(() => this.unlocked.emit(), 1800);
  }

  private spawnParticles(): void {
    let id = 0;
    for (let i = 0; i < 60; i++) {
      this.particles.push({
        id:    id++,
        x:     20 + Math.random() * 60,   // % vw
        y:     20 + Math.random() * 60,   // % vh
        color: this.COLORS[Math.floor(Math.random() * this.COLORS.length)],
        size:  6 + Math.random() * 12
      });
    }
  }

  // Progress bar: how many correct letters typed so far
  get progressWidth(): string {
    let match = 0;
    for (let i = 0; i < this.typedValue.length && i < SECRET.length; i++) {
      if (this.typedValue[i].toLowerCase() === SECRET[i]) match++;
      else break;
    }
    return (match / SECRET.length * 100) + '%';
  }

  // Per-character correctness for glow effect
  charState(index: number): string {
    const ch = this.typedValue[index];
    if (!ch) return 'empty';
    return ch.toLowerCase() === SECRET[index] ? 'correct' : 'wrong';
  }
}
