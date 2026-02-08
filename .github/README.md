# Simple American Accent Web App

> 📝 **Portfolio Repository — Proprietary Code**

A full-stack web application for American accent training, analysis, and feedback.

- Powers my accent coaching business (Simple American Accent)
- Built with React, Node, PostgreSQL, Prisma, Tailwind, Vite

<a href="#demo"><img src="../docs/screenshot.png"></a>

## Context

This application supports accent coaching workflows: analysis, feedback, and guided practice.

I repeatedly ran into the same challenges when helping clients with accent training, and existing tools didn’t address them in the way I wanted. So I built my own.

It was built iteratively around client needs and is actively used in my coaching business, with ongoing maintenance and development.

The software is proprietary. The repository is public only for portfolio purposes.

## Table of contents

- [Demo](#demo)
- [App Overview](#app-overview)
  - [Tech Stack](#tech-stack)
  - [Architecture](#architecture)
  - [Features](#features)
  - [Security](#security)
- [Development](#development)
  - [Main](#main)
  - [Database](#database)
  - [Optional Tools](#optional-tools)
- [License and Contributing](#license-and-contributing)

## Demo

5-minute walkthrough video: https://youtu.be/1I5FPCRFm7o

Live demo available during interviews.


## App Overview

### Tech Stack

- **Frontend:** React 19, Vite, Tailwind, shadcn
- **Backend:** Node.js, Express, Prisma, PostgreSQL on Render, Airtable via API, Auth0
- **Cloud & DevOps:** Render, CloudFlare, AWS S3
- **Testing & Tooling:** Git, GitHub, pnpm, Jest, Storybook

### Architecture

This is a pnpm monorepo with thin app wrappers around shared core packages:

```
apps/ (thin wrappers around shared core packages)
 ├── user-web
 ├── user-api
 ├── admin-web
 ├── admin-api
 └── python-experiments
packages/ (shared core)
 ├── frontend               → Quiz system, transcript viewer, phoneme tools, admin pages
 ├── backend                → Auth0, Prisma, rate limiting, Airtable, API routes
 └── shared                 → anything used in both frontend & backend
```

### Features

- **Quiz System** - Minimal pairs pronunciation quiz
- **Transcript Viewer** - Audio playback time-aligned with transcript, admin view for annotating accent feedback, user view for viewing accent feedback
- **Progress Tracking** - Visual progress indicators and performance statistics
- **Admin Dashboard** - User management, trial analytics, and client acquisition tracking

### Security

- **Authentication** - Auth0 integration
- **Authorization** - Role-based access control (admin vs user) + user-specific permissions
- **Rate Limiting** - 450 requests per 15 minutes per IP address
- **Configuration Management** – Environment-based secrets and keys (no credentials in source)

## Development

### Main

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

### Database

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

## License and Contributing

This repository is proprietary and shared publicly only for portfolio purposes.

- **License:** See [LICENSE.md](https://github.com/SimpleAmericanAccent/saa-app-web?tab=License-1-ov-file#readme)
- **Contributing:** See [CONTRIBUTING.md](https://github.com/SimpleAmericanAccent/saa-app-web?tab=contributing-ov-file#readme)

External contributions (issues, PRs) are not accepted.
