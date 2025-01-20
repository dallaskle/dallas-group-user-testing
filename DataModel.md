### **User**

- **id**: UUID
- **name**: String
- **email**: String (indexed for login)
- **isStudent**: Boolean
- **isAdmin**: Boolean
- **isTester**: Boolean
- **createdAt**: Timestamp
- **updatedAt**: Timestamp

### 2. **ProjectRegistry**

- **id**: UUID
- **name**: String
- **description**: Text
- **createdBy**: UUID (Admin User ID)
- **createdAt**: Timestamp
- **updatedAt**: Timestamp

### 3. **FeatureRegistry**

- **id**: UUID
- **projectRegistryId**: UUID (Foreign Key to ProjectRegistry)
- **name**: String
- **description**: Text
- **isRequired**: Boolean
- **createdAt**: Timestamp
- **updatedAt**: Timestamp

### 4. **Project**

- **id**: UUID
- **name**: String
- **studentId**: UUID (Foreign Key to User)
- **projectRegistryId**: UUID (Foreign Key to ProjectRegistry)
- **createdAt**: Timestamp
- **updatedAt**: Timestamp

### 5. **Feature**

- **id**: UUID
- **projectId**: UUID (Foreign Key to Project)
- **name**: String
- **description**: Text
- **status**: Enum (`Not Started`, `In Progress`, `Successful Test`, `Failed Test`)
- **requiredValidations**: Integer
- **currentValidations**: Integer (computed)
- **createdAt**: Timestamp
- **updatedAt**: Timestamp

### 6. **Validation**

- **id**: UUID
- **featureId**: UUID (Foreign Key to Feature)
- **validatedBy**: UUID (Foreign Key to User)
- **status**: Enum (`Working`, `Needs Fixing`)
- **videoUrl**: String
- **notes**: Text
- **createdAt**: Timestamp
- **updatedAt**: Timestamp

### 7. **Comment**

- **id**: UUID
- **featureId**: UUID (Foreign Key to Feature)
- **authorId**: UUID (Foreign Key to User)
- **content**: Text
- **createdAt**: Timestamp
- **updatedAt**: Timestamp

### 8. **Ticket**
- **id**: UUID
- **type**: Enum ('testing', 'support', 'question')
- **status**: Enum ('open', 'in_progress', 'resolved', 'closed')
- **title**: String
- **description**: Text
- **priority**: Enum ('low', 'medium', 'high')
- **created_by**: UUID (Foreign Key to User)
- **assigned_to**: UUID (Foreign Key to User)
- **created_at**: Timestamp
- **updated_at**: Timestamp

### 9. **TestingTicket**
- **id**: UUID (Foreign Key to Ticket)
- **feature_id**: UUID (Foreign Key to Feature)
- **required_validations**: Integer
- **testing_instructions**: Text
- **deadline**: Timestamp

### 10. **SupportTicket**
- **id**: UUID (Foreign Key to Ticket)
- **category**: Enum ('project', 'feature', 'testing', 'other')
- **project_id**: UUID (Foreign Key to Project) (nullable)
- **feature_id**: UUID (Foreign Key to Feature) (nullable)
- **ai_response**: Text
- **resolution_notes**: Text