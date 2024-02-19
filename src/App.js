import React, { useState, useEffect } from "react";
import { getWeather } from "./weatherAPI";
import './App.css';
import './css/weather-icons.css';

function App() {
  // State variables for weather data, loading status, error, and city name
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const position = await getCurrentPosition();  // Get user's current position
        const { latitude, longitude } = position.coords;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;  // Get user's timezone
        const data = await getWeather(latitude, longitude, timezone); // Fetch weather data
        setWeatherData(data);
        const cityName = await fetchCityName(latitude, longitude);  // Fetch city name based on coordinates
        setCity(cityName);
      } catch (error) {
        console.error("Error:", error);
        setError("Error fetching weather data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Map of Weather codes -> Icon to display
  const weatherIconMap = {
    "0": "wi wi-day-sunny",     // Clear sky
    "1": "wi wi-day-cloudy",    // Mainly clear
    "2": "wi wi-day-cloudy",    // Partly cloudy
    "3": "wi wi-cloudy",        // Overcast
    "45": "wi wi-day-fog",      // Fog and depositing rime fog
    "48": "wi wi-day-fog",      // Fog and depositing rime fog
    "51": "wi wi-showers",      // Drizzle: Light intensity
    "52": "wi wi-showers",      // Drizzle: Moderate intensity
    "53": "wi wi-showers",      // Drizzle: Dense intensity
    "55": "wi wi-showers",      // Drizzle: Dense intensity
    "56": "wi wi-showers",      // Freezing Drizzle: Light intensity
    "57": "wi wi-showers",      // Freezing Drizzle: Dense intensity
    "61": "wi wi-rain",         // Rain: Slight intensity
    "62": "wi wi-rain",         // Rain: Moderate intensity
    "63": "wi wi-rain",         // Rain: Heavy intensity
    "65": "wi wi-rain",         // Rain: Heavy intensity
    "66": "wi wi-rain-mix",     // Freezing Rain: Light intensity
    "67": "wi wi-rain-mix",     // Freezing Rain: Heavy intensity
    "71": "wi wi-snow",         // Snow fall: Slight intensity
    "72": "wi wi-snow",         // Snow fall: Moderate intensity
    "73": "wi wi-snow",         // Snow fall: Moderate intensity
    "75": "wi wi-snow",         // Snow fall: Heavy intensity
    "77": "wi wi-snow",         // Snow grains
    "80": "wi wi-showers",      // Rain showers: Slight intensity
    "81": "wi wi-showers",      // Rain showers: Moderate intensity
    "82": "wi wi-showers",      // Rain showers: Violent intensity
    "85": "wi wi-snow",         // Snow showers: Slight intensity
    "86": "wi wi-snow",         // Snow showers: Heavy intensity
    "95": "wi wi-thunderstorm", // Thunderstorm: Slight intensity
    "96": "wi wi-thunderstorm", // Thunderstorm with slight hail
    "99": "wi wi-thunderstorm", // Thunderstorm with heavy hail
  };

  // Function to get user's current position
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error)
      );
    });
  };

  // Function to fetch city name based on coordinates
  const fetchCityName = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      return data.address.city;
    } catch (error) {
      console.error("Error fetching city name:", error);
      return null;
    }
  };

  // Function to get the day of the week from a timestamp
  const getDayOfWeek = (timestamp) => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDate = new Date();
    const weatherDate = new Date(timestamp);
    const dayIndex = (weatherDate.getDay() + 7 - currentDate.getDay()) % 7;
    return daysOfWeek[dayIndex];
  };

  const filteredDailyWeather = weatherData?.daily?.filter((day, index) => index !== 0 && index <= 6);

  return (
    <div className="App">
      {city && <h1>{city} Weather</h1>} {/* Display city name if available */}
      {/* Displays current weather */}
      <div className="weather-container">
        {weatherData && (
          <div className="current-weather card">
            {/* Display current weather details */}
            <h2>Current Weather</h2>
            <div className="card-body">
              <div className="weather-icon-container current">
                <i className={`weather-icon ${weatherIconMap[weatherData.current.iconCode]}`}></i>
              </div>
              <p>Temperature: {weatherData.current.currentTemp}°F</p>
              <p>High: {weatherData.current.highTemp}°F</p>
              <p>Low: {weatherData.current.lowTemp}°F</p>
              <p>Feels Like High: {weatherData.current.highFeelsLike}°F</p>
              <p>Feels Like Low: {weatherData.current.lowFeelsLike}°F</p>
              <p>Wind Speed: {weatherData.current.windSpeed} mph</p>
              <p>Precipitation: {weatherData.current.precip} inches</p>
            </div>
          </div>
        )}
      </div>
      {weatherData && weatherData.hourly && (
        <div>
          {/* Display hourly weather */}
          <h2>Hourly Weather</h2>
          <div className="hourly-scroll weather-card-container">
            {weatherData.hourly.slice(0, 24).map((hour, index) => (
              <div key={index} className="hourly-item">
                <div className="weather-icon-container hourly">
                  <i className={weatherIconMap[hour.iconCode]}></i>
                </div>
                <p>Day: {getDayOfWeek(hour.timestamp)}</p>
                <p>Time: {new Date(hour.timestamp).toLocaleTimeString()}</p>
                <p>Temperature: {hour.temp}°F</p>
                <p>Feels Like: {hour.feelsLike}°F</p>
                <p>Wind Speed: {hour.windSpeed} mph</p>
                <p>Precipitation: {hour.precip} inches</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {filteredDailyWeather && (
        <div>
          {/* Display daily weather */}
          <h2>Daily Weather</h2>
          <div className="daily-scroll weather-card-container">
            {filteredDailyWeather.map((day, index) => (
              <div key={index} className="daily-item">
                <div className="weather-icon-container daily">
                  <i className={weatherIconMap[day.iconCode]}></i>
                </div>
                <p>{getDayOfWeek(day.timestamp)} - {new Date(day.timestamp).toLocaleDateString()}</p>
                <p>Temperature: {day.maxTemp}°F</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;