import {
  Component, OnInit, OnDestroy, NgZone,
  HostListener, Renderer2
} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'portfolio';

  // Cursor positions
  private mouseX = -100;
  private mouseY = -100;
  private ringX  = -100;
  private ringY  = -100;

  // DOM elements
  private dot!:       HTMLElement;
  private ring!:      HTMLElement;
  private container!: HTMLElement;

  // Trail sparkles
  private sparkles: { el: HTMLElement; life: number }[] = [];
  private rafId: number | null = null;
  private lastSparkleTime = 0;

  private readonly COLORS = [
    '#10b981', '#f59e0b', '#60a5fa',
    '#a78bfa', '#f472b6', '#34d399'
  ];
  private colorIdx = 0;

  constructor(private ngZone: NgZone, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.createCursorElements();
      this.startLoop();
    });
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.dot?.remove();
    this.ring?.remove();
    this.container?.remove();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    this.spawnSparkle(e.clientX, e.clientY);
  }

  @HostListener('document:mouseenter')
  onMouseEnter(): void {
    this.dot.style.opacity  = '1';
    this.ring.style.opacity = '1';
  }

  @HostListener('document:mouseleave')
  onMouseLeave(): void {
    this.dot.style.opacity  = '0';
    this.ring.style.opacity = '0';
  }

  @HostListener('document:mouseover', ['$event'])
  onHover(e: MouseEvent): void {
    const t = e.target as HTMLElement;
    const isClickable = t.closest('a, button, [role="button"], input, textarea, select, label');
    this.ring.style.transform  = isClickable
      ? 'translate(-50%,-50%) scale(1.8)'
      : 'translate(-50%,-50%) scale(1)';
    this.ring.style.borderColor = isClickable
      ? this.COLORS[this.colorIdx % this.COLORS.length]
      : 'rgba(255,255,255,0.5)';
  }

  @HostListener('document:mousedown')
  onMouseDown(): void {
    this.dot.style.transform  = 'translate(-50%,-50%) scale(0.6)';
    this.ring.style.transform = 'translate(-50%,-50%) scale(0.8)';
    this.burstSparkles(this.mouseX, this.mouseY);
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.dot.style.transform  = 'translate(-50%,-50%) scale(1)';
    this.ring.style.transform = 'translate(-50%,-50%) scale(1)';
  }

  // ── DOM Creation ──────────────────────────────────────────────────────────

  private createCursorElements(): void {
    document.body.classList.add('custom-cursor-active');

    this.container = document.createElement('div');
    this.container.className = 'cursor-sparkle-container';
    document.body.appendChild(this.container);

    this.dot = document.createElement('div');
    this.dot.className = 'cursor-dot';
    document.body.appendChild(this.dot);

    this.ring = document.createElement('div');
    this.ring.className = 'cursor-ring';
    document.body.appendChild(this.ring);
  }

  private spawnSparkle(x: number, y: number): void {
    const now = Date.now();
    if (now - this.lastSparkleTime < 40) return;
    this.lastSparkleTime = now;

    const color  = this.COLORS[this.colorIdx++ % this.COLORS.length];
    const el     = document.createElement('div');
    el.className = 'cursor-sparkle';
    const size   = 4 + Math.random() * 5;
    const ox     = (Math.random() - 0.5) * 12;
    const oy     = (Math.random() - 0.5) * 12;

    el.style.cssText = `
      left: ${x + ox}px;
      top:  ${y + oy}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${size * 2}px ${color};
    `;
    this.container.appendChild(el);
    this.sparkles.push({ el, life: 1 });
  }

  private burstSparkles(x: number, y: number): void {
    for (let i = 0; i < 10; i++) {
      const color  = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
      const el     = document.createElement('div');
      el.className = 'cursor-sparkle';
      const size   = 5 + Math.random() * 7;
      const angle  = (Math.PI * 2 / 10) * i;
      const dist   = 15 + Math.random() * 20;

      el.style.cssText = `
        left: ${x + Math.cos(angle) * dist}px;
        top:  ${y + Math.sin(angle) * dist}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        box-shadow: 0 0 ${size * 2}px ${color};
      `;
      this.container.appendChild(el);
      this.sparkles.push({ el, life: 1 });
    }
  }

  private startLoop(): void {
    const loop = () => {
      this.dot.style.left = this.mouseX + 'px';
      this.dot.style.top  = this.mouseY + 'px';

      this.ringX += (this.mouseX - this.ringX) * 0.12;
      this.ringY += (this.mouseY - this.ringY) * 0.12;
      this.ring.style.left = this.ringX + 'px';
      this.ring.style.top  = this.ringY + 'px';

      const alive: typeof this.sparkles = [];
      for (const s of this.sparkles) {
        s.life -= 0.055;
        s.el.style.opacity   = Math.max(0, s.life).toString();
        s.el.style.transform = `scale(${s.life}) translate(-50%, -50%)`;
        if (s.life > 0) alive.push(s);
        else s.el.remove();
      }
      this.sparkles = alive;

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }
}
