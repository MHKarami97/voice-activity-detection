# Voice Activity Detection (VAD) — Web

A lightweight, dependency-free, real-time **Voice Activity Detection** system that runs entirely in the browser using the **Web Audio API**. No backend, no build step, no ML model download — just open and speak.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![No Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)
![Browser Only](https://img.shields.io/badge/runtime-browser--only-orange.svg)

## Live Demo

Open `index.html` via a local static server (see [Getting Started](#getting-started)) — `getUserMedia` requires a secure context and will not work with `file://`.

## Features

- Real-time waveform visualization on `<canvas>`, color-coded by speech/silence state
- Adjustable **energy threshold**, **attack**, and **release** windows via live sliders
- Hysteresis-based state machine to prevent flickering between speech/silence
- Fully responsive UI built with Tailwind CSS (mobile-first)
- Zero external runtime dependencies — pure vanilla JavaScript (ES2022 classes)

## Architecture

The project follows SOLID principles and uses three GoF design patterns:

| Pattern | Where | Purpose |
|---|---|---|
| Strategy | `IVadStrategy` / `EnergyZcrVadStrategy` | Swap VAD algorithms (e.g. energy-based, Silero ONNX) without touching engine logic |
| Observer | `EventEmitter` / `VadEngine` | Decouple detection logic from UI updates (`speechstart`, `speechend`, `volumechange`, `frame`) |
| Facade | `VadEngine` | Hides audio capture + strategy + state machine complexity behind a simple `start()`/`stop()` API |

## Getting Started

python -m http.server 8080
# or
npx serve .

Then open http://localhost:8080 and click **Start Listening**.

## Limitations & Roadmap

- [ ] SileroVadStrategy — ONNX Runtime Web for enterprise-grade accuracy in noisy environments
- [ ] WAV export of detected speech segments
- [ ] Multi-language UI (English / Persian)

## License

MIT

## Author

Mohammad Hossein Karami — mhkarami97.ir