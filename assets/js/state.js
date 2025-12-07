/**
 * Global state management
 * Maintains projects array, selectedProjectId, contractors, H&S warnings, and helper functions
 */

export let projects = [];
export let selectedProjectId = null;
export let contractors = [];
export let hsWarnings = [];
export let projectContractorLinks = [];

export function setProjects(newProjects) {
    projects = newProjects;
    if (projects.length > 0 && !selectedProjectId) {
        selectedProjectId = projects[0].id;
    }
}

export function setSelectedProject(id) {
    selectedProjectId = id;
}

export function getSelectedProject() {
    return projects.find(p => p.id === selectedProjectId);
}

export function getFilteredProjects(statusFilter, siteFilter) {
    return projects.filter(p =>
        (statusFilter === "all" || p.status === statusFilter) &&
        (siteFilter === "all" || p.site === siteFilter)
    );
}

export function getFilteredProjectsForProgramme(siteFilter) {
    if (siteFilter === "all") {
        return projects;
    }
    return projects.filter(p => p.site === siteFilter);
}

export function computeStats() {
    let taskCount = 0;
    let completedCount = 0;
    projects.forEach(p => {
        p.phaseTasks.forEach(t => {
            taskCount++;
            if (t.status === "Done") completedCount++;
        });
    });
    const progress = taskCount === 0 ? 0 : Math.round((completedCount / taskCount) * 100);
    return { projectCount: projects.length, taskCount, completedCount, progress };
}

export function cycleTaskStatus(task) {
    const order = ["Not Started", "In Progress", "Done"];
    let idx = order.indexOf(task.status);
    if (idx === -1) idx = 0;
    task.status = order[(idx + 1) % order.length];
}

export function cycleProjectStatus(project) {
    const order = ["Planned", "In Progress", "Completed"];
    let idx = order.indexOf(project.status);
    if (idx === -1) idx = 0;
    project.status = order[(idx + 1) % order.length];
}

export function setContractors(newContractors) {
    contractors = newContractors || [];
}

export function setHSWarnings(newWarnings) {
    hsWarnings = newWarnings || [];
}

export function setProjectContractorLinks(newLinks) {
    projectContractorLinks = newLinks || [];
}

export function getWarningsForProject(projectId) {
    return hsWarnings.filter(w => w.projectId === projectId);
}

export function getProjectContractorLinks(projectId) {
    return projectContractorLinks.filter(link => link.projectId === projectId);
}

export function getContractorsForProject(projectId) {
    const links = getProjectContractorLinks(projectId);
    return links.map(link => {
        const contractor = contractors.find(c => c.contractorId === link.contractorId);
        return {
            linkId: link.linkId,
            projectId: link.projectId,
            role: link.role,
            notes: link.notes,
            contractorId: contractor?.contractorId ?? link.contractorId,
            name: contractor?.name || "",
            company: contractor?.company || "",
            trade: contractor?.trade || "",
            phone: contractor?.phone || "",
            email: contractor?.email || "",
            accreditations: contractor?.accreditations || "",
            preferred: contractor?.preferred ?? false
        };
    });
}

export function riskWeight(rating) {
    const r = (rating || "").toLowerCase();
    if (r === "high") return 3;
    if (r === "medium") return 2;
    if (r === "low") return 1;
    return 0;
}

export function hsSeverityWeight(severity) {
    const s = (severity || "").toLowerCase();
    if (s === "high") return 3;
    if (s === "medium") return 2;
    if (s === "low") return 1;
    return 0;
}

