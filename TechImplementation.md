# High-Level Technical Guide for Group User Testing App

This document outlines how to implement a **Group User Testing App** using **Vite + React + TypeScript** on the front end and **Supabase** for authentication, database, storage, and edge functions. The guide covers technology choices, data modeling, security considerations (without relying on Row-Level Security), and practical development tips.

---

## 1. Technology Stack Overview

### Front End
- **Vite**: A fast development build tool for front-end applications.
- **React (TypeScript)**: Core UI framework.
- **UI Library (Optional)**: Could use a component library such as Material UI or Chakra UI to speed up development.

### Back End & Infrastructure
- **Supabase**:
  - **Auth**: User sign-up, sign-in, and role management.
  - **Postgres Database**: For storing application data.
  - **Storage**: For file uploads (videos, images, etc.).
  - **Edge Functions**: For running server-side logic and advanced workflows (e.g., feature validation, sending notifications).

### Deployment/Hosting
- **Vercel/Netlify** (or any static hosting) for the front-end.
- **Supabase** for all back-end services (DB, Auth, Storage, Edge Functions).

---

## 2. Data Model & Database Schema

We’ll use **Postgres** via Supabase. Here’s a proposed schema (names and fields can be adjusted as needed):

**`users`**
- `id` (UUID, primary key)
- `email` (text, unique)
- `full_name` (text)
- `role` (text: "student", "admin")  
- (Optional) You can manage the role in a dedicated roles table if needed.

**`projects`**
- `id` (UUID, primary key)
- `owner_id` (UUID, references `users.id`)
- `title` (text)
- `description` (text) *(optional)*
- `created_at` (timestamp, default now())

**`features`**
- `id` (UUID, primary key)
- `project_id` (UUID, references `projects.id`)
- `title` (text)
- `description` (text) *(optional)*
- `created_at` (timestamp, default now())

**`feature_statuses`**
- `id` (UUID, primary key)
- `feature_id` (UUID, references `features.id`)
- `user_id` (UUID, references `users.id`)
- `video_url` (text) – path in Supabase Storage
- `status` (text) – "working", "not_working"
- `notes` (text) – *(optional)* text describing the test outcome
- `created_at` (timestamp, default now())

This table tracks each user’s submission/validation for a feature. Multiple records here can indicate multiple validations by different testers.

**`feature_comments`** *(optional for collaboration)*
- `id` (UUID, primary key)
- `feature_id` (UUID, references `features.id`)
- `user_id` (UUID, references `users.id`)
- `comment_text` (text)
- `created_at` (timestamp, default now())

---

## 3. Supabase Auth & Security (Without RLS)

### Sign Up / Sign In Flow
- Use Supabase’s built-in email/password auth or OAuth providers (Google, GitHub, etc.) if required.
- Store additional user profile details (e.g., `full_name`, `role`) in the `users` table. You can:
  - Use Supabase Auth triggers to populate the `users` table automatically on sign-up, **or**
  - Handle it client-side after registration by calling a secure endpoint or edge function to upsert into `users`.

### Role Management (Application-Level Checks)
- For minimal complexity, you can store user roles in `users.role` (e.g., "student", "admin").
- **Instead of Row-Level Security**, handle permission checks within:
  - Supabase **Edge Functions** (by verifying the user’s role or `owner_id`).
  - **Client-side** logic (to hide/disable UI actions).
  - **Backend or middleware**: For example, create your own endpoints (via Edge Functions) that enforce who can update or delete data.

### Access Policies (Using Application Logic & Edge Functions)
- For **projects**: Only the owner or an admin can update project details, but anyone can view them.
- For **features**: Anyone can add a `feature_status` (i.e., test a feature), but only the project owner or an admin can edit the feature definition.
- For **comments**: Anyone with access to the project can comment.
  
Enforce these rules in **server-side logic** to avoid directly exposing raw DB operations to unauthorized users. 

---

