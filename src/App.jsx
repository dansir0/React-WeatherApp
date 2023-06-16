import { useState, useEffect } from 'react';
import { Icon } from './Icon.jsx';

function Header({ data }) {
    const maxTemp = data?.daily?.temperature_2m_max[0];
    const minTemp = data?.daily?.temperature_2m_min[0];
    const windData = `${data?.current_weather?.windspeed}m/s ${data?.current_weather?.winddirection}`;
    const precip = data?.daily?.precipitation_probability_max[0];

    return (
        <div className="header-container">
            <div className="header-left">
                <div className="weather-icon large">
                    <Icon weathercode={data?.current_weather?.weathercode}/>
                </div>
                <div className="header-current-temp">
                    <span data-id="data-current-temp">{data?.current_weather?.temperature}</span>&deg;
                </div>
            </div>
            <div className="header-right">
                <div className="info-group">
                    <div className="label">High/Low</div>
                    <div><span data-id="current-high_low">{`${maxTemp}/${minTemp}`}</span>&deg;</div>
                </div>
                <div className="info-group">
                    <div className="label">Wind</div>
                    <div><span data-id="current-wind">{windData}</span>&deg;</div>
                </div>
                <div className="info-group">
                    <div className="label">Precip</div>
                    <div><span data-id="current-precip">{precip}%</span></div>
                </div>
            </div>
        </div>
    );
}

function CardItem({ id, code, temperature, day, handleId }) {
    return (
        <div key={id} onClick={() => handleId(id)} className="day-card">
            <div className="weather-icon">
                <Icon weathercode={code}/>
            </div>
            <div className="day-card-day">{day}</div>
            <div>{temperature}&deg;</div>
        </div>
    );
}

function DailyCards({ data, handleId }) {
    let objArray = []
    for (let i = 0; i < 7; i++) {
        let dayName = new Date(data?.time?.[i] * 1000).toLocaleDateString('en-US', {weekday: 'long'});
        let tempData = {id: i, code: data?.weathercode[i], temperature: data?.temperature_2m_max?.[i], day: dayName};
        objArray.push(tempData);
    }

    return (
        <div className="day-section">
            {objArray.map((card) => {
                return (
                    <CardItem {...card}
                    key={card.id}
                    code={card.code}
                    temperature={card.temperature}
                    day={card.day}
                    handleId={handleId}
                    />
                );
            })}
        </div>
    );
}

function HourlyItem({ id, date, temperature, precipitation, code, windSpeed, windDirection }) {
    let tempDate = new Date(date * 1000);
    let formattedTime = `${tempDate.getHours()}:00`;

    return (
        <div key={id} className="hour-row">
            <div className="info-group">
                <div className="label">{new Date(date * 1000).toLocaleDateString('en-US', {weekday: 'long'})}</div>
                <div>{formattedTime}</div>
            </div>
            <div className="weather-icon">
                <Icon weathercode={code}/>
            </div>
            <div className="info-group">
                <div className="label">Temp</div>
                <div>{temperature}&deg;</div>
            </div>
            <div className="info-group">
                <div className="label">Precip</div>
                <div>{precipitation}%</div>
            </div>
            <div className="info-group">
                <div className="label">Wind</div>
                <div>{`${windSpeed}m/s ${windDirection}`}&deg;</div>
            </div>
        </div>
    );
}

function HourlySection({ data, id }) {
    let objArray = [];
    for (let i = 0; i < 24; i+=3) {
        let index = id * 24 + i
        let dateTemp = data?.time[index]
        let temperatureTemp = data?.temperature_2m[index];
        let tempPrecipitation = data?.precipitation_probability[index];
        let weathercodeTemp = data?.weathercode[index];
        let windSpeedTemp = data?.windspeed_10m[index];
        let windDirTemp = data?.winddirection_10m[index];

        let tempData = {id: i/3, date: dateTemp, temperature: temperatureTemp, precipitation: tempPrecipitation, 
        code: weathercodeTemp, wind_speed: windSpeedTemp, wind_direction: windDirTemp};
        
        objArray.push(tempData);
    }

    return (
        <div className="hour-section">
            {objArray.map((item) => {
                return (
                    <HourlyItem {...item}
                    key={item.id}
                    date={item.date}
                    temperature={item.temperature}
                    precipitation={item.precipitation}
                    code={item.code}
                    windSpeed={item.wind_speed}
                    windDirection={item.wind_direction}
                    />
                );
            })}
        </div>
    )
}

function DarkModeBtn({ theme, onClick }) {

    return (
        <div className='theme-btn' onClick={onClick}>
            <span>{theme === 'light' ? '🌒' : '☀️'}</span>
        </div>
    );
}

export default function App() {
    const [data, setData] = useState(null);
    const [currentId, setId] = useState(0);

    function getDefaultTheme() {
        const localStorageTheme = localStorage.getItem('theme');
        const browserDefault = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        return localStorageTheme || browserDefault;
    }

    const [theme, setTheme] = useState(getDefaultTheme());
    document.documentElement.setAttribute("data-theme", theme);

    const switchTheme = () => {
        const isThemeDark = theme === 'dark';
        setTheme(isThemeDark  ? 'light' : 'dark');
        localStorage.setItem('theme', isThemeDark  ? 'light' : 'dark');
        document.documentElement.setAttribute("data-theme", theme);
    }

    // Default Geolocation: New York
    let latitude = 40.71;
    let longitude = -74.01;

    if (navigator.geolocation) {
        // Geolocation is supported
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Success callback
                latitude = (position.coords.latitude).toFixed(2);
                longitude = (position.coords.longitude).toFixed(2);
            },
            (error) => {
                // Error callback
                console.error("Error getting position:", error);
            }
        );

    } else {
        // Geolocation is not supported
        throw new Error('Geolocation is not supported on your browser');
    }

    useEffect(() => {

        const fetchData = async () => {
            try {
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability,weathercode,windspeed_10m,winddirection_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,winddirection_10m_dominant&current_weather=true&windspeed_unit=ms&timeformat=unixtime&timezone=auto`;
                const response = await fetch(url);
                const data = await response.json();
                setData(data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchData();
    }, []);

    function handleId(el) {
        setId(el);
    }

    return (
        <div className='wrapper'>
            <h3>
                {data?.timezone.match(/\/(.*)/)[1].replace(/_/g, ' ') + ' / '
                + new Date(data?.current_weather?.time * 1000).toUTCString()}
            </h3>
            <Header data={data}/>
            <DailyCards data={data?.daily} handleId={handleId}/>
            <HourlySection data={data?.hourly} id={currentId}/>
            <DarkModeBtn theme={theme} onClick={switchTheme}/>
        </div>
    );
}