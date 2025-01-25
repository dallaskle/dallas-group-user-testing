# Product Requirements Document (PRD)

## 1. Overview and Purpose

### 1.1 Executive Summary

This document outlines the requirements for a new Group User Testing App aimed at helping AI Engineer Bootcamp participants (i.e., Gauntlet cohorts) collaborate on testing each other's projects. Inspired by Zendesk's feature set, the app will enable users to quickly upload short screen-share videos demonstrating whether features are working or not, allow peers to validate these features, and provide administrators (instructors, hiring partners) with a high-level dashboard to track overall project quality and completion. The platform leverages concepts like task pipelines, inbox queues, and admin dashboards from Zendesk to streamline feature testing and validation.

### 1.2 Goals and Objectives

- **Streamline Testing:** Simplify the testing process by providing a central platform for feature verification.
- **Collaborative Validation:** Encourage group feedback and validation, so multiple users can sign off on whether a feature is working.
- **Transparent Progress Tracking:** Provide an admin dashboard that consolidates which features are tested, who tested them, and their status.
- **Peer Learning:** Promote shared learning via short screen-share videos that demonstrate how features are (or are not) functioning.

## 2. Background and Problem Statement

In the AI Engineer Bootcamp, participants often work on complex projects with multiple features (ranging from 10 to 40+ items). Currently, testing is fragmented and often informal, with limited visibility into peer validation or admin oversight. This leads to:

- Lack of standardized testing documentation.
- Difficulty for admins/instructors to quickly assess project progress and quality.
- Missed learning opportunities to see how peers solve problems or confirm they are implementing features correctly.

The Group User Testing App aims to address these issues by creating a shared environment where participants can efficiently upload tests, share feedback, and track progress.

## 3. Key Features

### Project & Feature Registry

- Admins can create a Project Registry, from which students can create their own project instances.
- Admins can add features to the project registry that are required or optional.
- Students can create project instances from the project registry.
- Students have the ability to create or import a project's list of required features (e.g., "Sign Up," "Login," etc.).
- Each feature has a status indicator (e.g., Not Started, In Progress, Successful Test, Failed Test).

### Screen-Share Video Upload

- Users can upload a ~15-second screen-share or screen recording showing the feature in action.
- Option to mark the feature as "Working" or "Not Working."
- Provide optional comments or notes to detail any issues.

### Peer Validation

- Testers can be added as testers and be assigned a given feature and upload their screen-share.
- An embedded browser within the testing page allows users to interact directly with the feature while recording their screen, without needing to leave the app. This includes access to project context such as feature requirements and previous validation notes, enabling more efficient and comprehensive testing.
- Each feature can require multiple validations (e.g., 3–5 testers must confirm it before it is considered completed).
- Peers can mark a feature as "Working" or "Needs Fixing."

### Collaborative Feedback

- Comment threads on each feature to discuss issues, bugs, or possible solutions.
- Notification system to alert project owners when a peer has tested/validated a feature.

### Admin Dashboard / Scorecard

- High-level view of each project registry, project, and feature's overall progress.
- Metrics include how many features are tested, number of validations, and status breakdown.
- Filtering and sorting by project, user, or feature to quickly identify blockers or incomplete tasks.

### User Roles

- **Student/User:** Can create projects from the project registry, add features, copy features from the registry, upload their own test videos, and validate their own tests.
- **Admin:** Has permissions to view all projects, see dashboards, and possibly override or finalize feature statuses.
- **Tester:** Can view test requests, upload test videos, and validate others' features.

### Ticket Management System

- **Testing Tickets**
  - Automatically created when features are ready for testing
  - Tracks feature validation status and assignments
  - Links to completed validations
  - Provides deadline management for testing tasks
  - Enables efficient distribution of testing workload

- **Support & Question Tickets**
  - AI-powered support bot provides immediate responses
  - Categorized by project, feature, or testing context
  - Escalation path to human support when needed
  - Knowledge base integration for common questions
  - Historical tracking of similar issues and resolutions

## 4. User Stories

### Admin

1. As an Admin, I want to create a project registry with required and optional features so students can use them to create project instances.
2. As an Admin, I want to see a consolidated dashboard showing how many features are tested, validated, or incomplete, so I can quickly gauge progress and success rates.
3. As an Admin, I want to evaluate testers' accuracy and thoroughness using QA Scorecards, so I can ensure quality testing and provide coaching as needed.
4. As an Admin, I want to track tester efficiency, including test completion rates and average time per test, so I can identify top performers and areas for improvement.

### Student

1. As a Student, I want to create a new project and list its features so that I have a central location to track all testing efforts.
2. As a Student, I want to upload a short screen recording of a feature to demonstrate it working, so others can validate it.
3. As a Student, I want to see multiple example videos of a feature's implementation, so I can learn different ways of solving similar tasks.

### Tester

1. As a Tester, I want a clear queue of test requests, so I can efficiently complete my tasks.
2. As a Tester, I want to view detailed information about each feature, including requirements and past validation results, so I can perform thorough testing.
3. As a Tester, I want to mark a feature as "Working" or "Needs Fixing" and provide video evidence, so my validations contribute to project progress.

## 5. Functional Requirements

### 5.1 Project Management

- FR-1: The system shall allow admins to create a project registry with required and optional features.
- FR-2: The system shall allow students to create and manage multiple projects from the project registry.
- FR-3: The system shall allow users to add, edit, or remove features under a project.

### 5.2 Video Upload & Playback

- FR-4: The system shall support ~15-second screen-share video uploads (common video formats).
- FR-5: The system shall provide basic video playback within the app to review tests.

### 5.3 Feature Status & Validation

