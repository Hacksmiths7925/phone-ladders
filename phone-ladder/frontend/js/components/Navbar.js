(function() {
  const { createElement: h, useState } = React;
  const Icons = window.Icons;

  function Navbar({ activeTab, setActiveTab, activeDevice, onOpenDeviceSelector, onOpenScanModal }) {
    const [moreOpen, setMoreOpen] = useState(false);

    const primaryItems = [
      { id: "dashboard", label: "Dashboard", icon: Icons.Activity },
      { id: "analyzer", label: "Device Analyzer", icon: Icons.Smartphone },
      { id: "recommendations", label: "Recommendations", icon: Icons.Sparkles },
      { id: "explorer", label: "Models", icon: Icons.Layers },
      { id: "comparison", label: "Compare", icon: Icons.Scale },
      { id: "benchmark", label: "Benchmark Lab", icon: Icons.Gauge },
    ];

    const advancedItems = [
      { id: "monitor", label: "Live Monitor & Switch", icon: Icons.Radio, desc: "Real-time telemetry & smart model switching" },
      { id: "offline", label: "Offline AI Mode", icon: Icons.HardDrive, desc: "Download and run local inference" },
      { id: "leaderboard", label: "Community Leaderboard", icon: Icons.Globe, desc: "Verified smartphone benchmark scores" },
      { id: "storage", label: "Smart Storage Manager", icon: Icons.Download, desc: "Pre-download space feasibility" },
      { id: "quality", label: "Bilingual Quality Test", icon: Icons.Languages, desc: "Hindi & English evaluation suite" },
      { id: "privacy", label: "Privacy Center", icon: Icons.Lock, desc: "Data transparency & local data wiping" },
    ];

    const isAdvancedActive = advancedItems.some(i => i.id === activeTab);

    return h(
      "header",
      { className: "sticky top-0 z-40 w-full glass-panel border-b border-subtle backdrop-blur-md" },
      [
        // Desktop / Header bar
        h(
          "div",
          { key: "nav-container", className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" },
          [
            // Brand & Logo
            h(
              "div",
              {
                key: "brand",
                className: "flex items-center space-x-3 cursor-pointer shrink-0",
                onClick: () => setActiveTab("dashboard")
              },
              [
                h(
                  "div",
                  { key: "logo-box", className: "w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20" },
                  h(Icons.Zap, { size: 20, color: "#ffffff" })
                ),
                h(
                  "div",
                  { key: "brand-text", className: "hidden sm:block" },
                  [
                    h("span", { key: "title", className: "text-base font-extrabold text-gradient tracking-tight" }, "Phone Ladder"),
                    h("span", { key: "subtitle", className: "block text-[9px] text-cyan-400 font-mono tracking-wider uppercase font-semibold" }, "Mobile AI Intelligence")
                  ]
                )
              ]
            ),

            // Desktop Primary Navigation
            h(
              "nav",
              { key: "desktop-links", className: "hidden md:flex items-center space-x-1" },
              [
                ...primaryItems.map(item => {
                  const isActive = activeTab === item.id;
                  return h(
                    "button",
                    {
                      key: item.id,
                      onClick: () => { setActiveTab(item.id); setMoreOpen(false); },
                      className: `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-violet-500/20 text-cyan-300 border border-violet-500/40 shadow-sm shadow-violet-500/20"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`
                    },
                    [
                      h(item.icon, { size: 14 }),
                      h("span", null, item.label)
                    ]
                  );
                }),

                // "More Tools" Dropdown
                h(
                  "div",
                  { key: "more-dropdown", className: "relative" },
                  [
                    h(
                      "button",
                      {
                        onClick: () => setMoreOpen(!moreOpen),
                        className: `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isAdvancedActive
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        }`
                      },
                      [
                        h(Icons.Sliders, { size: 14 }),
                        h("span", null, "More Tools"),
                        h(Icons.ChevronRight, { size: 12, className: `transform transition-transform ${moreOpen ? "rotate-90" : ""}` })
                      ]
                    ),

                    // Dropdown Menu
                    moreOpen && h(
                      "div",
                      {
                        className: "absolute right-0 mt-2 w-64 rounded-2xl glass-panel-glow p-2 shadow-2xl border border-slate-700 z-50 space-y-1"
                      },
                      advancedItems.map(item => h(
                        "button",
                        {
                          key: item.id,
                          onClick: () => {
                            setActiveTab(item.id);
                            setMoreOpen(false);
                          },
                          className: `w-full text-left p-2.5 rounded-xl transition-all flex items-start space-x-2.5 ${
                            activeTab === item.id
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              : "hover:bg-slate-800/80 text-slate-300"
                          }`
                        },
                        [
                          h(item.icon, { size: 16, className: "mt-0.5 text-cyan-400 shrink-0" }),
                          h("div", null, [
                            h("div", { className: "text-xs font-bold" }, item.label),
                            h("div", { className: "text-[10px] text-slate-400" }, item.desc)
                          ])
                        ]
                      ))
                    )
                  ]
                )
              ]
            ),

            // Right Actions: One-Tap Scan & Active Device
            h(
              "div",
              { key: "right-actions", className: "flex items-center space-x-2" },
              [
                // One-Tap Scan Button
                h(
                  "button",
                  {
                    key: "btn-one-tap-scan",
                    onClick: onOpenScanModal,
                    className: "hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-xs font-bold shadow-sm shadow-cyan-500/20 transition-all"
                  },
                  [
                    h(Icons.Zap, { size: 13 }),
                    h("span", null, "1-Tap Scan")
                  ]
                ),

                // Active Device Pill
                h(
                  "button",
                  {
                    key: "dev-btn",
                    onClick: onOpenDeviceSelector,
                    className: "flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 text-xs text-slate-200 transition-all hover:shadow-sm"
                  },
                  [
                    h(Icons.Smartphone, { size: 13, className: "text-cyan-400" }),
                    h(
                      "span",
                      { className: "font-medium truncate max-w-[100px] sm:max-w-[130px]" },
                      activeDevice ? activeDevice.name : "Device"
                    ),
                    h(
                      "span",
                      { className: "px-1.5 py-0.5 rounded bg-cyan-950/80 text-[10px] font-mono text-cyan-300 border border-cyan-800/50" },
                      activeDevice ? `${activeDevice.ram_gb}G` : "RAM"
                    )
                  ]
                )
              ]
            )
          ]
        ),

        // Mobile Bottom Navigation Bar
        h(
          "nav",
          {
            key: "mobile-bottom-nav",
            className: "md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-subtle px-1 py-1.5 flex justify-around items-center bg-slate-950/95"
          },
          [
            ...primaryItems.slice(0, 4),
            { id: "more_mobile", label: "More", icon: Icons.Sliders }
          ].map(item => {
            const isMoreTab = item.id === "more_mobile";
            const isActive = isMoreTab ? isAdvancedActive : activeTab === item.id;

            return h(
              "button",
              {
                key: item.id,
                onClick: () => {
                  if (isMoreTab) {
                    setActiveTab(isAdvancedActive ? activeTab : "monitor");
                  } else {
                    setActiveTab(item.id);
                  }
                },
                className: `flex flex-col items-center py-1 px-1.5 rounded-lg text-[10px] font-medium transition-all ${
                  isActive ? "text-cyan-400 font-bold" : "text-slate-400"
                }`
              },
              [
                h(item.icon, { size: 16, className: isActive ? "text-cyan-400" : "text-slate-400" }),
                h("span", { className: "mt-0.5 truncate max-w-[52px]" }, item.label)
              ]
            );
          })
        )
      ]
    );
  }

  window.Navbar = Navbar;
})();
