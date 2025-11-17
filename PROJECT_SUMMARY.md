# 📘 TutorEdge Backend - Complete Project Summary

## 🎯 Project Overview

**TutorEdge** is a comprehensive tutoring platform backend that connects parents, tutors, and students. It facilitates tutor discovery, assignment/quiz management, and parent-tutor matching through a RESTful API built with Fastify and TypeScript.

---

## 🛠 Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Fastify 5.6.0 (high-performance web framework)
- **Language**: TypeScript 5.9.2
- **Database**: MongoDB 6 (via Mongoose 8.18.1)
- **Authentication**: JWT (jsonwebtoken, fastify-jwt)
- **File Upload**: Cloudinary / Local storage (via @fastify/multipart)
- **Documentation**: Swagger UI (@fastify/swagger)
- **Security**: bcryptjs for password hashing
- **Containerization**: Docker & Docker Compose

---

## 📁 Project Architecture

### Directory Structure

```
tutoredge-backend/
├── src/                    # TypeScript source code
│   ├── config/            # Configuration (DB, environment)
│   ├── controllers/       # Request handlers (route → service)
│   ├── services/          # Business logic layer
│   ├── models/            # MongoDB schemas (Mongoose)
│   ├── routes/            # API route definitions
│   ├── middlewares/       # Auth & authorization
│   ├── utils/             # Helper functions (JWT, hash, upload)
│   ├── app.ts             # Fastify app setup
│   └── server.ts          # Entry point
├── dist/                  # Compiled JavaScript (build output)
├── docker-compose.yml     # Docker services configuration
├── Dockerfile             # Container build instructions
└── package.json           # Dependencies & scripts
```

### Architecture Pattern: **Layered Architecture**

1. **Routes Layer** → Define endpoints with Swagger schemas
2. **Middleware Layer** → Authentication & role-based access control
3. **Controller Layer** → Handle HTTP requests/responses
4. **Service Layer** → Business logic & data operations
5. **Model Layer** → Database schemas & validation

---

## 👥 User Roles & Permissions

### 1. **Admin**
- **Authentication**: Username + Password (from env vars)
- **Capabilities**:
  - View tutor applications (pending/approved/rejected)
  - View all parent requests
  - Approve/reject tutors (status management)

### 2. **Parent**
- **Authentication**: Email + Password
- **Capabilities**:
  - Search/browse tutors (with filters)
  - Submit tutoring requests
  - View own requests

### 3. **Tutor**
- **Authentication**: Email + Password
- **Status Flow**: `pending` → `phone_verified` → `approved` → (can login)
- **Capabilities**:
  - Create/Update/Delete Assignments (with file attachments)
  - Create/Update/Delete Quizzes
  - Manage teaching profile

### 4. **Student** (Note: Currently limited implementation)
- **Authentication**: Via parent account (implied)
- **Capabilities**:
  - View assignments & quizzes for their class grade
  - Filter by upcoming/completed status

---

## 📊 Data Models

### 1. **User Model** (`models/User.ts`)
```typescript
- role: "admin" | "parent" | "tutor"
- Common: email, password, fullName, phone
- Admin: username (unique)
- Tutor-specific:
  - subjects: string[]
  - languages: string[]
  - classesTaught: string[]
  - qualification, college, yearsOfExperience
  - status: "pending" | "phone_verified" | "approved" | "rejected"
  - price, teachingMode, availability, rating, testimonial
```

**Indexes**: `subjects`, `price`, `rating` (for fast filtering)

### 2. **Assignment Model** (`models/Assignment.ts`)
```typescript
- title, subject, class_grade
- instructions, attachments[] (filename, url)
- due_date: YYYY-MM-DD string
- allow_submission_online: boolean
- created_by: ObjectId (tutor reference)
```

### 3. **Quiz Model** (`models/Quiz.ts`)
```typescript
- title, subject, class_grade, description
- questions[]:
  - question, options[], correct_answer, type
- created_by: ObjectId (tutor reference)
```

### 4. **ParentRequest Model** (`models/ParentRequest.ts`)
```typescript
- parentId: string
- academicNeeds: string[]
- scheduling: string[]
- location: string
- urgency: "within_24_hours" | "within_3_days" | "within_a_week"
- status: "pending" | "assigned" | "completed" | "cancelled"
```

