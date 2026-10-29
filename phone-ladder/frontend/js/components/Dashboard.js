(function() {
  const { createElement: h, useState } = React;
  const Icons = window.Icons;

  function Dashboard({
    activeDevice,
    recommendationsData,
    onNavigate,
    onSelectModelForDetails,
    onToggleCompare,
    selectedCompareIds,
    onOpenScanModal
  }) {
    const [selectedLadderTier, setSelectedLadderTier] = useState(null);

    const device = activeDevice || {
      name: "Snapdragon 8 Gen 3 Flagship",
      ram_gb: 12.0,
      storage_free_gb: 64.0,
      soc: "Snapdragon 8 Gen 3",
      npu_tops: 45.0,
      memory_bandwidth_gbps: 77.0,
      os: "Android"
    };

    const ladderTierInfo = recommendationsData?.ladder_tier || {
      tier: device.ram_gb >= 15 ? 5 : device.ram_gb >= 11 ? 4 : device.ram_gb >= 7 ? 3 : device.ram_gb >= 4 ? 2 : 1,
      tier_name: "Tier 3: Power Edge",
      desc: "Robust 3B - 4B parameter models.",
      max_params: "4B"
    };

    const topPicks = recommendationsData?.top_picks || [];

    const ladderTiers = [
      {
        tier: 5,
        name: "Tier 5: Frontier Mobile",
        params: "14B+",
        ramReq: "16GB - 24GB RAM",
        desc: "Elite frontier LLMs for multi-hop math, complex coding, and zero-shot reasoning.",
        models: ["Qwen 2.5 14B"],
        color: "from-pink-500/20 to-rose-500/10",
        borderColor: "border-pink-500/30",
        accent: "text-pink-400"
      },
      {
        tier: 4,
        name: "Tier 4: Pro Workstation",
        params: "7B - 9B",
        ramReq: "12GB - 16GB RAM",
        desc: "Desktop-grade intelligence, multimodal vision-language models, and deep reasoning.",
        models: ["Qwen 2.5 7B", "DeepSeek R1 7B", "Gemma 2 9B", "MiniCPM-V 2.6"],
        color: "from-purple-500/20 to-indigo-500/10",
        borderColor: "border-purple-500/30",
        accent: "text-purple-400"
      },
      {
        tier: 3,
        name: "Tier 3: Power Edge",
        params: "3B - 4B",
        ramReq: "8GB RAM",
        desc: "The golden sweet spot for modern phones. Crisp natural conversation and code synthesis.",
        models: ["Llama 3.2 3B", "Qwen 2.5 3B", "Phi-3.5 Mini 3.8B"],
        color: "from-cyan-500/20 to-blue-500/10",
        borderColor: "border-cyan-500/30",
        accent: "text-cyan-400"
      },
      {
        tier: 2,
        name: "Tier 2: Pocket Flagship",
        params: "1B - 2.5B",
        ramReq: "4GB - 6GB RAM",
        desc: "Fast, battery-efficient conversational models. Runs smoothly alongside regular phone apps.",
        models: ["Llama 3.2 1B", "Qwen 2.5 1.5B", "DeepSeek R1 1.5B", "Gemma 2 2B"],
        color: "from-emerald-500/20 to-teal-500/10",
        borderColor: "border-emerald-500/30",
        accent: "text-emerald-400"
      },
      {
        tier: 1,
        name: "Tier 1: Micro Edge",
        params: "100M - 500M",
        ramReq: "2GB - 3GB RAM",
        desc: "Ultra-compact edge models with near-instant tokens/sec. Runs on virtually any smartphone.",
        models: ["SmolLM2 135M", "SmolLM2 360M", "Qwen 2.5 0.5B"],
        color: "from-amber-500/20 to-yellow-500/10",
        borderColor: "border-amber-500/30",
        accent: "text-amber-400"
      }
    ];

    const advancedFeatureCards = [
      { id: "monitor", title: "Live Monitor & Smart Switch", desc: "Telemetry HUD & graceful fallback on memory pressure", icon: Icons.Radio, color: "text-emerald-400", badge: "Live Sensors" },
      { id: "offline", title: "Offline AI Mode", desc: "Download & run on-device inference without internet", icon: Icons.HardDrive, color: "text-cyan-400", badge: "0KB Data" },
      { id: "leaderboard", title: "Community Leaderboard", desc: "Compare verified smartphone benchmark scores", icon: Icons.Globe, color: "text-violet-400", badge: "Verified Runs" },
      { id: "storage", title: "Smart Storage Manager", desc: "Pre-download space feasibility & cache manager", icon: Icons.Download, color: "text-amber-400", badge: "Safety Advisor" },
      { id: "quality", title: "Bilingual Quality Test", desc: "Evaluate models on Hindi & English prompts", icon: Icons.Languages, color: "text-pink-400", badge: "🇮🇳 / 🇬🇧 Benchmark" },
      { id: "privacy", title: "Privacy Center", desc: "Data transparency matrix & 1-click database wipe", icon: Icons.Lock, color: "text-blue-400", badge: "Zero Tracking" },
    ];

    return h(
      "div",
      { className: "space-y-8 max-w-7xl mx-auto pb-12" },
      [
        // 1. One-Tap Device Scan Callout Banner
        h(
          "div",
          {
            key: "one-tap-banner",
            className: "p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/60 via-slate-900/80 to-cyan-950/60 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-cyan-500/10"
          },
          [
            h("div", { className: "flex items-center space-x-3.5" }, [
              h("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/25" }, [
                h(Icons.Zap, { size: 20, color: "#fff" })
              ]),
              h("div", null, [
                h("h3", { className: "text-sm sm:text-base font-extrabold text-slate-100 flex items-center space-x-2" }, [
                  h("span", null, "Instant Hardware Audit Available"),
                  h("span", { className: "px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30" }, "NEW")
                ]),
                h("p", { className: "text-xs text-slate-400 mt-0.5" }, "Run a complete 1-tap browser scan of memory, battery, WebGPU, and storage quotas.")
              ])
            ]),
            h(
              "button",
              {
                onClick: onOpenScanModal,
                className: "px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold shadow-md shadow-cyan-500/25 transition-all self-start sm:self-center shrink-0"
              },
              "Start 1-Tap Device Scan →"
            )
          ]
        ),

        // 2. Device Hero Overview Card
        h(
          "div",
          { key: "hero-device", className: "glass-panel-glow rounded-2xl p-6 sm:p-8 relative overflow-hidden" },
          [
            h("div", { key: "bg-glow", className: "absolute -right-16 -top-16 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" }),
            h("div", { key: "bg-glow-2", className: "absolute -left-16 -bottom-16 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" }),

            h(
              "div",
              { key: "hero-content", className: "relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6" },
              [
                h(
                  "div",
                  { key: "device-details", className: "space-y-3" },
                  [
                    h(
                      "div",
                      { key: "tag-row", className: "flex items-center space-x-2" },
                      [
                        h("span", { key: "badge-os", className: "px-2.5 py-1 rounded-md text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono" }, device.os),
                        h("span", { key: "badge-status", className: "flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" }, [
                          h("span", { key: "dot", className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }),
                          h("span", { key: "text" }, "Active Device Profile")
                        ])
                      ]
                    ),
                    h("h1", { key: "device-name", className: "text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight" }, device.name),
                    h(
                      "div",
                      { key: "soc-row", className: "flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-300" },
                      [
                        h("span", { key: "soc", className: "flex items-center space-x-1" }, [
                          h(Icons.Cpu, { size: 16, className: "text-cyan-400" }),
                          h("span", { className: "font-medium" }, device.soc)
                        ]),
                        h("span", { key: "bw", className: "text-slate-400" }, `• ${device.memory_bandwidth_gbps || 34} GB/s Bus`),
                        h("span", { key: "npu", className: "text-slate-400" }, `• ${device.npu_tops || 0} TOPS NPU`)
                      ]
                    )
                  ]
                ),

                h(
                  "div",
                  { key: "hero-actions", className: "flex flex-wrap sm:flex-nowrap gap-3" },
                  [
                    h(
                      "button",
                      {
                        key: "btn-change",
                        onClick: () => onNavigate("analyzer"),
                        className: "flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-sm font-semibold text-slate-200 border border-slate-700 hover:border-slate-500 transition-all shadow-sm"
                      },
                      [
                        h(Icons.Smartphone, { size: 16, className: "text-cyan-400" }),
                        h("span", null, "Switch Phone")
                      ]
                    ),
                    h(
                      "button",
                      {
                        key: "btn-bench",
                        onClick: () => onNavigate("benchmark"),
                        className: "flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
                      },
                      [
                        h(Icons.Gauge, { size: 16 }),
                        h("span", null, "Run Benchmark")
                      ]
                    )
                  ]
                )
              ]
            ),

            // Quick Stats Ribbon inside hero
            h(
              "div",
              { key: "hero-stats-grid", className: "mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80" },
              [
                { label: "Total Physical RAM", val: `${device.ram_gb} GB`, sub: "LPDDR5 / LPDDR5X", icon: Icons.MemoryStick, color: "text-cyan-400" },
                { label: "Max Safe Tier", val: ladderTierInfo.tier_name.split(":")[0], sub: `Up to ${ladderTierInfo.max_params}`, icon: Icons.TrendingUp, color: "text-violet-400" },
                { label: "Free Storage", val: `${device.storage_free_gb || 40} GB`, sub: "Model Storage Space", icon: Icons.HardDrive, color: "text-emerald-400" },
                { label: "Optimal Quant", val: "Q4_K_M (4-bit)", sub: "Balanced RAM & PPL", icon: Icons.Shield, color: "text-amber-400" }
              ].map((s, idx) => h(
                "div",
                { key: idx, className: "bg-slate-900/60 rounded-xl p-3.5 border border-slate-800/60" },
                [
                  h("div", { key: "ic-row", className: "flex items-center justify-between mb-1" }, [
                    h("span", { className: "text-[11px] font-medium text-slate-400 uppercase tracking-wider" }, s.label),
                    h(s.icon, { size: 16, className: s.color })
                  ]),
                  h("div", { key: "val", className: "text-lg font-bold font-mono-numbers text-slate-100" }, s.val),
                  h("div", { key: "sub", className: "text-[11px] text-slate-400" }, s.sub)
                ]
              ))
            )
          ]
        ),

        // 3. The Phone Ladder Visualizer
        h(
          "div",
          { key: "ladder-section", className: "glass-panel rounded-2xl p-6 sm:p-8 space-y-6" },
          [
            h(
              "div",
              { key: "ladder-header", className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2" },
              [
                h("div", null, [
                  h("div", { className: "flex items-center space-x-2" }, [
                    h(Icons.Layers, { size: 20, className: "text-cyan-400" }),
                    h("h2", { className: "text-xl font-bold text-slate-100" }, "The Phone Ladder")
                  ]),
                  h("p", { className: "text-sm text-slate-400 mt-1" }, "On-device model weight categories and your phone's maximum capability threshold.")
                ]),
                h(
                  "div",
                  { className: "flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-xs text-cyan-300 font-mono" },
                  [
                    h("span", null, "Your Phone Capacity:"),
                    h("span", { className: "font-bold text-cyan-400" }, ladderTierInfo.tier_name)
                  ]
                )
              ]
            ),

            // Ladder Rungs Stack
            h(
              "div",
              { key: "ladder-rungs", className: "space-y-3" },
              ladderTiers.map(t => {
                const isCurrentCapacity = t.tier === ladderTierInfo.tier;
                const isSupported = t.tier <= ladderTierInfo.tier;

                return h(
                  "div",
                  {
                    key: t.tier,
                    onClick: () => setSelectedLadderTier(selectedLadderTier === t.tier ? null : t.tier),
                    className: `rounded-xl p-4 transition-all cursor-pointer ${
                      isCurrentCapacity
                        ? "ladder-rung-active"
                        : isSupported
                        ? "bg-slate-900/60 border border-slate-800/80 hover:border-slate-700"
                        : "opacity-60 bg-slate-950/40 border border-slate-900"
                    }`
                  },
                  [
                    h(
                      "div",
                      { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3" },
                      [
                        h(
                          "div",
                          { className: "flex items-center space-x-3" },
                          [
                            h(
                              "div",
                              {
                                className: `w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                                  isCurrentCapacity
                                    ? "bg-gradient-to-tr from-cyan-500 to-violet-600 text-white shadow-md shadow-cyan-500/30"
                                    : isSupported
                                    ? "bg-slate-800 text-slate-300"
                                    : "bg-slate-900 text-slate-500"
                                }`
                              },
                              `T${t.tier}`
                            ),
                            h("div", null, [
                              h("div", { className: "flex items-center space-x-2" }, [
                                h("span", { className: "font-bold text-slate-100 text-base" }, t.name),
                                isCurrentCapacity && h(
                                  "span",
                                  { className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400 text-slate-950 uppercase tracking-wider" },
                                  "Your Tier Target"
                                )
                              ]),
                              h("p", { className: "text-xs text-slate-400 mt-0.5" }, t.desc)
                            ])
                          ]
                        ),
                        h(
                          "div",
                          { className: "flex items-center space-x-4 self-end sm:self-center" },
                          [
                            h("div", { className: "text-right" }, [
                              h("div", { className: "text-xs font-mono font-bold text-slate-200" }, t.params),
                              h("div", { className: "text-[11px] text-slate-400" }, t.ramReq)
                            ]),
                            h(
                              "div",
                              {
                                className: `px-2.5 py-1 rounded-md text-xs font-medium flex items-center space-x-1 ${
                                  isSupported
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                }`
                              },
                              [
                                isSupported ? h(Icons.Check, { size: 12 }) : h(Icons.XCircle, { size: 12 }),
                                h("span", null, isSupported ? "Supported" : "High OOM Risk")
                              ]
                            )
                          ]
                        )
                      ]
                    )
                  ]
                );
              })
            )
          ]
        ),

        // 4. Advanced Features Suite Grid
        h(
          "div",
          { key: "advanced-features-grid", className: "space-y-4" },
          [
            h("div", null, [
              h("h2", { className: "text-xl font-bold text-slate-100 flex items-center space-x-2" }, [
                h(Icons.Sparkles, { size: 20, className: "text-cyan-400" }),
                h("span", null, "Advanced AI System Capabilities")
              ]),
              h("p", { className: "text-sm text-slate-400 mt-1" }, "Real-time hardware sensors, offline AI mode, storage advisors, bilingual testing, and community telemetry.")
            ]),

            h(
              "div",
              { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" },
              advancedFeatureCards.map(f => h(
                "div",
                {
                  key: f.id,
                  onClick: () => onNavigate(f.id),
                  className: "glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all flex flex-col justify-between space-y-3 group hover:shadow-lg hover:shadow-cyan-500/10"
                },
                [
                  h("div", { className: "space-y-2" }, [
                    h("div", { className: "flex justify-between items-center" }, [
                      h(f.icon, { size: 20, className: f.color }),
                      h("span", { className: "px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-400 border border-slate-800" }, f.badge)
                    ]),
                    h("h3", { className: "text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors" }, f.title),
                    h("p", { className: "text-xs text-slate-400 line-clamp-2" }, f.desc)
                  ]),
                  h("div", { className: "flex items-center text-xs font-semibold text-cyan-400 space-x-1 pt-1" }, [
                    h("span", null, "Open Tool"),
                    h(Icons.ArrowRight, { size: 14 })
                  ])
                ]
              ))
            )
          ]
        ),

        // 5. Top AI Model Recommendations
        h(
          "div",
          { key: "top-picks-section", className: "space-y-4" },
          [
            h(
              "div",
              { key: "picks-header", className: "flex items-center justify-between" },
              [
                h("div", null, [
                  h("h2", { className: "text-xl font-bold text-slate-100 flex items-center space-x-2" }, [
                    h(Icons.Award, { size: 20, className: "text-amber-400" }),
                    h("span", null, "Top Recommendations for Your Phone")
                  ]),
                  h("p", { className: "text-sm text-slate-400 mt-1" }, "Optimal models balanced for your RAM cushion, memory bus bandwidth, and storage.")
                ]),
                h(
                  "button",
                  {
                    onClick: () => onNavigate("recommendations"),
                    className: "hidden sm:flex items-center space-x-1 text-sm font-semibold text-cyan-400 hover:text-cyan-300"
                  },
                  [
                    h("span", null, "View All Ranked"),
                    h(Icons.ChevronRight, { size: 16 })
                  ]
                )
              ]
            ),

            // Top Picks Grid
            h(
              "div",
              { key: "picks-grid", className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
              topPicks.map((item, idx) => {
                const m = item.model;
                const metrics = item.metrics;
                const rec = item.recommendation;
                const isCompared = selectedCompareIds.includes(m.id);

                return h(
                  "div",
                  {
                    key: m.id,
                    className: "glass-panel-glow rounded-2xl p-6 flex flex-col justify-between space-y-4 group hover:border-violet-500/50 transition-all"
                  },
                  [
                    h("div", { className: "flex items-center justify-between" }, [
                      h("span", { className: "px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30" }, `#${idx + 1} Best Fit`),
                      h("span", { className: "px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" }, `${rec.score}/100`)
                    ]),
                    h("div", { className: "space-y-1.5" }, [
                      h("div", { className: "text-xs text-slate-400 uppercase tracking-wider font-semibold" }, m.developer),
                      h("h3", { className: "text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors" }, m.name),
                      h("p", { className: "text-xs text-slate-400 line-clamp-2" }, m.description)
                    ]),
                    h("div", { className: "bg-slate-900/80 rounded-xl p-3 space-y-2 border border-slate-800/80 text-xs" }, [
                      h("div", { className: "flex justify-between" }, [h("span", { className: "text-slate-400" }, "Est. Speed:"), h("span", { className: "font-mono font-bold text-emerald-400" }, `~${metrics.gen_tokens_sec} tok/s`)]),
                      h("div", { className: "flex justify-between" }, [h("span", { className: "text-slate-400" }, "Active RAM:"), h("span", { className: "font-mono font-bold text-cyan-300" }, `${metrics.total_active_ram_gb} GB`)]),
                      h("div", { className: "flex justify-between" }, [h("span", { className: "text-slate-400" }, "Safe Cushion:"), h("span", { className: "font-mono font-bold text-violet-300" }, `+${metrics.ram_headroom_gb} GB free`)]),
                      h("div", { className: "flex justify-between pt-1 border-t border-slate-800" }, [h("span", { className: "text-slate-400" }, "MMLU Benchmark:"), h("span", { className: "font-mono font-bold text-amber-300" }, `${m.mmlu_score}%`)])
                    ]),
                    h("div", { className: "flex items-center space-x-2 pt-2" }, [
                      h("button", { onClick: () => onSelectModelForDetails(m), className: "flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 text-center" }, "Deep Specs"),
                      h("button", { onClick: () => onToggleCompare(m.id), className: `px-3 py-2 rounded-lg text-xs font-semibold border ${isCompared ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 text-slate-400 border-slate-800'}` }, isCompared ? "Comparing" : "Compare")
                    ])
                  ]
                );
              })
            )
          ]
        )
      ]
    );
  }

  window.Dashboard = Dashboard;
})();
