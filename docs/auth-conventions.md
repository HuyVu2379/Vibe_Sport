# Authentication Conventions

## Overview
Vibe Sport uses **JWT (JSON Web Tokens)** for authentication.
All protected endpoints exist under the `api/v1` prefix.

## Authentication Method
- **Header**: `Authorization`
- **Value**: `Bearer <access_token>`

Example:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Token Lifecycle
- **Access Token Validity**: Defined by `JWT_EXPIRES_IN` (Default: 7 days)
- **Refresh Token**: Not currently implemented for MVP. Users must re-login when token expires.

## Roles
The system supports the following roles:
- `CUSTOMER`: Regular user (Default)
- `OWNER`: Venue owner
- `ADMIN`: System administrator
- `STAFF`: Venue staff (Future use)

Roles are embedded in the JWT payload under `role`.

## Login Flow (REST)
1. **POST** `/api/v1/auth/login`
   - Body: `{ "phoneOrEmail": "...", "otpOrPassword": "..." }`
2. **Response**:
   ```json
   {
     "token": "eyJ...",
     "user": {
       "userId": "uuid...",
       "role": "CUSTOMER"
     }
   }
   ```
3. Store the `token` in secure storage (e.g., `SecureStore` in Expo or `HttpOnly` cookie/local storage in Web).

## Socket Authentication
Socket.IO connection requires authentication handshake.

**Query Parameter Method** (Recommended for Initial Connection):
Connect to the socket using the `token` query parameter.

```javascript
const socket = io('http://localhost:3000', {
  query: {
    token: 'eyJ...'
  }
});
```

**Alternative**: `Authorization` header in handshake (only works if transport supports custom headers initially, which websockets often don't in browser, but polling does).

If the token is invalid:
- The connection might be accepted, but the user will **NOT** be joined to their personal room (`user_{userId}`).
- Real-time events like `booking.confirmed` will not be received.
