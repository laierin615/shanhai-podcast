/**
 * P3-03 山海之聲 Podcast 期末專題（五週十節）— 課程內容資料
 * 簡報、學生手冊、學習單、成果上傳共用這一份資料。教案全文見 plan.js（由教案文件匯出）。
 */
(function defineCourse(global) {
  "use strict";

  const DRIVE = {
    root: "https://drive.google.com/drive/folders/1BUgyPjOAowk7Y-_7wGaOGINEq8jVu_a-",
    teacher: "https://drive.google.com/drive/folders/12ixXCSANxw7aB7kQnrN_JcsVVjKD38wS",
    groups: {
      g1: "https://drive.google.com/drive/folders/1Ip-4lL4lNGHdFRmFZY3QplcqWdD8l4nI",
      g2: "https://drive.google.com/drive/folders/1VugcDXq_X5Weg5h6NHMO5Yk-Avqjp4_9",
      g3: "https://drive.google.com/drive/folders/1eiLu9HzvwfQmhzyHh0v2OE-sfpWguVn3",
      g4: "https://drive.google.com/drive/folders/1r0SW5wRW3KP22bbvkVMnEOrin_kEIbTq",
    },
  };

  const DOCS = [
    { label: "教案（五週十節）", url: "https://claude.ai/artifact/N6KWewgzM1K8ss8jppAE2n" },
    { label: "協同教師簡案", url: "https://claude.ai/artifact/9VW9Jew19BkgXu9diWCCSH" },
    { label: "P3 山海專題高年級詳案（P3-01～P3-02）", url: "https://docs.google.com/document/d/1Fnd8p5EmMy4TRQwWkTswbYtIjXYu-qEU1HGcfhx4yGA/edit" },
    { label: "雲端成果資料夾", url: DRIVE.root },
    { label: "阿美語萌典", url: "https://amis.moedict.tw/" },
  ];

  const GROUPS = [
    { id: "g1", label: "第1組", members: ["Kolas"], note: "單人組，錄音和剪輯時有老師當助理" },
    { id: "g2", label: "第2組", members: ["Potal", "Sawmah"] },
    { id: "g3", label: "第3組", members: ["Panay 林", "Panay 朱"] },
    { id: "g4", label: "第4組", members: ["Nakaw", "Roko"] },
  ];

  /** 本校電台受訪 */
  const RADIO = {
    alian: {
      station: "Alian 原住民族廣播電台", program: "《Lima 同學會》", date: "2024.07.15（113.07.15）播出",
      album: "https://youtube.com/playlist?list=OLAK5uy_nEuZrXEHTF3YG4wI75VcEAG-GighDnjrM",
      albumName: "《O‘olic no ‘orip 生活的詩‧寧埔國小阿美歌謠集》",
      video: "https://www.facebook.com/share/v/twi4zB5toxZebgDc/",
      reel: "https://www.instagram.com/reel/C9xNewsP_0I/",
      photo: { src: "img/alian-2024-0715.jpg", alt: "2024 年 7 月 15 日，寧埔國小師生在 Alian 96.3 原住民族廣播電台錄音室合影，手上拿著專輯《生活的詩》", caption: "2024.07.15 學長姐在 Alian 96.3 錄音室，手上拿著自己錄的專輯" },
    },
    taitung: { station: "臺東教育電台", program: "", date: "" },
  };

  /** 五次上課（每次 2 節連排） */
  const SESSIONS = [
    { id: "d1", date: "11/27", full: "115.11.27（五）", lessons: [1, 2], theme: "選題與腳本" },
    { id: "d2", date: "12/04", full: "115.12.04（五）", lessons: [3, 4], theme: "搜集資料" },
    { id: "d3", date: "12/11", full: "115.12.11（五）", lessons: [5, 6], theme: "彩排與耆老錄音日" },
    { id: "d4", date: "01/08", full: "116.01.08（五）", lessons: [7, 8], theme: "剪輯、封面與上傳" },
    { id: "d5", date: "01/15", full: "116.01.15（五）", lessons: [9], theme: "首播發表會" },
  ];

  /** 十節課（第 9–10 節合併為發表會） */
  const LESSONS = [
    { n: 1, label: "第 1 節", title: "選題｜節目企劃", apps: ["無邊記", "備忘錄"], ws: "ws1", guide: ["freeform", "notes"],
      todo: ["聽學長姐上電台的聲音", "分組、分角色", "在無邊記選出主題", "在備忘錄寫企劃清單", "說 30 秒節目預告"] },
    { n: 2, label: "第 2 節", title: "討論腳本｜訪談大綱與邀請卡", apps: ["Pages", "無邊記"], ws: "ws2", guide: ["pagesScript", "pagesCard"],
      todo: ["拆解電台開場", "在 Pages 填節目流程表", "寫開場稿", "寫 6–8 題訪談大綱", "做耆老邀請卡"] },
    { n: 3, label: "第 3 節", title: "搜集資料（一）書籍與部落文史", apps: ["備忘錄", "Padlet", "Pages"], ws: "ws3", guide: ["notesScan", "padlet"],
      todo: ["學會引註要寫什麼", "到圖書室找書、貼書籤", "用備忘錄掃描書頁", "寫 3 則引註", "貼到 Padlet 資料牆"] },
    { n: 4, label: "第 4 節", title: "搜集資料（二）網路查證與口語稿", apps: ["Safari", "備忘錄", "Padlet", "Pages"], ws: "ws4", guide: ["safari", "padlet"],
      todo: ["用 Safari 查資料", "每則都用查證三問", "交叉查證兩個來源", "存疑的放進訪談題", "寫山海小知識口語稿"] },
    { n: 5, label: "第 5 節", title: "錄音練習｜三請示彩排", apps: ["GarageBand", "語音備忘錄"], ws: "ws6", guide: ["gbNew"],
      todo: ["聲音大挑戰", "GarageBand 開新節目", "錄開場、小知識、結尾", "三請示和公開層級", "模擬訪談一輪"] },
    { n: 6, label: "第 6 節", title: "耆老來賓錄音日", apps: ["GarageBand", "語音備忘錄"], ws: "ws5", guide: ["voiceMemo", "airdrop"],
      todo: ["族語問候迎接長輩", "錄音前先請示", "訪談錄音 20 分鐘", "回放檢查、AirDrop 備份", "用 radiw 和 Aray 致謝"] },
    { n: 7, label: "第 7 節", title: "剪輯後製", apps: ["GarageBand"], ws: "ws6", guide: ["gbEdit", "gbMusic"],
      todo: ["回放錄音日的開頭", "匯入錄音、排好順序", "剪掉不要的地方", "加片頭片尾音樂", "匯出初版"] },
    { n: 8, label: "第 8 節", title: "封面海報｜試聽修訂｜上傳", apps: ["Pages", "照片", "GarageBand", "Google 雲端硬碟"], ws: "ws7", guide: ["cover", "gbExport", "driveUpload"],
      todo: ["做正方形封面", "做 A4 發表會海報", "交換試聽、修改", "匯出完成版", "四件成果上傳雲端"] },
    { n: 9, label: "第 9–10 節", title: "山海之聲首播發表會", apps: ["投影", "Padlet"], ws: "ws8", guide: ["padlet"],
      todo: ["ON AIR 開場", "四組輪流首播全集", "在 Padlet 留三明治回饋", "寫反思", "向長輩致謝"] },
  ];

  /** 一集節目的流程 */
  const RUNDOWN = [
    { time: "00:00", len: "15 秒", seg: "片頭音樂", who: "製作人", tip: "Apple Loops 音樂慢慢變大聲" },
    { time: "00:15", len: "1 分鐘", seg: "開場", who: "主持人", tip: "Nga'ay ho! 節目名稱、自我介紹、這一集想知道什麼" },
    { time: "01:15", len: "3 分鐘", seg: "山海小知識", who: "主持人＋研究員", tip: "3 則資料卡，每則說「根據誰、哪一年」" },
    { time: "04:15", len: "6–8 分鐘", seg: "來賓訪談", who: "主持人＋耆老", tip: "介紹長輩，用訪談小卡提問、追問" },
    { time: "12:00", len: "1–2 分鐘", seg: "我們學到的事", who: "全組", tip: "回答這一集的核心問題" },
    { time: "13:30", len: "30 秒", seg: "致謝與結尾", who: "主持人", tip: "Aray! 片尾音樂" },
  ];

  const ROLES = [
    { name: "主持人", en: "Host", job: "開場、串場、向長輩提問和追問" },
    { name: "製作人", en: "Producer", job: "用 GarageBand 錄音、剪輯、匯出" },
    { name: "研究員", en: "Researcher", job: "找資料、寫引註、錄音時記時間點" },
    { name: "設計師", en: "Designer", job: "邀請卡、封面、海報、致謝卡" },
  ];

  const TOPICS = [
    { word: "kamamit", title: "田埂上消失的酸甜", link: "P3-01 文健站分享 kamamit" },
    { word: "panay・toko", title: "Awos 農場的友善田", link: "P3-02 Awos 農場踏查" },
    { word: "talo'an", title: "田邊的無牆房子", link: "P3-02 工寮、傳統建築" },
    { word: "radiw", title: "長輩唱給我們聽的歌", link: "山海藝音 祭儀歌謠", caution: true },
    { word: "riyar", title: "潮間帶的規矩", link: "山海生活 潮間帶", caution: true },
    { word: "野菜藥草", title: "長輩的餐桌", link: "山海生活 野菜與藥草" },
    { word: "toron", title: "一起做、一起分", link: "P3-01 創意 toron" },
    { word: "ngangan", title: "名字裡的故事", link: "山海人文 族名與地名" },
  ];

  const RULERS = ["跟我們上過的民族課程有關", "有耆老可以問、願意當來賓", "10–15 分鐘講得完"];
  const RADAR = ["①身世與生態", "②田間與科學", "③廚房與保存", "④慢食與價值"];
  const ASKS = ["可以記錄嗎？", "可以錄音嗎？", "可以寫進我們的報告嗎？"];
  const FOURTH_ASK = "這些可以在全校師生面前講嗎？（6 年級）";
  const LEVELS = [
    { id: "class", label: "只在班上播放" },
    { id: "school", label: "全校發表會播放" },
    { id: "web", label: "可以放到網路" },
  ];
  const TABOO = ["會不會碰到禁忌、祭儀或靈觀？", "會不會問到別人的隱私或家裡的事？", "長輩不想回答時，我要怎麼說？"];
  const THREE_Q = [
    { amis: "cimaay", zh: "誰寫的？", hint: "作者、單位、受訪的長輩" },
    { amis: "mihecaan", zh: "哪一年？", hint: "出版年、網頁日期、訪談日期" },
    { amis: "icowaay", zh: "哪一族、哪一地？", hint: "說的是不是我們這裡的事" },
  ];
  const FOLLOW_UPS = [
    { type: "原因類", q: "為什麼會這樣？" },
    { type: "比較類", q: "以前和現在有什麼不一樣？" },
    { type: "影響類", q: "這件事對部落有什麼影響？" },
  ];
  const COVER_SPEC = ["正方形 1:1", "至少 1400 × 1400 像素", "節目名稱縮小還看得清楚", "有一個族語詞", "照片自己拍或自己畫", "寫上組別"];

  /**
   * iPad 圖文教學：每一步 = 一句話 + 一張示意圖（mock.js 的畫面代號與要點的位置）
   */
  const TOOLS = {
    freeform: { app: "無邊記", tone: "blue", title: "在無邊記選主題", when: "11/27 第 1 節", steps: [
      { t: "打開「無邊記」，點右上角的「新增白板」。", m: ["ff-home", "new"] },
      { t: "上面工具列點「便利貼」，點兩下就能打字。一張便利貼寫一個好奇的問題。", m: ["ff-board", "sticky"] },
      { t: "用「文字」寫四個區塊：①身世與生態 ②田間與科學 ③廚房與保存 ④慢食與價值，把便利貼拖進去。", m: ["ff-zones", "zone"] },
      { t: "三把尺都通過的便利貼，點一下改成紅色。", m: ["ff-zones", "red"] },
      { t: "完成後截圖（同時按頂端按鈕和音量鍵），存在「照片」。", m: ["ipad-buttons", "top"] },
    ] },
    notes: { app: "備忘錄", tone: "yellow", title: "用備忘錄寫企劃清單", when: "11/27 第 1 節", steps: [
      { t: "打開「備忘錄」，點右上角的「新增」，標題寫「第X組 節目企劃」。", m: ["notes", "new"] },
      { t: "點「核取清單」按鈕，打出四件事：節目名稱、核心問題、耆老、三個問題。", m: ["notes", "check"] },
      { t: "完成一件就點前面的圓圈打勾。", m: ["notes", "tick"] },
    ] },
    notesScan: { app: "備忘錄", tone: "yellow", title: "用備忘錄掃描書頁", when: "12/04 第 3 節", steps: [
      { t: "在備忘錄裡點「迴紋針（附件）」或相機按鈕。", m: ["notes", "attach"] },
      { t: "選「掃描文件」。", m: ["notes-menu", "scan"] },
      { t: "把書頁放平，iPad 對準，黃色框框出現就會自動拍下。", m: ["notes-camera", "frame"] },
      { t: "拍完按「儲存」，再把標題改成「書名 第幾頁」。", m: ["notes-camera", "save"] },
    ] },
    pagesScript: { app: "Pages", tone: "orange", title: "在 Pages 寫節目腳本", when: "11/27 第 2 節", steps: [
      { t: "打開 Pages，點老師 AirDrop 給你的「節目腳本範本」。", m: ["pages-files", "doc"] },
      { t: "點表格的格子就能打字：時間、段落、誰說、內容。", m: ["pages-table", "cell"] },
      { t: "有 Apple 帳號的組別，點右上角「協作」邀請同組一起寫。沒有帳號就輪流打字。", m: ["pages-table", "collab"] },
      { t: "寫完點「⋯」→「匯出」→「PDF」，存到檔案。", m: ["pages-export", "pdf"] },
    ] },
    pagesCard: { app: "Pages", tone: "orange", title: "做耆老邀請卡", when: "11/27 第 2 節", steps: [
      { t: "Pages 點「選擇模板」，找「卡片」或「傳單與海報」。", m: ["pages-templates", "card"] },
      { t: "點照片右下角的「＋」，換成你們自己拍的部落照片。", m: ["pages-card", "photo"] },
      { t: "點文字改成五件事：節目名稱、日期時間地點、錄音做什麼用、在哪裡播放、資料怎麼保存。", m: ["pages-card", "text"] },
    ] },
    padlet: { app: "Padlet", tone: "pink", title: "把資料貼到 Padlet 資料牆", when: "12/04、01/15", steps: [
      { t: "掃老師的 QR Code，打開「P3-03 山海之聲資料牆」。", m: ["padlet", "board"] },
      { t: "找到自己組的那一欄，按下面的「＋」。", m: ["padlet", "plus"] },
      { t: "標題寫一句重點，內文寫出處（誰寫的、哪一年、哪一地），再附上掃描的照片。", m: ["padlet-post", "title"] },
      { t: "選顏色：綠色＝書，藍色＝網路，紅色＝要問長輩。", m: ["padlet-post", "color"] },
      { t: "按「發佈」。老師看過後就會出現在牆上。", m: ["padlet-post", "publish"] },
    ] },
    safari: { app: "Safari", tone: "gray", title: "上網查資料，用查證三問", when: "12/04 第 4 節", steps: [
      { t: "在 Safari 上面的搜尋列輸入具體的關鍵字：地名＋族群＋東西，例如「長濱 阿美族 kamamit」。", m: ["safari", "search"] },
      { t: "打開一則資料，先找「誰寫的」：作者、網站或單位的名字。", m: ["safari-page", "author"] },
      { t: "再找「哪一年」：發布日期。看看是不是在講我們這裡。", m: ["safari-page", "date"] },
      { t: "三問都找得到，才寫進資料卡。找不到或說法不同，就放進存疑清單去問長輩。", m: ["safari-page", "check"] },
    ] },
    gbNew: { app: "GarageBand", tone: "dark", title: "GarageBand 開一個新節目", when: "12/11 第 5 節", warn: "第 3 步一定要做！沒打開「自動」，錄到 16 秒就會停。", steps: [
      { t: "打開 GarageBand，左右滑找到「錄音機」，點下面的「語音」。", m: ["gb-browser", "voice"] },
      { t: "點上面的「節拍器」按鈕，讓它變灰色（關掉）。", m: ["gb-tracks", "metro"] },
      { t: "點右上角的「＋」→「樂段 A」→ 打開「自動」。", m: ["gb-section", "auto"] },
      { t: "按紅色圓形「錄音」鍵開始說話，說完按「停止」。", m: ["gb-tracks", "rec"] },
      { t: "按「播放」聽聽看，點「軌道」按鈕就能看到聲波。", m: ["gb-tracks", "play"] },
      { t: "點「我的樂曲」，長按這首 →「重新命名」→ 第X組_節目名_日期。", m: ["gb-songs", "rename"] },
    ] },
    voiceMemo: { app: "語音備忘錄", tone: "dark", title: "第二台 iPad 備份錄音", when: "12/11 第 6 節", steps: [
      { t: "另一台 iPad 打開「語音備忘錄」，和 GarageBand 一起按紅色錄音鍵。", m: ["vm", "rec"] },
      { t: "錄完點這段錄音，把名字改成「第X組_耆老訪談_備份」。", m: ["vm", "name"] },
      { t: "點「⋯」→「分享」→ AirDrop 給老師，或「儲存到檔案」。", m: ["vm", "more"] },
    ] },
    airdrop: { app: "AirDrop", tone: "gray", title: "用 AirDrop 傳給老師備份", when: "12/11 第 6 節", steps: [
      { t: "在檔案或錄音上點「分享」按鈕（方框加向上箭頭）。", m: ["share-sheet", "share"] },
      { t: "點「AirDrop」，再點老師的 iPad。老師按「接受」就傳好了。", m: ["share-sheet", "airdrop"] },
    ] },
    gbEdit: { app: "GarageBand", tone: "dark", title: "GarageBand 剪輯", when: "01/08 第 7 節", steps: [
      { t: "點右上角的「迴圈」按鈕 →「檔案」分頁 →「從『檔案』App 瀏覽項目」，選語音備忘錄的錄音。", m: ["gb-loops", "files"] },
      { t: "按住錄音，拖到一條空白軌道上。", m: ["gb-tracks", "drag"] },
      { t: "點一下聲波，選「分割」，把剪刀拖到要剪的地方，往下滑剪開。", m: ["gb-split", "split"] },
      { t: "點不要的那一段，選「刪除」。長輩說不公開的段落一定要刪。", m: ["gb-split", "delete"] },
      { t: "拖聲波的左右邊緣，修掉開頭和結尾的空白；按住拖曳可以換順序。", m: ["gb-tracks", "edge"] },
    ] },
    gbMusic: { app: "GarageBand", tone: "dark", title: "加片頭音樂、調音量", when: "01/08 第 7 節", steps: [
      { t: "點「迴圈」按鈕 →「Apple Loops」，點一下試聽，喜歡就拖到新的軌道。", m: ["gb-loops", "apple"] },
      { t: "片頭、片尾各 10–15 秒。用同學唱的 radiw 之前，要先問可不可以公開。", m: ["gb-tracks", "music"] },
      { t: "把軌道左邊往右拉，出現音量條。說話要比音樂大聲。", m: ["gb-mixer", "vol"] },
    ] },
    gbExport: { app: "GarageBand", tone: "dark", title: "匯出完成版", when: "01/08 第 8 節", steps: [
      { t: "點「我的樂曲」，長按你們這一集 →「分享」。", m: ["gb-songs", "share"] },
      { t: "選「歌曲」，品質選「高品質」，再按「分享」。", m: ["gb-share", "song"] },
      { t: "選「儲存到檔案」→「Google 雲端硬碟」→ 自己組的資料夾。檔名：第X組_節目名稱_完成版。", m: ["files-save", "drive"] },
    ] },
    cover: { app: "封面", tone: "orange", title: "做一張正方形封面", when: "01/08 第 8 節", steps: [
      { t: "Pages 開空白文件 →「⋯」→「文件設定」→ 紙張大小選「自訂」，寬和高打一樣的數字。（也可以用無邊記排版）", m: ["pages-setup", "size"] },
      { t: "放上：大大的節目名稱、一個族語詞、組別、你們自己拍的照片。", m: ["cover-design", "title"] },
      { t: "做好後截圖：同時按頂端按鈕和音量鍵。", m: ["ipad-buttons", "top"] },
      { t: "到「照片」→「編輯」→「裁切」→ 比例選「正方形」→ 完成。", m: ["photos-crop", "square"] },
    ] },
    driveUpload: { app: "Google 雲端硬碟", tone: "white", title: "把成果上傳到雲端", when: "01/08 第 8 節", steps: [
      { t: "打開「Google 雲端硬碟」App，登入學校的 Google 帳號。", m: ["drive", "account"] },
      { t: "點「共用」，找到「P3-03 山海之聲 Podcast 成果」，進入自己組的資料夾。", m: ["drive", "folder"] },
      { t: "按右下角的「＋」→「上傳」→ 選檔案。", m: ["drive-menu", "upload"] },
      { t: "上傳四件：完成版音檔、封面、腳本 PDF、海報 PDF。看到檔名就成功了。", m: ["drive-files", "files"] },
    ] },
  };

  /** 逐字稿整理：分享講義到 Google 雲端的方法 */
  const SHARE_METHOD = [
    { h: "做好講義", d: "用 Pages 做好講義或簡報，匯出 PDF。" },
    { h: "放進雲端專區", d: "上傳到 Google 雲端硬碟，每個合作對象一個資料夾，對方記一個連結就好。" },
    { h: "複製分享連結", d: "長按檔案 →「共用」→ 一般存取權改成「知道連結的任何人」→ 複製連結。" },
    { h: "改成直接下載", d: "每個人的登入狀態不同，有人會卡在登入畫面。改成直接下載連結，點了就跳出「要下載嗎？」。" },
    { h: "轉成 QR Code", d: "用「捷徑」App 的「製作 QR 碼」，或用本頁的轉換器，QR Code 存進「照片」。" },
    { h: "放在簡報最後一頁", d: "上課最後一頁放 QR Code，學生一掃就能下載。" },
  ];

  const RUBRIC = [
    { id: "content", dim: "文化內容與查證", levels: ["核心問題緊扣民族課程；3 則以上資料都說出出處；以耆老說法為主，並說明與資料不同之處", "有核心問題；2–3 則資料說出出處；有耆老的說法", "資料沒有出處，或與主題關係不大"] },
    { id: "interview", dim: "來賓訪談與禮儀", levels: ["族語問候與致謝；完整三請示與公開層級；經驗式提問並適時追問，不打斷長輩", "完成三請示；問完 6 題以上；有致謝", "沒有請示就錄音，或常打斷長輩"] },
    { id: "audio", dim: "聲音製作", levels: ["10–15 分鐘；段落清楚；有片頭片尾；音量一致；沒有過長停頓；依試聽回饋修訂", "8–15 分鐘；主持人和來賓的聲音都聽得清楚", "少於 8 分鐘，或很多地方聽不清楚"] },
    { id: "cover", dim: "封面與海報設計", levels: ["正方形封面縮小仍看得清標題；有族語詞；圖像原創且呼應主題；海報資訊完整一致", "正方形封面；有標題與原創圖像；有海報", "不是正方形，或使用來源不明的圖片"] },
  ];
  const LEVEL_NAMES = ["優秀 3", "達成 2", "再努力 1"];

  const VOCAB = [
    { w: "Nga'ay ho", m: "你好", use: "節目開場、迎接長輩" },
    { w: "Aray", m: "謝謝", use: "訪談和節目的結尾" },
    { w: "manga'ay", m: "可以、好的", use: "長輩同意請示的時候" },
    { w: "malitengay", m: "耆老", use: "介紹來賓" },
    { w: "faki", m: "叔叔、伯伯", use: "稱呼男性長輩（聽長輩和族語老師的）" },
    { w: "cimaay・mihecaan・icowaay", m: "誰寫的・哪一年・哪一地", use: "查證三問" },
    { w: "nengneng", m: "看、觀察", use: "查資料、封面郵票測試" },
    { w: "radiw", m: "歌謠、唱歌", use: "用歌謠謝謝長輩" },
    { w: "Mafana' kiso", m: "你很懂！", use: "三明治回饋的第一句" },
    { w: "Sa'icelen", m: "加油、出力", use: "發表會結尾" },
  ];

  /** 範例櫃（示範格式，訪談內容留給真正的長輩回答） */
  const EXAMPLES = {
    showName: "kamamit 的酸甜",
    core: "為什麼田埂上的 kamamit 越來越少？長輩以前怎麼採、怎麼吃？",
    opening: "Nga'ay ho! 這裡是 Salimpo 山海之聲《kamamit 的酸甜》，我是主持人＿＿。以前田埂上到處都是酸酸甜甜的野番茄 kamamit，現在卻越來越少見。這一集，我們想知道它去哪裡了。",
    closing: "謝謝今天的來賓＿＿，也謝謝收聽的你。我們下次見，Aray!",
    spokenBefore: "福壽螺（Pomacea canaliculata）為外來入侵種，會啃食水稻秧苗，對稻作造成嚴重危害。",
    spokenAfter: "你知道嗎？Awos 農場的 faki 在 115 年 9 月帶我們看了田裡粉紅色的福壽螺卵，還告訴我們福壽螺會影響田裡的作物。",
    card: { point: "福壽螺會影響田裡的作物，粉紅色的是牠的卵", who: "Awos 農場的 faki（受訪）", year: "115 年 9 月 11 日訪談", where: "長濱 Awos 農場" },
    webCite: { who: "農業部", title: "〈我國現階段有機農業政策與輔導成果〉", url: "https://www.moa.gov.tw/ws.php?id=11924", date: "115.12.04" },
    questionsBad: "阿美族狩獵的規矩是什麼？",
    questionsGood: "您年輕的時候，上山前家裡會先做什麼？",
    interview: [
      { type: "開場", q: "請問我們在節目裡要怎麼稱呼您？" },
      { type: "經驗", q: "您小時候在哪裡看過 kamamit？" },
      { type: "細節", q: "以前大家怎麼吃 kamamit？" },
      { type: "延伸", q: "以前和現在的田埂有什麼不一樣？" },
      { type: "收尾", q: "您想對聽節目的小朋友說什麼？" },
    ],
    sandwich: { like: "Mafana' kiso！你們的開場很清楚，一聽就知道這集要講什麼。", suggest: "長輩說話的地方音樂可以再小聲一點。", hope: "期待下一集聽到更多長輩唱的 radiw。" },
    invite: ["節目名稱：《kamamit 的酸甜》", "錄音時間地點：115 年 12 月 11 日（五）第 6 節　寧埔國小", "錄音做什麼用：剪成 10–15 分鐘的聲音節目", "在哪裡播放：1/15 學校發表會（依您同意的範圍）", "資料怎麼保存：學校保存，您可以隨時要求不播放"],
    padlet: { title: "福壽螺會影響田裡的作物", body: "誰寫的：Awos 農場 faki（受訪）\n哪一年：115.09.11\n哪一地：長濱 Awos 農場", color: "綠＝書　藍＝網路　紅＝問長輩" },
  };

  /** 學習單（ex = 範例） */
  const WORKSHEETS = [
    { id: "ws1", n: 1, lesson: "第 1 節", title: "選題企劃卡", fields: [
      { type: "fixedrows", id: "radar", label: "提問雷達：每一區寫一個好奇的問題", rowLabels: RADAR, cols: ["我們的好奇問題"], ex: ["kamamit 從哪裡來？", "為什麼噴除草劑後 kamamit 變少？", "kamamit 可以做成什麼？", "長輩覺得 kamamit 有什麼價值？"] },
      { type: "checks", id: "rulers", label: "選題三把尺（三個都要打勾）", options: RULERS },
      { type: "text", id: "course", label: "和哪一課有關？", ex: "P3-01 到文健站分享 kamamit" },
      { type: "text", id: "showName", label: "節目名稱（放一個族語詞）", ex: EXAMPLES.showName },
      { type: "area", id: "core", label: "這一集想回答的核心問題", ex: EXAMPLES.core },
      { type: "text", id: "elder", label: "想邀請的耆老（稱謂）", ex: "Pasongan 文健站的 faki（老師幫忙聯絡）" },
      { type: "rows", id: "questions", label: "三個最想問長輩的問題", cols: ["問題"], n: 3, ex: [["您小時候在哪裡看過 kamamit？"], ["以前大家怎麼吃 kamamit？"], ["為什麼現在比較少看到？"]] },
      { type: "area", id: "teaser", label: "30 秒節目預告", ex: "Nga'ay ho! 這裡是《kamamit 的酸甜》，我是主持人＿＿。這一集我們想知道，田埂上的 kamamit 為什麼越來越少？" },
    ] },
    { id: "ws2", n: 2, lesson: "第 2 節（第 4 節補小知識）", title: "節目腳本與訪談大綱", fields: [
      { type: "fixedrows", id: "rundown", label: "節目流程表", rowLabels: RUNDOWN.map((r) => `${r.time} ${r.seg}`), cols: ["誰說", "內容重點"], ex: [["製作人", "Apple Loops 輕快音樂"], ["主持人", "問候、節目名稱、核心問題"], ["主持人＋研究員", "3 則資料卡（第 4 節補）"], ["主持人＋耆老", "6–8 題訪談"], ["全組", "回答核心問題"], ["主持人", "Aray、片尾"]] },
      { type: "area", id: "opening", label: "開場稿（1 分鐘內念完）", ex: EXAMPLES.opening },
      { type: "rows", id: "interview", label: "訪談大綱（開場—經驗—細節—延伸—收尾）", cols: ["類型", "題目（用經驗式問法）", "追問句", "要先請示？"], n: 8, ex: EXAMPLES.interview.map((r) => [r.type, r.q, r.type === "延伸" ? "為什麼會這樣？" : "", ""]) },
      { type: "checks", id: "taboo", label: "禁忌題自我審查（每題都想過）", options: TABOO },
      { type: "area", id: "learned", label: "我們學到的事（錄音後再寫）" },
      { type: "area", id: "closing", label: "結尾稿", ex: EXAMPLES.closing },
    ] },
    { id: "ws3", n: 3, lesson: "第 3 節", title: "引註清單", fields: [
      { type: "note", html: "引註＝讓別人可以照著再查一次。摘錄要抄原文，不能改寫。" },
      { type: "rows", id: "cites", label: "書籍與部落文史引註", cols: ["作者", "書名或篇名", "出版年", "出版者", "頁碼", "摘錄原文", "回答哪個小問題", "我的判讀"], n: 3, ex: [["○○○", "《○○部落的故事》", "2010", "○○出版社", "p.23", "（抄下書上的一句原文）", "以前怎麼吃 kamamit？", "有講吃法，沒講長濱"]] },
      { type: "checks", id: "check", label: "自我檢查", options: ["每一則欄位都寫滿", "摘錄是抄原文", "已貼到 Padlet 資料牆"] },
    ] },
    { id: "ws4", n: 4, lesson: "第 4 節", title: "查證紀錄與口語稿", fields: [
      { type: "rows", id: "web", label: "網路資料：查證三問", cols: ["網址", "擷取日期", "cimaay 誰寫的", "mihecaan 哪一年", "icowaay 哪一族哪一地", "通過？"], n: 3, ex: [[EXAMPLES.webCite.url, EXAMPLES.webCite.date, EXAMPLES.webCite.who, "（看網頁上的日期）", "臺灣，沒有講長濱", "部分通過"]] },
      { type: "rows", id: "cross", label: "交叉查證", cols: ["要確認的事", "來源一怎麼說", "來源二怎麼說", "以哪個為準？為什麼？"], n: 2 },
      { type: "rows", id: "doubt", label: "存疑清單：帶去問長輩", cols: ["不確定的內容", "我想怎麼問長輩"], n: 2, ex: [["網路說 kamamit 是外來的", "您小時候 kamamit 就長在田埂上了嗎？"]] },
      { type: "rows", id: "spoken", label: "山海小知識口語稿", cols: ["資料卡重點", "主持人要說的話（根據誰、哪一年）"], n: 3, ex: [[EXAMPLES.card.point, EXAMPLES.spokenAfter]] },
    ] },
    { id: "ws5", n: 5, lesson: "第 2、5、6 節", title: "耆老來賓邀請與授權紀錄", fields: [
      { type: "note", html: "邀請卡要寫五件事：節目名稱、錄音時間地點、錄音做什麼用、在哪裡播放、資料怎麼保存。" },
      { type: "text", id: "callName", label: "節目中怎麼稱呼長輩（請長輩決定）" },
      { type: "text", id: "when", label: "錄音時間地點", ex: "115.12.11（五）第 6 節　學校圖書室" },
      { type: "checks", id: "asks", label: "三請示（長輩說 manga'ay 才打勾）", options: [...ASKS, FOURTH_ASK] },
      { type: "radio", id: "level", label: "長輩同意播放到哪裡", options: LEVELS.map((l) => l.label) },
      { type: "text", id: "consentAt", label: "長輩口頭同意錄在第幾秒", ex: "00:20" },
      { type: "area", id: "noPublic", label: "長輩說不要錄、不能公開的地方（寫時間點）", ex: "08:40–09:10 家裡的事，剪掉" },
      { type: "checks", id: "thanks", label: "致謝", options: ["Aray 致謝", "唱 radiw", "送伴手禮和致謝卡", "邀請長輩來 1/15 發表會"] },
    ] },
    { id: "ws6", n: 6, lesson: "第 5–7 節", title: "錄音與剪輯檢核", fields: [
      { type: "radio", id: "lightVolume", label: "試錄燈號：音量", options: ["綠：剛剛好", "黃：有點小或有點爆", "紅：聽不清楚"] },
      { type: "radio", id: "lightSpeed", label: "試錄燈號：速度", options: ["綠：剛剛好", "黃：有點快", "紅：太快或卡卡的"] },
      { type: "radio", id: "lightClear", label: "試錄燈號：清楚", options: ["綠：每個字都聽得懂", "黃：有幾個字不清楚", "紅：很多字聽不清楚"] },
      { type: "rows", id: "marks", label: "錄音時間點（錄音日研究員記）", cols: ["時間", "誰說", "關鍵句／要不要剪"], n: 6, ex: [["05:30", "長輩", "以前在田埂採 kamamit（保留）"], ["08:40", "長輩", "家裡的事（長輩說不公開，剪掉）"]] },
      { type: "checks", id: "edit", label: "剪輯檢核", options: ["去頭去尾", "拿掉太長的停頓", "加片頭片尾音樂", "說話比音樂大聲", "長輩不公開的地方已刪掉", "全長 10–15 分鐘", "匯出初版"] },
      { type: "text", id: "length", label: "全長幾分幾秒", ex: "12 分 40 秒" },
    ] },
    { id: "ws7", n: 7, lesson: "第 8 節", title: "封面海報設計稿", fields: [
      { type: "text", id: "coverTitle", label: "封面上的節目名稱", ex: EXAMPLES.showName },
      { type: "text", id: "coverWord", label: "封面上的族語詞", ex: "kamamit" },
      { type: "text", id: "coverPhoto", label: "主圖要拍什麼", ex: "田埂上的 kamamit 特寫" },
      { type: "checks", id: "coverCheck", label: "封面檢核", options: COVER_SPEC },
      { type: "checks", id: "poster", label: "海報上有", options: ["節目名稱", "封面", "一句節目介紹", "1/15 時間地點", "長輩稱謂（長輩同意才放）"] },
      { type: "rows", id: "feedback", label: "試聽回饋和修改", cols: ["誰給的建議", "我們怎麼改"], n: 2, ex: [["第3組", "長輩說話時把音樂調小"]] },
      { type: "checks", id: "upload", label: "上傳雲端（四件）", options: ["完成版音檔", "封面", "腳本 PDF", "海報 PDF"] },
    ] },
    { id: "ws8", n: 8, lesson: "第 9–10 節", title: "發表會互評與反思", fields: [
      { type: "rows", id: "sandwich", label: "三明治回饋（也貼到 Padlet）", cols: ["給第幾組", "我欣賞…", "我建議…", "我期待…"], n: 3, ex: [["第2組", EXAMPLES.sandwich.like, EXAMPLES.sandwich.suggest, EXAMPLES.sandwich.hope]] },
      { type: "fixedrows", id: "self", label: "自評（寫 3、2 或 1 和原因）", rowLabels: RUBRIC.map((r) => r.dim), cols: ["分數和原因"] },
      { type: "area", id: "elderWord", label: "我從長輩身上學到的一句話" },
      { type: "text", id: "bestTool", label: "我最會用的 iPad App" },
      { type: "area", id: "improve", label: "下次我想改進的地方" },
      { type: "area", id: "thanksCard", label: "寫給來賓長輩的話（抄到致謝卡）" },
    ] },
  ];

  const PREP = [
    { when: "11/27 前", item: "確認 4 位耆老可在 12/11 第 6 節錄音、1/15 出席" },
    { when: "11/27 前", item: "iPad 更新；安裝 Pages、GarageBand、Google 雲端硬碟、Padlet" },
    { when: "11/27 前", item: "Pages 腳本範本、邀請卡範本；電台受訪片段剪好 1–2 分鐘" },
    { when: "11/27 前", item: "建立 Padlet「P3-03 山海之聲資料牆」，連結貼到成果上傳頁" },
    { when: "12/04 前", item: "洽借書籍、影印文史資料；印引註清單、查證三問卡；安排第二位成人巡視" },
    { when: "12/11 前", item: "GarageBand 樣板、耳機、錄音角；同意書、伴手禮、致謝卡；協同教師分組陪同" },
    { when: "1/08 前", item: "雲端成果資料夾共用給學生 Google 帳號（編輯者）" },
    { when: "1/15 前", item: "投影、喇叭、Padlet 回饋區；邀請長輩、家長、全校師生" },
  ];

  const CONSENT_TEXT = [
    "Salimpo 山海之聲 Podcast 來賓授權同意書",
    "",
    "親愛的長輩：謝謝您擔任寧埔國小高年級山海專題 Podcast《　　　　》的來賓。",
    "這次錄音會由學生剪輯成 10–15 分鐘的聲音節目，作為期末專題成果。",
    "",
    "□ 同意學生記錄訪談內容　□ 同意學生錄音　□ 同意寫進學生的專題報告",
    "節目可以播放的範圍（請勾一項）：□ 只在班上播放　□ 全校發表會播放　□ 可以放到網路",
    "",
    "不希望公開的內容：＿＿＿＿＿＿＿＿＿＿　節目中希望怎麼稱呼您：＿＿＿＿＿＿",
    "來賓簽名或按手印：＿＿＿＿＿＿　日期：115 年＿＿月＿＿日",
    "學生代表：＿＿＿＿＿＿　指導老師：賴奕芸",
    "",
    "錄音檔由學校保存，僅依上面勾選的範圍使用。長輩隨時可以要求刪除或不播放。",
  ].join("\n");

  /** 需要的 App */
  const APPS = [
    { name: "Pages", install: true, use: "腳本、邀請卡、封面、海報、匯出 PDF" },
    { name: "GarageBand", install: true, use: "錄音、剪輯、配樂、匯出節目" },
    { name: "Google 雲端硬碟", install: true, use: "上傳成果、分享連結" },
    { name: "Padlet", install: true, use: "資料牆、發表會回饋（也可用 Safari 開）" },
    { name: "無邊記", install: false, use: "選題風暴（iPadOS 16.2 以上）" },
    { name: "備忘錄", install: false, use: "企劃清單、資料卡、掃描書頁" },
    { name: "語音備忘錄", install: false, use: "錄音日的備份錄音" },
    { name: "Safari", install: false, use: "查資料、阿美語萌典" },
    { name: "相機・照片", install: false, use: "拍封面照片、裁成正方形" },
    { name: "檔案", install: false, use: "匯入錄音、存到雲端" },
    { name: "捷徑", install: false, use: "老師把連結做成 QR Code（選用）" },
  ];

  global.COURSE = {
    APPS, RADIO, DRIVE, DOCS, GROUPS, SESSIONS, LESSONS, RUNDOWN, ROLES, TOPICS, RULERS, RADAR, ASKS, FOURTH_ASK, LEVELS, TABOO,
    THREE_Q, FOLLOW_UPS, COVER_SPEC, TOOLS, SHARE_METHOD, RUBRIC, LEVEL_NAMES, VOCAB, EXAMPLES, WORKSHEETS, PREP, CONSENT_TEXT,
  };
})(window);
