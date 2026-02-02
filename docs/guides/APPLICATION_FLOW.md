# GoodDeeds Application Flow

## 🏠 User Journey

```
┌─────────────────────────────────────────────────────────┐
│                    LANDING PAGE                          │
│                 (Home with Features)                     │
│                                                          │
│  [Sign Up Now] [Browse Posts] [Create Post] [Login]    │
└────────────────┬──────────────────────────────────────┘
                 │
     ┌───────────┼───────────┐
     │           │           │
     ▼           ▼           ▼
  [SIGNUP]   [LOGIN]    [BROWSE]
     │           │           │
     ▼           ▼           ▼
┌────────┐ ┌─────────┐ ┌──────────┐
│Register│ │ Verify  │ │View Posts│
│ Email  │ │Password │ │(Public)  │
└────────┘ └─────────┘ └──────────┘
     │           │           │
     ▼           ▼           ▼
  [API]      [API]       [API]
  signup     login       GET posts
     │           │           │
     ▼           ▼           ▼
 [DATABASE]  [JWT]     [PUBLIC]
  Store      Token     Data
  User       Gen
     │           │
     └───────────┼───────────┐
                 │           │
        Authenticated    Unauthenticated
                 │           │
        ┌────────▼─┐     ┌───▼──────┐
        │ DASHBOARD│     │  BROWSE   │
        └─┬───────┬┘     └───────────┘
          │       │
      ┌───▼┐  ┌──▼────┐
      │View│  │Create │
      │    │  │ Post  │
      │Post│  │       │
      └────┘  └──┬────┘
                 │
              [API]
             POST posts
                 │
              [DB]
             Store
              Post
```

## 🔐 Authentication Flow

```
User                    Frontend              Backend              Database
│                          │                     │                    │
├─ Click Signup ────────────►                     │                    │
│                          │                     │                    │
├──────────────────────────► Fill Form           │                    │
│                          │                     │                    │
├──────────────────────────► Submit ─────────────► Validate           │
│                          │                     ├─ Hash Password ─────►
│                          │                     ├─ Check Duplicate ◄──┤
│                          │                     ├─ Create User ───────►
│                          │                     │                     │
│                          ◄─────────────────── JWT Token ──────────┐  │
│                          │                     │                   │  │
├───────── Store Token ────┤                     │                   │  │
│  (localStorage)          │                     │                   │  │
│                          │                     │                   │  │
├─ Redirect to Posts ──────►                     │                   │  │
│                          │                     │                   │  │
├──────── Ready! ──────────┤                     │                   │  │
```

## 📝 Post Creation Flow

```
Authenticated User       Frontend              Backend              Database
│                          │                     │                    │
├─ Click Create ───────────►                     │                    │
│                          │                     │                    │
├─────────────────────────► Create Form          │                    │
│                          │                     │                    │
├─ Fill Details ───────────►                     │                    │
│                          │                     │                    │
├─ Submit ─────────────────► [Bearer Token]      │                    │
│                          │        │            │                    │
│                          │        └───────────►Validate Token       │
│                          │                     ├─ Create Post ──────►
│                          │                     │                     │
│                          │                    ┌╌╌╌╌╌╌╌╌╌┐           │
│                          │                    │ Check   │           │
│                          │                    │ Token   │           │
│                          │                    └╌╌╌╌╌╌╌╌╌┘           │
│                          ◄─────────────────── Post Created ─────────┤
│                          │                     │                    │
├─ Redirect to Posts ──────►                     │                    │
│                          │                     │                    │
└──────── Success! ────────┤                     │                    │
```

## 📊 Data Model Relationships

```
┌──────────────┐
│    USER      │
├──────────────┤
│ id (PK)      │◄─────────────┐
│ email        │              │
│ password     │              │
│ name         │              │
│ bio          │              │
│ location     │              │
└──────────────┘              │
      │                       │
      │ authorId (FK)         │
      │                       │
      ▼                       │
┌──────────────────┐    ┌─────────────┐
│     POST         │    │  COMMENT    │
├──────────────────┤    ├─────────────┤
│ id (PK)          │    │ id (PK)     │
│ title            │    │ content     │
│ description      │    │ postId (FK) │◄─── One Post
│ type             │    │ userId (FK) │ has many Comments
│ category         │    │ createdAt   │
│ status           │    └─────────────┘
│ authorId (FK)────┼────┐
│ createdAt        │    │ userId (FK)
└──────────────────┘    │
                        └────► Points back to USER

┌─────────────┐
│   MESSAGE   │
├─────────────┤
│ id (PK)     │
│ content     │
│ senderId    │────► Sender (USER)
│ receiverId  │────► Receiver (USER)
│ createdAt   │
└─────────────┘
```

