# Socket.IO — Real-time Contract

> Version: 2.0  
> This document covers **both** the main App gateway and the Chat gateway.

---

## 1. Connection

### 1.1 App Gateway (default namespace `/`)

| Setting      | Value                            |
|-------------|----------------------------------|
| Transport   | `websocket` (fall back `polling`)|
| Auth        | `token` query param **or** `Authorization: Bearer <token>` header |
| CORS        | `*`                              |

**On connect** the server:
1. Extracts and verifies the JWT.
2. Joins the client into `user_{userId}` room for personal events.
3. If the token is missing → connection succeeds but no user room is joined.

### 1.2 Chat Gateway (namespace `/chat`)

| Setting      | Value                            |
|-------------|----------------------------------|
| Namespace   | `/chat`                          |
| Transport   | `websocket` (fall back `polling`)|
| CORS        | `*` (credentials: true)         |

> **Note:** The Chat gateway does NOT perform JWT authentication on connect.  
> User identity is passed in each event payload (`userId`).

---

## 2. Room Structure

### App Gateway Rooms

| Room Pattern    | Who Joins         | Events Received                         |
|----------------|-------------------|-----------------------------------------|
| `user_{userId}` | Auto on connect   | `booking.confirmed`, `notification.new` |
| `venue_{venueId}` | Client request  | `slot.locked`, `slot.released`, `slot.updated` |

### Chat Gateway Rooms

| Room Pattern                | Who Joins          | Events Received        |
|----------------------------|--------------------|-----------------------|
| `conversation:{conversationId}` | Client request | `new_message`, `user_typing` |

---

## 3. Client → Server Events

### 3.1 App Gateway

#### `join_venue`

Join a venue room for real-time slot updates.

```json
// payload: venueId (string)
"uuid-venue-id"
```

#### `leave_venue`

Leave a venue room.

```json
// payload: venueId (string)
"uuid-venue-id"
```

### 3.2 Chat Gateway

#### `join_conversation`

Join a conversation room. Server verifies user is a participant.

```json
{
  "conversationId": "uuid",
  "userId": "uuid"
}
```

**Response:**
```json
{ "success": true, "conversationId": "uuid" }
// or
{ "success": false, "error": "Not a participant" }
```

#### `leave_conversation`

Leave a conversation room.

```json
{
  "conversationId": "uuid"
}
```

**Response:**
```json
{ "success": true }
```

#### `send_message`

Send a message via WebSocket (alternative to REST `POST /conversations/:id/messages`).

```json
{
  "conversationId": "uuid",
  "userId": "uuid",
  "content": "Hello!"
}
```

**Response:**
```json
{
  "success": true,
  "message": { "id": "uuid", "conversationId": "uuid", "senderId": "uuid", "content": "Hello!", "type": "TEXT", "createdAt": "..." }
}
```

#### `typing`

Broadcast typing indicator to other participants.

```json
{
  "conversationId": "uuid",
  "userId": "uuid",
  "isTyping": true
}
```

---

## 4. Server → Client Events

### 4.1 App Gateway — Venue Room Events

#### `slot.locked`

A slot was just held by someone.

```json
{
  "courtId": "uuid",
  "startTime": "2026-01-10T18:00:00Z",
  "endTime": "2026-01-10T19:00:00Z",
  "status": "HOLD"
}
```

#### `slot.released`

A hold expired or was cancelled → slot is available again.

```json
{
  "courtId": "uuid",
  "startTime": "...",
  "endTime": "...",
  "status": "AVAILABLE"
}
```

#### `slot.updated`

A booking was confirmed → slot is now occupied.

```json
{
  "courtId": "uuid",
  "startTime": "...",
  "endTime": "...",
  "status": "CONFIRMED"
}
```

### 4.2 App Gateway — User Room Events

#### `booking.confirmed`

Your booking was confirmed.

```json
{
  "bookingId": "uuid",
  "status": "CONFIRMED"
}
```

#### `notification.new`

A new notification for the user.

```json
{
  "id": "uuid",
  "type": "BOOKING_REMINDER",
  "title": "Reminder",
  "body": "Your booking is in 1 hour",
  "createdAt": "..."
}
```

### 4.3 Chat Gateway — Conversation Room Events

#### `new_message`

A new message was sent in the conversation.

```json
{
  "conversationId": "uuid",
  "message": {
    "id": "uuid",
    "conversationId": "uuid",
    "senderId": "uuid",
    "content": "Hello!",
    "type": "TEXT",
    "createdAt": "..."
  }
}
```

#### `user_typing`

A participant's typing status changed.

```json
{
  "userId": "uuid",
  "isTyping": true
}
```

---

## 5. Reliability & State Sync

| Concern          | Strategy                                                                 |
|-----------------|-------------------------------------------------------------------------|
| Reconnect       | Socket.IO built-in reconnection (max 5 attempts, backoff)              |
| Missed events   | After reconnect, call `GET /courts/:id/availability?date=` to re-sync  |
| Chat missed msgs| After reconnect, call `GET /conversations/:id/messages` to re-sync     |
| Hold expiry     | `holdExpiresAt` is authoritative; start a local timer, re-fetch on expiry |
| Ordering        | Use `createdAt` for message ordering                                   |
