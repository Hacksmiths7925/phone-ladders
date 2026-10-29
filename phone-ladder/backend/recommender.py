import math
from typing import Dict, Any, List, Optional

def calculate_model_metrics(
    model: Dict[str, Any],
    device_ram_gb: float,
    device_storage_gb: float,
    memory_bandwidth_gbps: float = 34.0,
    npu_tops: float = 0.0,
    os_name: str = "Android",
    quantization_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Computes rigorous empirical memory, speed, and compatibility metrics
    for a specific model on a given device.
    """
    quantizations = model.get("quantizations", {})
    q_key = quantization_key or model.get("default_quantization", "Q4_K_M")
    q_data = quantizations.get(q_key)
    
    # Fallback to first available quantization if selected key not found
    if not q_data and quantizations:
        q_key = list(quantizations.keys())[0]
        q_data = quantizations[q_key]
    
    file_size_gb = q_data.get("file_size_gb", 2.0) if q_data else 2.0
    
    # Estimate KV cache for 2048 token context
    # Standard formula: 2 * layers * kv_heads * head_dim * context * bytes
    params_b = model.get("parameters", 1.0)
    kv_cache_gb = round(max(0.08, params_b * 0.09), 2)
    runtime_overhead_gb = 0.35  # WebGPU / Vulkan / OS graphics buffer overhead
    total_model_active_ram = round(file_size_gb + kv_cache_gb + runtime_overhead_gb, 2)
    
    # OS reserved RAM (Android typically consumes 2.0-2.6GB, iOS 1.6-2.0GB)
    is_ios = "ios" in os_name.lower() or "iphone" in os_name.lower()
    os_reserved_ram = 1.8 if is_ios else 2.2
    
    available_ram_for_apps = max(0.5, device_ram_gb - os_reserved_ram)
    ram_headroom_gb = round(device_ram_gb - (total_model_active_ram + os_reserved_ram), 2)
    ram_usage_pct = round(min(100.0, (total_model_active_ram / device_ram_gb) * 100), 1)
    
    # Compatibility Status
    if ram_headroom_gb < 0:
        if device_ram_gb < total_model_active_ram:
            status = "INCOMPATIBLE"
            status_label = "Incompatible (Out of Memory)"
            status_color = "red"
        else:
            status = "CRITICAL_PRESSURE"
            status_label = "High Crash Risk (OS Kill likely)"
            status_color = "rose"
    elif ram_headroom_gb < 0.6:
        status = "TIGHT_FIT"
        status_label = "Tight Fit (Kill background apps)"
        status_color = "amber"
    elif ram_headroom_gb < 1.8:
        status = "GOOD_FIT"
        status_label = "Good Fit (Smooth daily use)"
        status_color = "cyan"
    else:
        status = "PERFECT_FIT"
        status_label = "Optimal Fit (Zero pressure)"
        status_color = "emerald"

    # Storage Check
    storage_needed_gb = file_size_gb + 1.2  # model file + download cache / swap safety
    storage_fits = device_storage_gb >= storage_needed_gb
    storage_margin_gb = round(device_storage_gb - storage_needed_gb, 1)

    # Autoregressive generation speed (Memory Bandwidth Bound)
    # Token Gen Speed = (Bandwidth GB/s) / (Model Size GB) * Hardware Efficiency
    # Efficiency varies by GPU/NPU architecture
    if npu_tops > 30.0 or memory_bandwidth_gbps > 65.0:
        hw_efficiency = 0.62  # Elite flagship (Adreno 750, A18 Pro)
    elif npu_tops > 10.0 or memory_bandwidth_gbps > 45.0:
        hw_efficiency = 0.52  # Modern flagship / upper mid-range
    elif memory_bandwidth_gbps > 24.0:
        hw_efficiency = 0.44  # Mid-range (Dimensity 8300, Snapdragon 7s)
    else:
        hw_efficiency = 0.35  # Budget / Entry (Helio G99, Unisoc)

    # Ensure no division by zero
    effective_size = max(0.08, file_size_gb)
    raw_gen_speed = (memory_bandwidth_gbps / effective_size) * hw_efficiency
    # Add a slight boost if NPU is present
    npu_boost = 1.0 + min(0.35, (npu_tops / 100.0))
    gen_tokens_sec = round(raw_gen_speed * npu_boost, 1)
    
    # Prompt prefill processing (compute-bound)
    prompt_tokens_sec = round(gen_tokens_sec * (2.8 + min(3.0, npu_tops / 12.0)), 1)

    # Generation speed evaluation
    if gen_tokens_sec >= 25.0:
        speed_grade = "Blazing Fast"
    elif gen_tokens_sec >= 15.0:
        speed_grade = "Smooth & Responsive"
    elif gen_tokens_sec >= 8.0:
        speed_grade = "Acceptable Reading Speed"
    else:
        speed_grade = "Noticeably Slow"

    return {
        "quantization_used": q_key,
        "file_size_gb": file_size_gb,
        "kv_cache_gb": kv_cache_gb,
        "runtime_overhead_gb": runtime_overhead_gb,
        "total_active_ram_gb": total_model_active_ram,
        "os_reserved_ram_gb": os_reserved_ram,
        "ram_headroom_gb": ram_headroom_gb,
        "ram_usage_pct": ram_usage_pct,
        "status": status,
        "status_label": status_label,
        "status_color": status_color,
        "storage_fits": storage_fits,
        "storage_needed_gb": round(storage_needed_gb, 1),
        "storage_margin_gb": storage_margin_gb,
        "gen_tokens_sec": gen_tokens_sec,
        "prompt_tokens_sec": prompt_tokens_sec,
        "speed_grade": speed_grade,
    }

def get_phone_ladder_tier(ram_gb: float) -> Dict[str, Any]:
    """
    Returns the maximum recommended tier capability on the Phone Ladder.
    """
    if ram_gb < 4.0:
        return {
            "tier": 1,
            "tier_name": "Tier 1: Micro Edge",
            "desc": "Ultra-lightweight models (100M - 500M params). Fast, responsive, works with 2GB-3GB RAM.",
            "max_params": "500M"
        }
    elif ram_gb < 7.0:
        return {
            "tier": 2,
            "tier_name": "Tier 2: Pocket Flagship",
            "desc": "Compact 1B - 2.5B parameter models. Excellent daily chat and lightweight reasoning.",
            "max_params": "2.5B"
        }
    elif ram_gb < 11.0:
        return {
            "tier": 3,
            "tier_name": "Tier 3: Power Edge",
            "desc": "Robust 3B - 4B parameter models. Sweet spot for reasoning, coding, and long context on 8GB phones.",
            "max_params": "4B"
        }
    elif ram_gb < 15.0:
        return {
            "tier": 4,
            "tier_name": "Tier 4: Pro Workstation",
            "desc": "Desktop-class 7B - 9B models and vision-language models. Requires 12GB+ RAM.",
            "max_params": "9B"
        }
    else:
        return {
            "tier": 5,
            "tier_name": "Tier 5: Frontier Mobile",
            "desc": "Elite 14B+ models and dense multi-task pipelines. Requires 16GB+ RAM flagship hardware.",
            "max_params": "14B+"
        }

def score_recommendation(
    model: Dict[str, Any],
    metrics: Dict[str, Any],
    priority: str = "balanced",
    use_case: str = "chat"
) -> Dict[str, Any]:
    """
    Calculates a 0-100 recommendation score with structured reasoning.
    """
    # If incompatible or out of memory, penalty is massive
    if metrics["status"] == "INCOMPATIBLE":
        return {
            "score": 0,
            "verdict": "Not Recommended",
            "reasons": ["Requires more RAM than this device can provide without fatal OS OOM termination."],
            "is_recommended": False
        }
    
    if not metrics["storage_fits"]:
        return {
            "score": 15,
            "verdict": "Insufficient Storage",
            "reasons": [f"Insufficient free storage. Needs {metrics['storage_needed_gb']} GB, but device has less."],
            "is_recommended": False
        }

    # Base Memory Score (0 to 35 pts)
    headroom = metrics["ram_headroom_gb"]
    if headroom >= 2.5:
        mem_score = 35
    elif headroom >= 1.0:
        mem_score = 28 + (headroom - 1.0) * 4.6
    elif headroom >= 0.2:
        mem_score = 15 + (headroom - 0.2) * 16.0
    else:
        mem_score = 5

    # Speed Score (0 to 30 pts)
    speed = metrics["gen_tokens_sec"]
    if speed >= 25.0:
        speed_score = 30
    elif speed >= 15.0:
        speed_score = 22 + (speed - 15.0) * 0.8
    elif speed >= 8.0:
        speed_score = 12 + (speed - 8.0) * 1.4
    else:
        speed_score = max(2.0, speed * 1.5)

    # Intelligence / Benchmark Score (0 to 25 pts) based on MMLU
    mmlu = model.get("mmlu_score", 50.0)
    intel_score = min(25.0, max(5.0, (mmlu / 80.0) * 25.0))

    # Storage Score (0 to 10 pts)
    storage_score = 10 if metrics["storage_margin_gb"] > 10 else max(2, int(metrics["storage_margin_gb"]))

    # Weight adjustments based on user's priority
    if priority == "speed":
        total_score = (mem_score * 0.8) + (speed_score * 1.5) + (intel_score * 0.7) + (storage_score * 0.8)
    elif priority == "quality":
        total_score = (mem_score * 0.8) + (speed_score * 0.7) + (intel_score * 1.6) + (storage_score * 0.8)
    elif priority == "battery_saver":
        # Prefers lighter models with small memory footprint and swift completion
        lightness_bonus = max(0, (4.0 - model.get("parameters", 1.0))) * 3.0
        total_score = (mem_score * 1.2) + (speed_score * 0.9) + (intel_score * 0.7) + lightness_bonus
    else: # balanced
        total_score = mem_score + speed_score + intel_score + storage_score

    # Use-case matching bonus
    category = model.get("category", "").lower()
    bonus = 0.0
    reasons = []

    if use_case == "reasoning" and ("reasoning" in category or "deepseek" in model.get("id", "")):
        bonus += 8.0
        reasons.append("Top-tier reasoning architecture optimized for multi-step logic & math.")
    elif use_case == "coding" and ("code" in category or "qwen" in model.get("id", "")):
        bonus += 8.0
        reasons.append("Strong code synthesis and technical problem solving capabilities.")
    elif use_case == "lightweight" and ("lightweight" in category or model.get("parameters", 0) < 1.0):
        bonus += 10.0
        reasons.append("Extremely lightweight footprint preserves battery and leaves RAM free for phone apps.")
    elif use_case == "vision" and "vision" in category:
        bonus += 12.0
        reasons.append("Supports multi-modal image & document understanding on device.")

    final_score = int(min(100.0, max(1.0, total_score + bonus)))

    # Generate explanations
    if metrics["ram_headroom_gb"] >= 1.5:
        reasons.append(f"Leaves a healthy {metrics['ram_headroom_gb']} GB RAM cushion for the OS, calls, and notifications.")
    elif metrics["ram_headroom_gb"] > 0:
        reasons.append(f"Usable RAM headroom of {metrics['ram_headroom_gb']} GB; close heavy background games while running.")

    reasons.append(f"Generates ~{metrics['gen_tokens_sec']} tokens/sec ({metrics['speed_grade']}) on your SoC memory bus.")
    
    runtimes = model.get("recommended_runtimes", [])
    if runtimes:
        reasons.append(f"Recommended runner: {runtimes[0]}.")

    if final_score >= 85:
        verdict = "Top Recommendation"
    elif final_score >= 70:
        verdict = "Great Match"
    elif final_score >= 50:
        verdict = "Viable Option"
    else:
        verdict = "Marginal Fit"

    return {
        "score": final_score,
        "verdict": verdict,
        "reasons": reasons,
        "is_recommended": final_score >= 60
    }
