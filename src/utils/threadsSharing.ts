// Threads Sharing Integration for Movie Battle Arena
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const THREADS_BASE_URL = 'https://threads.net/intent/post';

// Main sharing functions
export const shareToThreads = (text: string, url: string) => {
  const threadsUrl = `${THREADS_BASE_URL}?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(threadsUrl, '_blank', 'width=600,height=700');
  
  // Track sharing event
  if (window.gtag) {
    window.gtag('event', 'threads_share', {
      event_category: 'social_sharing',
      event_label: 'threads',
      value: 1
    });
  }
};

export const shareBattle = (movieA: any, movieB: any, battleUrl: string, voteCounts = { A: 0, B: 0 }) => {
  const totalVotes = voteCounts.A + voteCounts.B;
  const percentA = totalVotes > 0 ? Math.round((voteCounts.A / totalVotes) * 100) : 50;
  const percentB = totalVotes > 0 ? Math.round((voteCounts.B / totalVotes) * 100) : 50;
  
  const text = `🎬 EPIC MOVIE BATTLE!

${movieA.title} (${movieA.release_date?.split('-')[0] || 'Unknown'})
🆚
${movieB.title} (${movieB.release_date?.split('-')[0] || 'Unknown'})

Current votes:
🎬 ${movieA.title}: ${percentA}%
🎬 ${movieB.title}: ${percentB}%

Which team are you on? Vote now! 🍿

#MovieBattle #ReadTheRoom`;
  
  shareToThreads(text, battleUrl);
};

export const shareVote = (chosenMovie: any, battleUrl: string) => {
  const movieTitle = chosenMovie.title.replace(/\s+/g, '');
  const text = `🗳️ Just voted for ${chosenMovie.title}!

This movie is going to WIN! Join the battle and vote for your pick! 🎬

#MovieBattle #Team${movieTitle} #ReadTheRoom`;
  shareToThreads(text, battleUrl);
};

export const shareArgument = (movieTitle: string, argument: string, authorName: string, battleUrl: string) => {
  const text = `🗣️ Making my case for ${movieTitle}:

"${argument}"

- ${authorName}

Join the battle and vote! 🎬

#MovieBattle #TeamArg #ReadTheRoom`;
  shareToThreads(text, battleUrl);
};

export const shareResult = (winner: any, loser: any, percentage: number, battleUrl: string) => {
  let template;
  if (percentage >= 70) {
    template = `💥 ABSOLUTE DOMINATION!

${winner.title} CRUSHES ${loser.title} with ${percentage}% of votes!

When you know, you know! 🏆

#MovieBattle #Landslide #ReadTheRoom`;
  } else if (percentage <= 55) {
    template = `😱 TOO CLOSE TO CALL!

${winner.title} barely beats ${loser.title} by ${percentage}%!

Every vote mattered! 🔥

#MovieBattle #NailBiter #ReadTheRoom`;
  } else {
    template = `🏆 BATTLE RESULTS!

${winner.title} WINS with ${percentage}% of votes!

${winner.title} vs ${loser.title}

The people have spoken! 🎬

#MovieBattle #ReadTheRoom`;
  }
  shareToThreads(template, battleUrl);
};

// Share prompt modal component data
export interface SharePromptData {
  type: 'vote' | 'argument' | 'result' | 'battle';
  movie?: any;
  movieA?: any;
  movieB?: any;
  movieTitle?: string;
  argument?: string;
  author?: string;
  winner?: any;
  loser?: any;
  percentage?: number;
  votes?: { A: number; B: number };
  battleUrl: string;
}

export const getShareMessage = (type: string): string => {
  const messages = {
    vote: "🎬 Just voted! Want to share your pick?",
    argument: "🗣️ Great argument! Share it on Threads?",
    result: "🏆 Battle complete! Share the results?",
    battle: "🚀 Share this epic battle?"
  };
  return messages[type as keyof typeof messages] || "Share on Threads?";
};

export const handleShare = (type: string, data: SharePromptData) => {
  switch(type) {
    case 'vote':
      if (data.movie) shareVote(data.movie, data.battleUrl);
      break;
    case 'argument':
      if (data.movieTitle && data.argument && data.author) {
        shareArgument(data.movieTitle, data.argument, data.author, data.battleUrl);
      }
      break;
    case 'result':
      if (data.winner && data.loser && data.percentage) {
        shareResult(data.winner, data.loser, data.percentage, data.battleUrl);
      }
      break;
    case 'battle':
      if (data.movieA && data.movieB) {
        shareBattle(data.movieA, data.movieB, data.battleUrl, data.votes);
      }
      break;
  }
};