---

## 🔐 Authentication & Authorization Flow

### Authentication Process:
1. **Signup/Login** → User credentials validated
2. **Password Hashing** → bcryptjs (salt rounds: 10)
3. **JWT Generation** → Token contains `{ id, role }` (expires in 7 days)
4. **Token Storage** → Client stores token (localStorage/cookies)

### Authorization Middleware:
- **`authMiddleware`**: Validates JWT token from `Authorization: Bearer <token>`
- **`roleMiddleware(roles[])`**: Ensures user has required role(s)

### Protected Routes:
- Most routes require `authMiddleware`
- Role-specific routes use `roleMiddleware(["admin"])`, `["tutor"]`, etc.

---

## 🚀 API Endpoints & Flow

### Base URL: `/api/v1`

### **Authentication Routes** (`/auth/*`)

#### Public Endpoints:
- `POST /auth/admin/login` - Admin login (username + password)
- `POST /auth/parent/signup` - Parent registration
- `POST /auth/parent/login` - Parent login
- `POST /auth/tutor/signup` - Tutor registration (status: pending)
- `POST /auth/tutor/login` - Tutor login (only if approved)

#### Protected Endpoints:
- `GET /auth/tutor-applications` - Admin: View tutor applications
  - Query params: `status?`, `limit?` (default: 5)
- `POST /auth/parent/requests` - Parent: Submit tutoring request

---

### **Parent Routes** (`/parent/*`)

- `GET /parent/tutors` - Search tutors (public)
  - Query filters: `subject?`, `teachingMode?`, `minPrice?`, `maxPrice?`, `minExperience?`, `availability?`, `minRating?`
  - Returns: Sorted by rating (desc)

- `GET /parent/requests` - Admin: View parent requests
  - Query params: `type?` (latest/all), `status?`, `subject?`, `limit?`
  - Returns: Enriched with parent info (name, email, phone)

---

### **Tutor Routes** (`/tutor/*`) - All require tutor authentication

#### Assignment Management:
- `POST /tutor/create-assignment` - Create assignment (multipart/form-data)
  - Fields: `title`, `subject`, `class_grade`, `due_date`, `instructions?`, `allow_submission_online?`
  - Files: Multiple attachments (PDF, DOC, DOCX, JPEG, PNG, max 10MB)
  - Files uploaded to Cloudinary or local `/uploads`

- `PUT /tutor/update-assignment/:id` - Update assignment (multipart/form-data)
  - Ownership check: Only creator can update
  - New attachments replace old ones

- `DELETE /tutor/delete-assignment/:id` - Delete assignment
  - Ownership check: Only creator can delete
  - Deletes associated files from storage

#### Quiz Management:
- `POST /tutor/create-quiz` - Create quiz (JSON)
  - Body: `title`, `subject`, `class_grade`, `description?`, `questions[]`
  - Each question: `question`, `options[]`, `correct_answer` (must be in options)

- `PUT /tutor/update-quiz/:id` - Update quiz (JSON)
  - Can add/edit/delete questions
  - Questions with `id` are updated, new ones are added, missing ones are deleted

- `DELETE /tutor/delete-quiz/:id` - Delete quiz
  - Ownership check: Only creator can delete

---

### **Student Routes** (`/student/*`) - Requires student authentication

- `GET /student/assignments-quizzes` - Get assignments & quizzes
  - Query params: `status?` (upcoming/completed), `page?`, `limit?`
  - Filters by `class_grade` (from user profile or query param)
  - Returns: Separate arrays for `upcoming` and `completed` with summary counts

---

## 🔄 Request Flow Example

### Example: Creating an Assignment

