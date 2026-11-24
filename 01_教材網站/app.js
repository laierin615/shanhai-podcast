/**
 * 山海之聲 Podcast 教材網站：路由、簡報播放器、學生手冊（圖文教學）、學習單、教案、成果上傳。
 * 依賴 COURSE（content.js）、MOCK（mock.js）、DECKS（slides.js）、PLAN_HTML（plan.js），可選 qrcode（qrcode-generator）。
 */
(function startApp() {
  "use strict";
  const C = window.COURSE;
  const M = window.MOCK;
  const DECKS = window.DECKS;

  /* ---------- 共用工具 ---------- */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const store = {
    read(key, fallback) { try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (error) { return fallback; } },
    write(key, value) { try { window.localStorage.setItem(key, JSON.stringify(value)); return true; } catch (error) { return false; } },
    remove(key) { try { window.localStorage.removeItem(key); } catch (error) { /* 儲存空間不可用時略過 */ } },
  };

  const debounce = (callback, waitMs) => { let timer = null; return (...args) => { window.clearTimeout(timer); timer = window.setTimeout(() => callback(...args), waitMs); }; };

  function showStatus(element, message) {
    if (!element) return;
    element.textContent = message;
    window.clearTimeout(element._timer);
    element._timer = window.setTimeout(() => { element.textContent = ""; }, 4500);
  }

  /** 複製文字；剪貼簿被拒時改為選取文字 */
  async function copyText(text, fallback, status) {
    try {
      await navigator.clipboard.writeText(text);
      showStatus(status, "已複製，可以貼到備忘錄或 Pages。");
    } catch (error) {
      if (fallback) { fallback.hidden = false; fallback.value = text; fallback.focus(); fallback.select(); }
      showStatus(status, "無法自動複製，已幫你選取文字，請按「拷貝」。");
    }
  }

  const waveHtml = (count, seed = 1) => Array.from({ length: count }, (_, i) => `<i style="height:${18 + Math.round(70 * Math.abs(Math.sin(i * 0.55 * seed) * Math.cos(i * 0.17 + seed)))}%"></i>`).join("");
  const groupName = (group) => `${group.label} ${group.members.join("、")}`;

  /* ---------- Google 雲端連結轉換 ---------- */
  const DOC_EXPORTS = {
    document: (id) => `https://docs.google.com/document/d/${id}/export?format=pdf`,
    presentation: (id) => `https://docs.google.com/presentation/d/${id}/export/pdf`,
    spreadsheets: (id) => `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`,
  };

  /**
   * 分析 Google 雲端分享連結，回傳開啟與直接下載連結。
   * @param {string} rawUrl 貼上的連結
   * @returns {{kind:string, open:string, download:(string|null), message:string}|null}
   */
  function analyzeLink(rawUrl) {
    const url = String(rawUrl || "").trim();
    if (!url) return null;
    const file = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/) || url.match(/drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([\w-]+)/);
    if (file) return { kind: "雲端檔案", open: `https://drive.google.com/file/d/${file[1]}/view`, download: `https://drive.google.com/uc?export=download&id=${file[1]}`, message: "直接下載連結不用登入，點了會跳出「要下載嗎？」。超過 100 MB 的檔案 Google 會先提醒無法掃描病毒，按「仍要下載」即可。" };
    const doc = url.match(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([\w-]+)/);
    if (doc) return { kind: { document: "Google 文件（下載成 PDF）", presentation: "Google 簡報（下載成 PDF）", spreadsheets: "Google 試算表（下載成 Excel）" }[doc[1]], open: url, download: DOC_EXPORTS[doc[1]](doc[2]), message: "請先把一般存取權設成「知道連結的任何人」。" };
    if (/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/[\w-]+/.test(url)) return { kind: "雲端資料夾", open: url, download: null, message: "資料夾沒有直接下載連結，QR Code 會打開資料夾。學生要上傳，資料夾要共用給他們的 Google 帳號（編輯者）。" };
    if (/^https?:\/\//i.test(url)) return { kind: "一般網址", open: url, download: null, message: "QR Code 會直接打開這個網址。" };
    return null;
  }

  /* ---------- QR Code ---------- */
  function qrModules(text) {
    if (typeof window.qrcode !== "function" || !text) return null;
    try { const qr = window.qrcode(0, "M"); qr.addData(text); qr.make(); return { size: qr.getModuleCount(), isDark: (r, c) => qr.isDark(r, c) }; } catch (error) { return null; }
  }

  function qrSvg(text, label) {
    const m = qrModules(text);
    if (!m) return `<div class="qr-missing">${text ? `無法產生 QR Code，請用「捷徑」App 的「製作 QR 碼」。<br><span class="mono">${escapeHtml(text)}</span>` : "老師還沒有設定這個連結（到「成果上傳」頁設定）。"}</div>`;
    const margin = 2; const total = m.size + margin * 2; let path = "";
    for (let r = 0; r < m.size; r += 1) for (let c = 0; c < m.size; c += 1) if (m.isDark(r, c)) path += `M${c + margin} ${r + margin}h1v1h-1z`;
    return `<svg class="qr-svg" viewBox="0 0 ${total} ${total}" role="img" aria-label="${escapeHtml(label || "QR Code")}" shape-rendering="crispEdges"><rect width="${total}" height="${total}" fill="#ffffff"/><path d="${path}" fill="#0b1b1f"/></svg>`;
  }

  function qrBlob(text, px = 1024) {
    const m = qrModules(text);
    if (!m) return Promise.resolve(null);
    const margin = 2; const total = m.size + margin * 2; const cell = px / total;
    const canvas = document.createElement("canvas"); canvas.width = px; canvas.height = px;
    const ctx = canvas.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, px, px); ctx.fillStyle = "#0b1b1f";
    for (let r = 0; r < m.size; r += 1) for (let c = 0; c < m.size; c += 1) if (m.isDark(r, c)) ctx.fillRect(Math.floor((c + margin) * cell), Math.floor((r + margin) * cell), Math.ceil(cell), Math.ceil(cell));
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }

  /* ---------- 平台能力與共享設定 ---------- */
  const platform = { db: null, assets: null, user: null, downloads: null, canEdit: false, ready: false };
  const SETTING_DEFAULTS = { folderUrl: C.DRIVE.root, handoutUrl: C.DRIVE.teacher, padletUrl: "", radioAlianUrl: C.RADIO.alian.video, radioAlbumUrl: C.RADIO.alian.album, radioReelUrl: C.RADIO.alian.reel, radioTaitungUrl: "" };
  const shared = { settings: store.read("p303:settings", {}), groups: {}, loaded: false, error: "" };
  const setting = (key) => (shared.settings && shared.settings[key]) || SETTING_DEFAULTS[key];

  async function initPlatform() {
    if (!window.claude || typeof window.claude.use !== "function") { platform.ready = true; renderMode(); return; }
    const use = (name) => window.claude.use(name).catch(() => null);
    const [db, assets, user, downloads] = await Promise.all([use("db"), use("assets"), use("user"), use("downloads")]);
    Object.assign(platform, { db, assets, user, downloads });
    platform.canEdit = user ? await user.canEdit().catch(() => false) : false;
    platform.ready = true;
    if (db) subscribe();
    renderMode();
  }

  function subscribe() {
    const timer = window.setTimeout(() => { if (!shared.loaded) { shared.error = "成果牆資料暫時連不上，畫面可能不是最新的。"; renderWall(); } }, 10000);
    platform.db.collection("groups").onSnapshot((snap) => {
      const next = {}; snap.docs.forEach((d) => { if (d.exists) next[d.id] = d.data(); });
      shared.groups = next;
      if (!snap.metadata.fromCache) { shared.loaded = true; shared.error = ""; window.clearTimeout(timer); }
      renderWall();
    }, (error) => { window.clearTimeout(timer); shared.loaded = true; shared.error = error.code === "revoked" ? "" : "成果牆資料無法讀取。"; renderWall(); });
    platform.db.doc("settings/links").onSnapshot((snap) => {
      if (snap.exists) { shared.settings = { ...shared.settings, ...snap.data() }; renderSettings(); refreshLinks(); }
    }, () => { /* 讀不到時沿用本機或預設 */ });
  }

  async function saveSettings(patch, status) {
    shared.settings = { ...shared.settings, ...patch };
    store.write("p303:settings", shared.settings);
    refreshLinks(); renderFolderQrs();
    if (platform.db && platform.canEdit) {
      try {
        await platform.db.doc("settings/links").set(Object.fromEntries(Object.keys(SETTING_DEFAULTS).map((k) => [k, setting(k)])));
        showStatus(status, "已儲存，簡報上的 QR Code 和連結也更新了。");
      } catch (error) { showStatus(status, "雲端儲存失敗，只存在這台裝置。請稍後再試。"); }
    } else { showStatus(status, "已存在這台裝置（用老師帳號開啟才會同步到所有裝置）。"); }
  }

  /* ---------- 路由 ---------- */
  const VIEWS = ["overview", "slides", "guide", "sheets", "plan", "upload"];
  const route = { view: "overview", deck: 0, slide: 0, sheet: "ws1" };

  function parseHash() {
    const parts = window.location.hash.replace(/^#/, "").split("-");
    route.view = VIEWS.includes(parts[0]) ? parts[0] : "overview";
    if (route.view === "slides") {
      const i = DECKS.findIndex((d) => d.id === parts[1]);
      if (i >= 0) route.deck = i;
      const n = Number.parseInt(parts[2], 10);
      route.slide = Number.isFinite(n) ? Math.max(0, Math.min(n - 1, DECKS[route.deck].slides.length - 1)) : 0;
    }
    if (route.view === "sheets" && C.WORKSHEETS.some((s) => s.id === parts[1])) route.sheet = parts[1];
    route.anchor = route.view === "guide" && parts[1] ? parts.slice(1).join("-") : "";
  }

  const setHash = (hash) => { if (window.location.hash !== `#${hash}`) window.location.hash = hash; else applyRoute(); };

  function applyRoute() {
    parseHash();
    VIEWS.forEach((v) => { $(`#view-${v}`).hidden = v !== route.view; });
    $$(".nav-tab").forEach((t) => t.setAttribute("aria-current", t.dataset.view === route.view ? "page" : "false"));
    if (route.view === "slides") renderSlide();
    if (route.view === "sheets") renderSheet();
    if (route.view === "guide" && route.anchor) window.setTimeout(() => { const el = document.getElementById(`g-${route.anchor}`); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 30);
    else window.scrollTo(0, 0);
  }

  /* ---------- 總覽 ---------- */
  function renderOverview() {
    $("#sessions").innerHTML = C.SESSIONS.map((s, i) => {
      const lessons = s.lessons.map((n) => C.LESSONS.find((l) => l.n === n));
      return `<article class="session ${i === C.SESSIONS.length - 1 ? "session-end" : ""}">
        <p class="session-date"><b>${s.date}</b>（五）</p>
        <h3>${s.theme}</h3>
        <ul class="session-lessons">${lessons.map((l) => `<li><span class="lesson-n">${l.label}</span>${l.title}<span class="apps">${l.apps.join("・")}</span></li>`).join("")}</ul>
        <div class="row-actions"><a class="btn btn-small" href="#slides-${DECKS[i + 1].id}">打開簡報</a><a class="btn btn-small btn-ghost" href="#guide-lessons">這次要做什麼</a></div>
      </article>`;
    }).join("");
    $("#groups").innerHTML = C.GROUPS.map((g) => `<div class="group-card"><span class="group-label">${g.label}</span><b>${g.members.join("、")}</b>${g.note ? `<small>${g.note}</small>` : ""}</div>`).join("");
    $("#apps").innerHTML = `<div class="apps-col"><h4>要先下載（免費）</h4><ul>${C.APPS.filter((a) => a.install).map((a) => `<li><b>${a.name}</b><span>${a.use}</span></li>`).join("")}</ul></div><div class="apps-col"><h4>iPad 內建</h4><ul>${C.APPS.filter((a) => !a.install).map((a) => `<li><b>${a.name}</b><span>${a.use}</span></li>`).join("")}</ul></div>`;
    const prep = store.read("p303:prep2", {});
    $("#prep").innerHTML = C.PREP.map((p, i) => `<li><label class="check-row" for="prep-${i}"><input type="checkbox" id="prep-${i}" data-prep="${i}" ${prep[i] ? "checked" : ""}><span><b class="prep-when">${p.when}</b>${p.item}</span></label></li>`).join("");
    $("#prep").addEventListener("change", (e) => { const box = e.target.closest("[data-prep]"); if (!box) return; const s = store.read("p303:prep2", {}); s[box.dataset.prep] = box.checked; store.write("p303:prep2", s); });
    $("#docs").innerHTML = C.DOCS.map((d) => `<li><a href="${d.url}" target="_blank" rel="noopener">${d.label}</a></li>`).join("");
    $(".hero-wave").innerHTML = waveHtml(64, 1.3);
  }

  /* ---------- 簡報 ---------- */
  const notes = { open: store.read("p303:notes", true) };

  function renderDeckTabs() {
    $("#deck-tabs").innerHTML = DECKS.map((d, i) => `<button type="button" class="deck-tab" data-deck="${i}" aria-pressed="false">${d.label}<small>${d.sub}</small></button>`).join("");
    $("#deck-tabs").addEventListener("click", (e) => { const t = e.target.closest("[data-deck]"); if (t) setHash(`slides-${DECKS[Number(t.dataset.deck)].id}-1`); });
  }

  function renderSlide() {
    const deck = DECKS[route.deck]; const slide = deck.slides[route.slide];
    $("#slide-canvas").innerHTML = slide.html;
    $$(".s-wave", $("#slide-canvas")).forEach((w) => { w.innerHTML = waveHtml(72, 1 + route.slide * 0.1); });
    $("#slide-counter").textContent = `${String(route.slide + 1).padStart(2, "0")} / ${String(deck.slides.length).padStart(2, "0")}`;
    $("#slide-progress").style.width = `${((route.slide + 1) / deck.slides.length) * 100}%`;
    $("#slide-note").innerHTML = `<b>講稿提示</b>${escapeHtml(slide.note || "（這頁沒有提示）")}`;
    $("#slide-note").hidden = !notes.open;
    $("#toggle-notes").setAttribute("aria-pressed", String(notes.open));
    $("#slide-prev").disabled = route.slide === 0;
    $("#slide-next").disabled = route.slide === deck.slides.length - 1;
    $$(".deck-tab").forEach((t) => t.setAttribute("aria-pressed", String(Number(t.dataset.deck) === route.deck)));
    refreshLinks(); fitStage();
  }

  function moveSlide(step) {
    const deck = DECKS[route.deck];
    const next = Math.max(0, Math.min(route.slide + step, deck.slides.length - 1));
    if (next !== route.slide) setHash(`slides-${deck.id}-${next + 1}`);
  }

  function fitStage() { const stage = $("#stage"); if (stage) $("#slide-canvas").style.transform = `scale(${stage.clientWidth / 1280})`; }

  const QR_KEYS = { folder: ["folderUrl", "成果上傳資料夾"], handout: ["handoutUrl", "課程講義"], padlet: ["padletUrl", "Padlet 資料牆"] };

  /** 更新所有 QR Code 與電台連結 */
  function refreshLinks() {
    $$(".qr-slot").forEach((slot) => {
      const [key, caption] = QR_KEYS[slot.dataset.qr] || [];
      if (!key) return;
      const url = setting(key); const info = analyzeLink(url);
      slot.innerHTML = qrSvg(slot.dataset.qr === "handout" && info && info.download ? info.download : url, caption);
      const cap = $(`[data-qr-cap="${slot.dataset.qr}"]`); if (cap) cap.textContent = caption;
    });
    $$("[data-link]").forEach((a) => {
      const url = setting(`${a.dataset.link}Url`);
      if (url) { a.href = url; a.classList.remove("is-empty"); a.textContent = a.dataset.label || "▶ 播放片段"; } else { a.removeAttribute("href"); a.classList.add("is-empty"); a.textContent = "老師還沒設定連結"; }
    });
  }

  function bindPlayer() {
    $("#slide-prev").addEventListener("click", () => moveSlide(-1));
    $("#slide-next").addEventListener("click", () => moveSlide(1));
    $("#toggle-notes").addEventListener("click", () => { notes.open = !notes.open; store.write("p303:notes", notes.open); renderSlide(); });
    $("#slide-fullscreen").addEventListener("click", async () => {
      const player = $("#player");
      try { if (document.fullscreenElement) await document.exitFullscreen(); else if (player.requestFullscreen) await player.requestFullscreen(); else throw new Error("unsupported"); }
      catch (error) { showStatus($("#player-status"), "這個畫面不支援全螢幕，可以把 iPad 橫放並用 AirPlay 投影。"); }
    });
    document.addEventListener("fullscreenchange", () => window.requestAnimationFrame(fitStage));
    document.addEventListener("keydown", (e) => {
      if (route.view !== "slides" || e.target.closest("input, textarea, select")) return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); moveSlide(1); }
      if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); moveSlide(-1); }
    });
    const stage = $("#stage"); let start = null;
    stage.addEventListener("pointerdown", (e) => { start = { x: e.clientX, y: e.clientY }; });
    stage.addEventListener("pointerup", (e) => {
      if (!start) return; const dx = e.clientX - start.x; const dy = e.clientY - start.y; start = null;
      if (e.target.closest("a, button")) return;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { moveSlide(dx < 0 ? 1 : -1); return; }
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) { const b = stage.getBoundingClientRect(); moveSlide(e.clientX - b.left > b.width / 2 ? 1 : -1); }
    });
    if (window.ResizeObserver) new ResizeObserver(fitStage).observe(stage); else window.addEventListener("resize", fitStage);
  }

  /* ---------- 學生手冊（圖文教學） ---------- */
  function renderGuide() {
    const total = C.RUNDOWN.reduce((s, r) => s + ({ "15 秒": 0.25, "1 分鐘": 1, "3 分鐘": 3, "6–8 分鐘": 7, "1–2 分鐘": 1.5, "30 秒": 0.5 }[r.len] || 1), 0);
    const bar = C.RUNDOWN.map((r) => { const v = { "15 秒": 0.25, "1 分鐘": 1, "3 分鐘": 3, "6–8 分鐘": 7, "1–2 分鐘": 1.5, "30 秒": 0.5 }[r.len] || 1; return `<div class="seg" style="flex:${v}"><b>${r.seg}</b><small>${r.len}</small></div>`; }).join("");
    const toolOrder = ["freeform", "notes", "pagesScript", "pagesCard", "notesScan", "padlet", "safari", "gbNew", "voiceMemo", "airdrop", "gbEdit", "gbMusic", "cover", "gbExport", "driveUpload"];
    const E = C.EXAMPLES;

    $("#guide-index").innerHTML = [["what", "什麼是 Podcast"], ["lessons", "每次上課要做什麼"], ["tools", "iPad 圖文教學"], ...toolOrder.map((k) => [`tool-${k}`, `　${C.TOOLS[k].title}`]), ["examples", "範例櫃"], ["words", "族語小卡"]]
      .map(([id, label]) => `<a href="#guide-${id}">${label}</a>`).join("");

    $("#guide-body").innerHTML = `
      <section class="g-sec" id="g-what">
        <h3 class="g-h">什麼是 Podcast？</h3>
        <div class="what-grid">
          <div class="player-card" aria-hidden="true">
            <div class="pc-cover">${M.cover(E.showName, "第2組")}</div>
            <div class="pc-info"><small>Salimpo 山海之聲・第 2 集</small><b>${E.showName}</b><div class="pc-bar"><i style="width:38%"></i></div><div class="pc-time"><span>05:12</span><span>13:48</span></div><div class="pc-btns"><span>⟲15</span><span class="pc-play">▶</span><span>15⟳</span></div></div>
          </div>
          <ul class="what-list">
            <li><b>用耳朵聽的節目</b>沒有畫面，只有聲音。像只有聲音的 YouTube 節目。</li>
            <li><b>一集一個主題</b>我們這一集只講一件事，例如 kamamit。</li>
            <li><b>有主持人和來賓</b>主持人提問、介紹；來賓（耆老）分享經驗。</li>
            <li><b>隨時都能聽</b>錄好放著，想聽就按播放；電台要準時收聽。</li>
          </ul>
        </div>
        <h4 class="g-sub">一集節目的時間（約 14 分鐘）</h4>
        <div class="rundown-bar" style="--total:${total}">${bar}</div>
        <ol class="rundown-list">${C.RUNDOWN.map((r) => `<li><span class="mono">${r.time}</span><b>${r.seg}</b>（${r.len}，${r.who}）：${r.tip}</li>`).join("")}</ol>
        <h4 class="g-sub">四個角色（每人兼兩個）</h4>
        <div class="roles">${C.ROLES.map((r) => `<div class="role"><b>${r.name}</b><small>${r.en}</small><p>${r.job}</p></div>`).join("")}</div>
      </section>

      <section class="g-sec" id="g-lessons">
        <h3 class="g-h">每次上課要做什麼</h3>
        <div class="flow">${C.SESSIONS.map((s) => `<div class="flow-day"><p class="flow-date">${s.date}（五）<span>${s.theme}</span></p>${s.lessons.map((n) => { const l = C.LESSONS.find((x) => x.n === n); return `<div class="flow-lesson"><h4>${l.label}｜${l.title}</h4><ol>${l.todo.map((t) => `<li>${t}</li>`).join("")}</ol><p class="flow-links">${l.guide.map((k) => `<a href="#guide-tool-${k}">看教學：${C.TOOLS[k].title}</a>`).join("")}<a href="#sheets-${l.ws}">學習單 ${l.ws.replace("ws", "")}</a></p></div>`; }).join("")}</div>`).join("")}</div>
      </section>

      <section class="g-sec" id="g-tools">
        <h3 class="g-h">iPad 圖文教學</h3>
        <p class="g-note">圖是示意圖，紅圈是要點的地方。實際畫面會因 App 版本有一點不一樣，找相同名字的按鈕就對了。</p>
        ${toolOrder.map((k) => { const t = C.TOOLS[k]; return `
          <article class="tool" id="g-tool-${k}">
            <header class="tool-head"><span class="app-badge tone-${t.tone}">${t.app}</span><h4>${t.title}</h4><small>${t.when}</small></header>
            ${t.warn ? `<p class="tool-warn">${t.warn}</p>` : ""}
            <ol class="tool-steps">${t.steps.map((st, i) => `<li class="tool-step"><figure>${M.svg(st.m[0], st.m[1])}</figure><p><b class="step-n">${i + 1}</b>${st.t}</p></li>`).join("")}</ol>
          </article>`; }).join("")}
      </section>

      <section class="g-sec" id="g-examples">
        <h3 class="g-h">範例櫃</h3>
        <p class="g-note">範例只示範格式。訪談的內容要留給真正的長輩回答。</p>
        <div class="ex-grid">
          <article class="ex"><h4>節目封面</h4><div class="ex-cover">${M.cover(E.showName, "Salimpo 山海之聲・第2組")}</div><p class="muted">正方形、大標題、族語詞、組別、自己拍的照片。</p></article>
          <article class="ex"><h4>開場稿</h4><blockquote>${E.opening}</blockquote><p class="muted">問候 → 節目名稱 → 自我介紹 → 這一集想知道什麼。</p></article>
          <article class="ex"><h4>訪談題：考問式 → 經驗式</h4><p class="ex-bad">✗ ${E.questionsBad}</p><p class="ex-good">✓ ${E.questionsGood}</p><ol class="ex-q">${E.interview.map((r) => `<li><span class="pill">${r.type}</span>${r.q}</li>`).join("")}</ol></article>
          <article class="ex"><h4>資料卡</h4><div class="data-card"><b>${E.card.point}</b><dl><dt>誰寫的</dt><dd>${E.card.who}</dd><dt>哪一年</dt><dd>${E.card.year}</dd><dt>哪一地</dt><dd>${E.card.where}</dd></dl></div></article>
          <article class="ex"><h4>書面語 → 說話語</h4><p class="ex-bad">${E.spokenBefore}</p><p class="ex-good">${E.spokenAfter}</p></article>
          <article class="ex"><h4>網路引註</h4><dl class="ex-dl"><dt>誰寫的</dt><dd>${E.webCite.who}</dd><dt>篇名</dt><dd>${E.webCite.title}</dd><dt>網址</dt><dd class="mono break">${E.webCite.url}</dd><dt>擷取日期</dt><dd>${E.webCite.date}</dd></dl></article>
          <article class="ex"><h4>Padlet 貼文</h4><div class="padlet-card"><b>${E.padlet.title}</b><p>${E.padlet.body.replace(/\n/g, "<br>")}</p><small>${E.padlet.color}</small></div></article>
          <article class="ex"><h4>耆老邀請卡五件事</h4><ol>${E.invite.map((t) => `<li>${t}</li>`).join("")}</ol></article>
          <article class="ex"><h4>三明治回饋</h4><div class="sandwich"><p><span>我欣賞</span>${E.sandwich.like}</p><p><span>我建議</span>${E.sandwich.suggest}</p><p><span>我期待</span>${E.sandwich.hope}</p></div></article>
        </div>
      </section>

      <section class="g-sec" id="g-words">
        <h3 class="g-h">族語小卡</h3>
        <div class="words">${C.VOCAB.map((v) => `<div class="word"><b>${v.w}</b><span>${v.m}</span><small>${v.use}</small></div>`).join("")}</div>
        <p class="g-note">拼寫以族語老師和長輩說的為準。</p>
      </section>`;
  }

  /* ---------- 學習單 ---------- */
  const sheetKey = (id) => `p303:ws2:${id}`;
  const me = () => store.read("p303:me2", { group: "", name: "" });
  const exampleMode = { on: store.read("p303:examples", false) };

  function renderIdentity() {
    const who = me();
    $("#me-groups").innerHTML = C.GROUPS.map((g) => `<button type="button" class="chip" data-group="${g.id}" aria-pressed="${who.group === g.id}">${g.label}</button>`).join("");
    const group = C.GROUPS.find((g) => g.id === who.group);
    $("#me-names").innerHTML = group ? group.members.map((n) => `<button type="button" class="chip" data-name="${escapeHtml(n)}" aria-pressed="${who.name === n}">${escapeHtml(n)}</button>`).join("") : `<span class="muted">先選組別</span>`;
  }

  function renderSheetTabs() {
    $("#sheet-tabs").innerHTML = C.WORKSHEETS.map((s) => `<a class="sheet-tab" href="#sheets-${s.id}" data-sheet="${s.id}">學習單 ${s.n}<small>${s.title}</small></a>`).join("");
    renderIdentity();
    $("#me-box").addEventListener("click", (e) => {
      const g = e.target.closest("[data-group]"); const n = e.target.closest("[data-name]");
      const who = me();
      if (g) { who.group = g.dataset.group; who.name = ""; }
      if (n) who.name = n.dataset.name;
      store.write("p303:me2", who); renderIdentity();
    });
    $("#ex-toggle").checked = exampleMode.on;
    $("#ex-toggle").addEventListener("change", (e) => { exampleMode.on = e.target.checked; store.write("p303:examples", exampleMode.on); renderSheet(); });
  }

  function exampleHtml(field) {
    if (!exampleMode.on || field.ex === undefined) return "";
    const ex = field.ex;
    if (Array.isArray(ex) && Array.isArray(ex[0])) return `<div class="ex-hint"><b>範例</b>${ex.map((row) => row.filter(Boolean).join("｜")).join("<br>")}</div>`;
    if (Array.isArray(ex)) return `<div class="ex-hint"><b>範例</b>${ex.join("<br>")}</div>`;
    return `<div class="ex-hint"><b>範例</b>${escapeHtml(ex)}</div>`;
  }

  function fieldHtml(f, values) {
    const v = values[f.id]; const id = (s) => `f-${f.id}${s !== undefined ? `-${s}` : ""}`;
    switch (f.type) {
      case "note": return `<p class="ws-note">${f.html}</p>`;
      case "text": return `<label class="ws-field" for="${id()}"><span class="ws-label">${f.label}</span><input type="text" id="${id()}" data-field="${f.id}" value="${escapeHtml(v || "")}">${exampleHtml(f)}</label>`;
      case "area": return `<label class="ws-field" for="${id()}"><span class="ws-label">${f.label}</span><textarea id="${id()}" data-field="${f.id}" rows="3">${escapeHtml(v || "")}</textarea>${exampleHtml(f)}</label>`;
      case "checks": { const c = Array.isArray(v) ? v : []; return `<fieldset class="ws-field"><legend class="ws-label">${f.label}</legend>${f.options.map((o, i) => `<label class="check-row" for="${id(i)}"><input type="checkbox" id="${id(i)}" data-field="${f.id}" data-index="${i}" ${c[i] ? "checked" : ""}><span>${o}</span></label>`).join("")}</fieldset>`; }
      case "radio": return `<fieldset class="ws-field"><legend class="ws-label">${f.label}</legend>${f.options.map((o, i) => `<label class="check-row" for="${id(i)}"><input type="radio" name="${id()}" id="${id(i)}" data-field="${f.id}" value="${i}" ${String(v) === String(i) ? "checked" : ""}><span>${o}</span></label>`).join("")}</fieldset>`;
      case "rows": case "fixedrows": {
        const count = f.type === "fixedrows" ? f.rowLabels.length : f.n; const grid = Array.isArray(v) ? v : [];
        const exGrid = exampleMode.on && Array.isArray(f.ex) ? f.ex : [];
        return `<div class="ws-field"><span class="ws-label">${f.label}</span><div class="table-wrap"><table class="ws-table"><thead><tr><th>${f.type === "fixedrows" ? "" : "#"}</th>${f.cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${Array.from({ length: count }, (_, r) => `<tr><th class="ws-rowlabel">${f.type === "fixedrows" ? f.rowLabels[r] : r + 1}</th>${f.cols.map((c, ci) => { const exv = Array.isArray(exGrid[r]) ? exGrid[r][ci] : (ci === 0 && typeof exGrid[r] === "string" ? exGrid[r] : ""); return `<td><input type="text" id="${id(`${r}-${ci}`)}" aria-label="${escapeHtml(c)} 第 ${r + 1} 列" data-field="${f.id}" data-row="${r}" data-col="${ci}" value="${escapeHtml((grid[r] || [])[ci] || "")}" placeholder="${escapeHtml(exv || "")}"></td>`; }).join("")}</tr>`).join("")}</tbody></table></div>${exampleMode.on && f.ex ? `<p class="ex-hint-inline">淡灰色字是範例，打字就會蓋掉。</p>` : ""}</div>`;
      }
      default: return "";
    }
  }

  function renderSheet() {
    const sheet = C.WORKSHEETS.find((s) => s.id === route.sheet) || C.WORKSHEETS[0];
    const saved = store.read(sheetKey(sheet.id), {});
    $$(".sheet-tab").forEach((t) => t.setAttribute("aria-current", t.dataset.sheet === sheet.id ? "page" : "false"));
    $("#sheet-form").innerHTML = `<header class="ws-head"><p class="ws-kicker">P3-03 山海之聲｜${sheet.lesson}</p><h3>學習單 ${sheet.n}　${sheet.title}</h3></header>${sheet.fields.map((f) => fieldHtml(f, saved)).join("")}`;
    $("#sheet-form").dataset.sheet = sheet.id;
    $("#sheet-clear").textContent = "清除這張"; $("#sheet-clear").dataset.armed = "false";
  }

  function collect(form, sheet) {
    const values = {};
    sheet.fields.forEach((f) => {
      if (f.type === "text" || f.type === "area") values[f.id] = $(`[data-field="${f.id}"]`, form).value;
      if (f.type === "checks") values[f.id] = $$(`[data-field="${f.id}"]`, form).map((b) => b.checked);
      if (f.type === "radio") { const p = $(`[data-field="${f.id}"]:checked`, form); values[f.id] = p ? p.value : ""; }
      if (f.type === "rows" || f.type === "fixedrows") { const g = []; $$(`[data-field="${f.id}"]`, form).forEach((i) => { const r = Number(i.dataset.row); g[r] = g[r] || []; g[r][Number(i.dataset.col)] = i.value; }); values[f.id] = g; }
    });
    return values;
  }

  function sheetText(sheet, values) {
    const who = me(); const group = C.GROUPS.find((g) => g.id === who.group);
    const lines = [`【P3-03 學習單 ${sheet.n} ${sheet.title}】${group ? group.label : ""} ${who.name || ""}`.trim()];
    sheet.fields.forEach((f) => {
      const v = values[f.id];
      if (f.type === "text" || f.type === "area") lines.push(`${f.label}：${v || ""}`);
      if (f.type === "checks") lines.push(`${f.label}：`, ...f.options.map((o, i) => `${(v || [])[i] ? "☑" : "☐"} ${o}`));
      if (f.type === "radio") lines.push(`${f.label}：${v !== "" && v !== undefined ? f.options[Number(v)] : "（未選）"}`);
      if (f.type === "rows" || f.type === "fixedrows") { lines.push(`${f.label}：`); (v || []).forEach((row, r) => { if ((row || []).some(Boolean)) lines.push(`  ${f.type === "fixedrows" ? f.rowLabels[r] : r + 1}　${f.cols.map((c, ci) => `${c}：${(row || [])[ci] || ""}`).join("｜")}`); }); }
    });
    return lines.join("\n");
  }

  function bindSheets() {
    const form = $("#sheet-form"); const current = () => C.WORKSHEETS.find((s) => s.id === form.dataset.sheet);
    const persist = debounce(() => { const s = current(); if (!s) return; showStatus($("#sheet-status"), store.write(sheetKey(s.id), collect(form, s)) ? "已自動存在這台 iPad。" : "這個瀏覽器不能暫存，記得按「複製成文字」。"); }, 500);
    form.addEventListener("input", persist); form.addEventListener("change", persist); form.addEventListener("submit", (e) => e.preventDefault());
    $("#sheet-copy").addEventListener("click", () => { const s = current(); copyText(sheetText(s, collect(form, s)), $("#sheet-fallback"), $("#sheet-status")); });
    $("#sheet-clear").addEventListener("click", (e) => {
      const b = e.currentTarget;
      if (b.dataset.armed !== "true") { b.dataset.armed = "true"; b.textContent = "再按一次確定清除"; return; }
      store.remove(sheetKey(current().id)); renderSheet(); showStatus($("#sheet-status"), "已清除。");
    });
  }

  /* ---------- 教案 ---------- */
  function renderPlan() {
    $("#plan-body").innerHTML = window.PLAN_HTML || "<p>教案載入失敗。</p>";
    $("#copy-plan").addEventListener("click", () => copyText($("#plan-body").innerText, $("#plan-fallback"), $("#plan-status")));
    $("#copy-consent").addEventListener("click", () => copyText(C.CONSENT_TEXT, $("#plan-fallback"), $("#plan-status")));
  }

  /* ---------- 成果上傳 ---------- */
  const STEPS = [["plan", "企劃"], ["script", "腳本"], ["data", "資料"], ["invite", "邀請"], ["record", "錄音"], ["edit", "剪輯"], ["cover", "封面"], ["upload", "上傳"]];

  function renderUploadStatic() {
    $("#share-method").innerHTML = C.SHARE_METHOD.map((s, i) => `<li class="method-step"><span class="method-num">${i + 1}</span><div><h4>${s.h}</h4><p>${s.d}</p></div></li>`).join("");
    $("#upload-steps").innerHTML = C.TOOLS.driveUpload.steps.map((st, i) => `<li class="tool-step"><figure>${M.svg(st.m[0], st.m[1])}</figure><p><b class="step-n">${i + 1}</b>${st.t}</p></li>`).join("");
    const convert = () => renderConverter($("#link-input").value);
    $("#link-input").addEventListener("input", debounce(convert, 250));
    $("#link-convert").addEventListener("click", convert);
    $("#link-output").addEventListener("click", onConverterAction);
    $("#settings-form").addEventListener("submit", (e) => { e.preventDefault(); saveSettings(Object.fromEntries(Object.keys(SETTING_DEFAULTS).map((k) => [k, $(`#set-${k}`).value.trim()])), $("#settings-status")); });
    renderSettings(); renderConverter(""); renderWall();
  }

  function renderSettings() {
    Object.keys(SETTING_DEFAULTS).forEach((k) => { const input = $(`#set-${k}`); if (input && document.activeElement !== input) input.value = setting(k) || ""; });
    renderFolderQrs();
  }

  function renderFolderQrs() {
    const list = [{ label: "成果總資料夾", url: setting("folderUrl") }, ...C.GROUPS.map((g) => ({ label: groupName(g), url: C.DRIVE.groups[g.id] })), { label: "Padlet 資料牆", url: setting("padletUrl") }];
    $("#folder-qrs").innerHTML = list.map((f) => `<figure class="folder-qr">${qrSvg(f.url, `${f.label} QR Code`)}<figcaption>${f.label}${f.url ? `<a href="${escapeHtml(f.url)}" target="_blank" rel="noopener">開啟</a>` : ""}</figcaption></figure>`).join("");
  }

  let converted = null;
  function renderConverter(raw) {
    const out = $("#link-output"); const info = analyzeLink(raw); converted = info;
    if (!info) { out.innerHTML = raw.trim() ? `<p class="warn-text">看不懂這個連結。請貼上 https:// 開頭的 Google 雲端分享連結。</p>` : `<p class="muted">貼上連結後，這裡會出現直接下載連結和 QR Code。</p>`; return; }
    const target = info.download || info.open;
    out.innerHTML = `<div class="convert-grid"><div><p><span class="pill">${info.kind}</span></p>${info.download ? `<p class="ws-label">直接下載連結</p><p class="mono break">${escapeHtml(info.download)}</p>` : ""}<p class="ws-label">開啟連結</p><p class="mono break">${escapeHtml(info.open)}</p><p class="muted">${info.message}</p>
      <div class="row-actions"><button type="button" class="btn btn-small" data-act="copy">複製連結</button><button type="button" class="btn btn-small btn-ghost" data-act="save">儲存 QR Code 圖片</button><button type="button" class="btn btn-small btn-ghost" data-act="handout">設為講義 QR</button>${info.kind === "雲端資料夾" ? `<button type="button" class="btn btn-small btn-ghost" data-act="folder">設為上傳資料夾</button>` : ""}</div>
      <p class="status" id="convert-status" role="status"></p><textarea class="copy-fallback" id="convert-fallback" hidden aria-label="連結文字"></textarea></div>
      <div class="convert-qr">${qrSvg(target, "轉換後的 QR Code")}<p class="fine">iPad 可以長按 QR Code 存到「照片」，或截圖放進簡報。</p></div></div>`;
  }

  async function onConverterAction(e) {
    const b = e.target.closest("[data-act]"); if (!b || !converted) return;
    const status = $("#convert-status"); const target = converted.download || converted.open; const raw = $("#link-input").value.trim();
    if (b.dataset.act === "copy") copyText(target, $("#convert-fallback"), status);
    if (b.dataset.act === "handout") saveSettings({ handoutUrl: raw }, status);
    if (b.dataset.act === "folder") saveSettings({ folderUrl: raw }, status);
    if (b.dataset.act === "save") {
      const blob = await qrBlob(target);
      if (!blob) { showStatus(status, "QR Code 產生失敗，請改用「捷徑」App 的「製作 QR 碼」。"); return; }
      if (!platform.downloads) { showStatus(status, "這個畫面不能存檔，請長按 QR Code 存到「照片」。"); return; }
      try { await platform.downloads.save({ filename: "山海之聲_QRCode.png", data: blob }); showStatus(status, "已儲存 QR Code 圖片。"); }
      catch (error) { showStatus(status, error && error.code === "declined" ? "已取消儲存。" : "無法儲存，請長按 QR Code 存到「照片」。"); }
    }
  }

  function renderMode() {
    const badge = $("#mode-badge"); if (!badge) return;
    badge.textContent = !platform.ready ? "連線中…" : platform.db && platform.canEdit ? "老師模式：成果牆可以編輯，會同步到所有裝置" : platform.db ? "檢視模式：只有老師能編輯成果牆" : "離線模式：成果牆要用老師的 claude.ai 帳號開啟";
    renderWall();
  }

  const emptyGroup = () => ({ showName: "", topic: "", elder: "", level: "", steps: {}, link: "", coverId: "", scriptId: "", scores: {}, note: "" });

  function renderWall() {
    const wall = $("#wall"); if (!wall) return;
    const editable = Boolean(platform.db && platform.canEdit); const canUpload = Boolean(editable && platform.assets);
    $("#wall-note").textContent = shared.error || (platform.db ? "" : "成果牆要用老師的 claude.ai 帳號開啟本頁才會顯示與儲存；音檔請上傳到上面的雲端資料夾。");
    C.GROUPS.forEach((g) => {
      const existing = $(`[data-group="${g.id}"]`, wall);
      if (existing && existing.dataset.dirty === "true") return;
      const holder = document.createElement("div"); holder.innerHTML = wallCard(g, editable, canUpload).trim();
      if (existing) existing.replaceWith(holder.firstElementChild); else wall.appendChild(holder.firstElementChild);
    });
  }

  function wallCard(g, editable, canUpload) {
    const d = { ...emptyGroup(), ...(shared.groups[g.id] || {}) };
    const done = STEPS.filter(([k]) => d.steps && d.steps[k]).length;
    const link = analyzeLink(d.link);
    const total = C.RUBRIC.reduce((s, r) => s + (Number((d.scores || {})[r.id]) || 0), 0);
    const dis = editable ? "" : "disabled";
    return `<article class="wall-card" data-group="${g.id}">
      <header class="wall-head"><div class="wall-cover">${d.coverId ? `<img src="/_blob/${escapeHtml(d.coverId)}" alt="${g.label}封面">` : `<span>${g.label}<br>封面</span>`}</div>
        <div class="wall-title"><p class="wall-group">${g.label}<span class="wall-count">${done}/${STEPS.length}</span></p><p class="wall-members">${g.members.join("、")}</p>
        <input type="text" id="w-${g.id}-showName" data-key="showName" value="${escapeHtml(d.showName)}" placeholder="節目名稱" aria-label="${g.label}節目名稱" ${dis}></div></header>
      <div class="wall-steps" role="group" aria-label="${g.label}進度">${STEPS.map(([k, l]) => `<button type="button" class="step-chip" data-step="${k}" aria-pressed="${Boolean(d.steps && d.steps[k])}" ${dis}>${l}</button>`).join("")}</div>
      <div class="wall-fields">
        <label for="w-${g.id}-topic">主題與民族課程<input type="text" id="w-${g.id}-topic" data-key="topic" value="${escapeHtml(d.topic)}" ${dis}></label>
        <label for="w-${g.id}-elder">來賓（稱謂）<input type="text" id="w-${g.id}-elder" data-key="elder" value="${escapeHtml(d.elder)}" ${dis}></label>
        <label for="w-${g.id}-level">公開層級<select id="w-${g.id}-level" data-key="level" ${dis}><option value="">尚未確認</option>${C.LEVELS.map((l) => `<option value="${l.id}" ${d.level === l.id ? "selected" : ""}>${l.label}</option>`).join("")}</select></label>
        <label for="w-${g.id}-link">完成版音檔的雲端分享連結<input type="url" id="w-${g.id}-link" data-key="link" value="${escapeHtml(d.link)}" placeholder="https://drive.google.com/file/d/…" ${dis}></label>
      </div>
      ${link ? `<div class="wall-listen"><div class="wall-qr">${qrSvg(link.open, `${g.label}收聽 QR Code`)}</div><div><p class="ws-label">掃描收聽</p><p><a href="${escapeHtml(link.open)}" target="_blank" rel="noopener">線上收聽</a>${link.download ? `　<a href="${escapeHtml(link.download)}" target="_blank" rel="noopener">直接下載</a>` : ""}</p><p class="fine">${d.level === "web" ? "長輩同意網路公開。" : "請依長輩同意的範圍分享。"}</p></div></div>` : ""}
      <div class="wall-files">${d.scriptId ? `<a href="/_blob/${escapeHtml(d.scriptId)}" target="_blank" rel="noopener">開啟腳本 PDF</a>` : `<span class="muted">尚未上傳腳本 PDF</span>`}
        ${canUpload ? `<label class="btn btn-small btn-ghost" for="w-${g.id}-coverfile">上傳封面<input type="file" class="sr-only" id="w-${g.id}-coverfile" accept="image/png,image/jpeg" data-upload="coverId"></label><label class="btn btn-small btn-ghost" for="w-${g.id}-scriptfile">上傳腳本 PDF<input type="file" class="sr-only" id="w-${g.id}-scriptfile" accept="application/pdf" data-upload="scriptId"></label>` : ""}</div>
      <details class="wall-score"><summary>評量規準評分<span class="score-total">${total ? `${total} / 12` : "未評"}</span></summary>
        ${C.RUBRIC.map((r) => `<label for="w-${g.id}-s-${r.id}">${r.dim}<select id="w-${g.id}-s-${r.id}" data-score="${r.id}" ${dis}><option value="">—</option>${[3, 2, 1].map((s, i) => `<option value="${s}" ${String((d.scores || {})[r.id]) === String(s) ? "selected" : ""}>${C.LEVEL_NAMES[i]}</option>`).join("")}</select></label>`).join("")}
        <label for="w-${g.id}-note">老師備註<textarea id="w-${g.id}-note" data-key="note" rows="2" ${dis}>${escapeHtml(d.note)}</textarea></label></details>
      ${editable ? `<div class="row-actions"><button type="button" class="btn btn-small" data-save="${g.id}">儲存${g.label}</button><span class="status" id="w-${g.id}-status" role="status"></span></div>` : ""}
    </article>`;
  }

  function readCard(card, id) {
    const b = { ...emptyGroup(), ...(shared.groups[id] || {}) };
    $$("[data-key]", card).forEach((i) => { b[i.dataset.key] = i.value.trim(); });
    b.steps = Object.fromEntries(STEPS.map(([k]) => [k, $(`[data-step="${k}"]`, card).getAttribute("aria-pressed") === "true"]));
    b.scores = Object.fromEntries(C.RUBRIC.map((r) => [r.id, $(`[data-score="${r.id}"]`, card).value]));
    b.updatedAt = new Date().toISOString();
    return b;
  }

  const saving = new Set();
  async function saveGroup(id, patch = {}) {
    const card = $(`[data-group="${id}"]`); const status = $(`#w-${id}-status`);
    if (!platform.db || !platform.canEdit || saving.has(id)) return;
    saving.add(id);
    const body = { ...readCard(card, id), ...patch };
    try { await platform.db.doc(`groups/${id}`).set(body); card.dataset.dirty = "false"; shared.groups[id] = body; renderWall(); showStatus($(`#w-${id}-status`), "已儲存。"); }
    catch (error) { showStatus(status, error && error.code === "quota_exceeded" ? "儲存空間已滿。" : "儲存失敗，請稍後再按一次。"); }
    finally { saving.delete(id); }
  }

  function bindWall() {
    const wall = $("#wall");
    const dirty = (e) => { const c = e.target.closest("[data-group]"); if (c && !e.target.closest("[data-upload], [data-save]")) c.dataset.dirty = "true"; };
    wall.addEventListener("input", dirty);
    wall.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-step]");
      if (chip && !chip.disabled) { chip.setAttribute("aria-pressed", String(chip.getAttribute("aria-pressed") !== "true")); dirty(e); }
      const save = e.target.closest("[data-save]"); if (save) saveGroup(save.dataset.save);
    });
    wall.addEventListener("change", async (e) => {
      const input = e.target.closest("[data-upload]"); if (!input || !input.files || !input.files[0]) return;
      const id = input.closest("[data-group]").dataset.group; const status = $(`#w-${id}-status`); const file = input.files[0];
      showStatus(status, "上傳中…");
      try { const r = await platform.assets.upload(file, file.type ? undefined : { type: input.dataset.upload === "scriptId" ? "application/pdf" : "image/png" }); await saveGroup(id, { [input.dataset.upload]: r.id }); }
      catch (error) { showStatus(status, { too_large: "檔案超過 20 MB。", unsupported_type: "封面用 PNG 或 JPG，腳本用 PDF。", rate_limited: "上傳太頻繁，請稍等。" }[error && error.code] || "上傳失敗，請稍後再試。"); }
    });
  }

  /* ---------- 啟動 ---------- */
  function boot() {
    renderOverview(); renderDeckTabs(); bindPlayer(); renderGuide(); renderSheetTabs(); bindSheets(); renderPlan(); renderUploadStatic(); bindWall();
    window.addEventListener("hashchange", applyRoute);
    applyRoute();
    initPlatform().catch(() => { platform.ready = true; renderMode(); });
  }
  boot();
})();
