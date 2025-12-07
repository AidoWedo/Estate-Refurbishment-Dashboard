# TODO / Future Enhancements

This document tracks potential improvements and features for the Estate Refurbishment Dashboard.

## Recently Completed 

- [x] **Contractors Integration** - Added Contractors sheet loading and display in Programme tab
- [x] **Health & Safety Integration** - Added H&S warnings display in Projects and Programme tabs
- [x] **H&S Summary in Projects Tab** - Shows highest severity and key warning types for selected project
- [x] **H&S Hotspots Panel** - Programme-level view of projects with High/Medium severity warnings
- [x] **Contractors Panel** - Programme-level overview of contractors with preferred status
- [x] **Project-Contractor Links** - Added ProjectContractors sheet to link contractors to projects with roles
- [x] **Contractors in Project Detail** - Shows assigned contractors with roles and notes in selected project view
- [x] **Contractor Usage Analytics** - Programme tab now shows how many projects each contractor is assigned to
- [x] **Multi-Theme System** - Complete theme architecture with Light, Dark, and Night themes
  - CSS variable-based color system (`--bg-color`, `--text-color`, `--card-color`, etc.)
  - Theme cycling via single button (Light → Dark → Night → Light)
  - Theme icons: sun (light), moon (dark), star (night)
  - All UI components use CSS variable-based Tailwind classes
- [x] **Theme-Aware Charts** - Charts read colors directly from CSS variables
  - All charts automatically adapt when theme changes
  - Chart tooltips use theme-appropriate backgrounds
  - Consistent color palette across all visualizations
- [x] **Animated KPIs** - Statistics animate from 0 to target values on load/reload
- [x] **Project Timeline Chart** - Mini Gantt-style visualization showing project durations
- [x] **Contractor Workload Radar Chart** - Shows projects per trade in radar format
- [x] **H&S Risk Heatmap** - Grid visualization of severity distribution (Low/Medium/High counts)

## High Priority

- [ ] **Contractor Management Enhancements**
  - Filter projects by assigned contractor
  - View full contractor details (contact info, accreditations) in modal or expanded view
  - Assign contractors to tasks
  - Edit contractor-project links (add/remove/update roles)

- [ ] **Health & Safety Enhancements**
  - Full H&S warning detail view (click to expand)
  - Filter projects by H&S severity
  - H&S warning status tracking (Open, Resolved, In Review)
  - Control measures checklist
  - H&S compliance dashboard

- [ ] **Data Persistence**
  - Save task/project status changes back to Excel (or backend)
  - Implement local storage as interim solution
  - Add "Save Changes" button

- [ ] **Error Handling Improvements**
  - Better error messages for missing Excel columns
  - Validation for Excel data format
  - Graceful degradation if Excel file is malformed

- [ ] **Excel File Path Configuration**
  - Allow user to select Excel file via file input
  - Support drag-and-drop Excel file loading
  - Remember last loaded file

## Medium Priority

- [ ] **Export Functionality**
  - Export filtered project list to CSV
  - Export spend table to Excel
  - Print-friendly view

- [ ] **Enhanced Filtering**
  - Filter by asset type
  - Filter by risk rating
  - Filter by H&S severity
  - Filter by contractor
  - Filter by date range
  - Multi-select filters
  - Save filter presets

- [ ] **Search Functionality**
  - Search projects by name
  - Search tasks by title
  - Search by assignee

- [ ] **Sorting**
  - Sort project list by various columns
  - Sort tasks by due date, assignee, status
  - Remember sort preferences

- [ ] **Project Editing**
  - Edit project details inline
  - Add new projects
  - Delete projects (with confirmation)
  - Add/edit/delete tasks
  - Add/edit/delete H&S warnings
  - Assign contractors to projects

- [ ] **Visual Enhancements**
  - Customizable chart colors (user-defined palettes)
  - More chart types (full Gantt view with dependencies)
  - Interactive chart tooltips with more detail
  - Chart export to image/PDF
  - Additional theme options (user-defined themes)
  - Theme preview before applying

## Low Priority / Nice to Have

- [ ] **User Preferences**
  - Remember selected tab
  - Remember selected project
  - Customizable dashboard layout

- [ ] **Notifications**
  - Alert for overdue tasks
  - Alert for projects over budget
  - Alert for high-risk projects
  - Alert for High severity H&S warnings
  - Alert for unresolved H&S issues

- [ ] **Reporting**
  - Generate PDF reports
  - Email reports
  - Scheduled report generation

- [ ] **Collaboration Features**
  - Comments on projects/tasks
  - Activity log/audit trail
  - User assignments and notifications

- [ ] **Performance Optimizations**
  - Lazy loading for large datasets
  - Virtual scrolling for long project lists
  - Debounce filter inputs

- [ ] **Accessibility**
  - ARIA labels and roles
  - Keyboard navigation improvements
  - Screen reader support
  - High contrast mode (could be added as a 4th theme)

- [ ] **Mobile Responsiveness**
  - Optimize for mobile devices
  - Touch-friendly interactions
  - Mobile-specific layouts

- [ ] **Testing**
  - Unit tests for utility functions
  - Integration tests for views
  - E2E tests for critical workflows

- [ ] **Documentation**
  - Code comments and JSDoc
  - User guide/tutorial
  - Developer documentation

- [ ] **Backend Integration**
  - Connect to SharePoint/OneDrive
  - Connect to Dataverse/Power Pages
  - API integration for real-time updates
  - User authentication

- [ ] **Data Validation**
  - Validate dates are logical (end after start)
  - Validate spend amounts are positive
  - Validate required fields
  - Validate H&S severity values (High/Medium/Low)
  - Validate contractor Preferred field format
  - Cross-reference ProjectID in H&S warnings

- [ ] **Bulk Operations**
  - Bulk status updates
  - Bulk assign tasks
  - Bulk export

- [ ] **Advanced Analytics**
  - Trend analysis over time
  - Budget variance analysis
  - Resource utilization charts
  - Enhanced risk heat maps (by project, by site)
  - H&S severity distribution charts (enhanced)
  - Contractor utilization by trade (enhanced)
  - H&S warnings by type visualization (enhanced)
  - Project timeline with dependencies and critical path

- [ ] **Internationalization**
  - Multi-language support
  - Date format localization
  - Currency format localization

## Technical Debt

- [ ] **Code Improvements**
  - Add TypeScript for type safety
  - Consider state management library if complexity grows
  - Add error boundary handling
  - Improve module dependency management

- [ ] **Build Process** (if needed)
  - Add build tooling if bundle size becomes issue
  - Minification for production
  - Source maps for debugging

- [ ] **Browser Compatibility**
  - Test on older browsers if required
  - Add polyfills if needed
  - Fallback for ES modules

## Known Issues

- [ ] Task status changes are not persisted
- [ ] Project status changes are not persisted
- [ ] No validation for Excel file structure
- [ ] Large Excel files may cause performance issues
- [ ] No offline support
- [ ] Contractor-project links are read-only (no editing capability)
- [ ] H&S warnings are read-only (no editing capability)
- [ ] No H&S warning status tracking (all shown as active)

## Ideas for Future Versions

- **Version 2.0**: Backend integration with data persistence
- **Version 2.1**: Multi-user collaboration features
- **Version 2.2**: Full contractor management with assignments and tracking
- **Version 2.3**: Complete H&S management system with compliance tracking
- **Version 3.0**: Full project management suite with scheduling, resources, etc.

---

*Last updated: December 2024*
*Multi-theme system completed: December 2024*
*Feel free to add items or check off completed tasks*