## 4. File Uploads (Short Videos)

### Supabase Storage
- Create a bucket (e.g., `videos`) to store short videos.
- Restrict public access: Store files as private and use signed URLs to access them in the app.
- **Max length ~15 seconds**:
  - Implement client-side validation (e.g., an `.mp4` or `.webm` file of up to 20 MB).
  - Optionally add a server-side check in an edge function for bandwidth/storage control.

### Upload Flow
1. The React app requests a signed upload URL from an edge function or directly from Supabase.
2. The user’s short video is uploaded directly to that URL.
3. On success, the app calls a function to create a record in `feature_statuses` with the returned `video_url`.

### Playback
- Use a video player in React (e.g., the HTML5 `<video>` tag) to load from a signed download URL.
- Signed URLs can expire or be short-lived; refresh them via the Supabase client if needed.

---

## 5. Edge Functions (Business Logic)

While much can be done directly via Supabase’s client libraries, sometimes you want server-side logic:

### Feature Completion Logic
If a feature requires 3 validations of "working" to mark it as "complete," you can:
- Write an edge function that:
  - Counts the number of "working" statuses in `feature_statuses` for the feature.
  - Checks if it meets the threshold.
  - Optionally updates a `completion_status` in `features` (e.g., `"in_progress"`, `"completed"`).

### Notification Hooks
When a new `feature_statuses` record is inserted, trigger an edge function that sends an email or Slack notification to the project owner.

### Security/Validation
- Implement more complex role checks in edge functions if it’s not convenient to do so on the client side.
- For example, verify the current user is the project owner or an admin before allowing certain updates.

---

## 6. Frontend Architecture & Project Structure

Using **Vite** for a React + TypeScript app, you might structure the project like this:

my-user-testing-app/
├─ public/
├─ src/
│  ├─ components/
│  │  ├─ ProjectList.tsx
│  │  ├─ ProjectDetails.tsx
│  │  ├─ FeatureList.tsx
│  │  ├─ FeatureCard.tsx
│  │  ├─ VideoPlayer.tsx
│  │  └─ ...
│  ├─ pages/
│  │  ├─ HomePage.tsx
│  │  ├─ LoginPage.tsx
│  │  ├─ DashboardPage.tsx
│  │  ├─ ProjectPage.tsx
│  │  └─ ...
│  ├─ services/
│  │  ├─ supabaseClient.ts
│  │  └─ ...
│  ├─ hooks/
│  ├─ context/
│  ├─ utils/
│  ├─ types/
│  ├─ App.tsx
│  └─ main.tsx
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ ...



### Key Points

#### `supabaseClient.ts`
- Initialize and export the `createClient` instance.
- Configure your Supabase URL and anon/public keys securely.

#### Routing
- Use a router (e.g., **React Router**) for navigating between pages: home, login, dashboard, project details, etc.

#### State Management
- Optionally use React Context or a library like **Redux** or **Zustand** if the app grows larger.
- For simpler scenarios, rely on **React Query** or **TanStack Query** for fetching/caching data from Supabase.

#### TypeScript Types
- Create type definitions or interfaces (`Project`, `Feature`, `FeatureStatus`, etc.).
- Minimizes errors in calls to the database and ensures code clarity.

#### UI/UX
- Clear layout for displaying each project’s features.
- Simple modal or form to upload short videos for a feature status.
- Summaries and analytics for validated vs. unvalidated features.

---

## 7. Core Frontend Workflows

Below are some typical workflows you might implement:

### User Registration & Login
1. Use Supabase’s Auth UI or build your own custom form.
2. On successful login, store the auth session in your app’s context/state.

### Create a Project
1. Check if the user is authenticated.
2. Call `insert` on the `projects` table with `owner_id = user.id`.

### Add/Edit Features
1. Ensure the user is **either** the project owner or an admin (check `owner_id` or user’s `role`).
2. Insert or update records in `features`.

