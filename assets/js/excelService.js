/**
 * Excel loading service using SheetJS
 * Loads estate_projects_template_v3.xlsx and maps to projects, contractors, and H&S warnings
 */

export async function loadDataFromExcel() {
    // Check if XLSX library is loaded
    if (typeof XLSX === 'undefined') {
        throw new Error("XLSX library failed to load. Please check your internet connection and try refreshing the page.");
    }
    
    const res = await fetch("estate_projects_template.xlsx");
    if (!res.ok) {
        throw new Error(`Cannot load Excel file (HTTP ${res.status}). Make sure 'estate_projects_template_v3.xlsx' exists in the same directory.`);
    }
    const buf = await res.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });

    const projSheet = wb.Sheets["Projects"];
    const taskSheet = wb.Sheets["Tasks"];
    if (!projSheet || !taskSheet) {
        throw new Error("Missing Projects or Tasks sheet");
    }

    const projRows = XLSX.utils.sheet_to_json(projSheet);
    const taskRows = XLSX.utils.sheet_to_json(taskSheet);

    // Load Projects and Tasks (existing logic)
    const projectMap = {};
    projRows.forEach(row => {
        const id = Number(row.ID);
        if (!id) return;
        projectMap[id] = {
            id,
            name: row.Name || "",
            assetType: row.AssetType || "",
            assetName: row.AssetName || "",
            site: row.Site || "",
            buildingOrArea: row.BuildingOrArea || "",
            status: row.Status || "Planned",
            startDate: row.StartDate || "",
            endDate: row.EndDate || "",
            owner: row.Owner || "",
            leadUser: row.LeadUser || "",
            currentSpend: Number(row.CurrentSpend) || 0,
            projectedSpend: Number(row.ProjectedSpend) || 0,
            budget: Number(row.Budget) || 0,
            baselineEstimate: Number(row.BaselineEstimate) || 0,
            riskRating: row.RiskRating || "",
            riskSummary: row.RiskSummary || "",
            phaseTasks: []
        };
    });

    taskRows.forEach(row => {
        const pid = Number(row.ProjectID);
        if (!pid || !projectMap[pid]) return;
        projectMap[pid].phaseTasks.push({
            id: `${pid}-${row.Title || ""}`,
            phase: row.Phase || "Pre",
            title: row.Title || "",
            assignee: row.Assignee || "",
            due: row.DueDate || "",
            status: row.Status || "Not Started"
        });
    });

    const projects = Object.values(projectMap);

    // Load Contractors sheet
    const contractorsSheet = wb.Sheets["Contractors"];
    const contractors = [];
    if (contractorsSheet) {
        const contractorRows = XLSX.utils.sheet_to_json(contractorsSheet);
        contractorRows.forEach(row => {
            const contractorId = Number(row.ContractorID);
            if (!contractorId) return;
            const preferredStr = (row.Preferred || "").toString().trim().toLowerCase();
            const preferred = preferredStr === "yes" || preferredStr === "true" || preferredStr === "1";
            contractors.push({
                contractorId,
                name: (row.Name || "").trim(),
                company: (row.Company || "").trim(),
                trade: (row.Trade || "").trim(),
                phone: (row.Phone || "").trim(),
                email: (row.Email || "").trim(),
                accreditations: (row.Accreditations || "").trim(),
                preferred,
                notes: (row.Notes || "").trim()
            });
        });
    }

    // Load HealthAndSafety sheet
    const hsSheet = wb.Sheets["HealthAndSafety"];
    const hsWarnings = [];
    if (hsSheet) {
        const hsRows = XLSX.utils.sheet_to_json(hsSheet);
        hsRows.forEach(row => {
            const hsId = Number(row.HSID);
            const projectId = Number(row.ProjectID);
            if (!hsId) return;
            hsWarnings.push({
                id: hsId,
                projectId,
                warningType: (row.WarningType || "").trim(),
                description: (row.Description || "").trim(),
                severity: (row.Severity || "").trim(),
                location: (row.Location || "").trim(),
                controlMeasures: (row.ControlMeasures || "").trim(),
                notes: (row.Notes || "").trim()
            });
        });
    }

    // Load ProjectContractors sheet
    const linksSheet = wb.Sheets["ProjectContractors"];
    let projectContractorLinks = [];
    if (linksSheet) {
        const linkRows = XLSX.utils.sheet_to_json(linksSheet);
        projectContractorLinks = linkRows.map(row => ({
            linkId: Number(row.LinkID) || 0,
            projectId: Number(row.ProjectID) || 0,
            contractorId: Number(row.ContractorID) || 0,
            role: (row.Role || "").trim(),
            notes: (row.Notes || "").trim()
        })).filter(link => link.linkId > 0 && link.projectId > 0 && link.contractorId > 0);
    }

    return {
        projects,
        contractors,
        hsWarnings,
        projectContractorLinks
    };
}

