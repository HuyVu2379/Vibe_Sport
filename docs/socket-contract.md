# WebSocket / Socket.IO Contract

## A. Connection
- **Namespace**: `/` (Default)
- **Transport**: Polling + Websocket
- **Auth**:
  - **Query Param**: `?token=<jwt_token>` (Preferred)
  - **Header**: `Authorization: Bearer <jwt_token>`
- **Lifecycle**:
  - On Connect: Server verifies token.
  - If Valid: Client is automatically joined to `user_{userId}` room.
  - If Invalid: Connection stays open (for public events), but identifying events are not sent.

## B. Rooms
| Room Name | Access | Purpose |
| :--- | :--- | :--- |
| `user_{userId}` | Private (Server Only) | Personal notifications, booking confirmations. |
| `venue_{venueId}` | Public / Shared | Real-time slot updates (locks/bookings) for a specific venue. |

**Joining Rooms**:
- `user_{userId}`: Auto-joined on valid auth.
- `venue_{venueId}`: Client **MUST** explicitly join when viewing venue schedule.

## C. Client → Server Events

### 1. Join Venue
Subscribe to real-time slot updates for a specific venue.
- **Event**: `join_venue`
- **Payload**: `string` (venueId)
- **Example**:
  ```javascript
  socket.emit('join_venue', 'uuid-venue-id');
  ```

### 2. Leave Venue
Unsubscribe from updates (e.g., user leaves the screen).
- **Event**: `leave_venue`
- **Payload**: `string` (venueId)

## D. Server → Client Events

### 1. Slot Locked (Hold)
Broadcasted to `venue_{venueId}` when a user successfully holds a slot.
- **Event**: `slot.locked`
- **Payload**:
  ```json
  {
    "courtId": "uuid",
    "startTime": "2026-01-10T18:00:00Z",
    "endTime": "2026-01-10T19:00:00Z",
    "bookingId": "uuid",
    "holderId": "uuid" 
  }
  ```
- **Action**: Frontend should "gray out" or mark this slot as "In Hold" immediately.

### 2. Slot Released
Broadcasted to `venue_{venueId}` when a hold expires or is cancelled.
- **Event**: `slot.released`
- **Payload**:
  ```json
  {
    "courtId": "uuid",
    "startTime": "2026-01-10T18:00:00Z",
    "endTime": "2026-01-10T19:00:00Z"
  }
  ```
- **Action**: Frontend should make the slot available again.

### 3. Slot Updated (Confirmed)
Broadcasted to `venue_{venueId}` when a booking is confirmed.
- **Event**: `slot.updated`
- **Payload**:
  ```json
  {
    "courtId": "uuid",
    "startTime": "2026-01-10T18:00:00Z",
    "endTime": "2026-01-10T19:00:00Z",
    "status": "CONFIRMED",
    "bookingId": "uuid"
  }
  ```
- **Action**: Mark slot as Booked (red/unavailable).

### 4. Booking Confirmed (Personal)
Sent to `user_{userId}` when their booking is successfully confirmed (e.g., after payment webhook).
- **Event**: `booking.confirmed`
- **Payload**:
  ```json
  {
    "bookingId": "uuid",
    "status": "CONFIRMED"
  }
  ```
- **Action**: Show success notification or redirect to booking details.

### 5. New Notification
Sent to `user_{userId}`.
- **Event**: `notification.new`
- **Payload**:
  ```json
  {
    "id": "uuid",
    "type": "BOOKING_REMINDER",
    "message": "Your game starts in 1 hour!",
    "createdAt": "2026-01-10T...",
    "read": false
  }
  ```

## E. Reliability & Ordering
- **Idempotency**: Socket events are fire-and-forget.
- **State Synchronization**: On receiving `slot.locked` or `slot.updated`, blindly update the local state.
- **Race Condition**: If `slot.locked` arrives while user is trying to book, the REST API `POST /bookings/hold` will fail with `409`. Trust the REST API failure.
