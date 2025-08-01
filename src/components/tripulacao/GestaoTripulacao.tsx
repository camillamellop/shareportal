import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Users, 
  Phone, 
  Mail, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Edit,
  Calendar,
  Plane,
  Award,
  Clock,
  User,
  Upload,
  MapPin,
  CreditCard
} from 'lucide-react';

interface Habilitacao {
  tipo: string;
  numero: string;
  vencimento: string;
  status: 'valido' | 'vencido' | 'proximo_vencimento';
  categoria?: string;
}

interface Tripulante {
  id: string;
  nome: string;
  cargo: string;
  cpf: string;
  telefone: string;
  email: string;
  foto?: string;
  status: 'ativo' | 'inativo' | 'afastado';
  dataAdmissao: string;
  dataNascimento: string;
  localNascimento: string;
  codigoANAC: string;
  categoria: string;
  idade: number;
  observacoes?: string;
  habilitacoes: Habilitacao[];
  horasVoo: number;
  ultimoVoo?: string;
}

// Dados reais dos pilotos fornecidos
const mockTripulantes: Tripulante[] = [
  {
    id: '1',
    nome: 'WENDELL MUNIZ CANEDO SANTOS',
    cargo: 'Piloto Comandante',
    cpf: '031.312.941-08',
    telefone: '(62) 99999-1111',
    email: 'muniz.wsb@gmail.com',
    status: 'ativo',
    dataAdmissao: '2020-03-15',
    dataNascimento: '13/02/1988',
    localNascimento: 'Inhumas, GO',
    codigoANAC: '191100',
    categoria: 'AB',
    idade: 37,
    horasVoo: 3500,
    ultimoVoo: '2024-07-28',
    habilitacoes: [
      {
        tipo: 'CHT',
        numero: 'CHT-191100',
        vencimento: '2024-12-15',
        status: 'valido',
        categoria: 'Avião - Multimotor Terrestre'
      },
      {
        tipo: 'CMA',
        numero: 'CMA-191100',
        vencimento: '2024-09-20',
        status: 'proximo_vencimento'
      },
      {
        tipo: 'Habilitação de Tipo',
        numero: 'HT-EMB110',
        vencimento: '2025-02-10',
        status: 'valido',
        categoria: 'EMB-110'
      },
      {
        tipo: 'Inglês',
        numero: 'ING-4',
        vencimento: '2025-06-30',
        status: 'valido',
        categoria: 'Nível 4'
      }
    ]
  },
  {
    id: '2',
    nome: 'RODRIGO DE MORAIS TOSCANO',
    cargo: 'Piloto Comercial',
    cpf: '123.456.789-10',
    telefone: '(65) 98159-8516',
    email: 'rodrigo@sharebrasil.net.br',
    status: 'ativo',
    dataAdmissao: '2021-08-20',
    dataNascimento: '29/07/1980',
    localNascimento: 'Cuiabá, MT',
    codigoANAC: '113374',
    categoria: 'PC',
    idade: 45,
    horasVoo: 2800,
    ultimoVoo: '2024-07-25',
    habilitacoes: [
      {
        tipo: 'CHT',
        numero: 'CHT-113374',
        vencimento: '2025-01-20',
        status: 'valido',
        categoria: 'Avião - Monomotor Terrestre'
      },
      {
        tipo: 'CMA',
        numero: 'CMA-113374',
        vencimento: '2024-08-15',
        status: 'vencido'
      },
      {
        tipo: 'Habilitação de Tipo',
        numero: 'HT-C152',
        vencimento: '2024-11-30',
        status: 'proximo_vencimento',
        categoria: 'Cessna 152'
      },
      {
        tipo: 'Inglês',
        numero: 'ING-3',
        vencimento: '2025-03-15',
        status: 'valido',
        categoria: 'Nível 3'
      }
    ]
  },
  {
    id: '3',
    nome: 'MARINA COSTA SILVA',
    cargo: 'Copiloto',
    cpf: '456.789.123-45',
    telefone: '(11) 99888-7777',
    email: 'marina.silva@aviation.com',
    status: 'ativo',
    dataAdmissao: '2022-01-10',
    dataNascimento: '15/05/1995',
    localNascimento: 'São Paulo, SP',
    codigoANAC: '200455',
    categoria: 'CP',
    idade: 29,
    horasVoo: 1200,
    ultimoVoo: '2024-07-30',
    habilitacoes: [
      {
        tipo: 'CHT',
        numero: 'CHT-200455',
        vencimento: '2025-05-15',
        status: 'valido',
        categoria: 'Avião - Monomotor Terrestre'
      },
      {
        tipo: 'CMA',
        numero: 'CMA-200455',
        vencimento: '2025-01-10',
        status: 'valido'
      },
      {
        tipo: 'Inglês',
        numero: 'ING-4',
        vencimento: '2024-12-20',
        status: 'proximo_vencimento',
        categoria: 'Nível 4'
      }
    ]
  }
];

