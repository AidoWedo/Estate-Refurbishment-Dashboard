/**
 * Programme tab view
 * Handles charts, spend table, top risks, contractors, and H&S hotspots
 */

import { projects, contractors, hsWarnings, projectContractorLinks, riskWeight, hsSeverityWeight, getFilteredProjectsForProgramme } from "./state.js";
import { formatMoney, getRiskBadgeClass, getHSSeverityBadgeClass } from "./ui.js";
import { updateAllCharts } from "./charts.js";

export function renderProgrammeSpendTable(filteredProjects = null) {
    const tbody = document.getElementById("programme-spend-body");
    tbody.innerHTML = "";
    const projectsToShow = filteredProjects || projects;
    projectsToShow.forEach(p => {
        const variance = p.projectedSpend - p.budget;
        const row = document.createElement("tr");
        row.className = "border-b border-[var(--border-color)]";
        const varianceClass =
            variance > 0 ? "text-rose-500" : variance < 0 ? "text-emerald-500" : "text-[var(--muted-text)]";
        row.innerHTML = `
        <td class="py-1 pr-3">${p.name}</td>
        <td class="py-1 pr-3 text-right">${formatMoney(p.budget)}</td>
        <td class="py-1 pr-3 text-right">${formatMoney(p.baselineEstimate)}</td>
        <td class="py-1 pr-3 text-right">${formatMoney(p.projectedSpend)}</td>
        <td class="py-1 pr-3 text-right">${formatMoney(p.currentSpend)}</td>
        <td class="py-1 pr-3 text-right ${varianceClass}">
          ${variance === 0 ? "On budget" : (variance > 0 ? "+" : "") + formatMoney(variance).replace("£", "")}
        </td>
      `;
        tbody.appendChild(row);
    });
}

export function renderProgrammeRisks(filteredProjects = null) {
    const container = document.getElementById("programme-risks");
    container.innerHTML = "";
    const projectsToShow = filteredProjects || projects;
    if (!projectsToShow.length) {
        container.innerHTML = '<p class="text-[11px] text-[var(--text-color)] opacity-60 italic">No projects loaded.</p>';
        return;
    }

    const sorted = [...projectsToShow]
        .sort((a, b) => riskWeight(b.riskRating) - riskWeight(a.riskRating))
        .slice(0, 5);

    sorted.forEach(p => {
        const card = document.createElement("div");
        card.className =
            "rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] px-2.5 py-2";
        card.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-1">
          <p class="text-[11px] font-semibold text-[var(--text-color)]">${p.name}</p>
          <span class="inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${getRiskBadgeClass(p.riskRating)}">
            ${p.riskRating || "N/A"}
          </span>
        </div>
        <p class="text-[10px] text-[var(--text-color)] opacity-80">${p.riskSummary || "No risk summary provided."}</p>
      `;
        container.appendChild(card);
    });
}

export function renderProgrammeContractors(filteredProjects = null) {
    const container = document.getElementById("programme-contractors");
    if (!container) return;
    
    container.innerHTML = "";
    
    const projectsToShow = filteredProjects || projects;
    const filteredProjectIds = new Set(projectsToShow.map(p => p.id));
    
    if (!contractors.length || !projectContractorLinks.length) {
        container.innerHTML = '<p class="text-[11px] text-[var(--text-color)] opacity-60 italic">No contractor data linked to projects.</p>';
        return;
    }

    // Count how many distinct projects each contractor is on (only for filtered projects)
    const usageMap = new Map();
    projectContractorLinks.forEach(link => {
        // Only count links for projects in the filtered set
        if (!filteredProjectIds.has(link.projectId)) return;
        if (!usageMap.has(link.contractorId)) {
            usageMap.set(link.contractorId, new Set());
        }
        usageMap.get(link.contractorId).add(link.projectId);
    });

    const rows = contractors.map(c => {
        const projectsSet = usageMap.get(c.contractorId) || new Set();
        return {
            contractor: c,
            projectCount: projectsSet.size
        };
    }).filter(row => row.projectCount > 0)
      .sort((a, b) => b.projectCount - a.projectCount);

    if (rows.length === 0) {
        container.innerHTML = '<p class="text-[11px] text-[var(--text-color)] opacity-60 italic">No contractors assigned to projects.</p>';
        return;
    }

    rows.slice(0, 8).forEach(row => {
        const { contractor, projectCount } = row;
        const card = document.createElement("div");
        card.className = "rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] px-2.5 py-2";
        card.innerHTML = `
        <div class="flex items-center justify-between gap-2">
          <div class="flex-1">
            <p class="text-[11px] font-semibold text-[var(--text-color)]">${contractor.name || contractor.company || "–"}</p>
            <p class="text-[10px] text-[var(--text-color)] opacity-70">${contractor.trade || ""}</p>
          </div>
          <div class="text-right">
            <p class="text-[10px] text-[var(--text-color)] opacity-80">${projectCount} project${projectCount === 1 ? "" : "s"}</p>
            ${contractor.preferred ? '<p class="text-[9px] text-emerald-300">Preferred</p>' : ""}
          </div>
        </div>
      `;
        container.appendChild(card);
    });
}

export function renderProgrammeHSHotspots(filteredProjects = null) {
    const container = document.getElementById("programme-hs-hotspots");
    if (!container) return;
    
    container.innerHTML = "";
    if (!hsWarnings.length) {
        container.innerHTML = '<p class="text-[11px] text-[var(--text-color)] opacity-60 italic">No Health & Safety warnings loaded from the workbook.</p>';
        return;
    }

    const projectsToShow = filteredProjects || projects;
    const filteredProjectIds = new Set(projectsToShow.map(p => p.id));

    // Get projects with High or Medium severity warnings (only for filtered projects)
    const projectWarningsMap = {};
    hsWarnings.forEach(w => {
        // Only include warnings for filtered projects
        if (!filteredProjectIds.has(w.projectId)) return;
        if (!projectWarningsMap[w.projectId]) {
            projectWarningsMap[w.projectId] = [];
        }
        projectWarningsMap[w.projectId].push(w);
    });

    // Build list of projects with their highest severity and warning types
    const projectHSData = Object.keys(projectWarningsMap)
        .map(pid => {
            const pidNum = Number(pid);
            const project = projectsToShow.find(p => p.id === pidNum);
            if (!project) return null;
            
            const warnings = projectWarningsMap[pidNum];
            const highestSeverity = warnings.reduce((highest, w) => {
                const currentWeight = hsSeverityWeight(w.severity);
                const highestWeight = hsSeverityWeight(highest.severity);
                return currentWeight > highestWeight ? w : highest;
            }, warnings[0]);
            
            // Filter to High or Medium only
            if (hsSeverityWeight(highestSeverity.severity) < 2) return null;
            
            const warningTypes = [...new Set(warnings.map(w => w.warningType).filter(Boolean))];
            
            return {
                project,
                highestSeverity: highestSeverity.severity,
                warningTypes
            };
        })
        .filter(Boolean)
        .sort((a, b) => hsSeverityWeight(b.highestSeverity) - hsSeverityWeight(a.highestSeverity))
        .slice(0, 5);

    if (projectHSData.length === 0) {
        container.innerHTML = '<p class="text-[11px] text-[var(--text-color)] opacity-60 italic">No High or Medium severity H&S warnings found.</p>';
        return;
    }

    projectHSData.forEach(({ project, highestSeverity, warningTypes }) => {
        const card = document.createElement("div");
        card.className = "rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] px-2.5 py-2";
        card.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-1">
          <p class="text-[11px] font-semibold text-[var(--text-color)]">${project.name}</p>
          <span class="inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${getHSSeverityBadgeClass(highestSeverity)}">
            ${highestSeverity || "N/A"}
          </span>
        </div>
        <p class="text-[10px] text-[var(--text-color)] opacity-80">${project.site || "Site"} · ${warningTypes.join(", ") || "No warning types"}</p>
      `;
        container.appendChild(card);
    });
}

