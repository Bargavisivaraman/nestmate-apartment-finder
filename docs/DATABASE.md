# Database Schema

The data model is defined in [`prisma/schema.prisma`](../prisma/schema.prisma).
Development uses SQLite; production can use PostgreSQL by switching the
datasource provider (see the README). The schema avoids DB-specific features so
it works on both.

## Entity-relationship overview

```
User 1───1 RoommateProfile
User 1───* Apartment           (createdBy)
User 1───* Favorite *───1 Apartment
User 1───* Message (sender)
User 1───* Message (receiver)
```

## Models

### User
| Field | Type | Notes |
| --- | --- | --- |
| id | String | cuid, PK |
| email | String | unique |
| name | String? | |
| password | String | bcrypt hash |
| role | String | `USER` or `ADMIN` |
| image | String? | |
| createdAt | DateTime | |

Relations: `roommateProfile`, `apartments`, `favorites`, `sentMessages`,
`receivedMessages`.

### Apartment
| Field | Type | Notes |
| --- | --- | --- |
| id | String | cuid, PK |
| title, address, city, state | String | |
| neighborhood | String? | |
| rent | Int | monthly |
| bedrooms | Int | |
| bathrooms | Float | allows half-baths |
| sqft | Int | |
| description | String | |
| imageUrl | String? | |
| amenities | String | comma-separated |
| petFriendly | Boolean | default false |
| furnished | Boolean | default false |
| availableFrom | DateTime | |
| leaseText | String? | source text for the AI lease analyzer |
| commuteNotes | String? | |
| latitude, longitude | Float? | optional geo |
| createdById | String? | FK → User (SetNull on delete) |
| createdAt | DateTime | |

### Favorite
Join table between User and Apartment with a shortlist flag.

| Field | Type | Notes |
| --- | --- | --- |
| id | String | cuid, PK |
| userId | String | FK → User (Cascade) |
| apartmentId | String | FK → Apartment (Cascade) |
| shortlisted | Boolean | default false |
| createdAt | DateTime | |

Unique constraint: `(userId, apartmentId)`.

### RoommateProfile
One-to-one with User; drives compatibility scoring and budget defaults.

| Field | Type | Notes |
| --- | --- | --- |
| id | String | cuid, PK |
| userId | String | unique, FK → User (Cascade) |
| budgetMin, budgetMax | Int | |
| cleanliness | Int | 1..5 |
| sleepSchedule | String | `EARLY_BIRD`, `NIGHT_OWL`, `FLEXIBLE` |
| social | Int | 1..5 |
| smoking | Boolean | |
| pets | Boolean | |
| gender | String? | |
| bio | String? | |
| city | String? | |
| interests | String | comma-separated |
| createdAt | DateTime | |

### Message
Direct messages between two users.

| Field | Type | Notes |
| --- | --- | --- |
| id | String | cuid, PK |
| senderId | String | FK → User (Cascade) |
| receiverId | String | FK → User (Cascade) |
| content | String | |
| read | Boolean | default false |
| createdAt | DateTime | |

## Seed data

`npm run db:seed` creates:
- 1 admin (`admin@nestmate.app`) and 1 demo user (`demo@nestmate.app`)
- 5 additional users with roommate profiles
- 16 apartments across Austin, Denver, Seattle, and Chicago
- 5 favorites (2 shortlisted) for the demo user
- a seeded conversation between the demo user and a match

See [`prisma/seed.ts`](../prisma/seed.ts).
