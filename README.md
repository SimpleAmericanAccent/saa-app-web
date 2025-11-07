# Simple American Accent Web App

A full-stack web application for American accent training and feedback.

- In production with paying clients
- Independently developed
- React, Node & Express, PostgreSQL & Prisma, Tailwind, Vite

## Demo

- **Demo Video:** [Watch 5-minute demo →](https://youtu.be/1I5FPCRFm7o)
- **User App:** https://app.simpleamericanaccent.com
  - **Demo Username/Password:** demo@simpleamericanaccent.com / Demo123!
- **Admin App:** https://admin.simpleamericanaccent.com  
  _(Internal dashboard — demo access not currently planned)_

## Architecture Overview

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

## Key Elements

- **Quiz System** - Minimal pairs pronunciation quiz
- **Transcript Viewer** - Admin view for annotating accent feedback, user view for viewing accent feedback
- **Progress Tracking** - Visual progress indicators and performance statistics
- **Admin Dashboard** - User management, trial analytics, and client acquisition tracking

## Security Highlights

- **Authentication** - Auth0 integration
- **Authorization** - Role-based access control (admin vs user) + user-specific permissions
- **Rate Limiting** - 450 requests per 15 minutes per IP address
- **Configuration Management** – Environment-based secrets and keys (no credentials in source)

## Tech Stack & Infrastructure

- **Frontend:** React 19, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Prisma, PostgreSQL
- **Infrastructure:** Render, Auth0, AWS S3, Airtable
- **Analytics:** Instagram Graph API, Plausible, Airtable

## Development Setup

### Main Setup

- Set up [mkcert](https://github.com/FiloSottile/mkcert) to enable local development (localhost) over HTTPS
- Navigate to repo root
- **Run setup command (will install dependencies, generate Prisma client, and setup localhost mkcert certificates):**
  ```powershell
  pnpm run setup
  ```
- **Environment Setup:** Copy the `.env.example` files (4 total) to create corresponding `.env` files, then fill in your credentials
- **Run the application:**
  ```powershell
  pnpm dev:u    # Start user app
  # or
  pnpm dev:a   # Start admin app
  ```

### Database Setup (if needed)

- **Airtable Setup:** Set up your own Airtable base for accent annotations data (schema available in codebase)
- **Database Setup:**

  - **Database URL:** You may need to use this pattern for database-related commands, until I figure out a better way (PowerShell syntax shown here):
    - ```powershell
      $env:DATABASE_URL = "your_url"
      ```
    - ```powershell
      [run your command(s) here]
      ```
    - ```powershell
      Remove-Item Env:DATABASE_URL
      ```
  - **Setup:** Run migrations:
    ```powershell
    pnpm --filter core-backend-node exec prisma migrate dev
    ```
  - **Seeding:** Populate with pronunciation dictionary data:
    ```powershell
    pnpm seed:cmu
    ```

### Optional Tools

- **Prisma Studio:** Open database GUI (see note above for database URL pattern):
  ```powershell
  pnpm --filter core-backend-node exec prisma studio
  ```
- **Direct database access via psql:** Log into Render dashboard, copy connection command, paste into terminal and hit enter. Then copy and paste the password (it will appear invisible in the terminal) and hit enter.

## Contributing

This is a production application serving paid accent coaching clients, that I developed independently.

Temporarily open-sourced to show my full-stack development abilities. For questions or feedback, please contact me.

## License

**Proprietary** – Temporarily open-sourced for portfolio/demonstration purposes only.
