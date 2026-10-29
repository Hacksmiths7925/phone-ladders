(function() {
  const { createElement: h, useState } = React;
  const Icons = window.Icons;

  function ModelExplorer({
    models,
    activeDevice,
    onSelectModelForDetails,
    onToggleCompare,
    selectedCompareIds
  }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [familyFilter, setFamilyFilter] = useState("All");
    const [maxRamFilter, setMaxRamFilter] = useState(activeDevice?.ram_gb ? activeDevice.ram_gb * 1.5 : 24);
    const [selectedQuantMap, setSelectedQuantMap] = useState({});

    const categories = [
      "All",
      "Reasoning & Math",
      "Conversational & Chat",
      "Coding & Logic",
      "Lightweight Edge",
      "Vision & Multimodal"
    ];

    const families = ["All", "Llama", "Qwen", "DeepSeek", "SmolLM", "Gemma", "Phi", "Mistral", "MiniCPM"];

    // Filter models
    const filteredModels = models.filter(m => {
      // Category filter
      if (categoryFilter !== "All" && !m.category.toLowerCase().includes(categoryFilter.toLowerCase())) {
        return false;
      }
      // Family filter
      if (familyFilter !== "All" && m.family !== familyFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesDesc = m.description.toLowerCase().includes(q);
        const matchesDev = m.developer.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesDev) return false;
      }
      // RAM filter: check default quant min_ram
      const qKey = selectedQuantMap[m.id] || m.default_quantization || "Q4_K_M";
      const qInfo = m.quantizations?.[qKey] || m.quantizations?.["Q4_K_M"] || {};
      const minRam = qInfo.min_ram_gb || 2.0;
      if (minRam > maxRamFilter) return false;

      return true;
    });

    const handleQuantChange = (modelId, quantKey) => {
      setSelectedQuantMap(prev => ({
        ...prev,
        [modelId]: quantKey
      }));
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
              h(Icons.Layers, { size: 24, className: "text-cyan-400" }),
              h("h1", { className: "text-2xl sm:text-3xl font-extrabold text-slate-100" }, "AI Model Explorer")
            ]),
            h("p", { className: "text-slate-400 text-sm max-w-2xl" }, "Search and filter verified on-device models. Choose quantization levels, inspect memory budgets, and preview compatibility with your smartphone.")
          ]
        ),

        // Filter Controls Panel
        h(
          "div",
          { key: "filters-panel", className: "glass-panel rounded-2xl p-6 space-y-5" },
          [
            // Search Input
            h(
              "div",
              { className: "relative" },
              [
                h(Icons.Search, { size: 18, className: "absolute left-4 top-3.5 text-slate-400" }),
                h("input", {
                  type: "text",
                  placeholder: "Search by model name, developer (Meta, DeepSeek, Alibaba, Google), or architecture...",
                  value: searchQuery,
                  onChange: (e) => setSearchQuery(e.target.value),
                  className: "w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-cyan-400 outline-none transition-colors"
                })
              ]
            ),

            // Category Filter Pills
            h(
              "div",
              { className: "space-y-2" },
              [
                h("span", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider" }, "Category:"),
                h(
                  "div",
                  { className: "flex flex-wrap gap-2" },
                  categories.map(cat => h(
                    "button",
                    {
                      key: cat,
                      onClick: () => setCategoryFilter(cat),
                      className: `px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        categoryFilter === cat
                          ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                          : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200"
                      }`
                    },
                    cat
                  ))
                )
              ]
            ),

            // Secondary Filters Row: Family & Max RAM Slider
            h(
              "div",
              { className: "grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-slate-800/80" },
              [
                // Family Filter
                h("div", { className: "space-y-2" }, [
                  h("span", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider" }, "Architecture / Family:"),
                  h("div", { className: "flex flex-wrap gap-1.5" }, families.map(f => h(
                    "button",
                    {
                      key: f,
                      onClick: () => setFamilyFilter(f),
                      className: `px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                        familyFilter === f
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                          : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700"
                      }`
                    },
                    f
                  )))
                ]),

                // Max RAM Slider
                h("div", { className: "space-y-2" }, [
                  h("div", { className: "flex justify-between items-center text-xs font-semibold" }, [
                    h("span", { className: "text-slate-400 uppercase tracking-wider" }, "Max RAM Requirement:"),
                    h("span", { className: "font-mono font-bold text-cyan-400" }, `<= ${maxRamFilter} GB`)
                  ]),
                  h("input", {
                    type: "range",
                    min: "1",
                    max: "24",
                    step: "1",
                    value: maxRamFilter,
                    onChange: (e) => setMaxRamFilter(parseFloat(e.target.value)),
                    className: "w-full"
                  }),
                  h("div", { className: "flex justify-between text-[10px] text-slate-500 font-mono" }, [
                    h("span", null, "1 GB"),
                    h("span", null, "8 GB (Phone Standard)"),
                    h("span", null, "16 GB"),
                    h("span", null, "24 GB")
                  ])
                ])
              ]
            )
          ]
        ),

        // Results Count
        h(
          "div",
          { key: "results-count", className: "flex justify-between items-center text-xs text-slate-400 px-1" },
          [
            h("span", null, `Showing ${filteredModels.length} compatible models`),
            selectedCompareIds.length > 0 && h(
              "span",
              { className: "text-cyan-400 font-semibold" },
              `${selectedCompareIds.length} models selected for comparison`
            )
          ]
        ),

        // Models Grid
        h(
          "div",
          { key: "models-grid", className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
          filteredModels.map(m => {
            const currentQuant = selectedQuantMap[m.id] || m.default_quantization || "Q4_K_M";
            const qData = m.quantizations?.[currentQuant] || Object.values(m.quantizations || {})[0] || {};
            const fileSizeGb = qData.file_size_gb || 2.0;
            const minRamGb = qData.min_ram_gb || 3.0;

            // Compatibility calculation for active device
            const devRam = activeDevice?.ram_gb || 8.0;
            const isOOM = devRam < minRamGb;
            const isTight = devRam >= minRamGb && (devRam - minRamGb < 1.0);
            const isOptimal = devRam - minRamGb >= 1.0;

            const isCompared = selectedCompareIds.includes(m.id);

            // Estimated token generation speed
            const bw = activeDevice?.memory_bandwidth_gbps || 34.0;
            const npu = activeDevice?.npu_tops || 0.0;
            const estSpeed = Math.round((bw / Math.max(0.1, fileSizeGb)) * 0.55 * (1.0 + npu / 120.0) * 10) / 10;

            return h(
              "div",
              {
                key: m.id,
                className: "glass-panel-glow rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-violet-500/50 transition-all"
              },
              [
                // Card Top: Developer, Category & Tier Pill
                h("div", { className: "space-y-2" }, [
                  h("div", { className: "flex items-center justify-between" }, [
                    h("span", { className: "text-xs font-mono font-bold text-violet-400 uppercase tracking-wider" }, m.developer),
                    h(
                      "span",
                      { className: "px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700" },
                      `Tier ${m.ladder_tier}`
                    )
                  ]),
                  h("h3", { className: "text-lg font-bold text-slate-100" }, m.name),
                  h("div", { className: "flex items-center space-x-2 text-xs text-slate-400 font-mono" }, [
                    h("span", { className: "text-cyan-400 font-bold" }, m.parameters_display),
                    h("span", null, `• ${m.category}`)
                  ]),
                  h("p", { className: "text-xs text-slate-400 line-clamp-2 mt-1" }, m.description)
                ]),

                // Quantization Selector Pills
                h("div", { className: "space-y-1.5 pt-2 border-t border-slate-800/80" }, [
                  h("div", { className: "flex justify-between items-center text-[11px] text-slate-400" }, [
                    h("span", null, "Quantization:"),
                    h("span", { className: "font-mono font-bold text-slate-200" }, `${fileSizeGb} GB download`)
                  ]),
                  h(
                    "div",
                    { className: "flex flex-wrap gap-1.5" },
                    Object.keys(m.quantizations || {}).map(qk => h(
                      "button",
                      {
                        key: qk,
                        onClick: () => handleQuantChange(m.id, qk),
                        className: `px-2 py-1 rounded text-[10px] font-mono font-semibold transition-all ${
                          currentQuant === qk
                            ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                            : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                        }`
                      },
                      qk
                    ))
                  )
                ]),

                // Metrics & Compatibility Pill
                h("div", { className: "bg-slate-900/80 rounded-xl p-3 space-y-2 border border-slate-800/80" }, [
                  h("div", { className: "flex justify-between items-center text-xs" }, [
                    h("span", { className: "text-slate-400" }, "Phone Compatibility:"),
                    h(
                      "span",
                      {
                        className: `px-2 py-0.5 rounded text-[10px] font-bold ${
                          isOptimal
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : isTight
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        }`
                      },
                      isOptimal ? "Optimal Fit" : isTight ? "Tight Fit" : "Out of Memory"
                    )
                  ]),
                  h("div", { className: "flex justify-between items-center text-xs" }, [
                    h("span", { className: "text-slate-400" }, "Min RAM Required:"),
                    h("span", { className: "font-mono font-bold text-slate-200" }, `${minRamGb} GB`)
                  ]),
                  h("div", { className: "flex justify-between items-center text-xs" }, [
                    h("span", { className: "text-slate-400" }, "Est. Speed on Phone:"),
                    h("span", { className: "font-mono font-bold text-emerald-400" }, `~${estSpeed} tok/s`)
                  ]),
                  h("div", { className: "flex justify-between items-center text-xs" }, [
                    h("span", { className: "text-slate-400" }, "MMLU Intelligence:"),
                    h("span", { className: "font-mono font-bold text-amber-300" }, `${m.mmlu_score}%`)
                  ])
                ]),

                // Card Action Buttons
                h("div", { className: "flex items-center space-x-2 pt-1" }, [
                  h(
                    "button",
                    {
                      onClick: () => onSelectModelForDetails(m),
                      className: "flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors text-center"
                    },
                    "Deep Specs"
                  ),
                  h(
                    "button",
                    {
                      onClick: () => onToggleCompare(m.id),
                      className: `px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1 ${
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
                ])
              ]
            );
          })
        )
      ]
    );
  }

  window.ModelExplorer = ModelExplorer;
})();
