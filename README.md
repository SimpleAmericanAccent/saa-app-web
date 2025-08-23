https://app.simpleamericanaccent.com/ - User app
https://admin.simpleamericanaccent.com/ - Admin app

Web app for Simple American Accent, to help clients better (and to help myself/other team members to help clients better).

Documenting accent feedback
Viewing accent feedback
Testing and training accent
Showing accent progress over time
Etc

# Emoji shorthand conventions for console.log decoration:

- 💻 Frontend-Web
- 📱 Frontend-Native (Mobile)
- ⚙️ Backend
- 🙋 User
- 🔒 Admin
- 🧪 Dev
- 🚀 Prod

# Local HTTPS?

Localhost over https via mkcert

# How to migrate db via prisma, given pnpm monorepo craziness:

cd to app root first, if needed. then:

$env:DATABASE_URL = "insert main url from render here, not userapp or adminapp but the main db url"; pnpm --filter core-backend-node exec prisma migrate dev --name update_user_id_to_uuid_required; Remove-Item Env:DATABASE_URL

# how to open prisma studio

$env:DATABASE_URL = "insert url here"; pnpm --filter core-backend-node exec prisma studio; Remove-Item Env:DATABASE_URL

# how to log in via psql on command line / powershell

log into Render in browser, go to database, copy the command and paste and enter
then copy and paste the password (it will appear invisible in the terminal) and hit enter
