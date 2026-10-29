(function() {
  const { createElement: h, useState } = React;
  const Icons = window.Icons;

  function StorageManagerView({ models, activeDevice, detectedHardware }) {
    const [selectedModelId, setSelectedModelId] = useState("llama-3.2-3b-instruct");
    const [cachedModels, setCachedModels] = useState(() => {
      try {
        const saved = localStorage.getItem("phone_ladder_offline_models");
        return saved ? JSON.parse(saved) : ["smollm2-135m-instruct"];
      } catch (e) {
        return ["smollm2-135m-instruct"];
      }
    });

    const totalStorageGb = 128.0; // standard base
    const freeStorageGb = detectedHardware?.storageFreeGb || activeDevice?.storage_free_gb || 45.0;
    const osReserveGb = 16.0;
    const userAppsGb = Math.max(10.0, totalStorageGb - freeStorageGb - osReserveGb);

    // Calculate total AI model cached size
    const cachedSizeGb = cachedModels.reduce((acc, id) => {
      const m = models.find(x => x.id === id);
      const qKey = m?.default_quantization || "Q4_K_M";
      return acc + (m?.quantizations?.[qKey]?.file_size_gb || 0.5);
    }, 0);

    const selectedModel = models.find(m => m.id === selectedModelId) || models[0];
    const qKey = selectedModel?.default_quantization || "Q4_K_M";
    const selectedSize = selectedModel?.quantizations?.[qKey]?.file_size_gb || 2.0;
    const safetyBufferGb = 2.0; // recommended buffer for OS virtual memory / swap

    const remainingAfterDownload = Math.round((freeStorageGb - selectedSize) * 10) / 10;
    const isSafe = remainingAfterDownload >= safetyBufferGb;
    const isTight = remainingAfterDownload > 0 && remainingAfterDownload < safetyBufferGb;
    const isFull = remainingAfterDownload <= 0;

    const purgeCache = () => {
      setCachedModels([]);
      try {
        localStorage.removeItem("phone_ladder_offline_models");
      } catch (e) {}
    };

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
                h(Icons.HardDrive, { size: 24, className: "text-cyan-400" }),
                h("h1", { className: "text-2xl sm:text-3xl font-extrabold text-slate-100" }, "Smart Storage & Download Manager")
              ]),
              h("p", { className: "text-slate-400 text-sm" }, "Pre-download storage headroom verification, model footprint auditing, and offline cache purging.")
            ]),
            cachedModels.length > 0 && h(
              "button",
              {
                onClick: purgeCache,
                className: "px-4 py-2 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-800/50 hover:bg-rose-900/40 text-xs font-bold transition-all flex items-center space-x-1.5"
              },
              [
                h(Icons.Trash, { size: 14 }),
                h("span", null, `Purge AI Cache (${Math.round(cachedSizeGb * 10)/10} GB)`)
              ]
            )
          ]
        ),

        // Visual Disk Storage Bar
        h(
          "div",
          { key: "disk-bar-card", className: "glass-panel-glow rounded-2xl p-6 sm:p-8 space-y-4" },
          [
            h("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2" }, [
              h("div", null, [
                h("h2", { className: "text-lg font-bold text-slate-100" }, "Device Storage Allocation"),
                h("p", { className: "text-xs text-slate-400 mt-0.5" }, `Auditing ~${totalStorageGb} GB internal flash storage capacity.`)
              ]),
              h("div", { className: "flex items-center space-x-3 text-xs font-mono" }, [
                h("span", { className: "text-slate-400" }, "Available Free:"),
                h("span", { className: "font-bold text-emerald-400 text-sm" }, `${freeStorageGb} GB`)
              ])
            ]),

            // Segmented Storage Bar
            h("div", { className: "space-y-2 pt-2" }, [
              h(
                "div",
                { className: "h-6 w-full rounded-xl bg-slate-900 border border-slate-800 flex overflow-hidden text-[10px] font-mono font-bold" },
                [
                  // OS Reserve
                  h("div", {
                    style: { width: `${(osReserveGb / totalStorageGb) * 100}%` },
                    className: "h-full bg-slate-700/80 text-slate-300 flex items-center justify-center truncate px-1",
                    title: `System & OS: ${osReserveGb} GB`
                  }, "OS"),
                  // User Apps & Media
                  h("div", {
                    style: { width: `${(userAppsGb / totalStorageGb) * 100}%` },
                    className: "h-full bg-violet-600/70 text-violet-100 flex items-center justify-center truncate px-1",
                    title: `Apps & Media: ${userAppsGb} GB`
                  }, "Apps"),
                  // Downloaded AI models
                  cachedSizeGb > 0 && h("div", {
                    style: { width: `${(cachedSizeGb / totalStorageGb) * 100}%` },
                    className: "h-full bg-cyan-500/80 text-slate-950 flex items-center justify-center truncate px-1",
                    title: `AI Models: ${Math.round(cachedSizeGb*10)/10} GB`
                  }, "AI"),
                  // Free space
                  h("div", {
                    style: { width: `${(freeStorageGb / totalStorageGb) * 100}%` },
                    className: "h-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center truncate px-1",
                    title: `Free Space: ${freeStorageGb} GB`
                  }, `${freeStorageGb}G Free`)
                ]
              ),

              // Legend
              h("div", { className: "flex flex-wrap items-center gap-4 text-xs font-mono pt-1 text-slate-400" }, [
                h("div", { className: "flex items-center space-x-1.5" }, [
                  h("span", { className: "w-2.5 h-2.5 rounded-sm bg-slate-600" }),
                  h("span", null, `System OS (${osReserveGb} GB)`)
                ]),
                h("div", { className: "flex items-center space-x-1.5" }, [
                  h("span", { className: "w-2.5 h-2.5 rounded-sm bg-violet-500" }),
                  h("span", null, `User Media (${Math.round(userAppsGb)} GB)`)
                ]),
                h("div", { className: "flex items-center space-x-1.5" }, [
                  h("span", { className: "w-2.5 h-2.5 rounded-sm bg-cyan-400" }),
                  h("span", null, `Offline AI Models (${Math.round(cachedSizeGb*10)/10} GB)`)
                ]),
                h("div", { className: "flex items-center space-x-1.5" }, [
                  h("span", { className: "w-2.5 h-2.5 rounded-sm bg-emerald-400" }),
                  h("span", null, `Free (${freeStorageGb} GB)`)
                ])
              ])
            ])
          ]
        ),

        // Pre-Download Feasibility Calculator Card
        h(
          "div",
          { key: "pre-download-advisor", className: "glass-panel rounded-2xl p-6 sm:p-8 space-y-6" },
          [
            h("div", null, [
              h("h2", { className: "text-lg font-bold text-slate-100 flex items-center space-x-2" }, [
                h(Icons.Shield, { size: 18, className: "text-amber-400" }),
                h("span", null, "Pre-Download Feasibility Advisor")
              ]),
              h("p", { className: "text-xs text-slate-400 mt-1" }, "Simulate storage impacts before downloading to guarantee sufficient swap room for your phone OS.")
            ]),

            // Model Selection
            h("div", { className: "space-y-2" }, [
              h("label", { className: "text-xs font-semibold text-slate-300" }, "Inspect Model Download:"),
              h(
                "select",
                {
                  value: selectedModelId,
                  onChange: (e) => setSelectedModelId(e.target.value),
                  className: "w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono outline-none focus:border-cyan-400"
                },
                models.map(m => {
                  const q = m.default_quantization || "Q4_K_M";
                  const sz = m.quantizations?.[q]?.file_size_gb || 1.5;
                  return h("option", { key: m.id, value: m.id }, `${m.name} (${m.parameters_display}) — ${sz} GB`);
                })
              )
            ]),

            // Impact Analysis Result Card
            h(
              "div",
              {
                className: `p-5 rounded-2xl border space-y-4 ${
                  isSafe
                    ? "bg-emerald-950/30 border-emerald-500/40"
                    : isTight
                    ? "bg-amber-950/30 border-amber-500/40"
                    : "bg-rose-950/30 border-rose-500/40"
                }`
              },
              [
                h("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2" }, [
                  h("div", { className: "space-y-0.5" }, [
                    h("span", { className: "text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400" }, "Pre-Download Verdict"),
                    h("h3", { className: "text-base font-bold text-slate-100" },
                      isSafe ? "Safe to Download (Optimal Room)" : isTight ? "Low Storage Warning" : "Storage Insufficient (Download Blocked)"
                    )
                  ]),
                  h(
                    "span",
                    {
                      className: `px-3 py-1 rounded-full text-xs font-mono font-bold self-start sm:self-center ${
                        isSafe ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : isTight ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`
                    },
                    isSafe ? "SAFE HEADROOM" : isTight ? "TIGHT SPACE" : "OUT OF SPACE"
                  )
                ]),

                // Breakdown Numbers
                h("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1" }, [
                  h("div", { className: "bg-slate-900/80 p-3 rounded-xl border border-slate-800" }, [
                    h("div", { className: "text-slate-500 text-[10px]" }, "Download Size"),
                    h("div", { className: "font-bold text-cyan-400 text-sm" }, `${selectedSize} GB`)
                  ]),
                  h("div", { className: "bg-slate-900/80 p-3 rounded-xl border border-slate-800" }, [
                    h("div", { className: "text-slate-500 text-[10px]" }, "Current Free"),
                    h("div", { className: "font-bold text-slate-200 text-sm" }, `${freeStorageGb} GB`)
                  ]),
                  h("div", { className: "bg-slate-900/80 p-3 rounded-xl border border-slate-800" }, [
                    h("div", { className: "text-slate-500 text-[10px]" }, "Free After Download"),
                    h("div", { className: `font-bold text-sm ${remainingAfterDownload > 2 ? 'text-emerald-400' : 'text-amber-400'}` }, `${remainingAfterDownload} GB`)
                  ]),
                  h("div", { className: "bg-slate-900/80 p-3 rounded-xl border border-slate-800" }, [
                    h("div", { className: "text-slate-500 text-[10px]" }, "Safety Margin"),
                    h("div", { className: "font-bold text-violet-400 text-sm" }, `+${safetyBufferGb} GB buffer`)
                  ])
                ])
              ]
            )
          ]
        )
      ]
    );
  }

  window.StorageManagerView = StorageManagerView;
})();
