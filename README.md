# Simple American Accent Web App

A full-stack web application for American accent training and feedback.

- Currently in production serving paid clients
- Built with modern technologies

## 🚀 Watch the Demo Video / Explore the App Demo

- **Demo Video:** [Watch 5-minute demo →](https://youtu.be/1I5FPCRFm7o)
- **User App:** https://app.simpleamericanaccent.com  
  _(Client-facing training platform — I'll make a demo account soon and put that here)_
- **Admin App:** https://admin.simpleamericanaccent.com  
  _(Internal dashboard — demo access not currently planned)_

## 🏗️ Architecture & Tech Stack

This is a monorepo with thin app wrappers around shared core packages:

```
apps/
 ├── user-frontend-web     → React (Vite)
 ├── user-backend-node     → Express + Prisma
 ├── admin-frontend-web    → React (Vite)
 ├── admin-backend-node    → Express + Prisma
 └── backend-python        → Audio processing (Whisper)
packages/
 ├── core-frontend-web     → Shared React components
 └── core-backend-node     → Shared Express services & middleware
```

- **Frontend:** React 19, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Prisma, PostgreSQL, Auth0
- **Infrastructure:** Render, Airtable, AWS S3

## 🎯 Core & Security Features

- **Quiz System** - Minimal pairs pronunciation quiz
- **Transcript Viewer** - Admin view for annotating accent feedback, user view for viewing accent feedback
- **Progress Tracking** - Visual progress indicators and performance statistics
- **Admin Dashboard** - User management, trial analytics, and client acquisition tracking
- **Audio Processing** - Python-based transcription using OpenAI Whisper (not yet used in production)

### Security Highlights

- **Authentication** - Auth0 integration with secure token handling
- **Authorization** - Role-based access control (admin vs user) + user-specific permissions
- **Rate Limiting** - 450 requests per 15 minutes per IP address
- **Configuration Management** – Environment-based secrets and keys (no credentials in source)

## 🚀 Deployment & Data Integration

- **Hosting:** Render (backend serves frontend)
- **Database:** PostgreSQL hosted on Render
- **Accent Annotations Database:** Airtable for storing accent annotations for each transcript
- **File Storage:** AWS S3 for audio files and time-aligned transcripts

### Analytics Integrations:

- **Instagram Graph API** – Tracks top-of-funnel metrics (reach, profile views)
- **Plausible Analytics** – Measures website traffic and conversions
- **Airtable** – Manages CRM data for applications and payments

## 🧪 Development Setup

- **Install dependencies:**
  ```powershell
  pnpm install
  ```
- **Copy the environment file and fill in your credentials:**
  ```powershell
  copy .env.example .env
  ```
- **Airtable Setup:** Set up your own Airtable base for accent annotations data (schema available in codebase)
- **Localhost over HTTPS:** Set up [mkcert](https://github.com/FiloSottile/mkcert) for local SSL certificates
- **Database Setup:** Set database URL temporarily, run migrations, then clear it (PowerShell):
  ```powershell
  $env:DATABASE_URL = "your_url"; pnpm --filter core-backend-node exec prisma migrate dev; Remove-Item Env:DATABASE_URL
  ```
- **Database Seeding:** Populate with pronunciation dictionary data (optional):
  ```powershell
  $env:DATABASE_URL = "your_url"; pnpm seed:cmu; Remove-Item Env:DATABASE_URL
  ```
- **Run the application:**
  ```powershell
  pnpm dev:user    # Start user app
  # or
  pnpm dev:admin   # Start admin app
  ```

### Optional Tools

- **Prisma Studio:** Set database URL temporarily, open Prisma Studio, then clear it (PowerShell):
  ```powershell
  $env:DATABASE_URL = "your_url"; pnpm --filter core-backend-node exec prisma studio; Remove-Item Env:DATABASE_URL
  ```
- **Direct database access via psql:** Log into Render dashboard, copy connection command, paste into terminal and hit enter. Then copy and paste the password (it will appear invisible in the terminal) and hit enter.

## 🤝 Contributing

This is a production application serving paid accent coaching clients, that I developed independently.

Temporarily open-sourced to show my full-stack development abilities. For questions or feedback, please contact me.

## 📄 License

**Proprietary** – Temporarily open-sourced for portfolio/demonstration purposes only.
