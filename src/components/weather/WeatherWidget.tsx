import { useState } from "react";
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
  Loader2
} from "lucide-react";

interface WeatherWidgetProps {
  lat?: number;
  lon?: number;
  className?: string;
}

export const WeatherWidget = ({ className = "" }: WeatherWidgetProps) => {
  const [showDetails, setShowDetails] = useState(false);

  // Dados mockados temporariamente para evitar erros de API
  const mockWeather = {
    temperature: 24,
    humidity: 65,
    windSpeed: 12,
    windDirection: 180,
    pressure: 1013,
    uv: 5,
    precipitation: 0,
    pictocode: 1,
    description: "Céu limpo"
  };

  const getWeatherIcon = (pictocode: number) => {
    if (pictocode <= 4) return <Sun className="h-4 w-4 text-yellow-500" />;
    if (pictocode <= 20) return <Cloud className="h-4 w-4 text-gray-400" />;
    if (pictocode <= 30) return <CloudRain className="h-4 w-4 text-blue-400" />;
    if (pictocode <= 40) return <CloudSnow className="h-4 w-4 text-blue-300" />;
    return <Cloud className="h-4 w-4 text-gray-400" />;
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 h-auto p-2"
      >
        {getWeatherIcon(mockWeather.pictocode)}
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">
            {Math.round(mockWeather.temperature)}°C
          </span>
          <span className="text-xs text-muted-foreground">
            {mockWeather.description}
          </span>
        </div>
      </Button>

      {showDetails && (
        <Card className="absolute top-full right-0 mt-2 w-64 z-50 shadow-lg">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Clima Atual</span>
              <Badge variant="outline" className="text-xs">
                {mockWeather.description}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span>Temperatura</span>
                <span className="font-medium">
                  {Math.round(mockWeather.temperature)}°C
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span>Umidade</span>
                <span className="font-medium">
                  {Math.round(mockWeather.humidity)}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-gray-500" />
                <span>Vento</span>
                <span className="font-medium">
                  {Math.round(mockWeather.windSpeed)} km/h
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-500" />
                <span>Pressão</span>
                <span className="font-medium">
                  {Math.round(mockWeather.pressure)} hPa
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Direção do vento</span>
                <span className="font-medium">
                  {getWindDirection(mockWeather.windDirection)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Índice UV</span>
                <span className="font-medium">
                  {Math.round(mockWeather.uv)}
                </span>
              </div>
              {mockWeather.precipitation > 0 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Precipitação</span>
                  <span className="font-medium">
                    {Math.round(mockWeather.precipitation)} mm
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 