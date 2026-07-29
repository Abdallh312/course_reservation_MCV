# Course Reservation System — Frontend

A standalone HTML/CSS/JS (Bootstrap-ready) frontend for the Course Reservation
System described in the project documentation. It runs fully in the browser
with a localStorage-backed data layer that starts **empty** — no demo
departments, buildings, rooms, courses or reservations are pre-loaded. Add
your own data through the Admin dashboard, or connect the real .NET API (see
below).

## Open it

Just open `index.html` in a browser.

> **Important:** data is saved with `localStorage`, which some browsers
> (Firefox especially) treat as temporary/per-load when you open the file
> directly with `file://` — so anything you add can disappear on refresh.
> For reliable persistence while testing, serve the folder instead of
> double-clicking the file:
>
> ```bash
> # from inside the course-reservation folder
> npx serve .
> # or
> python3 -m http.server 8080
> ```
>
> Then open the printed `http://localhost:...` URL. This has no effect once
> you connect the real .NET API — persistence will be handled by the
> database instead.

## Pages

- `index.html` — the login page (now the site's entry point; students and staff both sign in here)
- `user.html` — trainee dashboard: browse courses (filter by department),
  reserve a seat, view **My Learning List** with live status
- `admin.html` — admin dashboard: manage **Departments**, **Buildings**,
  **Rooms**, **Courses**, and **approve/reject** reservation requests

## Structure

```
assets/
  css/style.css     design system (tokens, layout, components)
  js/data.js        seeded mock database + localStorage persistence
  js/api.js         functions matching every documented endpoint
  js/ui.js          toast, modal, formatting helpers
  js/user.js        user dashboard logic
  js/admin.js       admin dashboard logic
```

## Connecting the real .NET backend

Every call the frontend makes lives in `assets/js/api.js` and is named after
the documented endpoint (`getDepartments`, `createReservation`,
`updateReservationStatus`, etc.). Each function already contains the
`fetch(...)` call it needs — it's just gated behind a flag.

1. Set `API_BASE_URL` at the top of `api.js` to your API's origin, e.g.
   `https://localhost:5001/api`.
2. Set `USE_MOCK = false`.
3. Make sure your API's response shapes match the data models in the docs
   (`Department`, `Building`, `Room`, `Course`, `Reservation`, `User`).
4. If you add authentication, replace `CURRENT_USER_ID` in `data.js` with the
   logged-in user's id from your auth flow.

No other file needs to change — `user.js` and `admin.js` only ever talk to
the `API` object.

## Notes

- There's no login screen yet (per the docs, auth is optional) — the app
  assumes a single generic trainee account (`User`, id `1`) and an implicit
  admin. Rename or replace it in `assets/js/data.js` once real auth is wired up.
- Deleting a department/building/room doesn't cascade-update courses that
  reference it; wire that up server-side once the real API is in place.
- All pages are responsive down to mobile (sidebar collapses to a horizontal
  bar under ~900px).
