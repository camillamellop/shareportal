import { Clock, Calendar, Plane, MapPin, Users, Settings, Wrench, CheckCircle, FileText, Fuel, AlertTriangle, Tool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function RightSidebar() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }));
  
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
      setCurrentDate(now.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const flightOperations = [{
    label: "Solicitar Voo",
    icon: Calendar,
    color: "primary",
    onClick: () => navigate("/agendamento")
  }, {
    label: "Coordenação Voos",
    icon: Settings,
    color: "secondary",
    onClick: () => navigate("/coordenacao")
  }, {
    label: "Diário de Bordo",
    icon: Plane,
    color: "accent",
    onClick: () => navigate("/diario")
  }, {
    label: "Controle de Abastecimento",
    icon: Fuel,
    color: "primary",
    onClick: () => navigate("/abastecimento")
  }, {
    label: "Gestão de Tripulação",
    icon: Users,
    color: "secondary",
    onClick: () => navigate("/tripulacao")
  }, {
    label: "Documentos",
    icon: FileText,
    color: "accent",
    onClick: () => navigate("/documentos")
  }];
  const aircraftMaintenance = [
    {
      registration: "PR-MDL",
      model: "Citation CJ3+",
      status: "active",
      lastMaintenance: "2024-12-15",
      nextMaintenance: "2025-03-15",
      hours: 1250,
      priority: "normal"
    },
    {
      registration: "PT-OPC",
      model: "King Air 350",
      status: "active",
      lastMaintenance: "2024-11-20",
      nextMaintenance: "2025-02-20",
      hours: 2100,
      priority: "normal"
    },
    {
      registration: "PS-AVE",
      model: "Phenom 300E",
      status: "active",
      lastMaintenance: "2024-12-01",
      nextMaintenance: "2025-03-01",
      hours: 890,
      priority: "normal"
    },
    {
      registration: "PT-JPK",
      model: "Legacy 650",
      status: "active",
      lastMaintenance: "2024-10-15",
      nextMaintenance: "2025-01-15",
      hours: 1850,
      priority: "urgent"
    },
    {
      registration: "PT-OJG",
      model: "Citation Latitude",
      status: "maintenance",
      lastMaintenance: "2024-12-10",
      nextMaintenance: "2025-01-10",
      hours: 1450,
      priority: "urgent"
    },
    {
      registration: "PT-RVJ",
      model: "Falcon 2000",
      status: "active",
      lastMaintenance: "2024-11-05",
      nextMaintenance: "2025-02-05",
      hours: 3200,
      priority: "normal"
    },
    {
      registration: "PT-WSR",
      model: "Citation XLS+",
      status: "active",
      lastMaintenance: "2024-12-20",
      nextMaintenance: "2025-03-20",
      hours: 1100,
      priority: "normal"
    },
    {
      registration: "PT-TOR",
      model: "King Air 250",
      status: "active",
      lastMaintenance: "2024-11-30",
      nextMaintenance: "2025-02-28",
      hours: 950,
      priority: "normal"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'normal':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return AlertTriangle;
      case 'normal':
        return CheckCircle;
      default:
        return Tool;
    }
  };
  return <aside className="w-80 bg-background border-l border-border p-4 space-y-6">
      {/* Horário do Sistema */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Clock className="mr-2 h-4 w-4 text-primary" />
            Horário do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{currentTime}</div>
            <div className="text-sm text-muted-foreground capitalize">{currentDate}</div>
          </div>
        </CardContent>
      </Card>

      {/* Operações de Voo */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground flex items-center">
            <Plane className="mr-2 h-4 w-4 text-primary" />
            Operações de Voo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {flightOperations.map((operation, index) => <Button key={index} variant="outline" className="w-full justify-start border-border hover:bg-accent hover:border-primary transition-smooth" onClick={operation.onClick}>
              <operation.icon className="mr-3 h-4 w-4 text-primary" />
              <span className="text-sm">{operation.label}</span>
            </Button>)}
        </CardContent>
      </Card>

      {/* Painel de Manutenções */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground flex items-center">
            <Wrench className="mr-2 h-4 w-4 text-primary" />
            Painel de Manutenções
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="text-xs text-muted-foreground mb-2">
            {aircraftMaintenance.filter(a => a.priority === 'urgent').length} aeronaves com manutenção urgente
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {aircraftMaintenance.map((aircraft, index) => {
              const PriorityIcon = getPriorityIcon(aircraft.priority);
              return (
                <div key={index} className="p-3 border border-border rounded-lg hover:bg-accent/20 transition-smooth">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Plane className="mr-2 h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{aircraft.registration}</span>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(aircraft.status)}`}>
                      {aircraft.status === 'active' ? 'Ativa' : 'Manutenção'}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-2">
                    {aircraft.model}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Horas:</span>
                      <span className="ml-1 font-medium">{aircraft.hours}h</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Próxima:</span>
                      <span className="ml-1 font-medium">{new Date(aircraft.nextMaintenance).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                      <PriorityIcon className={`h-3 w-3 mr-1 ${getPriorityColor(aircraft.priority)}`} />
                      <span className={`text-xs ${getPriorityColor(aircraft.priority)}`}>
                        {aircraft.priority === 'urgent' ? 'Urgente' : 'Normal'}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => navigate(`/manutencao/${aircraft.registration}`)}
                    >
                      Detalhes
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </aside>;
}