import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Calendar, Clock } from "lucide-react";

interface DiarioBordoCardProps {
  matricula: string;
  modelo: string;
  anoDiario: number;
  horasTotais: number;
  status: "ativa" | "inativa" | "manutencao";
  onClick?: () => void;
}

export function DiarioBordoCard({
  matricula,
  modelo,
  anoDiario,
  horasTotais,
  status,
  onClick
}: DiarioBordoCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativa":
        return "bg-green-600 hover:bg-green-700";
      case "inativa":
        return "bg-gray-600 hover:bg-gray-700";
      case "manutencao":
        return "bg-yellow-600 hover:bg-yellow-700";
      default:
        return "bg-green-600 hover:bg-green-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ativa":
        return "ATIVA";
      case "inativa":
        return "INATIVA";
      case "manutencao":
        return "MANUTENÇÃO";
      default:
        return "ATIVA";
    }
  };

  return (
    <Card 
      className="bg-card border-border shadow-card hover:shadow-lg transition-all duration-300 cursor-pointer group h-full"
      onClick={onClick}
    >
      <CardContent className="p-4 h-full flex flex-col">
        {/* Header com ícone e matrícula */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">{matricula}</h3>
              <p className="text-sm text-muted-foreground">{modelo}</p>
            </div>
          </div>
        </div>

        {/* Informações do diário */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Diário {anoDiario}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{horasTotais.toFixed(1)} horas totais</span>
          </div>
        </div>

        {/* Status - posicionado no final */}
        <div className="flex justify-end mt-auto">
          <Badge 
            className={`${getStatusColor(status)} text-white font-semibold px-3 py-1 rounded-md text-xs`}
          >
            {getStatusText(status)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
} 