export function renderHsRiskHeatmap(filteredProjects = null) {
    const container = document.getElementById("hs-risk-heatmap");
    if (!container) return;

    container.innerHTML = "";

    const projectsToShow = filteredProjects || projects;
    const filteredProjectIds = new Set(projectsToShow.map(p => p.id));

    if (!hsWarnings.length) {
        container.innerHTML = '<p class="col-span-3 text-[11px] text-[var(--text-color)] opacity-60 italic">No H&S records.</p>';
        return;
    }

    // Count by severity (only for filtered projects)
    const severityLevels = ["Low", "Medium", "High"];
    const counts = { Low: 0, Medium: 0, High: 0 };

    hsWarnings.forEach(hs => {
        // Only count warnings for filtered projects
        if (!filteredProjectIds.has(hs.projectId)) return;
        const sev = (hs.severity || "").toLowerCase();
        if (sev === "low") counts.Low++;
        else if (sev === "medium") counts.Medium++;
        else if (sev === "high") counts.High++;
    });

    const config = [
        { label: "Low", color: "bg-emerald-500/30 border border-emerald-500/40" },
        { label: "Medium", color: "bg-amber-500/30 border border-amber-500/40" },
        { label: "High", color: "bg-rose-500/30 border border-rose-500/40" }
    ];

    config.forEach(sev => {
        const count = counts[sev.label];
        const cell = document.createElement("div");
        cell.className =
            "flex flex-col items-center justify-center rounded-xl px-2 py-2 " +
            (count ? sev.color : "bg-[var(--card-color)] border border-[var(--border-color)]");
        cell.innerHTML = `
            <div class="text-[10px] font-semibold text-[var(--text-color)]">${sev.label}</div>
            <div class="text-[12px] font-bold text-[var(--text-color)]">${count}</div>
        `;
        container.appendChild(cell);
    });
}

export function updateAllProgrammeViews() {
    // Get current site filter
    const siteFilter = document.getElementById("site-filter")?.value || "all";
    const filteredProjects = getFilteredProjectsForProgramme(siteFilter);
    
    updateAllCharts(filteredProjects, contractors, projectContractorLinks);
    renderProgrammeSpendTable(filteredProjects);
    renderProgrammeRisks(filteredProjects);
    renderProgrammeContractors(filteredProjects);
    renderProgrammeHSHotspots(filteredProjects);
    renderHsRiskHeatmap(filteredProjects);
}

