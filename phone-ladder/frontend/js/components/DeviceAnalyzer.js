(function() {
  const { createElement: h, useState, useEffect } = React;
  const Icons = window.Icons;

  function DeviceAnalyzer({
    activeDevice,
    setActiveDevice,
    presets,
    customDevices,
    onSaveCustomDevice,
    detectedHardware,
    onApplyDetectedHardware
  }) {
    const [brandFilter, setBrandFilter] = useState("All");
    const [subTab, setSubTab] = useState("presets"); // "presets", "custom", "autodetect"

    // Custom Device Form State
    const [customName, setCustomName] = useState("My Custom Smartphone");
    const [customBrand, setCustomBrand] = useState("Custom");
    const [customSoc, setCustomSoc] = useState("Snapdragon 8 Gen 3");
    const [customRam, setCustomRam] = useState(8.0);
    const [customStorage, setCustomStorage] = useState(45.0);
    const [customNpu, setCustomNpu] = useState(25.0);
    const [customBandwidth, setCustomBandwidth] = useState(50.0);
    const [customOs, setCustomOs] = useState("Android");
    const [saveStatus, setSaveStatus] = useState("");

    const brands = ["All", "Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "General Budget"];

    const filteredPresets = presets.filter(p => {
      if (brandFilter === "All") return true;
      if (brandFilter === "General Budget") return p.brand.toLowerCase().includes("budget") || p.brand.toLowerCase().includes("entry") || p.brand.toLowerCase().includes("general");
      return p.brand.toLowerCase().includes(brandFilter.toLowerCase());
    });

    const handleSaveCustom = async (e) => {
      e.preventDefault();
      setSaveStatus("Saving...");
      try {
        await onSaveCustomDevice({
          name: customName,
          brand: customBrand,
          soc: customSoc,
          ram_gb: parseFloat(customRam),
          storage_free_gb: parseFloat(customStorage),
          npu_tops: parseFloat(customNpu),
          memory_bandwidth_gbps: parseFloat(customBandwidth),
          os: customOs
        });
        setSaveStatus("Saved & Activated!");
        setTimeout(() => setSaveStatus(""), 3000);
      } catch (err) {
        setSaveStatus("Error saving custom device");
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
              h(Icons.Smartphone, { size: 24, className: "text-cyan-400" }),
              h("h1", { className: "text-2xl sm:text-3xl font-extrabold text-slate-100" }, "Device Analyzer & Hardware Config")
            ]),
            h("p", { className: "text-slate-400 text-sm max-w-2xl" }, "Select an exact smartphone preset, inspect real browser hardware detection, or customize your own processor and RAM specs.")
          ]
        ),

        // Sub Tab Buttons (Presets, Custom Builder, Auto-Detect)
        h(
          "div",
          { key: "tabs", className: "flex flex-wrap gap-2 border-b border-slate-800 pb-3" },
          [
            { id: "presets", label: "Smartphone Presets (16+)", icon: Icons.Smartphone },
            { id: "autodetect", label: "Live Browser Auto-Detect", icon: Icons.Activity },
            { id: "custom", label: "Custom Hardware Builder", icon: Icons.Sliders },
          ].map(tab => {
            const isActive = subTab === tab.id;
            return h(
              "button",
              {
                key: tab.id,
                onClick: () => setSubTab(tab.id),
                className: `flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                    : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`
              },
              [
                h(tab.icon, { size: 16 }),
                h("span", null, tab.label)
              ]
            );
          })
        ),

        // TAB 1: PRESETS
        subTab === "presets" && h(
          "div",
          { key: "tab-presets-content", className: "space-y-6" },
          [
            // Brand Filter Pills
            h(
              "div",
              { key: "brand-pills", className: "flex flex-wrap gap-2" },
              brands.map(b => h(
                "button",
                {
                  key: b,
                  onClick: () => setBrandFilter(b),
                  className: `px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    brandFilter === b
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700"
                  }`
                },
                b
              ))
            ),

            // Presets Grid
            h(
              "div",
              { key: "presets-grid", className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" },
              filteredPresets.map(p => {
                const isSelected = activeDevice && activeDevice.id === p.id;

                return h(
                  "div",
                  {
                    key: p.id,
                    className: `rounded-2xl p-5 flex flex-col justify-between transition-all ${
                      isSelected
                        ? "glass-panel-cyan border-cyan-400/80 shadow-lg shadow-cyan-500/20"
                        : "glass-panel hover:border-slate-700"
                    }`
                  },
                  [
                    h("div", { className: "space-y-3" }, [
                      h("div", { className: "flex items-center justify-between" }, [
                        h("span", { className: "text-xs font-mono font-bold text-violet-400 uppercase" }, p.brand),
                        h(
                          "span",
                          { className: "px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700" },
                          `Tier ${p.ladder_tier_capacity}`
                        )
                      ]),
                      h("h3", { className: "text-lg font-bold text-slate-100" }, p.name),
                      h("p", { className: "text-xs text-slate-400 line-clamp-1" }, p.soc),

                      // Spec Chips
                      h("div", { className: "grid grid-cols-2 gap-2 pt-2 text-xs" }, [
                        h("div", { className: "bg-slate-900/80 rounded-lg p-2 border border-slate-800/80" }, [
                          h("div", { className: "text-slate-500 text-[10px]" }, "RAM"),
                          h("div", { className: "font-mono font-bold text-slate-200" }, `${p.ram_gb} GB`)
                        ]),
                        h("div", { className: "bg-slate-900/80 rounded-lg p-2 border border-slate-800/80" }, [
                          h("div", { className: "text-slate-500 text-[10px]" }, "Free Storage"),
                          h("div", { className: "font-mono font-bold text-slate-200" }, `${p.default_storage_free_gb} GB`)
                        ]),
                        h("div", { className: "bg-slate-900/80 rounded-lg p-2 border border-slate-800/80" }, [
                          h("div", { className: "text-slate-500 text-[10px]" }, "Bandwidth"),
                          h("div", { className: "font-mono font-bold text-cyan-400" }, `${p.memory_bandwidth_gbps} GB/s`)
                        ]),
                        h("div", { className: "bg-slate-900/80 rounded-lg p-2 border border-slate-800/80" }, [
                          h("div", { className: "text-slate-500 text-[10px]" }, "NPU TOPS"),
                          h("div", { className: "font-mono font-bold text-violet-400" }, `${p.npu_tops} TOPS`)
                        ])
                      ])
                    ]),

                    // Select Button
                    h(
                      "button",
                      {
                        onClick: () => setActiveDevice(p),
                        className: `mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                          isSelected
                            ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-extrabold"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                        }`
                      },
                      [
                        isSelected ? h(Icons.Check, { size: 14 }) : null,
                        h("span", null, isSelected ? "Active Smartphone" : "Select This Phone")
                      ]
                    )
                  ]
                );
              })
            )
          ]
        ),

        // TAB 2: LIVE BROWSER AUTO-DETECT
        subTab === "autodetect" && h(
          "div",
          { key: "tab-autodetect-content", className: "glass-panel-glow rounded-2xl p-6 sm:p-8 space-y-6" },
          [
            h(
              "div",
              { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4" },
              [
                h("div", null, [
                  h("div", { className: "flex items-center space-x-2" }, [
                    h("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" }),
                    h("h2", { className: "text-xl font-bold text-slate-100" }, "Hardware Detected via Browser Web APIs")
                  ]),
                  h("p", { className: "text-sm text-slate-400 mt-1" }, "Directly queried from navigator.deviceMemory, WebGL debug extensions, and Storage APIs.")
                ]),
                h(
                  "button",
                  {
                    onClick: onApplyDetectedHardware,
                    className: "px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-violet-500 transition-all flex items-center space-x-2"
                  },
                  [
                    h(Icons.Check, { size: 16 }),
                    h("span", null, "Apply Detected Hardware")
                  ]
                )
              ]
            ),

            // Detection Cards Grid
            h(
              "div",
              { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pt-4" },
              [
                {
                  label: "Reported RAM (navigator.deviceMemory)",
                  val: `${detectedHardware?.ramGb || 8} GB`,
                  desc: detectedHardware?.rawDetections?.deviceMemory || "Queried directly from browser",
                  icon: Icons.MemoryStick,
                  color: "text-cyan-400"
                },
                {
                  label: "Available Quota (navigator.storage)",
                  val: `~${detectedHardware?.storageFreeGb || 45} GB Free`,
                  desc: detectedHardware?.rawDetections?.storage || "Storage quota estimation",
                  icon: Icons.HardDrive,
                  color: "text-emerald-400"
                },
                {
                  label: "WebGL Graphics Accelerator",
                  val: detectedHardware?.gpuRenderer || "Generic GPU",
                  desc: detectedHardware?.rawDetections?.webgl || "UNMASKED_RENDERER_WEBGL",
                  icon: Icons.Cpu,
                  color: "text-violet-400"
                },
                {
                  label: "WebGPU Adapter Readiness",
                  val: detectedHardware?.webGpuSupported ? "Supported & Ready" : "Fallback to WebGL / CPU",
                  desc: detectedHardware?.rawDetections?.webgpu || "WebGPU Adapter State",
                  icon: Icons.Gauge,
                  color: detectedHardware?.webGpuSupported ? "text-emerald-400" : "text-amber-400"
                }
              ].map((item, idx) => h(
                "div",
                { key: idx, className: "bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2" },
                [
                  h("div", { className: "flex items-center justify-between text-xs text-slate-400 font-semibold" }, [
                    h("span", null, item.label),
                    h(item.icon, { size: 18, className: item.color })
                  ]),
                  h("div", { className: "text-lg font-bold font-mono text-slate-100 truncate" }, item.val),
                  h("div", { className: "text-xs text-slate-500 break-words" }, item.desc)
                ]
              ))
            )
          ]
        ),

        // TAB 3: CUSTOM HARDWARE BUILDER
        subTab === "custom" && h(
          "div",
          { key: "tab-custom-content", className: "glass-panel rounded-2xl p-6 sm:p-8 space-y-6" },
          [
            h("div", null, [
              h("h2", { className: "text-xl font-bold text-slate-100 flex items-center space-x-2" }, [
                h(Icons.Sliders, { size: 20, className: "text-violet-400" }),
                h("span", null, "Build Custom Smartphone Specs")
              ]),
              h("p", { className: "text-sm text-slate-400 mt-1" }, "Adjust RAM, storage, memory bus bandwidth, and NPU TOPS to test unreleased or custom devices.")
            ]),

            h(
              "form",
              { onSubmit: handleSaveCustom, className: "space-y-6" },
              [
                h("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, [
                  h("div", { className: "space-y-1.5" }, [
                    h("label", { className: "text-xs font-semibold text-slate-300" }, "Device Name:"),
                    h("input", {
                      type: "text",
                      value: customName,
                      onChange: (e) => setCustomName(e.target.value),
                      className: "w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:border-cyan-400 outline-none"
                    })
                  ]),
                  h("div", { className: "space-y-1.5" }, [
                    h("label", { className: "text-xs font-semibold text-slate-300" }, "Processor / SoC Name:"),
                    h("input", {
                      type: "text",
                      value: customSoc,
                      onChange: (e) => setCustomSoc(e.target.value),
                      className: "w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:border-cyan-400 outline-none"
                    })
                  ])
                ]),

                // Sliders Grid
                h("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6" }, [
                  // RAM Slider
                  h("div", { className: "space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800" }, [
                    h("div", { className: "flex justify-between items-center text-sm" }, [
                      h("span", { className: "font-semibold text-slate-300" }, "Physical RAM:"),
                      h("span", { className: "font-mono font-bold text-cyan-400 text-base" }, `${customRam} GB`)
                    ]),
                    h("input", {
                      type: "range",
                      min: "2",
                      max: "24",
                      step: "1",
                      value: customRam,
                      onChange: (e) => setCustomRam(e.target.value),
                      className: "w-full"
                    }),
                    h("div", { className: "flex justify-between text-[10px] text-slate-500 font-mono" }, [
                      h("span", null, "2 GB"),
                      h("span", null, "8 GB"),
                      h("span", null, "16 GB"),
                      h("span", null, "24 GB")
                    ])
                  ]),

                  // Free Storage Slider
                  h("div", { className: "space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800" }, [
                    h("div", { className: "flex justify-between items-center text-sm" }, [
                      h("span", { className: "font-semibold text-slate-300" }, "Available Storage:"),
                      h("span", { className: "font-mono font-bold text-emerald-400 text-base" }, `${customStorage} GB`)
                    ]),
                    h("input", {
                      type: "range",
                      min: "4",
                      max: "256",
                      step: "4",
                      value: customStorage,
                      onChange: (e) => setCustomStorage(e.target.value),
                      className: "w-full"
                    }),
                    h("div", { className: "flex justify-between text-[10px] text-slate-500 font-mono" }, [
                      h("span", null, "4 GB"),
                      h("span", null, "64 GB"),
                      h("span", null, "128 GB"),
                      h("span", null, "256 GB")
                    ])
                  ]),

                  // Memory Bandwidth Slider
                  h("div", { className: "space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800" }, [
                    h("div", { className: "flex justify-between items-center text-sm" }, [
                      h("span", { className: "font-semibold text-slate-300" }, "Memory Bus Bandwidth:"),
                      h("span", { className: "font-mono font-bold text-violet-400 text-base" }, `${customBandwidth} GB/s`)
                    ]),
                    h("input", {
                      type: "range",
                      min: "12",
                      max: "100",
                      step: "2",
                      value: customBandwidth,
                      onChange: (e) => setCustomBandwidth(e.target.value),
                      className: "w-full"
                    }),
                    h("div", { className: "flex justify-between text-[10px] text-slate-500 font-mono" }, [
                      h("span", null, "12 GB/s (Budget)"),
                      h("span", null, "50 GB/s (Mid)"),
                      h("span", null, "77+ GB/s (Elite)")
                    ])
                  ]),

                  // NPU TOPS Slider
                  h("div", { className: "space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800" }, [
                    h("div", { className: "flex justify-between items-center text-sm" }, [
                      h("span", { className: "font-semibold text-slate-300" }, "Dedicated NPU TOPS:"),
                      h("span", { className: "font-mono font-bold text-amber-400 text-base" }, `${customNpu} TOPS`)
                    ]),
                    h("input", {
                      type: "range",
                      min: "0",
                      max: "50",
                      step: "1",
                      value: customNpu,
                      onChange: (e) => setCustomNpu(e.target.value),
                      className: "w-full"
                    }),
                    h("div", { className: "flex justify-between text-[10px] text-slate-500 font-mono" }, [
                      h("span", null, "0 (CPU only)"),
                      h("span", null, "25 (Mid)"),
                      h("span", null, "45+ (Gen 3 / A18)")
                    ])
                  ])
                ]),

                // Save Action
                h("div", { className: "flex items-center space-x-4 pt-2" }, [
                  h(
                    "button",
                    {
                      type: "submit",
                      className: "px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all"
                    },
                    "Save to SQLite & Set as Active Device"
                  ),
                  saveStatus && h("span", { className: "text-sm font-semibold text-emerald-400 animate-pulse" }, saveStatus)
                ])
              ]
            ),

            // Saved Custom Profiles List
            customDevices && customDevices.length > 0 && h(
              "div",
              { className: "mt-8 pt-6 border-t border-slate-800 space-y-3" },
              [
                h("h3", { className: "text-sm font-bold text-slate-300" }, "Saved Custom Device Profiles:"),
                h("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" }, customDevices.map(cd => h(
                  "div",
                  {
                    key: cd.id,
                    onClick: () => setActiveDevice(cd),
                    className: "bg-slate-900/60 p-3 rounded-xl border border-slate-800 hover:border-violet-500 cursor-pointer flex justify-between items-center"
                  },
                  [
                    h("div", null, [
                      h("div", { className: "font-bold text-slate-200 text-sm" }, cd.name),
                      h("div", { className: "text-xs text-slate-400" }, `${cd.soc} • ${cd.ram_gb} GB RAM`)
                    ]),
                    h("span", { className: "text-xs text-cyan-400 font-semibold" }, "Activate →")
                  ]
                )))
              ]
            )
          ]
        )
      ]
    );
  }

  window.DeviceAnalyzer = DeviceAnalyzer;
})();