function TripulacaoCard({ tripulante }: { tripulante: Tripulante }) {
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

  const getCategoriaLabel = (categoria: string) => {
    const labels: { [key: string]: string } = {
      'AB': 'Piloto de Linha Aérea',
      'PC': 'Piloto Comercial',
      'CP': 'Copiloto',
      'PP': 'Piloto Privado'
    };
    return labels[categoria] || categoria;
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={tripulante.foto} />
              <AvatarFallback className="bg-blue-500 text-white text-lg">
                {getInitials(tripulante.nome)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg leading-tight">
                {tripulante.nome}
              </h3>
              <p className="text-sm text-muted-foreground">{tripulante.cargo}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                  ANAC: {tripulante.codigoANAC}
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                  {getCategoriaLabel(tripulante.categoria)}
                </Badge>
              </div>
              <Badge 
                className={
                  tripulante.status === 'ativo' 
                    ? "bg-green-100 text-green-800 border-green-300 mt-1" 
                    : "bg-gray-100 text-gray-800 border-gray-300 mt-1"
                }
              >
                {tripulante.status === 'ativo' ? 'Ativo' : 
                 tripulante.status === 'inativo' ? 'Inativo' : 'Afastado'}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informações Pessoais */}
        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
            <User className="h-4 w-4" />
            Dados Pessoais
          </h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span>{tripulante.dataNascimento} ({tripulante.idade} anos)</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span>{tripulante.localNascimento}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-3 w-3 text-muted-foreground" />
              <span>{tripulante.cpf}</span>
            </div>
          </div>
        </div>

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
        </div>

        {/* Experiência de Voo */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-sm text-blue-700 flex items-center gap-2 mb-2">
            <Plane className="h-4 w-4" />
            Experiência de Voo
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Horas Totais:</span>
              <p className="font-semibold text-blue-700">{tripulante.horasVoo}h</p>
            </div>
            <div>
              <span className="text-muted-foreground">Último Voo:</span>
              <p className="font-semibold text-blue-700">
                {tripulante.ultimoVoo ? formatDate(tripulante.ultimoVoo) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Habilitações e Certificados */}
        <div className="space-y-3 pt-3 border-t">
          <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Habilitações e Certificados
          </h4>
          {tripulante.habilitacoes.map((hab, index) => (
            <div key={index} className="space-y-2 p-3 border rounded-lg bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(hab.status)}
                  <span className="text-sm font-medium">{hab.tipo}</span>
                </div>
                {getStatusBadge(hab.status)}
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Nº:</strong> {hab.numero}</p>
                <p><strong>Vencimento:</strong> {formatDate(hab.vencimento)}</p>
                {hab.categoria && (
                  <p><strong>Categoria:</strong> {hab.categoria}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TripulanteModal({ trigger }: { trigger?: React.ReactNode }) {
  const [formData, setFormData] = useState({
    nome: "",
    cargo: "",
    cpf: "",
    telefone: "",
    email: "",
    codigoANAC: "",
    categoria: "",
    dataNascimento: "",
    localNascimento: "",
    status: "ativo",
    observacoes: "",
    foto: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dados do tripulante:", formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, foto: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Tripulante
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Novo Tripulante
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.foto} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="foto" className="cursor-pointer">
                <Button type="button" variant="outline" className="flex items-center gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Carregar Foto
                  </span>
                </Button>
              </Label>
              <Input
                id="foto"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG até 2MB</p>
            </div>
          </div>

          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados Pessoais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  placeholder="Nome completo do tripulante"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo *</Label>
                <Select value={formData.cargo} onValueChange={(value) => setFormData({ ...formData, cargo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Piloto Comandante">Piloto Comandante</SelectItem>
                    <SelectItem value="Piloto Comercial">Piloto Comercial</SelectItem>
                    <SelectItem value="Copiloto">Copiloto</SelectItem>
                    <SelectItem value="Mecânico">Mecânico</SelectItem>
                    <SelectItem value="Comissário">Comissário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigoANAC">Código ANAC *</Label>
                <Input
                  id="codigoANAC"
                  placeholder="123456"
                  value={formData.codigoANAC}
                  onChange={(e) => setFormData({ ...formData, codigoANAC: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AB">AB - Piloto de Linha Aérea</SelectItem>
                    <SelectItem value="PC">PC - Piloto Comercial</SelectItem>
                    <SelectItem value="CP">CP - Copiloto</SelectItem>
                    <SelectItem value="PP">PP - Piloto Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="localNascimento">Local de Nascimento *</Label>
                <Input
                  id="localNascimento"
                  placeholder="Cidade, UF"
                  value={formData.localNascimento}
                  onChange={(e) => setFormData({ ...formData, localNascimento: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="afastado">Afastado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais sobre o tripulante..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Tripulante
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function GestaoTripulacao() {
  const [tripulantes] = useState<Tripulante[]>(mockTripulantes);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTripulantes = tripulantes.filter(tripulante =>
    tripulante.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tripulante.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tripulante.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tripulante.codigoANAC.includes(searchTerm)
  );

  const getStatusCounts = () => {
    let totalVencidos = 0;
    let totalProximoVenc = 0;
    let chtVencidos = 0;
    let cmaVencidos = 0;

    tripulantes.forEach(tripulante => {
      tripulante.habilitacoes.forEach(hab => {
        if (hab.status === 'vencido') {
          totalVencidos++;
          if (hab.tipo === 'CHT') chtVencidos++;
          if (hab.tipo === 'CMA') cmaVencidos++;
        }
        if (hab.status === 'proximo_vencimento') {
          totalProximoVenc++;
        }
      });
    });
    
    return { totalVencidos, totalProximoVenc, chtVencidos, cmaVencidos };
  };

  const { totalVencidos, totalProximoVenc, chtVencidos, cmaVencidos } = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Tripulação</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os dados e vencimentos da sua equipe
            </p>
          </div>
          <TripulanteModal />
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{tripulantes.length}</p>
                  <p className="text-sm text-muted-foreground">Total Tripulantes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{totalVencidos}</p>
                  <p className="text-sm text-muted-foreground">Docs Vencidos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{totalProximoVenc}</p>
                  <p className="text-sm text-muted-foreground">Próx. Vencimento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">CHT</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{chtVencidos}</p>
                  <p className="text-sm text-muted-foreground">CHT Vencidos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">CMA</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{cmaVencidos}</p>
                  <p className="text-sm text-muted-foreground">CMA Vencidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tripulantes Cadastrados</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, cargo, email ou código ANAC..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTripulantes.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">
                    {searchTerm ? 'Nenhum tripulante encontrado' : 'Nenhum tripulante cadastrado'}
                  </p>
                  <p className="text-sm">
                    {searchTerm ? 'Tente ajustar os termos de busca' : 'Clique em "Novo Tripulante" para começar'}
                  </p>
                </div>
              ) : (
                filteredTripulantes.map((tripulante) => (
                  <TripulacaoCard key={tripulante.id} tripulante={tripulante} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alertas de Vencimentos */}
        {(totalVencidos > 0 || totalProximoVenc > 0) && (
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Vencimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tripulantes.map(tripulante => {
                  const vencidos = tripulante.habilitacoes.filter(h => h.status === 'vencido');
                  const proximoVenc = tripulante.habilitacoes.filter(h => h.status === 'proximo_vencimento');
                  
                  if (vencidos.length === 0 && proximoVenc.length === 0) return null;
                  
                  return (
                    <div key={tripulante.id} className="p-4 border rounded-lg bg-red-50">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-red-500 text-white">
                            {tripulante.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-red-800">{tripulante.nome}</h4>
                          <p className="text-sm text-red-600">{tripulante.cargo}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vencidos.length > 0 && (
                          <div>
                            <h5 className="font-medium text-red-700 mb-2">Documentos Vencidos:</h5>
                            <ul className="space-y-1">
                              {vencidos.map((hab, idx) => (
                                <li key={idx} className="text-sm text-red-600 flex items-center gap-2">
                                  <AlertTriangle className="h-3 w-3" />
                                  {hab.tipo} - Vencido em {new Date(hab.vencimento).toLocaleDateString('pt-BR')}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {proximoVenc.length > 0 && (
                          <div>
                            <h5 className="font-medium text-yellow-700 mb-2">Próximos ao Vencimento:</h5>
                            <ul className="space-y-1">
                              {proximoVenc.map((hab, idx) => (
                                <li key={idx} className="text-sm text-yellow-600 flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  {hab.tipo} - Vence em {new Date(hab.vencimento).toLocaleDateString('pt-BR')}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estatísticas Detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Distribuição por Cargo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(
                  tripulantes.reduce((acc, t) => {
                    acc[t.cargo] = (acc[t.cargo] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([cargo, count]) => (
                  <div key={cargo} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{cargo}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Status das Habilitações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const statusCount = tripulantes.reduce((acc, t) => {
                    t.habilitacoes.forEach(h => {
                      acc[h.status] = (acc[h.status] || 0) + 1;
                    });
                    return acc;
                  }, {} as Record<string, number>);

                  return Object.entries(statusCount).map(([status, count]) => {
                    const labels = {
                      'valido': { label: 'Válidas', color: 'bg-green-100 text-green-800' },
                      'vencido': { label: 'Vencidas', color: 'bg-red-100 text-red-800' },
                      'proximo_vencimento': { label: 'Próx. Vencimento', color: 'bg-yellow-100 text-yellow-800' }
                    };
                    
                    return (
                      <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{labels[status as keyof typeof labels]?.label || status}</span>
                        <Badge className={labels[status as keyof typeof labels]?.color || 'bg-gray-100 text-gray-800'}>
                          {count}
                        </Badge>
                      </div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 