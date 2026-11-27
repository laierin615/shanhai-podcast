/**
 * iPad 示意圖產生器：畫出簡化的 App 畫面，並用紅圈標出要點的位置。
 * MOCK.svg(scene, highlightId) → SVG 字串。畫面為示意，實際介面依 App 版本略有不同。
 */
(function defineMock(global) {
  "use strict";

  const esc = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const R = (x, y, w, h, fill, rx = 6, stroke = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${stroke ? ` stroke="${stroke}"` : ""}/>`;
  const T = (x, y, text, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || "#1d2327"}" text-anchor="${o.anchor || "start"}" font-weight="${o.weight || 400}">${esc(text)}</text>`;
  const C = (x, y, r, fill, stroke = "", sw = 1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ""}/>`;
  const L = (x1, y1, x2, y2, stroke, w = 1) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}"/>`;
  const pillWidth = (label, size = 11) => Math.round([...label].reduce((sum, ch) => sum + (ch.charCodeAt(0) > 255 ? size : size * 0.6), 0) + 16);

  /** 一顆按鈕，回傳 svg 與錨點 */
  function pill(x, y, label, o = {}) {
    const w = o.w || pillWidth(label, o.size || 11);
    const h = o.h || 22;
    const fill = o.fill || "rgba(0,0,0,0.06)";
    const color = o.color || "#1d2327";
    return { svg: R(x, y, w, h, fill, h / 2) + T(x + w / 2, y + h / 2 + 4, label, { anchor: "middle", fill: color, size: o.size || 11, weight: o.weight || 500 }), cx: x + w / 2, cy: y + h / 2, w };
  }

  /** App 標題列（左右按鈕），回傳 svg 與錨點 */
  function bar(title, o = {}) {
    const bg = o.bg || "#f6f6f7";
    const fg = o.fg || "#1d2327";
    let svg = R(12, 12, 456, 36, bg, 12) + R(12, 30, 456, 18, bg, 0);
    const anchors = {};
    let x = 20;
    (o.left || []).forEach(([id, label]) => {
      const p = pill(x, 19, label, { fill: o.btnFill || "rgba(0,0,0,0.07)", color: fg });
      svg += p.svg; anchors[id] = [p.cx, p.cy, Math.max(14, p.w / 2 + 2)]; x += p.w + 6;
    });
    let rx = 460;
    [...(o.right || [])].reverse().forEach(([id, label, accent]) => {
      const w = pillWidth(label);
      rx -= w;
      const p = pill(rx, 19, label, { fill: accent || o.btnFill || "rgba(0,0,0,0.07)", color: accent ? "#fff" : fg });
      svg += p.svg; anchors[id] = [p.cx, p.cy, Math.max(14, p.w / 2 + 2)]; rx -= 6;
    });
    if (o.center) {
      let cx = 240 - o.center.reduce((s, [, l]) => s + pillWidth(l) + 6, 0) / 2;
      o.center.forEach(([id, label, accent]) => {
        const p = pill(cx, 19, label, { fill: accent || "rgba(0,0,0,0.07)", color: accent ? "#fff" : fg });
        svg += p.svg; anchors[id] = [p.cx, p.cy, Math.max(14, p.w / 2 + 2)]; cx += p.w + 6;
      });
    } else if (title) {
      svg += T(240, 35, title, { anchor: "middle", fill: fg, weight: 700, size: 12 });
    }
    return { svg, anchors };
  }

  const wave = (x, y, w, h, color, seed = 1) => {
    let d = "";
    for (let i = 0; i < w; i += 3) {
      const amp = (Math.abs(Math.sin(i * 0.09 * seed) * Math.cos(i * 0.031 + seed)) * 0.9 + 0.1) * h / 2;
      d += `M${x + i} ${y + h / 2 - amp}V${y + h / 2 + amp}`;
    }
    return `<path d="${d}" stroke="${color}" stroke-width="1.6"/>`;
  };

  /* ---------- GarageBand 共用：控制列與軌道 ---------- */
  function gbControl() {
    let svg = R(12, 12, 456, 36, "#2a2a2d", 12) + R(12, 30, 456, 18, "#2a2a2d", 0);
    const a = {};
    const add = (id, x, label, o = {}) => { const p = pill(x, 19, label, { fill: o.fill || "#3a3a3e", color: o.color || "#f2f2f2", w: o.w }); svg += p.svg; a[id] = [p.cx, p.cy, Math.max(14, p.w / 2 + 2)]; return p.w; };
    let x = 20;
    x += add("songs", x, "我的樂曲") + 5;
    x += add("tracks", x, "軌道") + 5;
    add("mixer", x, "混音");
    svg += C(212, 30, 11, "#3a3a3e") + `<path d="M207 25 L207 35 L203 30 Z M213 25 L213 35 L209 30 Z" fill="#f2f2f2"/>`;
    svg += C(240, 30, 11, "#3a3a3e") + `<path d="M236 24 L246 30 L236 36 Z" fill="#f2f2f2"/>`; a.play = [240, 30, 14];
    svg += C(268, 30, 11, "#3a3a3e") + C(268, 30, 6, "#ff3b30"); a.rec = [268, 30, 14];
    x = 312;
    x += add("metro", x, "節拍器") + 5;
    x += add("loops", x, "迴圈") + 5;
    add("settings", x, "設定");
    return { svg, a };
  }

  function gbTracks(o = {}) {
    const c = gbControl();
    let svg = R(12, 48, 456, 280, "#1c1c1e", 0) + R(12, 316, 456, 12, "#1c1c1e", 12);
    svg += R(96, 50, 372, 14, "#2c2c30", 0);
    for (let i = 0; i < 8; i += 1) svg += T(100 + i * 44, 61, String(i + 1), { size: 9, fill: "#9a9aa0" });
    svg += T(456, 61, "＋", { size: 12, fill: "#f2f2f2", anchor: "middle", weight: 700 });
    const a = { ...c.a, section: [456, 57, 12] };
    const rows = [["語音", "#2bb3a3"], ["", ""], ["音樂", "#7a6cf2"]];
    rows.forEach(([name, color], i) => {
      const y = 68 + i * 70;
      svg += R(12, y, 82, 64, "#2c2c30", 0) + T(20, y + 20, name || "（空白軌道）", { size: 10, fill: "#d8d8dc" });
      if (name) svg += C(30, y + 42, 9, "#3a3a3e") + T(30, y + 46, "♪", { size: 10, fill: "#f2f2f2", anchor: "middle" });
      svg += R(96, y, 372, 64, i % 2 ? "#202024" : "#232327", 0);
    });
    if (!o.noRegion) {
      svg += R(100, 72, 240, 56, o.selected ? "#36c4b3" : "#2bb3a3", 6, o.selected ? "#ffd60a" : "") + wave(104, 80, 232, 40, "#0b3b36", 1.3);
      a.region = [220, 100, 26]; a.edge = [338, 100, 14];
    }
    svg += R(100, 212, 70, 56, "#7a6cf2", 6) + wave(104, 220, 62, 40, "#2a2165", 2.1);
    a.music = [135, 240, 20];
    a.drag = [260, 170, 22];
    return { svg: c.svg + svg, a };
  }

  /* ---------- 各畫面 ---------- */
  const SCENES = {
    "ff-home": () => {
      const b = bar("無邊記", { right: [["new", "＋ 新增白板", "#1e6ff2"]] });
      let svg = T(32, 74, "所有白板", { size: 14, weight: 700 });
      ["山海專題", "四健會", "kamamit"].forEach((n, i) => { svg += R(32 + i * 140, 86, 124, 84, "#eef3fb", 10, "#d5e0f2") + R(46 + i * 140, 100, 30, 24, "#ffe27a", 3) + T(32 + i * 140, 186, n, { size: 11 }); });
      return { svg: b.svg + svg, a: b.anchors };
    },
    "ff-board": () => {
      const b = bar("", { center: [["sticky", "便利貼"], ["shape", "形狀"], ["text", "文字"], ["photo", "照片"]], right: [["share", "協作"]] });
      let svg = "";
      for (let x = 30; x < 460; x += 22) for (let y = 62; y < 320; y += 22) svg += C(x, y, 1, "#d6dbe0");
      svg += R(70, 90, 120, 90, "#ffe27a", 4) + T(80, 120, "kamamit", { size: 13, weight: 700 }) + T(80, 140, "為什麼變少？", { size: 12 });
      svg += R(240, 140, 120, 90, "#ffe27a", 4) + T(250, 170, "（點兩下打字）", { size: 11, fill: "#7a6a2a" });
      return { svg: b.svg + svg, a: b.anchors };
    },
    "ff-zones": () => {
      const b = bar("", { center: [["sticky", "便利貼"], ["shape", "形狀"], ["text", "文字"]], right: [["share", "協作"]] });
      let svg = "";
      const zones = ["①身世與生態", "②田間與科學", "③廚房與保存", "④慢食與價值"];
      zones.forEach((z, i) => {
        const x = 24 + (i % 2) * 222; const y = 58 + Math.floor(i / 2) * 134;
        svg += R(x, y, 210, 126, "#f4f7fb", 8, "#cfd8e3") + T(x + 10, y + 20, z, { size: 12, weight: 700, fill: "#33506e" });
        svg += R(x + 12, y + 34, 82, 58, i === 1 ? "#ff6b5e" : "#ffe27a", 3) + T(x + 18, y + 58, i === 1 ? "除草劑？" : "好奇問題", { size: 10, fill: i === 1 ? "#fff" : "#3a3a1a" });
        svg += R(x + 104, y + 44, 82, 58, "#ffe27a", 3);
      });
      return { svg: b.svg + svg, a: { ...b.anchors, zone: [80, 74, 46], red: [280, 216, 30] } };
    },
    notes: () => {
      const b = bar("", { right: [["format", "格式"], ["check", "核取清單"], ["table", "表格"], ["attach", "附件"], ["new", "新增"]] });
      let svg = R(12, 48, 140, 280, "#f3f2ee", 0) + R(12, 316, 140, 12, "#f3f2ee", 12);
      svg += R(18, 58, 128, 40, "#f7d04c", 8) + T(26, 76, "第2組 節目企劃", { size: 11, weight: 700 }) + T(26, 91, "今天", { size: 9, fill: "#5b5323" });
      svg += T(26, 120, "kamamit 筆記", { size: 11 }) + T(26, 150, "四健會", { size: 11 });
      svg += T(172, 82, "第2組 節目企劃", { size: 17, weight: 700 });
      const items = [["節目名稱：kamamit 的酸甜", true], ["核心問題", true], ["耆老人選", false], ["三個問題", false]];
      items.forEach(([t, done], i) => {
        const y = 112 + i * 34;
        svg += C(184, y, 9, done ? "#f2b705" : "#fff", done ? "" : "#b8b8b8", 1.5) + (done ? T(184, y + 4, "✓", { size: 11, fill: "#fff", anchor: "middle", weight: 700 }) : "") + T(200, y + 4, t, { size: 12, fill: done ? "#8a8a8a" : "#1d2327" });
      });
      return { svg: b.svg + svg, a: { ...b.anchors, tick: [184, 180, 14] } };
    },
    "notes-menu": () => {
      const base = SCENES.notes();
      const x = 300; const y = 52;
      let svg = R(x, y, 160, 132, "#ffffff", 12, "#d8d8d8");
      ["掃描文件", "拍照或錄影", "選擇照片或影片", "錄音"].forEach((t, i) => { svg += T(x + 16, y + 26 + i * 32, t, { size: 12 }) + (i < 3 ? L(x + 10, y + 38 + i * 32, x + 150, y + 38 + i * 32, "#ececec") : ""); });
      return { svg: base.svg + svg, a: { ...base.a, scan: [x + 50, y + 22, 30] } };
    },
    "notes-camera": () => {
      const b = bar("掃描文件", { bg: "#111", fg: "#fff", btnFill: "#333", left: [["cancel", "取消"]], right: [["auto", "自動"]] });
      let svg = R(12, 48, 456, 280, "#2a2a2a", 0) + R(12, 316, 456, 12, "#2a2a2a", 12);
      svg += `<polygon points="150,80 330,76 345,262 140,266" fill="#f4f1e8"/>` + `<polygon points="150,80 330,76 345,262 140,266" fill="rgba(255,214,10,0.25)" stroke="#ffd60a" stroke-width="3"/>`;
      for (let i = 0; i < 6; i += 1) svg += L(168, 110 + i * 24, 320, 108 + i * 24, "#bdb6a3", 2);
      svg += C(240, 298, 16, "#fff", "#888", 3);
      const s = pill(388, 288, "儲存", { fill: "#ffd60a", color: "#111" });
      return { svg: b.svg + svg + s.svg, a: { ...b.anchors, frame: [244, 170, 60], save: [s.cx, s.cy, 22] } };
    },
    "pages-files": () => {
      const b = bar("Pages", { right: [["template", "選擇模板", "#f28c13"]] });
      let svg = T(32, 74, "最近項目", { size: 14, weight: 700 });
      [["節目腳本範本", "#fff"], ["邀請卡範本", "#fff"], ["四健會報告", "#fff"]].forEach(([n], i) => {
        svg += R(32 + i * 140, 86, 96, 124, "#ffffff", 4, "#d9d9d9");
        for (let k = 0; k < 6; k += 1) svg += L(42 + i * 140, 104 + k * 14, 118 + i * 140, 104 + k * 14, "#e3e3e3", 4);
        svg += T(32 + i * 140, 228, n, { size: 11 });
      });
      return { svg: b.svg + svg, a: { ...b.anchors, doc: [80, 150, 52] } };
    },
    "pages-table": () => {
      const b = bar("", { left: [["docs", "文件"]], right: [["collab", "協作"], ["format", "格式"], ["more", "⋯"]] });
      let svg = R(60, 56, 360, 270, "#fff", 2, "#e2e2e2") + T(80, 84, "《kamamit 的酸甜》節目腳本", { size: 14, weight: 700 });
      const cols = [["時間", 60], ["段落", 80], ["誰說", 80], ["內容", 100]];
      const rows = [["00:00", "片頭音樂", "製作人", "音樂"], ["00:15", "開場", "主持人", "Nga'ay ho!…"], ["01:15", "山海小知識", "研究員", ""], ["04:15", "來賓訪談", "耆老", ""]];
      let y = 100;
      let x = 80;
      cols.forEach(([h, w]) => { svg += R(x, y, w, 24, "#fde7c8", 0, "#e9c99b") + T(x + 6, y + 16, h, { size: 11, weight: 700 }); x += w; });
      rows.forEach((r, i) => { x = 80; y = 124 + i * 28; cols.forEach(([, w], j) => { svg += R(x, y, w, 28, "#fff", 0, "#e0d6c6") + T(x + 6, y + 18, r[j], { size: 10 }); x += w; }); });
      return { svg: b.svg + svg, a: { ...b.anchors, cell: [370, 194, 26] } };
    },
    "pages-export": () => {
      const base = SCENES["pages-table"]();
      let svg = R(296, 52, 166, 150, "#fff", 12, "#d6d6d6");
      ["匯出", "傳送拷貝", "列印", "文件設定"].forEach((t, i) => { svg += T(312, 76 + i * 30, t, { size: 12, weight: i === 0 ? 700 : 400 }); });
      svg += R(176, 60, 112, 126, "#fff", 12, "#d6d6d6");
      ["PDF", "Word", "EPUB", "RTF"].forEach((t, i) => { svg += T(192, 84 + i * 28, t, { size: 12, weight: i === 0 ? 700 : 400 }); });
      return { svg: base.svg + svg, a: { ...base.a, export: [330, 72, 24], pdf: [206, 80, 22] } };
    },
    "pages-templates": () => {
      const b = bar("選擇模板", { left: [["cancel", "取消"]] });
      let svg = R(12, 48, 130, 280, "#f6f6f7", 0) + R(12, 316, 130, 12, "#f6f6f7", 12);
      const cats = ["基本", "報告", "書籍", "信函", "卡片", "傳單與海報"];
      cats.forEach((c, i) => { svg += T(26, 76 + i * 34, c, { size: 12, weight: c === "卡片" ? 700 : 400, fill: c === "卡片" ? "#d9730d" : "#1d2327" }); });
      for (let i = 0; i < 6; i += 1) { const x = 160 + (i % 3) * 100; const y = 60 + Math.floor(i / 3) * 130; svg += R(x, y, 84, 110, ["#fde7c8", "#d9efe9", "#e6e2fb"][i % 3], 4, "#ddd") + R(x + 10, y + 12, 64, 40, "#fff", 3); }
      return { svg: b.svg + svg, a: { ...b.anchors, card: [44, 207, 26], poster: [62, 241, 40] } };
    },
    "pages-card": () => {
      const b = bar("", { left: [["docs", "文件"]], right: [["insert", "＋"], ["more", "⋯"]] });
      let svg = R(110, 56, 260, 268, "#fffaf2", 4, "#e5dccb");
      svg += R(130, 72, 220, 120, "#cfe3d6", 4) + `<path d="M130 172 L190 120 L240 160 L280 132 L350 180 L350 192 L130 192 Z" fill="#7fb08f"/>` + C(330, 180, 12, "#fff", "#999") + T(330, 185, "＋", { size: 13, anchor: "middle", weight: 700 });
      svg += T(240, 220, "邀請您擔任《kamamit 的酸甜》來賓", { size: 12, anchor: "middle", weight: 700 });
      ["日期：12/11（五）第 6 節", "地點：寧埔國小", "用途：學生 Podcast 節目"].forEach((t, i) => { svg += T(240, 244 + i * 20, t, { size: 11, anchor: "middle" }); });
      return { svg: b.svg + svg, a: { ...b.anchors, photo: [330, 180, 16], text: [240, 256, 60] } };
    },
    "pages-setup": () => {
      const b = bar("", { left: [["docs", "文件"]], right: [["more", "⋯"]] });
      let svg = R(60, 60, 200, 200, "#fff", 2, "#dcdcdc") + T(160, 166, "（空白正方形）", { size: 11, anchor: "middle", fill: "#999" });
      svg += R(286, 56, 176, 206, "#fff", 12, "#d6d6d6") + T(300, 80, "文件設定", { size: 13, weight: 700 });
      svg += T(300, 110, "紙張大小", { size: 11, fill: "#666" }) + R(300, 118, 148, 26, "#fde7c8", 6) + T(310, 136, "自訂", { size: 12, weight: 700 });
      svg += T(300, 168, "寬度", { size: 11, fill: "#666" }) + R(340, 156, 100, 22, "#f3f3f3", 5) + T(350, 172, "20 公分", { size: 11 });
      svg += T(300, 202, "高度", { size: 11, fill: "#666" }) + R(340, 190, 100, 22, "#f3f3f3", 5) + T(350, 206, "20 公分", { size: 11 });
      return { svg: b.svg + svg, a: { ...b.anchors, size: [374, 131, 30] } };
    },
    "cover-design": () => {
      const b = bar("封面", { left: [["docs", "文件"]] });
      let svg = R(140, 56, 200, 200, "#0a5560", 6);
      svg += C(240, 132, 46, "#7fb08f") + C(226, 120, 10, "#d9412b") + C(250, 140, 8, "#e4572e");
      svg += T(240, 206, "kamamit 的酸甜", { size: 20, anchor: "middle", fill: "#fff", weight: 700 });
      svg += T(240, 228, "Salimpo 山海之聲・第2組", { size: 11, anchor: "middle", fill: "#cfe9ec" });
      svg += T(240, 290, "大標題＋族語詞＋組別＋自己拍的照片", { size: 12, anchor: "middle", fill: "#555" });
      return { svg: b.svg + svg, a: { title: [240, 202, 60] } };
    },
    "ipad-buttons": () => {
      let svg = R(60, 70, 360, 250, "#1f2629", 22) + R(74, 84, 332, 222, "#e9f3f2", 10);
      svg += R(110, 62, 46, 9, "#3b464b", 3) + R(310, 62, 30, 9, "#3b464b", 3) + R(346, 62, 30, 9, "#3b464b", 3);
      svg += T(133, 54, "頂端按鈕", { size: 12, anchor: "middle", weight: 700 }) + T(343, 54, "音量鍵", { size: 12, anchor: "middle", weight: 700 });
      svg += T(240, 186, "同時按一下 → 畫面閃一下", { size: 15, anchor: "middle", weight: 700, fill: "#0a5560" });
      svg += T(240, 212, "截圖會存到「照片」", { size: 12, anchor: "middle", fill: "#335" });
      return { svg, a: { top: [133, 66, 20], vol: [343, 66, 24] }, noFrame: true };
    },
    "photos-crop": () => {
      const b = bar("編輯", { bg: "#111", fg: "#fff", btnFill: "#333", left: [["cancel", "取消"]], right: [["done", "完成", "#f2b705"]] });
      let svg = R(12, 48, 456, 280, "#000", 0) + R(12, 316, 456, 12, "#000", 12);
      svg += R(110, 64, 260, 190, "#0a5560", 2) + R(150, 64, 180, 180, "none", 0, "#fff");
      svg += `<rect x="150" y="64" width="180" height="180" fill="none" stroke="#fff" stroke-width="3"/>`;
      ["原始", "自由形式", "正方形", "16:9", "4:3"].forEach((t, i) => { const p = pill(78 + i * 66, 276, t, { fill: t === "正方形" ? "#f2b705" : "#333", color: t === "正方形" ? "#111" : "#eee", w: 60 }); svg += p.svg; });
      return { svg: b.svg + svg, a: { ...b.anchors, square: [240, 287, 32] } };
    },
    safari: () => {
      let svg = R(12, 12, 456, 36, "#ececee", 12) + R(12, 30, 456, 18, "#ececee", 0) + R(90, 19, 300, 22, "#fff", 8) + T(102, 34, "長濱 阿美族 kamamit", { size: 11 });
      svg += R(12, 48, 456, 280, "#fff", 0);
      [0, 1, 2].forEach((i) => { const y = 72 + i * 80; svg += T(32, y, "https://www.○○○.gov.tw › …", { size: 9, fill: "#1a7f37" }) + T(32, y + 18, i === 0 ? "長濱鄉的野生番茄 kamamit…" : "阿美族的野菜與採集…", { size: 13, fill: "#1a4fbf", weight: 700 }) + T(32, y + 38, "……文章摘要文字……", { size: 10, fill: "#555" }); });
      return { svg, a: { search: [240, 30, 40] } };
    },
    "safari-page": () => {
      let svg = R(12, 12, 456, 36, "#ececee", 12) + R(12, 30, 456, 18, "#ececee", 0) + R(90, 19, 300, 22, "#fff", 8) + T(102, 34, "www.○○○.gov.tw", { size: 11 });
      svg += R(12, 48, 456, 280, "#fff", 0) + T(32, 82, "長濱鄉的野生番茄 kamamit", { size: 16, weight: 700 });
      svg += R(30, 94, 170, 20, "#fff4c2", 4) + T(36, 108, "作者／單位：○○○", { size: 11 });
      svg += R(210, 94, 160, 20, "#fff4c2", 4) + T(216, 108, "發布日期：○○ 年 ○ 月", { size: 11 });
      for (let i = 0; i < 6; i += 1) svg += L(32, 136 + i * 18, 300, 136 + i * 18, "#e1e1e1", 6);
      svg += R(318, 130, 140, 106, "#eef7f5", 8, "#bfe0da") + T(330, 152, "查證三問", { size: 12, weight: 700, fill: "#0a5560" });
      ["✓ cimaay 誰寫的", "✓ mihecaan 哪一年", "？icowaay 哪一地"].forEach((t, i) => { svg += T(330, 174 + i * 20, t, { size: 11, fill: i === 2 ? "#b3261e" : "#1d2327" }); });
      return { svg, a: { author: [115, 104, 34], date: [290, 104, 34], check: [388, 182, 42] } };
    },
    padlet: () => {
      const b = bar("P3-03 山海之聲資料牆", { bg: "#fde9f2", fg: "#5b1a3a" });
      let svg = R(12, 48, 456, 280, "#fbf5f8", 0) + R(12, 316, 456, 12, "#fbf5f8", 12);
      const cols = ["第1組 Kolas", "第2組 Potal…", "第3組 Panay…", "第4組 Nakaw…"];
      cols.forEach((c, i) => {
        const x = 22 + i * 112;
        svg += T(x, 70, c, { size: 11, weight: 700 });
        svg += R(x, 80, 102, 56, i % 2 ? "#d6f0dd" : "#dbe9fb", 6) + T(x + 6, 98, "一句重點", { size: 10, weight: 700 }) + T(x + 6, 114, "出處…", { size: 9, fill: "#555" });
        if (i !== 2) svg += R(x, 144, 102, 46, i === 1 ? "#fde0dc" : "#d6f0dd", 6) + T(x + 6, 162, "一句重點", { size: 10, weight: 700 });
        svg += C(x + 51, 214, 12, "#e5357e") + T(x + 51, 219, "＋", { size: 13, fill: "#fff", anchor: "middle", weight: 700 });
      });
      return { svg: b.svg + svg, a: { board: [240, 30, 80], plus: [185, 214, 16] } };
    },
    "padlet-post": () => {
      const base = SCENES.padlet();
      let svg = R(12, 48, 456, 280, "rgba(0,0,0,0.35)", 0) + R(110, 58, 260, 262, "#fff", 12);
      svg += R(126, 74, 228, 26, "#f4f4f6", 6) + T(134, 91, "福壽螺會影響田裡的作物", { size: 11, weight: 700 });
      svg += R(126, 106, 228, 64, "#f4f4f6", 6) + T(134, 124, "誰寫的：Awos 農場 faki", { size: 10 }) + T(134, 140, "哪一年：115.09.11", { size: 10 }) + T(134, 156, "哪一地：長濱", { size: 10 });
      svg += R(126, 176, 84, 54, "#cfe3d6", 6) + T(168, 208, "照片", { size: 10, anchor: "middle" });
      ["#6fcf97", "#5b9cf2", "#ff6b5e", "#f2c94c"].forEach((c, i) => { svg += C(140 + i * 26, 252, 9, c, i === 0 ? "#1d2327" : "", 2); });
      const p = pill(298, 286, "發佈", { fill: "#e5357e", color: "#fff" });
      return { svg: base.svg + svg + p.svg, a: { title: [240, 87, 40], color: [180, 252, 52], publish: [p.cx, p.cy, 22] } };
    },
    "gb-browser": () => {
      const b = bar("音源", { bg: "#2a2a2d", fg: "#f2f2f2", btnFill: "#3a3a3e", left: [["songs", "我的樂曲"]] });
      let svg = R(12, 48, 456, 280, "#1c1c1e", 0) + R(12, 316, 456, 12, "#1c1c1e", 12);
      const cards = [["鍵盤", "#3d3d42"], ["鼓組", "#3d3d42"], ["錄音機", "#2bb3a3"], ["擴大器", "#3d3d42"]];
      cards.forEach(([n, c], i) => { const x = 28 + i * 110; svg += R(x, 84, 96, 130, c, 10) + C(x + 48, 130, 22, "rgba(255,255,255,0.18)") + T(x + 48, 196, n, { size: 13, anchor: "middle", fill: "#fff", weight: 700 }); });
      const v = pill(244, 226, "語音", { fill: "#ffd60a", color: "#111", w: 44 });
      const ins = pill(294, 226, "樂器", { fill: "#3a3a3e", color: "#eee", w: 44 });
      svg += v.svg + ins.svg + T(240, 290, "← 左右滑動找「錄音機」 →", { size: 12, anchor: "middle", fill: "#bbb" });
      return { svg: b.svg + svg, a: { recorder: [276, 150, 52], voice: [v.cx, v.cy, 22] } };
    },
    "gb-tracks": () => { const t = gbTracks(); return { svg: t.svg, a: t.a }; },
    "gb-section": () => {
      const t = gbTracks();
      let svg = R(300, 64, 160, 150, "#f2f2f4", 12) + T(316, 88, "樂段", { size: 13, weight: 700 });
      svg += T(316, 116, "樂段 A", { size: 12 }) + T(316, 146, "手動：8 小節", { size: 11, fill: "#888" });
      svg += T(316, 180, "自動", { size: 13, weight: 700 }) + R(396, 166, 44, 24, "#34c759", 12) + C(428, 178, 10, "#fff");
      return { svg: t.svg + svg, a: { ...t.a, auto: [418, 178, 22] } };
    },
    "gb-split": () => {
      const t = gbTracks({ selected: true });
      let svg = L(250, 70, 250, 130, "#ffd60a", 2) + T(250, 146, "✂", { size: 14, anchor: "middle", fill: "#ffd60a" });
      svg += R(110, 150, 300, 30, "#111", 8);
      const items = ["剪下", "拷貝", "刪除", "迴圈", "分割", "重新命名"];
      const a = {};
      items.forEach((it, i) => { const x = 116 + i * 48; svg += T(x + 20, 170, it, { size: 11, fill: "#fff", anchor: "middle" }); if (it === "分割") a.split = [x + 20, 165, 18]; if (it === "刪除") a.delete = [x + 20, 165, 18]; if (it === "迴圈") a.loopitem = [x + 20, 165, 18]; });
      return { svg: t.svg + svg, a: { ...t.a, ...a } };
    },
    "gb-loops": () => {
      const t = gbTracks();
      let svg = R(270, 48, 198, 280, "#f2f2f4", 0) + R(270, 316, 198, 12, "#f2f2f4", 12);
      const tabs = [["apple", "Apple Loops"], ["audio", "音訊"], ["files", "檔案"]];
      const a = {};
      let x = 278;
      tabs.forEach(([id, label]) => { const p = pill(x, 58, label, { fill: id === "files" ? "#ffd60a" : "#e2e2e6", color: "#111", size: 10 }); svg += p.svg; a[id] = [p.cx, p.cy, Math.max(14, p.w / 2)]; x += p.w + 4; });
      ["第2組_耆老訪談_備份", "第2組_開場", "第2組_小知識"].forEach((n, i) => { svg += R(280, 92 + i * 36, 178, 30, "#fff", 6) + T(290, 111 + i * 36, n, { size: 10 }); });
      svg += R(280, 214, 178, 30, "#d9e8ff", 6) + T(369, 233, "從「檔案」App 瀏覽項目", { size: 10, anchor: "middle", fill: "#1a4fbf" });
      return { svg: t.svg + svg, a: { ...t.a, ...a } };
    },
    "gb-loopbrowse": () => {
      const t = gbTracks({ noRegion: true });
      let svg = R(232, 48, 236, 280, "#f2f2f4", 0) + R(232, 316, 236, 12, "#f2f2f4", 12);
      const a = {};
      let x = 240;
      [["ins", "樂器"], ["genre", "類型"], ["desc", "描述"]].forEach(([id, label]) => { const p = pill(x, 56, label, { fill: id === "ins" ? "#ffd60a" : "#e2e2e6", color: "#111", size: 10 }); svg += p.svg; a[id] = [p.cx, p.cy, Math.max(14, p.w / 2)]; x += p.w + 4; });
      x = 240;
      ["鼓", "貝斯", "鋼琴", "吉他", "開心", "輕鬆"].forEach((c, i) => { const p = pill(x, 84 + Math.floor(i / 4) * 26, c, { fill: i === 0 || i === 4 ? "#2bb3a3" : "#fff", color: i === 0 || i === 4 ? "#fff" : "#333", size: 10 }); svg += p.svg; x = i === 3 ? 240 : x + p.w + 4; });
      a.filter = [300, 97, 40];
      [["Sunny Beat 鼓", "120"], ["Island Bass 貝斯", "120"], ["Morning Piano 鋼琴", "120"]].forEach(([n, bpm], i) => {
        const y = 144 + i * 40;
        svg += R(240, y, 220, 34, "#fff", 6) + C(258, y + 17, 10, i === 0 ? "#2bb3a3" : "#e2e2e6") + `<path d="M255 ${y + 11} L263 ${y + 17} L255 ${y + 23} Z" fill="${i === 0 ? "#fff" : "#555"}"/>` + T(276, y + 21, n, { size: 10 }) + T(450, y + 21, bpm, { size: 9, fill: "#888", anchor: "end" });
      });
      a.preview = [258, 161, 14];
      svg += T(350, 280, "名字是示意，挑聽起來開心的就好", { size: 9, fill: "#888", anchor: "middle" });
      return { svg: t.svg + svg, a: { ...t.a, ...a } };
    },
    "gb-layers": () => {
      const c = gbControl();
      let svg = R(12, 48, 456, 280, "#1c1c1e", 0) + R(12, 316, 456, 12, "#1c1c1e", 12) + R(96, 50, 372, 14, "#2c2c30", 0);
      for (let i = 0; i < 8; i += 1) svg += T(100 + i * 44, 61, String(i + 1), { size: 9, fill: "#9a9aa0" });
      const rows = [["鼓", "#f59e0b"], ["貝斯", "#22c55e"], ["鋼琴", "#7a6cf2"], ["全組喊聲", "#2bb3a3"]];
      rows.forEach(([name, color], i) => {
        const y = 68 + i * 62;
        svg += R(12, y, 82, 56, "#2c2c30", 0) + T(20, y + 22, name, { size: 10, fill: "#d8d8dc" }) + R(96, y, 372, 56, i % 2 ? "#202024" : "#232327", 0);
        if (i < 3) { for (let k = 0; k < 4; k += 1) svg += R(100 + k * 88, y + 6, 86, 44, color, 6) + T(104 + k * 88, y + 20, k ? "↻" : "", { size: 10, fill: "#111" }); }
        else svg += R(144, y + 6, 120, 44, color, 6) + wave(148, y + 12, 112, 32, "#0b3b36", 1.7);
      });
      svg += T(350, 324, "四條都從第 1 小節開始，長度 8 小節", { size: 9, fill: "#bbb", anchor: "middle" });
      return { svg: c.svg + svg, a: { ...c.a, stack: [60, 160, 40], loopext: [450, 90, 16], shout: [204, 280, 34] } };
    },
    "gb-settings": () => {
      const t = gbTracks();
      let svg = R(250, 56, 210, 230, "#f2f2f4", 12) + T(266, 82, "歌曲設定", { size: 13, weight: 700 });
      const a = {};
      [["速度", "120"], ["調", "C 大調"], ["淡出", ""]].forEach(([n, v], i) => {
        const y = 100 + i * 44;
        svg += R(262, y, 186, 36, "#fff", 8) + T(274, y + 23, n, { size: 12 });
        if (n === "淡出") { svg += R(392, y + 6, 44, 24, "#34c759", 12) + C(424, y + 18, 10, "#fff"); a.fade = [414, y + 18, 22]; }
        else { svg += T(436, y + 23, v, { size: 11, fill: "#888", anchor: "end" }); if (n === "速度") a.tempo = [400, y + 18, 30]; }
      });
      svg += T(355, 260, "打開淡出，結尾自己變小聲", { size: 10, fill: "#888", anchor: "middle" });
      return { svg: t.svg + svg, a: { ...t.a, ...a } };
    },
    "gb-mixer": () => {
      const t = gbTracks();
      let svg = R(12, 68, 170, 64, "#3a3a40", 0) + T(20, 86, "語音", { size: 11, fill: "#fff", weight: 700 }) + T(20, 112, "音量", { size: 10, fill: "#ccc" });
      svg += R(54, 106, 110, 6, "#666", 3) + R(54, 106, 88, 6, "#ffd60a", 3) + C(142, 109, 7, "#fff");
      svg += R(12, 208, 170, 64, "#3a3a40", 0) + T(20, 226, "音樂", { size: 11, fill: "#fff", weight: 700 }) + T(20, 252, "音量", { size: 10, fill: "#ccc" });
      svg += R(54, 246, 110, 6, "#666", 3) + R(54, 246, 40, 6, "#ffd60a", 3) + C(94, 249, 7, "#fff");
      return { svg: t.svg + svg, a: { ...t.a, vol: [118, 109, 34] } };
    },
    "gb-songs": () => {
      const b = bar("最近項目", { bg: "#f2f2f4", right: [["select", "選取"]] });
      let svg = "";
      ["第2組_kamamit的酸甜", "練習", "四健會"].forEach((n, i) => { svg += R(36 + i * 140, 70, 110, 110, i === 0 ? "#2bb3a3" : "#cfd3da", 12) + T(36 + i * 140, 198, n, { size: 10 }); });
      svg += R(150, 96, 150, 160, "#fff", 12, "#d6d6d6");
      const a = {};
      ["分享", "重新命名", "複製", "刪除"].forEach((t, i) => { svg += T(166, 124 + i * 36, t, { size: 12, fill: t === "刪除" ? "#d93025" : "#1d2327" }); if (t === "分享") a.share = [196, 120, 24]; if (t === "重新命名") a.rename = [206, 156, 32]; });
      return { svg: b.svg + svg, a: { ...b.anchors, ...a } };
    },
    "gb-share": () => {
      const b = bar("分享樂曲", { bg: "#f2f2f4", left: [["cancel", "取消"]], right: [["share", "分享", "#0a84ff"]] });
      let svg = "";
      const a = { ...b.anchors };
      ["歌曲", "鈴聲", "專案"].forEach((t, i) => { const x = 40 + i * 134; svg += R(x, 66, 116, 70, i === 0 ? "#d9f2ee" : "#f2f2f4", 10, i === 0 ? "#2bb3a3" : "") + T(x + 58, 106, t, { size: 13, anchor: "middle", weight: 700 }); if (i === 0) a.song = [x + 58, 101, 34]; });
      svg += T(40, 168, "品質", { size: 12, weight: 700 });
      ["低品質", "中品質", "高品質", "最高品質"].forEach((t, i) => { svg += R(40, 178 + i * 32, 400, 28, "#fff", 6, "#e2e2e2") + T(54, 197 + i * 32, t, { size: 11 }) + (t === "高品質" ? T(420, 197 + i * 32, "✓", { size: 13, fill: "#0a84ff", weight: 700 }) : ""); });
      a.quality = [90, 256, 30];
      return { svg: b.svg + svg, a };
    },
    "files-save": () => {
      const b = bar("儲存到檔案", { bg: "#f2f2f4", left: [["cancel", "取消"]], right: [["save", "儲存", "#0a84ff"]] });
      let svg = R(12, 48, 150, 280, "#f6f6f7", 0) + R(12, 316, 150, 12, "#f6f6f7", 12) + T(24, 72, "位置", { size: 11, fill: "#888" });
      ["iCloud 雲碟", "我的 iPad", "Google 雲端硬碟"].forEach((t, i) => { svg += R(20, 82 + i * 34, 134, 28, i === 2 ? "#dfe9ff" : "transparent", 6) + T(30, 101 + i * 34, t, { size: 11, weight: i === 2 ? 700 : 400 }); });
      svg += T(180, 72, "P3-03 山海之聲 Podcast 成果", { size: 12, weight: 700 });
      ["第1組", "第2組", "第3組", "第4組"].forEach((t, i) => { svg += R(180, 84 + i * 34, 272, 28, t === "第2組" ? "#dfe9ff" : "#fff", 6, "#e3e3e3") + T(196, 103 + i * 34, "▸ " + t, { size: 11 }); });
      return { svg: b.svg + svg, a: { ...b.anchors, drive: [87, 150, 46], folder: [240, 132, 40] } };
    },
    vm: () => {
      const b = bar("語音備忘錄", { bg: "#1c1c1e", fg: "#fff", btnFill: "#333" });
      let svg = R(12, 48, 200, 280, "#232325", 0) + R(12, 316, 200, 12, "#232325", 12) + R(212, 48, 256, 280, "#111", 0) + R(212, 316, 256, 12, "#111", 12);
      svg += R(20, 58, 184, 46, "#3a3a3c", 8) + T(30, 78, "第2組_耆老訪談_備份", { size: 11, fill: "#fff", weight: 700 }) + T(30, 95, "12:31", { size: 10, fill: "#aaa" }) + T(190, 82, "⋯", { size: 16, fill: "#fff", anchor: "middle" });
      svg += T(30, 130, "新錄音 2", { size: 11, fill: "#ddd" });
      svg += wave(232, 120, 216, 80, "#ff453a", 1.7);
      svg += C(340, 284, 24, "#fff") + C(340, 284, 18, "#ff3b30");
      return { svg: b.svg + svg, a: { rec: [340, 284, 30], name: [100, 78, 52], more: [190, 80, 16] } };
    },
    "share-sheet": () => {
      const b = bar("第2組_耆老訪談_備份", { right: [["share", "分享 ⇪"]] });
      let svg = R(12, 48, 456, 280, "rgba(0,0,0,0.25)", 0) + R(110, 70, 260, 250, "#f2f2f4", 14);
      svg += C(150, 112, 20, "#0a84ff") + T(150, 117, "◎", { size: 14, fill: "#fff", anchor: "middle" }) + T(150, 146, "AirDrop", { size: 10, anchor: "middle" });
      svg += C(206, 112, 20, "#d1d1d6") + T(206, 146, "訊息", { size: 10, anchor: "middle" });
      svg += R(126, 162, 228, 32, "#fff", 8) + T(140, 183, "老師的 iPad", { size: 12, weight: 700 });
      ["儲存到檔案", "拷貝"].forEach((t, i) => { svg += R(126, 204 + i * 38, 228, 32, "#fff", 8) + T(140, 225 + i * 38, t, { size: 12 }); });
      return { svg: b.svg + svg, a: { ...b.anchors, airdrop: [150, 112, 24], teacher: [200, 178, 40], files: [190, 220, 40] } };
    },
    drive: () => {
      let svg = R(12, 12, 456, 36, "#fff", 12) + R(12, 30, 456, 18, "#fff", 0) + R(40, 18, 340, 24, "#eef2f8", 12) + T(56, 34, "在雲端硬碟中搜尋", { size: 11, fill: "#666" }) + C(440, 30, 12, "#5b8def") + T(440, 34, "我", { size: 10, fill: "#fff", anchor: "middle" });
      svg += R(12, 48, 456, 280, "#fff", 0);
      svg += T(32, 76, "與我共用", { size: 13, weight: 700 });
      ["P3-03 山海之聲 Podcast 成果（115上）", "第2組", "115中高年級專題"].forEach((t, i) => { svg += R(28, 88 + i * 40, 420, 32, i === 0 ? "#e8f0fe" : "#fff", 6, "#e3e3e3") + R(40, 98 + i * 40, 14, 11, "#f4b400", 2) + T(62, 109 + i * 40, t, { size: 11 }); });
      svg += R(12, 290, 456, 38, "#f8f9fb", 0) + R(12, 316, 456, 12, "#f8f9fb", 12);
      ["首頁", "已加星號", "共用", "檔案"].forEach((t, i) => { svg += T(70 + i * 110, 312, t, { size: 11, anchor: "middle", weight: t === "共用" ? 700 : 400, fill: t === "共用" ? "#1a73e8" : "#444" }); });
      svg += C(430, 258, 20, "#fff", "#d0d0d0") + T(430, 264, "＋", { size: 18, anchor: "middle", fill: "#1a73e8", weight: 700 });
      return { svg, a: { account: [440, 30, 16], folder: [200, 104, 60], shared: [290, 308, 22], plus: [430, 258, 24] } };
    },
    "drive-menu": () => {
      const base = SCENES.drive();
      let svg = R(12, 160, 456, 168, "#fff", 14, "#ddd") + T(32, 186, "新增", { size: 13, weight: 700 });
      ["資料夾", "上傳", "掃描", "Google 文件"].forEach((t, i) => { svg += R(32 + i * 106, 200, 90, 70, "#f1f3f4", 10) + T(77 + i * 106, 244, t, { size: 11, anchor: "middle", weight: t === "上傳" ? 700 : 400 }); });
      return { svg: base.svg + svg, a: { upload: [183, 235, 40] } };
    },
    "drive-files": () => {
      let svg = R(12, 12, 456, 36, "#fff", 12) + R(12, 30, 456, 18, "#fff", 0) + T(32, 35, "‹  第2組", { size: 13, weight: 700 });
      svg += R(12, 48, 456, 280, "#fff", 0);
      ["第2組_kamamit的酸甜_完成版.m4a", "第2組_封面.png", "第2組_腳本.pdf", "第2組_海報.pdf"].forEach((t, i) => { svg += R(28, 66 + i * 44, 420, 36, "#fff", 6, "#e3e3e3") + R(40, 76 + i * 44, 14, 16, ["#7a6cf2", "#2bb3a3", "#d93025", "#d93025"][i], 3) + T(62, 89 + i * 44, t, { size: 11 }); });
      svg += T(240, 270, "四個檔案都看得到 → 上傳成功", { size: 13, anchor: "middle", weight: 700, fill: "#1a7f37" });
      return { svg, a: { files: [240, 132, 90] } };
    },
  };

  /**
   * 產生示意圖
   * @param {string} scene 畫面代號
   * @param {string} [highlight] 要圈起來的錨點
   * @returns {string} SVG 字串
   */
  function svg(scene, highlight) {
    const build = SCENES[scene];
    if (!build) return "";
    const result = build();
    const frame = result.noFrame ? "" : R(0, 0, 480, 340, "#1f2629", 26) + R(12, 12, 456, 316, "#ffffff", 12);
    let ring = "";
    const anchor = highlight && result.a ? result.a[highlight] : null;
    if (anchor) {
      const [x, y, r = 18] = anchor;
      ring = `<g class="mock-hl"><circle cx="${x}" cy="${y}" r="${r + 6}" fill="none" stroke="#ff3b30" stroke-width="3.5"/><circle class="mock-pulse" cx="${x}" cy="${y}" r="${r + 6}" fill="none" stroke="#ff3b30" stroke-width="2"/></g>`;
    }
    return `<svg class="mock" viewBox="0 0 480 340" role="img" aria-label="iPad 畫面示意圖" font-family="Noto Sans TC, PingFang TC, Microsoft JhengHei, sans-serif">${frame}${result.svg}${ring}</svg>`;
  }

  /** 範例封面（正方形） */
  function cover(title, sub) {
    return `<svg class="cover-svg" viewBox="0 0 300 300" role="img" aria-label="範例封面" font-family="Noto Sans TC, PingFang TC, sans-serif">` +
      R(0, 0, 300, 300, "#0a5560", 0) + C(150, 118, 70, "#7fb08f") + C(128, 100, 15, "#d9412b") + C(164, 130, 12, "#e4572e") + C(140, 140, 9, "#c7372a") +
      `<path d="M40 210 Q150 190 260 210" stroke="#cfe9ec" stroke-width="2" fill="none"/>` +
      T(150, 244, title, { size: 30, anchor: "middle", fill: "#fff", weight: 700 }) +
      T(150, 274, sub, { size: 14, anchor: "middle", fill: "#cfe9ec" }) + `</svg>`;
  }

  global.MOCK = { svg, cover, scenes: Object.keys(SCENES) };
})(window);
