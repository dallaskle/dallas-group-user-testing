# Admin Dashboard Enhancements

Below is a structured overview of proposed improvements to the Admin Dashboard to provide admins with complete visibility and control over the application. Each section aligns with the PRD requirements, existing code, and key admin needs.

---

## 1. Admin Dashboard: High-Level Overview

**Purpose**:  
Provide a centralized platform for admins to monitor and manage the application's projects, testers, tickets, and validation activities.

**Goals**:  
- Quickly identify problems or bottlenecks (e.g., overdue tickets, failing validations).  
- Offer tools to resolve or escalate issues (e.g., reassign tickets, update statuses).  
- Monitor the overall health of projects, testers, and tickets.  

---

## 2. Tabs Breakdown & Proposed Features

### 2.1 Overview Tab

#### Current State
- Three “Summary Cards” (Total Projects, Total Features, Pending Validations).  
- Two widgets: `ProjectProgress` and `TesterMetrics`.  

#### Proposed Enhancements
- **Global Metrics Row**:  
  Expand summary cards to include:
  - Total Projects.
  - Total Features.
  - Pending Validations (linked to relevant details).
  - Total Testers / Active Testers.
  - Daily/Weekly “New Projects” trend.

- **Recent Activity Feed**:  
  - Display 5–10 notable events (e.g., new projects, validations, high-priority tickets).  
  - Clickable items navigate to related projects, features, or tickets.  

- **ProjectProgress**:  
  - Expand to global data (e.g., stacked bar or pie chart for feature statuses like “In Progress,” “Not Started,” “Successful,” “Failed”).  

- **TesterMetrics**:  
  - Populate with real data, such as:
    - Open/closed ticket ratios.
    - Average validation time.
    - QA scores from `QA Scorecard`.  
  - Highlight top vs. low-participation testers.

---

### 2.2 Project Registry Tab

#### Current State
- Displays all project registries using `<ProjectRegistryCard />`.
- Allows creating new templates.

#### Proposed Enhancements
- **Recent Projects List**:
  - Show latest student-created projects with:
    - Registry name of origin.
    - Feature count.
    - Quick link to project details.
    - Validation status summary.

- **Registry Statistics**:
  - Add stats to `<ProjectRegistryCard />`:
    - Total features in the registry.
    - Number of projects created from it.
    - Link to view all related projects.

- **Search & Sort**:
  - Add search bar or sorting by name, creation date, or usage count.

---

### 2.3 Testers Tab

#### Current State
- Placeholder with `QA Scorecard` and `TesterMetrics`.

#### Proposed Enhancements
- **List of All Testers**:
  - Display a table with columns for:
    - Name, Email, Validations Completed, Tickets Assigned, QA Score.
  - Add search functionality.

- **Tester Workloads**:
  - Show open ticket counts and assigned/completed validation ratios.
  - Include links to “Detailed Tester Profiles” with:
    - Assigned features, tickets, and validation history.

- **Past Validations**:
  - Sub-section for recent validations:
    - Filter/group by tester, date range, or project.
    - Option to override/finalize feature statuses.

- **Outstanding Tickets**:
  - Summary of tickets assigned to testers.
  - Tools to identify overloaded testers and reassign tickets.

---

### 2.4 Tickets Tab

#### Current State
- Loads `<TicketsPage />` with a ticket list and audit log.

#### Proposed Enhancements
- **Search or Filter Tickets**:
  - Add filters for ticket ID, feature name, project, priority, or tester.  
  - Include advanced filters for open/closed, overdue, or high-priority tickets.

- **Enhanced Ticket Creation**:
  - Allow admins to quickly create tickets:
    - Title, description, priority, assigned user, due date, project/feature.

- **Editable Ticket Fields**:
  - Inline editing or modal for:
    - Priority (Low/Medium/High).
    - Status (Open/In Progress/Resolved).
    - Assignee changes.

- **Audit Log Search**:
  - Expand to filter by date range, user, project, or ticket ID.  

- **Ticket Metrics**:
  - Display:
    - Total tickets.
    - Average resolution time.
    - Blocked/overdue tickets.

---

## 3. Additional Ideas & Enhancements

- **Global Search/Command Bar**:  
  - Universal search for projects, features, testers, and tickets.  

- **Admin Tools Menu**:  
  - Collapsible menu for:  
    - Role management (e.g., promote to admin/tester).  
    - Bulk import/export of features or registries.  
    - Access system logs or analytics.  

- **Reporting & Analytics**:
  - Summarize validation progress for each project.  
  - Auto-generate weekly/monthly reports for admins.  

- **QA Scorecards**:
  - Add line charts or gauges for tester performance trends.  

- **Integration with Other Dashboards**:
  - Admins can impersonate students or access user-level data.

- **Permissions Flexibility**:
  - Allow admins to override feature or project statuses with audit tracking.

---

## 4. Implementation Details (High-Level Workflow)

### Overview Tab
- Fetch aggregated data: `totalProjects`, `totalFeatures`, `totalValidations`, `activeTesters`.  
- Load global event feed and render in summary cards/charts.

### Project Registry Tab
- Fetch registries with feature/project counts.  
- Show recent projects and link to `ProjectDetailsPage`.

### Testers Tab
- Fetch tester data and display summaries for workloads, validations, and QA scores.

### Tickets Tab
- Retain `<TicketsPage />` but add:
  - Search/filters.
  - Inline editing or modals for tickets.
  - Enhanced audit log.

### Data Sources
- Use Supabase or existing data layers for all queries.  
- Optimize queries using RPC endpoints for aggregated data.

---

## 5. Summary

These enhancements will transform the Admin Dashboard into a powerful command center by providing:

- *
