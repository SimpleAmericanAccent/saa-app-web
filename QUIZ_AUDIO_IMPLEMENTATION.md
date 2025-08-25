# Quiz Audio Implementation Guide

## Overview

The quiz system supports a hybrid approach to audio sources:

1. **Primary**: Audio URLs stored directly in PostgreSQL database
2. **Fallback**: Free Dictionary API for words without database audio URLs

## Database Schema

The `Pair` model in PostgreSQL stores audio URLs for each word pair:

```sql
model Pair {
  pairId      String   @id @default(uuid()) @map("pair_id")
  contrastId  String   @map("contrast_id")
  wordA       String   @map("word_a")
  wordB       String   @map("word_b")
  alternateA  String[] @map("alternate_a")
  alternateB  String[] @map("alternate_b")
  audioAUrl   String   @map("audio_a_url")  -- Can be null or empty
  audioBUrl   String   @map("audio_b_url")  -- Can be null or empty
  active      Boolean  @default(true)
  // ... other fields
}
```

## Audio Resolution Logic

### 1. Database Audio URLs (Primary)

When a quiz question is presented, the system first checks for database audio URLs:

```javascript
// Helper function to get the appropriate audio URL for a word from a question
const getAudioUrlFromQuestion = (word, question) => {
  if (!question) return null;

  // Determine which audio URL to use based on which word is being presented
  if (word === question.wordA && question.audioAUrl) {
    return question.audioAUrl;
  } else if (word === question.wordB && question.audioBUrl) {
    return question.audioBUrl;
  }

  return null;
};

// Get database audio URL
const databaseAudioUrl = getAudioUrlFromQuestion(word, currentQuestion);

// If we have a valid database audio URL, use it
if (databaseAudioUrl && databaseAudioUrl.trim() !== "") {
  // Use database audio URL
  return databaseAudioUrl;
}
```

**Advantages:**

- Consistent audio quality and pronunciation
- No external API dependencies
- Faster loading (no API calls)
- Custom recordings for specific words

### 2. Dictionary API Fallback (Secondary)

If no database URL exists or is empty, the system falls back to the Free Dictionary API:

```javascript
// Fallback to dictionary API if no database URL exists or is empty
const dictionaryAudio = await getDictionaryAudio(word);
if (dictionaryAudio) {
  // Use dictionary API audio
  return dictionaryAudio;
}
```

**Advantages:**

- Automatic coverage for all words
- No manual audio upload required
- US pronunciation from reliable source

## Implementation Scenarios

### Scenario 1: Word with Database Audio URL

```sql
-- Database entry
INSERT INTO pair (word_a, word_b, audio_a_url, audio_b_url)
VALUES ('sick', 'seek', 'https://example.com/sick.mp3', 'https://example.com/seek.mp3');
```

**Quiz Behavior:**

1. Quiz presents "sick" as the target word
2. System finds `audioAUrl` in database
3. Uses database URL: `https://example.com/sick.mp3`
4. No API call needed

### Scenario 2: Word without Database Audio URL

```sql
-- Database entry with null audio URLs
INSERT INTO pair (word_a, word_b, audio_a_url, audio_b_url)
VALUES ('sick', 'seek', NULL, NULL);
```

**Quiz Behavior:**

1. Quiz presents "sick" as the target word
2. System finds `audioAUrl` is NULL
3. Falls back to dictionary API
4. Fetches from: `https://api.dictionaryapi.dev/api/v2/entries/en/sick`
5. Extracts US audio URL from response

### Scenario 3: Mixed Audio Sources

```sql
-- Database entry with partial audio URLs
INSERT INTO pair (word_a, word_b, audio_a_url, audio_b_url)
VALUES ('sick', 'seek', 'https://example.com/sick.mp3', NULL);
```

**Quiz Behavior:**

- For "sick": Uses database URL
- For "seek": Falls back to dictionary API

## Audio Caching

The system implements intelligent caching to improve performance:

