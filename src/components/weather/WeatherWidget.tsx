import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  Loader2,
} from "lucide-react";
import { getCurrentWeather, CurrentWeather } from "@/services/openweather";

interface WeatherWidgetProps {
  lat?: number;
  lon?: number;
  className?: string;
}

export const WeatherWidget = ({
  lat = -23.5505,
  lon = -46.6333,
  className = "",
}: WeatherWidgetProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const weatherData = await getCurrentWeather(lat, lon);
        setWeather(weatherData);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar dados meteorológicos:", err);
        setError("Erro ao carregar dados meteorológicos");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Atualiza a cada 30 minutos
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lat, lon]);

  // OpenWeather weather codes
  const getWeatherIcon = (weatherId: number) => {
    if (weatherId >= 200 && weatherId < 300) return <CloudRain className="h-4 w-4 text-blue-400" />; // Trovoadas/chuva
    if (weatherId >= 300 && weatherId < 400) return <CloudRain className="h-4 w-4 text-blue-400" />; // Chuvisco
    if (weatherId >= 500 && weatherId < 600) return <CloudRain className="h-4 w-4 text-blue-400" />; // Chuva
    if (weatherId >= 600 && weatherId < 700) return <CloudSnow className="h-4 w-4 text-blue-300" />; // Neve
    if (weatherId >= 700 && weatherId < 800) return <Cloud className="h-4 w-4 text-gray-400" />;   // Névoa/poeira/etc.
    if (weatherId === 800) return <Sun className="h-4 w-4 text-yellow-500" />;                       // Céu limpo
    if (weatherId > 800 && weatherId <= 804) return <Cloud className="h-4 w-4 text-gray-400" />;     // Nuvens
    return <Cloud className="h-4 w-4 text-gray-400" />;
  };

  const getWindDirection = (degrees: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 p-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Carregando...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className={`flex items-center gap-2 p-2 ${className}`}>
        <Cloud className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-muted-foreground">Clima indisponível</span>
      </div>
    );
  }

  const weatherId = (weather as any)?.weatherId ?? 800; // fallback seguro
  const precipitation = Math.round((weather.precipitation ?? 0) as number);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 h-auto p-2"
      >
        {getWeatherIcon(weatherId)}
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">
            {Math.round(weather.temperature)}°C
          </span>
          <span className="text-xs text-muted-foreground">
            {weather.description}
          </span>
        </div>
      </Button>

      {showDetails && (
        <Card className="absolute top-full right-0 mt-2 w-64 z-50 shadow-lg">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Clima Atual</span>
              <Badge variant="outline" className="text-xs">
                {weather.description}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span>Temperatura</span>
                <span className="font-medium">
                  {Math.round(weather.temperature)}°C
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span>Umidade</span>
                <span className="font-medium">
                  {Math.round(weather.humidity)}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-gray-500" />
                <span>Vento</span>
                <span className="font-medium">
                  {Math.round(weather.windSpeed)} km/h
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-500" />
                <span>Pressão</span>
                <span className="font-medium">
                  {Math.round(weather.pressure)} hPa
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Direção do vento</span>
                <span className="font-medium">
                  {getWindDirection(weather.windDirection)}
                </span>
              </div>
              {"uv" in weather && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Índice UV</span>
                  <span className="font-medium">
                    {Math.round((weather.uv as number) ?? 0)}
                  </span>
                </div>
              )}
              {precipitation > 0 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Precipitação</span>
                  <span className="font-medium">{precipitation} mm</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
