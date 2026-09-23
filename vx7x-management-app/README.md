# VX7X Dance & Fitness Studio Management App

A mobile-friendly, GitHub Pages-ready MVP for managing students, batches, attendance, fees, QR payment details, WhatsApp contact and studio updates.

## Demo logins

- Admin: `admin` / `admin123`
- Trainer: `rahul` / `trainer123`
- Parent: `priya` / `parent123`

## Deploy free on GitHub Pages

1. Create a new GitHub repository, for example `vx7x-management-app`.
2. Upload `index.html`, `style.css`, `app.js`, `manifest.json`, and `README.md`.
3. In GitHub open **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Save. GitHub will give you a public website URL.

## Important

This version stores data in the browser using localStorage. It is suitable as a free prototype / small internal tracker, but it is **not secure enough for real production use with sensitive parent/student/payment data**.

For a real multi-user system, replace the localStorage layer with a backend such as Supabase/Firebase and server-side authentication/authorization. Do not use this demo's client-side passwords for a production deployment.

## Included

- Admin / Trainer / Parent demo roles
- Student management
- Batch management
- Attendance
- Fees and payment records
- UPI payment button
- QR image upload
- Payment verification status
- Studio updates
- WhatsApp buttons
- Reports
- Mobile responsive UI
- PWA manifest
