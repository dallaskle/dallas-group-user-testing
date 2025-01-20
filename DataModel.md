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