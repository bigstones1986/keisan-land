(() => {
  "use strict";

  const data = window.EMPLOYEE_DASHBOARD_DATA;
  if (!data) {
    document.body.innerHTML = "<p class=\"empty-state\">データがありません。ダッシュボード更新を実行してください。</p>";
    return;
  }

  const levelLabels = {
    L1: "役割定義",
    L2: "再現可能",
    L3: "品質保証",
    L4: "学習済み",
  };

  const statusLabels = {
    ACTIVE: "稼働予約済み",
    PAUSED: "停止中",
    completed: "完了",
    failed: "失敗",
    blocked: "停止",
    in_progress: "作業中",
  };

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");

  const dateTime = (value) => {
    if (!value) return "未記録";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const minutesFromTime = (value) => {
    const [hour, minute] = value.split(":").map(Number);
    return (hour * 60) + minute;
  };

  const currentMinutes = () => {
    const parts = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return (Number(values.hour) * 60) + Number(values.minute);
  };

  const currentShift = () => {
    const now = currentMinutes();
    return data.operations.shifts.find((shift) => {
      const start = minutesFromTime(shift.window_start);
      const end = minutesFromTime(shift.window_end);
      return now >= start && now <= end;
    }) ?? data.operations.shifts[0];
  };

  const nextRun = () => {
    const now = currentMinutes();
    const ordered = data.operations.shifts
      .map((shift) => ({ ...shift, minutes: minutesFromTime(shift.time) }))
      .sort((a, b) => a.minutes - b.minutes);
    const next = ordered.find((shift) => shift.minutes > now);
    return next ? `次回 ${next.time} ${next.name}` : `次回 明日 ${ordered[0].time} ${ordered[0].name}`;
  };

  const renderSummary = () => {
    const cards = [
      {
        label: "自動勤務",
        value: `${data.summary.active_automations}/${data.operations.shifts.length}`,
        detail: "毎日4交代",
      },
      {
        label: "AI社員",
        value: data.summary.employee_count,
        detail: `L3以上 ${data.summary.quality_assured_count}名`,
      },
      {
        label: "育成済み",
        value: data.summary.trained_count,
        detail: "証拠があるL4のみ",
      },
      {
        label: "社長確認待ち",
        value: data.publishing.ready,
        detail: `公開済み ${data.publishing.published}件`,
      },
    ];
    document.querySelector("#summary-grid").innerHTML = cards.map((card) => `
      <article class="summary-card">
        <span class="label">${escapeHtml(card.label)}</span>
        <strong>${escapeHtml(card.value)}</strong>
        <p class="detail">${escapeHtml(card.detail)}</p>
      </article>
    `).join("");
  };

  const renderCurrentShift = () => {
    const shift = currentShift();
    const automation = data.automations.find((item) => item.id === shift.automation_id);
    document.querySelector("#current-shift-title").textContent = shift.name;
    document.querySelector("#current-shift-mission").textContent = shift.mission;
    document.querySelector("#current-shift-state").textContent =
      automation?.status === "ACTIVE" ? "稼働予約済み" : "設定を確認";
    document.querySelector("#next-run").textContent = nextRun();
  };

  const renderTimeline = () => {
    const current = currentShift().id;
    document.querySelector("#shift-timeline").innerHTML = data.operations.shifts.map((shift) => {
      const automation = data.automations.find((item) => item.id === shift.automation_id);
      const active = automation?.status === "ACTIVE";
      return `
        <article class="shift-item ${shift.id === current ? "is-current" : ""}">
          <span class="shift-time">${escapeHtml(shift.time)}</span>
          <h3>${escapeHtml(shift.name)}</h3>
          <p>${escapeHtml(shift.roles.join("・"))}</p>
          <span class="badge ${active ? "active" : "failed"}">${active ? "有効" : "要確認"}</span>
        </article>
      `;
    }).join("");
  };

  const renderSearch = () => {
    const search = data.search;
    const period = search.periods?.find((item) => item.label === "直近28日") ?? search.periods?.[0];
    if (!period) {
      document.querySelector("#search-status").innerHTML = "<div class=\"empty-state\">検索データは未確認です。</div>";
      return;
    }
    document.querySelector("#search-status").innerHTML = `
      <div class="metric-row">
        <div class="metric"><span>クリック</span><strong>${escapeHtml(period.clicks)}</strong></div>
        <div class="metric"><span>表示回数</span><strong>${escapeHtml(period.impressions)}</strong></div>
        <div class="metric"><span>CTR</span><strong>${escapeHtml(period.ctr)}</strong></div>
        <div class="metric"><span>平均順位</span><strong>${escapeHtml(period.position)}</strong></div>
      </div>
      <p class="bottleneck"><strong>主な詰まり:</strong> ${escapeHtml(search.bottleneck || "未確認")}</p>
    `;
  };

  const activityBlock = (activity) => {
    if (!activity) return "<div class=\"empty-state\">勤務履歴がまだありません。</div>";
    return `
      <article class="activity-summary">
        <p class="meta">${escapeHtml(dateTime(activity.completed_at || activity.started_at))}・${escapeHtml(statusLabels[activity.status] || activity.status)}</p>
        <h3>${escapeHtml(activity.title)}</h3>
        <p class="body">${escapeHtml(activity.summary)}</p>
        <p class="handoff"><strong>次の引き継ぎ:</strong> ${escapeHtml(activity.handoff)}</p>
      </article>
    `;
  };

  const renderLatestActivity = () => {
    document.querySelector("#latest-activity").innerHTML = activityBlock(data.activities[0]);
  };

  const renderEmployees = () => {
    const teamFilter = document.querySelector("#team-filter");
    const levelFilter = document.querySelector("#level-filter");
    const searchInput = document.querySelector("#employee-search");
    const teams = [...new Set(data.employees.map((employee) => employee.team))].sort((a, b) => a.localeCompare(b, "ja"));
    teamFilter.insertAdjacentHTML(
      "beforeend",
      teams.map((team) => `<option value="${escapeHtml(team)}">${escapeHtml(team)}</option>`).join(""),
    );

    const update = () => {
      const keyword = searchInput.value.trim().toLocaleLowerCase("ja");
      const filtered = data.employees.filter((employee) => {
        const teamMatches = teamFilter.value === "all" || employee.team === teamFilter.value;
        const levelMatches = levelFilter.value === "all" || employee.level === levelFilter.value;
        const textMatches = !keyword || employee.role.toLocaleLowerCase("ja").includes(keyword);
        return teamMatches && levelMatches && textMatches;
      });

      document.querySelector("#employee-count").textContent = `${filtered.length}名を表示`;
      document.querySelector("#employee-list").innerHTML = filtered.length
        ? filtered.map((employee) => `
          <article class="employee-card" data-level="${escapeHtml(employee.level)}">
            <div class="employee-level">
              <strong>${escapeHtml(employee.level)}</strong>
              <span>${escapeHtml(levelLabels[employee.level] || "")}</span>
            </div>
            <div class="employee-body">
              <p class="team-name">${escapeHtml(employee.team)}</p>
              <h3>${escapeHtml(employee.role)}</h3>
              <p class="evidence"><strong>できていること:</strong> ${escapeHtml(employee.evidence)}</p>
              <p class="missing"><strong>次の育成:</strong> ${escapeHtml(employee.missing)}</p>
            </div>
          </article>
        `).join("")
        : "<div class=\"empty-state\">条件に合う社員はいません。</div>";
    };

    teamFilter.addEventListener("change", update);
    levelFilter.addEventListener("change", update);
    searchInput.addEventListener("input", update);
    update();
  };

  const renderOperations = () => {
    document.querySelector("#coverage-mode").textContent = data.operations.coverage_mode;
    document.querySelector("#automation-list").innerHTML = data.operations.shifts.map((shift) => {
      const automation = data.automations.find((item) => item.id === shift.automation_id);
      const status = automation?.status ?? "MISSING";
      const active = status === "ACTIVE";
      return `
        <article class="automation-card">
          <div class="automation-head">
            <div>
              <p class="time">毎日 ${escapeHtml(shift.time)}</p>
              <h3>${escapeHtml(shift.name)}</h3>
            </div>
            <span class="badge ${active ? "active" : "failed"}">${escapeHtml(statusLabels[status] || "要確認")}</span>
          </div>
          <p class="mission">${escapeHtml(shift.mission)}</p>
          <p class="roles"><strong>担当:</strong> ${escapeHtml(shift.roles.join("・"))}</p>
        </article>
      `;
    }).join("");

    document.querySelector("#guardrail-list").innerHTML = data.operations.guardrails
      .map((rule) => `<li>${escapeHtml(rule)}</li>`)
      .join("");

    document.querySelector("#inbox-status").innerHTML = `
      <div class="inbox-grid">
        <div class="inbox-cell"><strong>${escapeHtml(data.publishing.ready)}</strong><span>社長確認待ち</span></div>
        <div class="inbox-cell"><strong>${escapeHtml(data.publishing.published)}</strong><span>公開済み</span></div>
        <div class="inbox-cell"><strong>${escapeHtml(data.publishing.green)}</strong><span>安全確認済み</span></div>
      </div>
      <p class="owner-note">公開ボタンを押す最後の操作は社長が担当します。</p>
    `;
  };

  const renderHistory = () => {
    document.querySelector("#activity-list").innerHTML = data.activities.length
      ? data.activities.map((activity) => `
        <article class="activity-entry">
          <div class="activity-meta">
            <span>${escapeHtml(dateTime(activity.completed_at || activity.started_at))}</span>
            <span class="badge ${escapeHtml(activity.status)}">${escapeHtml(statusLabels[activity.status] || activity.status)}</span>
          </div>
          <h3>${escapeHtml(activity.title)}</h3>
          <p class="summary">${escapeHtml(activity.summary)}</p>
          <dl>
            <dt>担当</dt><dd>${escapeHtml(activity.roles.join("・"))}</dd>
            <dt>確認</dt><dd>${escapeHtml(activity.qa)}</dd>
            <dt>引き継ぎ</dt><dd>${escapeHtml(activity.handoff)}</dd>
          </dl>
        </article>
      `).join("")
      : "<div class=\"empty-state\">勤務履歴がまだありません。</div>";
  };

  const setupTabs = () => {
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach((item) => item.classList.toggle("is-active", item === tab));
        document.querySelectorAll(".tab-panel").forEach((panel) => {
          panel.classList.toggle("is-active", panel.dataset.panel === tab.dataset.tab);
        });
      });
    });
  };

  const updateClock = () => {
    document.querySelector("#live-clock").textContent = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).format(new Date());
  };

  document.querySelector("#updated-at").textContent = `データ作成: ${dateTime(data.generated_at)}`;
  document.querySelector("#source-note").textContent = `最新レポート: ${data.search.source_file || "未確認"}`;
  document.querySelector("#refresh-button").addEventListener("click", () => window.location.reload());

  renderSummary();
  renderCurrentShift();
  renderTimeline();
  renderSearch();
  renderLatestActivity();
  renderEmployees();
  renderOperations();
  renderHistory();
  setupTabs();
  updateClock();
  window.setInterval(updateClock, 1000);
})();
