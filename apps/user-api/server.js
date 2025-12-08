import { bootApp } from "backend/entry.js";
import router from "backend/routes/routes.js";

bootApp({
  environment_flag: process.env.ENVIRONMENT_FLAG,
  auth0Config: {
    authRequired: false,
    errorOnRequiredAuth: true,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_ID,
    authorizationParams: {
      scope: "openid profile email",
    },
    routes: {
      login: false,
      logout: false,
    },
  },
  router,
  envConfig: {
    FRONTEND_URL: process.env.FRONTEND_URL,
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
    AIRTABLE_KEY_READ_WRITE_VALUE: process.env.AIRTABLE_KEY_READ_WRITE_VALUE,
    AIRTABLE_KEY_READ_ONLY_VALUE: process.env.AIRTABLE_KEY_READ_ONLY_VALUE,
    DEFAULT_AUDIO_REC_ID: process.env.DEFAULT_AUDIO_REC_ID,
    AIRTABLE_KEY_SELECTED: process.env.AIRTABLE_KEY_READ_ONLY_VALUE,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  },
});
