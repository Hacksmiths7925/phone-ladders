import json
from backend.database import SessionLocal, AIModel, PhonePreset, CommunityBenchmark, init_db

MODELS_DATA = [
    {
        "id": "smollm2-135m-instruct",
        "name": "SmolLM2 135M Instruct",
        "family": "SmolLM",
        "developer": "Hugging Face",
        "parameters": 0.135,
        "parameters_display": "135M",
        "context_length": 8192,
        "category": "Lightweight Edge",
        "description": "Ultra-lightweight compact language model designed to run in-memory on any entry-level device, smartwatch, or microcontroller with near-zero latency.",
        "license": "Apache 2.0",
        "huggingface_url": "https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct",
        "quantizations": {
            "Q4_K_M": {"file_size_gb": 0.09, "min_ram_gb": 0.6, "rec_ram_gb": 1.2, "bpw": 4.5},
            "Q8_0": {"file_size_gb": 0.15, "min_ram_gb": 0.8, "rec_ram_gb": 1.5, "bpw": 8.0},
            "FP16": {"file_size_gb": 0.27, "min_ram_gb": 1.1, "rec_ram_gb": 2.0, "bpw": 16.0}
        },
        "default_quantization": "Q4_K_M",
        "mmlu_score": 34.2,
        "humaneval_score": 18.5,
        "gsm8k_score": 19.8,
        "mt_bench_score": 4.2,
        "recommended_runtimes": ["WebGPU / WebLLM", "PocketPal AI (iOS)", "llama.cpp (Termux)", "ONNX Runtime Web"],
        "ladder_tier": 1
    },
    {
        "id": "smollm2-360m-instruct",
        "name": "SmolLM2 360M Instruct",
        "family": "SmolLM",
        "developer": "Hugging Face",
        "parameters": 0.36,
        "parameters_display": "360M",
        "context_length": 8192,
        "category": "Lightweight Edge",
        "description": "Super compact model trained on fine-curated educational synthetic datasets. Incredible responsiveness on low-power ARM SoCs.",
        "license": "Apache 2.0",
        "huggingface_url": "https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct",
        "quantizations": {
            "Q4_K_M": {"file_size_gb": 0.24, "min_ram_gb": 0.9, "rec_ram_gb": 1.8, "bpw": 4.5},
            "Q8_0": {"file_size_gb": 0.39, "min_ram_gb": 1.2, "rec_ram_gb": 2.2, "bpw": 8.0},
            "FP16": {"file_size_gb": 0.72, "min_ram_gb": 1.7, "rec_ram_gb": 3.0, "bpw": 16.0}
        },
        "default_quantization": "Q4_K_M",
        "mmlu_score": 41.5,
        "humaneval_score": 25.6,
        "gsm8k_score": 28.4,
        "mt_bench_score": 5.1,
        "recommended_runtimes": ["WebGPU / WebLLM", "PocketPal AI (iOS)", "llama.cpp (Termux)", "ExecuTorch"],
        "ladder_tier": 1
    },
    {
        "id": "qwen2.5-0.5b-instruct",
        "name": "Qwen 2.5 0.5B Instruct",
        "family": "Qwen",
        "developer": "Alibaba Cloud",
        "parameters": 0.49,
        "parameters_display": "0.5B",
        "context_length": 32768,
        "category": "Lightweight Edge",
        "description": "Exceptional sub-billion parameter model with multilingual understanding, multi-turn dialogue, and structured JSON output capabilities.",
        "license": "Apache 2.0",
        "huggingface_url": "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct",
        "quantizations": {
            "Q4_K_M": {"file_size_gb": 0.39, "min_ram_gb": 1.1, "rec_ram_gb": 2.2, "bpw": 4.5},
            "Q8_0": {"file_size_gb": 0.56, "min_ram_gb": 1.5, "rec_ram_gb": 2.8, "bpw": 8.0},
            "FP16": {"file_size_gb": 0.98, "min_ram_gb": 2.2, "rec_ram_gb": 3.5, "bpw": 16.0}
        },
        "default_quantization": "Q4_K_M",
        "mmlu_score": 47.8,
        "humaneval_score": 32.3,
        "gsm8k_score": 38.6,
        "mt_bench_score": 5.8,
        "recommended_runtimes": ["WebGPU / WebLLM", "PocketPal AI", "MLC Chat", "llama.cpp"],
        "ladder_tier": 1
    },
    {
        "id": "llama-3.2-1b-instruct",
        "name": "Llama 3.2 1B Instruct",
        "family": "Llama",
        "developer": "Meta",
        "parameters": 1.23,
        "parameters_display": "1.2B",
        "context_length": 131072,
        "category": "Conversational & Chat",
        "description": "Meta's official edge model optimized for on-device summarization, multilingual rewriting, tool use, and 128k context windows.",
        "license": "Llama 3.2 Community",
        "huggingface_url": "https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct",
        "quantizations": {
            "Q4_K_M": {"file_size_gb": 0.78, "min_ram_gb": 1.8, "rec_ram_gb": 3.2, "bpw": 4.5},
            "Q8_0": {"file_size_gb": 1.32, "min_ram_gb": 2.5, "rec_ram_gb": 4.0, "bpw": 8.0},
            "FP16": {"file_size_gb": 2.46, "min_ram_gb": 3.8, "rec_ram_gb": 5.5, "bpw": 16.0}
        },
        "default_quantization": "Q4_K_M",
        "mmlu_score": 49.3,
        "humaneval_score": 38.4,
        "gsm8k_score": 44.5,
        "mt_bench_score": 6.3,
        "recommended_runtimes": ["ExecuTorch (iOS/Android)", "WebGPU / WebLLM", "llama.cpp", "PocketPal AI"],
        "ladder_tier": 2
    },
    {
        "id": "smollm2-1.7b-instruct",
        "name": "SmolLM2 1.7B Instruct",
        "family": "SmolLM",
        "developer": "Hugging Face",
        "parameters": 1.71,
        "parameters_display": "1.7B",
        "context_length": 8192,
        "category": "Conversational & Chat",
        "description": "Trained on 11 trillion tokens. Outperforms older 3B models while maintaining blazing inference speeds on modest phone hardware.",
        "license": "Apache 2.0",
        "huggingface_url": "https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct",
        "quantizations": {
            "Q4_K_M": {"file_size_gb": 1.08, "min_ram_gb": 2.2, "rec_ram_gb": 3.8, "bpw": 4.5},
            "Q8_0": {"file_size_gb": 1.81, "min_ram_gb": 3.0, "rec_ram_gb": 4.8, "bpw": 8.0},
            "FP16": {"file_size_gb": 3.42, "min_ram_gb": 4.8, "rec_ram_gb": 6.5, "bpw": 16.0}
        },
        "default_quantization": "Q4_K_M",
        "mmlu_score": 52.8,
        "humaneval_score": 42.1,
        "gsm8k_score": 50.2,
        "mt_bench_score": 6.6,
        "recommended_runtimes": ["WebGPU / WebLLM", "PocketPal AI", "MLC Chat", "llama.cpp"],
        "ladder_tier": 2
    },
    {
        "id": "qwen2.5-1.5b-instruct",
        "name": "Qwen 2.5 1.5B Instruct",
        "family": "Qwen",
        "developer": "Alibaba Cloud",
        "parameters": 1.54,
        "parameters_display": "1.5B",
        "context_length": 32768,
        "category": "Coding & Logic",
        "description": "High coding accuracy and multilingual reasoning in a tiny package. Outstanding instruction following for structured phone tasks.",
        "license": "Apache 2.0",
        "huggingface_url": "https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct",
        "quantizations": {
            "Q4_K_M": {"file_size_gb": 1.02, "min_ram_gb": 2.1, "rec_ram_gb": 3.6, "bpw": 4.5},
            "Q8_0": {"file_size_gb": 1.68, "min_ram_gb": 2.9, "rec_ram_gb": 4.5, "bpw": 8.0},
            "FP16": {"file_size_gb": 3.08, "min_ram_gb": 4.5, "rec_ram_gb": 6.0, "bpw": 16.0}
        },
        "default_quantization": "Q4_K_M",
        "mmlu_score": 60.8,
        "humaneval_score": 53.0,
        "gsm8k_score": 68.5,
        "mt_bench_score": 7.1,
        "recommended_runtimes": ["WebGPU / WebLLM", "MLC Chat", "PocketPal AI", "llama.cpp"],
        "ladder_tier": 2
    },
    {
        "id": "deepseek-r1-distill-qwen-1.5b",
        "name": "DeepSeek R1 Distill Qwen 1.5B",
        "family": "DeepSeek",
        "developer": "DeepSeek",
        "parameters": 1.54,
        "parameters_display": "1.5B (Reasoning)",
        "context_length": 32768,
        "category": "Reasoning & Math",
        "description": "Distilled from DeepSeek-R1 full reasoning traces. Displays chain-of-thought tokens on device, solving math, logic puzzles, and algorithmic code.",
        "license": "MIT",
        "huggingface_url": "https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
        "quantizations": {
            "Q4_K_M": {"file_size_gb": 1.10, "min_ram_gb": 2.3, "rec_ram_gb": 4.0, "bpw": 4.5},
            "Q8_0": {"file_size_gb": 1.75, "min_ram_gb": 3.1, "rec_ram_gb": 5.0, "bpw": 8.0},
            "FP16": {"file_size_gb": 3.08, "min_ram_gb": 4.6, "rec_ram_gb": 6.2, "bpw": 16.0}
        },
        "default_quantization": "Q4_K_M",
        "mmlu_score": 64.2,
        "humaneval_score": 57.3,
        "gsm8k_score": 82.5,
        "mt_bench_score": 7.4,
        "recommended_runtimes": ["WebGPU / WebLLM", "llama.cpp (Termux)", "PocketPal AI", "MLC Chat"],
        "ladder_tier": 2
    },
    {
        "id": "gemma-2-2b-it",
        "name": "Gemma 2 2B Instruct",
        "family": "Gemma",
        "developer": "Google",
        "parameters": 2.61,
        "parameters_display": "2.6B",
        "context_length": 8192,
        "category": "Conversational & Chat",
        "description": "Google's lightweight open model built on Gemini research. Features interleaved local/global sliding window attention for crisp dialogue.",
        "license": "Gemma Terms of Use",
        "huggingface_url": "https://huggingface.co/google/gemma-2-2b-it",
        "quantizations": {
            "Q4_K_M": {"file_size_gb": 1.64, "min_ram_gb": 3.1, "rec_ram_gb": 4.8, "bpw": 4.5},
            "Q8_0": {"file_size_gb": 2.75, "min_ram_gb": 4.2, "rec_ram_gb": 6.0, "bpw": 8.0},
            "FP16": {"file_size_gb": 5.22, "min_ram_gb": 6.8, "rec_ram_gb": 8.5, "bpw": 16.0}
        },
        "default_quantization": "Q4_K_M",
        "mmlu_score": 56.4,
        "humaneval_score": 38.4,
        "gsm8k_score": 54.6,
        "mt_bench_score": 6.9,
        "recommended_runtimes": ["MediaPipe GenAI (Android/iOS)", "WebGPU / WebLLM", "llama.cpp", "MLC Chat"],
        "ladder_tier": 2
    },
    {
        "id": "llama-3.2-3b-instruct",
        "name": "Llama 3.2 3B Instruct",
        "family": "Llama",
        "developer": "Meta",
        "parameters": 3.21,
        "parameters_display": "3.2B",
        "context_length": 131072,
        "category": "Conversational & Chat",
        "description": "The sweet spot of mobile AI: strong reasoning, natural human conversation, multilingual prowess, and lightweight footprint for 8GB devices.",
        "license": "Llama 3.2 Community",
        "huggingface_url": "https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct",
        "quantizations": {
            "Q4_K_M": {"file_size_gb": 2.02, "min_ram_gb": 3.6, "rec_ram_gb": 5.5, "bpw": 4.5},
            "Q8_0": {"file_size_gb": 3.42, "min_ram_gb": 5.2, "rec_ram_gb": 7.0, "bpw": 8.0},
            "FP16": {"file_size_gb": 6.42, "min_ram_gb": 8.2, "rec_ram_gb": 10.0, "bpw": 16.0}
        },
        "default_quantization": "Q4_K_M",
        "mmlu_score": 63.4,
        "humaneval_score": 52.4,
        "gsm8k_score": 77.8,
        "mt_bench_score": 7.6,
        "recommended_runtimes": ["PocketPal AI (iOS)", "MLC Chat (Android)", "WebGPU / WebLLM", "ExecuTorch"],
        "ladder_tier": 3
    },
    {
        "id": "qwen2.5-3b-instruct",
        "name": "Qwen 2.5 3B Instruct",
        "family": "Qwen",
        "developer": "Alibaba Cloud",
        "parameters": 3.09,
        "parameters_display": "3.1B",
        "context_length": 32768,
        "category": "Reasoning & Math",
        "description": "Leading 3B class model on MMLU and coding benchmarks. Superb at following multi-step instructions and producing formatted code.",
        "license": "Qwen Research License",
        "huggingface_url": "https://huggingface.co/Qwen/Qwen2.5-3B-Instruct",
        "quantizations": {
            "Q4_K_M": {"file_size_gb": 1.98, "min_ram_gb": 3.5, "rec_ram_gb": 5.4, "bpw": 4.5},
            "Q8_0": {"file_size_gb": 3.35, "min_ram_gb": 5.1, "rec_ram_gb": 6.8, "bpw": 8.0},
            "FP16": {"file_size_gb": 6.18, "min_ram_gb": 8.0, "rec_ram_gb": 9.8, "bpw": 16.0}
        },
        "default_quantization": "Q4_K_M",
        "mmlu_score": 67.5,
        "humaneval_score": 61.6,
        "gsm8k_score": 81.2,
        "mt_bench_score": 7.9,
        "recommended_runtimes": ["WebGPU / WebLLM", "PocketPal AI", "MLC Chat", "llama.cpp"],
        "ladder_tier": 3
    },
    {
        "id": "phi-3.5-mini-instruct",
        "name": "Phi-3.5 Mini Instruct",
        "family": "Phi",
        "developer": "Microsoft",
        "parameters": 3.82,
        "parameters_display": "3.8B",
        "context_length": 128000,
        "category": "Reasoning & Math",
        "description": "Microsoft's flagship small language model with high-density synthetic training. Outperforms many 7B and 13B models in multi-hop reasoning.",
        "license": "MIT",
        "huggingface_url": "https://huggingface.co/microsoft/Phi-3.5-mini-instruct",
        "quantizations": {
            "Q4_K_M": {"file_size_gb": 2.39, "min_ram_gb": 4.1, "rec_ram_gb": 6.0, "bpw": 4.5},
            "Q8_0": {"file_size_gb": 4.06, "min_ram_gb": 6.0, "rec_ram_gb": 8.0, "bpw": 8.0},
            "FP16": {"file_size_gb": 7.64, "min_ram_gb": 9.5, "rec_ram_gb": 12.0, "bpw": 16.0}
        },
        "default_quantization": "Q4_K_M",
        "mmlu_score": 69.2,
        "humaneval_score": 64.6,
        "gsm8k_score": 83.4,
        "mt_bench_score": 8.1,
        "recommended_runtimes": ["ONNX Runtime Mobile", "WebGPU / WebLLM", "llama.cpp", "PocketPal AI"],
        "ladder_tier": 3
    },
    {
        "id": "minicpm-v-2.6",
        "name": "MiniCPM-V 2.6 (Multimodal)",
        "family": "MiniCPM",
        "developer": "OpenBMB",
        "parameters": 8.0,
        "parameters_display": "8B (Vision)",
        "context_length": 4096,
        "category": "Vision & Multimodal",
        "description": "State-of-the-art on-device multimodal model. Accepts camera photos, OCR documents, and real-time visual questions with high accuracy.",
        "license": "Apache 2.0",
        "huggingface_url": "https://huggingface.co/openbmb/MiniCPM-V-2_6",
        "quantizations": {
            "INT4": {"file_size_gb": 5.50, "min_ram_gb": 7.5, "rec_ram_gb": 10.0, "bpw": 4.0},
            "Q4_K_M": {"file_size_gb": 5.50, "min_ram_gb": 7.5, "rec_ram_gb": 10.0, "bpw": 4.0}
        },
        "default_quantization": "INT4",
        "mmlu_score": 65.2,
        "humaneval_score": 55.0,
        "gsm8k_score": 75.0,
        "mt_bench_score": 7.5,
        "recommended_runtimes": ["llama.cpp multimodal", "MLC Chat", "Termux"],
        "ladder_tier": 4
    },
    {
        "id": "qwen2.5-7b-instruct",
        "name": "Qwen 2.5 7B Instruct",
        "family": "Qwen",
        "developer": "Alibaba Cloud",
        "parameters": 7.61,
        "parameters_display": "7.6B",
        "context_length": 32768,
        "category": "Reasoning & Math",
        "description": "Flagship 7B tier AI providing desktop-class comprehension, code generation, translation, and complex task decomposition on high-RAM phones.",
        "license": "Apache 2.0",
        "huggingface_url": "https://huggingface.co/Qwen/Qwen2.5-7B-Instruct",
        "quantizations": {
            "Q4_K_M": {"file_size_gb": 4.68, "min_ram_gb": 7.2, "rec_ram_gb": 10.5, "bpw": 4.5},
            "Q8_0": {"file_size_gb": 8.12, "min_ram_gb": 11.0, "rec_ram_gb": 14.5, "bpw": 8.0}
        },
        "default_quantization": "Q4_K_M",
        "mmlu_score": 74.3,
        "humaneval_score": 71.3,
        "gsm8k_score": 86.8,
        "mt_bench_score": 8.4,
        "recommended_runtimes": ["llama.cpp (Termux)", "MLC Chat", "WebGPU (16GB RAM)"],
        "ladder_tier": 4
    },
    {
        "id": "deepseek-r1-distill-qwen-7b",
        "name": "DeepSeek R1 Distill Qwen 7B",
        "family": "DeepSeek",
        "developer": "DeepSeek",
        "parameters": 7.61,
        "parameters_display": "7.6B (Reasoning)",
        "context_length": 32768,
        "category": "Reasoning & Math",
        "description": "Deep reasoning power rivaling proprietary frontier models in math and logic. Best suited for high-RAM flagship phones (12GB - 16GB).",
        "license": "MIT",
        "huggingface_url": "https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
        "quantizations": {
            "Q4_K_M": {"file_size_gb": 4.75, "min_ram_gb": 7.4, "rec_ram_gb": 11.0, "bpw": 4.5},
            "Q8_0": {"file_size_gb": 8.20, "min_ram_gb": 11.2, "rec_ram_gb": 15.0, "bpw": 8.0}
        },
        "default_quantization": "Q4_K_M",
        "mmlu_score": 77.2,
        "humaneval_score": 72.6,
        "gsm8k_score": 89.3,
        "mt_bench_score": 8.6,
        "recommended_runtimes": ["llama.cpp (Termux)", "MLC Chat", "PocketPal AI (16GB)"],
        "ladder_tier": 4
    },
    {
        "id": "mistral-7b-instruct-v0.3",
        "name": "Mistral 7B Instruct v0.3",
        "family": "Mistral",
        "developer": "Mistral AI",
        "parameters": 7.25,
        "parameters_display": "7.3B",
        "context_length": 32768,
        "category": "Conversational & Chat",
        "description": "Mistral's proven 7B model updated with function calling, v3 tokenizer, and robust instruction tuning for mobile power users.",
        "license": "Apache 2.0",
        "huggingface_url": "https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3",
        "quantizations": {
            "Q4_K_M": {"file_size_gb": 4.37, "min_ram_gb": 6.8, "rec_ram_gb": 10.0, "bpw": 4.5},
            "Q8_0": {"file_size_gb": 7.70, "min_ram_gb": 10.5, "rec_ram_gb": 14.0, "bpw": 8.0}
        },
        "default_quantization": "Q4_K_M",
        "mmlu_score": 68.3,
        "humaneval_score": 50.6,
        "gsm8k_score": 65.2,
        "mt_bench_score": 7.8,
        "recommended_runtimes": ["llama.cpp", "MLC Chat", "PocketPal AI"],
        "ladder_tier": 4
    },
    {
        "id": "gemma-2-9b-it",
        "name": "Gemma 2 9B Instruct",
        "family": "Gemma",
        "developer": "Google",
        "parameters": 9.24,
        "parameters_display": "9.2B",
        "context_length": 8192,
        "category": "Conversational & Chat",
        "description": "High parameter efficiency distilled from larger Google models. Demands 12GB to 16GB RAM flagships for smooth execution.",
        "license": "Gemma Terms of Use",
        "huggingface_url": "https://huggingface.co/google/gemma-2-9b-it",
        "quantizations": {
            "Q4_K_M": {"file_size_gb": 5.85, "min_ram_gb": 8.8, "rec_ram_gb": 12.5, "bpw": 4.5},
            "Q8_0": {"file_size_gb": 9.90, "min_ram_gb": 13.5, "rec_ram_gb": 16.5, "bpw": 8.0}
        },
        "default_quantization": "Q4_K_M",
        "mmlu_score": 71.3,
        "humaneval_score": 58.5,
        "gsm8k_score": 77.0,
        "mt_bench_score": 8.2,
        "recommended_runtimes": ["llama.cpp (Termux)", "MLC Chat", "ExecuTorch"],
        "ladder_tier": 4
    },
    {
        "id": "qwen2.5-14b-instruct",
        "name": "Qwen 2.5 14B Instruct",
        "family": "Qwen",
        "developer": "Alibaba Cloud",
        "parameters": 14.7,
        "parameters_display": "14.7B",
        "context_length": 32768,
        "category": "Reasoning & Math",
        "description": "Elite frontier model on mobile. Requires an extreme enthusiast smartphone with 16GB or 24GB of physical RAM.",
        "license": "Apache 2.0",
        "huggingface_url": "https://huggingface.co/Qwen/Qwen2.5-14B-Instruct",
        "quantizations": {
            "Q4_K_M": {"file_size_gb": 8.95, "min_ram_gb": 12.8, "rec_ram_gb": 18.0, "bpw": 4.5},
            "Q8_0": {"file_size_gb": 15.5, "min_ram_gb": 19.5, "rec_ram_gb": 24.0, "bpw": 8.0}
        },
        "default_quantization": "Q4_K_M",
        "mmlu_score": 79.8,
        "humaneval_score": 78.0,
        "gsm8k_score": 91.5,
        "mt_bench_score": 8.9,
        "recommended_runtimes": ["llama.cpp with Swap (Termux)", "MLC Chat (16GB/24GB)"],
        "ladder_tier": 5
    }
]

