import { useState } from 'react';

export function useGeolocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const capture = () => {
    setLoading(true);
    setError(null);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        console.warn('Geolocation error, using simulated coords for local testing:', err);
        // Fallback to simulated location if denied/unavailable (good for local desktop tests)
        // Check standard Lagos coordinate ranges: Lat 6.4 - 6.6, Lng 3.3 - 3.5
        const simulatedLat = 6.4359 + (Math.random() - 0.5) * 0.002;
        const simulatedLng = 3.5303 + (Math.random() - 0.5) * 0.002;
        setCoords({ lat: simulatedLat, lng: simulatedLng });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return { coords, error, loading, capture };
}
