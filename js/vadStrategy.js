/**
 * Strategy interface (GoF Strategy Pattern).
 * Any VAD algorithm (energy-based, Silero ONNX, WebRTC-VAD wasm, etc.)
 * must implement this contract so VadEngine stays algorithm-agnostic (OCP).
 */
class IVadStrategy {
  /**
   * @param {Float32Array} frame PCM samples in range [-1, 1]
   * @returns {{isSpeech: boolean, score: number}}
   */
  analyze(frame) {
    throw new Error("analyze() must be implemented by subclass");
  }
}

/**
 * Energy (RMS) + Zero-Crossing-Rate heuristic VAD.
 * Lightweight, deterministic, zero external dependencies.
 * Reference concept: classic RMS-energy + ZCR VAD used in early WebRTC/Speex VAD designs.
 */
class EnergyZcrVadStrategy extends IVadStrategy {
  constructor(energyThreshold = 0.02, zcrMax = 0.5) {
    super();
    this.energyThreshold = energyThreshold;
    this.zcrMax = zcrMax;
  }

  setEnergyThreshold(value) {
    this.energyThreshold = value;
  }

  analyze(frame) {
    const rms = this._computeRms(frame);
    const zcr = this._computeZcr(frame);
    const isSpeech = rms >= this.energyThreshold && zcr <= this.zcrMax;
    return { isSpeech, score: rms };
  }

  _computeRms(frame) {
    let sumSquares = 0;
    for (let i = 0; i < frame.length; i++) {
      sumSquares += frame[i] * frame[i];
    }
    return Math.sqrt(sumSquares / frame.length);
  }

  _computeZcr(frame) {
    let crossings = 0;
    for (let i = 1; i < frame.length; i++) {
      if (
        (frame[i - 1] >= 0 && frame[i] < 0) ||
        (frame[i - 1] < 0 && frame[i] >= 0)
      ) {
        crossings++;
      }
    }
    return crossings / frame.length;
  }
}
