import type { TMDBMovie } from '../components/MovieSearch';

export const SAMPLE_MOVIES: TMDBMovie[] = [
  {
    id: 603692,
    title: 'John Wick: Chapter 4',
    poster_path: '/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
    release_date: '2023-03-24',
    vote_average: 7.8,
    overview: 'With the price on his head ever increasing, John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe and forces that turn old friends into foes.'
  },
  {
    id: 438631,
    title: 'Dune',
    poster_path: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    release_date: '2021-09-15',
    vote_average: 8.0,
    overview: 'Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.'
  },
  {
    id: 27205,
    title: 'Inception',
    poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    release_date: '2010-07-16',
    vote_average: 8.8,
    overview: 'Dom Cobb is a skilled thief, the absolute best in the dangerous art of extraction, stealing valuable secrets from deep within the subconscious during the dream state, when the mind is at its most vulnerable.'
  },
  {
    id: 155,
    title: 'The Dark Knight',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    release_date: '2008-07-18',
    vote_average: 9.0,
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.'
  },
  {
    id: 278,
    title: 'The Shawshank Redemption',
    poster_path: '/9cqNxx0GxF0bflyCy3FpPiy3BXg.jpg',
    release_date: '1994-09-23',
    vote_average: 9.3,
    overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.'
  },
  {
    id: 238,
    title: 'The Godfather',
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    release_date: '1972-03-24',
    vote_average: 9.2,
    overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.'
  },
  {
    id: 424,
    title: 'Schindler\'s List',
    poster_path: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
    release_date: '1993-12-15',
    vote_average: 8.9,
    overview: 'The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis while they worked as slaves in his factory during World War II.'
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    release_date: '1994-09-10',
    vote_average: 8.9,
    overview: 'A burger-loving hit man, his philosophical partner, a drug-addled gangster\'s moll and a washed-up boxer converge in this sprawling, comedic crime caper.'
  }
];

export const getRandomMovies = (count: number = 2): TMDBMovie[] => {
  const shuffled = [...SAMPLE_MOVIES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getMovieById = (id: number): TMDBMovie | undefined => {
  return SAMPLE_MOVIES.find(movie => movie.id === id);
};