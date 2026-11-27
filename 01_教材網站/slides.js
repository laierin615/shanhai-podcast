/**
 * 上課簡報：五次上課各一組（1280×720 基準）。依賴 COURSE、MOCK。
 */
(function defineDecks(global) {
  "use strict";
  const C = global.COURSE;
  const M = global.MOCK;
  const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const li = (items) => items.map((i) => `<li>${i}</li>`).join("");
  /** 圖示：依關鍵字自動配一個小圖，讓條列變成看得懂的圖卡 */
  const ICONS = [
    [/手機|平板|iPad/, "📱"], [/猶豫|不錄/, "🤚"],
    [/禁忌|祭儀|靈觀/, "⚠️"], [/隱私|姓名|住址/, "🔒"], [/不舒服|蓋上螢幕/, "🙈"], [/不下載/, "⛔"],
    [/AirDrop|存檔|保存|上傳/, "📤"], [/音樂/, "🎵"], [/大聲|音量/, "🔊"], [/停頓|去頭去尾|剪/, "✂️"], [/刪掉/, "🗑️"],
    [/耳朵|聽/, "👂"], [/錄/, "🎙️"], [/念|說|唱|問候|自我介紹/, "🗣️"], [/問|？/, "❓"],
    [/長輩|耆老|來賓/, "👵"], [/主持人/, "🎤"], [/書|篇名|作者|出版|頁碼|圖書/, "📚"], [/網|上網/, "🌐"], [/摘錄|抄/, "✍️"],
    [/判讀|查證|來源|找得到/, "🔍"], [/一樣/, "✅"], [/不一樣|存疑/, "🤔"], [/分鐘|秒|時間/, "⏱️"],
    [/手機|平板|iPad|App/, "📱"], [/主題|一集/, "🎯"], [/節目名稱|封面|海報/, "🖼️"], [/民族課程|部落/, "🌾"],
    [/邀請卡|致謝卡|送/, "💌"], [/窗/, "🪟"], [/紙箱|毛毯|角/, "📦"], [/教室/, "🏫"], [/點頭/, "🙂"], [/學到|反思|改進/, "💡"],
    [/老師|檢查|交換/, "🧑‍🏫"], [/記/, "📝"],
  ];
  const iconOf = (t) => { const s = String(t).replace(/<[^>]+>/g, ""); const hit = ICONS.find(([re]) => re.test(s)); return hit ? hit[1] : "🌊"; };
  const tiles = (items, big) => `<ul class="s-tiles ${big ? "s-tiles-big" : ""} ${items.length > 4 ? "s-tiles-2" : ""}">${items.map((it, i) => {
    if (/^<a class="s-link/.test(it)) return `<li class="s-tile-link">${it}</li>`;
    const o = typeof it === "object" ? it : { t: it };
    return `<li class="s-tile s-c${i % 4}"><span class="s-ico" aria-hidden="true">${o.i || iconOf(o.t)}</span><span class="s-tt">${o.t}</span></li>`;
  }).join("")}</ul>`;
  const RUN_MIN = { "15 秒": 0.25, "1 分鐘": 1, "3 分鐘": 3, "6–8 分鐘": 7, "1–2 分鐘": 1.5, "30 秒": 0.5 };
  const RUN_ICON = ["🎵", "👋", "📚", "👵", "💡", "🙏"];
  const lessonOf = (n) => C.LESSONS.find((l) => l.n === n);
  const kick = (session, n) => `${session.date}（五）・${lessonOf(n).label}｜${lessonOf(n).title}`;

  const S = {
    title: ({ kicker, title, sub, chips = [] }) => `<div class="s s-center"><p class="s-kicker">${kicker}</p><h2 class="s-hero">${title}</h2>${sub ? `<p class="s-sub">${sub}</p>` : ""}${chips.length ? `<div class="s-chips">${chips.map((c) => `<span>${c}</span>`).join("")}</div>` : ""}<div class="s-wave" aria-hidden="true"></div></div>`,
    list: ({ kicker, title, items, aside = "", big = false }) => `<div class="s"><p class="s-kicker">${kicker}</p><h2 class="s-title">${title}</h2><div class="s-split ${aside ? "" : "s-one"}">${tiles(items, big)}${aside ? `<div class="s-aside">${aside}</div>` : ""}</div></div>`,
    cards: ({ kicker, title, cards, cols = 3 }) => `<div class="s"><p class="s-kicker">${kicker}</p><h2 class="s-title">${title}</h2><div class="s-cards" style="--cols:${cols}">${cards.map((c) => `<div class="s-card">${c.tag ? `<span class="s-tag">${c.tag}</span>` : ""}<h3>${c.h}</h3>${c.d ? `<p>${c.d}</p>` : ""}</div>`).join("")}</div></div>`,
    compare: ({ kicker, title, left, right }) => `<div class="s"><p class="s-kicker">${kicker}</p><h2 class="s-title">${title}</h2><div class="s-compare"><div class="s-cmp s-cmp-a"><h3>${left.h}</h3><p>${left.d}</p></div><div class="s-arrow">→</div><div class="s-cmp s-cmp-b"><h3>${right.h}</h3><p>${right.d}</p></div></div></div>`,
    rundown: (kicker, title = "一集節目長這樣（約 14 分鐘）") => `<div class="s"><p class="s-kicker">${kicker}</p><h2 class="s-title">${title}</h2><div class="s-rbar">${C.RUNDOWN.map((r, i) => `<div class="s-rseg s-r${i}" style="flex:${RUN_MIN[r.len] || 1}"><span class="s-rico" aria-hidden="true">${RUN_ICON[i]}</span><b>${r.seg}</b><small>${r.len}</small></div>`).join("")}</div><div class="s-rcards">${C.RUNDOWN.map((r, i) => `<div class="s-rcard s-r${i}"><span class="s-rtime">${r.time}</span><b>${RUN_ICON[i]} ${r.seg}</b><small>${r.who}</small><p>${r.tip}</p></div>`).join("")}</div></div>`,
    tool: (kicker, key, idx) => {
      const tool = C.TOOLS[key];
      const steps = idx.map((i) => ({ ...tool.steps[i], n: i + 1 }));
      return `<div class="s"><p class="s-kicker">${kicker}</p><h2 class="s-title"><span class="s-app s-app-${tool.tone}">${tool.app}</span>${tool.title}</h2><div class="s-mocks" style="--n:${steps.length}">${steps.map((st) => `<figure class="s-mockfig">${M.svg(st.m[0], st.m[1])}<figcaption><b>${st.n}</b>${st.t}</figcaption></figure>`).join("")}</div>${tool.warn && idx.includes(2) ? `<p class="s-warn">${tool.warn}</p>` : ""}</div>`;
    },
    qr: ({ kicker, title, key, items }) => `<div class="s"><p class="s-kicker">${kicker}</p><h2 class="s-title">${title}</h2><div class="s-split"><ol class="s-steps">${li(items)}</ol><div class="s-qr"><div class="qr-slot" data-qr="${key}"></div><p class="s-qr-cap" data-qr-cap="${key}"></p></div></div></div>`,
    groups: (kicker, title = "四組名單與角色") => `<div class="s"><p class="s-kicker">${kicker}</p><h2 class="s-title">${title}</h2><div class="s-cards" style="--cols:4">${C.GROUPS.map((g) => `<div class="s-card s-group"><span class="s-tag">${g.label}</span><h3>${g.members.join("、")}</h3>${g.note ? `<p>${g.note}</p>` : ""}</div>`).join("")}</div><div class="s-roles">${C.ROLES.map((r) => `<span><b>${r.name}</b>${r.job}</span>`).join("")}</div></div>`,
    radio: (kicker, title, focus) => `<div class="s"><p class="s-kicker">${kicker}</p><h2 class="s-title">${title}</h2><div class="s-radio-grid"><figure class="s-photo"><img src="${C.RADIO.alian.photo.src}" alt="${C.RADIO.alian.photo.alt}"><figcaption>${C.RADIO.alian.photo.caption}</figcaption></figure><div class="s-radio-col"><div class="s-card s-radio"><span class="s-tag">${C.RADIO.alian.date}</span><h3>${C.RADIO.alian.station}${C.RADIO.alian.program}</h3><p>學長姐到台北的錄音室，介紹專輯《生活的詩》</p><div class="s-plays"><a class="s-play" data-link="radioAlian" data-label="▶ 播放節目" href="#" target="_blank" rel="noopener">▶ 播放節目</a><a class="s-play s-play-2" data-link="radioAlbum" data-label="♪ 專輯歌曲" href="#" target="_blank" rel="noopener">♪ 專輯歌曲</a><a class="s-play s-play-3" data-link="radioReel" data-label="◎ IG 短片" href="#" target="_blank" rel="noopener">◎ IG 短片</a></div></div><div class="s-card s-radio"><span class="s-tag">台東</span><h3>臺東教育電台</h3><p>學長姐在台東接受電台訪問</p><a class="s-play" data-link="radioTaitung" href="#" target="_blank" rel="noopener">▶ 播放片段</a></div></div></div><p class="s-note-line">${focus}</p></div>`,
    roadmap: (kicker) => `<div class="s"><p class="s-kicker">${kicker}</p><h2 class="s-title">五個星期五，做出一集節目</h2><div class="s-road">${C.SESSIONS.map((s, i) => `<div class="s-stop ${i === C.SESSIONS.length - 1 ? "s-stop-end" : ""}"><span class="s-date">${s.date}</span><b>${s.theme}</b><small>${s.lessons.map((n) => lessonOf(n).label).join("・")}</small></div>`).join("")}</div></div>`,
    layers: (kicker) => {
      const L = [
        ["🥁", "節奏", "鼓", "讓人想跟著點頭", "s-l0", 4],
        ["🎸", "低音", "貝斯", "把聲音墊厚", "s-l1", 4],
        ["🎹", "旋律", "鋼琴或吉他", "讓人記得", "s-l2", 4],
        ["📣", "喊聲", "全組一起", "Nga'ay ho! 這裡是山海之聲！", "s-l3", 0],
      ];
      const row = ([ico, h, who, d, cls, n]) => `<div class="s-lrow"><div class="s-lname ${cls}"><span class="s-ico" aria-hidden="true">${ico}</span><span><b>${h}</b><small>${who}</small></span></div><div class="s-lbar">${n ? Array.from({ length: n }, (_, i) => `<span class="s-lblk ${cls}">${i ? "↻" : "Loop"}</span>`).join("") : `<span class="s-lblk s-lshout ${cls}">${d}</span>`}</div>${n ? `<div class="s-ldesc">${d}</div>` : ""}</div>`;
      return `<div class="s"><p class="s-kicker">${kicker}</p><h2 class="s-title">主題曲配方：四層疊起來</h2><div class="s-layers">${L.map(row).join("")}<div class="s-lrow s-lruler"><div></div><div class="s-lscale"><span>第 1 小節</span><span>8 小節 ≈ 15 秒</span><span class="s-lfade">淡出 ▸</span></div><div></div></div></div></div>`;
    },
    cover: (kicker, title, items) => `<div class="s"><p class="s-kicker">${kicker}</p><h2 class="s-title">${title}</h2><div class="s-split"><ul class="s-list">${li(items)}</ul><div class="s-covers"><div class="s-cover-big">${M.cover(C.EXAMPLES.showName, "Salimpo 山海之聲・第2組")}</div><div class="s-cover-small">${M.cover(C.EXAMPLES.showName, "第2組")}<small>郵票大小也看得清楚</small></div></div></div></div>`,
  };

  const [D1, D2, D3, D4, D5] = C.SESSIONS;

  const intro = { id: "intro", label: "課程總覽", sub: "第一次上課前", slides: [
    { html: S.title({ kicker: "山海專題・高年級・P3-03 期末專題", title: "Salimpo 山海之聲", sub: "每組做一集 10–15 分鐘的 Podcast，請一位耆老當來賓", chips: ["5 個星期五", "10 節課", "4 組", "1/15 首播"] }), note: "第一次上課開場。" },
    { html: S.radio("我們的學長姐上過電台", "學長姐當過受訪者，這次換你們當主持人", "這次換你們自己設計節目、自己訪問長輩。"), note: "片段連結在「成果上傳」頁設定（電台片段）。" },
    { html: S.list({ kicker: "先認識一下", title: "什麼是 Podcast？", big: true, items: ["用耳朵聽的節目", "一集講一個主題", "有主持人，也常有來賓", "手機、平板隨時都能聽"], aside: `<p class="s-aside-h">跟電台有什麼不一樣？</p><p>電台要準時收聽；Podcast 錄好放著，想聽的時候再按播放。</p><a class="s-link s-link-solo" href="${C.LISTEN[0].url}" target="_blank" rel="noopener"><b>▶ 馬上聽一段</b><small>${C.LISTEN[0].show}｜${C.LISTEN[0].ep}</small></a>` }), note: "用學生熟悉的 YouTube 類比：Podcast 是「只有聲音的 YouTube 節目」。" },
    { html: S.list({ kicker: "先認識一下", title: "聽聽看：真的 Podcast", items: C.LISTEN.map((l) => `<a class="s-link" href="${l.url}" target="_blank" rel="noopener"><b>${l.show}</b><small>${l.ep}</small><span class="s-link-play" aria-hidden="true">▶</span></a>`), aside: `<p class="s-aside-h">邊聽邊找</p><p>開場怎麼說？一集講幾個主題？誰在說話？</p>` }), note: "點投影片上的節目名稱就會開 Podcast App 播放；播第 1 個（約 2 分鐘）；時間夠再播第 2 個的開場 1 分鐘。" },
    { html: S.rundown("一集節目的樣子"), note: "每一段都會在腳本裡寫出來。" },
    { html: S.roadmap("我們的路線圖"), note: "12/11 是耆老錄音日；1/15 首播。" },
    { html: S.groups("分組"), note: "第 1 組 Kolas 是單人組，錄音和剪輯時老師當助理。" },
    { html: S.cards({ kicker: "期末成果", title: "每組要交四樣東西", cols: 4, cards: [{ tag: "1", h: "一集 Podcast", d: "10–15 分鐘完成版音檔" }, { tag: "2", h: "正方形封面", d: "節目名稱＋族語詞" }, { tag: "3", h: "腳本 PDF", d: "Pages 匯出" }, { tag: "4", h: "發表會海報", d: "A4 海報 PDF" }] }), note: "四件都上傳到雲端資料夾。" },
  ] };

  const d1 = { id: "d1", label: `${D1.date}`, sub: "第 1–2 節", slides: [
    { html: S.title({ kicker: kick(D1, 1), title: "選一個值得說給大家聽的主題", sub: "今天要完成：分組、選題、節目名稱、企劃清單", chips: ["無邊記", "備忘錄", "學習單 1"] }) },
    { html: S.radio(kick(D1, 1), "先聽學長姐上電台", "邊聽邊想：沒有畫面，你怎麼知道他們在哪裡、在做什麼？"), note: "播放 1–2 分鐘，問：聽得出是誰嗎？主持人怎麼介紹的？" },
    { html: S.rundown(kick(D1, 1)), note: "說明一集節目要有的六段。" },
    { html: S.groups(kick(D1, 1)), note: "各組決定每人負責的兩個角色。" },
    { html: S.cards({ kicker: kick(D1, 1), title: "主題池：都要接回上過的民族課程", cols: 4, cards: C.TOPICS.map((t) => ({ tag: t.word, h: t.title, d: t.link })) }), note: "主題可以自己想，但要說得出跟哪一課有關。" },
    { html: S.tool(kick(D1, 1), "freeform", [0, 1, 2]) },
    { html: S.list({ kicker: kick(D1, 1), title: "選題三把尺", big: true, items: C.RULERS, aside: `<p class="s-aside-h">三把尺都過</p><p>便利貼改成<b class="s-red">紅色</b>，就是你們的主題</p>` }) },
    { html: S.tool(kick(D1, 1), "freeform", [3, 4]) },
    { html: S.tool(kick(D1, 1), "notes", [0, 1, 2]), note: "企劃清單四件事：節目名稱、核心問題、耆老、三個問題。" },
    { html: S.title({ kicker: kick(D1, 1), title: "30 秒節目預告", sub: `「Nga'ay ho! 這裡是《　　》，我是主持人＿＿。這一集我們想知道……」`, chips: [`範例：《${C.EXAMPLES.showName}》`] }) },
    { html: S.title({ kicker: kick(D1, 2), title: "把節目的骨架搭起來", sub: "今天要完成：流程表、開場稿、訪談大綱、邀請卡", chips: ["Pages", "學習單 2・5"] }) },
    { html: S.list({ kicker: kick(D1, 2), title: "聽電台開場：主持人說了哪幾件事？", big: true, items: ["問候", "節目名稱", "自我介紹", "這一集要談什麼"], aside: `<p class="s-aside-h">再聽兩個問題</p><p>哪一題讓學長姐說得比較多？<br>「是不是」的問題 → 說很少<br>「怎麼、為什麼」→ 說很多</p>` }), note: "播放臺東教育電台的開場。" },
    { html: S.rundown(kick(D1, 2), "把流程表填進 Pages"), note: "山海小知識先空著，12/4 再補。" },
    { html: S.tool(kick(D1, 2), "pagesScript", [0, 1, 2]) },
    { html: S.compare({ kicker: kick(D1, 2), title: "開場句型", left: { h: "句型", d: "Nga'ay ho! 這裡是 Salimpo 山海之聲《　　》，我是主持人＿＿。這一集我們想知道……" }, right: { h: "範例", d: C.EXAMPLES.opening } }) },
    { html: S.compare({ kicker: kick(D1, 2), title: "訪談題：考問式 → 經驗式", left: { h: "考問式（像考試）", d: C.EXAMPLES.questionsBad }, right: { h: "經驗式（請長輩說故事）", d: C.EXAMPLES.questionsGood } }) },
    { html: S.cards({ kicker: kick(D1, 2), title: "訪談大綱五段（範例）", cols: 5, cards: C.EXAMPLES.interview.map((r) => ({ tag: r.type, h: r.q })) }), note: "從 P3-02 的存疑清單和第 1 節的三個問題挑 6–8 題。" },
    { html: S.cards({ kicker: kick(D1, 2), title: "追問句型卡", cols: 3, cards: C.FOLLOW_UPS.map((f) => ({ tag: f.type, h: f.q })) }) },
    { html: S.list({ kicker: kick(D1, 2), title: "每一題都想兩件事", big: true, items: C.TABOO }) },
    { html: S.tool(kick(D1, 2), "pagesCard", [0, 1, 2]), note: "邀請卡要寫五件事；本週內親送給長輩。" },
    { html: S.list({ kicker: kick(D1, 2), title: "下課前", big: true, items: ["開場稿念一次，1 分鐘內念完", "老師檢查訪談題", "這星期把邀請卡送給長輩", "12/4 要去圖書室找資料"] }) },
  ] };

  const d2 = { id: "d2", label: `${D2.date}`, sub: "第 3–4 節", slides: [
    { html: S.title({ kicker: kick(D2, 3), title: "每一句話，都說得出是誰說的", sub: "今天要完成：3 則引註，貼到 Padlet", chips: ["備忘錄", "Padlet", "學習單 3"] }) },
    { html: S.compare({ kicker: kick(D2, 3), title: "哪一句比較可信？", left: { h: "A", d: "「福壽螺是外來種。」" }, right: { h: "B", d: "「根據＿＿的資料……，Awos 農場的 faki 也告訴我們……」" } }) },
    { html: S.list({ kicker: kick(D2, 3), title: "引註＝讓別人可以照著再查一次", items: ["作者", "書名或篇名", "出版年", "出版者", "頁碼", "摘錄原文（照抄，不改寫）", "我的判讀：回答了什麼、還缺什麼"] }) },
    { html: S.cards({ kicker: kick(D2, 3), title: "在書裡找資料的三個方法", cols: 3, cards: [{ tag: "1", h: "目錄", d: "找跟主題有關的章節" }, { tag: "2", h: "索引", d: "書後面的關鍵字表" }, { tag: "3", h: "圖片說明", d: "照片下面的小字" }] }) },
    { html: S.tool(kick(D2, 3), "notesScan", [0, 1, 2]) },
    { html: S.tool(kick(D2, 3), "padlet", [1, 2, 3]) },
    { html: S.list({ kicker: kick(D2, 3), title: "下課前：交換檢查", big: true, items: ["和隔壁交換引註清單", "照著對方的引註，找得到那一頁嗎？", "下一節上網查，規則一樣"] }) },
    { html: S.title({ kicker: kick(D2, 4), title: "不靠相信，靠查證", sub: "今天要完成：查證三問、交叉查證、山海小知識口語稿", chips: ["Safari", "Padlet", "學習單 4"] }) },
    { html: S.cards({ kicker: kick(D2, 4), title: "查證三問", cols: 3, cards: C.THREE_Q.map((q) => ({ tag: q.amis, h: q.zh, d: q.hint })) }) },
    { html: S.tool(kick(D2, 4), "safari", [0, 1, 3]) },
    { html: S.list({ kicker: kick(D2, 4), title: "交叉查證和存疑清單", items: ["同一件事，找兩個以上的來源", "說法一樣 → 可以用", "說法不一樣 → 寫下以哪個為準、為什麼", "查不到、或跟部落說法不同 → 放進存疑清單，錄音那天問長輩"], aside: `<p class="s-aside-h">碰到祭儀、禁忌</p><p>不念出來、不傳閱，直接抄進存疑清單給老師。</p>` }) },
    { html: S.compare({ kicker: kick(D2, 4), title: "把書面語變成說話語", left: { h: "書面語", d: C.EXAMPLES.spokenBefore }, right: { h: "說話語", d: C.EXAMPLES.spokenAfter } }), note: "一句一個重點，15 秒內念完。" },
    { html: S.list({ kicker: kick(D2, 4), title: "上網規則", big: true, items: ["不打自己或別人的姓名、住址", "不下載檔案", "看到不舒服的內容：馬上蓋上螢幕、舉手"] }) },
    { html: S.list({ kicker: kick(D2, 4), title: "下課前", big: true, items: ["一起念：cimaay、mihecaan、icowaay", "念一次山海小知識，3 分鐘內", "存疑的問題加進訪談大綱"] }) },
  ] };

  const d3 = { id: "d3", label: `${D3.date}`, sub: "第 5–6 節（耆老錄音日）", slides: [
    { html: S.title({ kicker: kick(D3, 5), title: "讓聲音乾淨、讓長輩安心", sub: "今天要完成：錄好主持段落、三請示彩排", chips: ["GarageBand", "學習單 6"] }) },
    { html: S.list({ kicker: kick(D3, 5), title: "聲音大挑戰", big: true, items: ["先聽學長姐在電台錄音室的聲音", "同一句話，在教室中間錄", "在窗邊錄", "在紙箱＋毛毯錄音角錄"], aside: `<p class="s-aside-h">好聲音三祕訣</p><p>嘴巴離 iPad 一個拳頭<br>找安靜的角落<br>打開勿擾模式</p>` }) },
    { html: S.tool(kick(D3, 5), "gbNew", [0, 1, 2]) },
    { html: S.tool(kick(D3, 5), "gbNew", [3, 4, 5]) },
    { html: S.list({ kicker: kick(D3, 5), title: "一段一段錄，不用一次錄完", big: true, items: ["開場、山海小知識、結尾分開錄", "說錯就停，從那一句重來", "錄完馬上聽一次", "這些就是正式版，好好保存"] }) },
    { html: S.list({ kicker: kick(D3, 5), title: "錄音前一定要問", items: [...C.ASKS, C.FOURTH_ASK, "這段聲音可以在哪裡播放？"], aside: `<p class="s-aside-h">長輩選一個</p><p>${C.LEVELS.map((l) => l.label).join("<br>")}</p>` }), note: "長輩沒說 manga'ay，就不錄、不公開。" },
    { html: S.cards({ kicker: kick(D3, 5), title: "模擬訪談五步驟", cols: 5, cards: [{ tag: "1", h: "問候", d: "Nga'ay ho" }, { tag: "2", h: "介紹", d: "節目、用途" }, { tag: "3", h: "請示", d: "三請示＋公開層級" }, { tag: "4", h: "提問", d: "先聽再問、不打斷" }, { tag: "5", h: "致謝", d: "Aray" }] }) },
    { html: S.cards({ kicker: kick(D3, 5), title: "等一下錄音時的分工", cols: 3, cards: [{ tag: "主持人", h: "問與聽", d: "用訪談小卡提問、追問" }, { tag: "製作人", h: "錄與看", d: "GarageBand 錄音；另一台語音備忘錄備份" }, { tag: "研究員", h: "記時間點", d: "例：05:30 長輩講到以前在田埂採 kamamit" }] }) },
    { html: S.title({ kicker: kick(D3, 6), title: "Nga'ay ho, malitengay", sub: "謝謝長輩來當我們節目的來賓", chips: ["迎接", "請示", "錄音", "致謝"] }) },
    { html: S.cards({ kicker: kick(D3, 6), title: "今天的流程", cols: 5, cards: [{ tag: "5 分", h: "迎接", d: "族語問候" }, { tag: "5 分", h: "請示", d: "三請示、公開層級、怎麼稱呼您" }, { tag: "20 分", h: "錄音", d: "提問、追問" }, { tag: "5 分", h: "檢查", d: "回放、備份" }, { tag: "5 分", h: "致謝", d: "Aray、radiw" }] }) },
    { html: S.list({ kicker: kick(D3, 6), title: "主持人的禮儀", big: true, items: ["先聽完，再問下一題", "不打斷長輩", "點頭回應", "追問：「可以再多說一點嗎？」", "長輩猶豫：「沒關係，這題我們不錄。」"] }) },
    { html: S.tool(kick(D3, 6), "voiceMemo", [0, 1, 2]) },
    { html: S.list({ kicker: kick(D3, 6), title: "錄完先別走", big: true, items: ["聽開頭 10 秒、結尾 10 秒", "確認有存檔", "馬上 AirDrop 給老師", "長輩說不能公開的地方，記下時間"] }) },
    { html: S.tool(kick(D3, 6), "airdrop", [0, 1]) },
    { html: S.title({ kicker: kick(D3, 6), title: "Aray！", sub: "唱 radiw、送致謝卡，邀請長輩 1/15 來聽首播", chips: ["radiw", "致謝卡", "1/15 首播"] }) },
  ] };

  const d4 = { id: "d4", label: `${D4.date}`, sub: "第 7–8 節", slides: [
    { html: S.title({ kicker: kick(D4, 7), title: "剪出好聽的節目", sub: "今天要完成：剪輯、配樂、匯出初版", chips: ["GarageBand", "學習單 6"] }) },
    { html: S.list({ kicker: kick(D4, 7), title: "剪輯四件事", big: true, items: ["去頭去尾", "拿掉太長的停頓", "加片頭片尾音樂", "說話比音樂大聲"], aside: `<p class="s-aside-h">一定要做</p><p>長輩說不能公開的段落，<b class="s-red">一定刪掉</b>（看學習單 5、6 記的時間）</p>` }) },
    { html: S.tool(kick(D4, 7), "gbEdit", [0, 1, 2]) },
    { html: S.tool(kick(D4, 7), "gbEdit", [3, 4]) },
    { html: S.layers(kick(D4, 7)), note: "先全班一起聽 3 種不同的鼓 Loop，讓學生說說哪個像海、哪個像田。每組 15 分鐘完成；片頭片尾用同一首，聽眾一聽就知道是你們的節目。" },
    { html: S.tool(kick(D4, 7), "gbTheme", [0, 1, 2, 3]) },
    { html: S.tool(kick(D4, 7), "gbTheme", [4, 5, 6]) },
    { html: S.tool(kick(D4, 7), "gbMusic", [0, 1, 2]) },
    { html: S.title({ kicker: kick(D4, 8), title: "做出門面，準備上線", sub: "今天要完成：封面、海報、試聽修訂、上傳四件成果", chips: ["Pages", "照片", "雲端硬碟", "學習單 7"] }) },
    { html: S.cover(kick(D4, 8), "好封面四要素", ["大大的節目名稱", "一個族語詞", "一張自己拍的主圖", "組別", "郵票測試：縮小還看得懂嗎？"]) },
    { html: S.tool(kick(D4, 8), "cover", [0, 1]) },
    { html: S.tool(kick(D4, 8), "cover", [2, 3]) },
    { html: S.list({ kicker: kick(D4, 8), title: "A4 發表會海報要有", big: true, items: ["節目名稱和封面", "一句節目介紹", "1/15 發表時間、地點", "長輩的稱謂（長輩同意才放）"] }) },
    { html: S.compare({ kicker: kick(D4, 8), title: "交換試聽：回饋句型", left: { h: "我欣賞你……", d: "你們的開場很清楚，一聽就知道這集要講什麼。" }, right: { h: "我建議你……", d: "長輩說話的地方，音樂可以再小聲一點。" } }) },
    { html: S.tool(kick(D4, 8), "gbExport", [0, 1, 2]) },
    { html: S.tool(kick(D4, 8), "driveUpload", [1, 2, 3]) },
    { html: S.qr({ kicker: kick(D4, 8), title: "掃 QR Code 上傳四件成果", key: "folder", items: ["完成版音檔", "封面", "腳本 PDF", "海報 PDF"] }) },
  ] };

  const d5 = { id: "d5", label: `${D5.date}`, sub: "第 9–10 節發表會", slides: [
    { html: S.title({ kicker: `${D5.date}（五）・第 9–10 節｜首播發表會`, title: "ON AIR", sub: "Salimpo 山海之聲，四集節目首次播出", chips: C.GROUPS.map((g) => `${g.label} ${g.members.join("、")}`) }) },
    { html: S.cards({ kicker: "首播發表會", title: "今天的流程", cols: 3, cards: [{ tag: "第 9 節", h: "開場＋第 1、2 組", d: "每組：1 分鐘介紹 → 播全集 → 長輩說一句話 → Padlet 回饋" }, { tag: "第 10 節", h: "第 3、4 組", d: "流程一樣" }, { tag: "最後 6 分鐘", h: "反思與致謝", d: "寫反思、唱 radiw、送致謝卡" }] }) },
    { html: S.groups("首播發表會", "播放順序") },
    { html: S.cards({ kicker: "首播發表會", title: "三明治回饋", cols: 3, cards: [{ tag: "上層麵包", h: "我欣賞……", d: C.EXAMPLES.sandwich.like }, { tag: "中間夾心", h: "我建議……", d: C.EXAMPLES.sandwich.suggest }, { tag: "下層麵包", h: "我期待……", d: C.EXAMPLES.sandwich.hope }] }) },
    { html: S.qr({ kicker: "首播發表會", title: "掃 QR Code 到 Padlet 留言", key: "padlet", items: ["找到「1/15 發表會回饋」那一欄", "按「＋」", "標題寫「給第 X 組」", "內文寫：我欣賞、我建議、我期待"] }) },
    { html: S.list({ kicker: "首播發表會", title: "我的反思", big: true, items: ["我從長輩身上學到的一句話", "我最會用的 iPad App", "下次我想改進的地方"] }) },
    { html: S.list({ kicker: "首播發表會", title: "把節目送回給長輩", big: true, items: ["唱 radiw、送致謝卡", "依長輩同意的範圍分享", "沒來的長輩：到文健站或家裡播給他聽"] }) },
    { html: S.qr({ kicker: "首播發表會", title: "Sa'icelen！下載講義", key: "handout", items: ["掃 QR Code 下載講義", "回家播給家人聽"] }) },
  ] };

  global.DECKS = [intro, d1, d2, d3, d4, d5];
})(window);
