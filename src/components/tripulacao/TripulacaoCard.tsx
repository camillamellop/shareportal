import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
<<<<<<< HEAD
import { Phone, Mail, FileText, AlertTriangle, CheckCircle, Edit, Clock } from "lucide-react";
=======
import { Phone, Mail, FileText, AlertTriangle, CheckCircle, Edit } from "lucide-react";
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524

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
<<<<<<< HEAD
  onViewHoras?: (tripulanteNome: string) => void;
  onEdit?: (tripulante: Tripulante) => void;
}

export function TripulacaoCard({ tripulante, onViewHoras, onEdit }: TripulacaoCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
=======
}

export function TripulacaoCard({ tripulante }: TripulacaoCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valido':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Válido</Badge>;
      case 'vencido':
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Vencido</Badge>;
      case 'proximo_vencimento':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Próx. Venc.</Badge>;
      default:
        return <Badge variant="secondary">Indefinido</Badge>;
    }
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valido':
<<<<<<< HEAD
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'vencido':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'proximo_vencimento':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valido':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Válido</Badge>;
      case 'vencido':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Vencido</Badge>;
      case 'proximo_vencimento':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Próximo</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Desconhecido</Badge>;
=======
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'vencido':
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      case 'proximo_vencimento':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4 text-slate-400" />;
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
    }
  };

  const formatDate = (dateString: string) => {
<<<<<<< HEAD
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleViewHoras = () => {
    if (onViewHoras) {
      onViewHoras(tripulante.nome);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(tripulante);
    }
  };

  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow min-h-[280px]">
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
              <p className="text-sm text-muted-foreground mt-1">{tripulante.cargo}</p>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewHoras}
              title="Horas de Voo"
              className="h-8 w-8 p-0"
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              title="Editar Tripulante"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Informações de Contato */}
        <div className="space-y-3">
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

        {/* Documentos */}
        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-3">
=======
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
                         <Avatar className="h-14 w-14">
              <AvatarImage src={tripulante.foto} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(tripulante.nome)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{tripulante.nome}</h3>
              <p className="text-sm text-muted-foreground">{tripulante.cargo}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
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
         <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(tripulante.cht.status)}
                <span className="text-sm font-medium">CHT</span>
              </div>
              {getStatusBadge(tripulante.cht.status)}
            </div>
<<<<<<< HEAD
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="truncate">Nº {tripulante.cht.numero}</p>
=======
            <div className="text-xs text-muted-foreground">
              <p>Nº {tripulante.cht.numero}</p>
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
              <p>Vence em: {formatDate(tripulante.cht.vencimento)}</p>
            </div>
          </div>

<<<<<<< HEAD
          <div className="space-y-3">
=======
          <div className="space-y-2">
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(tripulante.cma.status)}
                <span className="text-sm font-medium">CMA</span>
              </div>
              {getStatusBadge(tripulante.cma.status)}
            </div>
<<<<<<< HEAD
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="truncate">Nº {tripulante.cma.numero}</p>
=======
            <div className="text-xs text-muted-foreground">
              <p>Nº {tripulante.cma.numero}</p>
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
              <p>Vence em: {formatDate(tripulante.cma.vencimento)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}