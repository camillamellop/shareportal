import { Clock, Calendar, Plane, MapPin, Users, Settings, Wrench, CheckCircle, FileText, Fuel } from "lucide-react";
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
    label: "Agendamento",
    icon: Calendar,
    color: "primary",
    onClick: () => navigate("/agendamento")
  }, {
    label: "Plano de Voo",
    icon: MapPin,
    color: "secondary",
    onClick: () => navigate("/plano-voo")
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
  const maintenanceItems = [{
    label: "Controle de Vencimentos",
    icon: Clock,
    status: "urgent"
  }, {
    label: "Programação Manutenção",
    icon: Calendar,
    status: "normal"
  }, {
    label: "Relatórios Técnicos",
    icon: FileText,
    status: "completed"
  }];
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

      {/* Manutenção */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground flex items-center">
            <Wrench className="mr-2 h-4 w-4 text-primary" />
            Manutenção
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {maintenanceItems.map((item, index) => <Button key={index} variant="outline" className="w-full justify-start border-border hover:bg-accent hover:border-primary transition-smooth">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <item.icon className="mr-3 h-4 w-4 text-primary" />
                  <span className="text-sm">{item.label}</span>
                </div>
                
              </div>
            </Button>)}
        </CardContent>
      </Card>
    </aside>;
}