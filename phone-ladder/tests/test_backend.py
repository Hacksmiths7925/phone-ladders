import unittest
import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database import init_db, SessionLocal, AIModel, PhonePreset, CustomDevice, BenchmarkRun, CommunityBenchmark
from backend.seed_data import seed_database, MODELS_DATA, PRESETS_DATA
from backend.recommender import calculate_model_metrics, get_phone_ladder_tier, score_recommendation
from backend.schemas import (
    DeviceInput,
    CustomDeviceCreate,
    BenchmarkSaveRequest,
    CompareRequest,
    DeviceScanInput,
    SmartSwitchRequest,
    CommunityBenchmarkSubmit,
    QualityTestRequest
)
from backend.main import (
    health_check,
    get_presets,
    get_models,
    get_recommendations,
    compare_models,
    run_benchmark_estimate,
    save_benchmark,
    get_benchmark_history,
    create_custom_device,
    run_device_scan_audit,
    evaluate_smart_switch,
    get_community_benchmarks,
    submit_community_benchmark,
    upvote_community_benchmark,
    get_quality_prompts,
    evaluate_quality_test,
    wipe_user_private_data
)

class DirectBackendTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        seed_database()
        cls.db = SessionLocal()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_health_check(self):
        res = health_check()
        self.assertEqual(res["status"], "healthy")
        self.assertEqual(res["app"], "Phone Ladder")

    def test_database_seeding(self):
        models = self.db.query(AIModel).all()
        presets = self.db.query(PhonePreset).all()
        community = self.db.query(CommunityBenchmark).all()
        self.assertGreaterEqual(len(models), 15)
        self.assertGreaterEqual(len(presets), 15)
        self.assertGreaterEqual(len(community), 8)

    def test_device_scan_audit(self):
        scan_in = DeviceScanInput(
            device_memory_gb=12.0,
            cpu_cores=8,
            storage_free_gb=64.0,
            battery_level=0.85,
            battery_charging=True,
            webgpu_supported=True,
            platform="Android"
        )
        res = run_device_scan_audit(scan_in)
        self.assertIn(res["grade"], ["A+", "A"])
        self.assertGreaterEqual(res["score"], 80)
        self.assertIn("report_markdown", res)
        self.assertTrue(len(res["strengths"]) > 0)

    def test_smart_switch_evaluate(self):
        req = SmartSwitchRequest(
            current_model_id="llama-3.2-3b-instruct",
            device_ram_gb=6.0,
            storage_free_gb=25.0,
            trigger_reason="memory_pressure"
        )
        res = evaluate_smart_switch(req, db=self.db)
        self.assertTrue(res["needs_fallback"])
        self.assertIsNotNone(res["recommended_fallback"])
        # Fallback should be smaller than 3B (e.g. 1B or 1.5B)
        fb_model = res["recommended_fallback"]["model"]
        self.assertLess(fb_model["parameters"], 3.0)
        self.assertGreater(res["recommended_fallback"]["ram_saved_gb"], 0)

    def test_community_benchmarks(self):
        benchmarks = get_community_benchmarks(db=self.db)
        self.assertGreaterEqual(len(benchmarks), 8)

        # Test submit
        sub = CommunityBenchmarkSubmit(
            phone_name="Test Phone 12",
            chip_soc="Snapdragon 8 Gen 3",
            ram_gb=16.0,
            model_id="llama-3.2-3b-instruct",
            model_name="Llama 3.2 3B Instruct",
            runtime="MLC Chat",
            prompt_speed_tok_s=80.0,
            gen_speed_tok_s=29.5,
            ttft_ms=75.0,
            peak_ram_gb=2.6,
            verification_type="COMMUNITY",
            consent_given=True
        )
        created = submit_community_benchmark(sub, db=self.db)
        self.assertEqual(created["phone_name"], "Test Phone 12")

        # Test upvote
        up = upvote_community_benchmark(created["id"], db=self.db)
        self.assertGreaterEqual(up["upvotes"], 2)

    def test_quality_evaluation_hindi_english(self):
        prompts = get_quality_prompts()
        self.assertGreaterEqual(len(prompts), 5)
        # Check both Hindi and English prompts exist
        langs = [p["language"] for p in prompts]
        self.assertIn("en", langs)
        self.assertIn("hi", langs)

        # Evaluate Hindi prompt on Qwen 2.5 1.5B
        q_req_hi = QualityTestRequest(
            model_id="qwen2.5-1.5b-instruct",
            prompt_id="work_math_hi",
            language="hi"
        )
        eval_hi = evaluate_quality_test(q_req_hi, db=self.db)
        self.assertIn("hindi_fluency_score", eval_hi)
        self.assertGreater(eval_hi["hindi_fluency_score"], 50)
        self.assertIn("25", eval_hi["response"])  # Correct math answer in Hindi

    def test_privacy_wipe(self):
        # Create custom device
        c_dev = CustomDeviceCreate(name="To Delete Phone", soc="Snapdragon", ram_gb=8.0)
        create_custom_device(c_dev, db=self.db)

        # Wipe private data
        wipe_res = wipe_user_private_data(db=self.db)
        self.assertEqual(wipe_res["status"], "success")
        self.assertGreaterEqual(wipe_res["custom_devices_wiped"], 1)

if __name__ == "__main__":
    unittest.main()
