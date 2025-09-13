import { useState } from 'react';

export const useBookBattles = () => {
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return {
    battles,
    loading,
    error
  };
};