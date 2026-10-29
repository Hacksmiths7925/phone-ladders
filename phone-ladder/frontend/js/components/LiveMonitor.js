(function() {
  const { createElement: h, useState, useEffect, useRef } = React;
  const Icons = window.Icons;

  function LiveMonitor({ activeDevice, models, onSwitchModel }) {
    const [isMonitoring, setIsMonitoring] = useState(true);
    const [fps, setFps] = useState(60);
    const [heapMem, setHeapMem] = useState(null);
    const [batteryInfo, setBatteryInfo] = useState(null);
    const [activeModelId, setActiveModelId] = useState("llama-3.2-3b-instruct");
    const [simulatedContextLength, setSimulatedContextLength] = useState(2048);
    const [smartSwitchAlert, setSmartSwitchAlert] = useState(null);
    const [evaluatingSwitch, setEvaluatingSwitch] = useState(false);
    const [switchStatus, setSwitchStatus] = useState("");

    const frameCount = useRef(0);
    const lastTime = useRef(performance.now());

    // FPS loop
    useEffect(() => {
      let animId;
      const countFps = (now) => {
        frameCount.current++;
        if (now - lastTime.current >= 1000) {
          setFps(Math.round((frameCount.current * 1000) / (now - lastTime.current)));
          frameCount.current = 0;
          lastTime.current = now;
        }
        if (isMonitoring) {
          animId = requestAnimationFrame(countFps);
        }
      };
      animId = requestAnimationFrame(countFps);
      return () => cancelAnimationFrame(animId);
    }, [isMonitoring]);

    // Battery & Memory Polling
    useEffect(() => {
      let timer;
      const pollSensors = async () => {
        // 1. Chrome/Android performance.memory
        if (window.performance && window.performance.memory) {
          const usedMb = Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024));
          const totalMb = Math.round(window.performance.memory.totalJSHeapSize / (1024 * 1024));
          const limitMb = Math.round(window.performance.memory.jsHeapSizeLimit / (1024 * 1024));
          setHeapMem({ usedMb, totalMb, limitMb, isSupported: true });
        } else {
          setHeapMem({ isSupported: false, note: "API Restricted by Browser Sandbox (Privacy Shield)" });
        }

        // 2. Battery API
        if ('getBattery' in navigator) {
          try {
            const b = await navigator.getBattery();
            setBatteryInfo({
              levelPct: Math.round(b.level * 100),
              charging: b.charging,
              chargingTime: b.chargingTime,
              dischargingTime: b.dischargingTime,
              isSupported: true
            });
          } catch (e) {
            setBatteryInfo({ isSupported: false, note: "Battery API Blocked" });
          }
        } else {
          setBatteryInfo({ isSupported: false, note: "Battery API Unsupported in this browser" });
        }
      };

      pollSensors();
      timer = setInterval(pollSensors, 2000);
      return () => clearInterval(timer);
    }, []);

    // Check memory pressure when simulated context length or active model changes
    useEffect(() => {
      checkSmartSwitch();
    }, [simulatedContextLength, activeModelId, activeDevice?.ram_gb]);

    const checkSmartSwitch = async () => {
      const devRam = activeDevice?.ram_gb || 8.0;
      // High context length (> 4096) or modest phone RAM (< 6GB) triggers memory evaluation
      const triggerPressure = (simulatedContextLength >= 4096 && devRam <= 8.0) || (devRam <= 4.0);

      if (triggerPressure) {
        setEvaluatingSwitch(true);
        try {
          const res = await fetch("/api/smart-switch/evaluate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              current_model_id: activeModelId,
              device_ram_gb: devRam,
              current_context_length: simulatedContextLength,
              trigger_reason: "memory_pressure"
            })
          });
          const data = await res.json();
          if (data.needs_fallback && data.recommended_fallback) {
            setSmartSwitchAlert(data);
          } else {
            setSmartSwitchAlert(null);
          }
        } catch (e) {
          console.error("Switch eval failed:", e);
        } finally {
          setEvaluatingSwitch(false);
        }
      } else {
        setSmartSwitchAlert(null);
      }
    };

    const handleAcceptSwitch = (targetModelId) => {
      setActiveModelId(targetModelId);
      if (onSwitchModel) onSwitchModel(targetModelId);
      setSwitchStatus(`Switched successfully to lighter model! Memory pressure alleviated.`);
      setSmartSwitchAlert(null);
      setTimeout(() => setSwitchStatus(""), 4000);
    };

    const activeModel = models.find(m => m.id === activeModelId) || models[0];

    return h(
      "div",
      { className: "space-y-8 max-w-7xl mx-auto pb-12" },
      [
        // Header
        h(
          "div",
          { key: "header", className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4" },
          [
            h("div", { className: "space-y-1" }, [
              h("div", { className: "flex items-center space-x-2" }, [
                h(Icons.Radio, { size: 24, className: "text-emerald-400 animate-pulse" }),
                h("h1", { className: "text-2xl sm:text-3xl font-extrabold text-slate-100" }, "Live Performance Monitor & Smart Switch")
              ]),
              h("p", { className: "text-slate-400 text-sm" }, "Real-time hardware telemetry and automated graceful model degradation under memory pressure.")
            ]),
            h(
              "button",
              {
                onClick: () => setIsMonitoring(!isMonitoring),
                className: `px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  isMonitoring
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-slate-900 text-slate-400 border-slate-800"
                }`
              },
              isMonitoring ? "Telemetry Active (Polling)" : "Telemetry Paused"
            )
          ]
        ),

        // Live Telemetry Meters Grid
        h(
          "div",
          { key: "telemetry-grid", className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" },
          [
            // 1. Thread Responsiveness (FPS)
            h("div", { className: "glass-panel p-5 rounded-2xl border border-slate-800 space-y-2" }, [
              h("div", { className: "flex justify-between items-center text-xs font-semibold text-slate-400" }, [
                h("span", null, "Thread Responsiveness"),
                h(Icons.Activity, { size: 16, className: fps > 50 ? "text-emerald-400" : "text-amber-400" })
              ]),
              h("div", { className: "text-2xl font-bold font-mono text-slate-100" }, `${fps} FPS`),
              h("div", { className: "text-[11px] text-slate-500" }, "Main event loop latency")
            ]),

            // 2. Browser Memory Heap
            h("div", { className: "glass-panel p-5 rounded-2xl border border-slate-800 space-y-2" }, [
              h("div", { className: "flex justify-between items-center text-xs font-semibold text-slate-400" }, [
                h("span", null, "Browser Heap Memory"),
                h(Icons.MemoryStick, { size: 16, className: "text-cyan-400" })
              ]),
              heapMem?.isSupported
                ? h("div", null, [
                    h("div", { className: "text-2xl font-bold font-mono text-cyan-400" }, `${heapMem.usedMb} MB`),
                    h("div", { className: "text-[11px] text-slate-500 font-mono" }, `Limit: ${heapMem.limitMb} MB`)
                  ])
                : h("div", null, [
                    h("div", { className: "text-sm font-semibold text-slate-300" }, "Protected Sandbox"),
                    h("div", { className: "text-[10px] text-slate-500" }, "Browser privacy shield blocks heap query")
                  ])
            ]),

            // 3. Battery / Thermal State
            h("div", { className: "glass-panel p-5 rounded-2xl border border-slate-800 space-y-2" }, [
              h("div", { className: "flex justify-between items-center text-xs font-semibold text-slate-400" }, [
                h("span", null, "Battery & Power State"),
                h(batteryInfo?.charging ? Icons.BatteryCharging : Icons.Battery, { size: 16, className: batteryInfo?.charging ? "text-emerald-400" : "text-amber-400" })
              ]),
              batteryInfo?.isSupported
                ? h("div", null, [
                    h("div", { className: "text-2xl font-bold font-mono text-slate-100" }, `${batteryInfo.levelPct}%`),
                    h("div", { className: "text-[11px] text-slate-400" }, batteryInfo.charging ? "⚡ Charging (Max Performance)" : "On Battery Discharging")
                  ])
                : h("div", null, [
                    h("div", { className: "text-sm font-semibold text-slate-300" }, "API Shielded"),
                    h("div", { className: "text-[10px] text-slate-500" }, "navigator.getBattery unavailable")
                  ])
            ]),

            // 4. Physical RAM Allocation
            h("div", { className: "glass-panel p-5 rounded-2xl border border-slate-800 space-y-2" }, [
              h("div", { className: "flex justify-between items-center text-xs font-semibold text-slate-400" }, [
                h("span", null, "Active Model Footprint"),
                h(Icons.Cpu, { size: 16, className: "text-violet-400" })
              ]),
              h("div", { className: "text-2xl font-bold font-mono text-violet-400" }, activeModel?.parameters_display || "3.2B"),
              h("div", { className: "text-[11px] text-slate-500 font-mono" }, `Context: ${simulatedContextLength} tokens`)
            ])
          ]
        ),

        // SMART SWITCH ALERT MODAL / BANNER (Feature 2)
        smartSwitchAlert && h(
          "div",
          { key: "smart-switch-alert", className: "p-6 rounded-2xl bg-amber-950/40 border border-amber-500/60 shadow-xl space-y-4 glow-amber" },
          [
            h("div", { className: "flex items-start space-x-3" }, [
              h(Icons.AlertTriangle, { size: 22, className: "text-amber-400 shrink-0 mt-0.5" }),
              h("div", { className: "space-y-1" }, [
                h("div", { className: "text-xs font-bold text-amber-400 uppercase tracking-wider font-mono" }, "Smart Model Switch Recommended"),
                h("h3", { className: "text-lg font-bold text-slate-100" }, "Memory Pressure Detected: Graceful Fallback Available"),
                h("p", { className: "text-xs text-slate-300" }, smartSwitchAlert.reason)
              ])
            ]),

            // Fallback comparison card
            smartSwitchAlert.recommended_fallback && h(
              "div",
              { className: "bg-slate-900/90 rounded-xl p-4 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono" },
              [
                h("div", null, [
                  h("div", { className: "text-slate-500 text-[10px]" }, "Current Model"),
                  h("div", { className: "font-bold text-slate-200" }, smartSwitchAlert.current_model.name),
                  h("div", { className: "text-rose-400 text-[11px]" }, `RAM: ${smartSwitchAlert.current_model.active_ram_gb} GB`)
                ]),
                h("div", null, [
                  h("div", { className: "text-slate-500 text-[10px]" }, "Recommended Fallback"),
                  h("div", { className: "font-bold text-cyan-400" }, smartSwitchAlert.recommended_fallback.model.name),
                  h("div", { className: "text-emerald-400 text-[11px]" }, `Reclaims +${smartSwitchAlert.recommended_fallback.ram_saved_gb} GB RAM`)
                ]),
                h("div", null, [
                  h("div", { className: "text-slate-500 text-[10px]" }, "Speed Boost"),
                  h("div", { className: "font-bold text-emerald-400" }, `+${smartSwitchAlert.recommended_fallback.speed_gain_tok_s} tok/s`),
                  h("div", { className: "text-slate-400 text-[11px]" }, smartSwitchAlert.recommended_fallback.accuracy_tradeoff)
                ])
              ]
            ),

            // Consent Buttons
            h("div", { className: "flex flex-wrap items-center gap-3 pt-1" }, [
              h(
                "button",
                {
                  onClick: () => handleAcceptSwitch(smartSwitchAlert.recommended_fallback.model.id),
                  className: "px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20"
                },
                "Accept Switch & Preserve Session"
              ),
              h(
                "button",
                {
                  onClick: () => setSmartSwitchAlert(null),
                  className: "px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-800"
                },
                "Ignore & Risk Background Kill"
              )
            ])
          ]
        ),

        switchStatus && h(
          "div",
          { className: "p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-xs text-emerald-300 font-semibold animate-pulse flex items-center space-x-2" },
          [
            h(Icons.Check, { size: 16 }),
            h("span", null, switchStatus)
          ]
        ),

        // Stress Simulation Controls Card
        h(
          "div",
          { key: "stress-sim", className: "glass-panel-glow rounded-2xl p-6 space-y-6" },
          [
            h("div", null, [
              h("h2", { className: "text-lg font-bold text-slate-100 flex items-center space-x-2" }, [
                h(Icons.Sliders, { size: 18, className: "text-cyan-400" }),
                h("span", null, "Memory Pressure & Context Length Simulation")
              ]),
              h("p", { className: "text-xs text-slate-400 mt-1" }, "Simulate long-context conversational sessions (KV cache growth) to test automatic smart model switching.")
            ]),

            // Model Selector
            h("div", { className: "space-y-2" }, [
              h("label", { className: "text-xs font-semibold text-slate-300" }, "Active Loaded Model:"),
              h(
                "select",
                {
                  value: activeModelId,
                  onChange: (e) => setActiveModelId(e.target.value),
                  className: "w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono outline-none focus:border-cyan-400"
                },
                models.map(m => h("option", { key: m.id, value: m.id }, `${m.name} (${m.parameters_display})`))
              )
            ]),

            // Context Length Slider
            h("div", { className: "space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800" }, [
              h("div", { className: "flex justify-between items-center text-xs font-semibold" }, [
                h("span", { className: "text-slate-300" }, "Simulated Context Tokens:"),
                h("span", { className: "font-mono font-bold text-cyan-400" }, `${simulatedContextLength} tokens`)
              ]),
              h("input", {
                type: "range",
                min: "512",
                max: "16384",
                step: "512",
                value: simulatedContextLength,
                onChange: (e) => setSimulatedContextLength(parseInt(e.target.value)),
                className: "w-full"
              }),
              h("div", { className: "flex justify-between text-[10px] text-slate-500 font-mono" }, [
                h("span", null, "512 (Brief chat)"),
                h("span", null, "2048 (Standard)"),
                h("span", null, "8192 (Document analysis)"),
                h("span", null, "16384 (Massive memory load)")
              ])
            ])
          ]
        )
      ]
    );
  }

  window.LiveMonitor = LiveMonitor;
})();