```
1. Client Request
   POST /api/v1/tutor/create-assignment
   Headers: Authorization: Bearer <JWT_TOKEN>
   Body: multipart/form-data (fields + files)

2. Route Handler (routes/tutor.routes.ts)
   - Validates Swagger schema
   - Applies authMiddleware → verifies JWT
   - Applies roleMiddleware(["tutor"]) → checks role

3. Controller (controllers/tutor.controller.ts)
   - Parses multipart data (fields + files)
   - Validates file types & sizes
   - Uploads files via upload.ts (Cloudinary/local)
   - Extracts user from JWT token

4. Service (services/tutor.service.ts)
   - Creates Assignment document in MongoDB
   - Returns saved assignment

5. Response
   - 201 Created with assignment details
```

---

## 📤 File Upload System

### Upload Strategy:
- **Primary**: Cloudinary (if API keys configured)
- **Fallback**: Local `/uploads` directory

### Supported File Types:
- PDF: `application/pdf`
- Word: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Images: `image/jpeg`, `image/png`
- **Max Size**: 10MB per file

### File Management:
- Files stored with timestamped unique names
- URLs returned in assignment attachments
- Deletion: Files removed from storage when assignment deleted

---

## 🗄 Database Connection

- **Connection**: MongoDB via Mongoose
- **URI**: From `MONGO_URI` env variable
- **Connection Flow**:
  1. `server.ts` calls `connectDB()`
  2. `config/db.ts` connects to MongoDB
  3. Server starts only after successful connection

---

## 🔧 Configuration

### Environment Variables (`.env`):
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/fastifydb
JWT_SECRET=your-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Optional: Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Swagger Documentation:
- **URL**: `http://localhost:3000/docs`
- **Base Path**: `/api/v1`
- **Security**: Bearer JWT authentication

---

## 🐳 Docker Setup

### Services:
1. **backend**: Fastify app (Node.js 18 Alpine)
   - Port: From `PORT` env var
   - Volumes: Source code + node_modules exclusion
   - Depends on: mongo

2. **mongo**: MongoDB 6
   - Port: 27017
   - Volume: Persistent data storage

### Commands:
```bash
# Build and start
docker-compose up --build

# Stop
docker-compose down
```

---

## 📝 Key Features

### 1. **Tutor Approval Workflow**
- Tutors sign up with `status: "pending"`
- Admin can view applications via `/auth/tutor-applications`
- Only `approved` tutors can login

### 2. **Tutor Search & Filtering**
- Parents can search tutors by:
  - Subject, teaching mode, price range
  - Experience, availability, rating
- Results sorted by rating (highest first)

### 3. **Assignment & Quiz Management**
- Tutors create assignments with file attachments
- Quizzes with multiple-choice questions
- Both filtered by `class_grade` for students

### 4. **Parent Request System**
- Parents submit tutoring needs
- Admin can view all requests
- Status tracking: pending → assigned → completed/cancelled

### 5. **Student Dashboard**
- View upcoming/completed assignments & quizzes
- Filtered by class grade
- Pagination support

---

## 🔒 Security Features

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Authentication**: Token-based auth with 7-day expiry
3. **Role-Based Access Control**: Middleware enforces role permissions
4. **File Validation**: Type and size checks before upload
5. **Input Validation**: Swagger schemas + manual validation
6. **Ownership Checks**: Tutors can only modify their own assignments/quizzes

---

## 🚦 API Response Patterns

### Success Responses:
- `200 OK`: GET requests
- `201 Created`: POST requests (creation)
- Response body: `{ message?, data?, ... }`

### Error Responses:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server errors

---

## 📈 Future Enhancements (Potential)

1. **Student Registration**: Currently implied via parent
2. **Assignment Submissions**: Students submit work
3. **Quiz Taking**: Students take quizzes, get scores
4. **Messaging System**: Communication between users
5. **Payment Integration**: Tutor payment processing
6. **Rating System**: Parents rate tutors
7. **Notification System**: Email/SMS notifications
8. **Tutor Matching Algorithm**: Auto-match parents with tutors

---

## 🎯 Summary

**TutorEdge Backend** is a well-structured, scalable tutoring platform API that:
- Supports multi-role authentication (Admin, Parent, Tutor, Student)
- Manages tutor profiles, assignments, quizzes, and parent requests
- Implements secure file uploads and role-based access control
- Provides comprehensive API documentation via Swagger
- Is containerized for easy deployment

The architecture follows best practices with clear separation of concerns, making it maintainable and extensible for future features.

