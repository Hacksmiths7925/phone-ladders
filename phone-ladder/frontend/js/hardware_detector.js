// Real-world client hardware detection using modern Web APIs
(function() {
  async function detectClientHardware() {
    const info = {
      isAutoDetected: true,
      ramGb: 8.0,
      storageFreeGb: 45.0,
      cpuCores: navigator.hardwareConcurrency || 8,
      gpuRenderer: "Generic WebGL Accelerant",
      gpuVendor: "Unknown",
      webGpuSupported: false,
      webGpuAdapterName: "None",
      os: "Android",
      deviceModelGuess: "Current Device",
      npuTops: 15.0,
      bandwidthGbps: 38.0,
      rawDetections: {}
    };

    // 1. RAM Detection via navigator.deviceMemory
    if ('deviceMemory' in navigator && typeof navigator.deviceMemory === 'number') {
      info.ramGb = navigator.deviceMemory;
      info.rawDetections.deviceMemory = navigator.deviceMemory + " GB (reported by browser API)";
    } else {
      info.rawDetections.deviceMemory = "Not exposed directly by browser (privacy shield), defaulted to 8 GB";
    }

    // 2. Storage Estimation via navigator.storage.estimate()
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate();
        if (est.quota) {
          const quotaGb = est.quota / (1024 * 1024 * 1024);
          const usageGb = (est.usage || 0) / (1024 * 1024 * 1024);
          const availableGb = Math.max(5.0, Math.round(quotaGb - usageGb));
          info.storageFreeGb = availableGb;
          info.rawDetections.storage = `Quota: ${quotaGb.toFixed(1)} GB, Free App Storage: ~${availableGb} GB`;
        }
      } catch (e) {
        console.warn("Storage estimate error:", e);
      }
    }

    // 3. WebGL GPU Unmasked Renderer Detection
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          info.gpuRenderer = renderer || "Generic WebGL";
          info.gpuVendor = vendor || "Generic Vendor";
          info.rawDetections.webgl = `${vendor} - ${renderer}`;
        }
      }
    } catch (e) {
      console.warn("WebGL detection error:", e);
    }

    // 4. WebGPU Detection
    if ('gpu' in navigator && navigator.gpu) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
          info.webGpuSupported = true;
          info.webGpuAdapterName = adapter.info?.architecture || adapter.info?.vendor || "Supported WebGPU Adapter";
          info.rawDetections.webgpu = `WebGPU Available: ${info.webGpuAdapterName}, Max Buffer: ${(adapter.limits?.maxBufferSize / (1024 * 1024)).toFixed(0)} MB`;
        }
      } catch (e) {
        info.rawDetections.webgpu = "WebGPU present but adapter initialization blocked";
      }
    } else {
      info.rawDetections.webgpu = "WebGPU not supported in this browser version";
    }

    // 5. OS & Device Model Parsing
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) {
      info.os = "iOS";
      info.deviceModelGuess = "Apple iPhone / iPad";
      info.bandwidthGbps = 51.2;
      info.npuTops = 35.0;
    } else if (/Android/i.test(ua)) {
      info.os = "Android";
      info.deviceModelGuess = "Android Smartphone";
      // Inspect GPU string for Snapdragon Adreno / Mali / Tensor
      const lowerGpu = info.gpuRenderer.toLowerCase();
      if (lowerGpu.includes("adreno 750") || lowerGpu.includes("adreno(tm) 750")) {
        info.deviceModelGuess = "Flagship Android (Snapdragon 8 Gen 3)";
        info.bandwidthGbps = 77.0;
        info.npuTops = 45.0;
        if (info.ramGb < 12) info.ramGb = 12.0;
      } else if (lowerGpu.includes("adreno 740")) {
        info.deviceModelGuess = "High-End Android (Snapdragon 8 Gen 2)";
        info.bandwidthGbps = 64.0;
        info.npuTops = 32.0;
      } else if (lowerGpu.includes("mali-g7") || lowerGpu.includes("mali-g6")) {
        info.deviceModelGuess = "Upper Mid-Range Android (Dimensity)";
        info.bandwidthGbps = 51.2;
        info.npuTops = 20.0;
      } else if (lowerGpu.includes("mali-g5") || lowerGpu.includes("adreno 6")) {
        info.deviceModelGuess = "Standard Mid-Range Android";
        info.bandwidthGbps = 25.6;
        info.npuTops = 8.0;
      }
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      info.os = "macOS";
      info.deviceModelGuess = "Apple Mac (Apple Silicon / Intel)";
      info.bandwidthGbps = 100.0;
      info.npuTops = 38.0;
      if (info.ramGb < 8) info.ramGb = 16.0;
    } else if (/Windows/i.test(ua)) {
      info.os = "Windows";
      info.deviceModelGuess = "PC Workstation / Laptop";
      info.bandwidthGbps = 60.0;
      info.npuTops = 20.0;
    }

    return info;
  }

  window.HardwareDetector = {
    detect: detectClientHardware
  };
})();
