(() => {
  "use strict";

  let data = window.EMPLOYEE_DASHBOARD_DATA;
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
    working: "作業中",
    waiting: "待機",
    watching: "監視中",
    monitoring: "監視中",
    offline: "停止",
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

  const renderSummary = () => {
    const cards = [
      {
        label: "自律監督",
        value: data.summary.supervisor_active ? "稼働中" : "停止",
        detail: data.summary.supervisor_active ? "PC起動中の常駐監視" : "心拍を確認できません",
      },
      {
        label: "AI判断",
        value: `${data.summary.active_automations}/${data.operations.ai_automations.length}`,
        detail: "自律ディレクターと発信担当",
      },
      {
        label: "仕事待ち",
        value: data.summary.ready_tasks,
        detail: `AI社員 ${data.summary.employee_count}名`,
      },
      {
        label: "育成済み",
        value: data.summary.trained_count,
        detail: `L3以上 ${data.summary.quality_assured_count}名`,
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
    const runtime = data.runtime;
    const active = runtime.supervisor_active;
    const title = runtime.current_task?.title
      ?? (active ? "サイトと仕事キューを監視中" : "自律監督エンジンは停止中");
    document.querySelector("#current-shift-title").textContent = title;
    document.querySelector("#current-shift-mission").textContent = active
      ? data.operations.target
      : "実際の心拍を確認できないため、キャラクターも停止しています。";
    document.querySelector("#current-shift-state").textContent = active
      ? (runtime.status === "working" ? "作業中" : "監視中")
      : "停止";
    document.querySelector("#current-shift-state").className =
      `state-label ${active ? "" : "is-offline"}`;
    document.querySelector("#next-run").textContent = runtime.heartbeat_age_seconds === null
      ? "心拍 未確認"
      : `心拍 ${runtime.heartbeat_age_seconds}秒前`;
  };

  let officeAnimationTimer = null;

  const avatarPositions = () => {
    if (window.innerWidth <= 720) {
      return [
        [27, 12], [70, 18],
        [30, 35], [73, 41],
        [28, 59], [70, 65],
        [30, 83], [72, 89],
      ];
    }
    return [
      [18, 24], [35, 34],
      [65, 24], [82, 34],
      [18, 70], [35, 80],
      [65, 70], [82, 80],
    ];
  };

  const renderOffice = () => {
    const floor = document.querySelector("#office-floor");
    const terminal = document.querySelector(".terminal");
    const active = data.runtime.supervisor_active;
    floor.classList.toggle("is-live", active);
    terminal.classList.toggle("is-live", active);
    document.querySelector("#terminal-state").textContent = active ? "LIVE" : "OFFLINE";
    document.querySelector("#office-caption").textContent = active
      ? `${data.runtime.status === "working" ? "作業中" : "監視中"}・心拍 ${data.runtime.heartbeat_age_seconds}秒前`
      : "監督エンジン停止・演出も停止";

    document.querySelectorAll(".office-zone").forEach((zone) => {
      zone.classList.toggle("is-active", active && zone.dataset.zone === data.runtime.active_zone);
    });

    const avatarContainer = document.querySelector("#employee-avatars");
    if (!avatarContainer.children.length) {
      const colors = ["#13795b", "#2463a9", "#4f7a62", "#326f9e", "#a65a12", "#d4821f", "#b13a3a", "#774b8e"];
      avatarContainer.innerHTML = colors.map((color, index) => `
        <div class="employee-avatar" data-avatar="${index}" style="--avatar-color:${color};--delay:${index * -0.17}s">
          <span class="avatar-head"></span>
          <span class="avatar-hair"></span>
          <span class="avatar-body"></span>
          <span class="avatar-legs"></span>
        </div>
      `).join("");
    }

    const moveAvatars = () => {
      const positions = avatarPositions();
      document.querySelectorAll(".employee-avatar").forEach((avatar, index) => {
        const [baseX, baseY] = positions[index];
        const jitter = active ? ((Date.now() / 1000 + index) % 3) - 1 : 0;
        avatar.style.setProperty("--x", `${baseX + jitter}%`);
        avatar.style.setProperty("--y", `${baseY + (active ? (index % 2 ? -1 : 1) : 0)}%`);
      });
    };
    moveAvatars();
    if (officeAnimationTimer) window.clearInterval(officeAnimationTimer);
    officeAnimationTimer = window.setInterval(moveAvatars, 3400);

    const events = [...(data.runtime.recent_events ?? [])].slice(0, 16).reverse();
    document.querySelector("#terminal-stream").innerHTML = events.length
      ? `${events.map((event) => `
          <p class="terminal-line ${escapeHtml(event.level)}">
            <span class="time">[${escapeHtml(dateTime(event.at))}]</span>
            ${escapeHtml(event.message)}
          </p>
        `).join("")}<span class="terminal-cursor" aria-hidden="true"></span>`
      : `<p class="terminal-line">[system] 心拍を待っています<span class="terminal-cursor" aria-hidden="true"></span></p>`;
  };

  const renderQueue = () => {
    const tasks = data.queue.tasks ?? [];
    const ready = tasks.filter((task) => task.status === "ready").length;
    const working = tasks.filter((task) => task.status === "working").length;
    const blocked = tasks.filter((task) => task.status === "blocked").length;
    document.querySelector("#queue-summary").textContent =
      `作業中 ${working}・開始可能 ${ready}・停止 ${blocked}`;
    document.querySelector("#work-queue").innerHTML = tasks.length
      ? tasks.slice(0, 6).map((task) => `
          <article class="queue-card" data-status="${escapeHtml(task.status)}">
            <div class="queue-meta">
              <span class="badge ${escapeHtml(task.status)}">${escapeHtml(statusLabels[task.status] || task.status)}</span>
              <span>優先度 ${escapeHtml(task.priority)}</span>
            </div>
            <h3>${escapeHtml(task.title)}</h3>
            <p class="queue-reason">${escapeHtml(task.reason)}</p>
          </article>
        `).join("")
      : "<div class=\"empty-state\">仕事キューは空です。</div>";
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
    const runtimeCard = `
      <article class="automation-card">
        <div class="automation-head">
          <div>
            <p class="time">常駐プロセス</p>
            <h3>${escapeHtml(data.operations.runtime.name)}</h3>
          </div>
          <span class="badge ${data.runtime.supervisor_active ? "active" : "failed"}">${data.runtime.supervisor_active ? "稼働中" : "停止"}</span>
        </div>
        <p class="mission">${escapeHtml(data.operations.coverage_mode)}</p>
        <p class="roles"><strong>現在:</strong> ${escapeHtml(data.runtime.current_task?.title ?? "監視・待機")}</p>
      </article>
    `;
    const automationCards = data.operations.ai_automations.map((operation) => {
      const automation = data.automations.find((item) => item.id === operation.id);
      const status = automation?.status ?? "MISSING";
      const active = status === "ACTIVE";
      return `
        <article class="automation-card">
          <div class="automation-head">
            <div>
              <p class="time">${escapeHtml(operation.cadence)}</p>
              <h3>${escapeHtml(operation.name)}</h3>
            </div>
            <span class="badge ${active ? "active" : "failed"}">${escapeHtml(statusLabels[status] || "要確認")}</span>
          </div>
          <p class="mission">${escapeHtml(operation.mission)}</p>
        </article>
      `;
    }).join("");
    document.querySelector("#automation-list").innerHTML = runtimeCard + automationCards;

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

  const renderDynamic = () => {
    document.querySelector("#updated-at").textContent = `データ作成: ${dateTime(data.generated_at)}`;
    renderSummary();
    renderCurrentShift();
    renderOffice();
    renderQueue();
    renderSearch();
    renderLatestActivity();
    renderOperations();
    renderHistory();
  };

  let liveDataLoading = false;
  const refreshLiveData = () => {
    if (liveDataLoading) return;
    liveDataLoading = true;
    const script = document.createElement("script");
    script.src = `dashboard-data.js?t=${Date.now()}`;
    script.onload = () => {
      data = window.EMPLOYEE_DASHBOARD_DATA;
      renderDynamic();
      script.remove();
      liveDataLoading = false;
    };
    script.onerror = () => {
      script.remove();
      liveDataLoading = false;
    };
    document.head.append(script);
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
  document.querySelector("#refresh-button").addEventListener("click", refreshLiveData);

  renderDynamic();
  renderEmployees();
  setupTabs();
  updateClock();
  window.setInterval(updateClock, 1000);
  window.setInterval(refreshLiveData, 10000);
})();
