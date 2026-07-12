/* ============================================================
   曹孟哲律師事務所 — 網頁模擬 v4 共用互動腳本
   純前端demo用，沒有真實後端，資料都是寫死的假資料
   ============================================================ */

// ---------- 手機版導覽選單開關 ----------
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav__toggle");
  const links = document.querySelector(".nav__links");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
  }

  // ---------- 法律知識站 Tabs ----------
  const tabBtns = document.querySelectorAll(".tab-btn");
  if (tabBtns.length) {
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.tab;
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(target)?.classList.add("active");
      });
    });
  }

  initAiChatDemo();
  initAdminDraftDemo();
});

// ============================================================
// AI 法律諮詢 — 純前端demo，模擬「一般問答→偵測案件細節→導向預約」流程
// ============================================================
function initAiChatDemo() {
  const form = document.getElementById("chat-form");
  if (!form) return;

  const input = document.getElementById("chat-input");
  const body = document.getElementById("chat-body");
  const quotaLabel = document.getElementById("chat-quota");

  let quotaRemaining = Number(quotaLabel?.dataset.remaining || 3);

  // 關鍵字判斷「疑似具體案件細節」，僅demo用，非真實NLP
  const caseDetailHints = ["我的案子", "我的案件", "起訴", "開庭", "傳票", "對造", "法官", "判決書字號"];

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    appendBubble(body, text, "user");
    input.value = "";

    if (quotaRemaining <= 0) {
      appendBubble(body, "今日免費額度已用完，升級會員可獲得更多提問額度，或直接預約正式諮詢。", "system");
      return;
    }

    const hasCaseDetail = caseDetailHints.some((k) => text.includes(k));

    setTimeout(() => {
      if (hasCaseDetail) {
        appendBubble(
          body,
          "偵測到您提到具體案件細節。基於律師倫理規範，AI 無法針對個案給予具體法律意見，建議您預約曹律師本人進行正式諮詢。",
          "system"
        );
      } else {
        appendBubble(
          body,
          "（示範回覆）這是一般性的法律科普說明，僅供參考，不構成正式法律意見。實際個案情況建議預約諮詢，由曹律師本人評估。",
          "ai"
        );
        quotaRemaining -= 1;
        updateQuota(quotaLabel, quotaRemaining);
      }
    }, 500);
  });
}

function appendBubble(container, text, type) {
  const div = document.createElement("div");
  div.className = `chat-bubble chat-bubble--${type}`;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function updateQuota(label, remaining) {
  if (!label) return;
  label.textContent = `今日剩餘額度：${Math.max(remaining, 0)} 則`;
}

// ============================================================
// 後台：AI 草稿審核介面 demo
// ============================================================
const DEMO_DRAFTS = [
  {
    id: 1,
    title: "共有物分割訴訟常見爭議與處理流程",
    topic: "不動產訴訟",
    submitted: "2026-07-02 09:15",
    status: "pending",
    content:
      "（AI草稿示範內容）共有物分割是不動產糾紛中常見的類型...\n\n本文將說明common情境下的處理流程，包含協議分割與裁判分割的差異...\n\n【提醒：發布前請曹律師確認法條引用與用詞是否符合律師倫理規範】",
  },
  {
    id: 2,
    title: "遺產分割協議書應注意事項",
    topic: "繼承訴訟",
    submitted: "2026-07-02 14:40",
    status: "pending",
    content:
      "（AI草稿示範內容）遺產分割協議書若記載不完整，可能衍生後續爭議...\n\n本文整理常見的五個注意事項...",
  },
  {
    id: 3,
    title: "公司裁判解散的聲請要件說明",
    topic: "公司法人事務",
    submitted: "2026-07-01 18:02",
    status: "approved",
    content: "（已核准示範內容）公司裁判解散依公司法規定，須符合『公司之經營有顯著困難或重大損害』要件...",
  },
];

function initAdminDraftDemo() {
  const list = document.getElementById("draft-list");
  if (!list) return;

  const detailTitle = document.getElementById("draft-detail-title");
  const detailMeta = document.getElementById("draft-detail-meta");
  const detailBody = document.getElementById("draft-detail-body");
  const approveBtn = document.getElementById("btn-approve");
  const rejectBtn = document.getElementById("btn-reject");
  const publishBtn = document.getElementById("btn-publish");
  const auditLog = document.getElementById("audit-log");

  let selectedId = null;

  function renderList() {
    list.innerHTML = "";
    DEMO_DRAFTS.forEach((d) => {
      const item = document.createElement("div");
      item.className = "draft-item" + (d.id === selectedId ? " selected" : "");
      item.innerHTML = `
        <div>
          <strong>${d.title}</strong>
          <div class="text-muted" style="font-size:0.82rem;">${d.topic} ・ 提交於 ${d.submitted}</div>
        </div>
        <span class="status-pill status-pill--${d.status}">${statusLabel(d.status)}</span>
      `;
      item.addEventListener("click", () => selectDraft(d.id));
      list.appendChild(item);
    });
  }

  function statusLabel(status) {
    return { pending: "待審核", approved: "已核准／已發布", rejected: "已退回" }[status] || status;
  }

  function selectDraft(id) {
    selectedId = id;
    const draft = DEMO_DRAFTS.find((d) => d.id === id);
    detailTitle.textContent = draft.title;
    detailMeta.textContent = `分類：${draft.topic} ｜ 提交時間：${draft.submitted} ｜ 狀態：${statusLabel(draft.status)}`;
    detailBody.value = draft.content;
    document.getElementById("editor-panel").style.display = "block";

    const canAct = draft.status === "pending";
    approveBtn.disabled = !canAct;
    rejectBtn.disabled = !canAct;
    publishBtn.disabled = draft.status !== "approved";

    renderList();
  }

  approveBtn?.addEventListener("click", () => {
    const draft = DEMO_DRAFTS.find((d) => d.id === selectedId);
    if (!draft) return;
    draft.status = "approved";
    draft.content = detailBody.value;
    logAction(`曹律師 核准並修改「${draft.title}」，狀態變更為已核准`);
    selectDraft(draft.id);
  });

  rejectBtn?.addEventListener("click", () => {
    const draft = DEMO_DRAFTS.find((d) => d.id === selectedId);
    if (!draft) return;
    draft.status = "rejected";
    logAction(`曹律師 退回「${draft.title}」`);
    selectDraft(draft.id);
  });

  publishBtn?.addEventListener("click", () => {
    logAction(`（示意）「${DEMO_DRAFTS.find((d) => d.id === selectedId)?.title}」已發布至正式網站`);
  });

  function logAction(text) {
    const li = document.createElement("li");
    const time = new Date().toLocaleTimeString("zh-TW", { hour12: false });
    li.textContent = `[${time}] ${text}`;
    auditLog.prepend(li);
  }

  renderList();
  if (DEMO_DRAFTS.length) selectDraft(DEMO_DRAFTS[0].id);
}
