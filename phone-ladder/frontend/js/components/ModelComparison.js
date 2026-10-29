(function() {
  const { createElement: h, useState, useEffect } = React;
  const Icons = window.Icons;

  function ModelComparison({
    models,
    activeDevice,
    selectedCompareIds,
    onToggleCompare,
    onClearCompare
  }) {
    const [compareData, setCompareData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Default to comparing 3 representative models if nothing selected
    const activeIds = selectedCompareIds.length > 0
      ? selectedCompareIds
      : ["llama-3.2-1b-instruct", "llama-3.2-3b-instruct", "qwen2.5-7b-instruct"];

    useEffect(() => {
      fetchComparison();
    }, [activeIds.join(","), activeDevice?.ram_gb, activeDevice?.soc]);

    const fetchComparison = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model_ids: activeIds,
            device_ram_gb: activeDevice?.ram_gb || 8.0,
            device_storage_gb: activeDevice?.storage_free_gb || 40.0,
            soc: activeDevice?.soc || "Snapdragon 8 Gen 3"
          })
        });
        const data = await res.json();
        setCompareData(data.compared_models || []);
      } catch (err) {
        console.error("Failed to fetch comparison:", err);
      } finally {
        setLoading(false);
      }
    };

    const devRam = activeDevice?.ram_gb || 8.0;

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
                h(Icons.Scale, { size: 24, className: "text-cyan-400" }),
                h("h1", { className: "text-2xl sm:text-3xl font-extrabold text-slate-100" }, "Model Comparison Matrix")
              ]),
              h("p", { className: "text-slate-400 text-sm" }, `Evaluating ${compareData.length} models side-by-side against your ${activeDevice?.name || "Active Device"} (${devRam} GB RAM).`)
            ]),
            selectedCompareIds.length > 0 && h(
              "button",
              {
                onClick: onClearCompare,
                className: "self-start sm:self-center px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-300 transition-colors"
              },
              "Reset Selection"
            )
          ]
        ),

        // Quick Model Selection Bar
        h(
          "div",
          { key: "selector-bar", className: "glass-panel rounded-2xl p-4 flex flex-wrap items-center gap-2" },
          [
            h("span", { className: "text-xs font-semibold text-slate-400 mr-2" }, "Comparing:"),
            models.map(m => {
              const isSelected = activeIds.includes(m.id);
              return h(
                "button",
                {
                  key: m.id,
                  onClick: () => onToggleCompare(m.id),
                  className: `px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? "bg-violet-600 text-white font-bold shadow-md shadow-violet-500/25"
                      : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200"
                  }`
                },
                [
                  isSelected && h(Icons.Check, { size: 12 }),
                  h("span", null, m.name)
                ]
              );
            })
          ]
        ),

        // VISUALIZER 1: Interactive Memory Allocation vs Phone RAM
        h(
          "div",
          { key: "chart-memory", className: "glass-panel-glow rounded-2xl p-6 sm:p-8 space-y-6" },
          [
            h("div", { className: "flex justify-between items-center" }, [
              h("div", null, [
                h("h2", { className: "text-lg font-bold text-slate-100 flex items-center space-x-2" }, [
                  h(Icons.MemoryStick, { size: 18, className: "text-cyan-400" }),
                  h("span", null, "Memory Allocation Breakdown vs Total Phone RAM")
                ]),
                h("p", { className: "text-xs text-slate-400 mt-1" }, `Threshold reference: ${devRam} GB total device RAM. Models exceeding this threshold risk OS termination.`)
              ]),
              h("div", { className: "hidden sm:flex items-center space-x-4 text-xs font-mono" }, [
                h("div", { className: "flex items-center space-x-1" }, [
                  h("span", { className: "w-3 h-3 rounded-sm bg-cyan-500" }),
                  h("span", { className: "text-slate-300" }, "Model Weights")
                ]),
                h("div", { className: "flex items-center space-x-1" }, [
                  h("span", { className: "w-3 h-3 rounded-sm bg-violet-500" }),
                  h("span", { className: "text-slate-300" }, "KV Cache & Overhead")
                ]),
                h("div", { className: "flex items-center space-x-1" }, [
                  h("span", { className: "w-3 h-3 rounded-sm bg-rose-500" }),
                  h("span", { className: "text-slate-300" }, "OS Reserve")
                ])
              ])
            ]),

            // Stacked Bar Visualizer
            h(
              "div",
              { className: "space-y-4" },
              compareData.map(item => {
                const m = item.model;
                const met = item.metrics;
                const maxScale = Math.max(devRam * 1.15, met.total_active_ram_gb + met.os_reserved_ram_gb);
                
                const weightsPct = (met.file_size_gb / maxScale) * 100;
                const kvOverheadPct = ((met.kv_cache_gb + met.runtime_overhead_gb) / maxScale) * 100;
                const osPct = (met.os_reserved_ram_gb / maxScale) * 100;
                const isOverLimit = (met.total_active_ram_gb + met.os_reserved_ram_gb) > devRam;

                return h(
                  "div",
                  { key: m.id, className: "space-y-1.5" },
                  [
                    h("div", { className: "flex justify-between items-center text-xs" }, [
                      h("span", { className: "font-bold text-slate-200" }, `${m.name} (${m.parameters_display})`),
                      h("div", { className: "space-x-2 font-mono" }, [
                        h("span", { className: "text-cyan-400 font-bold" }, `${met.total_active_ram_gb} GB needed`),
                        h(
                          "span",
                          { className: isOverLimit ? "text-rose-400 font-bold" : "text-emerald-400" },
                          isOverLimit ? "• EXCEEDS RAM (OOM)" : `• ${met.ram_headroom_gb} GB cushion`
                        )
                      ])
                    ]),

                    // Bar track
                    h(
                      "div",
                      { className: "h-6 w-full rounded-xl bg-slate-900 border border-slate-800 flex overflow-hidden relative" },
                      [
                        // Weights segment
                        h("div", {
                          style: { width: `${weightsPct}%` },
                          className: "h-full bg-cyan-500/80 border-r border-cyan-400/50 flex items-center justify-center text-[10px] font-mono font-bold text-slate-950 truncate px-1",
                          title: `Weights: ${met.file_size_gb} GB`
                        }, `${met.file_size_gb}G`),
                        // KV & Runtime overhead segment
                        h("div", {
                          style: { width: `${kvOverheadPct}%` },
                          className: "h-full bg-violet-600/80 border-r border-violet-400/50 flex items-center justify-center text-[10px] font-mono font-bold text-white truncate px-1",
                          title: `KV + Overhead: ${Math.round((met.kv_cache_gb + met.runtime_overhead_gb) * 10)/10} GB`
                        }, "KV"),
                        // OS Reserve segment
                        h("div", {
                          style: { width: `${osPct}%` },
                          className: "h-full bg-rose-500/40 border-r border-rose-400/30 flex items-center justify-center text-[10px] font-mono text-rose-200 truncate px-1",
                          title: `OS Reserve: ${met.os_reserved_ram_gb} GB`
                        }, "OS")
                      ]
                    )
                  ]
                );
              })
            )
          ]
        ),

        // VISUALIZER 2: Generation Speed (tok/s) Bar Chart
        h(
          "div",
          { key: "chart-speed", className: "glass-panel rounded-2xl p-6 sm:p-8 space-y-6" },
          [
            h("div", null, [
              h("h2", { className: "text-lg font-bold text-slate-100 flex items-center space-x-2" }, [
                h(Icons.Zap, { size: 18, className: "text-emerald-400" }),
                h("span", null, "Autoregressive Token Generation Speed (tokens/sec)")
              ]),
              h("p", { className: "text-xs text-slate-400 mt-1" }, `Derived from ${activeDevice?.memory_bandwidth_gbps || 34} GB/s memory bandwidth & NPU acceleration factor.`)
            ]),

            h(
              "div",
              { className: "space-y-4" },
              compareData.map(item => {
                const m = item.model;
                const speed = item.metrics.gen_tokens_sec;
                const maxSpeed = Math.max(...compareData.map(d => d.metrics.gen_tokens_sec), 35.0);
                const pct = (speed / maxSpeed) * 100;

                return h(
                  "div",
                  { key: m.id, className: "space-y-1.5" },
                  [
                    h("div", { className: "flex justify-between items-center text-xs" }, [
                      h("span", { className: "font-semibold text-slate-300" }, m.name),
                      h("span", { className: "font-mono font-bold text-emerald-400 text-sm" }, `${speed} tok/s`)
                    ]),
                    h(
                      "div",
                      { className: "h-3.5 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800" },
                      h("div", {
                        style: { width: `${pct}%` },
                        className: "h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                      })
                    )
                  ]
                );
              })
            )
          ]
        ),

        // VISUALIZER 3: Intelligence & Capabilities Matrix
        h(
          "div",
          { key: "chart-benchmarks", className: "glass-panel rounded-2xl p-6 sm:p-8 space-y-6" },
          [
            h("div", null, [
              h("h2", { className: "text-lg font-bold text-slate-100 flex items-center space-x-2" }, [
                h(Icons.Award, { size: 18, className: "text-amber-400" }),
                h("span", null, "Empirical Benchmark Accuracy Scores")
              ]),
              h("p", { className: "text-xs text-slate-400 mt-1" }, "Verified test benchmark results across MMLU, GSM8K (Math), and HumanEval (Code).")
            ]),

            h(
              "div",
              { className: "overflow-x-auto" },
              h(
                "table",
                { className: "w-full text-left text-xs font-mono" },
                [
                  h("thead", null, h("tr", { className: "border-b border-slate-800 text-slate-400" }, [
                    h("th", { className: "py-3 px-4 font-semibold" }, "Model"),
                    h("th", { className: "py-3 px-4 font-semibold text-center text-amber-400" }, "MMLU (General)"),
                    h("th", { className: "py-3 px-4 font-semibold text-center text-cyan-400" }, "GSM8K (Math)"),
                    h("th", { className: "py-3 px-4 font-semibold text-center text-violet-400" }, "HumanEval (Code)"),
                    h("th", { className: "py-3 px-4 font-semibold text-center text-emerald-400" }, "MT-Bench")
                  ])),
                  h("tbody", { className: "divide-y divide-slate-800/60" }, compareData.map(item => {
                    const m = item.model;
                    return h("tr", { key: m.id, className: "hover:bg-slate-900/40" }, [
                      h("td", { className: "py-3 px-4 font-bold text-slate-200" }, m.name),
                      h("td", { className: "py-3 px-4 text-center font-bold text-amber-300" }, `${m.mmlu_score}%`),
                      h("td", { className: "py-3 px-4 text-center font-bold text-cyan-300" }, `${m.gsm8k_score}%`),
                      h("td", { className: "py-3 px-4 text-center font-bold text-violet-300" }, `${m.humaneval_score}%`),
                      h("td", { className: "py-3 px-4 text-center font-bold text-emerald-300" }, `${m.mt_bench_score} / 10`)
                    ]);
                  }))
                ]
              )
            )
          ]
        ),

        // Side-by-Side Detailed Specs Table
        h(
          "div",
          { key: "table-specs", className: "glass-panel rounded-2xl p-6 sm:p-8 space-y-4" },
          [
            h("h2", { className: "text-lg font-bold text-slate-100" }, "Full Architectural Comparison"),
            h(
              "div",
              { className: "overflow-x-auto" },
              h(
                "table",
                { className: "w-full text-left text-xs" },
                [
                  h("thead", null, h("tr", { className: "border-b border-slate-800 text-slate-400" }, [
                    h("th", { className: "py-3 px-4 font-semibold" }, "Feature / Spec"),
                    ...compareData.map(d => h("th", { key: d.model.id, className: "py-3 px-4 font-bold text-slate-100" }, d.model.name))
                  ])),
                  h("tbody", { className: "divide-y divide-slate-800/60" }, [
                    h("tr", null, [
                      h("td", { className: "py-3 px-4 text-slate-400 font-semibold" }, "Parameters"),
                      ...compareData.map(d => h("td", { key: d.model.id, className: "py-3 px-4 font-mono font-bold text-cyan-400" }, d.model.parameters_display))
                    ]),
                    h("tr", null, [
                      h("td", { className: "py-3 px-4 text-slate-400 font-semibold" }, "Context Length"),
                      ...compareData.map(d => h("td", { key: d.model.id, className: "py-3 px-4 font-mono text-slate-300" }, `${d.model.context_length.toLocaleString()} tokens`))
                    ]),
                    h("tr", null, [
                      h("td", { className: "py-3 px-4 text-slate-400 font-semibold" }, "Storage Download"),
                      ...compareData.map(d => h("td", { key: d.model.id, className: "py-3 px-4 font-mono text-slate-300" }, `${d.metrics.file_size_gb} GB`))
                    ]),
                    h("tr", null, [
                      h("td", { className: "py-3 px-4 text-slate-400 font-semibold" }, "Active RAM Footprint"),
                      ...compareData.map(d => h("td", { key: d.model.id, className: "py-3 px-4 font-mono font-bold text-violet-400" }, `${d.metrics.total_active_ram_gb} GB`))
                    ]),
                    h("tr", null, [
                      h("td", { className: "py-3 px-4 text-slate-400 font-semibold" }, "Compatibility Status"),
                      ...compareData.map(d => h("td", { key: d.model.id, className: "py-3 px-4 font-bold" }, [
                        h(
                          "span",
                          {
                            className: `px-2 py-0.5 rounded text-[10px] ${
                              d.metrics.status === "PERFECT_FIT" || d.metrics.status === "GOOD_FIT"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : d.metrics.status === "TIGHT_FIT"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            }`
                          },
                          d.metrics.status_label
                        )
                      ]))
                    ]),
                    h("tr", null, [
                      h("td", { className: "py-3 px-4 text-slate-400 font-semibold" }, "Primary Mobile Runner"),
                      ...compareData.map(d => h("td", { key: d.model.id, className: "py-3 px-4 text-slate-300" }, d.model.recommended_runtimes[0] || "WebLLM"))
                    ]),
                    h("tr", null, [
                      h("td", { className: "py-3 px-4 text-slate-400 font-semibold" }, "License"),
                      ...compareData.map(d => h("td", { key: d.model.id, className: "py-3 px-4 font-mono text-slate-400" }, d.model.license))
                    ])
                  ])
                ]
              )
            )
          ]
        )
      ]
    );
  }

  window.ModelComparison = ModelComparison;
})();
