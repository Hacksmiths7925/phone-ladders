import os
import json
from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

DB_PATH = os.path.join(os.path.dirname(__file__), "phone_ladder.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class AIModel(Base):
    __tablename__ = "ai_models"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    family = Column(String, nullable=False)
    developer = Column(String, nullable=False)
    parameters = Column(Float, nullable=False)
    parameters_display = Column(String, nullable=False)
    context_length = Column(Integer, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    license = Column(String, nullable=False)
    huggingface_url = Column(String, nullable=False)
    quantizations_json = Column(Text, nullable=False)
    default_quantization = Column(String, default="Q4_K_M")
    mmlu_score = Column(Float, nullable=False)
    humaneval_score = Column(Float, nullable=False)
    gsm8k_score = Column(Float, nullable=False)
    mt_bench_score = Column(Float, nullable=False)
    recommended_runtimes_json = Column(Text, nullable=False)
    ladder_tier = Column(Integer, nullable=False)  # 1 to 5

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "family": self.family,
            "developer": self.developer,
            "parameters": self.parameters,
            "parameters_display": self.parameters_display,
            "context_length": self.context_length,
            "category": self.category,
            "description": self.description,
            "license": self.license,
            "huggingface_url": self.huggingface_url,
            "quantizations": json.loads(self.quantizations_json) if self.quantizations_json else {},
            "default_quantization": self.default_quantization,
            "mmlu_score": self.mmlu_score,
            "humaneval_score": self.humaneval_score,
            "gsm8k_score": self.gsm8k_score,
            "mt_bench_score": self.mt_bench_score,
            "recommended_runtimes": json.loads(self.recommended_runtimes_json) if self.recommended_runtimes_json else [],
            "ladder_tier": self.ladder_tier,
        }

class PhonePreset(Base):
    __tablename__ = "phone_presets"

    id = Column(String, primary_key=True, index=True)
    brand = Column(String, nullable=False)
    name = Column(String, nullable=False)
    soc = Column(String, nullable=False)
    ram_gb = Column(Float, nullable=False)
    default_storage_free_gb = Column(Float, default=45.0)
    npu_tops = Column(Float, default=0.0)
    memory_bandwidth_gbps = Column(Float, default=30.0)
    gpu_tier = Column(String, default="Mid-range")
    os = Column(String, default="Android")
    release_year = Column(Integer, default=2024)
    ladder_tier_capacity = Column(Integer, default=2)

    def to_dict(self):
        return {
            "id": self.id,
            "brand": self.brand,
            "name": self.name,
            "soc": self.soc,
            "ram_gb": self.ram_gb,
            "default_storage_free_gb": self.default_storage_free_gb,
            "npu_tops": self.npu_tops,
            "memory_bandwidth_gbps": self.memory_bandwidth_gbps,
            "gpu_tier": self.gpu_tier,
            "os": self.os,
            "release_year": self.release_year,
            "ladder_tier_capacity": self.ladder_tier_capacity,
        }

class CustomDevice(Base):
    __tablename__ = "custom_devices"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    brand = Column(String, default="Custom")
    soc = Column(String, nullable=False)
    ram_gb = Column(Float, nullable=False)
    storage_free_gb = Column(Float, default=32.0)
    npu_tops = Column(Float, default=10.0)
    memory_bandwidth_gbps = Column(Float, default=30.0)
    os = Column(String, default="Android")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "brand": self.brand,
            "soc": self.soc,
            "ram_gb": self.ram_gb,
            "storage_free_gb": self.storage_free_gb,
            "npu_tops": self.npu_tops,
            "memory_bandwidth_gbps": self.memory_bandwidth_gbps,
            "os": self.os,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class BenchmarkRun(Base):
    __tablename__ = "benchmark_runs"

    id = Column(String, primary_key=True, index=True)
    device_name = Column(String, nullable=False)
    is_real_browser = Column(Boolean, default=False)
    ram_gb = Column(Float, default=8.0)
    measured_compute_gflops = Column(Float, default=0.0)
    measured_bandwidth_mbps = Column(Float, default=0.0)
    measured_latency_ms = Column(Float, default=0.0)
    estimated_token_rate_1b = Column(Float, default=0.0)
    estimated_token_rate_3b = Column(Float, default=0.0)
    estimated_token_rate_7b = Column(Float, default=0.0)
    webgpu_supported = Column(Boolean, default=False)
    webgl_renderer = Column(String, default="Unknown")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "device_name": self.device_name,
            "is_real_browser": self.is_real_browser,
            "ram_gb": self.ram_gb,
            "measured_compute_gflops": round(self.measured_compute_gflops, 2),
            "measured_bandwidth_mbps": round(self.measured_bandwidth_mbps, 2),
            "measured_latency_ms": round(self.measured_latency_ms, 2),
            "estimated_token_rate_1b": round(self.estimated_token_rate_1b, 1),
            "estimated_token_rate_3b": round(self.estimated_token_rate_3b, 1),
            "estimated_token_rate_7b": round(self.estimated_token_rate_7b, 1),
            "webgpu_supported": self.webgpu_supported,
            "webgl_renderer": self.webgl_renderer,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class CommunityBenchmark(Base):
    __tablename__ = "community_benchmarks"

    id = Column(String, primary_key=True, index=True)
    phone_name = Column(String, nullable=False)
    chip_soc = Column(String, nullable=False)
    ram_gb = Column(Float, nullable=False)
    model_id = Column(String, nullable=False)
    model_name = Column(String, nullable=False)
    runtime = Column(String, nullable=False)  # WebGPU, PocketPal AI (iOS), MLC Chat, llama.cpp
    prompt_speed_tok_s = Column(Float, default=0.0)
    gen_speed_tok_s = Column(Float, nullable=False)
    ttft_ms = Column(Float, default=120.0)
    peak_ram_gb = Column(Float, default=2.5)
    verification_type = Column(String, default="COMMUNITY")  # VERIFIED, COMMUNITY, ESTIMATED
    upvotes = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "phone_name": self.phone_name,
            "chip_soc": self.chip_soc,
            "ram_gb": self.ram_gb,
            "model_id": self.model_id,
            "model_name": self.model_name,
            "runtime": self.runtime,
            "prompt_speed_tok_s": round(self.prompt_speed_tok_s, 1),
            "gen_speed_tok_s": round(self.gen_speed_tok_s, 1),
            "ttft_ms": round(self.ttft_ms, 1),
            "peak_ram_gb": round(self.peak_ram_gb, 2),
            "verification_type": self.verification_type,
            "upvotes": self.upvotes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
