// Serviço para API da OpenWeatherMap
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "9843178da08be3df1ce60a33384da5da";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ForecastData {
  cod: string;
  message: number;
  cnt: number;
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
      gust: number;
    };
    visibility: number;
    pop: number;
    sys: {
      pod: string;
    };
    dt_txt: string;
  }>;
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  uv: number;
  precipitation: number;
  pictocode: number;
  description: string;
  icon: string;
  feelsLike: number;
  visibility: number;
}

export interface WeatherForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  precipitationProbability: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  uv: number;
  pictocode: number;
  description: string;
  icon: string;
}

// Função para obter o código de descrição do clima
const getWeatherDescription = (weatherId: number): string => {
  const descriptions: { [key: number]: string } = {
    200: "Tempestade com chuva leve",
    201: "Tempestade com chuva",
    202: "Tempestade com chuva forte",
    210: "Tempestade leve",
    211: "Tempestade",
    212: "Tempestade forte",
    221: "Tempestade violenta",
    230: "Tempestade com chuvisco",
    231: "Tempestade com chuvisco forte",
    232: "Tempestade com chuvisco muito forte",
    300: "Chuvisco leve",
    301: "Chuvisco",
    302: "Chuvisco forte",
    310: "Chuvisco leve",
    311: "Chuvisco",
    312: "Chuvisco forte",
    313: "Chuva e chuvisco",
    314: "Chuva forte e chuvisco",
    321: "Chuvisco",
    500: "Chuva leve",
    501: "Chuva moderada",
    502: "Chuva intensa",
    503: "Chuva muito intensa",
    504: "Chuva extrema",
    511: "Chuva congelante",
    520: "Chuva leve",
    521: "Chuva",
    522: "Chuva forte",
    531: "Chuva violenta",
    600: "Neve leve",
    601: "Neve",
    602: "Neve forte",
    611: "Neve com chuva",
    612: "Neve com chuva leve",
    613: "Neve com chuva",
    615: "Chuva leve e neve",
    616: "Chuva e neve",
    620: "Neve leve",
    621: "Neve",
    622: "Neve forte",
    701: "Neblina",
    711: "Neblina",
    721: "Neblina",
    731: "Turbilhões de poeira",
    741: "Neblina",
    751: "Areia",
    761: "Poeira",
    762: "Cinzas vulcânicas",
    771: "Rajadas",
    781: "Tornado",
    800: "Céu limpo",
    801: "Poucas nuvens",
    802: "Nuvens dispersas",
    803: "Nuvens quebradas",
    804: "Nublado"
  };
  
  return descriptions[weatherId] || "Condição desconhecida";
};

// Função para obter dados meteorológicos atuais
export const getCurrentWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
  
  try {
    console.log("Buscando dados meteorológicos para:", lat, lon);
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na API OpenWeatherMap:", response.status, errorText);
      throw new Error(`Erro na API: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Dados meteorológicos recebidos:", data);
    return data;
  } catch (error) {
    console.error("Erro ao buscar dados meteorológicos:", error);
    throw error;
  }
};

// Função para obter previsão do tempo
export const getForecastData = async (lat: number, lon: number): Promise<ForecastData> => {
  const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
  
  try {
    console.log("Buscando previsão do tempo para:", lat, lon);
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na API OpenWeatherMap:", response.status, errorText);
      throw new Error(`Erro na API: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Previsão do tempo recebida:", data);
    return data;
  } catch (error) {
    console.error("Erro ao buscar previsão do tempo:", error);
    throw error;
  }
};

// Função para obter clima atual
export const getCurrentWeather = async (lat: number, lon: number): Promise<CurrentWeather> => {
  const data = await getCurrentWeatherData(lat, lon);
  const weather = data.weather[0];
  
  return {
    temperature: data.main.temp,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    windDirection: data.wind.deg,
    pressure: data.main.pressure,
    uv: 0, // OpenWeatherMap não fornece UV na API gratuita
    precipitation: 0, // Precipitação não está disponível na API atual
    pictocode: weather.id,
    description: getWeatherDescription(weather.id),
    icon: weather.icon,
    feelsLike: data.main.feels_like,
    visibility: data.visibility
  };
};

// Função para obter previsão do tempo
export const getWeatherForecast = async (lat: number, lon: number): Promise<WeatherForecast[]> => {
  const data = await getForecastData(lat, lon);
  
  // Agrupar por dia
  const dailyForecasts = new Map<string, any[]>();
  
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    if (!dailyForecasts.has(date)) {
      dailyForecasts.set(date, []);
    }
    dailyForecasts.get(date)!.push(item);
  });
  
  return Array.from(dailyForecasts.entries()).map(([date, items]) => {
    const maxTemp = Math.max(...items.map(item => item.main.temp_max));
    const minTemp = Math.min(...items.map(item => item.main.temp_min));
    const avgHumidity = items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length;
    const avgWindSpeed = items.reduce((sum, item) => sum + item.wind.speed, 0) / items.length;
    const avgWindDirection = items.reduce((sum, item) => sum + item.wind.deg, 0) / items.length;
    const maxPrecipitation = Math.max(...items.map(item => item.pop * 100)); // Converter para porcentagem
    
    const mostFrequentWeather = items.reduce((acc, item) => {
      const weatherId = item.weather[0].id;
      acc[weatherId] = (acc[weatherId] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number });
    
    const dominantWeatherId = Object.entries(mostFrequentWeather)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    return {
      date,
      maxTemp,
      minTemp,
      precipitation: 0, // Não disponível na API gratuita
      precipitationProbability: maxPrecipitation,
      humidity: Math.round(avgHumidity),
      windSpeed: Math.round(avgWindSpeed * 10) / 10,
      windDirection: Math.round(avgWindDirection),
      uv: 0, // Não disponível na API gratuita
      pictocode: parseInt(dominantWeatherId),
      description: getWeatherDescription(parseInt(dominantWeatherId)),
      icon: items[0].weather[0].icon
    };
  });
};

// Hook personalizado para clima
export const useWeather = (lat: number, lon: number) => {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [current, forecastData] = await Promise.all([
          getCurrentWeather(lat, lon),
          getWeatherForecast(lat, lon)
        ]);
        
        setCurrentWeather(current);
        setForecast(forecastData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Atualizar a cada 30 minutos
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [lat, lon]);

  return { currentWeather, forecast, loading, error };
};