```javascript
// Check cache first
if (preloadedAudioCache.has(word)) {
  const cachedAudio = preloadedAudioCache.get(word);
  return cachedAudio;
}

// Cache database audio URLs
if (databaseAudioUrl) {
  setPreloadedAudioCache((prev) => new Map(prev).set(word, databaseAudioUrl));
}

// Cache dictionary API audio
if (dictionaryAudio) {
  setPreloadedAudioCache((prev) => new Map(prev).set(word, dictionaryAudio));
}
```

## User Experience

### Audio Available

- Play button is enabled
- Auto-play works (if enabled in settings)
- Keyboard shortcut "1" works
- Audio loads quickly from cache

### No Audio Available

- Play button is disabled/grayed out
- Warning message: "⚠️ No audio available for this word"
- Skip button appears
- Quiz continues without audio

## Database Management

### Adding Audio URLs

```sql
-- Update existing pairs with audio URLs
UPDATE pair
SET audio_a_url = 'https://your-audio-server.com/word-a.mp3',
    audio_b_url = 'https://your-audio-server.com/word-b.mp3'
WHERE pair_id = 'your-pair-id';
```

### Removing Audio URLs

```sql
-- Remove audio URLs to force fallback
UPDATE pair
SET audio_a_url = NULL,
    audio_b_url = NULL
WHERE pair_id = 'your-pair-id';
```

### Bulk Operations

```sql
-- Set all audio URLs to NULL (force dictionary API)
UPDATE pair SET audio_a_url = NULL, audio_b_url = NULL;

-- Set specific contrast to use dictionary API
UPDATE pair
SET audio_a_url = NULL, audio_b_url = NULL
WHERE contrast_id = 'your-contrast-id';
```

## Performance Considerations

### Database Audio URLs

- **Pros**: Fast, reliable, no external dependencies
- **Cons**: Requires manual management, storage costs

### Dictionary API Fallback

- **Pros**: Automatic, no maintenance required
- **Cons**: API rate limits, network dependency, variable quality

### Caching Strategy

- Both audio sources are cached in memory
- Cache persists during quiz session
- Reduces repeated API calls and database queries

## Error Handling

### Database Audio URL Errors

- Invalid URLs are treated as missing
- Network errors fall back to dictionary API
- Malformed URLs are ignored

### Dictionary API Errors

- API failures show "No audio available"
- Rate limiting handled gracefully
- Network timeouts don't break quiz flow

## Migration Strategy

### Phase 1: Dictionary API Only

- All `audioAUrl` and `audioBUrl` fields are NULL
- System relies entirely on dictionary API
- Good for initial deployment

### Phase 2: Hybrid Approach

- Gradually add database audio URLs for important words
- Keep dictionary API as fallback
- Monitor audio quality and user feedback

### Phase 3: Database Audio Only

- Replace all dictionary API calls with database URLs
- Remove fallback logic
- Full control over audio quality

## Monitoring and Analytics

Track audio source usage:

```sql
-- Count words with database audio
SELECT COUNT(*) as with_db_audio
FROM pair
WHERE audio_a_url IS NOT NULL OR audio_b_url IS NOT NULL;

-- Count words using fallback
SELECT COUNT(*) as using_fallback
FROM pair
WHERE audio_a_url IS NULL AND audio_b_url IS NULL;
```

## Best Practices

1. **Start with Dictionary API**: Use fallback for initial deployment
2. **Add Database URLs Gradually**: Focus on high-frequency words first
3. **Monitor Performance**: Track audio loading times and success rates
4. **Quality Control**: Ensure database audio URLs are valid and accessible
5. **User Feedback**: Collect feedback on audio quality and pronunciation
6. **Backup Strategy**: Always maintain fallback for critical functionality

## Conclusion

This hybrid approach provides the best of both worlds:

- **Reliability**: Dictionary API ensures all words have audio
- **Quality**: Database URLs allow custom, high-quality recordings
- **Flexibility**: Easy to migrate between approaches
- **Performance**: Intelligent caching reduces loading times

The system gracefully handles both scenarios and provides a consistent user experience regardless of the audio source.
