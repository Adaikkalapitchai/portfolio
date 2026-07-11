import { Component, OnInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

const WEB3FORMS_ACCESS_KEY = 'eb367956-fc93-47e2-b205-47fec793d77a';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  alpha: number;
  color: string;
  radius: number;
  gravity: number;
  decay: number;
}

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit, OnDestroy {
  @ViewChild('fireworkCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  contactForm!: FormGroup;
  isSubmitted = false;
  isSending = false;
  showSuccessMessage = false;
  sendError: string | null = null;

  private particles: Particle[] = [];
  private animationId: number | null = null;
  private launchInterval: ReturnType<typeof setInterval> | null = null;

  // Lightweight colour set
  private readonly COLORS = [
    '#10b981', '#f59e0b', '#ef4444', '#60a5fa',
    '#a78bfa', '#f472b6', '#34d399', '#fbbf24'
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private ngZone: NgZone   // run animation outside Angular change detection
  ) { }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnDestroy(): void {
    this.stopFireworks();
  }

  get name() { return this.contactForm.get('name'); }
  get email() { return this.contactForm.get('email'); }
  get message() { return this.contactForm.get('message'); }

  onSubmit(): void {
    this.isSubmitted = true;
    this.sendError = null;
    if (this.contactForm.invalid) return;
    this.isSending = true;

    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      message: this.contactForm.value.message,
      subject: `Portfolio Contact from ${this.contactForm.value.name}`
    };

    this.http
      .post<{ success: boolean; message: string }>('https://api.web3forms.com/submit', payload)
      .subscribe({
        next: (res) => {
          this.isSending = false;
          if (res.success) {
            this.showSuccessMessage = true;
            setTimeout(() => this.startFireworks(), 80);
            setTimeout(() => {
              this.stopFireworks();
              this.contactForm.reset();
              this.isSubmitted = false;
              this.showSuccessMessage = false;
            }, 6000);
          } else {
            this.sendError = 'Message could not be delivered. Please email directly: adaikkalapitchai2709@gmail.com';
          }
        },
        error: () => {
          this.isSending = false;
          this.sendError = 'Network error. Please email directly: adaikkalapitchai2709@gmail.com';
        }
      });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  OPTIMISED FIREWORKS ENGINE — runs outside Angular zone to avoid lag
  // ─────────────────────────────────────────────────────────────────────────────

  private startFireworks(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let launches = 0;
    // Launch a burst every 500ms for ~5 bursts total
    this.launchInterval = setInterval(() => {
      this.spawnBurst(canvas);
      launches++;
      if (launches >= 8) {
        clearInterval(this.launchInterval!);
        this.launchInterval = null;
      }
    }, 600);

    // Kick off the render loop OUTSIDE Angular zone — prevents change detection lag
    this.ngZone.runOutsideAngular(() => this.renderLoop(canvas));
  }

  private spawnBurst(canvas: HTMLCanvasElement): void {
    const x     = 60 + Math.random() * (canvas.width  - 120);
    const y     = 30 + Math.random() * (canvas.height * 0.55);
    const color = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
    const mix   = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

    // Keep particle count low — 50 per burst is plenty
    const COUNT = 50;
    for (let i = 0; i < COUNT; i++) {
      const angle = (Math.PI * 2 * i) / COUNT;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x, y,
        vx:     Math.cos(angle) * speed,
        vy:     Math.sin(angle) * speed,
        alpha:  1,
        color:  Math.random() > 0.4 ? color : mix,
        radius: 1.8 + Math.random() * 2,
        gravity: 0.05,
        decay:  0.016 + Math.random() * 0.01
      });
    }
  }

  private renderLoop(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tick = () => {
      // Semi-transparent clear — creates short fade trail without extra draw calls
      ctx.fillStyle = 'rgba(5, 8, 12, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw & update each particle
      const alive: Particle[] = [];
      for (const p of this.particles) {
        if (p.alpha <= 0.02) continue;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.97;
        p.alpha -= p.decay;

        alive.push(p);
      }
      this.particles = alive;

      ctx.globalAlpha = 1;

      if (alive.length > 0 || this.launchInterval) {
        this.animationId = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    this.animationId = requestAnimationFrame(tick);
  }

  private stopFireworks(): void {
    if (this.launchInterval) { clearInterval(this.launchInterval); this.launchInterval = null; }
    if (this.animationId)    { cancelAnimationFrame(this.animationId); this.animationId = null; }
    this.particles = [];
  }
}