PRESETS_DATA = [
    {
        "id": "iphone-16-pro",
        "brand": "Apple",
        "name": "iPhone 16 Pro / Pro Max",
        "soc": "Apple A18 Pro (6-core CPU, 6-core GPU, 16-core NPU)",
        "ram_gb": 8.0,
        "default_storage_free_gb": 64.0,
        "npu_tops": 45.0,
        "memory_bandwidth_gbps": 60.0,
        "gpu_tier": "Elite",
        "os": "iOS",
        "release_year": 2024,
        "ladder_tier_capacity": 4
    },
    {
        "id": "iphone-16",
        "brand": "Apple",
        "name": "iPhone 16 / 16 Plus",
        "soc": "Apple A18 (6-core CPU, 5-core GPU, 16-core NPU)",
        "ram_gb": 8.0,
        "default_storage_free_gb": 55.0,
        "npu_tops": 35.0,
        "memory_bandwidth_gbps": 51.2,
        "gpu_tier": "Flagship",
        "os": "iOS",
        "release_year": 2024,
        "ladder_tier_capacity": 3
    },
    {
        "id": "iphone-15-pro",
        "brand": "Apple",
        "name": "iPhone 15 Pro / Pro Max",
        "soc": "Apple A17 Pro (6-core CPU, 6-core GPU)",
        "ram_gb": 8.0,
        "default_storage_free_gb": 48.0,
        "npu_tops": 35.0,
        "memory_bandwidth_gbps": 51.2,
        "gpu_tier": "Flagship",
        "os": "iOS",
        "release_year": 2023,
        "ladder_tier_capacity": 3
    },
    {
        "id": "iphone-14",
        "brand": "Apple",
        "name": "iPhone 14 / 13 Pro",
        "soc": "Apple A15 Bionic (6-core CPU, 5-core GPU)",
        "ram_gb": 6.0,
        "default_storage_free_gb": 35.0,
        "npu_tops": 15.8,
        "memory_bandwidth_gbps": 34.0,
        "gpu_tier": "Mid-range",
        "os": "iOS",
        "release_year": 2022,
        "ladder_tier_capacity": 2
    },
    {
        "id": "galaxy-s24-ultra",
        "brand": "Samsung",
        "name": "Samsung Galaxy S24 Ultra",
        "soc": "Snapdragon 8 Gen 3 for Galaxy (Adreno 750)",
        "ram_gb": 12.0,
        "default_storage_free_gb": 90.0,
        "npu_tops": 45.0,
        "memory_bandwidth_gbps": 77.0,
        "gpu_tier": "Elite",
        "os": "Android",
        "release_year": 2024,
        "ladder_tier_capacity": 4
    },
    {
        "id": "galaxy-s24",
        "brand": "Samsung",
        "name": "Samsung Galaxy S24 / S24+",
        "soc": "Exynos 2400 / Snapdragon 8 Gen 3",
        "ram_gb": 8.0,
        "default_storage_free_gb": 50.0,
        "npu_tops": 40.0,
        "memory_bandwidth_gbps": 68.0,
        "gpu_tier": "Flagship",
        "os": "Android",
        "release_year": 2024,
        "ladder_tier_capacity": 3
    },
    {
        "id": "pixel-9-pro",
        "brand": "Google",
        "name": "Google Pixel 9 Pro / XL",
        "soc": "Google Tensor G4 (Titan M2, EdgeTPU)",
        "ram_gb": 16.0,
        "default_storage_free_gb": 75.0,
        "npu_tops": 45.0,
        "memory_bandwidth_gbps": 34.1,
        "gpu_tier": "Flagship",
        "os": "Android",
        "release_year": 2024,
        "ladder_tier_capacity": 4
    },
    {
        "id": "pixel-8",
        "brand": "Google",
        "name": "Google Pixel 8 / 8a",
        "soc": "Google Tensor G3",
        "ram_gb": 8.0,
        "default_storage_free_gb": 40.0,
        "npu_tops": 30.0,
        "memory_bandwidth_gbps": 34.1,
        "gpu_tier": "Mid-range",
        "os": "Android",
        "release_year": 2023,
        "ladder_tier_capacity": 3
    },
    {
        "id": "oneplus-12",
        "brand": "OnePlus",
        "name": "OnePlus 12 (16GB Edition)",
        "soc": "Snapdragon 8 Gen 3 (Adreno 750, Hexagon)",
        "ram_gb": 16.0,
        "default_storage_free_gb": 120.0,
        "npu_tops": 45.0,
        "memory_bandwidth_gbps": 77.0,
        "gpu_tier": "Elite",
        "os": "Android",
        "release_year": 2024,
        "ladder_tier_capacity": 4
    },
    {
        "id": "xiaomi-14",
        "brand": "Xiaomi",
        "name": "Xiaomi 14 / 14 Pro",
        "soc": "Snapdragon 8 Gen 3",
        "ram_gb": 12.0,
        "default_storage_free_gb": 80.0,
        "npu_tops": 45.0,
        "memory_bandwidth_gbps": 77.0,
        "gpu_tier": "Elite",
        "os": "Android",
        "release_year": 2024,
        "ladder_tier_capacity": 4
    },
    {
        "id": "poco-x6-pro",
        "brand": "Xiaomi / Poco",
        "name": "Poco X6 Pro",
        "soc": "MediaTek Dimensity 8300-Ultra (Mali-G615)",
        "ram_gb": 12.0,
        "default_storage_free_gb": 60.0,
        "npu_tops": 10.0,
        "memory_bandwidth_gbps": 51.2,
        "gpu_tier": "Flagship",
        "os": "Android",
        "release_year": 2024,
        "ladder_tier_capacity": 3
    },
    {
        "id": "galaxy-a55",
        "brand": "Samsung",
        "name": "Samsung Galaxy A55 5G",
        "soc": "Samsung Exynos 1480 (Xclipse 530 AMD)",
        "ram_gb": 8.0,
        "default_storage_free_gb": 40.0,
        "npu_tops": 4.9,
        "memory_bandwidth_gbps": 25.6,
        "gpu_tier": "Mid-range",
        "os": "Android",
        "release_year": 2024,
        "ladder_tier_capacity": 2
    },
    {
        "id": "redmi-note-13-pro",
        "brand": "Xiaomi / Redmi",
        "name": "Redmi Note 13 Pro 5G",
        "soc": "Snapdragon 7s Gen 2 (Adreno 710)",
        "ram_gb": 8.0,
        "default_storage_free_gb": 35.0,
        "npu_tops": 8.0,
        "memory_bandwidth_gbps": 25.6,
        "gpu_tier": "Mid-range",
        "os": "Android",
        "release_year": 2024,
        "ladder_tier_capacity": 2
    },
    {
        "id": "galaxy-a15-5g",
        "brand": "Samsung",
        "name": "Samsung Galaxy A15 5G",
        "soc": "MediaTek Dimensity 6100+ (Mali-G57)",
        "ram_gb": 4.0,
        "default_storage_free_gb": 22.0,
        "npu_tops": 0.0,
        "memory_bandwidth_gbps": 17.0,
        "gpu_tier": "Entry",
        "os": "Android",
        "release_year": 2024,
        "ladder_tier_capacity": 1
    },
    {
        "id": "budget-helio-g99",
        "brand": "General Budget",
        "name": "Budget 4G Phone (Helio G99)",
        "soc": "MediaTek Helio G99 (Mali-G57 MC2)",
        "ram_gb": 4.0,
        "default_storage_free_gb": 20.0,
        "npu_tops": 0.0,
        "memory_bandwidth_gbps": 17.0,
        "gpu_tier": "Entry",
        "os": "Android",
        "release_year": 2023,
        "ladder_tier_capacity": 1
    },
    {
        "id": "entry-unisoc-t606",
        "brand": "General Entry",
        "name": "Entry Level Phone (Unisoc T606)",
        "soc": "Unisoc T606 (Mali-G57)",
        "ram_gb": 3.0,
        "default_storage_free_gb": 12.0,
        "npu_tops": 0.0,
        "memory_bandwidth_gbps": 12.8,
        "gpu_tier": "Entry",
        "os": "Android",
        "release_year": 2023,
        "ladder_tier_capacity": 1
    }
]

