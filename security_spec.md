# Security Specification - Digital Teacher App

## Data Invariants
1. Students: Every student must have a valid ID, name, grade, gender, and star rating map.
2. Daily Logs: Must have a date and optional lessons/homework.
3. Math Materials: Must have a status and total count.
4. Teaching Strategies: Library of pedagogy; must be restricted for write to admins (or teachers).
5. Strategy Implementations: Every record must be linked to a valid strategy ID and have a date and effectiveness rating.
6. Certificates: Must be linked to a valid student ID.
7. Seating Charts: Must have valid dimensions and student positions.

## The "Dirty Dozen" Payloads (Denial Scenarios)

1. **Identity Spoofing (Students):** Attempt to create a student with a random UUID as ID but claiming to be someone else in the `id` field.
2. **Resource Poisoning (Logs):** Attempt to write a 2MB string into a `teacherMessage` field.
3. **Ghost Fields (Strategies):** Attempt to update a strategy with `isVerified: true` (a field not in schema).
4. **Invalid Enum (Students):** Creating a student with gender `other`.
5. **Orphaned Writes (Implementations):** Creating a strategy implementation for a strategy ID that does not exist.
6. **State Shortcutting (Certificates):** Forging a certificate with a fake award type.
7. **Temporal Violation:** Setting `createdAt` to a date in the past instead of `request.time`.
8. **Immutability Breach:** Attempting to change the `studentId` of an existing certificate.
9. **Negative Values:** Setting `total` in math materials to -5.
10. **Unauthorized Query Scraping:** Attempting to list all students without a filter (if PII were involved, but here students are shared in class).
11. **Shadow Update (Seating Charts):** Adding a `permission: 'admin'` field to a seating chart document.
12. **ID Poisoning:** Using a very long string (>1.5KB) as a document ID.
