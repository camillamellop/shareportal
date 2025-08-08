import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Cake, Users, Plus, Trash2, Edit, Settings, Gift, Building, User } from "lucide-react";
import { useState, useEffect } from "react";
import { seedBirthdays } from "@/utils/seedBirthdays";
import { birthdayService } from "@/services/firestore";
import { toast } from "sonner";

interface Contact {
  id: string;
  nome: string;
  data_aniversario: string;
  empresa?: string;
  categoria: "Colaborador" | "Cliente";
}

export default function Aniversarios() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showAllContacts, setShowAllContacts] = useState(false);
  const [showColaboradores, setShowColaboradores] = useState(false);
  const [showProximos7Dias, setShowProximos7Dias] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("Todos");
  const [executandoSeed, setExecutandoSeed] = useState(false);
  const [aniversariosFirebase, setAniversariosFirebase] = useState<any[]>([]);

  // Função para executar seed de aniversários
  const executarSeedAniversarios = async () => {
    setExecutandoSeed(true);
    try {
      console.log("Executando seed de aniversários...");
      await seedBirthdays();
      toast.success("Aniversários carregados no Firebase com sucesso!");
      
      // Recarregar aniversários do Firebase
      await carregarAniversariosFirebase();
    } catch (error) {
      console.error("Erro ao executar seed:", error);
      toast.error("Erro ao carregar aniversários no Firebase");
    } finally {
      setExecutandoSeed(false);
    }
  };

  // Função para carregar aniversários do Firebase
  const carregarAniversariosFirebase = async () => {
    try {
      const aniversarios = await birthdayService.getAll();
      setAniversariosFirebase(aniversarios);
      console.log("Aniversários carregados do Firebase:", aniversarios);
    } catch (error) {
      console.error("Erro ao carregar aniversários do Firebase:", error);
    }
  };

  // Carregar aniversários do Firebase ao montar o componente
  useEffect(() => {
    carregarAniversariosFirebase();
  }, []);

  const [newContact, setNewContact] = useState({
    nome: "",
    data_aniversario: "",
    empresa: "",
    categoria: "Cliente"
  });

  const [todosAniversarios, setTodosAniversarios] = useState<Contact[]>([
    // Colaboradores
    {
      id: "colab-1",
      nome: "ROLFFE ERBE",
      data_aniversario: "04/01/1986",
      empresa: "",
      categoria: "Colaborador"
    },
    {
      id: "colab-2",
      nome: "CAMILA MELO",
      data_aniversario: "09/01/1993",
      empresa: "",
      categoria: "Colaborador"
    },
    {
      id: "colab-3",
      nome: "WENDELL",
      data_aniversario: "14/02/1988",
      empresa: "",
      categoria: "Colaborador"
    },
    {
      id: "colab-4",
      nome: "AUGUSTO",
      data_aniversario: "20/03/1991",
      empresa: "",
      categoria: "Colaborador"
    },
    {
      id: "colab-5",
      nome: "KAROLINE JARDIM",
      data_aniversario: "21/04/2003",
      empresa: "",
      categoria: "Colaborador"
    },
    {
      id: "colab-6",
      nome: "GUSTAVO NASCIMENTO",
      data_aniversario: "12/06/2005",
      empresa: "",
      categoria: "Colaborador"
    },
    {
      id: "colab-7",
      nome: "RODRIGO TOSCANO",
      data_aniversario: "30/07/1981",
      empresa: "",
      categoria: "Colaborador"
    },
    {
      id: "colab-8",
      nome: "ELISANGELA",
      data_aniversario: "02/08/XXXX",
      empresa: "",
      categoria: "Colaborador"
    },
    {
      id: "colab-9",
      nome: "ANDRÉ LOPES",
      data_aniversario: "22/08/1974",
      empresa: "",
      categoria: "Colaborador"
    },
    {
      id: "colab-10",
      nome: "ALINE",
      data_aniversario: "11/10/2000",
      empresa: "",
      categoria: "Colaborador"
    },
    {
      id: "colab-11",
      nome: "DANIELE FOGGIATO",
      data_aniversario: "01/12/1998",
      empresa: "",
      categoria: "Colaborador"
    },
    // Clientes
    {
      id: "1",
      nome: "FÁBIO FRANCISCO",
      data_aniversario: "02/01/1987",
      empresa: "WATT",
      categoria: "Cliente"
    },
    {
      id: "2",
      nome: "APARÍCIO GUILHERME",
      data_aniversario: "06/01/1984",
      empresa: "GRF",
      categoria: "Cliente"
    },
    {
      id: "3",
      nome: "OTAVIO FEDRIZZE",
      data_aniversario: "14/01/1987",
      empresa: "CARVALIMA",
      categoria: "Cliente"
    },
    {
      id: "4",
      nome: "SEBASTIÃO FERREIRA",
      data_aniversario: "20/01/1951",
      empresa: "GRF",
      categoria: "Cliente"
    },
    {
      id: "5",
      nome: "GABRIEL FEDRIZZE",
      data_aniversario: "28/01/1990",
      empresa: "CARVALIMA",
      categoria: "Cliente"
    },
    {
      id: "6",
      nome: "RODRIGO",
      data_aniversario: "04/02/1987",
      empresa: "AGRO CEOLIN",
      categoria: "Cliente"
    },
    {
      id: "7",
      nome: "LISENE BERGAMIM",
      data_aniversario: "26/02/1993",
      empresa: "BRILHANTE",
      categoria: "Cliente"
    },
    {
      id: "8",
      nome: "GEOVANA - E. TBH",
      data_aniversario: "01/03/2000",
      empresa: "PT-OPC",
      categoria: "Cliente"
    },
    {
      id: "9",
      nome: "DALGIRO",
      data_aniversario: "04/03/1960",
      empresa: "PT-JPK",
      categoria: "Cliente"
    },
    {
      id: "10",
      nome: "ALDO LOCATELLI",
      data_aniversario: "17/03/1951",
      empresa: "GA SERVICE",
      categoria: "Cliente"
    },
    {
      id: "11",
      nome: "DIOGO REIS",
      data_aniversario: "22/03/XXXX",
      empresa: "GRF",
      categoria: "Cliente"
    },
    {
      id: "12",
      nome: "DIALMO FREDRIZZE",
      data_aniversario: "25/03/1958",
      empresa: "CARVALIMA",
      categoria: "Cliente"
    },
    {
      id: "13",
      nome: "JANE - E.TBH",
      data_aniversario: "15/04/1968",
      empresa: "PT-OPC",
      categoria: "Cliente"
    },
    {
      id: "14",
      nome: "MAURICIO NETO E.TBH",
      data_aniversario: "07/05/2019",
      empresa: "ESTÂNCIA B.",
      categoria: "Cliente"
    },
    {
      id: "15",
      nome: "MARINA FEDRIZZE",
      data_aniversario: "14/05/1960",
      empresa: "CARVALIMA",
      categoria: "Cliente"
    },
    {
      id: "16",
      nome: "HANNIHE BERGAMIM",
      data_aniversario: "23/05/1996",
      empresa: "BRILHANTE",
      categoria: "Cliente"
    },
    {
      id: "17",
      nome: "LUAN (Esposo Gabriela)",
      data_aniversario: "06/06/1995",
      empresa: "PT - OPC",
      categoria: "Cliente"
    },
    {
      id: "18",
      nome: "JOANA E. TBH",
      data_aniversario: "08/06/2020",
      empresa: "PT - OPC",
      categoria: "Cliente"
    },
    {
      id: "19",
      nome: "DANIEL LOCATELLI",
      data_aniversario: "10/06/1978",
      empresa: "WATT",
      categoria: "Cliente"
    },
    {
      id: "20",
      nome: "LISANE BERGAMIN",
      data_aniversario: "29/06/1967",
      empresa: "BRILHANTE",
      categoria: "Cliente"
    },
    {
      id: "21",
      nome: "BEATRIZ E. TBH",
      data_aniversario: "30/06/2013",
      empresa: "PT - OPC",
      categoria: "Cliente"
    },
    {
      id: "22",
      nome: "MAURÍCIO TONHA",
      data_aniversario: "17/08/1962",
      empresa: "ESTÂNCIA B.",
      categoria: "Cliente"
    },
    {
      id: "23",
      nome: "EUGENIO BERGAMIM",
      data_aniversario: "21/09/1991",
      empresa: "BRILHANTE",
      categoria: "Cliente"
    },
    {
      id: "24",
      nome: "BRUNO",
      data_aniversario: "21/09/1982",
      empresa: "SANTA ROSA",
      categoria: "Cliente"
    },
    {
      id: "25",
      nome: "SANDRO ANTUNES",
      data_aniversario: "25/10/1982",
      empresa: "SANTUN",
      categoria: "Cliente"
    },
    {
      id: "26",
      nome: "GUILHERME",
      data_aniversario: "22/11/1986",
      empresa: "ESTÂNCIA B.",
      categoria: "Cliente"
    },
    {
      id: "27",
      nome: "RAFAEL",
      data_aniversario: "01/12/1989",
      empresa: "PT-JPK",
      categoria: "Cliente"
    },
    {
      id: "28",
      nome: "GABRIELA",
      data_aniversario: "14/12/1989",
      empresa: "ESTÂNCIA B.",
      categoria: "Cliente"
    }
  ]);

  // Função para extrair apenas o dia e mês da data
  const getDiaMes = (dataAniversario: string) => {
    const [dia, mes] = dataAniversario.split('/');
    return `${dia}/${mes}`;
  };

  // Função para obter o mês da data
  const getMes = (dataAniversario: string) => {
    const [, mes] = dataAniversario.split('/');
    return parseInt(mes);
  };

  // Filtrar aniversários do mês atual
  const aniversariantes = todosAniversarios.filter(aniversario => 
    getMes(aniversario.data_aniversario) === currentMonth
  );

  // Calcular estatísticas
  const totalAniversarios = todosAniversarios.length;
  const colaboradores = todosAniversarios.filter(contact => contact.categoria === "Colaborador").length;
  const clientes = todosAniversarios.filter(contact => contact.categoria === "Cliente").length;
  const aniversariosEsteMes = aniversariantes.length;
  const proximos7Dias = aniversariantes.filter(aniversario => {
    const [dia, mes] = aniversario.data_aniversario.split('/');
    const dataAniversario = new Date(new Date().getFullYear(), parseInt(mes) - 1, parseInt(dia));
    const hoje = new Date();
    const diffTime = dataAniversario.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  // Funções para gerenciar contatos
  const handleAddContact = () => {
    if (newContact.nome && newContact.data_aniversario && newContact.empresa) {
      const newId = (todosAniversarios.length + 1).toString();
      const contactToAdd = {
        ...newContact,
        id: newId
      };
      setTodosAniversarios([...todosAniversarios, contactToAdd]);
      setNewContact({
        nome: "",
        data_aniversario: "",
        empresa: "",
        categoria: "Cliente"
      });
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
  };

  const handleUpdateContact = () => {
    if (editingContact) {
      setTodosAniversarios(todosAniversarios.map(contact => 
        contact.id === editingContact.id ? editingContact : contact
      ));
      setEditingContact(null);
    }
  };

  const handleDeleteContact = (id: string) => {
    setTodosAniversarios(todosAniversarios.filter(contact => contact.id !== id));
  };

  const handleCancelEdit = () => {
    setEditingContact(null);
  };

  // Se estiver mostrando todos os contatos
  if (showAllContacts) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Todos os Contatos</h1>
              <p className="text-muted-foreground mt-2">
                Visualize todos os contatos registrados ({totalAniversarios} contatos)
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Colaborador">Colaboradores</SelectItem>
                  <SelectItem value="Cliente">Clientes</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => setShowAllContacts(false)}
              >
                Voltar aos Aniversários
              </Button>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Gerenciar Contatos
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Gerenciar Contatos ({totalAniversarios})
                    </DialogTitle>
                  </DialogHeader>
                  
                  {/* Formulário para adicionar novo contato */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Adicionar Novo Contato</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nome">Nome</Label>
                        <Input
                          id="nome"
                          value={newContact.nome}
                          onChange={(e) => setNewContact({...newContact, nome: e.target.value})}
                          placeholder="Nome completo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="data_aniversario">Data de Aniversário</Label>
                        <Input
                          id="data_aniversario"
                          value={newContact.data_aniversario}
                          onChange={(e) => setNewContact({...newContact, data_aniversario: e.target.value})}
                          placeholder="DD/MM/AAAA"
                        />
                      </div>
                      <div>
                        <Label htmlFor="empresa">Empresa</Label>
                        <Input
                          id="empresa"
                          value={newContact.empresa}
                          onChange={(e) => setNewContact({...newContact, empresa: e.target.value})}
                          placeholder="Nome da empresa"
                        />
                      </div>
                      <div>
                        <Label htmlFor="categoria">Categoria</Label>
                        <Select
                          value={newContact.categoria}
                          onValueChange={(value) => setNewContact({...newContact, categoria: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cliente">Cliente</SelectItem>
                            <SelectItem value="Colaborador">Colaborador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleAddContact} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Contato
                    </Button>
                  </div>

                  {/* Lista de contatos */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Todos os Contatos</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {todosAniversarios.map((contact) => (
                        <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{contact.nome}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {contact.categoria}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{contact.empresa}</p>
                            <p className="text-sm text-muted-foreground">{getDiaMes(contact.data_aniversario)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditContact(contact)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteContact(contact.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Modal de edição */}
                  {editingContact && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                      <div className="bg-background p-6 rounded-lg w-full max-w-md">
                        <h3 className="font-semibold text-lg mb-4">Editar Contato</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-nome">Nome</Label>
                            <Input
                              id="edit-nome"
                              value={editingContact.nome}
                              onChange={(e) => setEditingContact({...editingContact, nome: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-data">Data de Aniversário</Label>
                            <Input
                              id="edit-data"
                              value={editingContact.data_aniversario}
                              onChange={(e) => setEditingContact({...editingContact, data_aniversario: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-empresa">Empresa</Label>
                            <Input
                              id="edit-empresa"
                              value={editingContact.empresa}
                              onChange={(e) => setEditingContact({...editingContact, empresa: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-categoria">Categoria</Label>
                            <Select
                              value={editingContact.categoria}
                              onValueChange={(value) => setEditingContact({...editingContact, categoria: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cliente">Cliente</SelectItem>
                                <SelectItem value="Colaborador">Colaborador</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleUpdateContact} className="flex-1">
                              Salvar
                            </Button>
                            <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Lista completa de contatos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todosAniversarios
              .filter(contact => filterCategory === "Todos" || contact.categoria === filterCategory)
              .map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{contact.nome}</h3>
                        <Badge variant={contact.categoria === "Colaborador" ? "default" : "secondary"} className="text-xs">
                          {contact.categoria}
                        </Badge>
                      </div>
                      {contact.empresa && (
                        <p className="text-sm text-muted-foreground mb-1">{contact.empresa}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        <Cake className="h-3 w-3 inline mr-1" />
                        {getDiaMes(contact.data_aniversario)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // Se estiver mostrando colaboradores
  if (showColaboradores) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Colaboradores</h1>
              <p className="text-muted-foreground mt-2">
                Visualize todos os colaboradores ({colaboradores} colaboradores)
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowColaboradores(false)}
              >
                Voltar aos Aniversários
              </Button>
            </div>
          </div>

          {/* Lista de colaboradores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todosAniversarios
              .filter(contact => contact.categoria === "Colaborador")
              .map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{contact.nome}</h3>
                        <Badge variant="default" className="text-xs">
                          Colaborador
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <Cake className="h-3 w-3 inline mr-1" />
                        {getDiaMes(contact.data_aniversario)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // Se estiver mostrando próximos 7 dias
  if (showProximos7Dias) {
    const proximos7DiasList = todosAniversarios.filter(aniversario => {
      const [dia, mes] = aniversario.data_aniversario.split('/');
      const dataAniversario = new Date(new Date().getFullYear(), parseInt(mes) - 1, parseInt(dia));
      const hoje = new Date();
      const diffTime = dataAniversario.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });

    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Próximos 7 Dias</h1>
              <p className="text-muted-foreground mt-2">
                Aniversários nos próximos 7 dias ({proximos7DiasList.length} aniversários)
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowProximos7Dias(false)}
              >
                Voltar aos Aniversários
              </Button>
            </div>
          </div>

          {/* Lista de próximos 7 dias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proximos7DiasList.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Cake className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum aniversário nos próximos 7 dias</p>
              </div>
            ) : (
              proximos7DiasList.map((contact) => (
                <Card key={contact.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{contact.nome}</h3>
                          <Badge variant={contact.categoria === "Colaborador" ? "default" : "secondary"} className="text-xs">
                            {contact.categoria}
                          </Badge>
                        </div>
                        {contact.empresa && (
                          <p className="text-sm text-muted-foreground mb-1">{contact.empresa}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          <Cake className="h-3 w-3 inline mr-1" />
                          {getDiaMes(contact.data_aniversario)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Aniversários</h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe os aniversários dos seus contatos
            </p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Gerenciar Contatos
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Gerenciar Contatos ({totalAniversarios})
                </DialogTitle>
              </DialogHeader>
              
              {/* Formulário para adicionar novo contato */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold text-lg">Adicionar Novo Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      value={newContact.nome}
                      onChange={(e) => setNewContact({...newContact, nome: e.target.value})}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_aniversario">Data de Aniversário</Label>
                    <Input
                      id="data_aniversario"
                      value={newContact.data_aniversario}
                      onChange={(e) => setNewContact({...newContact, data_aniversario: e.target.value})}
                      placeholder="DD/MM/AAAA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input
                      id="empresa"
                      value={newContact.empresa}
                      onChange={(e) => setNewContact({...newContact, empresa: e.target.value})}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select
                      value={newContact.categoria}
                      onValueChange={(value) => setNewContact({...newContact, categoria: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cliente">Cliente</SelectItem>
                        <SelectItem value="Colaborador">Colaborador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAddContact} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Contato
                </Button>
              </div>

              {/* Lista de contatos */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Todos os Contatos</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {todosAniversarios.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{contact.nome}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {contact.categoria}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{contact.empresa}</p>
                        <p className="text-sm text-muted-foreground">{getDiaMes(contact.data_aniversario)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditContact(contact)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal de edição */}
              {editingContact && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-background p-6 rounded-lg w-full max-w-md">
                    <h3 className="font-semibold text-lg mb-4">Editar Contato</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-nome">Nome</Label>
                        <Input
                          id="edit-nome"
                          value={editingContact.nome}
                          onChange={(e) => setEditingContact({...editingContact, nome: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-data">Data de Aniversário</Label>
                        <Input
                          id="edit-data"
                          value={editingContact.data_aniversario}
                          onChange={(e) => setEditingContact({...editingContact, data_aniversario: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-empresa">Empresa</Label>
                        <Input
                          id="edit-empresa"
                          value={editingContact.empresa}
                          onChange={(e) => setEditingContact({...editingContact, empresa: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-categoria">Categoria</Label>
                        <Select
                          value={editingContact.categoria}
                          onValueChange={(value) => setEditingContact({...editingContact, categoria: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cliente">Cliente</SelectItem>
                            <SelectItem value="Colaborador">Colaborador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateContact} className="flex-1">
                          Salvar
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Este Mês</p>
                  <p className="text-2xl font-bold text-primary">{aniversariosEsteMes}</p>
                </div>
                <Cake className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setShowProximos7Dias(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Próximos 7 dias</p>
                  <p className="text-2xl font-bold text-orange-600">{proximos7Dias}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setShowColaboradores(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Colaboradores</p>
                  <p className="text-2xl font-bold text-blue-600">{colaboradores}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setShowAllContacts(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clientes</p>
                  <p className="text-2xl font-bold text-green-600">{clientes}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cake className="h-5 w-5" />
              Aniversariantes deste Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aniversariantes.length === 0 ? (
                <div className="text-center py-8">
                  <Cake className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum aniversário registrado</p>
                </div>
              ) : (
                aniversariantes.map((pessoa, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        pessoa.categoria === "Colaborador" 
                          ? "bg-blue-100" 
                          : "bg-green-100"
                      }`}>
                        <Cake className={`h-6 w-6 ${
                          pessoa.categoria === "Colaborador" 
                            ? "text-blue-600" 
                            : "text-green-600"
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{pessoa.nome}</h3>
                        <p className="text-sm text-muted-foreground">{pessoa.empresa}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{getDiaMes(pessoa.data_aniversario)}</p>
                      <Badge 
                        variant={pessoa.categoria === "Colaborador" ? "default" : "secondary"} 
                        className={`text-xs ${
                          pessoa.categoria === "Colaborador" 
                            ? "bg-blue-600 text-white" 
                            : "bg-green-600 text-white"
                        }`}
                      >
                        {pessoa.categoria}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 