/**
 * Chart.js setup and chart update functions
 * Encapsulates all Chart.js usage
 */

const charts = { site: null, asset: null, resource: null, timeline: null, contractorRadar: null };

function destroyIfExists(chart) {
    if (chart) chart.destroy();
}

// Theme-aware color helpers - reads from CSS variables
function chartColors() {
    const cs = getComputedStyle(document.documentElement);
    const cardColor = cs.getPropertyValue("--card-color").trim();
    // Convert rgba to a more opaque version for tooltips
    let tooltipBg = "rgba(15, 23, 42, 0.95)"; // default
    if (cardColor.includes("rgba")) {
        // Extract rgba values and set alpha to 0.95
        const match = cardColor.match(/rgba?\(([^)]+)\)/);
        if (match) {
            const values = match[1].split(",").map(v => v.trim());
            if (values.length >= 3) {
                tooltipBg = `rgba(${values[0]}, ${values[1]}, ${values[2]}, 0.95)`;
            }
        }
    } else if (cardColor) {
        tooltipBg = cardColor;
    }
    
    return {
        text: cs.getPropertyValue("--text-color").trim(),
        grid: cs.getPropertyValue("--border-color").trim(),
        accent: cs.getPropertyValue("--accent-color").trim(),
        card: tooltipBg,
        datasetColors: [
            cs.getPropertyValue("--accent-color").trim(),
            "#7c3aed", // purple-600
            "#16a34a", // emerald-600
            "#f97316", // orange-500
            "#ef4444", // red-500
        ]
    };
}

export function updateChartsProjectsBySite(projects) {
    const ctx = document.getElementById("chart-site").getContext("2d");
    const counts = {};
    projects.forEach(p => {
        const site = p.site || "Unknown";
        counts[site] = (counts[site] || 0) + 1;
    });
    const labels = Object.keys(counts);
    const data = Object.values(counts);
    const colors = chartColors();

    destroyIfExists(charts.site);
    charts.site = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Projects",
                data,
                backgroundColor: colors.datasetColors[0]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                    labels: { color: colors.text }
                },
                tooltip: {
                    enabled: true,
                    titleColor: colors.text,
                    bodyColor: colors.text,
                    backgroundColor: colors.card,
                    borderColor: colors.grid,
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: { 
                        color: colors.text,
                        font: { size: 11 }
                    },
                    grid: { color: colors.grid }
                },
                y: {
                    ticks: { 
                        color: colors.text,
                        font: { size: 11 }
                    },
                    grid: { color: colors.grid },
                    beginAtZero: true
                }
            }
        }
    });
}

export function updateChartsProjectsByAssetType(projects) {
    const ctx = document.getElementById("chart-asset").getContext("2d");
    const counts = {};
    projects.forEach(p => {
        const type = p.assetType || "Unknown";
        counts[type] = (counts[type] || 0) + 1;
    });
    const labels = Object.keys(counts);
    const data = Object.values(counts);
    const colors = chartColors();

    destroyIfExists(charts.asset);
    charts.asset = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors.datasetColors
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { 
                        color: colors.text, 
                        boxWidth: 10,
                        font: { size: 11 },
                        padding: 8
                    }
                },
                tooltip: {
                    enabled: true,
                    titleColor: colors.text,
                    bodyColor: colors.text,
                    backgroundColor: colors.card,
                    borderColor: colors.grid,
                    borderWidth: 1
                }
            }
        }
    });
}

export function updateChartsTasksByAssignee(projects) {
    const ctx = document.getElementById("chart-resource").getContext("2d");
    const counts = {};
    projects.forEach(p => {
        p.phaseTasks.forEach(t => {
            const person = t.assignee || "Unassigned";
            counts[person] = (counts[person] || 0) + 1;
        });
    });
    const labels = Object.keys(counts);
    const data = Object.values(counts);
    const colors = chartColors();

    destroyIfExists(charts.resource);
    charts.resource = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Tasks",
                data,
                backgroundColor: colors.datasetColors[1]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                    labels: { color: colors.text }
                },
                tooltip: {
                    enabled: true,
                    titleColor: colors.text,
                    bodyColor: colors.text,
                    backgroundColor: colors.card,
                    borderColor: colors.grid,
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: { 
                        color: colors.text,
                        font: { size: 11 }
                    },
                    grid: { color: colors.grid }
                },
                y: {
                    ticks: { 
                        color: colors.text,
                        font: { size: 11 }
                    },
                    grid: { color: colors.grid },
                    beginAtZero: true
                }
            }
        }
    });
}

