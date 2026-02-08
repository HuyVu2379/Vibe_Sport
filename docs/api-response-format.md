# API Response Format

## Success Response
The backend APIs currently return **DTOs directly** as JSON.
There is **NO** universal wrapper (like `{ success: true, data: ... }`).

**Example (Get Venue):**
```json
{
  "venueId": "uuid...",
  "name": "Sân ABC",
  "address": "123 Street..."
}
```

**Example (List Venues):**
```json
{
  "items": [ ... ],
  "page": 0,
  "size": 10,
  "total": 5
}
```

**Implied Success**: If the HTTP Status Code is `2xx` (200, 201), the request was successful.

---

## Error Response
All errors follow a standardized format handled by the `GlobalExceptionFilter`.

**Structure:**
```json
{
  "errorCode": "string",
  "message": "string",
  "traceId": "uuid-string"
}
```

- **errorCode**: A machine-readable code (e.g., `SLOT_CONFLICT`, `HOLD_EXPIRED`, `NOT_FOUND`).
- **message**: A human-readable error message.
- **traceId**: Unique request ID for debugging.

**Common Error Codes & HTTP Status:**

| Error Code | HTTP Status | Meaning |
| :--- | :--- | :--- |
| `SLOT_CONFLICT` | 409 | Slot is already booked or locked. |
| `HOLD_EXPIRED` | 410 | The hold on this booking has expired. |
| `BOOKING_NOT_FOUND` | 404 | Booking ID does not exist. |
| `INVALID_BOOKING_TRANSITION` | 400 | Cannot change booking status (e.g., Confirmed -> Hold). |
| `OUTSIDE_OPERATING_HOURS` | 400 | Slot is outside venue hours. |
| `UNAUTHORIZED` | 401 | Missing or invalid token. |
| `FORBIDDEN` | 403 | User does not have permission. |
| `INTERNAL_ERROR` | 500 | Unexpected server error. |

**Frontend Handling:**
Always check `errorCode` for specific handling logic (e.g., if `SLOT_CONFLICT`, show a "Slot taken" toast). Use `message` for generic error display if no specific logic exists.
