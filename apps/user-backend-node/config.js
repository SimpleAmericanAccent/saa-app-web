export const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
export const AIRTABLE_KEY_READ_WRITE_VALUE =
  process.env.AIRTABLE_KEY_READ_WRITE_VALUE;
export const AIRTABLE_KEY_READ_ONLY_VALUE =
  process.env.AIRTABLE_KEY_READ_ONLY_VALUE;
export const AIRTABLE_KEY_SELECTED = AIRTABLE_KEY_READ_ONLY_VALUE;
export const DEFAULT_AUDIO_REC_ID = process.env.DEFAULT_AUDIO_REC_ID;
export const environment_flag = process.env.ENVIRONMENT_FLAG;
export const auth0Config = {
  authRequired: true,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_ID,
};
