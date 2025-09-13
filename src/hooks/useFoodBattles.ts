import { useState } from 'react';

export const useFoodBattles = () => {
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return {
    battles,
    loading,
    error
  };
};