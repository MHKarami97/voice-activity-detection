/**
 * Renders a real-time waveform on <canvas>. Pure rendering concern (SRP).
 */
class Visualizer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this._resize();
    window.addEventListener("resize", () => this._resize());
  }

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.clientWidth * dpr;
    this.canvas.height = this.canvas.clientHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  drawFrame(frame, isSpeech) {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = isSpeech ? "#22c55e" : "#475569";
    ctx.beginPath();

    const sliceWidth = width / frame.length;
    let x = 0;
    for (let i = 0; i < frame.length; i++) {
      const y = (0.5 + frame[i] / 2) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.stroke();
  }
}