export function updateTimelineChart(projects) {
    const canvas = document.getElementById("chart-timeline");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (charts.timeline) charts.timeline.destroy();

    const colors = chartColors();

    // Find min and max dates
    const parsedProjects = projects
        .filter(p => p.startDate && p.endDate)
        .map(p => {
            const start = new Date(p.startDate + "T00:00:00");
            const end = new Date(p.endDate + "T00:00:00");
            return { project: p, start, end };
        })
        .sort((a, b) => a.start - b.start);

    if (!parsedProjects.length) return;

    const labels = parsedProjects.map(p => p.project.name);
    const durations = parsedProjects.map(p => p.end.getTime() - p.start.getTime());
    const backgroundColors = parsedProjects.map((_, idx) => colors.datasetColors[idx % colors.datasetColors.length]);

    charts.timeline = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Duration",
                data: durations,
                backgroundColor: backgroundColors
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    titleColor: colors.text,
                    bodyColor: colors.text,
                    backgroundColor: colors.card,
                    borderColor: colors.grid,
                    borderWidth: 1,
                    callbacks: {
                        label: (ctx) => {
                            const proj = parsedProjects[ctx.dataIndex].project;
                            return `${proj.site || ""} ${proj.startDate} → ${proj.endDate}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { 
                        color: colors.text,
                        font: { size: 11 }
                    },
                    grid: { color: colors.grid },
                    title: {
                        display: true,
                        text: "Duration (ms)",
                        color: colors.text,
                        font: { size: 11 }
                    }
                },
                y: {
                    ticks: { 
                        color: colors.text,
                        font: { size: 10 }
                    },
                    grid: { color: colors.grid }
                }
            }
        }
    });
}

export function updateContractorRadarChart(contractors, projectContractorLinks) {
    const canvas = document.getElementById("chart-contractor-radar");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (charts.contractorRadar) charts.contractorRadar.destroy();

    const colors = chartColors();

    // Count how many projects per trade
    const usageByTrade = new Map(); // trade -> Set(projectId)

    projectContractorLinks.forEach(link => {
        const contractor = contractors.find(c => c.contractorId === link.contractorId);
        const trade = contractor?.trade || "Other";
        if (!usageByTrade.has(trade)) usageByTrade.set(trade, new Set());
        usageByTrade.get(trade).add(link.projectId);
    });

    const labels = Array.from(usageByTrade.keys());
    const data = labels.map(trade => usageByTrade.get(trade).size);

    if (!labels.length) return;

    charts.contractorRadar = new Chart(ctx, {
        type: "radar",
        data: {
            labels,
            datasets: [{
                label: "Projects per trade",
                data,
                borderColor: colors.datasetColors[0],
                backgroundColor: colors.datasetColors[0] + "33", // add alpha
                pointBackgroundColor: colors.datasetColors[0]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                    labels: { color: colors.text }
                },
                tooltip: {
                    enabled: true,
                    titleColor: colors.text,
                    bodyColor: colors.text,
                    backgroundColor: colors.card,
                    borderColor: colors.grid,
                    borderWidth: 1
                }
            },
                scales: {
                    r: {
                        angleLines: { color: colors.grid },
                        grid: { color: colors.grid },
                        pointLabels: { 
                            color: colors.text,
                            font: { size: 11 }
                        },
                        ticks: { 
                            color: colors.text, 
                            backdropColor: "transparent",
                            font: { size: 10 }
                        },
                        beginAtZero: true
                    }
                }
        }
    });
}

export function refreshChartsOnThemeChange(projects, contractors = [], projectContractorLinks = []) {
    // Destroy all charts first to ensure clean state
    if (charts.site) charts.site.destroy();
    if (charts.asset) charts.asset.destroy();
    if (charts.resource) charts.resource.destroy();
    if (charts.timeline) charts.timeline.destroy();
    if (charts.contractorRadar) charts.contractorRadar.destroy();
    
    // Reset chart references
    charts.site = null;
    charts.asset = null;
    charts.resource = null;
    charts.timeline = null;
    charts.contractorRadar = null;
    
    // Recreate all charts with new theme colors
    updateAllCharts(projects, contractors, projectContractorLinks);
}

export function updateAllCharts(projects, contractors = [], projectContractorLinks = []) {
    updateChartsProjectsBySite(projects);
    updateChartsProjectsByAssetType(projects);
    updateChartsTasksByAssignee(projects);
    updateTimelineChart(projects);
    updateContractorRadarChart(contractors, projectContractorLinks);
}

