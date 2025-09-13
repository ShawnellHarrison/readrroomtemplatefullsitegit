// SEO utilities for dynamic meta tag management
export interface BattleMetaData {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogImage?: string;
  structuredData?: any;
}

export const updateMetaTags = (metaData: BattleMetaData) => {
  // Update title
  document.title = metaData.title;
  
  // Update or create meta tags
  const updateMeta = (name: string, content: string, property = false) => {
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let meta = document.querySelector(selector) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      if (property) {
        meta.setAttribute('property', name);
      } else {
        meta.setAttribute('name', name);
      }
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', content);
  };

  // Standard meta tags
  updateMeta('description', metaData.description);
  updateMeta('keywords', metaData.keywords);
  
  // Open Graph tags
  updateMeta('og:title', metaData.ogTitle, true);
  updateMeta('og:description', metaData.ogDescription, true);
  updateMeta('og:url', metaData.ogUrl, true);
  updateMeta('og:type', 'website', true);
  
  if (metaData.ogImage) {
    updateMeta('og:image', metaData.ogImage, true);
  }
  
  // Twitter tags
  updateMeta('twitter:card', 'summary_large_image');
  updateMeta('twitter:site', '@readtheroomsocial');
  updateMeta('twitter:title', metaData.ogTitle);
  updateMeta('twitter:description', metaData.ogDescription);
  
  // Structured data
  if (metaData.structuredData) {
    let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(metaData.structuredData);
  }
};

