# Product Requirements Document (PRD)

## 1. Overview and Purpose

### 1.1 Executive Summary
This document outlines the requirements for a new Group User Testing App aimed at helping AI Engineer Bootcamp participants (i.e., Gauntlet cohorts) collaborate on testing each other's projects. The app will enable users to quickly upload short screen-share videos demonstrating whether features are working or not, allow peers to validate these features, and provide administrators (instructors, hiring partners) with a high-level dashboard to track overall project quality and completion.

### 1.2 Goals and Objectives
- **Streamline Testing:** Simplify the testing process by providing a central platform for feature verification.
- **Collaborative Validation:** Encourage group feedback and validation, so multiple users can sign off on whether a feature is working.
- **Transparent Progress Tracking:** Provide an admin dashboard that consolidates which features are tested, who tested them, and their status.
- **Peer Learning:** Promote shared learning via short screen-share videos that demonstrate how features are (or are not) functioning.

## 2. Background and Problem Statement
In the AI Engineer Bootcamp, participants often work on complex projects with multiple features (ranging from 10 to 40 items). Currently, testing is fragmented and often informal, with limited visibility into peer validation or admin oversight. This leads to:

- Lack of standardized testing documentation.
- Difficulty for admins/instructors to quickly assess project progress and quality.
- Missed learning opportunities to see how peers solve problems or confirm they are implementing features correctly.

The Group User Testing App aims to address these issues by creating a shared environment where participants can efficiently upload tests, share feedback, and track progress.

## 3. Key Features

### Project & Feature Registry
- Ability to create or import a project's list of required features (e.g., "Sign Up," "Login," "Create Channel," etc.).
- Each feature has a status indicator (e.g., Not Started, In Progress, Tested).

### Screen-Share Video Upload
- Users can upload a ~15-second screen-share or screen recording showing the feature in action.
- Option to mark the feature as "Working" or "Not Working."
- Provide optional comments or notes to detail any issues.

### Peer Validation
- Other users can also test a given feature and upload their screen-share.
- Each feature can require multiple validations (e.g., 3–5 testers must confirm it before it is considered completed).
- Peers can mark a feature as "Working" or "Needs Fixing."

### Collaborative Feedback
- Comment threads on each feature to discuss issues, bugs, or possible solutions.
- Notification system to alert project owners when a peer has tested/validated a feature.

### Admin Dashboard / Scorecard
- High-level view of each project's overall progress.
- Metrics include how many features are tested, number of validations, and status breakdown.
- Filtering and sorting by project, user, or feature to quickly identify blockers or incomplete tasks.

### User Roles
- **Student/User:** Can create projects, add features, upload test videos, and validate others' features.
- **Admin:** Has permissions to view all projects, see dashboards, and possibly override or finalize feature statuses.

## 4. User Stories
1. As a Student (Project Owner), I want to create a new project and list its features so that I have a central location to track all testing efforts.
2. As a Student (Project Owner), I want to upload a short screen recording of a feature to demonstrate it working, so others can validate it.
3. As a Peer Tester, I want to view a friend's feature demo and confirm if it's working or not, so I can provide additional validation to help them pass the requirement.
4. As an Admin, I want to see a consolidated dashboard showing how many features are tested, validated, or incomplete, so I can quickly gauge progress and success rates.
5. As a Student, I want to see multiple example videos of a feature's implementation, so I can learn different ways of solving similar tasks.

## 5. Functional Requirements

### 5.1 Project Management
- FR-1: The system shall allow users to create and manage multiple projects.
- FR-2: The system shall allow users to add, edit, or remove features under a project.

### 5.2 Video Upload & Playback
- FR-3: The system shall support ~15-second screen-share video uploads (common video formats).
- FR-4: The system shall provide basic video playback within the app to review tests.

### 5.3 Feature Status & Validation
- FR-5: The system shall allow a user to mark a feature as "Working" or "Not Working" based on their demonstration.
- FR-6: The system shall allow multiple users to add a validation for the same feature.
- FR-7: A feature's overall status is determined by the required number of validations (e.g., at least 3 "Working" validations for a "Complete" status).

