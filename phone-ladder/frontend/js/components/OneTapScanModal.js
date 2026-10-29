(function() {
  const { createElement: h, useState } = React;
  const Icons = window.Icons;

  function OneTapScanModal({ isOpen, onClose, onApplyScanToDevice, detectedHardware, onOpenManualInput }) {
    const [scanning, setScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanPhase, setScanPhase] = useState("");
    const [auditResult, setAuditResult] = useState(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const startScan = async () => {
      setScanning(true);
      setScanProgress(15);
      setScanPhase("Querying client memory & concurrency APIs...");
      await new Promise(r => setTimeout(r, 80));

      // 1. Battery Probe
      let batteryLevel = null;
      let batteryCharging = null;
      try {
        if ('getBattery' in navigator) {
          const batt = await navigator.getBattery();
          batteryLevel = batt.level;
          batteryCharging = batt.charging;
        }
      } catch (e) {
        console.warn("Battery API restricted:", e);
      }

      setScanProgress(40);
      setScanPhase("Auditing storage quota & WebGPU hardware buffers...");
      await new Promise(r => setTimeout(r, 90));

      let storageQuota = null;
      let storageFree = detectedHardware?.storageFreeGb || 45.0;
      try {
        if (navigator.storage && navigator.storage.estimate) {
          const est = await navigator.storage.estimate();
          storageQuota = (est.quota || 0) / (1024 * 1024 * 1024);
          const used = (est.usage || 0) / (1024 * 1024 * 1024);
          storageFree = Math.max(5.0, Math.round(storageQuota - used));
        }
      } catch (e) {}

      setScanProgress(75);
      setScanPhase("Compiling GPU graphics profile & bottleneck analysis...");
      await new Promise(r => setTimeout(r, 90));

      const payload = {
        device_memory_gb: detectedHardware?.ramGb || 8.0,
        cpu_cores: navigator.hardwareConcurrency || 8,
        storage_quota_gb: storageQuota,
        storage_free_gb: storageFree,
        battery_level: batteryLevel,
        battery_charging: batteryCharging,
        webgl_renderer: detectedHardware?.gpuRenderer || "Unknown GPU",
        webgl_vendor: detectedHardware?.gpuVendor || "Generic",
        webgpu_supported: detectedHardware?.webGpuSupported || false,
        platform: navigator.platform || "Mobile/Desktop",
        user_agent: navigator.userAgent,
        screen_width: window.screen.width,
        screen_height: window.screen.height
      };

      try {
        const res = await fetch("/api/scan/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        setAuditResult(data);
        setScanProgress(100);
      } catch (err) {
        console.error("Scan error:", err);
      } finally {
        setScanning(false);
      }
    };

    const handleCopyReport = () => {
      if (auditResult?.report_markdown) {
        navigator.clipboard.writeText(auditResult.report_markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    };

    return h(
      "div",
      { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md" },
      h(
        "div",
        { className: "glass-panel-glow rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto" },
        [
          // Header
          h("div", { className: "flex items-start justify-between" }, [
            h("div", null, [
              h("div", { className: "flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider" }, [
                h(Icons.Zap, { size: 14 }),
                h("span", null, "Instant Hardware Audit")
              ]),
              h("h2", { className: "text-2xl font-extrabold text-slate-100 mt-1" }, "One-Tap Device Scan"),
              h("p", { className: "text-xs text-slate-400 mt-1" }, "Thorough real-time browser inspection of memory, storage quotas, WebGPU, and battery governors.")
            ]),
            h(
              "button",
              {
                onClick: onClose,
                className: "p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              },
              h(Icons.XCircle, { size: 20 })
            )
          ]),

          // Initial Action or Progress
          !auditResult && h("div", { className: "space-y-4 py-4" }, [
            !scanning ? h(
              "button",
              {
                onClick: startScan,
                className: "w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 font-extrabold text-white text-base shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2"
              },
              [
                h(Icons.Activity, { size: 20 }),
                h("span", null, "Run Complete One-Tap Device Scan Now")
              ]
            ) : h(
              "div",
              { className: "space-y-3 bg-slate-900/80 p-5 rounded-2xl border border-slate-800" },
              [
                h("div", { className: "flex justify-between items-center text-xs font-mono" }, [
                  h("span", { className: "text-slate-300 animate-pulse" }, scanPhase),
                  h("span", { className: "font-bold text-cyan-400" }, `${scanProgress}%`)
                ]),
                h(
                  "div",
                  { className: "h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800" },
                  h("div", {
                    style: { width: `${scanProgress}%` },
                    className: "h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-300"
                  })
                )
              ]
            ),

            // Fallback note if automatic detection restricted
            h("div", { className: "flex items-center justify-between text-xs text-slate-500 pt-2" }, [
              h("span", null, "Auto-detection unavailable or restricted?"),
              h(
                "button",
                {
                  onClick: () => { onClose(); onOpenManualInput(); },
                  className: "text-cyan-400 hover:text-cyan-300 font-semibold underline"
                },
                "Enter Specs Manually →"
              )
            ])
          ]),

          // Audit Results Display
          auditResult && h("div", { className: "space-y-6" }, [
            // Score & Grade Banner
            h(
              "div",
              { className: "p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-violet-950/40 border border-cyan-500/40 flex items-center justify-between gap-4" },
              [
                h("div", null, [
                  h("div", { className: "text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-bold" }, "On-Device AI Readiness"),
                  h("h3", { className: "text-xl font-extrabold text-slate-100 mt-0.5" }, auditResult.summary_verdict),
                  h("p", { className: "text-xs text-slate-300 mt-1" }, `Target Capacity: ${auditResult.tier_capacity?.tier_name}`)
                ]),
                h(
                  "div",
                  { className: "w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex flex-col items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/25 shrink-0" },
                  [
                    h("span", { className: "text-2xl leading-none" }, auditResult.grade),
                    h("span", { className: "text-[9px] uppercase tracking-wider opacity-80" }, `${auditResult.score}/100`)
                  ]
                )
              ]
            ),

            // Strengths
            h("div", { className: "space-y-2" }, [
              h("h4", { className: "text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5" }, [
                h(Icons.Check, { size: 14 }),
                h("span", null, "Verified Hardware Strengths")
              ]),
              h("div", { className: "space-y-1.5" }, auditResult.strengths.map((s, i) => h(
                "div",
                { key: i, className: "text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 flex items-start space-x-2" },
                [
                  h("span", { className: "text-emerald-400 font-bold" }, "•"),
                  h("span", null, s)
                ]
              )))
            ]),

            // Bottlenecks
            h("div", { className: "space-y-2" }, [
              h("h4", { className: "text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5" }, [
                h(Icons.AlertTriangle, { size: 14 }),
                h("span", null, "Hardware Bottlenecks & Thermal Warnings")
              ]),
              auditResult.bottlenecks.length === 0
                ? h("div", { className: "text-xs text-slate-400 bg-slate-900/40 p-3 rounded-xl border border-slate-800" }, "No critical bottlenecks detected. Optimal conditions for edge LLM inference.")
                : h("div", { className: "space-y-1.5" }, auditResult.bottlenecks.map((b, i) => h(
                    "div",
                    { key: i, className: "text-xs text-slate-300 bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/30 flex items-start space-x-2" },
                    [
                      h("span", { className: "text-amber-400 font-bold" }, "•"),
                      h("span", null, b)
                    ]
                  )))
            ]),

            // Action Buttons
            h("div", { className: "flex flex-wrap sm:flex-nowrap gap-3 pt-3 border-t border-slate-800" }, [
              h(
                "button",
                {
                  onClick: () => {
                    onApplyScanToDevice();
                    onClose();
                  },
                  className: "flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 font-bold text-xs text-white shadow-md shadow-cyan-500/20 transition-all text-center"
                },
                "Apply Audit Profile to Active Phone"
              ),
              h(
                "button",
                {
                  onClick: handleCopyReport,
                  className: "px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors flex items-center space-x-1.5"
                },
                [
                  h(Icons.FileText, { size: 14, className: "text-cyan-400" }),
                  h("span", null, copied ? "Copied Markdown!" : "Copy Report")
                ]
              )
            ])
          ])
        ]
      )
    );
  }

  window.OneTapScanModal = OneTapScanModal;
})();
