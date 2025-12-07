/**
 * Projects tab view
 * Handles project list, selected project detail, filters, and task/project status cycling
 */

import {
    projects,
    selectedProjectId,
    setSelectedProject,
    getSelectedProject,
    getFilteredProjects,
    cycleTaskStatus,
    cycleProjectStatus,
    getWarningsForProject,
    getContractorsForProject
} from "./state.js";
import {
    formatDate,
    formatMoney,
    getStatusPillClass,
    getTaskStatusClass,
    getRiskBadgeClass,
    getHSSeverityBadgeClass,
    updateStatsUI,
    populateSiteFilter
} from "./ui.js";
import { updateAllProgrammeViews } from "./programmeView.js";

export function renderProjectList() {
    const list = document.getElementById("project-list");
    list.innerHTML = "";

    const statusFilter = document.getElementById("status-filter").value;
    const siteFilter = document.getElementById("site-filter").value;
    const filtered = getFilteredProjects(statusFilter, siteFilter);

    if (filtered.length === 0) {
        list.innerHTML =
            '<div class="rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--card-color)] px-3 py-4 text-xs text-[var(--text-color)] opacity-70">No projects match this filter.</div>';
        return;
    }

    filtered.forEach(project => {
        const isSelected = project.id === selectedProjectId;
        const baseClasses =
            "group cursor-pointer rounded-2xl border px-3 py-3 text-xs transition shadow-sm hover:shadow-md";
        const selectedClasses = isSelected
            ? "border-[var(--accent-color)]/70 bg-[var(--card-color)] shadow-[var(--accent-color)]/40"
            : "border-[var(--border-color)] bg-[var(--card-color)] hover:border-[var(--accent-color)]/60 hover:bg-[var(--card-color)]";
        const statusClass = getStatusPillClass(project.status);

        const el = document.createElement("article");
        el.className = `${baseClasses} ${selectedClasses}`;
        el.innerHTML = `
        <div class="mb-1 flex items-center justify-between gap-2">
          <h3 class="text-[13px] font-semibold text-[var(--text-color)]">${project.name}</h3>
          <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass}">
            <span class="mr-1 h-1.5 w-1.5 rounded-full bg-current opacity-80"></span>
            ${project.status}
          </span>
        </div>
        <div class="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-color)]">
          <span class="rounded-full bg-[var(--subsurface-color)] px-2 py-0.5 text-[var(--text-color)]">${project.assetType || "Asset"}</span>
          <span class="rounded-full bg-[var(--subsurface-color)] px-2 py-0.5 text-[var(--text-color)]">${project.site || "No site"}</span>
        </div>
        <div class="mt-2 flex items-center justify-between text-[11px] text-[var(--muted-text)]">
          <span>${project.assetName || ""}</span>
          <span>${formatDate(project.startDate)} → ${formatDate(project.endDate)}</span>
        </div>
      `;

        el.addEventListener("click", () => {
            setSelectedProject(project.id);
            renderProjectList();
            renderSelectedProject();
        });

        list.appendChild(el);
    });
}