### 5.4 Collaboration & Feedback
- FR-8: The system shall provide a comment section for each feature.
- FR-9: The system shall notify relevant parties (project owners, watchers) when a new video or comment is posted.

### 5.5 Admin Dashboard
- FR-10: The system shall provide an admin dashboard that aggregates project status (e.g., total features, validated features, pending validations).
- FR-11: The system shall allow admins to search/filter by user or project.
- FR-12: The system may allow admins to override or finalize feature statuses if needed.

### 5.6 User Roles & Access
- FR-13: The system shall have user roles: Student, Admin.
- FR-14: Admin users have full read/write access to all projects and features.
- FR-15: Students only have edit permissions for their own projects, though they can test and comment on any project.

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
- **Front-End:** React or Vue (for dynamic dashboards and easy video preview)
- **Back-End:** Node.js / Express or Python / Django (managing APIs, user authentication)
- **Database:** PostgreSQL or MongoDB (storing projects, features, user data, and references to video storage)
- **Cloud Hosting:** AWS, Azure, or GCP (for scalable deployments)
- **Video Storage:** AWS S3 or equivalent for secure and scalable hosting of short videos

### 7.2 Architecture Diagram (High-Level)
- Client (Web App) requests project/feature data from the REST API.
- REST API fetches/stores data in the Database.
- Video files are uploaded directly to S3 (or similar) via signed URLs.
- Admins access a specialized web portal (part of the same front-end) with additional dashboards and management tools.

## 8. Dependencies and Integrations
- **Authentication:** Possibly integrate with existing Bootcamp SSO or standard OAuth.
- **Video Hosting:** Integration with cloud storage, ensuring restricted public access to videos.
- **Notifications:** Email or Slack integration for real-time notifications (optional / future enhancement).

## 9. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Large video uploads could strain storage and bandwidth | Enforce a 15-second limit and compress video on upload |
| User adoption might be slow if the interface is not intuitive | Provide clear training materials and embedded tutorials |
| Feature validations might become "rubber-stamping" if peers do not thoroughly test | Implement a random QA check by admins or require short commentary describing the testing outcome |

## 10. Timeline & Milestones

| Milestone | Deliverable | Target Date |
|-----------|-------------|-------------|
| 1. Requirements & Design | Finalize PRD, wireframes, architecture | Week 1 |
| 2. MVP Development | User auth, project setup, basic video upload | Week 3 |
| 3. Feature Validation Mechanism | Multiple validations, statuses, peer comments | Week 5 |
| 4. Admin Dashboard | Aggregated data view, search, sorting filters | Week 6 |
| 5. User Acceptance Testing (UAT) | Testing with a small group of bootcamp participants | Week 7 |
| 6. Final Release | Production deployment, documentation, training | Week 8 |

## 11. KPIs and Success Metrics
- Number of Projects Onboarded: Tracks adoption across Bootcamp cohorts.
- Average Validation Time: Measures how quickly features get reviewed by peers.
- Completion Rate: Percentage of features fully validated by peers.
- Admin Engagement: Frequency of admin logins and dashboard views.
- User Satisfaction: Measured via in-app surveys or feedback.

## 12. Open Questions / Future Considerations
- **Gamification:** Should we introduce badges or leaderboards to incentivize more peer testing?
- **Integration with Slack:** Automated notifications in cohort channels for newly uploaded videos or features.
- **Mobile Support:** Is it critical to have a mobile-friendly version or dedicated mobile app for quick upload?
- **AI-Powered Insights:** In the future, consider automatically analyzing short videos for UI usage patterns or errors.

## 13. Conclusion
The Group User Testing App will revolutionize how AI Engineer Bootcamp participants collaborate and validate each other's project features. By centralizing the testing process, offering quick video demos, and providing a transparent dashboard for progress, the platform aims to enhance peer learning, streamline validation, and give admins the insights needed to ensure every student meets core requirements.

End of PRD





You said:
