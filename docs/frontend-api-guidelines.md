# Frontend API Guidelines

> Quick reference for frontend devs and AI agents connecting to the Vibe Sport backend.

---

## 1. Environment

| Variable       | Example                         |
|---------------|----------------------------------|
| `API_BASE_URL` | `http://localhost:3000`          |
| `SOCKET_URL`   | `http://localhost:3000`          |

---

## 2. REST Conventions

| Rule                    | Detail                                         |
|------------------------|-------------------------------------------------|
| Content-Type           | `application/json` (except uploads → `multipart/form-data`) |
| Authorization          | `Bearer <access_token>` header                  |
| Date format            | ISO 8601 (`2026-01-10T18:00:00Z`)               |
| Pagination             | `page` (0-based), `size` (default varies)       |
| File uploads           | `POST /upload/image`, `/upload/images`, `/upload/video`, `/upload/file` |

---

## 3. API Groups Summary

| Tag        | Base Path                | Auth Required | Description                          |
|-----------|--------------------------|---------------|--------------------------------------|
| Auth       | `/auth/*`               | No            | Login, Register                      |
| Users      | `/users/*`              | Varies        | Profile, Password, Logout            |
| Venues     | `/venues/*`             | No            | Search, Detail                       |
| Availability | `/courts/:id/availability` | No         | Court slots for a date               |
| Bookings   | `/bookings/*`           | Yes           | Hold → Confirm → Cancel              |
| My Bookings| `/me/bookings`          | Yes           | Customer's own bookings              |
| Owner      | `/owner/*`              | Yes           | Owner bookings, cancel, analytics    |
| Reviews    | `/bookings/:id/review`, `/venues/:id/reviews`, `/reviews/*` | Varies | Create, list, reply |
| Chat       | `/conversations/*`      | Yes           | Conversations, messages              |
| Favorites  | `/venues/:id/favorite/*`, `/favorites` | Yes | Add, remove, toggle, list         |
| Payments   | `/payments/*`           | No            | PayOS webhook & callback             |
| Upload     | `/upload/*`             | Yes           | Image, video, file upload & delete   |

---

## 4. WebSocket Connection

### App Gateway (`/`)
```typescript
import { io } from 'socket.io-client';
const socket = io(SOCKET_URL, {
  query: { token: accessToken },
});
socket.emit('join_venue', venueId);
socket.on('slot.locked', (data) => { /* update UI */ });
socket.on('slot.released', (data) => { /* update UI */ });
socket.on('slot.updated', (data) => { /* update UI */ });
```

### Chat Gateway (`/chat`)
```typescript
const chatSocket = io(`${SOCKET_URL}/chat`);
chatSocket.emit('join_conversation', { conversationId, userId });
chatSocket.on('new_message', (data) => { /* append message */ });
chatSocket.on('user_typing', (data) => { /* typing indicator */ });
chatSocket.emit('send_message', { conversationId, userId, content });
chatSocket.emit('typing', { conversationId, userId, isTyping: true });
```

---

## 5. Booking Flow

```
1. GET /courts/:courtId/availability?date=YYYY-MM-DD
2. POST /bookings/hold  →  { bookingId, holdExpiresAt }
3. POST /bookings/:bookingId/confirm  →  { bookingId, status: "CONFIRMED" }
4. (optional) POST /bookings/:bookingId/cancel
```

**Race conditions:** If `409 Conflict`, the slot was taken — re-fetch availability.

---

## 6. Common Mistakes

| #  | Mistake                              | Fix                                          |
|----|--------------------------------------|----------------------------------------------|
| 1  | Sending `phoneOrEmail` as `email`   | Use `phoneOrEmail` field name                |
| 2  | Using `1` instead of `0` for page   | Pagination is 0-based                        |
| 3  | Not joining venue room              | Must `emit('join_venue', venueId)` first      |
| 4  | Using default namespace for chat     | Chat is on `/chat` namespace                 |
| 5  | Missing `Bearer` prefix             | `Authorization: Bearer <token>`              |
| 6  | Sending JSON for file upload        | Use `multipart/form-data` for `/upload/*`    |
