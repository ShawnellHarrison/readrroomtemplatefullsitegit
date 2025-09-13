// Movie utilities for READ THE ROOM Movie Battle Arena
// Simple movie data structures without external API dependencies

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  overview: string;
}

export const getReleaseYear = (releaseDate: string): string => {
  return releaseDate ? new Date(releaseDate).getFullYear().toString() : 'Unknown';
};

export const sampleMovies: TMDBMovie[] = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    poster_path: "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflyCy3FpPiy3BXg.jpg",
    release_date: "1994-09-23",
    vote_average: 9.3,
    overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency."
  },
  {
    id: 2,
    title: "The Godfather",
    poster_path: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    release_date: "1972-03-24",
    vote_average: 9.2,
    overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son."
  },
  {
    id: 3,
    title: "The Dark Knight",
    poster_path: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    release_date: "2008-07-18",
    vote_average: 9.0,
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests."
  },
  {
    id: 4,
    title: "Pulp Fiction",
    poster_path: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    release_date: "1994-10-14",
    vote_average: 8.9,
    overview: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption."
  },
  {
    id: 5,
    title: "Inception",
    poster_path: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    release_date: "2010-07-16",
    vote_average: 8.8,
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."
  },
  {
    id: 6,
    title: "Interstellar",
    poster_path: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    release_date: "2014-11-07",
    vote_average: 8.6,
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
  },
  {
    id: 7,
    title: "The Matrix",
    poster_path: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    release_date: "1999-03-31",
    vote_average: 8.7,
    overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers."
  },
  {
    id: 8,
    title: "Avengers: Endgame",
    poster_path: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    release_date: "2019-04-26",
    vote_average: 8.4,
    overview: "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos."
  },
  {
    id: 9,
    title: "Forrest Gump",
    poster_path: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    release_date: "1994-07-06",
    vote_average: 8.8,
    overview: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man."
  },
  {
    id: 10,
    title: "The Lord of the Rings: The Return of the King",
    poster_path: "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
    release_date: "2003-12-17",
    vote_average: 8.9,
    overview: "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring."
  },
  {
    id: 11,
    title: "TRON: Ares",
    poster_path: "https://image.tmdb.org/t/p/w500/7GmQKKABXJP1Idw0P0LDxnER4kZ.jpg",
    release_date: "2025-10-10",
    vote_average: 8.2,
    overview: "A highly anticipated sequel in the TRON franchise, featuring cutting-edge visual effects and an immersive digital world adventure."
  }
];

// Sample movie battles for inspiration
export const sampleBattles = [
  {
    title: "Epic Sci-Fi Showdown",
    description: "Which movie should we watch this weekend?",
    movieAId: 5, // Inception
    movieBId: 6   // Interstellar
  },
  {
    title: "Classic vs Modern",
    description: "The ultimate movie battle",
    movieAId: 2, // The Godfather
    movieBId: 3  // The Dark Knight
  },
  {
    title: "Action Heroes",
    description: "Superhero showdown",
    movieAId: 7, // The Matrix
    movieBId: 8  // Avengers: Endgame
  }
];