export const getBattleMetaData = (
  battleType: 'movie' | 'book' | 'game' | 'music' | 'food',
  battleTitle?: string,
  itemA?: any,
  itemB?: any,
  isResults = false
): BattleMetaData => {
  const baseUrl = 'https://read-the-room.social';
  
  if (battleTitle && itemA && itemB) {
    // Individual battle page
    const nameA = itemA.title || itemA.name || 'Unknown';
    const nameB = itemB.title || itemB.name || 'Unknown';
    const slug = `${nameA}-vs-${nameB}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const prefix = isResults ? 'RESULTS: ' : '';
    const suffix = isResults ? ' - See Who Won' : ' - Vote Now';
    
    return {
      title: `${prefix}${nameA} vs ${nameB}${suffix} | Read The Room`,
      description: `${isResults ? 'The results are in! See who won the' : 'The ultimate'} ${battleType} battle! ${nameA} vs ${nameB} - ${isResults ? 'voting breakdown and stats' : 'vote for your favorite and see live results'}.`,
      keywords: `${nameA} vs ${nameB}, ${battleType} battle, ${battleType} voting, ${battleType} comparison`,
      ogTitle: `${prefix}${nameA} vs ${nameB} - ${isResults ? 'Battle Winner Revealed' : `Vote for ${battleType}'s Best`}`,
      ogDescription: `${isResults ? 'The epic' : 'Epic'} ${battleType} battle ${isResults ? 'results! See who won' : '! Cast your vote and see who wins'} between ${nameA} and ${nameB}.`,
      ogUrl: `${baseUrl}/${isResults ? 'results' : 'battle'}/${slug}`,
      ogImage: itemA.poster_path || itemA.background_image || itemA.imageLinks?.thumbnail || itemA.image,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": `${nameA} vs ${nameB} Battle`,
        "description": `Vote in the ultimate ${battleType} battle between ${nameA} and ${nameB}`,
        "url": `${baseUrl}/battle/${slug}`,
        "datePublished": new Date().toISOString().split('T')[0],
        "author": {
          "@type": "Organization",
          "name": "Read The Room"
        },
        "interactionStatistic": [{
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/VoteAction",
          "userInteractionCount": Math.floor(Math.random() * 2000) + 100
        }]
      }
    };
  }
  
  // Category pages
  const categoryData = {
    music: {
      title: 'Music Battle Royale - Vote on Best Songs, Artists & Albums | Read The Room',
      description: 'Epic music battles! Vote on the best songs, artists, and albums. Taylor Swift vs Beyoncé, rock vs hip-hop, and more. Join thousands deciding music\'s greatest.',
      keywords: 'music battle, best song voting, artist comparison, music vs music, song battle app, vote best artist, music poll',
      ogTitle: 'Music Battle Royale - Vote on the Best Music',
      ogDescription: 'Join epic music battles! Vote on artists, songs, albums and settle the greatest music debates.',
      ogUrl: `${baseUrl}/music-battles`
    },
    movie: {
      title: 'Movie Showdowns - Vote on Cinema\'s Greatest Battles | Read The Room',
      description: 'Ultimate movie battles! Marvel vs DC, classic vs modern, horror vs comedy. Vote on the greatest films and settle cinema debates once and for all.',
      keywords: 'movie battle, film comparison, best movie voting, movie vs movie, cinema poll, film showdown, movie voting app',
      ogTitle: 'Movie Showdowns - Vote on the Best Films',
      ogDescription: 'Epic movie battles! Compare films, vote on cinema\'s greatest debates, and discover what audiences really think.',
      ogUrl: `${baseUrl}/movie-battles`
    },
    food: {
      title: 'Food Wars - Vote on Best Restaurants & Cuisine Battles | Read The Room',
      description: 'Delicious food battles! Pizza vs burgers, sushi vs tacos, local restaurants face-offs. Vote on cuisine\'s greatest debates and find the best eats.',
      keywords: 'food battle, restaurant voting, cuisine comparison, best food poll, pizza vs burger, restaurant wars, food voting app',
      ogTitle: 'Food Wars - Vote on the Best Cuisine',
      ogDescription: 'Tasty battles! Vote on restaurants, cuisines, and food favorites. Settle the ultimate food debates.',
      ogUrl: `${baseUrl}/food-battles`
    },
    book: {
      title: 'Literary Showdowns - Vote on Best Books & Authors | Read The Room',
      description: 'Epic book battles! Classic vs modern literature, fantasy vs sci-fi, bestselling authors face-off. Vote on literature\'s greatest debates.',
      keywords: 'book battle, literature voting, author comparison, best book poll, book vs book, reading poll, literary showdown',
      ogTitle: 'Literary Showdowns - Vote on the Best Books',
      ogDescription: 'Book battles! Compare authors, novels, genres and vote on literature\'s greatest debates.',
      ogUrl: `${baseUrl}/book-battles`
    },
    game: {
      title: 'Game Battle Arena - Vote on Best Video Games | Read The Room',
      description: 'Epic gaming battles! Console vs PC, indie vs AAA, retro vs modern. Vote on gaming\'s greatest debates and discover the community\'s favorites.',
      keywords: 'game battle, video game voting, gaming poll, best game voting, game vs game, gaming showdown',
      ogTitle: 'Game Battle Arena - Vote on the Best Games',
      ogDescription: 'Gaming battles! Compare games, vote on the industry\'s greatest debates, and see what gamers really think.',
      ogUrl: `${baseUrl}/game-battles`
    }
  };

  const data = categoryData[battleType];
  
  return {
    ...data,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${battleType.charAt(0).toUpperCase() + battleType.slice(1)} Battles`,
      "description": `Collection of ${battleType} voting battles`,
      "url": data.ogUrl,
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": []
      }
    }
  };
};

export const getTrendingMetaData = (): BattleMetaData => {
  return {
    title: 'Trending Battles - Vote on What\'s Hot Right Now | Read The Room',
    description: 'Vote on today\'s hottest debates! Trending topics, viral comparisons, current events battles. See what everyone\'s talking about and voting on.',
    keywords: 'trending battles, viral voting, hot topics, current events poll, trending debates, what\'s popular now',
    ogTitle: 'Trending Battles - Vote on What\'s Hot',
    ogDescription: 'Today\'s hottest battles! Vote on trending topics, viral debates, and see what everyone\'s choosing.',
    ogUrl: 'https://read-the-room.social/trending',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Trending Battles",
      "description": "Collection of trending voting battles and hot topics",
      "url": "https://read-the-room.social/trending"
    }
  };
};