export function renderSelectedProject() {
    const project = getSelectedProject();
    const titleEl = document.getElementById("selected-title");
    const breadcrumbEl = document.getElementById("selected-breadcrumb");
    const statusPillEl = document.getElementById("selected-status-pill");
    const metaEl = document.getElementById("selected-meta");

    const colPre = document.getElementById("column-pre");
    const colDuring = document.getElementById("column-during");
    const colPost = document.getElementById("column-post");

    const badgePre = document.getElementById("badge-pre");
    const badgeDuring = document.getElementById("badge-during");
    const badgePost = document.getElementById("badge-post");

    const contractorsEl = document.getElementById("selected-contractors");
    
    if (!project) {
        titleEl.textContent = "No project selected";
        breadcrumbEl.textContent = "Select a project to view details";
        statusPillEl.className =
            "inline-flex items-center rounded-full border border-[var(--border-color)] bg-[var(--card-color)] px-3 py-1 text-xs font-medium text-[var(--text-color)] cursor-default";
        statusPillEl.disabled = true;
        statusPillEl.innerHTML = `Status: <span class="ml-1 font-semibold text-[var(--text-color)]">–</span>`;
        metaEl.innerHTML = "";
        [colPre, colDuring, colPost].forEach(c => (c.innerHTML = ""));
        [badgePre, badgeDuring, badgePost].forEach(b => (b.textContent = "0"));
        if (contractorsEl) contractorsEl.innerHTML = "";
        return;
    }

    titleEl.textContent = project.name;
    breadcrumbEl.textContent =
        `${project.site || "Site"} · ${project.buildingOrArea || ""} · ${project.assetType || ""}`;

    const statusClass = getStatusPillClass(project.status);
    statusPillEl.className =
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium cursor-pointer " +
        statusClass;
    statusPillEl.disabled = false;
    statusPillEl.innerHTML = `
      Status:
      <span class="ml-1 font-semibold">${project.status}</span>
    `;
    statusPillEl.onclick = () => {
        cycleProjectStatus(project);
        updateStatsUI();
        renderProjectList();
        renderSelectedProject();
        updateAllProgrammeViews();
    };

    // Get H&S warnings for this project
    const warnings = getWarningsForProject(project.id);
    const highestSeverity = warnings.length > 0 
        ? warnings.reduce((highest, w) => {
            const currentWeight = (w.severity || "").toLowerCase() === "high" ? 3 
                : (w.severity || "").toLowerCase() === "medium" ? 2 
                : (w.severity || "").toLowerCase() === "low" ? 1 : 0;
            const highestWeight = (highest.severity || "").toLowerCase() === "high" ? 3 
                : (highest.severity || "").toLowerCase() === "medium" ? 2 
                : (highest.severity || "").toLowerCase() === "low" ? 1 : 0;
            return currentWeight > highestWeight ? w : highest;
        }, warnings[0])
        : null;

    let hsSummaryHTML = "";
    if (warnings.length === 0) {
        hsSummaryHTML = `
        <p class="text-[11px] text-[var(--text-color)] opacity-70 italic">No Health & Safety warnings recorded for this project.</p>
      `;
    } else {
        const warningTypes = [...new Set(warnings.map(w => w.warningType).filter(Boolean))].slice(0, 3);
        const warningList = warningTypes.map(wt => {
            const warning = warnings.find(w => w.warningType === wt);
            const location = warning?.location || "";
            return `${wt}${location ? ` – ${location}` : ""}`;
        }).join("<br>");
        
        hsSummaryHTML = `
        <p class="mt-1 text-[11px]">
          <span class="inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${getHSSeverityBadgeClass(highestSeverity.severity)}">
            H&S: ${highestSeverity.severity || "N/A"}
          </span>
        </p>
        <p class="mt-1 text-[10px] text-[var(--text-color)] opacity-80">
          ${warningList}
        </p>
      `;
    }

    metaEl.innerHTML = `
      <div class="rounded-xl bg-[var(--card-color)] p-2.5">
        <p class="text-[11px] font-semibold text-[var(--text-color)]">Dates</p>
        <p class="mt-1 text-[11px] text-[var(--text-color)] opacity-90">
          ${formatDate(project.startDate)} – ${formatDate(project.endDate)}
        </p>
      </div>
      <div class="rounded-xl bg-[var(--card-color)] p-2.5">
        <p class="text-[11px] font-semibold text-[var(--text-color)]">People</p>
        <p class="mt-1 text-[11px] text-[var(--text-color)] opacity-90">Owner: ${project.owner || "–"}</p>
        <p class="text-[11px] text-[var(--text-color)] opacity-70">Lead user: ${project.leadUser || "–"}</p>
      </div>
      <div class="rounded-xl bg-[var(--card-color)] p-2.5">
        <p class="text-[11px] font-semibold text-[var(--text-color)]">Spend & Risk</p>
        <p class="mt-1 text-[11px] text-[var(--text-color)] opacity-90">
          Budget: ${formatMoney(project.budget)} · Baseline: ${formatMoney(project.baselineEstimate)}
        </p>
        <p class="text-[11px] text-[var(--text-color)] opacity-90">
          Projected: ${formatMoney(project.projectedSpend)} · Current: ${formatMoney(project.currentSpend)}
        </p>
        <p class="mt-1 text-[11px]">
          <span class="inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${getRiskBadgeClass(project.riskRating)}">
            Risk: ${project.riskRating || "N/A"}
          </span>
        </p>
      </div>
      <div class="rounded-xl bg-[var(--card-color)] p-2.5">
        <p class="text-[11px] font-semibold text-[var(--text-color)]">Health & Safety</p>
        ${hsSummaryHTML}
      </div>
    `;

    colPre.innerHTML = "";
    colDuring.innerHTML = "";
    colPost.innerHTML = "";

    const phases = { Pre: [], During: [], Post: [] };
    project.phaseTasks.forEach(t => {
        if (phases[t.phase]) phases[t.phase].push(t);
    });

    badgePre.textContent = phases.Pre.length;
    badgeDuring.textContent = phases.During.length;
    badgePost.textContent = phases.Post.length;

    function renderTask(task, phaseColumn) {
        const card = document.createElement("div");
        card.className =
            "rounded-xl border px-2.5 py-2 shadow-sm bg-[var(--card-color)] border-[var(--border-color)] hover:border-[var(--accent-color)]/50 transition";
        card.innerHTML = `
        <div class="mb-1 flex items-center justify-between gap-2">
          <p class="text-[11px] font-semibold text-[var(--text-color)]">${task.title}</p>
          <button
            type="button"
            class="rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${getTaskStatusClass(task.status)}"
            title="Click to change task status"
          >
            ${task.status}
          </button>
        </div>
        <div class="flex items-center justify-between text-[10px] text-[var(--text-color)] opacity-70">
          <span>Due: ${formatDate(task.due)}</span>
          <span>${task.assignee || "Unassigned"}</span>
        </div>
      `;
        const statusBtn = card.querySelector("button");
        statusBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            cycleTaskStatus(task);
            updateStatsUI();
            renderSelectedProject();
            renderProjectList();
            updateAllProgrammeViews();
        });
        phaseColumn.appendChild(card);
    }

    if (phases.Pre.length === 0) {
        colPre.innerHTML = '<p class="text-[11px] text-[var(--text-color)] opacity-60 italic">No pre-project tasks.</p>';
    } else {
        phases.Pre.forEach(t => renderTask(t, colPre));
    }
    if (phases.During.length === 0) {
        colDuring.innerHTML = '<p class="text-[11px] text-[var(--text-color)] opacity-60 italic">No during-project tasks.</p>';
    } else {
        phases.During.forEach(t => renderTask(t, colDuring));
    }
    if (phases.Post.length === 0) {
        colPost.innerHTML = '<p class="text-[11px] text-[var(--text-color)] opacity-60 italic">No post-project tasks.</p>';
    } else {
        phases.Post.forEach(t => renderTask(t, colPost));
    }

    // Render contractors section
    if (contractorsEl) {
        const projectContractors = getContractorsForProject(project.id);
        
        if (projectContractors.length === 0) {
            contractorsEl.innerHTML =
                '<p class="text-[11px] text-[var(--text-color)] opacity-60 italic">No contractors linked to this project.</p>';
        } else {
            contractorsEl.innerHTML = `
                <p class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-color)]">Contractors</p>
                <div class="space-y-1.5">
                    ${projectContractors.map(pc => `
                        <div class="flex items-start justify-between gap-2 rounded-xl bg-[var(--card-color)] px-2 py-1.5 border border-[var(--border-color)]">
                            <div class="flex-1">
                                <p class="text-[11px] text-[var(--text-color)]">
                                    ${pc.name || pc.company || "Contractor"} 
                                    <span class="opacity-70">· ${pc.role || ""}</span>
                                </p>
                                <p class="text-[10px] text-[var(--text-color)] opacity-70">
                                    ${pc.company || ""} ${pc.trade ? " · " + pc.trade : ""}
                                </p>
                                ${pc.notes ? `<p class="mt-0.5 text-[10px] text-[var(--text-color)] opacity-70">${pc.notes}</p>` : ""}
                            </div>
                            ${pc.preferred ? `
                                <span class="mt-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-semibold text-emerald-200 border border-emerald-500/40 whitespace-nowrap">
                                    Preferred
                                </span>` : ""}
                        </div>
                    `).join("")}
                </div>
            `;
        }
    }
}

export function initProjectsView() {
    // Filter event listeners
    document.getElementById("status-filter").addEventListener("change", () => {
        renderProjectList();
        const statusFilter = document.getElementById("status-filter").value;
        const siteFilter = document.getElementById("site-filter").value;
        const filtered = getFilteredProjects(statusFilter, siteFilter);
        if (!filtered.find(p => p.id === selectedProjectId)) {
            setSelectedProject(filtered[0]?.id ?? null);
        }
        renderSelectedProject();
    });

    document.getElementById("site-filter").addEventListener("change", () => {
        renderProjectList();
        const statusFilter = document.getElementById("status-filter").value;
        const siteFilter = document.getElementById("site-filter").value;
        const filtered = getFilteredProjects(statusFilter, siteFilter);
        if (!filtered.find(p => p.id === selectedProjectId)) {
            setSelectedProject(filtered[0]?.id ?? null);
        }
        renderSelectedProject();
    });
}

