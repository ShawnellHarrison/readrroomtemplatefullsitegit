# READ THE ROOM — Supabase Backend

## Apply schema & seed
```bash
supabase db reset --seed
# or step-by-step:
# supabase migration up
# psql "$SUPABASE_DB_URL" -f supabase/migrations/0002_views_analytics.sql
# psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

## Schema Overview

### Core Tables
- `user_profiles` - Extended user info beyond Supabase auth
- `user_sessions` - Anonymous session tracking
- `user_preferences` - User settings and preferences
- `vote_rooms` - Generic voting sessions (yes/no, multiple-choice, scale, ranked-choice)
- `votes` - Individual votes with JSONB flexibility
- `movie_battles` - Movie showdown battles with TMDB integration
- `battle_votes` - Movie battle voting
- `battle_arguments` - Arguments supporting movies (≤280 chars)
- `argument_likes` - Like system for arguments

### Key Features
- **Row Level Security (RLS)** on all tables
- **Anonymous voting** allowed with session tracking
- **Real-time subscriptions** for live updates
- **Automatic triggers** for vote counting and user stats
- **JSONB flexibility** for different vote types
- **Performance indexes** on frequently queried columns

### Vote Data Formats
```json
// Yes/No
{"choice": "Yes"}

// Multiple Choice
{"choices": ["Pizza", "Sushi"]}

// Scale Rating
{"score": 4}

// Ranked Choice
{"ranking": ["Option1", "Option2", "Option3"]}
```

### Authentication
- **Optional user accounts** with enhanced features
- **Anonymous voting** supported for all features
- **Session-based tracking** prevents duplicate votes
- **Auto-profile creation** on user signup

### Movie Battle Features
- **TMDB integration** for movie data and posters
- **Real-time voting** with swipe interface
- **Arguments system** with likes (Twitter-style)
- **Social sharing** on Threads platform

## Environment Setup

1. **Supabase Project**: Create at https://supabase.com
2. **TMDB API**: Get keys at https://www.themoviedb.org/settings/api
3. **Analytics**: Optional Google Analytics and AdSense

## Development Workflow

```bash
# Start local Supabase
supabase start

# Apply schema and seed data
supabase db reset --seed

# Start development server
npm run dev
```

## Production Deployment

1. **Database**: Supabase hosted PostgreSQL
2. **Frontend**: Netlify/Vercel static hosting
3. **Analytics**: Google Analytics 4 + AdSense
4. **APIs**: TMDB for movie data

## Security Features

- **RLS policies** protect user data
- **Content moderation** for user-generated content
- **Rate limiting** considerations for anonymous voting
- **GDPR compliance** with cookie consent
- **Input sanitization** for XSS prevention