- FR-6: The system shall allow a user to mark a feature as "Working" or "Not Working" based on their demonstration.
- FR-7: The system shall include an embedded browser on the testing page, enabling users to test and interact with features directly while screen-recording.
- FR-8: The embedded browser shall provide access to relevant project context, such as feature descriptions, requirements, and previous validation notes on the rest of the page.
- FR-9: A feature's overall status is determined by the required number of validations (e.g., at least 3 "Working" validations for a "Complete" status).
- FR-7: The system shall allow multiple users to add a validation for the same feature.
- FR-8: A feature's overall status is determined by the required number of validations (e.g., at least 3 "Working" validations for a "Complete" status).

### 5.4 Collaboration & Feedback

- FR-9: The system shall provide a comment section for each feature.
- FR-10: The system shall notify relevant parties (project owners, watchers) when a new video or comment is posted.

### 5.5 Admin Dashboard

- FR-11: The system shall provide an admin dashboard that aggregates project status (e.g., total features, validated features, pending validations).
- FR-12: The system shall allow admins to search/filter by user or project.
- FR-13: The system shall allow admins to override or finalize feature statuses if needed.
- FR-14: The system shall evaluate testers via QA Scorecards to track accuracy and thoroughness.
- FR-15: The system shall provide tester efficiency metrics, including test completion rates and average time per test.

### 5.6 User Roles & Access

- FR-16: The system shall have user roles: Student, Admin, Tester.
- FR-17: Admin users have full read/write access to all projects and features.
- FR-18: Students only have edit permissions for their own projects, though they can test and comment on any project.
- FR-19: Testers can only validate features and upload validation videos.

### 5.7 Additional Functional Requirements

- FR-20: The system shall automatically create testing tickets when features are marked ready for testing
- FR-21: The system shall provide an AI-powered support bot for immediate response to support tickets
- FR-22: The system shall track ticket metrics including resolution time and satisfaction
- FR-23: The system shall enable ticket assignment and reassignment to appropriate testers
- FR-24: The system shall maintain relationships between tickets, features, and validations

## 6. Non-Functional Requirements

### Security

- User authentication and role-based authorization are required.
- Videos should be stored securely with access restricted to authorized users.

### Performance

- The app should handle simultaneous video uploads without significant performance degradation.
- Video playback should be near real-time with minimal buffering or latency (depending on hosting infrastructure).

### Scalability

- The system should scale to support multiple cohorts, each with potentially dozens of projects and tens of features per project.

### Usability

- User interface should be intuitive with clear instructions for uploading videos and validating features.
- Dashboard should present data in a visually understandable manner (charts, progress bars, etc.).

### Reliability & Uptime

- The system should aim for 99%+ uptime during the Bootcamp's critical testing phases.

## 7. Technical Considerations and Architecture

### 7.1 Proposed Technology Stack

- **Front-End:** Vite + React + Typescript
- **Back-End:** Supabase Edge Functions in Typescript
- **Database:** Supabase PostgreSQL (storing projects, features, user data, and references to video storage)
- **Cloud Hosting:** AWS Amplify
- **Video Storage:** Supabase Storage
- **Auth:** Supabase Auth

### 7.2 Architecture Diagram (High-Level)

- Client (Web App) requests project/feature data from Supabase Edge Functions (acting as REST API).
- Supabase Edge Functions fetch/store data in the Supabase PostgreSQL Database.
- Video files are uploaded directly to Supabase Storage using secured endpoints.
- Admins and users access a unified web portal (built with Vite + React + TypeScript) to manage and validate projects and features.
- Supabase Auth handles user authentication and authorization for access control.

## 8. Dependencies and Integrations

- **Authentication:** Supabase Auth handles user authentication and role-based authorization.
- **Database:** Supabase PostgreSQL ensures structured and relational data management.
- **Backend as a Service:** Supabase Edge Functions provide serverless, scalable backend logic for handling REST API endpoints, real-time database triggers, and custom business logic.
- **Video Storage:** Supabase Storage securely manages short video uploads.
- **Cloud Hosting:** AWS Amplify supports scalable and efficient deployment.
- **Notifications:** Integration with email or Slack (future consideration) for real-time alerts and updates.

## 9. Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Large video uploads could strain storage and bandwidth | Enforce a 120-second limit and compress video on upload |
| User adoption might be slow if the interface is not intuitive | Provide clear training materials and embedded tutorials |
| Feature validations might become "rubber-stamping" if peers do not thoroughly test | Implement a random QA check by admins or require short commentary describing the testing outcome |

|  |  |
| --- | --- |

## 10. KPIs and Success Metrics

- Number of Projects Onboarded: Tracks adoption across Bootcamp cohorts.
- Average Validation Time: Measures how quickly features get reviewed by peers.
- Completion Rate: Percentage of features fully validated by peers.
- Admin Engagement: Frequency of admin logins and dashboard views.
- User Satisfaction: Measured via in-app surveys or feedback.
- Tester Efficiency: Tracks throughput and accuracy of testers.

## 11. Open Questions / Future Considerations

- **Gamification:** Should we introduce badges or leaderboards to incentivize more peer testing?
- **Integration with Slack:** Automated notifications in cohort channels for newly uploaded videos or features.
- **Mobile Support:** Is it critical to have a mobile-friendly version or dedicated mobile app for quick upload?
- **AI-Powered Insights:** In the future, consider automatically analyzing short videos for UI usage patterns or errors.

## 13. Conclusion

The Group User Testing App will revolutionize how AI Engineer Bootcamp participants collaborate and validate each other's project features. By centralizing the testing process, offering quick video demos, and providing a transparent dashboard for progress, the platform aims to enhance peer learning, streamline validation, and give admins the insights needed to ensure every student meets core requirements.

End of PRD.