## 🛣️ API Routes Map

```
/api/
├── auth/
│   ├── signup/
│   │   └── route.ts (POST)
│   │       ├─ Hash password
│   │       ├─ Create user
│   │       └─ Return JWT
│   │
│   └── login/
│       └── route.ts (POST)
│           ├─ Verify credentials
│           ├─ Generate JWT
│           └─ Return user data
│
└── posts/
    └── route.ts
        ├─ GET: Fetch all posts
        │   └─ Include author data
        │
        └─ POST: Create post (auth required)
            ├─ Verify JWT
            ├─ Create post
            └─ Return post data
```

## 🌐 Page Routes

```
/                  (Home page)
├── /signup        (Registration form)
├── /login         (Login form)
├── /posts         (Browse posts - public)
└── /create        (Create post - auth required)
```

## 📱 Component Hierarchy

```
layout.tsx (Root)
├── Navigation bar
│   ├── GoodDeeds logo
│   ├── Home link
│   ├── Browse Posts
│   ├── Create Post
│   └── Login
│
├── Page content
│   ├── Home page
│   │   ├── Hero section
│   │   ├── Features grid
│   │   └── CTA buttons
│   │
│   ├── Signup page
│   │   └── Signup form
│   │
│   ├── Login page
│   │   └── Login form
│   │
│   ├── Posts page
│   │   ├── Filter buttons
│   │   └── Posts grid
│   │
│   └── Create page
│       └── Post form
│
└── Footer (prepared)
```

## 🔄 State Management

```
Browser LocalStorage:
├── authToken
│   └─ JWT token (7-day validity)
│
└── user
    ├── id
    ├── email
    └── name

API Response:
├── User object
├── Token
├── Error messages
└── Post data
```

## ⚡ Request/Response Flow

```
HTTP Request:
┌─────────────────────────────────┐
│ POST /api/auth/login            │
│ Content-Type: application/json  │
│                                 │
│ {                               │
│   "email": "user@example.com"  │
│   "password": "password123"     │
│ }                               │
└─────────────────────────────────┘
         │
         ▼ Processing
         
HTTP Response:
┌─────────────────────────────────┐
│ 200 OK                          │
│ Content-Type: application/json  │
│                                 │
│ {                               │
│   "message": "Login successful",│
│   "token": "eyJhbGc...",        │
│   "user": {                     │
│     "id": "abc123",             │
│     "email": "user@...",        │
│     "name": "John Doe"          │
│   }                             │
│ }                               │
└─────────────────────────────────┘
```

## 🔐 Authentication Mechanism

```
1. User Login
   Email + Password
         │
         ▼
   API /auth/login
         │
         ├─ Query database for user
         ├─ Compare password with bcrypt
         └─ If valid:
            ├─ Create JWT token
            │  {
            │    payload: { id, email },
            │    secret: JWT_SECRET,
            │    expiry: 7 days
            │  }
            │
            └─ Return token to client

2. Client Storage
   JWT Token → localStorage
   
3. Future Requests
   GET /api/posts
   Headers: Authorization: Bearer JWT_TOKEN
   
4. Server Validation
   API validates token
   ├─ Extract payload
   ├─ Verify signature
   ├─ Check expiry
   └─ If valid → Process request
```

## 🗄️ Database Operation Sequence

```
Signup:
User Input
    │
    ▼
Validation
    │
    ├─ Required fields?
    ├─ Email format?
    └─ Email unique?
    │
    ▼
Hash Password (bcrypt)
    │
    ▼
Create Record in DB
    │
    ├─ user.create({
    │   email,
    │   password: hashed,
    │   name,
    │   createdAt,
    │   updatedAt
    │ })
    │
    ▼
Generate JWT
    │
    ▼
Return to Client
```

---

This visual guide shows how all components of the GoodDeeds application work together to provide a complete social networking experience for community help!
