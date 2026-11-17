(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const tabs = [...document.querySelectorAll(".tab")];
  const pages = [...document.querySelectorAll(".page")];
  tabs.forEach(tab => tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.toggle("active", t === tab));
    pages.forEach(page => {
      const active = page.id === tab.dataset.tab;
      page.hidden = !active;
      page.classList.toggle("active", active);
    });
  }));

  let elapsed = 0, startedAt = 0, timerId = null, running = false;
  const formatTime = ms => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor(ms % 60000 / 1000);
    const centiseconds = Math.floor(ms % 1000 / 10);
    return `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}.${String(centiseconds).padStart(2,"0")}`;
  };
  const currentTime = () => running ? performance.now() - startedAt : elapsed;
  function paintClock() {
    const value = formatTime(currentTime());
    $("clock").textContent = value;
    $("journal-time").textContent = value;
  }
  function stopTicker() {
    if (timerId !== null) clearInterval(timerId);
    timerId = null;
  }
  $("start").addEventListener("click", () => {
    if (running) return;
    running = true;
    startedAt = performance.now() - elapsed;
    $("clockstatus").textContent = "● BREWING";
    timerId = setInterval(paintClock, 30);
  });
  $("pause").addEventListener("click", () => {
    if (!running) return;
    elapsed = performance.now() - startedAt;
    running = false;
    stopTicker();
    paintClock();
    $("clockstatus").textContent = "Ⅱ PAUSED";
  });
  $("reset").addEventListener("click", () => {
    running = false; stopTicker(); elapsed = 0;
    paintClock(); $("clockstatus").textContent = "READY TO BREW";
  });

  const number = (id, fallback) => {
    const n = Number($(id).value);
    return Number.isFinite(n) ? n : fallback;
  };
  function recipe() {
    const dose = Math.max(0, number("dose", 15));
    const ratio = Math.max(0, number("ratio", 16));
    const total = Math.round(dose * ratio);
    const bloomPct = number("bloom", 40);
    const bloom = Math.round(total * bloomPct / 100);
    return {dose, ratio, total, bloomPct, bloom};
  }
  function updateRecipe() {
    const r = recipe();
    $("total").textContent = r.total;
    $("bloom-label").textContent = r.bloomPct;
    $("bloomml").textContent = r.bloom;
    $("remain").textContent = r.total - r.bloom;
    $("journal-water").textContent = r.total;
    const stages = [
      ["01","Bloom",r.bloom,"00:00–00:40"],
      ["02","Pour 1",Math.round(r.total * .5),"00:40–01:10"],
      ["03","Pour 2",Math.round(r.total * .75),"01:10–01:50"],
      ["04","Final pour",r.total,"01:50–02:20"]
    ];
    $("schedule").innerHTML = stages.map(s => `
      <div class="step">
        <div><div class="step-name">STEP ${s[0]} · ${s[1]}</div><div class="step-time">${s[3]}</div></div>
        <div class="step-value">${s[2]} ml<small>target kumulatif</small></div>
      </div>`).join("");
  }
  ["dose","ratio","bloom"].forEach(id => $(id).addEventListener("input", updateRecipe));
  updateRecipe();

  function recipeText() {
    const r = recipe();
    return `V60 BREW RECIPE
Coffee: ${r.dose} g
Ratio: 1:${r.ratio}
Water: ${r.total} ml
Temperature: ${$("temp").value}°C
Grind: ${$("grind").value}
Bloom: ${r.bloom} ml
Pour 1: ${Math.round(r.total*.5)} ml cumulative
Pour 2: ${Math.round(r.total*.75)} ml cumulative
Final: ${r.total} ml cumulative
Brew time: ${formatTime(currentTime())}`;
  }
  async function copyText(text, messageId) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement("textarea");
        area.value = text; area.style.position = "fixed"; area.style.opacity = "0";
        document.body.appendChild(area); area.select();
        const ok = document.execCommand("copy"); area.remove();
        if (!ok) throw new Error("Copy failed");
      }
      $(messageId).textContent = "Berhasil disalin!";
    } catch {
      $(messageId).textContent = "Tidak bisa menyalin otomatis. Coba pilih dan salin teks secara manual.";
    }
  }
  $("copyrecipe").addEventListener("click", () => copyText(recipeText(), "copymsg"));

  const STORAGE_KEY = "v60-brew-lab-journals-v1";
  function getHistory() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  }
  function renderHistory() {
    const items = getHistory();
    if (!items.length) {
      $("history").innerHTML = '<p class="muted">Belum ada jurnal tersimpan.</p>';
      return;
    }
    $("history").innerHTML = items.map(item => `
      <div class="history-item">
        <strong>${escapeHTML(item.beans || "Seduhan tanpa nama")} · ${escapeHTML(item.date)}</strong>
        <p>${escapeHTML(item.summary)}</p>
      </div>`).join("");
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }
  function journalText() {
    return `${recipeText()}

TASTING JOURNAL
Beans: ${$("beans").value}
Aroma: ${$("aroma").value}
Acidity: ${$("acidity").value}
Body: ${$("body").value}
Notes: ${$("notes").value}`;
  }
  $("copyjournal").addEventListener("click", () => copyText(journalText(), "journalmsg"));
  $("savejournal").addEventListener("click", () => {
    const now = new Date();
    const entry = {
      beans: $("beans").value.trim(),
      date: now.toLocaleString("id-ID"),
      summary: `Brew ${formatTime(currentTime())} · ${recipe().dose} g / ${recipe().total} ml · ${$("aroma").value} · Acidity ${$("acidity").value} · Body ${$("body").value}\n${$("notes").value}`
    };
    const items = getHistory();
    items.unshift(entry);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0,50)));
      $("journalmsg").textContent = "Jurnal berhasil disimpan di perangkat ini.";
      renderHistory();
    } catch {
      $("journalmsg").textContent = "Penyimpanan gagal. Periksa ruang penyimpanan browser.";
    }
  });
  $("clearhistory").addEventListener("click", () => {
    if (!confirm("Hapus semua riwayat jurnal di perangkat ini?")) return;
    localStorage.removeItem(STORAGE_KEY); renderHistory();
  });
  renderHistory();

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
})();