COMMUNITY_BENCHMARKS = [
    {
        "id": "cb-01",
        "phone_name": "iPhone 16 Pro Max",
        "chip_soc": "Apple A18 Pro",
        "ram_gb": 8.0,
        "model_id": "llama-3.2-3b-instruct",
        "model_name": "Llama 3.2 3B Instruct",
        "runtime": "PocketPal AI (iOS Metal)",
        "prompt_speed_tok_s": 84.5,
        "gen_speed_tok_s": 28.4,
        "ttft_ms": 78.0,
        "peak_ram_gb": 2.65,
        "verification_type": "VERIFIED",
        "upvotes": 42
    },
    {
        "id": "cb-02",
        "phone_name": "Samsung Galaxy S24 Ultra",
        "chip_soc": "Snapdragon 8 Gen 3",
        "ram_gb": 12.0,
        "model_id": "llama-3.2-3b-instruct",
        "model_name": "Llama 3.2 3B Instruct",
        "runtime": "MLC Chat (Vulkan)",
        "prompt_speed_tok_s": 92.0,
        "gen_speed_tok_s": 31.2,
        "ttft_ms": 65.0,
        "peak_ram_gb": 2.70,
        "verification_type": "VERIFIED",
        "upvotes": 58
    },
    {
        "id": "cb-03",
        "phone_name": "Samsung Galaxy S24 Ultra",
        "chip_soc": "Snapdragon 8 Gen 3",
        "ram_gb": 12.0,
        "model_id": "qwen2.5-7b-instruct",
        "model_name": "Qwen 2.5 7B Instruct",
        "runtime": "llama.cpp (Termux OpenCL)",
        "prompt_speed_tok_s": 42.0,
        "gen_speed_tok_s": 14.6,
        "ttft_ms": 145.0,
        "peak_ram_gb": 5.85,
        "verification_type": "VERIFIED",
        "upvotes": 36
    },
    {
        "id": "cb-04",
        "phone_name": "OnePlus 12",
        "chip_soc": "Snapdragon 8 Gen 3",
        "ram_gb": 16.0,
        "model_id": "deepseek-r1-distill-qwen-7b",
        "model_name": "DeepSeek R1 Distill Qwen 7B",
        "runtime": "MLC Chat (Android Vulkan)",
        "prompt_speed_tok_s": 46.5,
        "gen_speed_tok_s": 15.2,
        "ttft_ms": 130.0,
        "peak_ram_gb": 6.10,
        "verification_type": "VERIFIED",
        "upvotes": 64
    },
    {
        "id": "cb-05",
        "phone_name": "Google Pixel 9 Pro XL",
        "chip_soc": "Google Tensor G4",
        "ram_gb": 16.0,
        "model_id": "gemma-2-9b-it",
        "model_name": "Gemma 2 9B Instruct",
        "runtime": "MLC Chat",
        "prompt_speed_tok_s": 31.0,
        "gen_speed_tok_s": 8.9,
        "ttft_ms": 190.0,
        "peak_ram_gb": 7.40,
        "verification_type": "VERIFIED",
        "upvotes": 29
    },
    {
        "id": "cb-06",
        "phone_name": "iPhone 16 Pro",
        "chip_soc": "Apple A18 Pro",
        "ram_gb": 8.0,
        "model_id": "deepseek-r1-distill-qwen-1.5b",
        "model_name": "DeepSeek R1 Distill Qwen 1.5B",
        "runtime": "PocketPal AI (iOS Metal)",
        "prompt_speed_tok_s": 115.0,
        "gen_speed_tok_s": 42.5,
        "ttft_ms": 45.0,
        "peak_ram_gb": 1.75,
        "verification_type": "VERIFIED",
        "upvotes": 75
    },
    {
        "id": "cb-07",
        "phone_name": "Poco X6 Pro",
        "chip_soc": "Dimensity 8300-Ultra",
        "ram_gb": 12.0,
        "model_id": "qwen2.5-1.5b-instruct",
        "model_name": "Qwen 2.5 1.5B Instruct",
        "runtime": "WebGPU / WebLLM",
        "prompt_speed_tok_s": 65.0,
        "gen_speed_tok_s": 24.8,
        "ttft_ms": 88.0,
        "peak_ram_gb": 1.80,
        "verification_type": "COMMUNITY",
        "upvotes": 21
    },
    {
        "id": "cb-08",
        "phone_name": "Samsung Galaxy A55 5G",
        "chip_soc": "Samsung Exynos 1480",
        "ram_gb": 8.0,
        "model_id": "smollm2-1.7b-instruct",
        "model_name": "SmolLM2 1.7B Instruct",
        "runtime": "llama.cpp (Termux)",
        "prompt_speed_tok_s": 34.0,
        "gen_speed_tok_s": 11.8,
        "ttft_ms": 160.0,
        "peak_ram_gb": 1.60,
        "verification_type": "COMMUNITY",
        "upvotes": 14
    },
    {
        "id": "cb-09",
        "phone_name": "Budget Phone (Helio G99)",
        "chip_soc": "MediaTek Helio G99",
        "ram_gb": 4.0,
        "model_id": "smollm2-360m-instruct",
        "model_name": "SmolLM2 360M Instruct",
        "runtime": "llama.cpp (CPU NEON)",
        "prompt_speed_tok_s": 42.0,
        "gen_speed_tok_s": 18.2,
        "ttft_ms": 95.0,
        "peak_ram_gb": 0.55,
        "verification_type": "COMMUNITY",
        "upvotes": 19
    },
    {
        "id": "cb-10",
        "phone_name": "Google Pixel 8",
        "chip_soc": "Google Tensor G3",
        "ram_gb": 8.0,
        "model_id": "gemma-2-2b-it",
        "model_name": "Gemma 2 2B Instruct",
        "runtime": "MediaPipe GenAI",
        "prompt_speed_tok_s": 58.0,
        "gen_speed_tok_s": 19.4,
        "ttft_ms": 82.0,
        "peak_ram_gb": 2.20,
        "verification_type": "VERIFIED",
        "upvotes": 31
    }
]

