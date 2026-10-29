(function() {
  const { createElement: h, useState } = React;
  const Icons = window.Icons;

  function PrivacyCenterView() {
    const [allowLeaderboardShare, setAllowLeaderboardShare] = useState(() => {
      return localStorage.getItem("phone_ladder_privacy_share") === "true";
    });
    const [strictLocalMode, setStrictLocalMode] = useState(() => {
      return localStorage.getItem("phone_ladder_strict_local") === "true";
    });
    const [wipeStatus, setWipeStatus] = useState("");

    const handleToggleShare = (val) => {
      setAllowLeaderboardShare(val);
      localStorage.setItem("phone_ladder_privacy_share", val ? "true" : "false");
    };

    const handleToggleStrict = (val) => {
      setStrictLocalMode(val);
      localStorage.setItem("phone_ladder_strict_local", val ? "true" : "false");
    };

    const handleExportData = () => {
      const data = {
        offline_models: JSON.parse(localStorage.getItem("phone_ladder_offline_models") || "[]"),
        privacy_settings: {
          allow_leaderboard_share: allowLeaderboardShare,
          strict_local_mode: strictLocalMode
        },
        exported_at: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `phone-ladder-privacy-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const handleWipeData = async () => {
      if (!confirm("Are you sure you want to permanently erase all custom devices and benchmark runs from the SQLite database?")) {
        return;
      }
      setWipeStatus("Erasing local database records...");
      try {
        const res = await fetch("/api/privacy/wipe", { method: "POST" });
        const data = await res.json();
        setWipeStatus(`Wiped successfully! ${data.custom_devices_wiped} custom devices and ${data.benchmarks_wiped} benchmark runs erased.`);
        setTimeout(() => setWipeStatus(""), 4000);
      } catch (err) {
        setWipeStatus("Error wiping database records");
      }
    };

    return h(
      "div",
      { className: "space-y-8 max-w-7xl mx-auto pb-12" },
      [
        // Header
        h(
          "div",
          { key: "header", className: "space-y-1" },
          [
            h("div", { className: "flex items-center space-x-2" }, [
              h(Icons.Lock, { size: 24, className: "text-emerald-400" }),
              h("h1", { className: "text-2xl sm:text-3xl font-extrabold text-slate-100" }, "Privacy Center & Data Transparency")
            ]),
            h("p", { className: "text-slate-400 text-sm max-w-2xl" }, "Complete transparency into what data stays on your phone, what communicates with the server, and full user data sovereignty.")
          ]
        ),

        wipeStatus && h(
          "div",
          { key: "wipe-banner", className: "p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-xs text-emerald-300 font-semibold flex items-center space-x-2 animate-pulse" },
          [
            h(Icons.Check, { size: 16 }),
            h("span", null, wipeStatus)
          ]
        ),

        // Data Governance Matrix Card
        h(
          "div",
          { key: "matrix-card", className: "glass-panel-glow rounded-2xl p-6 sm:p-8 space-y-6" },
          [
            h("h2", { className: "text-lg font-bold text-slate-100 flex items-center space-x-2" }, [
              h(Icons.Shield, { size: 18, className: "text-cyan-400" }),
              h("span", null, "Data Sovereignty Matrix")
            ]),

            h("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }, [
              // What Stays On Device
              h("div", { className: "bg-slate-900/80 rounded-2xl p-5 border border-emerald-500/30 space-y-3" }, [
                h("div", { className: "flex items-center space-x-2 text-emerald-400 font-bold text-sm" }, [
                  h(Icons.Check, { size: 16 }),
                  h("span", null, "100% Stays Local on Your Phone")
                ]),
                h("ul", { className: "space-y-2 text-xs text-slate-300" }, [
                  h("li", { className: "flex items-start space-x-2" }, [
                    h("span", { className: "text-emerald-400 font-bold" }, "•"),
                    h("span", null, "Your chat prompts and model generated text in Offline AI Mode.")
                  ]),
                  h("li", { className: "flex items-start space-x-2" }, [
                    h("span", { className: "text-emerald-400 font-bold" }, "•"),
                    h("span", null, "Downloaded model weight files cached in your browser's CacheStorage.")
                  ]),
                  h("li", { className: "flex items-start space-x-2" }, [
                    h("span", { className: "text-emerald-400 font-bold" }, "•"),
                    h("span", null, "Battery level and real-time JS heap memory metrics.")
                  ]),
                  h("li", { className: "flex items-start space-x-2" }, [
                    h("span", { className: "text-emerald-400 font-bold" }, "•"),
                    h("span", null, "Hardware audit scan logs and WebGPU buffer queries.")
                  ])
                ])
              ]),

              // What Communicates with Server
              h("div", { className: "bg-slate-900/80 rounded-2xl p-5 border border-cyan-500/30 space-y-3" }, [
                h("div", { className: "flex items-center space-x-2 text-cyan-400 font-bold text-sm" }, [
                  h(Icons.Server, { size: 16 }),
                  h("span", null, "Communicates with Local / Public API")
                ]),
                h("ul", { className: "space-y-2 text-xs text-slate-300" }, [
                  h("li", { className: "flex items-start space-x-2" }, [
                    h("span", { className: "text-cyan-400 font-bold" }, "•"),
                    h("span", null, "Retrieving model specifications and quantization catalogs.")
                  ]),
                  h("li", { className: "flex items-start space-x-2" }, [
                    h("span", { className: "text-cyan-400 font-bold" }, "•"),
                    h("span", null, "Executing recommendation score calculations against device presets.")
                  ]),
                  h("li", { className: "flex items-start space-x-2" }, [
                    h("span", { className: "text-cyan-400 font-bold" }, "•"),
                    h("span", null, "Community Leaderboard submissions — strictly anonymized and only upon explicit opt-in consent.")
                  ]),
                  h("li", { className: "flex items-start space-x-2" }, [
                    h("span", { className: "text-cyan-400 font-bold" }, "•"),
                    h("span", null, "Zero user tracking, zero advertising cookies, zero telemetry sent to third parties.")
                  ])
                ])
              ])
            ])
          ]
        ),

        // Consent & User Controls Card
        h(
          "div",
          { key: "controls-card", className: "glass-panel rounded-2xl p-6 sm:p-8 space-y-6" },
          [
            h("h2", { className: "text-lg font-bold text-slate-100 flex items-center space-x-2" }, [
              h(Icons.Sliders, { size: 18, className: "text-violet-400" }),
              h("span", null, "Privacy Toggles & Consent Governance")
            ]),

            h("div", { className: "space-y-4" }, [
              // Toggle 1: Community Sharing Consent
              h("div", { className: "flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800" }, [
                h("div", { className: "space-y-0.5" }, [
                  h("div", { className: "text-xs font-bold text-slate-200" }, "Allow Anonymous Benchmark Sharing to Public Leaderboard"),
                  h("p", { className: "text-[11px] text-slate-400" }, "Permits posting anonymized generation speed tokens/sec to the community leaderboard.")
                ]),
                h("input", {
                  type: "checkbox",
                  checked: allowLeaderboardShare,
                  onChange: (e) => handleToggleShare(e.target.checked),
                  className: "w-5 h-5 rounded border-slate-700 bg-slate-800 text-cyan-400 cursor-pointer"
                })
              ]),

              // Toggle 2: Strict Local Only
              h("div", { className: "flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800" }, [
                h("div", { className: "space-y-0.5" }, [
                  h("div", { className: "text-xs font-bold text-slate-200" }, "Strict Local-Only AI Mode"),
                  h("p", { className: "text-[11px] text-slate-400" }, "Disables all non-essential external endpoints; forces pure local execution.")
                ]),
                h("input", {
                  type: "checkbox",
                  checked: strictLocalMode,
                  onChange: (e) => handleToggleStrict(e.target.checked),
                  className: "w-5 h-5 rounded border-slate-700 bg-slate-800 text-emerald-400 cursor-pointer"
                })
              ])
            ]),

            // Action Buttons: Export & Permanent Wipe
            h("div", { className: "flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800" }, [
              h(
                "button",
                {
                  onClick: handleExportData,
                  className: "px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center space-x-1.5 transition-colors"
                },
                [
                  h(Icons.Download, { size: 14, className: "text-cyan-400" }),
                  h("span", null, "Export My Data (JSON)")
                ]
              ),
              h(
                "button",
                {
                  onClick: handleWipeData,
                  className: "px-5 py-2.5 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-800/60 hover:bg-rose-900/40 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                },
                [
                  h(Icons.Trash, { size: 14 }),
                  h("span", null, "Wipe All Custom Devices & Benchmarks from Database")
                ]
              )
            ])
          ]
        )
      ]
    );
  }

  window.PrivacyCenterView = PrivacyCenterView;
})();
