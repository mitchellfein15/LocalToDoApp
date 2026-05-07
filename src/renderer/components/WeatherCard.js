import React, { useEffect, useState } from 'react';
import './WidgetCards.css';

const FALLBACK_COORDS = { latitude: 41.5047, longitude: -81.6087 };

function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
  }, []);

  const fetchWeather = async (latitude, longitude) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Weather request failed');
    }
    return response.json();
  };

  const loadWeather = async () => {
    setLoading(true);
    try {
      if (!navigator.geolocation) {
        const fallback = await fetchWeather(FALLBACK_COORDS.latitude, FALLBACK_COORDS.longitude);
        setWeather(fallback);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await fetchWeather(position.coords.latitude, position.coords.longitude);
            setWeather(data);
          } catch (err) {
            console.error(err);
          } finally {
            setLoading(false);
          }
        },
        async () => {
          const fallback = await fetchWeather(FALLBACK_COORDS.latitude, FALLBACK_COORDS.longitude);
          setWeather(fallback);
          setLoading(false);
        },
        { timeout: 5000 }
      );
      return;
    } catch (error) {
      console.error('Failed to load weather', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="widget-loading">Loading weather...</div>;
  }

  if (!weather || !weather.current) {
    return <div className="widget-loading">Weather unavailable</div>;
  }

  return (
    <div className="weather-widget">
      <div className="weather-now">
        <div className="weather-temp">{(Math.round(weather.current.temperature_2m * 1.8))+32}°F</div>
        <div className="weather-sub">Current</div>
      </div>
      <div className="weather-forecast">
        <span>
          L: {(Math.round(weather.daily.temperature_2m_min?.[0] * 1.8)+32)}°F
        </span>
        <span>
          H: {(Math.round(weather.daily.temperature_2m_max?.[0]* 1.8)+32)}°F
        </span>
      </div>
    </div>
  );
}

export default WeatherCard;
