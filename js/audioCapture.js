/**
 * Encapsulates microphone access + Web Audio graph setup.
 * Single Responsibility: acquiring raw PCM frames only.
 */
class AudioCaptureService {
  constructor(fftSize = 1024) {
    this.fftSize = fftSize;
    this.audioContext = null;
    this.analyserNode = null;
    this.sourceNode = null;
    this.mediaStream = null;
    this._buffer = new Float32Array(fftSize);
  }

  async start() {
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    this.audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    this.sourceNode = this.audioContext.createMediaStreamSource(
      this.mediaStream,
    );

    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = this.fftSize;
    this.analyserNode.smoothingTimeConstant = 0;

    this.sourceNode.connect(this.analyserNode);
    return this.audioContext.sampleRate;
  }

  getFrame() {
    this.analyserNode.getFloatTimeDomainData(this._buffer);
    return this._buffer;
  }

  getFrequencyData(target) {
    this.analyserNode.getByteFrequencyData(target);
  }

  get frequencyBinCount() {
    return this.analyserNode ? this.analyserNode.frequencyBinCount : 0;
  }

  stop() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
    }
    this.mediaStream = null;
    this.audioContext = null;
    this.analyserNode = null;
    this.sourceNode = null;
  }
}
