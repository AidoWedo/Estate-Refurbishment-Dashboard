/**
 * Shared UI utilities: formatting, stats UI, tabs, theme, animations
 */

import { computeStats } from "./state.js";

// Theme management
const THEMES = ["theme-light", "theme-dark", "theme-night"];
const THEME_KEY = "estate-theme";

export function getStoredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (THEMES.includes(stored)) return stored;
    // default: theme-dark
    return "theme-dark";
}

export function applyTheme(themeClass) {
    const root = document.documentElement;
    // Remove all theme classes
    THEMES.forEach(t => root.classList.remove(t));
    // Add the new theme class
    root.classList.add(themeClass);
    localStorage.setItem(THEME_KEY, themeClass);
    
    // Update feather icons
    if (window.feather) feather.replace();
    
    // Trigger global theme change handler
    if (typeof window.onThemeChanged === "function") {
        window.onThemeChanged(themeClass);
    }
}

export function cycleTheme() {
    const current = getStoredTheme();
    const currentIndex = THEMES.indexOf(current);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    const nextTheme = THEMES[nextIndex];
    applyTheme(nextTheme);
    return nextTheme;
}

export function initThemeButton() {
    const btn = document.getElementById("theme-button");
    if (!btn) return;

    function syncIcon(themeClass) {
        let iconName = "sun";
        if (themeClass === "theme-dark") iconName = "moon";
        else if (themeClass === "theme-night") iconName = "star";
        
        btn.innerHTML = `
            <i data-feather="${iconName}" class="h-3 w-3"></i>
            <span class="hidden sm:inline">Theme</span>
        `;
        if (window.feather) feather.replace();
    }

    // Apply stored theme on init
    const current = getStoredTheme();
    applyTheme(current);
    syncIcon(current);

    btn.addEventListener("click", () => {
        const newTheme = cycleTheme();
        syncIcon(newTheme);
    });
}

// Animation helpers
function animateNumber(el, target, suffix = "", duration = 600) {
    if (!el) return;
    const start = 0;
    const startTime = performance.now();

    function frame(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const value = Math.round(start + (target - start) * progress);
        el.textContent = `${value}${suffix}`;
        if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

export function formatDate(dateStr) {
    if (!dateStr) return "TBC";
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return "TBC";
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export function formatMoney(n) {
    const num = Number(n) || 0;
    return "£" + num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function getStatusPillClass(status) {
    switch (status) {
        case "Planned": return "bg-amber-500/20 text-amber-300 border-amber-500/40";
        case "In Progress": return "bg-sky-500/20 text-sky-200 border-sky-500/40";
        case "Completed": return "bg-emerald-500/20 text-emerald-200 border-emerald-500/40";
        default: return "bg-[var(--subsurface-color)] text-[var(--text-color)] border-[var(--border-color)]";
    }
}

export function getTaskStatusClass(status) {
    switch (status) {
        case "Done": return "bg-emerald-500/20 text-emerald-200 border-emerald-500/40";
        case "In Progress": return "bg-sky-500/20 text-sky-200 border-sky-500/40";
        case "Not Started":
        default: return "bg-[var(--subsurface-color)] text-[var(--text-color)] border-[var(--border-color)]";
    }
}

export function getRiskBadgeClass(rating) {
    switch ((rating || "").toLowerCase()) {
        case "high": return "bg-rose-500/20 text-rose-200 border-rose-500/40";
        case "medium": return "bg-amber-500/20 text-amber-200 border-amber-500/40";
        case "low": return "bg-emerald-500/20 text-emerald-200 border-emerald-500/40";
        default: return "bg-[var(--subsurface-color)] text-[var(--text-color)] border-[var(--border-color)]";
    }
}

export function getHSSeverityBadgeClass(severity) {
    switch ((severity || "").toLowerCase()) {
        case "high": return "bg-rose-500/20 text-rose-200 border-rose-500/40";
        case "medium": return "bg-amber-500/20 text-amber-200 border-amber-500/40";
        case "low": return "bg-emerald-500/20 text-emerald-200 border-emerald-500/40";
        default: return "bg-[var(--subsurface-color)] text-[var(--text-color)] border-[var(--border-color)]";
    }
}

export function updateStatsUI() {
    const stats = computeStats();

    const projEl = document.getElementById("stat-project-count");
    const taskEl = document.getElementById("stat-task-count");
    const taskCompleteEl = document.getElementById("stat-task-complete");
    const progressEl = document.getElementById("stat-progress-percent");
    const circleEl = document.getElementById("progress-circle");

    animateNumber(projEl, stats.projectCount);
    animateNumber(taskEl, stats.taskCount);

    if (taskCompleteEl) {
        taskCompleteEl.textContent = `${stats.completedCount} of ${stats.taskCount}`;
    }

    // animate percentage
    animateNumber(progressEl, stats.progress, "%");

    if (circleEl) {
        const startDash = 0;
        const endDash = stats.progress;

        const startTime = performance.now();
        const duration = 600;

        function frame(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const current = startDash + (endDash - startDash) * progress;
            circleEl.setAttribute("stroke-dasharray", `${current}, 100`);
            if (progress < 1) requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);
    }
}

export function initTabs(onProgrammeTabShown) {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const panels = {
        projects: document.getElementById("tab-projects"),
        programme: document.getElementById("tab-programme")
    };

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.tab;
            tabButtons.forEach(b => {
                b.classList.remove("border-[var(--accent-color)]", "text-[var(--accent-color)]");
                b.classList.add("border-transparent", "text-[var(--text-color)]", "opacity-70");
            });
            btn.classList.remove("border-transparent", "text-[var(--text-color)]", "opacity-70");
            btn.classList.add("border-[var(--accent-color)]", "text-[var(--accent-color)]");

            Object.keys(panels).forEach(key => {
                panels[key].classList.toggle("hidden", key !== target);
            });

            if (target === "programme" && onProgrammeTabShown) {
                onProgrammeTabShown();
            }
        });
    });
}

export function populateSiteFilter(projects) {
    const siteFilter = document.getElementById("site-filter");
    const selected = siteFilter.value || "all";
    siteFilter.innerHTML = '<option value="all">All sites</option>';
    const sites = Array.from(new Set(projects.map(p => p.site))).filter(Boolean).sort();
    sites.forEach(site => {
        const opt = document.createElement("option");
        opt.value = site;
        opt.textContent = site;
        siteFilter.appendChild(opt);
    });
    siteFilter.value = selected;
}

