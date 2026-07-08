/**
 * Composition root: wires Strategy -> Engine -> Visualizer -> UIController.
 * No business logic lives here (Dependency Injection at the top level only).
 */
document.addEventListener("DOMContentLoaded", () => {
  const dom = {
    startBtn: document.getElementById("startBtn"),
    stopBtn: document.getElementById("stopBtn"),
    statusDot: document.getElementById("statusDot"),
    statusText: document.getElementById("statusText"),
    eventCount: document.getElementById("eventCount"),
    energyRange: document.getElementById("energyRange"),
    energyVal: document.getElementById("energyVal"),
    attackRange: document.getElementById("attackRange"),
    attackVal: document.getElementById("attackVal"),
    releaseRange: document.getElementById("releaseRange"),
    releaseVal: document.getElementById("releaseVal"),
  };

  const strategy = new EnergyZcrVadStrategy(0.02, 0.5);
  const engine = new VadEngine({
    strategy,
    frameIntervalMs: 20,
    attackMs: 60,
    releaseMs: 240,
  });
  const visualizer = new Visualizer(document.getElementById("waveform"));

  new UIController({ engine, visualizer, dom });
});
