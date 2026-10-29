from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class DeviceInput(BaseModel):
    ram_gb: float = Field(..., ge=1.0, le=64.0, description="Device RAM in Gigabytes")
    storage_free_gb: float = Field(default=32.0, ge=0.5, le=2048.0, description="Available internal storage in GB")
    soc: str = Field(default="Snapdragon 8 Gen 3", description="Processor / SoC name")
    npu_tops: Optional[float] = Field(default=0.0, description="NPU TOPS rating")
    memory_bandwidth_gbps: Optional[float] = Field(default=34.0, description="Theoretical memory bandwidth in GB/s")
    os: Optional[str] = Field(default="Android", description="Operating system: Android, iOS, etc.")
    use_case: Optional[str] = Field(default="chat", description="chat, coding, reasoning, offline_assistant, lightweight, vision")
    priority: Optional[str] = Field(default="balanced", description="balanced, speed, quality, battery_saver")

class CustomDeviceCreate(BaseModel):
    name: str
    brand: Optional[str] = "Custom"
    soc: str
    ram_gb: float
    storage_free_gb: Optional[float] = 32.0
    npu_tops: Optional[float] = 10.0
    memory_bandwidth_gbps: Optional[float] = 30.0
    os: Optional[str] = "Android"

class BenchmarkSaveRequest(BaseModel):
    device_name: str
    is_real_browser: bool = False
    ram_gb: float = 8.0
    measured_compute_gflops: float = 0.0
    measured_bandwidth_mbps: float = 0.0
    measured_latency_ms: float = 0.0
    estimated_token_rate_1b: float = 0.0
    estimated_token_rate_3b: float = 0.0
    estimated_token_rate_7b: float = 0.0
    webgpu_supported: bool = False
    webgl_renderer: Optional[str] = "Unknown"
    notes: Optional[str] = ""

class CompareRequest(BaseModel):
    model_ids: List[str]
    device_ram_gb: Optional[float] = 8.0
    device_storage_gb: Optional[float] = 40.0
    soc: Optional[str] = "Snapdragon 8 Gen 3"

# --- Advanced Features Schemas ---

class DeviceScanInput(BaseModel):
    device_memory_gb: Optional[float] = None
    cpu_cores: Optional[int] = None
    storage_quota_gb: Optional[float] = None
    storage_used_gb: Optional[float] = None
    storage_free_gb: Optional[float] = None
    battery_level: Optional[float] = None  # 0.0 to 1.0
    battery_charging: Optional[bool] = None
    webgl_renderer: Optional[str] = None
    webgl_vendor: Optional[str] = None
    webgpu_supported: Optional[bool] = False
    webgpu_adapter: Optional[str] = None
    platform: Optional[str] = None
    user_agent: Optional[str] = None
    screen_width: Optional[int] = None
    screen_height: Optional[int] = None

class SmartSwitchRequest(BaseModel):
    current_model_id: str
    device_ram_gb: float
    storage_free_gb: Optional[float] = 30.0
    soc: Optional[str] = "Snapdragon 8 Gen 3"
    current_context_length: Optional[int] = 2048
    observed_speed_tok_s: Optional[float] = None
    trigger_reason: Optional[str] = "memory_pressure"  # memory_pressure, thermal_throttle, speed_drop

class CommunityBenchmarkSubmit(BaseModel):
    phone_name: str
    chip_soc: str
    ram_gb: float
    model_id: str
    model_name: str
    runtime: str  # WebGPU, PocketPal AI (iOS), MLC Chat, llama.cpp
    prompt_speed_tok_s: Optional[float] = 0.0
    gen_speed_tok_s: float
    ttft_ms: Optional[float] = 120.0
    peak_ram_gb: Optional[float] = 2.5
    verification_type: Optional[str] = "COMMUNITY"  # VERIFIED, COMMUNITY, ESTIMATED
    consent_given: bool = True

class QualityTestRequest(BaseModel):
    model_id: str
    prompt_id: Optional[str] = "quantum_en"
    custom_prompt: Optional[str] = None
    language: Optional[str] = "en"  # "en", "hi", "multilingual"
