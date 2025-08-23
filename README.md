Occasionally manually deployed from latest commit on main to Render at this URL: https://app.simpleamericanaccent.com/

A place to build custom tools/software for Simple American Accent.

May include tools for internal use by Will or other accent coaches e.g. for documenting accent feedback more effectively and efficiently...

May include tools for client use e.g. for viewing accent feedback more effectively and efficiently...

TBD structure/architecture... everything in one place, one repo, one branch? Modules/microservices? Single page application? Lots to learn!

Emoji shorthand conventions for console.log decoration:

💻 Frontend-Web
📱 Frontend-Native (Mobile)
⚙️ Backend
🙋 User
🔒 Admin
🧪 Dev
🚀 Prod

Localhost over https via mkcert

How to migrate db:
cd to app root first, if needed. then:

$env:DATABASE_URL = "insert main url from render here, not userapp or adminapp but the main db url"; pnpm --filter core-backend-node exec prisma migrate dev --name update_user_id_to_uuid_required; Remove-Item Env:DATABASE_URL
