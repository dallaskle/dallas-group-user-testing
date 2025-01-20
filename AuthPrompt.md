# Authentication and User Management Documentation

## Core Requirements

### Authentication
- Use Supabase Auth for handling user authentication
- Role-based access control to differentiate between Admin, Student, and Tester
- Secure login/logout endpoints for all users
- Email verification required before account activation
- Automatic verification email sent upon registration
- Custom email templates for verification process

### User Roles and Permissions

#### Admin
- Full read/write access to all projects, features, and dashboards
- Ability to override feature statuses
- Access to metrics (tester accuracy, efficiency) and QA Scorecards

#### Student
- Can create, edit, and manage their own projects and features
- Can validate features on peer projects and add comments

#### Tester
- Can view testing queues, upload validation videos, and mark features as "Working" or "Needs Fixing"

### User Data
Maintain structured user data in Supabase PostgreSQL, including:
- User ID
- Name
- Email
- Role (Admin, Student, Tester)
- Associated projects (for Students)
- Assigned tests (for Testers)
- Activity logs (e.g., last login, completed validations)

### Secure Video Access
- Limit access to uploaded videos based on user roles:
  - Only Admins, Students, or assigned Testers can view specific videos
  - Use signed URLs for secure video access

### Notifications
- Notify users of key actions (e.g., when a feature is validated, comments added)
- Notifications could be sent via email (Supabase Mail integration) or in-app alerts

## Functional Requirements

### Sign-Up/Login
- Support OAuth (Google, GitHub) for easy onboarding
- Include standard email/password registration
- Role assigned by Admin during user creation
- Email verification flow:
  1. User registers with email/password
  2. Automatic verification email sent via Supabase
  3. User clicks verification link in email
  4. Email verified status updated in Supabase
  5. User redirected to dashboard after verification

### Role-Based Dashboards

#### Admin
- View consolidated project and user metrics

#### Student
- Manage their projects, upload videos, and view peer feedback

#### Tester
- Access their assigned test queue and upload validation videos

### User Management (Admin-Only)
- Add, update, or deactivate user accounts
- Assign roles to new users
- Track user activity (e.g., logins, tests completed)

## Security Requirements
- Enforce JWT-based authentication for API requests
- Protect sensitive data (e.g., videos, comments) with role-based access controls
- Audit logs for all user actions (especially Admin overrides)

## Technical Stack
- **Authentication:** Supabase Auth
- **Database:** Supabase PostgreSQL (store user data, role permissions, and relationships with projects/features)
- **Hosting:** AWS Amplify
- **Notifications:** Supabase Mail or in-app alerts

## API Endpoints

### Authentication
- `/auth/login`: Handle user login
- `/auth/register`: Register new users (Admin-only for assigning roles)
- `/auth/logout`: Log out the current session
- `/auth/verify-email`: Verify user's email address
  - Accepts verification token
  - Updates user's verified status
  - Returns success/error message
- `/auth/resend-verification`: Resend verification email
  - Rate limited to prevent abuse
  - Available only for unverified users

### User Management
- `/users`: Get all users (Admin-only)
- `/users/{id}`: Update user details (e.g., role)
- `/users/activity`: Fetch activity logs

### Notifications
- `/notifications`: Send notifications (e.g., test validation updates)

## Email Templates
- **Verification Email**
  - Customizable template in Supabase dashboard
  - Include clear instructions and branding
  - Verification link with secure token
  - Expiration time for security

## Implementation Notes
- Configure Supabase email settings in dashboard
- Set appropriate redirect URLs for verification
- Handle expired/invalid verification tokens
- Implement email verification checks on protected routes
- Store verification status in user metadata
- Log verification attempts for security monitoring

By focusing on these points, an engineer can efficiently implement authentication and user management for the Group User Testing App.