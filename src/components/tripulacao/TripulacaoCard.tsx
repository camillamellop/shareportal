import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Mail, FileText, AlertTriangle, CheckCircle, Edit } from "lucide-react";

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
    status: 'valido' | 'vencido' | 'proximo_vencimento';
  };
  cma: {
    numero: string;
    vencimento: string;
    status: 'valido' | 'vencido' | 'proximo_vencimento';
  };
  foto?: string;
  status: 'ativo' | 'inativo' | 'afastado';
}

interface TripulacaoCardProps {
  tripulante: Tripulante;
}

export function TripulacaoCard({ tripulante }: TripulacaoCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valido':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Válido</Badge>;
      case 'vencido':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Vencido</Badge>;
      case 'proximo_vencimento':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Próx. Venc.</Badge>;
      default:
        return <Badge variant="secondary">Indefinido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valido':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'vencido':
      case 'proximo_vencimento':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={tripulante.foto} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(tripulante.nome)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{tripulante.nome}</h3>
              <p className="text-sm text-muted-foreground">{tripulante.cargo}</p>
              <Badge 
                className={
                  tripulante.status === 'ativo' 
                    ? "bg-green-100 text-green-800 border-green-300 mt-1" 
                    : "bg-gray-100 text-gray-800 border-gray-300 mt-1"
                }
              >
                {tripulante.status === 'ativo' ? 'Ativo' : tripulante.status === 'inativo' ? 'Inativo' : 'Afastado'}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informações de Contato */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{tripulante.telefone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{tripulante.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{tripulante.cpf}</span>
          </div>
        </div>

        {/* Documentos */}
        <div className="space-y-3 pt-3 border-t">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(tripulante.cht.status)}
                <span className="text-sm font-medium">CHT</span>
              </div>
              {getStatusBadge(tripulante.cht.status)}
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Nº {tripulante.cht.numero}</p>
              <p>Vence em: {formatDate(tripulante.cht.vencimento)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(tripulante.cma.status)}
                <span className="text-sm font-medium">CMA</span>
              </div>
              {getStatusBadge(tripulante.cma.status)}
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Nº {tripulante.cma.numero}</p>
              <p>Vence em: {formatDate(tripulante.cma.vencimento)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}