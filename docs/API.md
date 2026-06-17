# API Reference

All endpoints are Next.js route handlers under `/api`. They accept and return
JSON. Authenticated routes rely on the Auth.js session cookie; unauthenticated
requests receive `401`.

Base URL (local): `http://localhost:3000`

---

## Auth

### `POST /api/register`
Create a new account. Public.

Request:
```json
{ "name": "Jane", "email": "jane@example.com", "password": "secret123" }
```
Responses: `201` `{ id, email, name }` · `409` email exists · `400` invalid input.

### `POST /api/auth/[...nextauth]`
Auth.js handler (sign in / sign out / session). Use the client helpers from
`next-auth/react` (`signIn`, `signOut`) rather than calling directly.

---

## Apartments

### `GET /api/apartments`
List apartments. Public. Query params (all optional):

| Param | Description |
| --- | --- |
| `q` | Free-text search over title/address/city/neighborhood |
| `city` | Filter by city (contains) |
| `minRent`, `maxRent` | Rent bounds |
| `beds` | Minimum bedrooms |
| `petFriendly` | `true` to require pet-friendly |
| `sort` | `newest` (default), `priceAsc`, `priceDesc` |

Returns `Apartment[]`.

### `POST /api/apartments`
Create a listing. Auth required.
```json
{
  "title": "Sunny 2BR", "address": "123 Main St", "city": "Austin",
  "state": "TX", "rent": 1800, "bedrooms": 2, "bathrooms": 1.5,
  "sqft": 950, "description": "...", "amenities": "Gym, Parking",
  "petFriendly": true, "furnished": false,
  "neighborhood": "East Side", "commuteNotes": "...", "leaseText": "..."
}
```
Returns `201` with the created apartment.

### `GET /api/apartments/:id`
Fetch one apartment. Public. `404` if missing.

### `DELETE /api/apartments/:id`
Delete a listing. Auth required; owner or admin only. `403` otherwise.

---

## Favorites

### `GET /api/favorites`
List the current user's favorites (with apartment). Auth required.

### `POST /api/favorites`
Toggle a favorite, or set its shortlist flag. Auth required.
```json
{ "apartmentId": "abc", "shortlisted": true }
```
- Without `shortlisted`: toggles the favorite on/off.
- With `shortlisted`: upserts and sets the flag.

Returns `{ action: "added" | "removed" | "updated", favorite? }`.

---

## Roommate

### `GET /api/roommate`
Get the current user's roommate profile (or `null`). Auth required.

### `PUT /api/roommate`
Create or update the roommate profile. Auth required.
```json
{
  "budgetMin": 800, "budgetMax": 2000, "cleanliness": 4,
  "sleepSchedule": "FLEXIBLE", "social": 4, "smoking": false,
  "pets": true, "city": "Austin", "interests": "cooking, hiking", "bio": "..."
}
```
`sleepSchedule` ∈ `EARLY_BIRD | NIGHT_OWL | FLEXIBLE`. Sliders are `1..5`.

### `GET /api/roommate/matches`
Ranked roommate matches for the current user. Auth required. Requires the user
to have a profile (`400` otherwise). Returns:
```json
[
  {
    "user": { "id": "...", "name": "...", "email": "...", "image": null },
    "profile": { "budgetMin": 700, "budgetMax": 1800, "sleepSchedule": "...", "bio": "...", "interests": "..." },
    "compatibility": {
      "score": 86, "rating": "Excellent",
      "factors": [ { "label": "Budget", "score": 85, "weight": 25, "note": "..." } ],
      "sharedInterests": ["cooking"]
    }
  }
]
```

---

## Messaging

### `GET /api/messages`
Without params: conversation list with last message and unread counts.
With `?with=<userId>`: the full thread (and marks incoming as read). Auth required.

### `POST /api/messages`
Send a message. Auth required. Generates a simulated auto-reply.
```json
{ "receiverId": "abc", "content": "Hi!" }
```

---

## AI

All AI routes require auth. Each returns `source: "openai" | "local"` indicating
whether the live API or the local fallback produced the result.

### `POST /api/ai/lease`
```json
{ "leaseText": "RESIDENTIAL LEASE AGREEMENT..." }
```
Returns `{ summary, keyTerms[], redFlags[], source }`.

### `POST /api/ai/neighborhood`
```json
{ "neighborhood": "East Side", "city": "Austin", "state": "TX" }
```
Returns `{ summary, pros[], cons[], source }`.

### `POST /api/ai/fit`
```json
{ "apartment": "2BR in Austin", "rent": 1800, "budget": 2000, "preferences": "quiet, pet-friendly" }
```
Returns `{ verdict, score, reasons[], source }`.

---

## Admin

### `GET /api/admin/stats`
Platform analytics. Admin role required (`403` otherwise). Returns totals,
recent users/listings, rent-distribution buckets, and listings-by-city.

### `GET /api/users`
Directory of other users (id, name, email, image) for starting conversations.
Auth required.

---

## Status codes

| Code | Meaning |
| --- | --- |
| `200/201` | Success |
| `400` | Validation error (Zod) |
| `401` | Not authenticated |
| `403` | Authenticated but not allowed |
| `404` | Not found |
| `409` | Conflict (duplicate email) |
| `500` | Server error |
