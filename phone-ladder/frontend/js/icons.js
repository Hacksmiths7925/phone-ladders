// Clean, robust SVG Lucide-style Icon Components for React
(function() {
  const { createElement: h } = React;

  const createIcon = (paths) => ({ size = 18, className = "", color = "currentColor", ...props }) => {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: color,
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className: className,
        ...props
      },
      paths.map((p, i) => h(p.tag, { key: i, ...p.attrs }))
    );
  };

  window.Icons = {
    Smartphone: createIcon([
      { tag: "rect", attrs: { x: "5", y: "2", width: "14", height: "20", rx: "2", ry: "2" } },
      { tag: "line", attrs: { x1: "12", y1: "18", x2: "12.01", y2: "18" } }
    ]),
    Cpu: createIcon([
      { tag: "rect", attrs: { x: "4", y: "4", width: "16", height: "16", rx: "2" } },
      { tag: "rect", attrs: { x: "9", y: "9", width: "6", height: "6" } },
      { tag: "line", attrs: { x1: "9", y1: "1", x2: "9", y2: "4" } },
      { tag: "line", attrs: { x1: "15", y1: "1", x2: "15", y2: "4" } },
      { tag: "line", attrs: { x1: "9", y1: "20", x2: "9", y2: "23" } },
      { tag: "line", attrs: { x1: "15", y1: "20", x2: "15", y2: "23" } },
      { tag: "line", attrs: { x1: "20", y1: "9", x2: "23", y2: "9" } },
      { tag: "line", attrs: { x1: "20", y1: "14", x2: "23", y2: "14" } },
      { tag: "line", attrs: { x1: "1", y1: "9", x2: "4", y2: "9" } },
      { tag: "line", attrs: { x1: "1", y1: "14", x2: "4", y2: "14" } }
    ]),
    MemoryStick: createIcon([
      { tag: "path", attrs: { d: "M6 19v-3" } },
      { tag: "path", attrs: { d: "M10 19v-3" } },
      { tag: "path", attrs: { d: "M14 19v-3" } },
      { tag: "path", attrs: { d: "M18 19v-3" } },
      { tag: "path", attrs: { d: "M8 11V9" } },
      { tag: "path", attrs: { d: "M16 11V9" } },
      { tag: "rect", attrs: { x: "2", y: "3", width: "20", height: "14", rx: "2" } }
    ]),
    HardDrive: createIcon([
      { tag: "line", attrs: { x1: "22", y1: "12", x2: "2", y2: "12" } },
      { tag: "path", attrs: { d: "M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" } },
      { tag: "line", attrs: { x1: "6", y1: "16", x2: "6.01", y2: "16" } },
      { tag: "line", attrs: { x1: "10", y1: "16", x2: "10.01", y2: "16" } }
    ]),
    Zap: createIcon([
      { tag: "polygon", attrs: { points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2" } }
    ]),
    Shield: createIcon([
      { tag: "path", attrs: { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" } }
    ]),
    Sparkles: createIcon([
      { tag: "path", attrs: { d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" } },
      { tag: "path", attrs: { d: "M5 3v4" } },
      { tag: "path", attrs: { d: "M19 17v4" } },
      { tag: "path", attrs: { d: "M3 5h4" } },
      { tag: "path", attrs: { d: "M17 19h4" } }
    ]),
    Activity: createIcon([
      { tag: "polyline", attrs: { points: "22 12 18 12 15 21 9 3 6 12 2 12" } }
    ]),
    Layers: createIcon([
      { tag: "polygon", attrs: { points: "12 2 2 7 12 12 22 7 12 2" } },
      { tag: "polyline", attrs: { points: "2 17 12 22 22 17" } },
      { tag: "polyline", attrs: { points: "2 12 12 17 22 12" } }
    ]),
    Sliders: createIcon([
      { tag: "line", attrs: { x1: "4", y1: "21", x2: "4", y2: "14" } },
      { tag: "line", attrs: { x1: "4", y1: "10", x2: "4", y2: "3" } },
      { tag: "line", attrs: { x1: "12", y1: "21", x2: "12", y2: "12" } },
      { tag: "line", attrs: { x1: "12", y1: "8", x2: "12", y2: "3" } },
      { tag: "line", attrs: { x1: "20", y1: "21", x2: "20", y2: "16" } },
      { tag: "line", attrs: { x1: "20", y1: "12", x2: "20", y2: "3" } },
      { tag: "line", attrs: { x1: "1", y1: "14", x2: "7", y2: "14" } },
      { tag: "line", attrs: { x1: "9", y1: "8", x2: "15", y2: "8" } },
      { tag: "line", attrs: { x1: "17", y1: "16", x2: "23", y2: "16" } }
    ]),
    Check: createIcon([
      { tag: "polyline", attrs: { points: "20 6 9 17 4 12" } }
    ]),
    AlertTriangle: createIcon([
      { tag: "path", attrs: { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" } },
      { tag: "line", attrs: { x1: "12", y1: "9", x2: "12", y2: "13" } },
      { tag: "line", attrs: { x1: "12", y1: "17", x2: "12.01", y2: "17" } }
    ]),
    XCircle: createIcon([
      { tag: "circle", attrs: { cx: "12", cy: "12", r: "10" } },
      { tag: "line", attrs: { x1: "15", y1: "9", x2: "9", y2: "15" } },
      { tag: "line", attrs: { x1: "9", y1: "9", x2: "15", y2: "15" } }
    ]),
    Search: createIcon([
      { tag: "circle", attrs: { cx: "11", cy: "11", r: "8" } },
      { tag: "line", attrs: { x1: "21", y1: "21", x2: "16.65", y2: "16.65" } }
    ]),
    ExternalLink: createIcon([
      { tag: "path", attrs: { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" } },
      { tag: "polyline", attrs: { points: "15 3 21 3 21 9" } },
      { tag: "line", attrs: { x1: "10", y1: "14", x2: "21", y2: "3" } }
    ]),
    RefreshCw: createIcon([
      { tag: "polyline", attrs: { points: "23 4 23 10 17 10" } },
      { tag: "polyline", attrs: { points: "1 20 1 14 7 14" } },
      { tag: "path", attrs: { d: "M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" } }
    ]),
    BarChart3: createIcon([
      { tag: "line", attrs: { x1: "12", y1: "20", x2: "12", y2: "10" } },
      { tag: "line", attrs: { x1: "18", y1: "20", x2: "18", y2: "4" } },
      { tag: "line", attrs: { x1: "6", y1: "20", x2: "6", y2: "16" } }
    ]),
    Scale: createIcon([
      { tag: "path", attrs: { d: "m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" } },
      { tag: "path", attrs: { d: "m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" } },
      { tag: "path", attrs: { d: "M7 21h10" } },
      { tag: "path", attrs: { d: "M12 3v18" } },
      { tag: "path", attrs: { d: "M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" } }
    ]),
    Gauge: createIcon([
      { tag: "path", attrs: { d: "m12 14 4-4" } },
      { tag: "path", attrs: { d: "M3.34 19a10 10 0 1 1 17.32 0" } }
    ]),
    Play: createIcon([
      { tag: "polygon", attrs: { points: "5 3 19 12 5 21 5 3" } }
    ]),
    Bookmark: createIcon([
      { tag: "path", attrs: { d: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" } }
    ]),
    Info: createIcon([
      { tag: "circle", attrs: { cx: "12", cy: "12", r: "10" } },
      { tag: "line", attrs: { x1: "12", y1: "16", x2: "12", y2: "12" } },
      { tag: "line", attrs: { x1: "12", y1: "8", x2: "12.01", y2: "8" } }
    ]),
    Eye: createIcon([
      { tag: "path", attrs: { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" } },
      { tag: "circle", attrs: { cx: "12", cy: "12", r: "3" } }
    ]),
    ArrowRight: createIcon([
      { tag: "line", attrs: { x1: "5", y1: "12", x2: "19", y2: "12" } },
      { tag: "polyline", attrs: { points: "12 5 19 12 12 19" } }
    ]),
    TrendingUp: createIcon([
      { tag: "polyline", attrs: { points: "23 6 13.5 15.5 8.5 10.5 1 18" } },
      { tag: "polyline", attrs: { points: "17 6 23 6 23 12" } }
    ]),
    TrendingDown: createIcon([
      { tag: "polyline", attrs: { points: "23 18 13.5 8.5 8.5 13.5 1 6" } },
      { tag: "polyline", attrs: { points: "17 18 23 18 23 12" } }
    ]),
    Award: createIcon([
      { tag: "circle", attrs: { cx: "12", cy: "8", r: "6" } },
      { tag: "path", attrs: { d: "M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" } }
    ]),
    // Extra Advanced Feature Icons
    Battery: createIcon([
      { tag: "rect", attrs: { x: "1", y: "6", width: "18", height: "12", rx: "2" } },
      { tag: "line", attrs: { x1: "23", y1: "11", x2: "23", y2: "13" } }
    ]),
    BatteryCharging: createIcon([
      { tag: "path", attrs: { d: "M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.19" } },
      { tag: "line", attrs: { x1: "23", y1: "11", x2: "23", y2: "13" } },
      { tag: "polyline", attrs: { points: "11 6 7 12 13 12 9 18" } }
    ]),
    Download: createIcon([
      { tag: "path", attrs: { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" } },
      { tag: "polyline", attrs: { points: "7 10 12 15 17 10" } },
      { tag: "line", attrs: { x1: "12", y1: "15", x2: "12", y2: "3" } }
    ]),
    Trash: createIcon([
      { tag: "polyline", attrs: { points: "3 6 5 6 21 6" } },
      { tag: "path", attrs: { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" } }
    ]),
    Globe: createIcon([
      { tag: "circle", attrs: { cx: "12", cy: "12", r: "10" } },
      { tag: "line", attrs: { x1: "2", y1: "12", x2: "22", y2: "12" } },
      { tag: "path", attrs: { d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" } }
    ]),
    Languages: createIcon([
      { tag: "path", attrs: { d: "m5 8 6 6" } },
      { tag: "path", attrs: { d: "m4 14 6-6 2-3" } },
      { tag: "path", attrs: { d: "M2 5h12" } },
      { tag: "path", attrs: { d: "M7 2h1" } },
      { tag: "path", attrs: { d: "m22 22-5-10-5 10" } },
      { tag: "path", attrs: { d: "M14 18h6" } }
    ]),
    Lock: createIcon([
      { tag: "rect", attrs: { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" } },
      { tag: "path", attrs: { d: "M7 11V7a5 5 0 0 1 10 0v4" } }
    ]),
    Radio: createIcon([
      { tag: "circle", attrs: { cx: "12", cy: "12", r: "2" } },
      { tag: "path", attrs: { d: "M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" } }
    ]),
    FileText: createIcon([
      { tag: "path", attrs: { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" } },
      { tag: "polyline", attrs: { points: "14 2 14 8 20 8" } },
      { tag: "line", attrs: { x1: "16", y1: "13", x2: "8", y2: "13" } },
      { tag: "line", attrs: { x1: "16", y1: "17", x2: "8", y2: "17" } },
      { tag: "polyline", attrs: { points: "10 9 9 9 8 9" } }
    ]),
    Server: createIcon([
      { tag: "rect", attrs: { x: "2", y: "2", width: "20", height: "8", rx: "2", ry: "2" } },
      { tag: "rect", attrs: { x: "2", y: "14", width: "20", height: "8", rx: "2", ry: "2" } },
      { tag: "line", attrs: { x1: "6", y1: "6", x2: "6.01", y2: "6" } },
      { tag: "line", attrs: { x1: "6", y1: "18", x2: "6.01", y2: "18" } }
    ]),
    ChevronRight: createIcon([
      { tag: "polyline", attrs: { points: "9 18 15 12 9 6" } }
    ]),
    ChevronDown: createIcon([
      { tag: "polyline", attrs: { points: "6 9 12 15 18 9" } }
    ]),
    ChevronUp: createIcon([
      { tag: "polyline", attrs: { points: "18 15 12 9 6 15" } }
    ]),
    ChevronLeft: createIcon([
      { tag: "polyline", attrs: { points: "15 18 9 12 15 6" } }
    ]),
    RefreshCw: createIcon([
      { tag: "polyline", attrs: { points: "23 4 23 10 17 10" } },
      { tag: "polyline", attrs: { points: "1 20 1 14 7 14" } },
      { tag: "path", attrs: { d: "M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" } }
    ]),
    TrendingDown: createIcon([
      { tag: "polyline", attrs: { points: "23 18 13.5 8.5 8.5 13.5 1 6" } },
      { tag: "polyline", attrs: { points: "17 18 23 18 23 12" } }
    ]),
    Star: createIcon([
      { tag: "polygon", attrs: { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" } }
    ]),
    Settings: createIcon([
      { tag: "circle", attrs: { cx: "12", cy: "12", r: "3" } },
      { tag: "path", attrs: { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" } }
    ]),
    Home: createIcon([
      { tag: "path", attrs: { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" } },
      { tag: "polyline", attrs: { points: "9 22 9 12 15 12 15 22" } }
    ]),
    Plus: createIcon([
      { tag: "line", attrs: { x1: "12", y1: "5", x2: "12", y2: "19" } },
      { tag: "line", attrs: { x1: "5", y1: "12", x2: "19", y2: "12" } }
    ]),
    X: createIcon([
      { tag: "line", attrs: { x1: "18", y1: "6", x2: "6", y2: "18" } },
      { tag: "line", attrs: { x1: "6", y1: "6", x2: "18", y2: "18" } }
    ]),
    Menu: createIcon([
      { tag: "line", attrs: { x1: "3", y1: "12", x2: "21", y2: "12" } },
      { tag: "line", attrs: { x1: "3", y1: "6", x2: "21", y2: "6" } },
      { tag: "line", attrs: { x1: "3", y1: "18", x2: "21", y2: "18" } }
    ]),
    Upload: createIcon([
      { tag: "polyline", attrs: { points: "16 16 12 12 8 16" } },
      { tag: "line", attrs: { x1: "12", y1: "12", x2: "12", y2: "21" } },
      { tag: "path", attrs: { d: "M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" } }
    ]),
    Wifi: createIcon([
      { tag: "path", attrs: { d: "M5 12.55a11 11 0 0 1 14.08 0" } },
      { tag: "path", attrs: { d: "M1.42 9a16 16 0 0 1 21.16 0" } },
      { tag: "path", attrs: { d: "M8.53 16.11a6 6 0 0 1 6.95 0" } },
      { tag: "line", attrs: { x1: "12", y1: "20", x2: "12.01", y2: "20" } }
    ]),
    WifiOff: createIcon([
      { tag: "line", attrs: { x1: "1", y1: "1", x2: "23", y2: "23" } },
      { tag: "path", attrs: { d: "M16.72 11.06A10.94 10.94 0 0 1 19 12.55" } },
      { tag: "path", attrs: { d: "M5 12.55a10.94 10.94 0 0 1 5.17-2.39" } },
      { tag: "path", attrs: { d: "M10.71 5.05A16 16 0 0 1 22.56 9" } },
      { tag: "path", attrs: { d: "M1.42 9a15.91 15.91 0 0 1 4.7-2.88" } },
      { tag: "path", attrs: { d: "M8.53 16.11a6 6 0 0 1 6.95 0" } },
      { tag: "line", attrs: { x1: "12", y1: "20", x2: "12.01", y2: "20" } }
    ]),
    Clock: createIcon([
      { tag: "circle", attrs: { cx: "12", cy: "12", r: "10" } },
      { tag: "polyline", attrs: { points: "12 6 12 12 16 14" } }
    ]),
    AlertCircle: createIcon([
      { tag: "circle", attrs: { cx: "12", cy: "12", r: "10" } },
      { tag: "line", attrs: { x1: "12", y1: "8", x2: "12", y2: "12" } },
      { tag: "line", attrs: { x1: "12", y1: "16", x2: "12.01", y2: "16" } }
    ]),
    CheckCircle: createIcon([
      { tag: "path", attrs: { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" } },
      { tag: "polyline", attrs: { points: "22 4 12 14.01 9 11.01" } }
    ]),
    Copy: createIcon([
      { tag: "rect", attrs: { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" } },
      { tag: "path", attrs: { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" } }
    ]),
    Filter: createIcon([
      { tag: "polygon", attrs: { points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" } }
    ]),
    Send: createIcon([
      { tag: "line", attrs: { x1: "22", y1: "2", x2: "11", y2: "13" } },
      { tag: "polygon", attrs: { points: "22 2 15 22 11 13 2 9 22 2" } }
    ]),
    MessageSquare: createIcon([
      { tag: "path", attrs: { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" } }
    ]),
    Package: createIcon([
      { tag: "line", attrs: { x1: "16.5", y1: "9.4", x2: "7.5", y2: "4.21" } },
      { tag: "path", attrs: { d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" } },
      { tag: "polyline", attrs: { points: "3.27 6.96 12 12.01 20.73 6.96" } },
      { tag: "line", attrs: { x1: "12", y1: "22.08", x2: "12", y2: "12" } }
    ])
  };
})();
