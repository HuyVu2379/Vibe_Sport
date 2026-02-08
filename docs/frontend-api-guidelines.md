# Frontend & AI Guidelines

## 1. Environment Setup
Ensure your `.env` contains the correct API and Socket URLs.
Refer to `env.example` for the full list.

- Base URL: `http://localhost:3000/api/v1` (Default)
- Socket URL: `http://localhost:3000`

## 2. Calling REST APIs
- All `POST`, `PUT`, `DELETE` requests **MUST** send `Content-Type: application/json`.
- Authenticated requests **MUST** include `Authorization: Bearer <token>`.
- **Dates**: Send strictly as ISO 8601 strings (e.g., `2026-01-10T18:00:00Z`).
- **Pagination**: Zero-based. `page=0` is the first page.

## 3. Real-time Interactions (WebSockets)
- **Connect** to the socket immediately after login.
- **Join/Leave Venues**: When the user enters the "Venue Details" (Calendar) screen, emit `join_venue`. When they exit, emit `leave_venue`.
- **Listen for Updates**:
  - `slot.locked`: Another user is holding a slot. Gray it out immediately.
  - `slot.released`: A hold expired or was released. Make it clickable again.
  - `slot.updated`: A booking was confirmed. Mark as booked.

## 4. Booking Flow Implementation
1. **View Schedule**: Call `GET /courts/{courtId}/availability`.
2. **Select Slot**: User taps a slot.
3. **Hold Slot**:
   - Call `POST /bookings/hold`.
   - Backend acquires lock + Redis hold.
   - **Frontend**: Show a timer (default 5-10 mins).
4. **Confirm**:
   - User reviews details.
   - Call `POST /bookings/{bookingId}/confirm`.
   - If payment required (Deposit), the response contains `paymentUrl`. Redirect user.
   - If no payment, booking becomes `CONFIRMED`.

## 5. Handling Race Conditions
Since multiple users might tap the same slot:
- If `POST /bookings/hold` returns `409 Conflict`, the slot was taken milliseconds ago.
- **Action**: Show "Slot taken" toast and refresh availability.

## 6. Common Mistakes to Avoid
- **Guessing fields**: Do NOT guess API fields. Check `openapi.json`.
- **Ignoring Trace IDs**: If you report a bug, include the `traceId` from the error response.
- **Hardcoding URLs**: Always use environment variables.
