(function() {
  const { createElement: h, useState, useEffect } = React;
  const Icons = window.Icons;

  function QualityTestView({ models }) {
    const [prompts, setPrompts] = useState([]);
    const [selectedPromptId, setSelectedPromptId] = useState("quantum_en");
    const [selectedModelId, setSelectedModelId] = useState("qwen2.5-1.5b-instruct");
    const [evaluating, setEvaluating] = useState(false);
    const [evalResult, setEvalResult] = useState(null);

    useEffect(() => {
      fetch("/api/quality/prompts")
        .then(r => r.json())
        .then(data => setPrompts(data || []))
        .catch(e => console.error("Failed to load quality prompts:", e));
    }, []);

    const handleRunEvaluation = async () => {
      setEvaluating(true);
      setEvalResult(null);
      try {
        const selectedPrompt = prompts.find(p => p.id === selectedPromptId);
        const res = await fetch("/api/quality/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model_id: selectedModelId,
            prompt_id: selectedPromptId,
            language: selectedPrompt?.language || "en"
          })
        });
        const data = await res.json();
        setEvalResult(data);
      } catch (err) {
        console.error("Evaluation error:", err);
      } finally {
        setEvaluating(false);
      }
    };

    const selectedPrompt = prompts.find(p => p.id === selectedPromptId) || prompts[0];

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
              h(Icons.Languages, { size: 24, className: "text-amber-400" }),
              h("h1", { className: "text-2xl sm:text-3xl font-extrabold text-slate-100" }, "Bilingual AI Quality & Comprehension Test")
            ]),
            h("p", { className: "text-slate-400 text-sm max-w-2xl" }, "Standardized multilingual evaluation benchmark testing English and Hindi response quality, mathematical reasoning, and token efficiency.")
          ]
        ),

        // Controls Card
        h(
          "div",
          { key: "controls-card", className: "glass-panel-glow rounded-2xl p-6 sm:p-8 space-y-6" },
          [
            // Prompt Bank Selector
            h("div", { className: "space-y-2" }, [
              h("span", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider" }, "Select Standardized Test Question:"),
              h(
                "div",
                { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" },
                prompts.map(p => {
                  const isSelected = selectedPromptId === p.id;
                  const isHindi = p.language === "hi" || p.language === "multilingual";

                  return h(
                    "div",
                    {
                      key: p.id,
                      onClick: () => setSelectedPromptId(p.id),
                      className: `p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-violet-600/25 border-violet-500 shadow-md shadow-violet-500/20"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      }`
                    },
                    [
                      h("div", { className: "flex justify-between items-center text-xs" }, [
                        h("span", { className: `font-bold ${isHindi ? "text-amber-400" : "text-cyan-400"}` }, isHindi ? "🇮🇳 हिन्दी / Bilingual" : "🇬🇧 English"),
                        h("span", { className: "text-[10px] text-slate-500 uppercase font-mono" }, p.category)
                      ]),
                      h("div", { className: "text-sm font-bold text-slate-100 mt-1" }, p.title),
                      h("div", { className: "text-xs text-slate-400 mt-0.5 line-clamp-2" }, p.prompt)
                    ]
                  );
                })
              )
            ]),

            // Model Selector & Evaluation Trigger
            h("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 items-end" }, [
              h("div", { className: "sm:col-span-2 space-y-1.5" }, [
                h("label", { className: "text-xs font-semibold text-slate-300" }, "Evaluate Model on This Prompt:"),
                h(
                  "select",
                  {
                    value: selectedModelId,
                    onChange: (e) => setSelectedModelId(e.target.value),
                    className: "w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono outline-none focus:border-cyan-400"
                  },
                  models.map(m => h("option", { key: m.id, value: m.id }, `${m.name} (${m.parameters_display}) — MMLU ${m.mmlu_score}%`))
                )
              ]),
              h(
                "button",
                {
                  onClick: handleRunEvaluation,
                  disabled: evaluating,
                  className: "w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-violet-600 hover:from-amber-400 hover:to-violet-500 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                },
                [
                  h(Icons.Zap, { size: 16 }),
                  h("span", null, evaluating ? "Evaluating Quality..." : "Run Quality Test")
                ]
              )
            ])
          ]
        ),

        // Evaluation Results Display
        evalResult && h(
          "div",
          { key: "eval-results-card", className: "glass-panel-glow rounded-2xl p-6 sm:p-8 space-y-6" },
          [
            // Result Header
            h("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3" }, [
              h("div", null, [
                h("div", { className: "text-xs font-mono font-bold text-amber-400 uppercase tracking-wider" }, "Quality Audit Results"),
                h("h2", { className: "text-xl font-extrabold text-slate-100 mt-0.5" }, `${evalResult.model_name}`),
                h("p", { className: "text-xs text-slate-400 mt-0.5" }, `Test Language: ${evalResult.language_tested === "hi" ? "Hindi (हिन्दी)" : "English"}`)
              ]),
              h(
                "div",
                { className: "flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 font-mono text-xs text-cyan-300 font-bold" },
                [
                  h("span", null, "Relevance Score:"),
                  h("span", { className: "text-base text-cyan-400" }, `${evalResult.relevance_score}/100`)
                ]
              )
            ]),

            // Scores Grid
            h("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-center" }, [
              h("div", { className: "bg-slate-900/80 p-3.5 rounded-xl border border-slate-800" }, [
                h("div", { className: "text-[10px] text-slate-400 font-semibold" }, "English Comprehension"),
                h("div", { className: "text-xl font-bold font-mono text-cyan-400 mt-1" }, `${evalResult.english_fluency_score}%`)
              ]),
              h("div", { className: "bg-slate-900/80 p-3.5 rounded-xl border border-slate-800" }, [
                h("div", { className: "text-[10px] text-slate-400 font-semibold" }, "Hindi Fluency"),
                h("div", { className: "text-xl font-bold font-mono text-amber-400 mt-1" }, `${evalResult.hindi_fluency_score}%`)
              ]),
              h("div", { className: "bg-slate-900/80 p-3.5 rounded-xl border border-slate-800" }, [
                h("div", { className: "text-[10px] text-slate-400 font-semibold" }, "Turnaround Latency"),
                h("div", { className: "text-xl font-bold font-mono text-violet-400 mt-1" }, `${evalResult.latency_ms} ms`)
              ]),
              h("div", { className: "bg-slate-900/80 p-3.5 rounded-xl border border-slate-800" }, [
                h("div", { className: "text-[10px] text-slate-400 font-semibold" }, "Effective Generation"),
                h("div", { className: "text-xl font-bold font-mono text-emerald-400 mt-1" }, `~${evalResult.effective_speed_tok_s} tok/s`)
              ])
            ]),

            // Model Response Box
            h("div", { className: "space-y-2 pt-2" }, [
              h("div", { className: "text-xs font-semibold text-slate-300" }, "Model Evaluated Response:"),
              h(
                "div",
                { className: "bg-slate-900/90 rounded-2xl p-5 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap" },
                evalResult.response
              )
            ])
          ]
        )
      ]
    );
  }

  window.QualityTestView = QualityTestView;
})();
