// Replace with your OpenWeatherMap API key
const API_KEY = '332bb0d4be0536ee5152aa113c5db7fb';
const BASE_URL = 'https://api.openweathermap.org/data/2.5'; 

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const weatherInfo = document.getElementById('weather-info');

// Weather display elements
const cityName = document.getElementById('city-name');
const dateElement = document.getElementById('date');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const feelsLike = document.getElementById('feels-like');
const visibility = document.getElementById('visibility');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecast-container');

// Event listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
    }
});

locationBtn.addEventListener('click', getCurrentLocationWeather);

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherByCity(city);
        }
    }
});

// Show loading state
function showLoading() {
    loading.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    weatherInfo.classList.add('hidden');
}

// Hide loading state
function hideLoading() {
    loading.classList.add('hidden');
}

// Show error message
function showError(message) {
    hideLoading();
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    weatherInfo.classList.add('hidden');
}

// Show weather data
function showWeather() {
    hideLoading();
    errorMessage.classList.add('hidden');
    weatherInfo.classList.remove('hidden');
}

// Get weather by city name
async function getWeatherByCity(city) {
    try {
        showLoading();
        
        // Get current weather
        const currentResponse = await fetch(
            `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!currentResponse.ok) {
            throw new Error('City not found');
        }
        
        const currentData = await currentResponse.json();
        
        // Get 5-day forecast
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        const forecastData = await forecastResponse.json();
        
        displayWeather(currentData, forecastData);
        
    } catch (error) {
        showError(error.message);
    }
}

// Get weather by coordinates
async function getWeatherByCoords(lat, lon) {
    try {
        showLoading();
        
        // Get current weather
        const currentResponse = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        const currentData = await currentResponse.json();
        
        // Get 5-day forecast
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        const forecastData = await forecastResponse.json();
        
        displayWeather(currentData, forecastData);
        
    } catch (error) {
        showError('Unable to fetch weather data');
    }
}

// Get current location weather
function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            () => {
                showError('Unable to get your location');
            }
        );
    } else {
        showError('Geolocation is not supported by this browser');
    }
}

// Display weather data
function displayWeather(currentData, forecastData) {
    // Current weather
    cityName.textContent = `${currentData.name}, ${currentData.sys.country}`;
    dateElement.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const iconCode = currentData.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = currentData.weather[0].description;
    
    temperature.textContent = `${Math.round(currentData.main.temp)}°C`;
    description.textContent = currentData.weather[0].description
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    feelsLike.textContent = `${Math.round(currentData.main.feels_like)}°C`;
    
    // Weather stats
    visibility.textContent = `${(currentData.visibility / 1000).toFixed(1)} km`;
    humidity.textContent = `${currentData.main.humidity}%`;
    windSpeed.textContent = `${(currentData.wind.speed * 3.6).toFixed(1)} km/h`;
    pressure.textContent = `${currentData.main.pressure} hPa`;
    
    // 5-day forecast
    displayForecast(forecastData);
    
    showWeather();
}

// Display 5-day forecast
function displayForecast(forecastData) {
    forecastContainer.innerHTML = '';
    
    // Get one forecast per day (every 8th item = 24 hours)
    const dailyForecasts = forecastData.list.filter((item, index) => index % 8 === 0);
    
    dailyForecasts.slice(0, 5).forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(forecast.main.temp);
        const iconCode = forecast.weather[0].icon;
        const desc = forecast.weather[0].description;
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <h4>${dayName}</h4>
            <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${desc}">
            <div class="temp">${temp}°C</div>
            <div class="desc">${desc}</div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

// Initialize app with default city
document.addEventListener('DOMContentLoaded', () => {
    getWeatherByCity('London'); // Default city
});
