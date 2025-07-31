// Serviço para API do Meteoblue
const METEOBLUE_API_KEY = "T6V34x0KMBHoAJ8P";
const BASE_URL = "https://my.meteoblue.com/packages/basic-1h_1d";

export interface WeatherData {
  metadata: {
    latitude: number;
    longitude: number;
    height: number;
    timezone: string;
    timezone_abbreviation: string;
    utc_timeoffset: number;
    modelrun_utc: string;
    modelrun_updatetime_utc: string;
  };
  data_1h: {
    time: string[];
    pictocode: number[];
    uv: number[];
    temperature: number[];
    winddirection: number[];
    precipitation: number[];
    relativehumidity: number[];
    sealevelpressure: number[];
    windspeed: number[];
    gust: number[];
  };
  data_day: {
    time: string[];
    pictocode: number[];
    temperature_max: number[];
    temperature_min: number[];
    precipitation_probability: number[];
    precipitation: number[];
    relativehumidity: number[];
    windspeed: number[];
    winddirection: number[];
    uv: number[];
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
}

// Função para obter o código de descrição do clima
const getWeatherDescription = (pictocode: number): string => {
  const descriptions: { [key: number]: string } = {
    1: "Céu limpo",
    2: "Pouco nublado",
    3: "Parcialmente nublado",
    4: "Nublado",
    5: "Neblina",
    6: "Neblina úmida",
    7: "Neblina com chuva",
    8: "Neblina com neve",
    9: "Neblina com granizo",
    10: "Neblina com chuva e neve",
    11: "Neblina com granizo e neve",
    12: "Neblina com granizo e chuva",
    13: "Neblina com granizo, chuva e neve",
    14: "Neblina com chuva e granizo",
    15: "Neblina com neve e granizo",
    16: "Neblina com chuva, neve e granizo",
    17: "Neblina com chuva e neve",
    18: "Neblina com neve",
    19: "Neblina com granizo",
    20: "Neblina com chuva",
    21: "Neblina com neve e chuva",
    22: "Neblina com granizo e chuva",
    23: "Neblina com granizo e neve",
    24: "Neblina com chuva, granizo e neve",
    25: "Neblina com neve, granizo e chuva",
    26: "Neblina com granizo, neve e chuva",
    27: "Neblina com chuva, neve e granizo",
    28: "Neblina com neve, chuva e granizo",
    29: "Neblina com granizo, chuva e neve",
    30: "Neblina com chuva, granizo e neve",
    31: "Neblina com neve, granizo e chuva",
    32: "Neblina com granizo, neve e chuva",
    33: "Neblina com chuva, neve e granizo",
    34: "Neblina com neve, chuva e granizo",
    35: "Neblina com granizo, chuva e neve",
    36: "Neblina com chuva, granizo e neve",
    37: "Neblina com neve, granizo e chuva",
    38: "Neblina com granizo, neve e chuva",
    39: "Neblina com chuva, neve e granizo",
    40: "Neblina com neve, chuva e granizo",
    41: "Neblina com granizo, chuva e neve",
    42: "Neblina com chuva, granizo e neve",
    43: "Neblina com neve, granizo e chuva",
    44: "Neblina com granizo, neve e chuva",
    45: "Neblina com chuva, neve e granizo",
    46: "Neblina com neve, chuva e granizo",
    47: "Neblina com granizo, chuva e neve",
    48: "Neblina com chuva, granizo e neve",
    49: "Neblina com neve, granizo e chuva",
    50: "Neblina com granizo, neve e chuva",
    51: "Neblina com chuva, neve e granizo",
    52: "Neblina com neve, chuva e granizo",
    53: "Neblina com granizo, chuva e neve",
    54: "Neblina com chuva, granizo e neve",
    55: "Neblina com neve, granizo e chuva",
    56: "Neblina com granizo, neve e chuva",
    57: "Neblina com chuva, neve e granizo",
    58: "Neblina com neve, chuva e granizo",
    59: "Neblina com granizo, chuva e neve",
    60: "Neblina com chuva, granizo e neve",
    61: "Neblina com neve, granizo e chuva",
    62: "Neblina com granizo, neve e chuva",
    63: "Neblina com chuva, neve e granizo",
    64: "Neblina com neve, chuva e granizo",
    65: "Neblina com granizo, chuva e neve",
    66: "Neblina com chuva, granizo e neve",
    67: "Neblina com neve, granizo e chuva",
    68: "Neblina com granizo, neve e chuva",
    69: "Neblina com chuva, neve e granizo",
    70: "Neblina com neve, chuva e granizo",
    71: "Neblina com granizo, chuva e neve",
    72: "Neblina com chuva, granizo e neve",
    73: "Neblina com neve, granizo e chuva",
    74: "Neblina com granizo, neve e chuva",
    75: "Neblina com chuva, neve e granizo",
    76: "Neblina com neve, chuva e granizo",
    77: "Neblina com granizo, chuva e neve",
    78: "Neblina com chuva, granizo e neve",
    79: "Neblina com neve, granizo e chuva",
    80: "Neblina com granizo, neve e chuva",
    81: "Neblina com chuva, neve e granizo",
    82: "Neblina com neve, chuva e granizo",
    83: "Neblina com granizo, chuva e neve",
    84: "Neblina com chuva, granizo e neve",
    85: "Neblina com neve, granizo e chuva",
    86: "Neblina com granizo, neve e chuva",
    87: "Neblina com chuva, neve e granizo",
    88: "Neblina com neve, chuva e granizo",
    89: "Neblina com granizo, chuva e neve",
    90: "Neblina com chuva, granizo e neve",
    91: "Neblina com neve, granizo e chuva",
    92: "Neblina com granizo, neve e chuva",
    93: "Neblina com chuva, neve e granizo",
    94: "Neblina com neve, chuva e granizo",
    95: "Neblina com granizo, chuva e neve",
    96: "Neblina com chuva, granizo e neve",
    97: "Neblina com neve, granizo e chuva",
    98: "Neblina com granizo, neve e chuva",
    99: "Neblina com chuva, neve e granizo",
    100: "Neblina com neve, chuva e granizo"
  };
  
  return descriptions[pictocode] || "Condição desconhecida";
};

// Função para obter dados meteorológicos
export const getWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  const url = `${BASE_URL}?lat=${lat}&lon=${lon}&apikey=${METEOBLUE_API_KEY}&format=json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar dados meteorológicos:", error);
    throw error;
  }
};

// Função para obter clima atual
export const getCurrentWeather = async (lat: number, lon: number): Promise<CurrentWeather> => {
  const data = await getWeatherData(lat, lon);
  const currentIndex = 0; // Primeiro item é o clima atual
  
  return {
    temperature: data.data_1h.temperature[currentIndex],
    humidity: data.data_1h.relativehumidity[currentIndex],
    windSpeed: data.data_1h.windspeed[currentIndex],
    windDirection: data.data_1h.winddirection[currentIndex],
    pressure: data.data_1h.sealevelpressure[currentIndex],
    uv: data.data_1h.uv[currentIndex],
    precipitation: data.data_1h.precipitation[currentIndex],
    pictocode: data.data_1h.pictocode[currentIndex],
    description: getWeatherDescription(data.data_1h.pictocode[currentIndex])
  };
};

// Função para obter previsão do tempo
export const getWeatherForecast = async (lat: number, lon: number): Promise<WeatherForecast[]> => {
  const data = await getWeatherData(lat, lon);
  
  return data.data_day.time.map((time, index) => ({
    date: time,
    maxTemp: data.data_day.temperature_max[index],
    minTemp: data.data_day.temperature_min[index],
    precipitation: data.data_day.precipitation[index],
    precipitationProbability: data.data_day.precipitation_probability[index],
    humidity: data.data_day.relativehumidity[index],
    windSpeed: data.data_day.windspeed[index],
    windDirection: data.data_day.winddirection[index],
    uv: data.data_day.uv[index],
    pictocode: data.data_day.pictocode[index],
    description: getWeatherDescription(data.data_day.pictocode[index])
  }));
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