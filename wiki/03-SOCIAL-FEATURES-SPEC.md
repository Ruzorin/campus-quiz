# Social & Competitive Features Specification

## 🏆 Leaderboards (FR-LB-01, FR-LB-02)

### Algorithm
The leaderboard is **Class-Specific**.
**Score Calculation:**
- `Study Points`: 1 point per term mastered (mastery_level increases).
- `Match Bonus`:
  - Top 10% time: +50 pts
  - Top 25% time: +25 pts
  - Completion: +10 pts
- **Time Window**:
  - `Weekly`: Resets every Monday 00:00 UTC.
  - `All-time`: Cumulative.

### Technical Implementation
- Backend calculates scores on-the-fly or via scheduled jobs (CRON) for heavy loads.
- For this scale, real-time aggregation on `ActivityLogs` table is sufficient.

## 🏫 Class Management (FR-CL-01, FR-CL-04)

### Join Flow
1. User enters `join_code` (e.g., "MATH101").
2. API validates code exists.
3. API checks if User is already member.
4. If valid, insert into `ClassMembers` with role `student`.

### Set Sharing
- Sets have `is_public`.
- However, for Classes, we introduce a `ClassSets` link table (or simple logic):
  - If a Set is owned by the Class Owner, it is automatically visible to the Class.
  - OR, explicit "Share to Class" button which links the Set to the Class ID.

## 🟢 Active Status (FR-AU-01)
- **Mechanism**: "Heartbeat" API call.
- Client sends `POST /api/heartbeat` every 2 minutes while app is open.
- Server updates `last_seen` in Users table (or Redis if available).
- "Active" = `last_seen < 15 mins ago`.
