# Simple American Accent Web App

A full-stack web application for American accent training and feedback.

- In production with paying clients
- Independently developed
- React, Node & Express, PostgreSQL & Prisma, Tailwind, Vite

Important context:
- This app was initially developed to solve a problem for my users (my accent coaching clients). My focus was on shipping and iterating an MVP with real users, not on maximizing code quality in itself. 
- More recently, I saw the opportunity for a full-stack engineering career and so I am now professionalizing the code.
- Some parts of the code were already meticulously hand-coded. Other parts were AI-assisted or fully vibe coded. I need to do a better job of documenting what is what, and improving code quality, testing, etc. It's a work in progress.

<details><summary>Demo</summary>
  
- **[Demo Video (5 minutes)](https://youtu.be/1I5FPCRFm7o)**
- Demo Logins
  - User app:
    - [Link](https://app.simpleamericanaccent.com)
    - User/pass: demo@simpleamericanaccent.com / Demo123!
  - Admin app:
    - Not yet available for demo
</details>

<details><summary>App Overview</summary>

### Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Prisma, PostgreSQL
- **Database:** Postgres on Render, Airtable via API
- **Hosting:** Render, CloudFlare
- **Auth:** Auth0
- **Marketing Analytics:** Instagram Graph API, Plausible, Airtable
- **App Analytics:** PostHog coming soon

### Architecture

This is a monorepo with thin app wrappers around shared core packages:

```
apps/
 ├── user-frontend-web     → Client accent training app
 ├── user-backend-node     → User API server
 ├── admin-frontend-web    → Business analytics dashboard
 ├── admin-backend-node    → Admin API + analytics routes
 └── backend-python        → Standalone transcription scripts
packages/
 ├── core-frontend-web     → Quiz system, transcript viewer, phoneme tools, admin pages
 └── core-backend-node     → Auth0, Prisma, rate limiting, Airtable, API routes
```

### Features

- **Quiz System** - Minimal pairs pronunciation quiz
- **Transcript Viewer** - Admin view for annotating accent feedback, user view for viewing accent feedback
- **Progress Tracking** - Visual progress indicators and performance statistics
- **Admin Dashboard** - User management, trial analytics, and client acquisition tracking

### Security

- **Authentication** - Auth0 integration
- **Authorization** - Role-based access control (admin vs user) + user-specific permissions
- **Rate Limiting** - 450 requests per 15 minutes per IP address
- **Configuration Management** – Environment-based secrets and keys (no credentials in source)

</details>
<details><summary>Development Setup</summary>
  
### Main Setup

- Set up [mkcert](https://github.com/FiloSottile/mkcert) to enable local development (localhost) over HTTPS
- Navigate to repo root
- **Run setup command (will install dependencies, generate Prisma client, setup localhost mkcert certificates, and create 4 .env files):**
  ```powershell
  pnpm run setup
  ```
- **Environment Setup:** Fill in your credentials in the 4 .env files (see console log information after running setup)
- **Run the application:**
  ```powershell
  pnpm dev    # Start user app
  # or
  pnpm dev:a   # Start admin app
  ```

### Database Setup (if needed)

- **Airtable Setup:** Set up your own Airtable base for accent annotations data (schema available in codebase)
- **Database Setup:**

  - **Setup:** Run migrations:
    ```powershell
    pnpm migrate
    ```
  - **Seeding:** Populate with pronunciation dictionary data:
    ```powershell
    pnpm seed:cmu
    ```

### Optional Tools

- **Prisma Studio:** Open database GUI
  ```powershell
  pnpm studio
  ```
- **Direct database access via psql:** Log into Render dashboard, copy connection command, paste into terminal and hit enter. Then copy and paste the password (it will appear invisible in the terminal) and hit enter.
</details>
<details><summary>Contributing/License</summary>

### Contributing

This repo is not accepting public contributions or issues at this time.

This is a production application serving paid accent coaching clients, that I developed independently.

Temporarily made this repo public for portfolio/demonstration purposes only, as I'm seeking a full-stack engineering job.

For questions or feedback, please contact me privately.

### License

**Proprietary** – Temporarily made this repo public for portfolio/demonstration purposes only, while seeking a full-stack engineering job.

</details>
