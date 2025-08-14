import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Mail, FileText, AlertTriangle, CheckCircle, Edit, Clock } from "lucide-react";

interface Tripulante {
  id: string;
  nome: string;
  cargo: string;
  cpf: string;
  telefone: string;
  email: string;
  cht: {
    numero: string;
    vencimento: string;
    status: "valido" | "vencido" | "proximo_vencimento";
  };
  cma: {
    numero: string;
    vencimento: string;
    status: "valido" | "vencido" | "proximo_vencimento";
  };
  foto?: string;
  status: "ativo" | "inativo" | "afastado";
}

interface TripulacaoCardProps {
  tripulante: Tripulante;
  onViewHoras?: (tripulanteNome: string) => void;
  onEdit?: (tripulante: Tripulante) => void;
}

export function TripulacaoCard({ tripulante, onViewHoras, onEdit }: TripulacaoCardProps) {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("pt-BR");
  };

  const isAlert = (status: Tripulante["cht"]["status"]) => status !== "valido";

  const getStatusIcon = (status: Tripulante["cht"]["status"]) => {
    switch (status) {
      case "vencido":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "proximo_vencimento":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getAlertBadge = (status: Tripulante["cht"]["status"]) => {
    switch (status) {
      case "vencido":
        return <Badge className="bg-red-100 text-red-800 border-red-300">Vencido</Badge>;
      case "proximo_vencimento":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Próximo</Badge>;
      default:
        return null; // não mostra badge para 'valido'
    }
  };

  const handleViewHoras = () => onViewHoras?.(tripulante.nome);
  const handleEdit = () => onEdit?.(tripulante);

  const showCHT = isAlert(tripulante.cht.status);
  const showCMA = isAlert(tripulante.cma.status);
  const showAnyAlert = showCHT || showCMA;

  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow min-h-[260px]">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Avatar className="h-16 w-16 flex-shrink-0">
              <AvatarImage src={tripulante.foto} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {getInitials(tripulante.nome)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-lg truncate">{tripulante.nome}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{tripulante.cargo}</p>
            </div>
          </div>

          <div className="flex gap-1 flex-shrink-0">
            {!!onViewHoras && (
              <Button variant="ghost" size="sm" onClick={handleViewHoras} title="Horas de Voo" className="h-8 w-8 p-0">
                <Clock className="h-4 w-4" />
              </Button>
            )}
            {!!onEdit && (
              <Button variant="ghost" size="sm" onClick={handleEdit} title="Editar Tripulante" className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Contato */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{tripulante.telefone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{tripulante.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{tripulante.cpf}</span>
          </div>
        </div>

        {/* Alertas de Vencimento (somente quando houver) */}
        {showAnyAlert && (
          <div className="space-y-4 pt-4 border-t">
            {showCHT && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(tripulante.cht.status)}
                    <span className="text-sm font-medium">CHT</span>
                  </div>
                  {getAlertBadge(tripulante.cht.status)}
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {tripulante.cht.numero && <p className="truncate">Nº {tripulante.cht.numero}</p>}
                  <p>Vence em: {formatDate(tripulante.cht.vencimento)}</p>
                </div>
              </div>
            )}

            {showCMA && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(tripulante.cma.status)}
                    <span className="text-sm font-medium">CMA</span>
                  </div>
                  {getAlertBadge(tripulante.cma.status)}
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {tripulante.cma.numero && <p className="truncate">Nº {tripulante.cma.numero}</p>}
                  <p>Vence em: {formatDate(tripulante.cma.vencimento)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}