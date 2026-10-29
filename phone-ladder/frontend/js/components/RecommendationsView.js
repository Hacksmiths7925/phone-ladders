(function() {
  const { createElement: h, useState } = React;
  const Icons = window.Icons;

  function RecommendationsView({
    activeDevice,
    recommendationsData,
    onUpdatePreferences,
    onSelectModelForDetails,
    onToggleCompare,
    selectedCompareIds
  }) {
    const [priority, setPriority] = useState("balanced");
    const [useCase, setUseCase] = useState("chat");

    const priorities = [
      { id: "balanced", label: "Balanced", desc: "Best harmony of speed, RAM cushion, and quality", icon: Icons.Scale },
      { id: "speed", label: "Maximum Speed", desc: "Fastest response time and streaming token rate", icon: Icons.Zap },
      { id: "quality", label: "Peak Quality", desc: "Highest MMLU benchmark and reasoning accuracy", icon: Icons.Award },
      { id: "battery_saver", label: "Battery Saver", desc: "Low memory bandwidth drain and minimal heat", icon: Icons.Shield },
    ];

    const useCases = [
      { id: "chat", label: "Conversational Chat", icon: Icons.Activity },
      { id: "reasoning", label: "Deep Reasoning & Math", icon: Icons.Sparkles },
      { id: "coding", label: "Code & Logic", icon: Icons.Cpu },
      { id: "lightweight", label: "Lightweight Assistant", icon: Icons.Smartphone },
      { id: "vision", label: "Vision & Multimodal", icon: Icons.Eye },
    ];

    const handlePriorityChange = (newP) => {
      setPriority(newP);
      onUpdatePreferences({ priority: newP, use_case: useCase });
    };

    const handleUseCaseChange = (newU) => {
      setUseCase(newU);
      onUpdatePreferences({ priority, use_case: newU });
    };

    const rankedModels = recommendationsData?.all_ranked || [];
    const summary = recommendationsData?.summary || { total_evaluated: 0, fully_compatible: 0, tight_fit: 0, incompatible: 0 };
    const ladderTierInfo = recommendationsData?.ladder_tier || { tier: 3, tier_name: "Tier 3: Power Edge" };

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
              h(Icons.Sparkles, { size: 24, className: "text-amber-400" }),
              h("h1", { className: "text-2xl sm:text-3xl font-extrabold text-slate-100" }, "Smart Model Recommendations")
            ]),
            h("p", { className: "text-slate-400 text-sm max-w-2xl" }, "Multi-criteria ranking engine evaluating RAM safety margins, memory bandwidth, storage headroom, and task alignment.")
          ]
        ),

        // Preferences Selector Card
        h(
          "div",
          { key: "pref-card", className: "glass-panel-glow rounded-2xl p-6 space-y-6" },
          [
            // Priorities Row
            h("div", { className: "space-y-3" }, [
              h("span", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider" }, "1. Optimization Goal / Priority:"),
              h(
                "div",
                { className: "grid grid-cols-2 sm:grid-cols-4 gap-3" },
                priorities.map(p => {
                  const isSelected = priority === p.id;
                  return h(
                    "button",
                    {
                      key: p.id,
                      onClick: () => handlePriorityChange(p.id),
                      className: `p-3 rounded-xl text-left border transition-all ${
                        isSelected
                          ? "bg-violet-600/30 border-violet-500/80 shadow-md shadow-violet-500/20"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      }`
                    },
                    [
                      h("div", { className: "flex items-center space-x-2" }, [
                        h(p.icon, { size: 16, className: isSelected ? "text-cyan-300" : "text-slate-400" }),
                        h("span", { className: `text-xs font-bold ${isSelected ? "text-white" : "text-slate-300"}` }, p.label)
                      ]),
                      h("p", { className: "text-[11px] text-slate-400 mt-1 line-clamp-1" }, p.desc)
                    ]
                  );
                })
              )
            ]),

            // Use Case Row
            h("div", { className: "space-y-3 pt-3 border-t border-slate-800/80" }, [
              h("span", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider" }, "2. Primary Task / Use Case:"),
              h(
                "div",
                { className: "flex flex-wrap gap-2" },
                useCases.map(u => {
                  const isSelected = useCase === u.id;
                  return h(
                    "button",
                    {
                      key: u.id,
                      onClick: () => handleUseCaseChange(u.id),
                      className: `px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                        isSelected
                          ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25"
                          : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200"
                      }`
                    },
                    [
                      h(u.icon, { size: 14 }),
                      h("span", null, u.label)
                    ]
                  );
                })
              )
            ])
          ]
        ),

        // Summary Statistics Ribbon
        h(
          "div",
          { key: "summary-ribbon", className: "grid grid-cols-2 sm:grid-cols-4 gap-4" },
          [
            { label: "Target Phone Tier", val: ladderTierInfo.tier_name.split(":")[0], sub: activeDevice?.name || "Device", color: "text-cyan-400" },
            { label: "Comfortable Fit", val: `${summary.fully_compatible} Models`, sub: "Safe RAM Cushion", color: "text-emerald-400" },
            { label: "Tight Fit", val: `${summary.tight_fit} Models`, sub: "Kill Background Apps", color: "text-amber-400" },
            { label: "OOM Incompatible", val: `${summary.incompatible} Models`, sub: "Exceeds Physical RAM", color: "text-rose-400" },
          ].map((item, idx) => h(
            "div",
            { key: idx, className: "glass-panel p-4 rounded-xl border border-slate-800/80" },
            [
              h("div", { className: "text-[11px] font-semibold text-slate-400 uppercase tracking-wider" }, item.label),
              h("div", { className: `text-xl font-bold font-mono mt-0.5 ${item.color}` }, item.val),
              h("div", { className: "text-[11px] text-slate-500 mt-0.5" }, item.sub)
            ]
          ))
        ),

        // Ranked Models Ladder Stack
        h(
          "div",
          { key: "ranked-list", className: "space-y-4" },
          rankedModels.map((item, idx) => {
            const m = item.model;
            const met = item.metrics;
            const rec = item.recommendation;
            const isCompared = selectedCompareIds.includes(m.id);

            return h(
              "div",
              {
                key: m.id,
                className: `glass-panel rounded-2xl p-6 transition-all ${
                  rec.score >= 80
                    ? "border-violet-500/40 glow-violet"
                    : met.status === "INCOMPATIBLE"
                    ? "opacity-60 border-slate-900 bg-slate-950/40"
                    : "border-slate-800 hover:border-slate-700"
                }`
              },
              [
                h(
                  "div",
                  { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-6" },
                  [
                    // Left: Score & Model Info
                    h(
                      "div",
                      { className: "flex items-start space-x-4" },
                      [
                        // Fit Score Badge
                        h(
                          "div",
                          {
                            className: `w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-bold shrink-0 border ${
                              rec.score >= 80
                                ? "bg-gradient-to-tr from-violet-600/30 to-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20"
                                : rec.score >= 50
                                ? "bg-slate-900 border-slate-700 text-slate-200"
                                : "bg-rose-950/20 border-rose-800 text-rose-400"
                            }`
                          },
                          [
                            h("span", { className: "text-lg leading-none" }, rec.score),
                            h("span", { className: "text-[9px] uppercase tracking-wider opacity-70 mt-0.5" }, "Score")
                          ]
                        ),

                        // Title & Tags
                        h("div", { className: "space-y-1" }, [
                          h("div", { className: "flex flex-wrap items-center gap-2" }, [
                            h("span", { className: "text-xs font-bold text-violet-400 uppercase font-mono" }, m.developer),
                            h("span", { className: "text-slate-600" }, "•"),
                            h("span", { className: "text-xs font-mono text-cyan-400 font-bold" }, m.parameters_display),
                            h(
                              "span",
                              {
                                className: `px-2 py-0.5 rounded text-[10px] font-bold ${
                                  met.status === "PERFECT_FIT" || met.status === "GOOD_FIT"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : met.status === "TIGHT_FIT"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                }`
                              },
                              rec.verdict
                            )
                          ]),
                          h("h3", { className: "text-lg font-bold text-slate-100" }, m.name),
                          h("p", { className: "text-xs text-slate-400 line-clamp-1" }, m.description)
                        ])
                      ]
                    ),

                    // Center: Hardware Metrics Chips
                    h(
                      "div",
                      { className: "flex flex-wrap items-center gap-3 text-xs font-mono" },
                      [
                        h("div", { className: "bg-slate-900/90 rounded-xl p-2.5 px-3 border border-slate-800" }, [
                          h("div", { className: "text-slate-500 text-[10px]" }, "Est. Generation"),
                          h("div", { className: "font-bold text-emerald-400" }, `~${met.gen_tokens_sec} tok/s`)
                        ]),
                        h("div", { className: "bg-slate-900/90 rounded-xl p-2.5 px-3 border border-slate-800" }, [
                          h("div", { className: "text-slate-500 text-[10px]" }, "Active RAM"),
                          h("div", { className: "font-bold text-cyan-300" }, `${met.total_active_ram_gb} GB`)
                        ]),
                        h("div", { className: "bg-slate-900/90 rounded-xl p-2.5 px-3 border border-slate-800" }, [
                          h("div", { className: "text-slate-500 text-[10px]" }, "RAM Cushion"),
                          h(
                            "div",
                            { className: `font-bold ${met.ram_headroom_gb >= 0 ? "text-violet-300" : "text-rose-400"}` },
                            met.ram_headroom_gb >= 0 ? `+${met.ram_headroom_gb} GB` : "OOM Crash"
                          )
                        ]),
                        h("div", { className: "bg-slate-900/90 rounded-xl p-2.5 px-3 border border-slate-800" }, [
                          h("div", { className: "text-slate-500 text-[10px]" }, "MMLU"),
                          h("div", { className: "font-bold text-amber-300" }, `${m.mmlu_score}%`)
                        ])
                      ]
                    ),

                    // Right: Actions
                    h(
                      "div",
                      { className: "flex items-center space-x-2 shrink-0" },
                      [
                        h(
                          "button",
                          {
                            onClick: () => onSelectModelForDetails(m),
                            className: "px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                          },
                          "Deep Specs"
                        ),
                        h(
                          "button",
                          {
                            onClick: () => onToggleCompare(m.id),
                            className: `px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1 ${
                              isCompared
                                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                                : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                            }`
                          },
                          [
                            h(Icons.Scale, { size: 14 }),
                            h("span", null, isCompared ? "Comparing" : "Compare")
                          ]
                        )
                      ]
                    )
                  ]
                ),

                // Explanation Reasons Breakdown
                rec.reasons && rec.reasons.length > 0 && h(
                  "div",
                  { className: "mt-4 pt-4 border-t border-slate-800/80 space-y-1.5" },
                  rec.reasons.map((r, rIdx) => h(
                    "div",
                    { key: rIdx, className: "flex items-center space-x-2 text-xs text-slate-300" },
                    [
                      h(Icons.Check, { size: 13, className: "text-cyan-400 shrink-0" }),
                      h("span", null, r)
                    ]
                  ))
                )
              ]
            );
          })
        )
      ]
    );
  }

  window.RecommendationsView = RecommendationsView;
})();
