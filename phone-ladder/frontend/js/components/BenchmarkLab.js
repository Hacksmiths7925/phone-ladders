(function() {
  const { createElement: h, useState, useEffect } = React;
  const Icons = window.Icons;
  const BenchmarkEngine = window.BenchmarkEngine;

  function BenchmarkLab({ activeDevice, detectedHardware }) {
    const [benchmarkMode, setBenchmarkMode] = useState("browser"); // "browser" or "preset"
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState("");
    const [currentResult, setCurrentResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [saveStatus, setSaveStatus] = useState("");

    useEffect(() => {
      fetchHistory();
    }, []);

    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/benchmarks/history");
        const data = await res.json();
        setHistory(data || []);
      } catch (err) {
        console.error("Failed to load benchmark history:", err);
      }
    };

    const handleRunBenchmark = async () => {
      setIsRunning(true);
      setProgress(5);
      setStatusMessage("Starting benchmark suite...");
      setCurrentResult(null);
      setSaveStatus("");

      try {
        let result;
        if (benchmarkMode === "browser") {
          result = await BenchmarkEngine.runRealBrowserBenchmark((msg, pct) => {
            setStatusMessage(msg);
            setProgress(pct);
          });
          result.deviceName = detectedHardware?.deviceModelGuess || "Current Browser Hardware";
        } else {
          result = await BenchmarkEngine.runEmulatedBenchmark(activeDevice, (msg, pct) => {
            setStatusMessage(msg);
            setProgress(pct);
          });
          result.deviceName = activeDevice?.name || "Selected Smartphone";
        }

        setCurrentResult(result);
      } catch (err) {
        setStatusMessage("Benchmark failed: " + err.message);
      } finally {
        setIsRunning(false);
      }
    };

    const handleSaveBenchmark = async () => {
      if (!currentResult) return;
      setSaveStatus("Saving...");
      try {
        const payload = {
          device_name: currentResult.deviceName,
          is_real_browser: currentResult.isRealBrowser,
          ram_gb: benchmarkMode === "browser" ? (detectedHardware?.ramGb || 8.0) : (activeDevice?.ram_gb || 8.0),
          measured_compute_gflops: currentResult.measuredComputeGflops,
          measured_bandwidth_mbps: currentResult.measuredBandwidthMbps,
          measured_latency_ms: currentResult.measuredLatencyMs,
          estimated_token_rate_1b: currentResult.estimatedTokenRate1b,
          estimated_token_rate_3b: currentResult.estimatedTokenRate3b,
          estimated_token_rate_7b: currentResult.estimatedTokenRate7b,
          webgpu_supported: detectedHardware?.webGpuSupported || false,
          webgl_renderer: detectedHardware?.gpuRenderer || "Unknown",
          notes: currentResult.details?.notes || ""
        };

        const res = await fetch("/api/benchmarks/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setSaveStatus("Saved to SQLite Database!");
          fetchHistory();
          setTimeout(() => setSaveStatus(""), 3500);
        }
      } catch (err) {
        setSaveStatus("Failed to save benchmark run");
      }
    };

    return h(
      "div",
      { className: "space-y-8 max-w-7xl mx-auto pb-12" },
      [
        // Header
        h(
          "div",
          { key: "header", className: "space-y-2" },
          [
            h("div", { className: "flex items-center space-x-2" }, [
              h(Icons.Gauge, { size: 24, className: "text-cyan-400" }),
              h("h1", { className: "text-2xl sm:text-3xl font-extrabold text-slate-100" }, "Hardware Benchmark Lab")
            ]),
            h("p", { className: "text-slate-400 text-sm max-w-2xl" }, "Run live in-browser computational tests on your actual hardware, or run empirical architecture simulations on preset smartphone chipsets. Results are never fabricated and explicitly labeled.")
          ]
        ),

        // Mode Switcher Card
        h(
          "div",
          { key: "mode-switcher", className: "glass-panel rounded-2xl p-6 space-y-6" },
          [
            h("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4" }, [
              h("div", null, [
                h("h2", { className: "text-base font-bold text-slate-200" }, "Select Benchmark Mode:"),
                h("p", { className: "text-xs text-slate-400 mt-0.5" }, "Choose whether to measure your connected browser or simulate a preset phone.")
              ]),
              h("div", { className: "flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800" }, [
                h(
                  "button",
                  {
                    onClick: () => setBenchmarkMode("browser"),
                    className: `px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                      benchmarkMode === "browser"
                        ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                        : "text-slate-400 hover:text-slate-200"
                    }`
                  },
                  [
                    h(Icons.Activity, { size: 14 }),
                    h("span", null, "Live Browser Hardware Test")
                  ]
                ),
                h(
                  "button",
                  {
                    onClick: () => setBenchmarkMode("preset"),
                    className: `px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                      benchmarkMode === "preset"
                        ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                        : "text-slate-400 hover:text-slate-200"
                    }`
                  },
                  [
                    h(Icons.Smartphone, { size: 14 }),
                    h("span", null, "Emulate Preset Phone")
                  ]
                )
              ])
            ]),

            // Mode Explanation Banner
            h(
              "div",
              {
                className: `p-4 rounded-xl border flex items-start space-x-3 ${
                  benchmarkMode === "browser"
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                    : "bg-amber-950/20 border-amber-500/30 text-amber-200"
                }`
              },
              [
                h(benchmarkMode === "browser" ? Icons.Shield : Icons.Info, { size: 20, className: "shrink-0 mt-0.5" }),
                h("div", { className: "text-xs space-y-1" }, [
                  h("div", { className: "font-bold uppercase tracking-wider" },
                    benchmarkMode === "browser"
                      ? "Direct Hardware Measurement (Real Execution)"
                      : "Empirical Hardware Emulation (Chipset Specifications)"
                  ),
                  h("p", { className: "opacity-85 text-[11px]" },
                    benchmarkMode === "browser"
                      ? "Executes actual 40MB memory streaming passes, 220x220 FP32 GEMM matrix math kernels, and JS thread latency checks. Reports real measured throughput."
                      : `Calculates empirical performance for ${activeDevice?.name} based on its ${activeDevice?.soc} memory bus width (${activeDevice?.memory_bandwidth_gbps} GB/s) and NPU TOPS.`
                  )
                ])
              ]
            ),

            // Benchmark Run Trigger Button & Progress Bar
            h("div", { className: "space-y-4 pt-2" }, [
              h(
                "button",
                {
                  onClick: handleRunBenchmark,
                  disabled: isRunning,
                  className: `w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center space-x-2 ${
                    isRunning
                      ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-lg shadow-cyan-500/25 transform hover:-translate-y-0.5"
                  }`
                },
                [
                  h(Icons.Play, { size: 16 }),
                  h("span", null, isRunning ? "Running Computation Test..." : `Start Benchmark (${benchmarkMode === "browser" ? "Live Hardware" : activeDevice?.name})`)
                ]
              ),

              // Progress Bar & Logs
              (isRunning || statusMessage) && h("div", { className: "space-y-2" }, [
                h("div", { className: "flex justify-between items-center text-xs text-slate-400 font-mono" }, [
                  h("span", { className: "truncate max-w-[80%]" }, statusMessage),
                  h("span", { className: "font-bold text-cyan-400" }, `${progress}%`)
                ]),
                h(
                  "div",
                  { className: "h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800" },
                  h("div", {
                    style: { width: `${progress}%` },
                    className: "h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-300"
                  })
                )
              ])
            ])
          ]
        ),

        // Results Section
        currentResult && h(
          "div",
          { key: "results-panel", className: "glass-panel-glow rounded-2xl p-6 sm:p-8 space-y-6" },
          [
            // Result Header with Badge
            h("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3" }, [
              h("div", null, [
                h("div", { className: "flex items-center space-x-2" }, [
                  h(
                    "span",
                    {
                      className: `px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider flex items-center space-x-1.5 ${
                        currentResult.isRealBrowser
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 glow-emerald"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                      }`
                    },
                    [
                      h("span", { className: `w-2 h-2 rounded-full ${currentResult.isRealBrowser ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}` }),
                      h("span", null, currentResult.badgeText)
                    ]
                  )
                ]),
                h("h2", { className: "text-xl font-bold text-slate-100 mt-2" }, currentResult.deviceName)
              ]),

              // Save Action
              h("div", { className: "flex items-center space-x-3" }, [
                h(
                  "button",
                  {
                    onClick: handleSaveBenchmark,
                    className: "px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors"
                  },
                  [
                    h(Icons.Bookmark, { size: 14, className: "text-cyan-400" }),
                    h("span", null, "Save to Database")
                  ]
                ),
                saveStatus && h("span", { className: "text-xs font-semibold text-emerald-400 animate-pulse" }, saveStatus)
              ])
            ]),

            // Key Measured Metrics Grid
            h("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" }, [
              h("div", { className: "bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-1" }, [
                h("div", { className: "text-xs text-slate-400 font-semibold" }, "Compute Performance"),
                h("div", { className: "text-2xl font-bold font-mono text-cyan-400" }, `${currentResult.measuredComputeGflops} GFLOPS`),
                h("div", { className: "text-[11px] text-slate-500" }, "FP32 GEMM throughput")
              ]),
              h("div", { className: "bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-1" }, [
                h("div", { className: "text-xs text-slate-400 font-semibold" }, "Memory Throughput"),
                h("div", { className: "text-2xl font-bold font-mono text-emerald-400" }, `${currentResult.measuredBandwidthMbps} MB/s`),
                h("div", { className: "text-[11px] text-slate-500" }, "Stream buffer read/write")
              ]),
              h("div", { className: "bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-1" }, [
                h("div", { className: "text-xs text-slate-400 font-semibold" }, "Dispatch Latency"),
                h("div", { className: "text-2xl font-bold font-mono text-violet-400" }, `${currentResult.measuredLatencyMs} ms`),
                h("div", { className: "text-[11px] text-slate-500" }, "Average thread turnaround")
              ])
            ]),

            // Derived Token Rates Grid
            h("div", { className: "space-y-3 pt-2" }, [
              h("h3", { className: "text-sm font-bold text-slate-200" }, "Projected Real Generation Throughput:"),
              h("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" }, [
                h("div", { className: "bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between" }, [
                  h("div", null, [
                    h("div", { className: "text-xs font-bold text-slate-300" }, "1B Class (Llama / Qwen)"),
                    h("div", { className: "text-[11px] text-slate-500" }, "Q4 Quant (~0.8 GB)")
                  ]),
                  h("div", { className: "text-xl font-mono font-bold text-emerald-400" }, `~${currentResult.estimatedTokenRate1b} tok/s`)
                ]),
                h("div", { className: "bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between" }, [
                  h("div", null, [
                    h("div", { className: "text-xs font-bold text-slate-300" }, "3B Class (Llama / Phi-3.5)"),
                    h("div", { className: "text-[11px] text-slate-500" }, "Q4 Quant (~2.0 GB)")
                  ]),
                  h("div", { className: "text-xl font-mono font-bold text-cyan-400" }, `~${currentResult.estimatedTokenRate3b} tok/s`)
                ]),
                h("div", { className: "bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between" }, [
                  h("div", null, [
                    h("div", { className: "text-xs font-bold text-slate-300" }, "7B Class (Qwen / DeepSeek)"),
                    h("div", { className: "text-[11px] text-slate-500" }, "Q4 Quant (~4.5 GB)")
                  ]),
                  h("div", { className: "text-xl font-mono font-bold text-violet-400" }, `~${currentResult.estimatedTokenRate7b} tok/s`)
                ])
              ])
            ]),

            // Kernel Details Note
            h("div", { className: "text-[11px] text-slate-500 border-t border-slate-800/80 pt-3" }, [
              h("span", { className: "font-semibold text-slate-400" }, "Kernel Specs: "),
              `${currentResult.details?.memoryTested || ""} • ${currentResult.details?.computeKernel || ""} • ${currentResult.details?.notes || ""}`
            ])
          ]
        ),

        // Historical Benchmark Runs Table
        h(
          "div",
          { key: "history-panel", className: "glass-panel rounded-2xl p-6 sm:p-8 space-y-4" },
          [
            h("div", { className: "flex justify-between items-center" }, [
              h("h2", { className: "text-lg font-bold text-slate-100 flex items-center space-x-2" }, [
                h(Icons.BarChart3, { size: 18, className: "text-cyan-400" }),
                h("span", null, "Benchmark Run History (SQLite)")
              ]),
              h("span", { className: "text-xs text-slate-500 font-mono" }, `${history.length} records saved`)
            ]),

            history.length === 0
              ? h("p", { className: "text-xs text-slate-500 py-4 text-center" }, "No benchmark runs saved yet. Run a test above and save it!")
              : h(
                  "div",
                  { className: "overflow-x-auto" },
                  h(
                    "table",
                    { className: "w-full text-left text-xs font-mono" },
                    [
                      h("thead", null, h("tr", { className: "border-b border-slate-800 text-slate-400" }, [
                        h("th", { className: "py-2.5 px-3 font-semibold" }, "Device"),
                        h("th", { className: "py-2.5 px-3 font-semibold" }, "Mode"),
                        h("th", { className: "py-2.5 px-3 font-semibold text-right" }, "Compute"),
                        h("th", { className: "py-2.5 px-3 font-semibold text-right" }, "Memory"),
                        h("th", { className: "py-2.5 px-3 font-semibold text-right" }, "1B tok/s"),
                        h("th", { className: "py-2.5 px-3 font-semibold text-right" }, "3B tok/s"),
                        h("th", { className: "py-2.5 px-3 font-semibold text-right" }, "Time")
                      ])),
                      h("tbody", { className: "divide-y divide-slate-800/60" }, history.map(r => h(
                        "tr",
                        { key: r.id, className: "hover:bg-slate-900/40" },
                        [
                          h("td", { className: "py-2.5 px-3 font-bold text-slate-200" }, r.device_name),
                          h("td", { className: "py-2.5 px-3" }, [
                            h(
                              "span",
                              {
                                className: `px-1.5 py-0.5 rounded text-[10px] ${
                                  r.is_real_browser
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : "bg-amber-500/20 text-amber-300"
                                }`
                              },
                              r.is_real_browser ? "REAL LIVE" : "SIMULATED"
                            )
                          ]),
                          h("td", { className: "py-2.5 px-3 text-right text-cyan-400" }, `${r.measured_compute_gflops} GFLOPS`),
                          h("td", { className: "py-2.5 px-3 text-right text-emerald-400" }, `${r.measured_bandwidth_mbps} MB/s`),
                          h("td", { className: "py-2.5 px-3 text-right font-bold text-slate-200" }, `${r.estimated_token_rate_1b}`),
                          h("td", { className: "py-2.5 px-3 text-right font-bold text-slate-200" }, `${r.estimated_token_rate_3b}`),
                          h("td", { className: "py-2.5 px-3 text-right text-slate-500" }, (r.created_at || "").split("T")[0])
                        ]
                      )))
                    ]
                  )
                )
          ]
        )
      ]
    );
  }

  window.BenchmarkLab = BenchmarkLab;
})();
