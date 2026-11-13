// Contexto "grabador": acepta las mismas llamadas de dibujo que un canvas 2D y produce SVG.
// Así el PNG y el SVG salen del mismo código de dibujo y siempre coinciden.

type M = [number, number, number, number, number, number]; // a b c d e f

const num = (n: number) => String(Math.round(n * 100) / 100);

export class SvgContext {
  strokeStyle = '#000000';
  fillStyle = '#000000';
  lineWidth = 1;
  lineCap = 'butt';
  lineJoin = 'miter';
  globalAlpha = 1;

  private m: M = [1, 0, 0, 1, 0, 0];
  private stack: M[] = [];
  private d: string[] = [];
  private hasPoint = false;
  readonly out: string[] = [];

  // ── transformaciones ──
  save() { this.stack.push([...this.m] as M); }
  restore() { const m = this.stack.pop(); if (m) this.m = m; }
  translate(x: number, y: number) { const [a, b, c, d, e, f] = this.m; this.m = [a, b, c, d, a * x + c * y + e, b * x + d * y + f]; }
  scale(sx: number, sy: number) { const [a, b, c, d, e, f] = this.m; this.m = [a * sx, b * sx, c * sy, d * sy, e, f]; }
  rotate(t: number) {
    const [a, b, c, d, e, f] = this.m; const cs = Math.cos(t), sn = Math.sin(t);
    this.m = [a * cs + c * sn, b * cs + d * sn, -a * sn + c * cs, -b * sn + d * cs, e, f];
  }
  private tx(x: number, y: number): [number, number] { const [a, b, c, d, e, f] = this.m; return [a * x + c * y + e, b * x + d * y + f]; }
  private get k() { return Math.hypot(this.m[0], this.m[1]); }

  // ── trazado ──
  beginPath() { this.d = []; this.hasPoint = false; }
  moveTo(x: number, y: number) { const [X, Y] = this.tx(x, y); this.d.push(`M${num(X)} ${num(Y)}`); this.hasPoint = true; }
  lineTo(x: number, y: number) { const [X, Y] = this.tx(x, y); this.d.push(`${this.hasPoint ? 'L' : 'M'}${num(X)} ${num(Y)}`); this.hasPoint = true; }
  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number) {
    const [a, b] = this.tx(x1, y1), [c, d] = this.tx(x2, y2), [e, f] = this.tx(x, y);
    this.d.push(`C${num(a)} ${num(b)} ${num(c)} ${num(d)} ${num(e)} ${num(f)}`);
  }
  closePath() { this.d.push('Z'); }
  arc(x: number, y: number, r: number, a0: number, a1: number, ccw = false) {
    const rot = Math.atan2(this.m[1], this.m[0]);
    const R = r * this.k;
    const [cx, cy] = this.tx(x, y);
    const s0 = a0 + rot;
    const pt = (t: number): [number, number] => [cx + R * Math.cos(t), cy + R * Math.sin(t)];
    const [sx, sy] = pt(s0);
    this.d.push(`${this.hasPoint ? 'L' : 'M'}${num(sx)} ${num(sy)}`);
    this.hasPoint = true;
    let delta = ccw ? a0 - a1 : a1 - a0;
    while (delta < 0) delta += Math.PI * 2;
    const sweep = ccw ? 0 : 1;
    if (delta >= Math.PI * 2 - 1e-6) {
      const [mx, my] = pt(s0 + Math.PI);
      this.d.push(`A${num(R)} ${num(R)} 0 1 ${sweep} ${num(mx)} ${num(my)}`);
      this.d.push(`A${num(R)} ${num(R)} 0 1 ${sweep} ${num(sx)} ${num(sy)}`);
    } else {
      const [ex, ey] = pt(ccw ? s0 - delta : s0 + delta);
      this.d.push(`A${num(R)} ${num(R)} 0 ${delta > Math.PI ? 1 : 0} ${sweep} ${num(ex)} ${num(ey)}`);
    }
  }

  // ── pintado ──
  private op() { return this.globalAlpha < 1 ? ` opacity="${num(this.globalAlpha)}"` : ''; }
  stroke() {
    if (!this.d.length) return;
    const w = this.lineWidth * this.k;
    this.out.push(`<path d="${this.d.join('')}" fill="none" stroke="${this.strokeStyle}" stroke-width="${num(w)}" stroke-linecap="${this.lineCap}" stroke-linejoin="${this.lineJoin}"${this.op()}/>`);
  }
  fill() {
    if (!this.d.length) return;
    this.out.push(`<path d="${this.d.join('')}" fill="${this.fillStyle}"${this.op()}/>`);
  }
  fillRect(x: number, y: number, w: number, h: number) {
    const p = [this.tx(x, y), this.tx(x + w, y), this.tx(x + w, y + h), this.tx(x, y + h)];
    this.out.push(`<path d="M${p.map(q => `${num(q[0])} ${num(q[1])}`).join('L')}Z" fill="${this.fillStyle}"${this.op()}/>`);
  }
  clearRect() { /* sin efecto */ }
}
