# 🎬 Movie Battle Arena

Epic movie showdowns decided by the crowd! A real-time voting app where users can create movie battles and let the community decide which film reigns supreme.

## ✨ Features

- **Movie Battles**: Create head-to-head movie showdowns
- **TMDB Integration**: Search and display real movie data with posters
- **Real-time Voting**: Live vote counts with Supabase Realtime
- **Arguments System**: Users can argue for their favorite movies
- **Social Sharing**: Share battles and results on Threads
- **Mobile-First Design**: Beautiful responsive UI with glass morphism
- **Confetti Celebrations**: Winner announcements with animations
- **Deep Linking**: Direct links to specific battles

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Supabase (PostgreSQL + Realtime)
- **APIs**: TMDB (The Movie Database)
- **Icons**: Lucide React
- **Animations**: Canvas Confetti

## 🛠️ Setup

### 1. Environment Variables

Create a `.env` file:

```bash
# Supabase
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# TMDB (use v4 Bearer preferred; v3 key optional)
VITE_TMDB_ACCESS_TOKEN=YOUR_TMDB_V4_BEARER
VITE_TMDB_API_KEY=YOUR_TMDB_V3_API_KEY
VITE_TMDB_LANG=en-US
```

### 2. Database Schema

Run this SQL in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Battles table
CREATE TABLE IF NOT EXISTS public.battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  ends_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "battles_read" ON public.battles FOR SELECT USING (true);
CREATE POLICY "battles_insert" ON public.battles FOR INSERT WITH CHECK (true);

-- Battle movies table (two rows per battle, slot 'A' | 'B')
CREATE TABLE IF NOT EXISTS public.battle_movies (
  id bigserial PRIMARY KEY,
  battle_id uuid REFERENCES public.battles(id) ON DELETE CASCADE,
  slot text CHECK (slot IN ('A','B')) NOT NULL,
  tmdb_id int NOT NULL,
  title text NOT NULL,
  poster_path text,
  release_date text,
  vote_average numeric,
  votes int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_battle_movies_battle_id ON public.battle_movies(battle_id);

ALTER TABLE public.battle_movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "battle_movies_read" ON public.battle_movies FOR SELECT USING (true);
CREATE POLICY "battle_movies_insert" ON public.battle_movies FOR INSERT WITH CHECK (true);
CREATE POLICY "battle_movies_update_votes" ON public.battle_movies 
  FOR UPDATE USING (true) WITH CHECK (true);

-- Arguments table
CREATE TABLE IF NOT EXISTS public.arguments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid REFERENCES public.battles(id) ON DELETE CASCADE,
  movie_slot text CHECK (movie_slot IN ('A','B')) NOT NULL,
  content text NOT NULL,
  likes int NOT NULL DEFAULT 0,
  author text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_arguments_battle_id ON public.arguments(battle_id);

ALTER TABLE public.arguments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arguments_read" ON public.arguments FOR SELECT USING (true);
CREATE POLICY "arguments_insert" ON public.arguments FOR INSERT WITH CHECK (true);
CREATE POLICY "arguments_update_likes" ON public.arguments 
  FOR UPDATE USING (true) WITH CHECK (true);
```

### 3. Enable Realtime

In your Supabase Dashboard:
1. Go to **Database** → **Replication**
2. Enable Realtime for these tables:
   - `battles`
   - `battle_movies` 
   - `arguments`

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

## 🎯 How It Works

1. **Create Battle**: Search for two movies using TMDB API
2. **Set Duration**: Choose how long the battle runs (1 hour to 1 week)
3. **Share**: Users vote by clicking on their preferred movie
4. **Real-time Updates**: Vote counts update live for all viewers
5. **Arguments**: Users can post arguments supporting their choice
6. **Winner**: When time expires, confetti celebrates the winner
7. **Social Sharing**: Share results on Threads social platform

## 📱 Mobile Experience

- Touch-friendly voting interface
- Responsive design for all screen sizes
- Smooth animations and transitions
- Glass morphism UI with neon accents

## 🚀 Deployment

Ready for deployment on:
- **Vercel**: `vercel --prod`
- **Netlify**: `npm run build` then deploy `dist/`
- **Any static host**: Build outputs to `dist/`

## 🔧 Configuration

### TMDB API Setup
1. Sign up at [TMDB](https://www.themoviedb.org/)
2. Get your API key from Settings → API
3. Add to `.env` file

### Supabase Setup
1. Create project at [Supabase](https://supabase.com/)
2. Run the SQL schema above
3. Enable Realtime for the tables
4. Add credentials to `.env` file

## 📄 License

MIT License - feel free to use for your own projects!