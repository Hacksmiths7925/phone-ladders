(function() {
  const { createElement: h, useState, useEffect } = React;
  const Icons = window.Icons;
  const HardwareDetector = window.HardwareDetector;

  function App() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [presets, setPresets] = useState([]);
    const [customDevices, setCustomDevices] = useState([]);
    const [models, setModels] = useState([]);
    const [activeDevice, setActiveDevice] = useState(null);
    const [detectedHardware, setDetectedHardware] = useState(null);
    const [recommendationsData, setRecommendationsData] = useState(null);
    const [selectedCompareIds, setSelectedCompareIds] = useState([]);
    const [modalModel, setModalModel] = useState(null);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Initial load: hardware detection + backend data fetching
    useEffect(() => {
      async function init() {
        try {
          const detected = await HardwareDetector.detect();
          setDetectedHardware(detected);

          const [presetsRes, customRes, modelsRes] = await Promise.all([
            fetch("/api/devices/presets"),
            fetch("/api/devices/custom"),
            fetch("/api/models")
          ]);

          const presetsData = await presetsRes.json();
          const customData = await customRes.json();
          const modelsData = await modelsRes.json();

          setPresets(presetsData);
          setCustomDevices(customData);
          setModels(modelsData);

          const defaultDev = presetsData.find(p => p.id === "galaxy-s24-ultra") || presetsData[0];
          setActiveDevice(defaultDev);
        } catch (err) {
          console.error("Initialization error:", err);
        } finally {
          setLoading(false);
        }
      }
      init();
    }, []);

    // Recalculate recommendations whenever activeDevice changes
    useEffect(() => {
      if (!activeDevice) return;
      fetchRecommendations({
        ram_gb: activeDevice.ram_gb,
        storage_free_gb: activeDevice.default_storage_free_gb || activeDevice.storage_free_gb || 40.0,
        soc: activeDevice.soc,
        npu_tops: activeDevice.npu_tops || 0.0,
        memory_bandwidth_gbps: activeDevice.memory_bandwidth_gbps || 34.0,
        os: activeDevice.os || "Android",
        use_case: "chat",
        priority: "balanced"
      });
    }, [activeDevice?.id, activeDevice?.ram_gb, activeDevice?.soc]);

    const fetchRecommendations = async (inputParams) => {
      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inputParams)
        });
        const data = await res.json();
        setRecommendationsData(data);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      }
    };

    const handleApplyDetectedHardware = () => {
      if (!detectedHardware) return;
      const detectedAsPhone = {
        id: "detected-device",
        brand: detectedHardware.os === "iOS" ? "Apple" : "Detected",
        name: detectedHardware.deviceModelGuess || "Your Connected Device",
        soc: detectedHardware.gpuRenderer || "Browser GPU Engine",
        ram_gb: detectedHardware.ramGb || 8.0,
        default_storage_free_gb: detectedHardware.storageFreeGb || 45.0,
        npu_tops: detectedHardware.npuTops || 15.0,
        memory_bandwidth_gbps: detectedHardware.bandwidthGbps || 38.0,
        os: detectedHardware.os || "Android",
        ladder_tier_capacity: detectedHardware.ramGb >= 12 ? 4 : detectedHardware.ramGb >= 8 ? 3 : 2
      };
      setActiveDevice(detectedAsPhone);
      setActiveTab("dashboard");
    };

    const handleSaveCustomDevice = async (devicePayload) => {
      const res = await fetch("/api/devices/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(devicePayload)
      });
      const created = await res.json();
      setCustomDevices(prev => [created, ...prev]);
      setActiveDevice(created);
      return created;
    };

    const handleToggleCompare = (modelId) => {
      setSelectedCompareIds(prev => {
        if (prev.includes(modelId)) {
          return prev.filter(id => id !== modelId);
        } else {
          if (prev.length >= 4) {
            alert("You can compare up to 4 models simultaneously.");
            return prev;
          }
          return [...prev, modelId];
        }
      });
    };

    const handleClearCompare = () => {
      setSelectedCompareIds([]);
    };

    const handleUpdatePreferences = (prefs) => {
      if (!activeDevice) return;
      fetchRecommendations({
        ram_gb: activeDevice.ram_gb,
        storage_free_gb: activeDevice.default_storage_free_gb || activeDevice.storage_free_gb || 40.0,
        soc: activeDevice.soc,
        npu_tops: activeDevice.npu_tops || 0.0,
        memory_bandwidth_gbps: activeDevice.memory_bandwidth_gbps || 34.0,
        os: activeDevice.os || "Android",
        use_case: prefs.use_case,
        priority: prefs.priority
      });
    };

    if (loading) {
      return h(
        "div",
        { className: "min-h-screen bg-[#07080d] flex flex-col items-center justify-center space-y-4" },
        [
          h("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 animate-spin flex items-center justify-center shadow-lg shadow-cyan-500/30" },
            h(Icons.Zap, { size: 24, color: "#fff" })
          ),
          h("div", { className: "text-slate-300 font-mono text-sm tracking-wider" }, "INITIALIZING PHONE LADDER ENGINE..."),
          h("div", { className: "text-slate-500 text-xs" }, "Probing browser WebGPU & querying SQLite...")
        ]
      );
    }

    return h(
      "div",
      { className: "min-h-screen bg-[#07080d] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950" },
      [
        // Top Navigation Bar
        h(window.Navbar, {
          key: "navbar",
          activeTab,
          setActiveTab,
          activeDevice,
          onOpenDeviceSelector: () => setActiveTab("analyzer"),
          onOpenScanModal: () => setIsScanModalOpen(true)
        }),

        // Main Content Container
        h(
          "main",
          { key: "main-content", className: "flex-1 px-4 sm:px-6 lg:px-8 pt-8 max-w-7xl mx-auto w-full" },
          [
            // Core Views
            activeTab === "dashboard" && h(window.Dashboard, {
              key: "dashboard-view",
              activeDevice,
              recommendationsData,
              onNavigate: setActiveTab,
              onSelectModelForDetails: setModalModel,
              onToggleCompare: handleToggleCompare,
              selectedCompareIds,
              onOpenScanModal: () => setIsScanModalOpen(true)
            }),

            activeTab === "analyzer" && h(window.DeviceAnalyzer, {
              key: "analyzer-view",
              activeDevice,
              setActiveDevice,
              presets,
              customDevices,
              onSaveCustomDevice: handleSaveCustomDevice,
              detectedHardware,
              onApplyDetectedHardware: handleApplyDetectedHardware
            }),

            activeTab === "explorer" && h(window.ModelExplorer, {
              key: "explorer-view",
              models,
              activeDevice,
              onSelectModelForDetails: setModalModel,
              onToggleCompare: handleToggleCompare,
              selectedCompareIds
            }),

            activeTab === "comparison" && h(window.ModelComparison, {
              key: "comparison-view",
              models,
              activeDevice,
              selectedCompareIds,
              onToggleCompare: handleToggleCompare,
              onClearCompare: handleClearCompare
            }),

            activeTab === "benchmark" && h(window.BenchmarkLab, {
              key: "benchmark-view",
              activeDevice,
              detectedHardware
            }),

            activeTab === "recommendations" && h(window.RecommendationsView, {
              key: "recommendations-view",
              activeDevice,
              recommendationsData,
              onUpdatePreferences: handleUpdatePreferences,
              onSelectModelForDetails: setModalModel,
              onToggleCompare: handleToggleCompare,
              selectedCompareIds
            }),

            // Advanced Feature Views
            activeTab === "monitor" && h(window.LiveMonitor, {
              key: "monitor-view",
              activeDevice,
              models,
              onSwitchModel: (mId) => {
                fetchRecommendations({
                  ram_gb: activeDevice.ram_gb,
                  storage_free_gb: activeDevice.default_storage_free_gb || 40.0,
                  soc: activeDevice.soc,
                  npu_tops: activeDevice.npu_tops || 0.0,
                  memory_bandwidth_gbps: activeDevice.memory_bandwidth_gbps || 34.0,
                  os: activeDevice.os || "Android",
                  use_case: "chat",
                  priority: "speed"
                });
              }
            }),

            activeTab === "offline" && h(window.OfflineModeView, {
              key: "offline-view",
              models,
              activeDevice,
              detectedHardware
            }),

            activeTab === "leaderboard" && h(window.CommunityLeaderboard, {
              key: "leaderboard-view",
              activeDevice,
              models
            }),

            activeTab === "storage" && h(window.StorageManagerView, {
              key: "storage-view",
              models,
              activeDevice,
              detectedHardware
            }),

            activeTab === "quality" && h(window.QualityTestView, {
              key: "quality-view",
              models
            }),

            activeTab === "privacy" && h(window.PrivacyCenterView, {
              key: "privacy-view"
            })
          ]
        ),

        // 1-Tap Device Scan Modal
        h(window.OneTapScanModal, {
          key: "scan-modal",
          isOpen: isScanModalOpen,
          onClose: () => setIsScanModalOpen(false),
          onApplyScanToDevice: handleApplyDetectedHardware,
          detectedHardware,
          onOpenManualInput: () => setActiveTab("analyzer")
        }),

        // Deep Specs Modal
        modalModel && h(
          "div",
          {
            key: "modal",
            className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          },
          h(
            "div",
            { className: "glass-panel-glow rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto" },
            [
              h("div", { className: "flex items-start justify-between" }, [
                h("div", null, [
                  h("div", { className: "flex items-center space-x-2 text-xs font-mono font-bold text-violet-400 uppercase" }, [
                    h("span", null, modalModel.developer),
                    h("span", null, "•"),
                    h("span", { className: "text-cyan-400" }, modalModel.parameters_display),
                    h("span", null, "•"),
                    h("span", { className: "text-slate-400" }, `Tier ${modalModel.ladder_tier}`)
                  ]),
                  h("h2", { className: "text-2xl font-bold text-slate-100 mt-1" }, modalModel.name),
                  h("p", { className: "text-xs text-slate-400 mt-1" }, modalModel.description)
                ]),
                h(
                  "button",
                  {
                    onClick: () => setModalModel(null),
                    className: "p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                  },
                  h(Icons.XCircle, { size: 20 })
                )
              ]),

              // Memory Budget Breakdown
              h("div", { className: "bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-3" }, [
                h("h3", { className: "text-sm font-bold text-slate-200 flex items-center space-x-2" }, [
                  h(Icons.MemoryStick, { size: 16, className: "text-cyan-400" }),
                  h("span", null, "On-Device Memory Budget (Q4_K_M Quantization)")
                ]),
                h("div", { className: "grid grid-cols-3 gap-3 text-xs font-mono" }, [
                  h("div", { className: "bg-slate-950/60 p-3 rounded-xl border border-slate-800/80" }, [
                    h("div", { className: "text-slate-500 text-[10px]" }, "Weights File"),
                    h("div", { className: "font-bold text-cyan-400 text-base" }, `${modalModel.quantizations?.Q4_K_M?.file_size_gb || 2.0} GB`)
                  ]),
                  h("div", { className: "bg-slate-950/60 p-3 rounded-xl border border-slate-800/80" }, [
                    h("div", { className: "text-slate-500 text-[10px]" }, "2K Context KV"),
                    h("div", { className: "font-bold text-violet-400 text-base" }, `~${Math.round(modalModel.parameters * 0.09 * 10)/10} GB`)
                  ]),
                  h("div", { className: "bg-slate-950/60 p-3 rounded-xl border border-slate-800/80" }, [
                    h("div", { className: "text-slate-500 text-[10px]" }, "Runtime Buffer"),
                    h("div", { className: "font-bold text-emerald-400 text-base" }, "0.35 GB")
                  ])
                ])
              ]),

              // Benchmarks Grid
              h("div", { className: "space-y-3" }, [
                h("h3", { className: "text-sm font-bold text-slate-200" }, "Empirical Benchmark Accuracy:"),
                h("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-center" }, [
                  h("div", { className: "bg-slate-900/60 p-3 rounded-xl border border-slate-800" }, [
                    h("div", { className: "text-[10px] text-slate-400 font-semibold" }, "MMLU"),
                    h("div", { className: "text-lg font-bold font-mono text-amber-300" }, `${modalModel.mmlu_score}%`)
                  ]),
                  h("div", { className: "bg-slate-900/60 p-3 rounded-xl border border-slate-800" }, [
                    h("div", { className: "text-[10px] text-slate-400 font-semibold" }, "GSM8K Math"),
                    h("div", { className: "text-lg font-bold font-mono text-cyan-300" }, `${modalModel.gsm8k_score}%`)
                  ]),
                  h("div", { className: "bg-slate-900/60 p-3 rounded-xl border border-slate-800" }, [
                    h("div", { className: "text-[10px] text-slate-400 font-semibold" }, "HumanEval Code"),
                    h("div", { className: "text-lg font-bold font-mono text-violet-300" }, `${modalModel.humaneval_score}%`)
                  ]),
                  h("div", { className: "bg-slate-900/60 p-3 rounded-xl border border-slate-800" }, [
                    h("div", { className: "text-[10px] text-slate-400 font-semibold" }, "MT-Bench"),
                    h("div", { className: "text-lg font-bold font-mono text-emerald-300" }, `${modalModel.mt_bench_score}`)
                  ])
                ])
              ]),

              // Recommended Mobile Runtimes
              h("div", { className: "space-y-2" }, [
                h("h3", { className: "text-sm font-bold text-slate-200" }, "Recommended Execution Runtimes:"),
                h("div", { className: "flex flex-wrap gap-2" }, (modalModel.recommended_runtimes || []).map((rt, i) => h(
                  "span",
                  { key: i, className: "px-3 py-1 rounded-lg text-xs font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-800/40" },
                  rt
                )))
              ]),

              // Footer
              h("div", { className: "flex items-center justify-between pt-4 border-t border-slate-800" }, [
                h(
                  "a",
                  {
                    href: modalModel.huggingface_url,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                  },
                  [
                    h("span", null, "View on Hugging Face"),
                    h(Icons.ExternalLink, { size: 14 })
                  ]
                ),
                h(
                  "button",
                  {
                    onClick: () => setModalModel(null),
                    className: "px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition-colors"
                  },
                  "Done"
                )
              ])
            ]
          )
        ),

        // Footer
        h(
          "footer",
          { key: "footer", className: "w-full border-t border-slate-900 py-6 text-center text-xs text-slate-500 mb-14 md:mb-0" },
          "Phone Ladder 2.0 • Advanced Mobile AI Benchmark Suite • Powered by FastAPI & React"
        )
      ]
    );
  }

  // Mount React App
  ReactDOM.createRoot(document.getElementById("root")).render(h(App));
})();
