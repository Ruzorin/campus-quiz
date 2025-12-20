# Technical Architecture & Schema

## 🏗 Technology Stack

- **Frontend**: React (Vite) + TypeScript
  - *Styling*: Tailwind CSS (Utility-first)
  - *State*: React Context / Zustand (for simple global state like Auth)
  - *PWA*: vite-plugin-pwa
- **Backend**: Node.js + Express + TypeScript
  - *API*: RESTful
  - *Validation*: Zod
- **Database**: MySQL / TiDB
  - *ORM*: Drizzle ORM (Type-safe SQL)

## 🗄 Database Schema Design

### 1. Identity & Auth
```typescript
// Users Table
id: uuid (PK)
email: varchar(255) (Unique)
password_hash: varchar(255)
username: varchar(50)
created_at: timestamp
```

### 2. Content Management
```typescript
// StudySets Table
id: uuid (PK)
owner_id: uuid (FK -> Users.id)
title: varchar(255)
description: text
is_public: boolean (default: false)

// Terms Table
id: uuid (PK)
set_id: uuid (FK -> StudySets.id)
term: text
definition: text
image_url: varchar(255) (optional)
```

### 3. Social Structure
```typescript
// Classes Table
id: uuid (PK)
name: varchar(100)
owner_id: uuid (FK -> Users.id)
join_code: varchar(10) (Unique)

// ClassMembers Table
id: uuid (PK)
class_id: uuid (FK -> Classes.id)
user_id: uuid (FK -> Users.id)
role: enum('student', 'admin')
joined_at: timestamp
```

### 4. Progression & Logic
```typescript
// UserProgress Table (SRS State)
id: uuid (PK)
user_id: uuid (FK -> Users.id)
term_id: uuid (FK -> Terms.id)
mastery_level: int (0-5)
last_studied_at: timestamp

// ActivityLogs Table (For Leaderboards)
id: uuid (PK)
user_id: uuid (FK -> Users.id)
class_id: uuid (FK -> Classes.id)
activity_type: enum('match_completed', 'set_studied', 'term_mastered')
score: int (Seconds for match, Points for others)
timestamp: timestamp
```

## 🔌 API Contract (Core)
- `POST /api/auth/register` -> { user_token }
- `GET /api/sets` -> [ { id, title, term_count } ]
- `POST /api/classes/join` -> { class_id }
- `GET /api/classes/:id/leaderboard` -> [ { user, score } ]
