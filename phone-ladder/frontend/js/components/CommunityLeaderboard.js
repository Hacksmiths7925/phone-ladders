(function() {
  const { createElement: h, useState, useEffect } = React;
  const Icons = window.Icons;

  function CommunityLeaderboard({ activeDevice, models }) {
    const [benchmarks, setBenchmarks] = useState([]);
    const [runtimeFilter, setRuntimeFilter] = useState("All");
    const [verificationFilter, setVerificationFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    // Submission form
    const [subPhone, setSubPhone] = useState(activeDevice?.name || "My Smartphone");
    const [subSoc, setSubSoc] = useState(activeDevice?.soc || "Snapdragon 8 Gen 3");
    const [subRam, setSubRam] = useState(activeDevice?.ram_gb || 8.0);
    const [subModelId, setSubModelId] = useState("llama-3.2-3b-instruct");
    const [subRuntime, setSubRuntime] = useState("WebGPU / WebLLM");
    const [subGenSpeed, setSubGenSpeed] = useState(24.5);
    const [subConsent, setSubConsent] = useState(false);
    const [submitStatus, setSubmitStatus] = useState("");

    useEffect(() => {
      fetchBenchmarks();
    }, [runtimeFilter, verificationFilter]);

    const fetchBenchmarks = async () => {
      try {
        let url = "/api/community/benchmarks?";
        if (runtimeFilter !== "All") url += `runtime=${encodeURIComponent(runtimeFilter)}&`;
        if (verificationFilter !== "All") url += `verification=${encodeURIComponent(verificationFilter)}&`;
        const res = await fetch(url);
        const data = await res.json();
        setBenchmarks(data || []);
      } catch (err) {
        console.error("Failed to fetch community benchmarks:", err);
      }
    };

    const handleUpvote = async (id) => {
      try {
        const res = await fetch(`/api/community/benchmarks/${id}/upvote`, { method: "POST" });
        if (res.ok) {
          const updated = await res.json();
          setBenchmarks(prev => prev.map(b => b.id === id ? { ...b, upvotes: updated.upvotes } : b));
        }
      } catch (e) {}
    };

    const handleSubmitBenchmark = async (e) => {
      e.preventDefault();
      if (!subConsent) {
        alert("Please grant privacy consent to share your benchmark to the community leaderboard.");
        return;
      }
      setSubmitStatus("Submitting...");
      try {
        const selectedModel = models.find(m => m.id === subModelId);
        const res = await fetch("/api/community/benchmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_name: subPhone,
            chip_soc: subSoc,
            ram_gb: parseFloat(subRam),
            model_id: subModelId,
            model_name: selectedModel ? selectedModel.name : subModelId,
            runtime: subRuntime,
            gen_speed_tok_s: parseFloat(subGenSpeed),
            consent_given: subConsent
          })
        });
        if (res.ok) {
          setSubmitStatus("Benchmark Published!");
          fetchBenchmarks();
          setTimeout(() => {
            setShowSubmitModal(false);
            setSubmitStatus("");
          }, 1500);
        }
      } catch (err) {
        setSubmitStatus("Submission failed");
      }
    };

    const filtered = benchmarks.filter(b => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return b.phone_name.toLowerCase().includes(q) || b.model_name.toLowerCase().includes(q) || b.chip_soc.toLowerCase().includes(q);
    });

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
                h(Icons.Globe, { size: 24, className: "text-cyan-400" }),
                h("h1", { className: "text-2xl sm:text-3xl font-extrabold text-slate-100" }, "Community AI Benchmark Leaderboard")
              ]),
              h("p", { className: "text-slate-400 text-sm" }, "Verified on-device LLM throughput results across smartphones, chipsets, and mobile runtimes.")
            ]),
            h(
              "button",
              {
                onClick: () => setShowSubmitModal(true),
                className: "px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2"
              },
              [
                h(Icons.Award, { size: 16 }),
                h("span", null, "Submit Your Benchmark")
              ]
            )
          ]
        ),

        // Filter Bar
        h(
          "div",
          { key: "filters", className: "glass-panel rounded-2xl p-5 space-y-4" },
          [
            // Search Bar
            h("div", { className: "relative" }, [
              h(Icons.Search, { size: 16, className: "absolute left-4 top-3.5 text-slate-400" }),
              h("input", {
                type: "text",
                placeholder: "Filter by phone (e.g. S24 Ultra, iPhone 16 Pro, Pixel 9) or model name...",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:border-cyan-400 outline-none"
              })
            ]),

            // Runtime and Verification Pills
            h("div", { className: "flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800" }, [
              // Runtime
              h("div", { className: "flex flex-wrap items-center gap-2" }, [
                h("span", { className: "text-xs font-semibold text-slate-400 mr-1" }, "Runtime:"),
                ["All", "WebGPU", "PocketPal AI", "MLC Chat", "llama.cpp"].map(rt => h(
                  "button",
                  {
                    key: rt,
                    onClick: () => setRuntimeFilter(rt),
                    className: `px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      runtimeFilter === rt
                        ? "bg-cyan-500 text-slate-950 font-bold"
                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700"
                    }`
                  },
                  rt
                ))
              ]),

              // Verification
              h("div", { className: "flex items-center gap-2" }, [
                h("span", { className: "text-xs font-semibold text-slate-400 mr-1" }, "Status:"),
                ["All", "VERIFIED", "COMMUNITY"].map(vf => h(
                  "button",
                  {
                    key: vf,
                    onClick: () => setVerificationFilter(vf),
                    className: `px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      verificationFilter === vf
                        ? "bg-violet-600 text-white font-bold"
                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700"
                    }`
                  },
                  vf
                ))
              ])
            ])
          ]
        ),

        // Leaderboard Table
        h(
          "div",
          { key: "leaderboard-table", className: "glass-panel-glow rounded-2xl p-6 sm:p-8 space-y-4" },
          [
            h("div", { className: "flex justify-between items-center text-xs text-slate-400" }, [
              h("span", { className: "font-semibold" }, `Displaying ${filtered.length} benchmark results`),
              h("div", { className: "flex items-center space-x-3 text-[11px]" }, [
                h("span", { className: "flex items-center space-x-1" }, [
                  h("span", { className: "w-2 h-2 rounded-full bg-cyan-400" }),
                  h("span", null, "Verified Hardware")
                ]),
                h("span", { className: "flex items-center space-x-1" }, [
                  h("span", { className: "w-2 h-2 rounded-full bg-violet-400" }),
                  h("span", null, "Community Submitted")
                ])
              ])
            ]),

            h(
              "div",
              { className: "overflow-x-auto" },
              h(
                "table",
                { className: "w-full text-left text-xs font-mono" },
                [
                  h("thead", null, h("tr", { className: "border-b border-slate-800 text-slate-400" }, [
                    h("th", { className: "py-3 px-3 font-semibold" }, "Phone & Processor"),
                    h("th", { className: "py-3 px-3 font-semibold" }, "AI Model"),
                    h("th", { className: "py-3 px-3 font-semibold" }, "Mobile Runtime"),
                    h("th", { className: "py-3 px-3 font-semibold text-right text-emerald-400" }, "Gen Speed"),
                    h("th", { className: "py-3 px-3 font-semibold text-right" }, "TTFT"),
                    h("th", { className: "py-3 px-3 font-semibold text-center" }, "Verification"),
                    h("th", { className: "py-3 px-3 font-semibold text-center" }, "Upvotes")
                  ])),
                  h("tbody", { className: "divide-y divide-slate-800/60" }, filtered.map(b => h(
                    "tr",
                    { key: b.id, className: "hover:bg-slate-900/50" },
                    [
                      h("td", { className: "py-3 px-3" }, [
                        h("div", { className: "font-bold text-slate-100 font-sans" }, b.phone_name),
                        h("div", { className: "text-[11px] text-slate-500" }, `${b.chip_soc} • ${b.ram_gb} GB`)
                      ]),
                      h("td", { className: "py-3 px-3 font-bold text-cyan-300" }, b.model_name),
                      h("td", { className: "py-3 px-3 text-slate-300" }, b.runtime),
                      h("td", { className: "py-3 px-3 text-right font-extrabold text-emerald-400 text-sm" }, `${b.gen_speed_tok_s} tok/s`),
                      h("td", { className: "py-3 px-3 text-right text-slate-400" }, `${b.ttft_ms} ms`),
                      h("td", { className: "py-3 px-3 text-center" }, [
                        h(
                          "span",
                          {
                            className: `px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.verification_type === "VERIFIED"
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                                : "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                            }`
                          },
                          b.verification_type === "VERIFIED" ? "VERIFIED RUN" : "COMMUNITY"
                        )
                      ]),
                      h("td", { className: "py-3 px-3 text-center" }, [
                        h(
                          "button",
                          {
                            onClick: () => handleUpvote(b.id),
                            className: "px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-cyan-400 flex items-center space-x-1 mx-auto transition-colors"
                          },
                          [
                            h(Icons.TrendingUp, { size: 12, className: "text-cyan-400" }),
                            h("span", null, b.upvotes)
                          ]
                        )
                      ])
                    ]
                  )))
                ]
              )
            )
          ]
        ),

        // Submission Modal
        showSubmitModal && h(
          "div",
          { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" },
          h(
            "div",
            { className: "glass-panel-glow rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5" },
            [
              h("div", { className: "flex justify-between items-start" }, [
                h("div", null, [
                  h("h3", { className: "text-xl font-bold text-slate-100" }, "Submit Device Benchmark"),
                  h("p", { className: "text-xs text-slate-400 mt-1" }, "Contribute verified on-device numbers to help the mobile AI community.")
                ]),
                h(
                  "button",
                  { onClick: () => setShowSubmitModal(false), className: "p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400" },
                  h(Icons.XCircle, { size: 18 })
                )
              ]),

              h("form", { onSubmit: handleSubmitBenchmark, className: "space-y-4 text-xs font-mono" }, [
                h("div", { className: "space-y-1" }, [
                  h("label", { className: "text-slate-300 font-sans font-semibold" }, "Smartphone Model:"),
                  h("input", {
                    type: "text",
                    value: subPhone,
                    onChange: (e) => setSubPhone(e.target.value),
                    required: true,
                    className: "w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-cyan-400"
                  })
                ]),
                h("div", { className: "grid grid-cols-2 gap-3" }, [
                  h("div", { className: "space-y-1" }, [
                    h("label", { className: "text-slate-300 font-sans font-semibold" }, "Processor / SoC:"),
                    h("input", {
                      type: "text",
                      value: subSoc,
                      onChange: (e) => setSubSoc(e.target.value),
                      required: true,
                      className: "w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-cyan-400"
                    })
                  ]),
                  h("div", { className: "space-y-1" }, [
                    h("label", { className: "text-slate-300 font-sans font-semibold" }, "RAM (GB):"),
                    h("input", {
                      type: "number",
                      value: subRam,
                      onChange: (e) => setSubRam(e.target.value),
                      required: true,
                      className: "w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-cyan-400"
                    })
                  ])
                ]),
                h("div", { className: "grid grid-cols-2 gap-3" }, [
                  h("div", { className: "space-y-1" }, [
                    h("label", { className: "text-slate-300 font-sans font-semibold" }, "Model Tested:"),
                    h("select", {
                      value: subModelId,
                      onChange: (e) => setSubModelId(e.target.value),
                      className: "w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-cyan-400"
                    }, models.map(m => h("option", { key: m.id, value: m.id }, m.name)))
                  ]),
                  h("div", { className: "space-y-1" }, [
                    h("label", { className: "text-slate-300 font-sans font-semibold" }, "Mobile Runtime:"),
                    h("select", {
                      value: subRuntime,
                      onChange: (e) => setSubRuntime(e.target.value),
                      className: "w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-cyan-400"
                    }, [
                      h("option", { value: "WebGPU / WebLLM" }, "WebGPU / WebLLM"),
                      h("option", { value: "PocketPal AI (iOS Metal)" }, "PocketPal AI (iOS Metal)"),
                      h("option", { value: "MLC Chat (Android Vulkan)" }, "MLC Chat (Android Vulkan)"),
                      h("option", { value: "llama.cpp (Termux)" }, "llama.cpp (Termux)")
                    ])
                  ])
                ]),
                h("div", { className: "space-y-1" }, [
                  h("label", { className: "text-slate-300 font-sans font-semibold" }, "Measured Generation Speed (tokens/sec):"),
                  h("input", {
                    type: "number",
                    step: "0.1",
                    value: subGenSpeed,
                    onChange: (e) => setSubGenSpeed(e.target.value),
                    required: true,
                    className: "w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-cyan-400"
                  })
                ]),

                // Privacy Consent Checkbox
                h("div", { className: "p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2" }, [
                  h("label", { className: "flex items-start space-x-2.5 cursor-pointer text-[11px] text-slate-300" }, [
                    h("input", {
                      type: "checkbox",
                      checked: subConsent,
                      onChange: (e) => setSubConsent(e.target.checked),
                      className: "mt-0.5 rounded border-slate-700 bg-slate-800 text-cyan-400"
                    }),
                    h("span", null, "I give consent to publish this anonymized hardware benchmark to the public community leaderboard. No personal data or prompts are transmitted.")
                  ])
                ]),

                h("div", { className: "flex items-center space-x-3 pt-2" }, [
                  h(
                    "button",
                    {
                      type: "submit",
                      disabled: !subConsent,
                      className: "flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20 disabled:opacity-50"
                    },
                    "Publish Benchmark"
                  ),
                  submitStatus && h("span", { className: "text-xs font-semibold text-emerald-400 animate-pulse" }, submitStatus)
                ])
              ])
            ]
          )
        )
      ]
    );
  }

  window.CommunityLeaderboard = CommunityLeaderboard;
})();
