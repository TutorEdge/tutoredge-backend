# 📮 Postman Testing Guide - Tutor Flow

## Base URL
```
http://localhost:3000/api/v1
```

---

## Step 1: Register a Tutor (Signup)

### Request Details
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/auth/tutor/signup`
- **Headers**: 
  ```
  Content-Type: application/json
  ```

### Raw JSON Body
```json
{
  "fullName": "John Smith",
  "email": "john.smith@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!",
  "subjects": ["Mathematics", "Physics", "Chemistry"],
  "languages": ["English", "Spanish"],
  "classesTaught": ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  "qualification": "M.Sc. in Mathematics",
  "college": "MIT",
  "yearsOfExperience": 5
}
```

### Expected Response (201 Created)
```json
{
  "_id": "...",
  "role": "tutor",
  "fullName": "John Smith",
  "email": "john.smith@example.com",
  "phone": "+1234567890",
  "subjects": ["Mathematics", "Physics", "Chemistry"],
  "languages": ["English", "Spanish"],
  "classesTaught": ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  "qualification": "M.Sc. in Mathematics",
  "college": "MIT",
  "yearsOfExperience": 5,
  "status": "pending",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**⚠️ IMPORTANT**: After signup, the tutor will have `status: "pending"`. You need to manually approve the tutor in the database before they can login (see note below).

---

## Step 2: Login as Tutor

### Request Details
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/auth/tutor/login`
- **Headers**: 
  ```
  Content-Type: application/json
  ```

### Raw JSON Body
```json
{
  "email": "john.smith@example.com",
  "password": "SecurePass123!"
}
```

### Expected Response (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "role": "tutor",
    "fullName": "John Smith",
    "email": "john.smith@example.com",
    "status": "approved",
    ...
  }
}
```

**⚠️ CRITICAL**: If you get error `"Tutor not approved yet"`, you need to:
1. Manually update the tutor status in MongoDB to `"approved"`, OR
2. Use admin endpoint to approve (if implemented)

**MongoDB Command to Approve Tutor**:
```javascript
db.users.updateOne(
  { email: "john.smith@example.com" },
  { $set: { status: "approved" } }
)
```

**Save the `token` from this response** - you'll need it for Step 3!

---

## Step 3: Create Quiz

### Request Details
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/tutor/create-quiz`
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer <YOUR_TOKEN_FROM_STEP_2>
  ```

### Raw JSON Body
```json
{
  "title": "Mathematics Quiz - Algebra Basics",
  "subject": "Mathematics",
  "class_grade": "Grade 9",
  "description": "A quiz covering basic algebraic concepts including linear equations and inequalities",
  "questions": [
    {
      "question": "What is the value of x in the equation 2x + 5 = 15?",
      "options": ["5", "10", "7", "8"],
      "correct_answer": "5"
    },
    {
      "question": "Which of the following is a linear equation?",
      "options": ["x² + 5 = 10", "2x + 3 = 7", "x³ - 2 = 0", "√x = 4"],
      "correct_answer": "2x + 3 = 7"
    },
    {
      "question": "Solve for y: 3y - 7 = 14",
      "options": ["y = 5", "y = 7", "y = 9", "y = 11"],
      "correct_answer": "y = 7"
    },
    {
      "question": "What is the slope of the line y = 2x + 3?",
      "options": ["2", "3", "5", "1"],
      "correct_answer": "2"
    }
  ]
}
```

### Expected Response (201 Created)
```json
{
  "message": "Quiz created successfully",
  "quiz": {
    "id": "...",
    "title": "Mathematics Quiz - Algebra Basics",
    "subject": "Mathematics",
    "class_grade": "Grade 9",
    "description": "A quiz covering basic algebraic concepts including linear equations and inequalities",
    "questions_count": 4,
    "created_at": "..."
  }
}
```

---

## Alternative Quiz Examples

### Example 2: Science Quiz
```json
{
  "title": "Physics Quiz - Forces and Motion",
  "subject": "Physics",
  "class_grade": "Grade 10",
  "description": "Test your understanding of Newton's laws and motion",
  "questions": [
    {
      "question": "What is Newton's First Law of Motion?",
      "options": [
        "F = ma",
        "An object at rest stays at rest unless acted upon by a force",
        "For every action there is an equal and opposite reaction",
        "Energy cannot be created or destroyed"
      ],
      "correct_answer": "An object at rest stays at rest unless acted upon by a force"
    },
    {
      "question": "What is the unit of force?",
      "options": ["Joule", "Newton", "Watt", "Pascal"],
      "correct_answer": "Newton"
    }
  ]
}
```

### Example 3: Simple Quiz (Minimal)
```json
{
  "title": "Quick Math Test",
  "subject": "Mathematics",
  "class_grade": "Grade 8",
  "questions": [
    {
      "question": "What is 5 + 3?",
      "options": ["6", "7", "8", "9"],
      "correct_answer": "8"
    },
    {
      "question": "What is 10 × 2?",
      "options": ["18", "20", "22", "24"],
      "correct_answer": "20"
    }
  ]
}
```

---

## Common Errors & Solutions

### Error: "Tutor not approved yet"
**Solution**: Update tutor status in MongoDB:
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { status: "approved" } }
)
```

### Error: "Unauthorized" or "Forbidden"
**Solution**: 
- Make sure you copied the full token from Step 2
- Token format: `Bearer <token>` (with space after "Bearer")
- Token expires after 7 days

### Error: "correct_answer must be one of options"
**Solution**: The `correct_answer` must exactly match one of the strings in the `options` array (case-sensitive).

### Error: "Missing required fields"
**Solution**: Ensure all required fields are present:
- Tutor signup: fullName, email, phone, password, subjects, languages, classesTaught, qualification, college, yearsOfExperience
- Quiz: title, subject, class_grade, questions

---

## Postman Collection Setup Tips

1. **Create Environment Variables**:
   - `base_url`: `http://localhost:3000/api/v1`
   - `tutor_token`: (set after login)

2. **Use Variables in URLs**:
   - `{{base_url}}/auth/tutor/signup`
   - `{{base_url}}/auth/tutor/login`
   - `{{base_url}}/tutor/create-quiz`

3. **Auto-save Token**:
   - In login request, add Tests tab:
   ```javascript
   if (pm.response.code === 200) {
       const jsonData = pm.response.json();
       pm.environment.set("tutor_token", jsonData.token);
   }
   ```

4. **Use Token in Headers**:
   - Authorization: `Bearer {{tutor_token}}`

---

## Quick Test Sequence

1. ✅ Signup tutor → Get user object
2. ⚠️ Manually approve tutor in DB (or skip if already approved)
3. ✅ Login tutor → Get token
4. ✅ Create quiz → Use token in Authorization header

---

## Notes

- **Tutor Status**: New tutors start with `status: "pending"` and cannot login until approved
- **Token Expiry**: JWT tokens expire after 7 days
- **Questions Validation**: Each question must have at least 2 options, and `correct_answer` must match one option exactly
- **Class Grade**: Use consistent format (e.g., "Grade 9" not "9th grade")

