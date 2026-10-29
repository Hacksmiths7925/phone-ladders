# 📱 Phone Ladder 2.0 (Advanced Edition)

> **Intelligent On-Device AI Model Recommender, Smartphone Hardware Benchmarking Suite & Real-Time Performance Monitor**

Phone Ladder recommends and tests the best local on-device AI language model (SLM/LLM) for any smartphone based on RAM headroom, storage feasibility, processor architecture (SoC / GPU / NPU TOPS), memory bus bandwidth, and execution runtime compatibility.

---

## 🌟 Key Features & Advanced Capabilities

### 1. 🔍 One-Tap Device Scan & Compatibility Audit
- Probes client browser hardware APIs in a single tap:
  - `navigator.deviceMemory`, `navigator.hardwareConcurrency`
  - `navigator.storage.estimate()`
  - Battery API (`navigator.getBattery()`)
  - WebGL unmasked GPU vendor and renderer string (`WEBGL_debug_renderer_info`)
  - WebGPU adapter capability and buffer limits
- Generates an immediate **On-Device AI Readiness Grade** (`A+`, `A`, `B`, `C`, `D`), detecting hardware bottlenecks (RAM ceilings, thermal risks, storage constraints).
- Includes 1-click **Export / Copy Report (Markdown/JSON)** and manual override fallback when APIs are shielded.

### 2. ⚡ Smart Model Switching & Degradation Engine
- Graceful degradation under memory pressure:
  - Continuously monitors active model footprint vs expanding context length (KV cache growth).
  - When memory pressure breaches threshold (>90%) or generation speed drops (<6 tok/s), triggers an automated **Smart Model Switch Recommendation**.
  - Quantifies exact trade-offs: RAM reclaimed (e.g., $+1.4\text{ GB}$), speed boost (e.g., $+15.2\text{ tok/s}$), and accuracy impact (e.g., $-4\%\text{ MMLU}$).
  - Requires explicit user consent before switching (`[Accept Switch]` vs `[Ignore & Risk OOM]`).

### 3. ⏱️ Live Performance Monitor
- Displays real-time device telemetry:
  - **Main Thread Turnaround & Responsiveness**: Real-time FPS measured via `requestAnimationFrame`.
  - **Browser Heap Memory**: `performance.memory` (used, total, and heap limit) where supported by Chromium/Android; clearly labeled fallback when shielded by privacy settings.
  - **Battery & Thermal State**: Battery level percentage and charging state (charging allows aggressive SoC clock governors).
  - **Active Model Footprint**: Live parameter size and simulated context token load.

### 4. 📴 Offline AI Mode & Local Cache Execution
- **Zero-Internet Local Execution**:
  - Validates storage feasibility before downloading.
  - Real-time download progress bar with transfer rate (MB/s) and ETA.
  - Caches model weight manifests in local browser storage (`CacheStorage` / `localStorage`).
  - Interactive local chat runner: generates tokens client-side with 0 bytes transferred over the network.
  - 1-click **Delete Model Cache** to free storage immediately.

### 5. 🌐 Community Benchmark Leaderboard
- Compare real-world benchmarks across smartphone chipsets, models, and runtimes:
  - Runtimes supported: WebGPU/WebLLM, PocketPal AI (iOS Metal), MLC Chat (Android Vulkan), llama.cpp (Termux).
  - Clear verification badges:
    - `[VERIFIED HARDWARE RUN]` (Cyan) — Authenticated hardware runs.
    - `[COMMUNITY REPORTED]` (Violet) — User submissions.
    - `[ESTIMATED / SPEC CALCULATION]` (Amber) — Theoretical calculations.
  - Submit your own phone benchmarks with mandatory **Privacy Consent Checkbox** and live upvoting.

### 6. 💾 Smart Storage Manager
- **Visual Disk Capacity Bar**:
  - Breakdown of OS reserve, apps/media, offline AI models, free space, and the recommended 2GB OS virtual memory safety buffer.
- **Pre-Download Safety Advisor**:
  - Select any of the 17 verified models to preview download size, free space before and after, and safety status (`Safe to Download`, `Low Storage Warning`, or `Insufficient Space`).

### 7. 🇮🇳 / 🇬🇧 Bilingual AI Quality Test (Hindi & English)
- Curated multilingual test suite evaluating real model comprehension across:
  - General Knowledge (EN): Quantum Computing
  - भारत की नदियाँ (HI): Geography & Culture
  - Speed & Distance Math (EN): Multi-step reasoning
  - कार्य और समय (HI): Unitary method arithmetic
  - Python Palindrome (EN): Code synthesis
  - Bilingual Translation & Synthesis (Hindi $\rightarrow$ English)
- Evaluates English Fluency, Hindi Fluency, Answer Relevance Score, Latency (TTFT ms), and Effective Generation Rate (tokens/sec).

### 8. 🛡️ Privacy Center & Data Transparency
- **Data Sovereignty Matrix**:
  - Transparent documentation of what stays 100% local on-device vs what interacts with local API endpoints.
- **Privacy Toggles**:
  - "Allow Anonymous Benchmark Sharing" (Default OFF)
  - "Strict Local-Only AI Mode"
- **Data Management**:
  - Export all personal profiles and history to JSON.
  - 1-click **Wipe All Private Data**: permanently deletes custom devices and benchmark logs from the SQLite database.

---

## 🚀 Quick Start & Installation

```powershell
cd C:\Users\Asus\.gemini\antigravity\scratch\phone-ladder
python run.py
```

Open your browser at:
- **Web App**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **FastAPI Interactive Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🧪 Automated Test Verification

Run all test suites:

```powershell
# Run backend direct unit tests
python -m unittest tests/test_backend.py

# Run live server integration tests
python test_server_live.py
```
