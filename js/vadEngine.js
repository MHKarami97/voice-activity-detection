/**
 * Minimal Observer/EventEmitter (avoids external dependency).
 */
class EventEmitter {
  constructor() {
    this._listeners = new Map();
  }

  on(eventName, callback) {
    if (!this._listeners.has(eventName)) this._listeners.set(eventName, []);
    this._listeners.get(eventName).push(callback);
    return this;
  }

  emit(eventName, payload) {
    const callbacks = this._listeners.get(eventName) || [];
    for (const cb of callbacks) cb(payload);
  }
}

/**
 * Facade orchestrating AudioCaptureService + IVadStrategy + hysteresis state machine.
 * Emits: "speechstart", "speechend", "volumechange", "frame"
 *
 * Hysteresis prevents flicker: a state transition only fires after N consecutive
 * frames agree, using attack (speech confirm) and release (silence confirm) windows.
 */
class VadEngine extends EventEmitter {
  static STATE_IDLE = "idle";
  static STATE_SPEAKING = "speaking";

  constructor({
    strategy,
    frameIntervalMs = 20,
    attackMs = 60,
    releaseMs = 240,
  } = {}) {
    super();
    this.strategy = strategy;
    this.audioCapture = new AudioCaptureService();
    this.frameIntervalMs = frameIntervalMs;
    this.attackFrames = Math.max(1, Math.round(attackMs / frameIntervalMs));
    this.releaseFrames = Math.max(1, Math.round(releaseMs / frameIntervalMs));

    this._state = VadEngine.STATE_IDLE;
    this._consecutiveSpeechFrames = 0;
    this._consecutiveSilenceFrames = 0;
    this._timerId = null;
    this._running = false;
  }

  setAttackMs(ms) {
    this.attackFrames = Math.max(1, Math.round(ms / this.frameIntervalMs));
  }

  setReleaseMs(ms) {
    this.releaseFrames = Math.max(1, Math.round(ms / this.frameIntervalMs));
  }

  async start() {
    if (this._running) return;
    await this.audioCapture.start();
    this._running = true;
    this._loop();
  }

  stop() {
    this._running = false;
    if (this._timerId) clearTimeout(this._timerId);
    this.audioCapture.stop();
    this._state = VadEngine.STATE_IDLE;
    this._consecutiveSpeechFrames = 0;
    this._consecutiveSilenceFrames = 0;
  }

  getAudioCapture() {
    return this.audioCapture;
  }

  _loop() {
    if (!this._running) return;

    const frame = this.audioCapture.getFrame();
    const { isSpeech, score } = this.strategy.analyze(frame);

    this.emit("volumechange", score);
    this.emit("frame", frame);
    this._updateStateMachine(isSpeech);

    this._timerId = setTimeout(() => this._loop(), this.frameIntervalMs);
  }

  _updateStateMachine(isSpeech) {
    if (isSpeech) {
      this._consecutiveSpeechFrames++;
      this._consecutiveSilenceFrames = 0;
    } else {
      this._consecutiveSilenceFrames++;
      this._consecutiveSpeechFrames = 0;
    }

    if (
      this._state === VadEngine.STATE_IDLE &&
      this._consecutiveSpeechFrames >= this.attackFrames
    ) {
      this._state = VadEngine.STATE_SPEAKING;
      this.emit("speechstart");
    } else if (
      this._state === VadEngine.STATE_SPEAKING &&
      this._consecutiveSilenceFrames >= this.releaseFrames
    ) {
      this._state = VadEngine.STATE_IDLE;
      this.emit("speechend");
    }
  }
}