def seed_database():
    init_db()
    db = SessionLocal()
    try:
        # Seed AI Models
        for m in MODELS_DATA:
            existing = db.query(AIModel).filter(AIModel.id == m["id"]).first()
            if not existing:
                model_obj = AIModel(
                    id=m["id"],
                    name=m["name"],
                    family=m["family"],
                    developer=m["developer"],
                    parameters=m["parameters"],
                    parameters_display=m["parameters_display"],
                    context_length=m["context_length"],
                    category=m["category"],
                    description=m["description"],
                    license=m["license"],
                    huggingface_url=m["huggingface_url"],
                    quantizations_json=json.dumps(m["quantizations"]),
                    default_quantization=m["default_quantization"],
                    mmlu_score=m["mmlu_score"],
                    humaneval_score=m["humaneval_score"],
                    gsm8k_score=m["gsm8k_score"],
                    mt_bench_score=m["mt_bench_score"],
                    recommended_runtimes_json=json.dumps(m["recommended_runtimes"]),
                    ladder_tier=m["ladder_tier"]
                )
                db.add(model_obj)
            else:
                existing.name = m["name"]
                existing.parameters = m["parameters"]
                existing.parameters_display = m["parameters_display"]
                existing.quantizations_json = json.dumps(m["quantizations"])
                existing.recommended_runtimes_json = json.dumps(m["recommended_runtimes"])
                existing.mmlu_score = m["mmlu_score"]
                existing.humaneval_score = m["humaneval_score"]
                existing.gsm8k_score = m["gsm8k_score"]
                existing.mt_bench_score = m["mt_bench_score"]

        # Seed Phone Presets
        for p in PRESETS_DATA:
            existing_p = db.query(PhonePreset).filter(PhonePreset.id == p["id"]).first()
            if not existing_p:
                preset_obj = PhonePreset(
                    id=p["id"],
                    brand=p["brand"],
                    name=p["name"],
                    soc=p["soc"],
                    ram_gb=p["ram_gb"],
                    default_storage_free_gb=p["default_storage_free_gb"],
                    npu_tops=p["npu_tops"],
                    memory_bandwidth_gbps=p["memory_bandwidth_gbps"],
                    gpu_tier=p["gpu_tier"],
                    os=p["os"],
                    release_year=p["release_year"],
                    ladder_tier_capacity=p["ladder_tier_capacity"]
                )
                db.add(preset_obj)
            else:
                existing_p.name = p["name"]
                existing_p.soc = p["soc"]
                existing_p.ram_gb = p["ram_gb"]
                existing_p.npu_tops = p["npu_tops"]
                existing_p.memory_bandwidth_gbps = p["memory_bandwidth_gbps"]
                existing_p.ladder_tier_capacity = p["ladder_tier_capacity"]

        # Seed Community Benchmarks
        for cb in COMMUNITY_BENCHMARKS:
            existing_cb = db.query(CommunityBenchmark).filter(CommunityBenchmark.id == cb["id"]).first()
            if not existing_cb:
                cb_obj = CommunityBenchmark(
                    id=cb["id"],
                    phone_name=cb["phone_name"],
                    chip_soc=cb["chip_soc"],
                    ram_gb=cb["ram_gb"],
                    model_id=cb["model_id"],
                    model_name=cb["model_name"],
                    runtime=cb["runtime"],
                    prompt_speed_tok_s=cb["prompt_speed_tok_s"],
                    gen_speed_tok_s=cb["gen_speed_tok_s"],
                    ttft_ms=cb["ttft_ms"],
                    peak_ram_gb=cb["peak_ram_gb"],
                    verification_type=cb["verification_type"],
                    upvotes=cb["upvotes"]
                )
                db.add(cb_obj)

        db.commit()
        print("Database seeded successfully with models, presets, and community benchmarks!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
