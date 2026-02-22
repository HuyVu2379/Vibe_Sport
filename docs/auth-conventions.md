# Authentication Conventions

> How auth works across REST and WebSocket in Vibe Sport.

---

## 1. REST Authentication

| Item          | Value                                             |
|--------------|---------------------------------------------------|
| Header       | `Authorization: Bearer <access_token>`            |
| Token type   | JWT (signed with HS256)                           |
| Token expiry | Configured via `JWT_KEY_EXPIRY` env (default: 7d) |
| Refresh      | Not implemented — re-login on expiry              |
| Revocation   | `POST /users/logout` adds token to blacklist      |

### JWT Payload

```json
{
  "sub": "userId (UUID)",
  "role": "CUSTOMER | OWNER | ADMIN | STAFF",
  "iat": 1706000000,
  "exp": 1706604800
}
```

---

## 2. User Roles

| Role       | Description                                  |
|-----------|----------------------------------------------|
| `CUSTOMER` | Can book, review, chat, favorite             |
| `OWNER`    | Manages venues, replies to reviews, analytics |
| `ADMIN`    | System admin (future)                        |
| `STAFF`    | Venue staff (future, see Exp_C)              |

---

## 3. Public vs Protected Endpoints

| Decorator   | Meaning                                      |
|------------|----------------------------------------------|
| `@Public()` | No JWT required                              |
| _(default)_ | JWT required via `JwtAuthGuard`              |

### Public endpoints (no token needed):
- `POST /auth/login`
- `POST /auth/register`
- `GET /venues` (search)
- `GET /venues/:id` (detail)
- `GET /courts/:id/availability`
- `GET /venues/:id/reviews`
- `GET /reviews/:id`
- `POST /users/forgot-password/request`
- `POST /users/forgot-password/verify`
- `POST /payments/webhook`
- `GET /payments/callback`

### Rate-limited endpoints:
- `POST /auth/login` — 5 req / 60s
- `POST /auth/register` — 5 req / 60s
- `POST /users/forgot-password/request` — 3 req / 15 min
- `POST /users/forgot-password/verify` — 5 req / 15 min

---

## 4. WebSocket Authentication

### App Gateway (`/`)

Token passed via query param or header on connect:

```typescript
// Option A: query param
io(SOCKET_URL, { query: { token: accessToken } });

// Option B: header
io(SOCKET_URL, {
  extraHeaders: { Authorization: `Bearer ${accessToken}` }
});
```

Server extracts and verifies the JWT, then joins client to `user_{userId}` room.

### Chat Gateway (`/chat`)

The Chat gateway does **not** authenticate on connect. User identity is passed in each event payload (e.g., `userId` in `join_conversation`, `send_message`, `typing` events).

---

## 5. Login Flow

```
1. POST /auth/login { phoneOrEmail, otpOrPassword }
   → { token, user: { userId, role } }

2. Store token in local storage / secure storage

3. Include in all subsequent requests:
   Authorization: Bearer <token>

4. Connect WebSocket with token for real-time events
```

---

## 6. Password Recovery Flow

```
1. POST /users/forgot-password/request { emailOrPhone }
   → { success: true, message: "OTP sent" }

2. POST /users/forgot-password/verify { emailOrPhone, otp, newPassword }
   → { success: true, message: "Password reset successfully" }

3. Re-login with new password
```
