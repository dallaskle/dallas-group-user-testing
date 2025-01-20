# API Endpoints

### **Auth**

- `POST /auth/login`: Login a user.
- `POST /auth/register`: Register a new user.
- `POST /auth/verify-email`: Verify a user's email address.

### **ProjectRegistry**

- `POST /admin/project-registries`: Admin creates a new project registry.
- `GET /project-registries`: Fetch all project registries for a user.
- `GET /project-registries/:id`: Fetch details of a specific project registry.

### **FeatureRegistry**

- `POST /admin/project-registries/:id/features`: Admin creates a new feature for a project registry.
- `GET /project-registries/:id/features`: Fetch all features for a project registry.

### **Projects**

- `GET /projects`: Fetch all projects for the logged-in user.
- `POST /projects`: Create a new project.
- `GET /projects/:id`: Fetch details of a single project.
- `PUT /projects/:id`: Update project details.
- `DELETE /projects/:id`: Delete a project.

### **Features**

- `GET /projects/:projectId/features`: List all features for a project.
- `POST /projects/:projectId/features`: Add a new feature to a project.
- `PUT /features/:id`: Update feature status or details.
- `DELETE /features/:id`: Delete a feature.

### **Validations**

- `GET /features/:featureId/validations`: Fetch all validations for a feature.
- `POST /features/:featureId/validations`: Add a validation (with video upload).
- `PUT /validations/:id`: Update a validation (e.g., notes or video URL).
- `DELETE /validations/:id`: Delete a validation.

### **Comments**

- `GET /features/:featureId/comments`: Fetch comments for a feature.
- `POST /features/:featureId/comments`: Add a comment.
- `PUT /comments/:id`: Edit a comment.
- `DELETE /comments/:id`: Remove a comment.

### **Admin Dashboard**

- `GET /admin/dashboard`: Admin dashboard view with overall project status.
- `GET /admin/projects`: Fetch all projects and their statuses.
- `GET /admin/projects/:id`: Fetch detailed status of a project.
- `GET /admin/users`: List all users and their activity metrics.
- `PUT /admin/features/:featureId`: Override or finalize feature status.

### **Tickets**

- `GET /tickets`: Fetch all tickets visible to the user
- `POST /tickets`: Create a new ticket
- `GET /tickets/:id`: Get ticket details
- `PUT /tickets/:id`: Update ticket status/details
- `DELETE /tickets/:id`: Delete a ticket

### **Testing Tickets**

- `GET /features/:featureId/testing-tickets`: Get testing tickets for a feature
- `POST /features/:featureId/testing-tickets`: Create testing ticket for feature
- `PUT /testing-tickets/:id/assign`: Assign testing ticket to tester
- `PUT /testing-tickets/:id/validate`: Link validation to testing ticket

### **Support Tickets**

- `GET /support-tickets`: Get all support tickets
- `POST /support-tickets`: Create new support ticket
- `GET /support-tickets/:id/ai-response`: Get AI-generated response
- `PUT /support-tickets/:id/resolve`: Mark support ticket as resolved