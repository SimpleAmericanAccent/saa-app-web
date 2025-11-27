# Simple American Accent Web App

> 📝 **Portfolio Repository — Proprietary Code (No External Contributions)**

A full-stack web application for American accent training and feedback.

- In production with paying clients
- Independently developed
- React, Node & Express, PostgreSQL & Prisma, Tailwind, Vite

Important context:

- I made this repo public to help me get a job as a full-stack engineer.
- This app was originally private & developed simply to solve a problem for my users (my accent coaching clients). My focus was on shipping and iterating an MVP with real users, not on maximizing code quality or even expecting anyone else to ever see my code. Although I still cared to a meaningful extent about code quality and skill development, for my own sake... my priority was merely getting the app to work well enough to be useful for my clients.
- More recently, I saw the opportunity for a full-stack engineering career. I made the repo public and am in the process of professionalizing the code. Refactoring, adding testing, documenting, and so on.
- Some parts of the code were meticulously hand-coded. Other parts were AI-assisted or vibe coded. I plan to better document which is which.

<details><summary>Demo</summary>
  
- 5 min video [here](https://youtu.be/1I5FPCRFm7o)
- Live app demo:
  - [Link](https://app.simpleamericanaccent.com)
  - User/pass: demo@simpleamericanaccent.com / Demo123!
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
 ├── user-web     → Client accent training app
 ├── user-api     → User API server
 ├── admin-web    → Business analytics dashboard
 ├── admin-api    → Admin API + analytics routes
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
<details><summary>License & Contributing</summary>

This repository is **proprietary** and made public **solely for portfolio and demonstration purposes** as part of my full-stack engineering job search.

- **License:** See [LICENSE.md](./LICENSE.md)
- **Contributing:** See [CONTRIBUTING.md](./CONTRIBUTING.md)

External contributions (issues, PRs, forks) are not accepted.

</details>
