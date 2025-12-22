# Quiz Data Seeding

This directory contains scripts for seeding quiz data (Contrast and Pair tables) into new database instances.

## Files

- **`quiz-seed-data.js`** - Contains the static data definitions for Contrasts and Pairs
- **`seed-quiz.js`** - Seed script that populates the database from `quiz-seed-data.js`
- **`export-quiz-data.js`** - Utility script to export data from an existing database

## Workflow

### Running from Root (with Infisical)

**Recommended approach** - Uses Infisical to inject environment variables:

```bash
# From project root
pnpm run export:quiz    # Export from database (uses Infisical)
pnpm run seed:quiz      # Seed database (uses Infisical)
```

Infisical will automatically:

- Use the environment specified in `.infisical.json` (default: `demo`)
- Inject all environment variables (including `DATABASE_URL`)
- No need for `.env` files when using Infisical

**Specify a different environment:**

```bash
infisical run --env=production -- pnpm --filter backend run export:quiz
infisical run --env=staging -- pnpm --filter backend run seed:quiz
```

### Running Locally (without Infisical)

If you prefer to use `.env` files for local development:

```bash
# From project root
pnpm run export:quiz:local    # Uses .env files
pnpm run seed:quiz:local      # Uses .env files
```

Or directly from `packages/backend`:

```bash
cd packages/backend
pnpm run export:quiz:local
pnpm run seed:quiz:local
```

### Initial Setup (Export from Production)

1. Connect to your production database (via Infisical or set `DATABASE_URL` in your environment)
2. Run the export script:

   ```bash
   # Using Infisical (recommended)
   pnpm run export:quiz

   # Or using .env files
   pnpm run export:quiz:local
   ```

3. This creates `quiz-seed-data-exported.js` with all your production data
4. Review the exported file and copy the data into `quiz-seed-data.js`
5. Delete `quiz-seed-data-exported.js` if desired

### Seeding a New Database

1. Ensure your `DATABASE_URL` points to the target database (via Infisical or `.env` files)
2. Run the seed script:

   ```bash
   # Using Infisical (recommended)
   pnpm run seed:quiz

   # Or using .env files
   pnpm run seed:quiz:local
   ```

3. The script will:
   - Upsert Contrast records (by unique `key`)
   - Upsert Pair records (by unique `contrastId + wordA + wordB`)
   - Skip duplicates gracefully
   - Show progress and summary

## Data Structure

### Contrast

- `key` (unique) - e.g., "KIT_FLEECE"
- `name` - Display name, e.g., "KIT vs FLEECE"
- `title` - Full title for the quiz
- `description` - Optional description
- `category` - "vowels" or "consonants"
- `soundAName` / `soundBName` - Names of the two sounds
- `soundASymbol` / `soundBSymbol` - Optional IPA symbols
- `active` - Whether the contrast is active

### Pair

- `contrastKey` - Key of the parent contrast
- `wordA` / `wordB` - The two words in the minimal pair
- `alternateA` / `alternateB` - Arrays of homophones (same pronunciation, different spelling)
- `audioAUrl` / `audioBUrl` - URLs to audio files
- `active` - Whether the pair is active

## Notes

- The seed script prevents running in production environment
- Contrasts are upserted by `key` (unique constraint)
- Pairs are upserted by the unique constraint `(contrastId, wordA + wordB)`
- Existing records are updated if they already exist
- The script is idempotent - safe to run multiple times

## Infisical Configuration

The project uses Infisical for secrets management. Configuration is in `.infisical.json`:

- `defaultEnvironment`: The default environment to use (currently: `demo`)
- To use a different environment, use: `infisical run --env=<env> -- <command>`

Make sure you're authenticated with Infisical:

```bash
infisical login
```

For CI/CD or non-interactive environments, use a service token:

```bash
export INFISICAL_TOKEN=<your-service-token>
infisical run -- <command>
```