### Upload a Short Video & Submit Feature Status
1. User clicks "**Validate Feature**" and selects/records a ~15s video.
2. The app obtains a signed upload URL (edge function or direct from Supabase).
3. The video is uploaded.
4. On success, insert a row in `feature_statuses` with the returned `video_url`.

### View a Feature’s Validations
1. Query all `feature_statuses` for a given `feature_id`.
2. Display short video players (or thumbnails) and the user’s status ("working" / "not working").
3. (Optional) Show a progress bar (e.g., how many are "working" vs. "not working").

### Admin Dashboard
- Summaries across all projects: total features, count of validated features, etc.
- Implement via queries or an edge function that aggregates data.

---

## 8. Handling Feature Completion Logic

A common requirement is that each feature needs "N" validations. You can handle this logic in two ways:

1. **Client-Side Aggregation**
   - Query `feature_statuses` for each feature.
   - Count the number of "working" validations.
   - If `count >= required_count`, label the feature as completed in the UI.

2. **Database/Edge Function Approach**
   - Use a trigger or edge function to update the `features` table (`status = 'completed'`) once the threshold is met.
   - This ensures consistent logic, enforced at the database level or via server-side code.

---

## 9. Notifications & Real-Time Updates

### Realtime (Optional)
- Supabase offers realtime updates based on database changes.
- If you want validations or comments to appear in real-time, subscribe to changes on `feature_statuses` or `feature_comments`.

### Edge Functions for Email/Slack
- On inserting a new record in `feature_statuses`, call an edge function that triggers:
  - An email to the project owner.
  - A Slack message using a Slack webhook, etc.

---

## 10. Security Best Practices (Without RLS)

- **Use only the public anon key** on the client. Never expose your `service_role` key.
- **Implement role/ownership checks** in your edge functions or custom API endpoints:
  - Verify if the user is an admin or owner of the project before allowing updates/deletions.
- **JWT Verification** in edge functions:
  - Validate the user’s token and ensure they have the correct `user_id` or role for the action.
- **Client-Side**: Use your user’s role or ownership checks to show/hide UI elements.

By centralizing these checks in edge functions or server-side code, you avoid the complexities of Row-Level Security while still ensuring data protection.

---

## 11. Deployment & DevOps

### Supabase Project
1. Create a new Supabase project.
2. Set up your database schema (via the Supabase UI or SQL migrations).
3. Configure your Storage buckets.

### CI/CD for Front End
- Connect your Git repository to Vercel/Netlify.
- Each push triggers an automatic build & deployment (Vite-based).

### Edge Functions
- Write your edge functions in JavaScript/TypeScript.
- Deploy them via the Supabase CLI (or GitHub Actions) to your project.

---

## 12. Roadmap / Next Steps

### MVP
- Basic auth (signup/login).
- CRUD for projects and features.
- Video upload to Supabase Storage and insertion into `feature_statuses`.
- Basic listing & filtering on the front end.

### Validation Logic
- Implement threshold-based feature completion (client-side or edge function).
- Admin dashboard summarizing each feature’s progress.

### Collaboration
- Commenting system (optional).
- Real-time updates (optional).
- Notifications (email/Slack) via edge functions (optional).

### Enhancements
- Strict role-based editing (e.g., only owners/admin can edit).
- Automatic video compression or advanced checks on the server side.
- Analytics for each user’s testing contributions, top testers, etc.

---

## Conclusion

By leveraging **Vite + React + TypeScript** on the front end and **Supabase** for auth, database, storage, and edge functions, you can build a robust, scalable **Group User Testing App** without needing to configure Row-Level Security. Focus on:

- A **clear data model** in Postgres.
- **Client and edge function security checks** for role/ownership validation.
- A straightforward **video upload flow** to Supabase Storage.
- (Optional) real-time features or notifications for improved collaboration.

Following these guidelines should give your team a clear path to implementation and a maintainable codebase for future growth.
