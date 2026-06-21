## 1. Backend: daily signup limit

- [x] 1.1 Add a helper in `fuego/backend/src/index.ts` to calculate the current UTC day range as ISO timestamps.
- [x] 1.2 Add a query that checks whether any `restaurants.created_at` value exists within the current UTC day range.
- [x] 1.3 In `POST /api/auth/signup`, reject requests with status 429 and an explicit daily-limit message when the current day already has a created restaurant.
- [x] 1.4 Repeat the daily-limit check inside the signup transaction immediately before inserting the restaurant to protect against concurrent signups.
- [x] 1.5 Ensure rejected requests do not insert into `restaurants`, do not insert into `admin_users`, and do not emit the session cookie.

## 2. Frontend: user-facing error

- [x] 2.1 Confirm `fuego/frontend/app/signup/page.tsx` displays the backend daily-limit message as a form-level error.
- [x] 2.2 Adjust the form error handling only if the 429 response is not shown clearly to the user.

## 3. Verification

- [x] 3.1 Run the backend build with `npm run build` in `fuego/backend`.
- [x] 3.2 Verify a first valid signup succeeds when no restaurant exists for the current UTC day.
- [x] 3.3 Verify a second valid signup on the same UTC day returns 429 and leaves the database unchanged except for the first signup.
- [x] 3.4 Verify the rejected signup does not leave the user authenticated.
