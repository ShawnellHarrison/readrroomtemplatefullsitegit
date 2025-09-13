// Google Analytics and AdSense compliance utilities

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    adsbygoogle: any[];
  }
}

// Google Analytics Configuration
const GA_MEASUREMENT_ID = 'G-WNTK3BBHSJ'; // Replace with your actual GA4 Measurement ID
const ADSENSE_CLIENT_ID = 'ca-pub-7547620682925490'; // Your AdSense client ID

export const initializeAnalytics = () => {
  // Check for user consent
  const consent = localStorage.getItem('cookie-consent');
  if (!consent) return;

  const preferences = JSON.parse(consent);
  
  if (preferences.analytics) {
    // Initialize Google Analytics 4
    loadGoogleAnalytics();
    console.log('Google Analytics initialized with user consent');
  }
  
  if (preferences.advertising) {
    // Initialize Google AdSense
    loadGoogleAdSense();
    console.log('Google AdSense initialized with user consent');
  }
};

const loadGoogleAnalytics = () => {
  // Set default consent state
  window.gtag = window.gtag || function() {
    (window.dataLayer = window.dataLayer || []).push(arguments);
  };
  
  window.gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied'
  });
  
  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: 'READ THE ROOM - Free Group Voting & Decision Making App',
    page_location: window.location.href,
    anonymize_ip: true, // GDPR compliance
    allow_google_signals: true,
    cookie_flags: 'SameSite=None;Secure'
  });
};

const loadGoogleAdSense = () => {
  // Initialize adsbygoogle array first
  window.adsbygoogle = window.adsbygoogle || [];
  
  // Load Google AdSense script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
};

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  const consent = localStorage.getItem('cookie-consent');
  if (!consent) return;

  const preferences = JSON.parse(consent);
  if (!preferences.analytics || !window.gtag) return;

  // Track event with Google Analytics
  window.gtag('event', eventName, {
    event_category: 'user_interaction',
    event_label: parameters?.label || '',
    value: parameters?.value || 0,
    custom_parameter_1: parameters?.roomId || '',
    custom_parameter_2: parameters?.type || '',
    ...parameters
  });

  console.log('Event tracked:', eventName, parameters);
};

export const trackPageView = (page: string, title?: string) => {
  const consent = localStorage.getItem('cookie-consent');
  if (!consent) return;

  const preferences = JSON.parse(consent);
  if (!preferences.analytics || !window.gtag) return;

  // Track page view with Google Analytics
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: title || `READ THE ROOM - Free Group Voting - ${page}`,
    page_location: window.location.href,
    page_path: window.location.pathname + window.location.search
  });

  console.log('Page view tracked:', page);
};

export const trackRoomCreation = (roomType: string, roomId: string) => {
  console.debug('[analytics] room created', roomId, { type: roomType });
};

export const trackVoteSubmission = (roomId: string, voteType: string, roomType: string) => {
  console.debug('[analytics] vote submitted', roomId, { voteType, roomType });
};

export const trackRoomShare = (roomId: string, shareMethod: 'qr' | 'link' | 'copy') => {
  trackEvent('room_shared', {
    event_category: 'sharing',
    event_label: shareMethod,
    custom_parameter_1: roomId,
    custom_parameter_2: shareMethod
  });
};

export const loadAd = () => {
  if (typeof window !== 'undefined' && window.adsbygoogle) {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.warn('AdSense not available:', error);
    }
  }
};

// Content safety utilities
export const moderateContent = (content: string): boolean => {
  const prohibitedWords = [
    // Hate speech and discrimination
    'hate', 'racist', 'sexist', 'homophobic', 'transphobic',
    // Violence and threats
    'violence', 'kill', 'murder', 'bomb', 'terrorist', 'weapon',
    // Adult content
    'porn', 'sex', 'nude', 'adult', 'xxx',
    // Illegal activities
    'drugs', 'illegal', 'piracy', 'hack', 'fraud',
    // Spam and scams
    'spam', 'scam', 'phishing', 'malware',
    // Harassment
    'bully', 'harass', 'stalk', 'doxx'
  ];
  
  const lowerContent = content.toLowerCase();
  return !prohibitedWords.some(word => lowerContent.includes(word));
};

export const sanitizeInput = (input: string): string => {
  // Remove potentially harmful content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .substring(0, 500); // Limit length
};

// GDPR compliance utilities
export const getConsentStatus = () => {
  const consent = localStorage.getItem('cookie-consent');
  return consent ? JSON.parse(consent) : null;
};

export const updateConsent = (preferences: Record<string, boolean>) => {
  localStorage.setItem('cookie-consent', JSON.stringify(preferences));
  
  // Reinitialize services based on new preferences
  if (preferences.analytics) {
    loadGoogleAnalytics();
  }
  
  if (preferences.advertising) {
    loadGoogleAdSense();
  }
};

// Performance monitoring
export const trackPerformance = (metric: string, value: number) => {
  const consent = localStorage.getItem('cookie-consent');
  if (!consent) return;

  const preferences = JSON.parse(consent);
  if (!preferences.analytics || !window.gtag) return;

  window.gtag('event', 'timing_complete', {
    name: metric,
    value: Math.round(value),
    event_category: 'performance'
  });
};