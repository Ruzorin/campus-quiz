# API Documentation

Base URL: `/api` (Production: `https://campus-quiz-backend.onrender.com/api`)

## Authentication (`/auth`)
- `GET /me`: Get current user session.
- `POST /microsoft`: Login/Register with Microsoft OAuth.
- `POST /logout`: Logout user.

## Study Sets (`/sets`)
- `GET /`: Get user's sets.
- `GET /:id`: Get specific set details.
- `POST /`: Create a new study set.
- `GET /search`: Search for public sets.
- `POST /:id/copy`: Fork/Clone a set.
- `GET /smart-review`: Get SRS (Spaced Repetition) items.

## Classes (`/classes`)
- `GET /`: Get joined classes.
- `POST /`: Create a class.
- `GET /:id`: Get class details & members.
- `POST /join`: Join class by code.
- `GET /:id/assignments`: Get class assignments.

## Teacher (`/teacher`) - *Requires Teacher Role*
- `GET /dashboard`: Dashboard statistics.
- `GET /classes`: Owned classes.
- `GET /sets`: Owned sets.
- `POST /assignments`: Create assignment.

## Game & Progress (`/game`, `/progress`)
- `GET /game/check/:code`: Check active game instance.
- `POST /progress/batch`: Batch save study progress (XP, Terms).
- `GET /progress/streak`: Get streak status.

## Users (`/users`)
- `GET /profile`: Get full profile stats.
- `PUT /profile`: Update username/avatar.

## Leaderboard (`/leaderboard`)
- `GET /global`: Global XP rankings.
- `GET /class/:id`: Class-specific rankings.
