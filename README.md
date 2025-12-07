# Estate Refurbishment Dashboard

A single-page web application for managing and visualizing school estate refurbishment projects. This dashboard loads project data from an Excel workbook and provides both detailed project views and programme-level overviews.

## Overview

This application helps estate managers track refurbishment projects across multiple sites and asset types. It displays project information, tasks, spending, risk assessments, contractor assignments, and health & safety warnings in an intuitive dashboard interface.

## Features

### Projects Tab
- **Project List**: View all projects with filtering by status and site
- **Project Details**: Click any project to see:
  - Project metadata (dates, people, spend, risk)
  - **Health & Safety Summary**: Shows highest severity H&S warning and key warning types with locations
  - **Contractors**: Lists all contractors assigned to the project with their roles and notes
  - Tasks organized by phase (Pre-Project, During Project, Post-Project)
  - Interactive task status updates (click status badges to cycle: Not Started → In Progress → Done)
  - Project status management (click status pill to cycle: Planned → In Progress → Completed)

### Programme Tab
- **Visual Analytics**: Multiple Chart.js visualizations:
  - Projects by Site (bar chart)
  - Projects by Asset Type (doughnut chart)
  - Tasks by Assignee (bar chart)
  - **Project Timeline** (mini Gantt-style chart showing project durations)
  - **Contractor Workload** (radar chart showing projects per trade)
- **Spend Table**: Compare budget, baseline, projected, and current spend across all projects
- **Top Risks**: View the 5 highest-risk projects sorted by risk rating
- **Contractors Panel**: Shows contractor usage across projects (how many projects each contractor is assigned to), sorted by activity
- **H&S Hotspots**: View projects with High or Medium severity health & safety warnings, sorted by severity
- **H&S Risk Overview**: Heatmap grid showing severity distribution (Low/Medium/High counts)

### Statistics Dashboard
- **Project Count**: Total number of projects from Excel (animated on load)
- **Task Count**: Total tasks with completion tracking (animated on load)
- **Overall Progress**: Circular progress indicator based on completed tasks (animated on load)

### Theme & Visual Features
- **Multi-Theme Support**: Three beautiful themes to choose from
  - **Light Theme**: Clean, bright interface for daytime use
  - **Dark Theme**: Comfortable dark mode for low-light environments
  - **Night Theme**: Deep navy "blueprint" style for extended viewing
  - Theme preference saved in localStorage
  - Smooth transitions between themes
  - Cycle through themes with a single click
  - All charts and UI elements adapt automatically
- **Animated KPIs**: Statistics animate smoothly from 0 to target values
- **Theme-Aware Charts**: All charts automatically adjust colors for optimal visibility in all themes
  - Charts read colors from CSS variables
  - Automatic chart refresh when theme changes
  - Consistent color palette across all visualizations

## Technical Details

### Architecture
This is a modular front-end application built with:
- **No build tooling** - Pure ES modules, runs directly in the browser
- **Vanilla JavaScript** - No frameworks, easy to understand and modify
- **ES6 Modules** - Clean separation of concerns

### File Structure
```
.
├── index.html              # Main HTML file
├── estate_projects_template.xlsx  # Excel data source (with optional Contractors, H&S, and ProjectContractors sheets)
├── assets/
│   ├── css/
│   │   └── styles.css      # Custom styles with CSS variable theme definitions
│   └── js/
│       ├── main.js         # Entry point (theme initialization)
│       ├── excelService.js # Excel loading & parsing (Projects, Tasks, Contractors, H&S, ProjectContractors)
│       ├── state.js        # State management (projects, contractors, hsWarnings, projectContractorLinks)
│       ├── ui.js           # Shared utilities (formatting, badges, tabs, multi-theme system, animations)
│       ├── charts.js       # Chart.js setup (theme-aware via CSS variables, timeline, radar)
│       ├── projectsView.js # Projects tab logic (includes H&S summary and contractors)
│       └── programmeView.js # Programme tab logic (contractor usage, H&S hotspots, heatmap)
```

### Dependencies (CDN)
- **Tailwind CSS** - Utility-first CSS framework
- **Feather Icons** - Icon library
- **SheetJS (XLSX)** - Excel file parsing
- **Chart.js** - Data visualization

## Getting Started

### Prerequisites
- A modern web browser with ES module support
- An internet connection (for CDN libraries)
- The Excel template file: `estate_projects_template.xlsx`

### Setup
1. Place `estate_projects_template.xlsx` in the same directory as `index.html`
2. Open `index.html` in a web browser
3. The application will automatically load the Excel file on startup

### Excel File Format
The Excel workbook must contain at least two required sheets (Projects and Tasks), with optional sheets for enhanced functionality:

#### Projects Sheet
Required columns:
- `ID` - Unique project identifier (number)
- `Name` - Project name
- `AssetType` - Type of asset (e.g., "Building", "Grounds")
- `AssetName` - Specific asset name
- `Site` - Site location
- `BuildingOrArea` - Building or area identifier
- `Status` - Project status (Planned, In Progress, Completed)
- `StartDate` - Project start date
- `EndDate` - Project end date
- `Owner` - Project owner name
- `LeadUser` - Lead user name
- `CurrentSpend` - Current spending amount
- `ProjectedSpend` - Projected spending amount
- `Budget` - Budget amount
- `BaselineEstimate` - Baseline estimate
- `RiskRating` - Risk rating (High, Medium, Low)
- `RiskSummary` - Risk description

#### Tasks Sheet
Required columns:
- `ProjectID` - Links to Projects.ID
- `Phase` - Task phase (Pre, During, Post)
- `Title` - Task title
- `Assignee` - Person assigned to task
- `DueDate` - Task due date
- `Status` - Task status (Not Started, In Progress, Done)

#### Contractors Sheet (Optional)
Required columns:
- `ContractorID` - Unique contractor identifier (number)
- `Name` - Contractor name
- `Company` - Company name
- `Trade` - Trade/specialty
- `Phone` - Phone number
- `Email` - Email address
- `Accreditations` - Accreditations/certifications
- `Preferred` - Preferred status ("Yes" or "No", case-insensitive)
- `Notes` - Additional notes

#### HealthAndSafety Sheet (Optional)
Required columns:
- `HSID` - Unique H&S warning identifier (number)
- `ProjectID` - Links to Projects.ID
- `WarningType` - Type of warning (e.g., "Asbestos", "Working at Height")
- `Description` - Warning description
- `Severity` - Severity level (High, Medium, Low)
- `Location` - Location of the warning
- `ControlMeasures` - Control measures in place
- `Notes` - Additional notes

#### ProjectContractors Sheet (Optional)
Required columns:
- `LinkID` - Unique link identifier (number)
- `ProjectID` - Links to Projects.ID
- `ContractorID` - Links to Contractors.ContractorID
- `Role` - Contractor's role on the project (e.g., "Main Contractor", "Electrical", "Surfacing")
- `Notes` - Additional notes about the contractor's involvement

## Usage

### Loading Data
- The Excel file loads automatically on page load
- Click "Reload Excel" to refresh data from the file

### Filtering Projects
- Use the **Status** dropdown to filter by project status
- Use the **Site** dropdown to filter by site location
- Filters work together (AND logic)

### Updating Task Status
1. Select a project from the list
2. Find the task in the appropriate phase column
3. Click the status badge to cycle through: Not Started → In Progress → Done
4. Progress statistics update automatically

### Updating Project Status
1. Select a project
2. Click the status pill in the project header
3. Status cycles: Planned → In Progress → Completed
4. Project list and statistics update automatically

### Viewing Programme Overview
1. Click the "Programme" tab
2. View charts and spend analysis
3. Review top risks
4. Browse contractors (sorted with preferred first)
5. Check H&S hotspots for projects with high-severity warnings

### Viewing Health & Safety Information
- **In Projects Tab**: Select a project to see its H&S summary with highest severity and key warning types
- **In Programme Tab**: View the H&S Hotspots panel to see all projects with High or Medium severity warnings

### Viewing Contractor Information
- **In Projects Tab**: Select a project to see all contractors assigned to that project with their roles and notes
- **In Programme Tab**: View the Contractors panel to see contractor usage across all projects (sorted by number of projects)
- **Contractor Workload Radar**: Visual representation of projects per trade in radar chart format

### Using Theme Toggle
- Click the **Theme** button in the header to cycle through themes: Light → Dark → Night → Light
- Theme preference is automatically saved and restored on next visit
- All charts, text, and UI elements adapt to the selected theme
- Charts redraw automatically with theme-appropriate colors
- Icon changes to indicate current theme (sun/moon/star)

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with ES module support

## Notes

- This is a **Proof of Concept (POC)** application
- Data is loaded client-side only (no backend)
- Changes to task/project status are in-memory only (not persisted)
- Contractors, Health & Safety, and ProjectContractors sheets are optional - the app will work without them
- Theme preference is stored in browser localStorage (key: `estate-theme`)
- All colors use CSS variables for dynamic theme switching
- Charts automatically adapt to theme changes via CSS variable reading
- In production, this would connect to OneDrive/SharePoint via Graph API or Dataverse/Power Pages

## Development

### Code Style
- Functions are small and focused
- Variable names match original code where possible
- Code is "school IT friendly" - readable and straightforward

### Adding Features
1. State changes go in `state.js`
2. UI utilities go in `ui.js`
3. View-specific logic goes in `projectsView.js` or `programmeView.js`
4. Chart updates go in `charts.js`
5. New features should follow the existing modular pattern

## License

This is a prototype application for internal use.

