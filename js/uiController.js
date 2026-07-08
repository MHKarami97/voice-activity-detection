/**
 * Observer that binds VadEngine events to DOM updates.
 * Keeps DOM manipulation isolated from business logic (SRP / separation of concerns).
 */
class UIController {
  constructor({ engine, visualizer, dom }) {
    this.engine = engine;
    this.visualizer = visualizer;
    this.dom = dom;
    this.eventCount = 0;
    this._latestFrame = null;
    this._isSpeaking = false;

    this._bindEngineEvents();
    this._bindControlEvents();
  }

  _bindEngineEvents() {
    this.engine.on("speechstart", () => {
      this._isSpeaking = true;
      this.eventCount++;
      this.dom.statusDot.classList.remove("bg-slate-700");
      this.dom.statusDot.classList.add("bg-emerald-500", "speaking");
      this.dom.statusText.textContent = "Speech detected";
      this.dom.eventCount.textContent = String(this.eventCount);
    });

    this.engine.on("speechend", () => {
      this._isSpeaking = false;
      this.dom.statusDot.classList.remove("bg-emerald-500", "speaking");
      this.dom.statusDot.classList.add("bg-slate-700");
      this.dom.statusText.textContent = "Listening (silence)";
    });

    this.engine.on("frame", (frame) => {
      this._latestFrame = frame;
      this.visualizer.drawFrame(frame, this._isSpeaking);
    });
  }

  _bindControlEvents() {
    this.dom.startBtn.addEventListener("click", async () => {
      try {
        await this.engine.start();
        this.dom.startBtn.disabled = true;
        this.dom.stopBtn.disabled = false;
        this.dom.statusText.textContent = "Listening (silence)";
      } catch (err) {
        this.dom.statusText.textContent = "Microphone access denied";
        console.error(err);
      }
    });

    this.dom.stopBtn.addEventListener("click", () => {
      this.engine.stop();
      this.dom.startBtn.disabled = false;
      this.dom.stopBtn.disabled = true;
      this.dom.statusDot.classList.remove("bg-emerald-500", "speaking");
      this.dom.statusDot.classList.add("bg-slate-700");
      this.dom.statusText.textContent = "Microphone idle";
    });

    this.dom.energyRange.addEventListener("input", (e) => {
      const value = parseFloat(e.target.value);
      this.engine.strategy.setEnergyThreshold(value);
      this.dom.energyVal.textContent = value.toFixed(3);
    });

    this.dom.attackRange.addEventListener("input", (e) => {
      const value = parseInt(e.target.value, 10);
      this.engine.setAttackMs(value);
      this.dom.attackVal.textContent = String(value);
    });

    this.dom.releaseRange.addEventListener("input", (e) => {
      const value = parseInt(e.target.value, 10);
      this.engine.setReleaseMs(value);
      this.dom.releaseVal.textContent = String(value);
    });
  }
}
