/**
 * Main entry point
 * Initializes the app, loads Excel data, and wires up event handlers
 */

import { loadDataFromExcel } from "./excelService.js";
import { setProjects, setContractors, setHSWarnings, setProjectContractorLinks } from "./state.js";
import { updateStatsUI, initTabs, populateSiteFilter, initThemeButton, getStoredTheme, applyTheme } from "./ui.js";
import { initProjectsView, renderProjectList, renderSelectedProject } from "./projectsView.js";
import { updateAllProgrammeViews } from "./programmeView.js";
import { refreshChartsOnThemeChange } from "./charts.js";

async function bootstrap() {
    try {
        const { projects, contractors, hsWarnings, projectContractorLinks } = await loadDataFromExcel();
        setProjects(projects);
        setContractors(contractors);
        setHSWarnings(hsWarnings);
        setProjectContractorLinks(projectContractorLinks);
        populateSiteFilter(projects);
        updateStatsUI();
        initProjectsView();
        renderProjectList();
        renderSelectedProject();
        updateAllProgrammeViews();
    } catch (err) {
        console.error("Excel loading error:", err);
        const errorMsg = err.message || "Failed to load Excel data";
        alert(`Error: ${errorMsg}\n\nPlease ensure:\n1. The file 'estate_projects_template_v3.xlsx' exists in the same directory\n2. Your internet connection is working (for loading libraries)\n3. Check the browser console for more details`);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Apply stored theme before rendering
    const theme = getStoredTheme();
    applyTheme(theme);

    initThemeButton();
    initTabs(() => updateAllProgrammeViews());
    
    if (window.feather) feather.replace();

    // Register global theme change callback
    window.onThemeChanged = (themeClass) => {
        // charts depend on current theme; just re-render
        // Use a small delay to ensure theme class is applied to DOM
        setTimeout(() => {
            import("./state.js").then(({ projects, contractors, projectContractorLinks }) => {
                refreshChartsOnThemeChange(projects, contractors, projectContractorLinks);
            });
        }, 50);
    };

    // Wait for XLSX to be available before loading Excel
    function waitForXLSX(maxAttempts = 50) {
        if (typeof XLSX !== 'undefined') {
            bootstrap();
        } else if (maxAttempts > 0) {
            // Retry after a short delay (max 5 seconds)
            setTimeout(() => waitForXLSX(maxAttempts - 1), 100);
        } else {
            alert("XLSX library failed to load. Please refresh the page or check your internet connection.");
        }
    }
    waitForXLSX();

    document.getElementById("reload-btn").addEventListener("click", () => {
        waitForXLSX();
    });

    // Wire site filter to update programme view
    const siteFilter = document.getElementById("site-filter");
    if (siteFilter) {
        siteFilter.addEventListener("change", () => {
            // Update programme view when site filter changes
            updateAllProgrammeViews();
        });
    }
});

