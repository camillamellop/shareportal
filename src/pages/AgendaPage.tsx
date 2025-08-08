import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, Building, Truck, Fuel, Hotel, Star, Phone, Mail, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { Contact, FuelStation, Hotel as HotelType } from "@/services/firestore";
import { ContactModal } from "@/components/ContactModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { contactService, fuelStationService, hotelService, clienteService, abastecimentoService } from "@/services/firestore";
import { clientesData } from "@/data/clientes";
import { abastecimentoData, Abastecimento } from "@/data/abastecimento";
import { seedHotels } from "@/utils/seedHotels";
import { Timestamp } from "firebase/firestore";

export default function AgendaPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [fuelStations, setFuelStations] = useState<FuelStation[]>([]);
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [abastecimento, setAbastecimento] = useState<Abastecimento[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [abastecimentoFirebase, setAbastecimentoFirebase] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>();
  const [deletingContact, setDeletingContact] = useState<Contact | undefined>();
  const [editingClienteContato, setEditingClienteContato] = useState<{ cliente: string; contato: any } | undefined>();
  const [isClienteContatoModalOpen, setIsClienteContatoModalOpen] = useState(false);
  
  // Estados para edição do cliente completo
  const [editingCliente, setEditingCliente] = useState<{ cliente: any; originalNome: string } | undefined>();
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [editingAbastecimento, setEditingAbastecimento] = useState<any | undefined>();
  const [isAbastecimentoModalOpen, setIsAbastecimentoModalOpen] = useState(false);

  useEffect(() => {
    loadAllData();
    // Carregar dados de abastecimento
    setAbastecimento(abastecimentoData);
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log("Carregando dados do Firebase...");
      
      const [contactsRes, fuelStationsRes, hotelsRes, clientesRes, abastecimentoRes] = await Promise.all([
        contactService.getAll(),
        fuelStationService.getAll(),
        hotelService.getAll(),
        clienteService.getAll(),
        abastecimentoService.getAll(),
      ]);
      
      console.log("Dados carregados:", {
        contacts: contactsRes.length,
        fuelStations: fuelStationsRes.length,
        hotels: hotelsRes.length,
        clientes: clientesRes.length,
        abastecimento: abastecimentoRes.length
      });
      
      setContacts(contactsRes);
      setFuelStations(fuelStationsRes);
      setHotels(hotelsRes);
      setClientes(clientesRes);
      setAbastecimentoFirebase(abastecimentoRes);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar os contatos");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      try {
        setLoading(true);
        const [allContacts, allFuelStations, allHotels] = await Promise.all([
          contactService.getAll(),
          fuelStationService.getAll(),
          hotelService.getAll(),
        ]);
        
        const filteredContacts = allContacts.filter(contact =>
          contact.nome.toLowerCase().includes(term.toLowerCase()) ||
          contact.empresa?.toLowerCase().includes(term.toLowerCase()) ||
          contact.telefone.includes(term)
        );
        
        const filteredFuelStations = allFuelStations.filter(station =>
          station.nome.toLowerCase().includes(term.toLowerCase()) ||
          station.cidade.toLowerCase().includes(term.toLowerCase()) ||
          station.telefone.includes(term)
        );
        
        const filteredHotels = allHotels.filter(hotel =>
          hotel.hotel.toLowerCase().includes(term.toLowerCase()) ||
          hotel.cidade.toLowerCase().includes(term.toLowerCase()) ||
          hotel.telefone.includes(term)
        );
        
        const filteredAbastecimento = abastecimentoData.filter(item =>
          item.cidade.toLowerCase().includes(term.toLowerCase()) ||
          item.setor?.toLowerCase().includes(term.toLowerCase()) ||
          item.contato?.toLowerCase().includes(term.toLowerCase()) ||
          item.telefone.includes(term) ||
          item.icai.toLowerCase().includes(term.toLowerCase())
        );
        
        setContacts(filteredContacts);
        setFuelStations(filteredFuelStations);
        setHotels(filteredHotels);
        setAbastecimento(filteredAbastecimento);
      } catch (error) {
        console.error("Erro na busca:", error);
        toast.error("Erro ao buscar contatos");
      } finally {
        setLoading(false);
      }
    } else {
      loadAllData();
    }
  };

  const handleAddContact = () => {
    setEditingContact(undefined);
    setIsModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleDeleteContact = async (contact: Contact) => {
    try {
      await contactService.delete(contact.id);
      setContacts(prev => prev.filter(c => c.id !== contact.id));
      toast.success("Contato excluído com sucesso");
    } catch (error) {
      console.error("Erro ao excluir contato:", error);
      toast.error("Erro ao excluir contato");
    }
  };

  const handleSaveContact = async (contactData: Omit<Contact, 'id'>) => {
    try {
      const contactId = await contactService.create(contactData);
      const newContact = { ...contactData, id: contactId } as Contact;
      setContacts(prev => [...prev, newContact]);
      toast.success("Contato criado com sucesso");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao criar contato:", error);
      toast.error("Erro ao criar contato");
    }
  };

  const handleUpdateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      await contactService.update(id, updates);
      setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      toast.success("Contato atualizado com sucesso");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar contato:", error);
      toast.error("Erro ao atualizar contato");
    }
  };

  // Funções para gerenciar contatos dos clientes
  const handleEditClienteContato = (clienteNome: string, contato: any) => {
    setEditingClienteContato({ cliente: clienteNome, contato });
    setIsClienteContatoModalOpen(true);
  };

  const handleDeleteClienteContato = async (clienteNome: string) => {
    try {
      // Buscar o cliente no Firebase
      const clientes = await clienteService.getAll();
      const clienteExistente = clientes.find(c => c.nome_cliente === clienteNome);
      
      if (clienteExistente) {
        // Definir contato como undefined em vez de null para manter a estrutura
        await clienteService.update(clienteExistente.id, {
          contato: undefined
        });
        
        console.log("Contato excluído do Firebase:", { clienteNome });
        toast.success("Contato excluído com sucesso");
        await loadAllData(); // Recarregar dados
      }
    } catch (error) {
      console.error("Erro ao excluir contato:", error);
      toast.error("Erro ao excluir contato");
    }
  };

  const handleSaveClienteContato = async (clienteNome: string, contatoData: any) => {
    try {
      // Buscar o cliente no Firebase
      const clientes = await clienteService.getAll();
      const clienteExistente = clientes.find(c => c.nome_cliente === clienteNome);
      
      if (clienteExistente) {
        await clienteService.update(clienteExistente.id, {
          contato: contatoData
        });
        
        console.log("Contato salvo no Firebase:", { clienteNome, contatoData });
        toast.success("Contato atualizado com sucesso");
        await loadAllData(); // Recarregar dados
      }
    } catch (error) {
      console.error("Erro ao salvar contato:", error);
      toast.error("Erro ao salvar contato");
    }
    setIsClienteContatoModalOpen(false);
    setEditingClienteContato(undefined);
  };

  // Funções para editar o cliente completo
  const handleEditCliente = (cliente: any) => {
    setEditingCliente({ cliente: { ...cliente }, originalNome: cliente.nome_cliente });
    setIsClienteModalOpen(true);
  };

  const handleSaveCliente = async (clienteData: any) => {
    try {
      // Buscar o cliente no Firebase pelo nome original
      const clientes = await clienteService.getAll();
      const clienteExistente = clientes.find(c => c.nome_cliente === editingCliente?.originalNome);
      
      if (clienteExistente) {
        // Atualizar cliente existente
        await clienteService.update(clienteExistente.id, clienteData);
        console.log("Cliente atualizado no Firebase:", clienteData);
        toast.success("Cliente atualizado com sucesso");
      } else {
        // Criar novo cliente
        await clienteService.create(clienteData);
        console.log("Cliente criado no Firebase:", clienteData);
        toast.success("Cliente criado com sucesso");
      }
      
      setIsClienteModalOpen(false);
      setEditingCliente(undefined);
      
      // Recarregar dados para mostrar as mudanças
      await loadAllData();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      toast.error("Erro ao salvar cliente");
    }
  };

  // Funções para editar abastecimento
  const handleEditAbastecimento = (abastecimento: any) => {
    setEditingAbastecimento({ ...abastecimento });
    setIsAbastecimentoModalOpen(true);
  };

  const handleSaveAbastecimento = async (abastecimentoData: any) => {
    try {
      if (editingAbastecimento) {
        await abastecimentoService.update(editingAbastecimento.id, abastecimentoData);
        console.log("Abastecimento atualizado no Firebase:", abastecimentoData);
        toast.success("Abastecimento atualizado com sucesso");
      }
      
      setIsAbastecimentoModalOpen(false);
      setEditingAbastecimento(undefined);
      
      // Recarregar dados para mostrar as mudanças
      await loadAllData();
    } catch (error) {
      console.error("Erro ao salvar abastecimento:", error);
      toast.error("Erro ao salvar abastecimento");
    }
  };

  // Função para executar seed de hotéis
  const handleSeedHotels = async () => {
    try {
      console.log("Iniciando seed de hotéis...");
      toast.info("Adicionando hotéis...");
      
      await seedHotels();
      
      console.log("Seed concluído, recarregando dados...");
      await loadAllData();
      
      console.log("Dados recarregados, hotéis carregados:", hotels.length);
      toast.success(`Hotéis adicionados com sucesso! ${hotels.length} hotéis carregados.`);
    } catch (error) {
      console.error("Erro ao executar seed de hotéis:", error);
      toast.error("Erro ao adicionar hotéis: " + error.message);
    }
  };





  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "clientes":
        return <Users className="h-4 w-4" />;
      case "colaboradores":
        return <Building className="h-4 w-4" />;
      case "fornecedores":
        return <Truck className="h-4 w-4" />;
      case "abastecimento":
        return <Fuel className="h-4 w-4" />;
      case "hoteis":
        return <Hotel className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "clientes":
        return "Clientes";
      case "colaboradores":
        return "Colaboradores";
      case "fornecedores":
        return "Fornecedores";
      case "abastecimento":
        return "Abastecimento";
      case "hoteis":
        return "Hotéis";
      default:
        return "Outros";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "clientes":
        return "bg-blue-100 text-blue-800";
      case "colaboradores":
        return "bg-green-100 text-green-800";
      case "fornecedores":
        return "bg-orange-100 text-orange-800";
      case "abastecimento":
        return "bg-purple-100 text-purple-800";
      case "hoteis":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filtrar contatos normais
  const filteredContacts = contacts.filter(contact => {
    if (activeTab === "todos") return true;
    if (activeTab === "clientes") return false; // Clientes são mostrados separadamente
    if (searchTerm.trim() && activeTab === "todos") return true; // Na busca, mostrar todos na aba "Todos"
    return contact.categoria === activeTab;
  });

  // Filtrar clientes baseado no termo de pesquisa
  const filteredClientes = searchTerm.trim() 
    ? clientes.filter(cliente => 
        cliente.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.identificador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.contato && (
          cliente.contato.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cliente.contato.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cliente.contato.telefone?.includes(searchTerm)
        ))
      )
    : clientes;

  // Filtrar postos de combustível
  const filteredFuelStations = fuelStations.filter(station => {
    if (activeTab === "todos") return true;
    if (activeTab === "abastecimento") return true;
    if (searchTerm.trim() && activeTab === "todos") return true; // Na busca, mostrar todos na aba "Todos"
    return false;
  });

  // Filtrar hotéis
  const filteredHotels = hotels.filter(hotel => {
    if (activeTab === "todos") return true;
    if (activeTab === "hoteis") return true;
    if (searchTerm.trim() && activeTab === "todos") return true; // Na busca, mostrar todos na aba "Todos"
    return false;
  });

  // Filtrar abastecimento
  const filteredAbastecimento = abastecimentoFirebase.filter(item => {
    if (activeTab === "todos") return true;
    if (activeTab === "abastecimento") return true;
    if (searchTerm.trim() && activeTab === "todos") return true; // Na busca, mostrar todos na aba "Todos"
    return false;
  });

  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    if (!acc[contact.categoria]) {
      acc[contact.categoria] = [];
    }
    acc[contact.categoria].push(contact);
    return acc;
  }, {} as Record<string, Contact[]>);

  const categories = [
    { id: "todos", label: "Todos", icon: <Search className="h-4 w-4" /> },
    { id: "clientes", label: "Clientes", icon: <Users className="h-4 w-4" /> },
    { id: "colaboradores", label: "Colaboradores", icon: <Building className="h-4 w-4" /> },
    { id: "fornecedores", label: "Fornecedores", icon: <Truck className="h-4 w-4" /> },
    { id: "abastecimento", label: "Abastecimento", icon: <Fuel className="h-4 w-4" /> },
    { id: "hoteis", label: "Hotéis", icon: <Hotel className="h-4 w-4" /> },
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agenda & Contatos</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie todos os seus contatos organizados por categorias
            </p>
          </div>
          <Button onClick={handleAddContact} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Contato
          </Button>
        </div>

        {/* Campo de Pesquisa */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou empresa..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs de Categorias */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                {category.icon}
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Carregando...</div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Mostrar ClientesView quando a categoria "clientes" estiver selecionada */}
                {activeTab === "clientes" ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <h2 className="text-xl font-semibold text-foreground">
                        Clientes
                      </h2>
                      <Badge variant="secondary">{filteredClientes.length}</Badge>
                    </div>
                    
                    <div className="space-y-4">
                      {filteredClientes.length === 0 && searchTerm ? (
                        <div className="text-center py-8">
                          <div className="text-muted-foreground">
                            Nenhum cliente encontrado para "{searchTerm}".
                          </div>
                        </div>
                      ) : (
                        filteredClientes.map((cliente) => (
                          <Card key={cliente.nome_cliente} className="hover:shadow-md transition-shadow group">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-foreground">{cliente.nome_cliente}</h3>
                                    {cliente.identificador && (
                                      <Badge variant="outline" className="text-xs">
                                        {cliente.identificador}
                                      </Badge>
                                    )}
                                    {cliente.notas_pagamento && (
                                      <Badge variant="secondary" className="text-xs">
                                        {cliente.notas_pagamento}
                                      </Badge>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditCliente(cliente)}
                                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
                                
                                {/* Contato único */}
                                {cliente.contato && cliente.contato.nome ? (
                                  <div className="space-y-2 mt-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">Contato:</h4>
                                    <div className="p-3 border rounded bg-muted/30 group hover:bg-muted/50 transition-colors">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          {cliente.contato.nome && (
                                            <div className="font-medium text-sm">{cliente.contato.nome}</div>
                                          )}
                                          {cliente.contato.email && (
                                            <div className="text-xs text-muted-foreground">{cliente.contato.email}</div>
                                          )}
                                          {cliente.contato.telefone && (
                                            <div className="text-xs text-muted-foreground">{cliente.contato.telefone}</div>
                                          )}
                                          {cliente.contato.cargo_responsabilidade && (
                                            <div className="text-xs text-muted-foreground italic">
                                              {cliente.contato.cargo_responsabilidade}
                                            </div>
                                          )}
                                          {cliente.contato.nomes_associados && (
                                            <div className="text-xs text-muted-foreground">
                                              <span className="font-medium">Associados:</span> {cliente.contato.nomes_associados}
                                            </div>
                                          )}
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditClienteContato(cliente.nome_cliente, cliente.contato)}
                                            className="h-6 w-6 p-0"
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteClienteContato(cliente.nome_cliente)}
                                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>Excluir contato</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  Tem certeza que deseja excluir o contato deste cliente? Esta ação não pode ser desfeita.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction
                                                  onClick={() => handleDeleteClienteContato(cliente.nome_cliente)}
                                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                  Excluir
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2 mt-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">Contato:</h4>
                                    <div className="p-3 border rounded bg-muted/20 border-dashed">
                                      <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                          Nenhum contato cadastrado
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleEditClienteContato(cliente.nome_cliente, {})}
                                          className="h-8"
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          Adicionar Contato
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                    </div>
                  </div>
                                  ) : (
                    /* Contatos normais para outras categorias */
                    Object.entries(groupedContacts).map(([category, contactsList]) => (
                    <div key={category} className="space-y-4">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(category)}
                        <h2 className="text-xl font-semibold text-foreground">
                          {getCategoryLabel(category)}
                        </h2>
                        <Badge variant="secondary">{contactsList.length}</Badge>
                      </div>
                    
                      <div className="space-y-3">
                        {contactsList.map((contact) => (
                          <Card key={contact.id} className="hover:shadow-lg transition-shadow group">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="flex items-center gap-2">
                                    {getCategoryIcon(contact.categoria)}
                                    <div>
                                      <h3 className="font-semibold text-foreground">
                                        {contact.nome}
                                      </h3>
                                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <span>{contact.telefone}</span>
                                        {contact.email && (
                                          <>
                                            <span>•</span>
                                            <span>{contact.email}</span>
                                          </>
                                        )}
                                        {contact.empresa && (
                                          <>
                                            <span>•</span>
                                            <span>{contact.empresa}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {contact.favorito && (
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  )}
                                  {contact.cargo && (
                                    <Badge variant="outline" className="text-xs">
                                      {contact.cargo}
                                    </Badge>
                                  )}
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditContact(contact)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setDeletingContact(contact)}
                                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Excluir contato</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tem certeza que deseja excluir o contato "{contact.nome}"? Esta ação não pode ser desfeita.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteContact(contact)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            Excluir
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </div>
                              
                              {contact.observacoes && (
                                <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                                  <span className="font-medium">Observações:</span> {contact.observacoes}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))
                )}

                {/* Abastecimento */}
                {activeTab === "abastecimento" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4" />
                      <h2 className="text-xl font-semibold text-foreground">Abastecimento</h2>
                      <Badge variant="secondary">{filteredAbastecimento.length}</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {filteredAbastecimento.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-muted-foreground">
                            {searchTerm ? "Nenhum contato de abastecimento encontrado para sua busca." : "Nenhum contato de abastecimento encontrado."}
                          </div>
                        </div>
                      ) : (
                        filteredAbastecimento.map((item, index) => (
                          <Card key={index} className="hover:shadow-lg transition-shadow group">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="flex items-center gap-2">
                                    <Fuel className="h-4 w-4" />
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-foreground">
                                          {item.cidade}
                                        </h3>
                                        <Badge variant="outline" className="text-xs">
                                          {item.icai} {/* ICAO */}
                                        </Badge>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditAbastecimento(item)}
                                            className="h-6 w-6 p-0"
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeletingContact(item as any)}
                                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>Excluir contato de abastecimento</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  Tem certeza que deseja excluir o contato de abastecimento "{item.cidade}"? Esta ação não pode ser desfeita.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction
                                                  onClick={() => handleDeleteContact(item as any)}
                                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                  Excluir
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <span>{item.telefone}</span>
                                        {item.contato && (
                                          <>
                                            <span>•</span>
                                            <span>{item.contato}</span>
                                          </>
                                        )}
                                        {item.setor && (
                                          <>
                                            <span>•</span>
                                            <span>{item.setor}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {item.email && (
                                <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                                  <span className="font-medium">Email:</span> {item.email}
                                </div>
                              )}
                              
                              {item.observacao && (
                                <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                                  <span className="font-medium">Observação:</span> {item.observacao}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Hotéis */}
                {activeTab === "hoteis" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hotel className="h-4 w-4" />
                        <h2 className="text-xl font-semibold text-foreground">Hotéis</h2>
                        <Badge variant="secondary">{filteredHotels.length}</Badge>
                      </div>
                      <Button 
                        onClick={handleSeedHotels}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar Hotéis
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                                                  {filteredHotels.length === 0 ? (
                              <div className="text-center py-8">
                                <div className="text-muted-foreground">
                                  {searchTerm ? "Nenhum hotel encontrado para sua busca." : "Nenhum hotel cadastrado. Clique em 'Adicionar Hotéis' para carregar os dados."}
                                </div>
                              </div>
                            ) : (
                              filteredHotels.map((hotel, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow group">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="flex items-center gap-2">
                                  <Hotel className="h-4 w-4" />
                                  <div>
                                    <h3 className="font-semibold text-foreground">
                                      {hotel.hotel}
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                      <span>{hotel.telefone}</span>
                                      <span>•</span>
                                      <span>{hotel.cidade}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm text-muted-foreground">Single</div>
                                  <div className="font-semibold text-primary">
                                    R$ {hotel.preco_sgl.toFixed(2)}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-muted-foreground">Duplo</div>
                                  <div className="font-semibold text-primary">
                                    R$ {hotel.preco_dbl.toFixed(2)}
                                  </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditContact(hotel as any)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDeletingContact(hotel as any)}
                                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir hotel</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja excluir o hotel "{hotel.hotel}"? Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteContact(hotel as any)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Excluir
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </div>
                            
                            {hotel.endereco && (
                              <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                                <span className="font-medium">Endereço:</span> {hotel.endereco}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                    </div>
                  </div>
                )}

                {!loading && filteredContacts.length === 0 && filteredClientes.length === 0 && searchTerm && (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground">
                      Nenhum contato encontrado para "{searchTerm}".
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modal de Contato */}
        <ContactModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          contact={editingContact}
          onSave={handleSaveContact}
          onUpdate={handleUpdateContact}
        />

        {/* Modal de Contato do Cliente */}
        {isClienteContatoModalOpen && editingClienteContato && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-lg">
              <h2 className="text-lg font-semibold mb-4">
                Editar Contato - {editingClienteContato.cliente}
              </h2>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const contatoData = {
                  nome: formData.get('nome') as string || undefined,
                  email: formData.get('email') as string || undefined,
                  telefone: formData.get('telefone') as string || undefined,
                  cargo_responsabilidade: formData.get('cargo_responsabilidade') as string || undefined,
                  nomes_associados: formData.get('nomes_associados') as string || undefined,
                };
                handleSaveClienteContato(editingClienteContato.cliente, contatoData);
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome do Contato *</label>
                    <Input
                      name="nome"
                      defaultValue={editingClienteContato.contato.nome || ''}
                      placeholder="Nome completo do contato"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      name="email"
                      type="email"
                      defaultValue={editingClienteContato.contato.email || ''}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Telefone *</label>
                    <Input
                      name="telefone"
                      defaultValue={editingClienteContato.contato.telefone || ''}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Cargo/Responsabilidade</label>
                    <Input
                      name="cargo_responsabilidade"
                      defaultValue={editingClienteContato.contato.cargo_responsabilidade || ''}
                      placeholder="Cargo ou responsabilidade"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Nomes Associados</label>
                    <Input
                      name="nomes_associados"
                      defaultValue={editingClienteContato.contato.nomes_associados || ''}
                      placeholder="Outros nomes associados ao contato"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsClienteContatoModalOpen(false);
                      setEditingClienteContato(undefined);
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    Salvar Contato
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}



        {/* Modal de Edição do Cliente Completo */}
        {isClienteModalOpen && editingCliente && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">
                Editar Cliente - {editingCliente.originalNome}
              </h2>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const clienteData = {
                  nome_cliente: formData.get('nome_cliente') as string,
                  identificador: formData.get('identificador') as string || undefined,
                  notas_pagamento: formData.get('notas_pagamento') as string || undefined,
                  contatos: editingCliente.cliente.contatos || [],
                  sub_entidades: editingCliente.cliente.sub_entidades || [],
                };
                handleSaveCliente(clienteData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome do Cliente</label>
                    <Input
                      name="nome_cliente"
                      defaultValue={editingCliente.cliente.nome_cliente || ''}
                      placeholder="Nome do cliente"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Identificador</label>
                    <Input
                      name="identificador"
                      defaultValue={editingCliente.cliente.identificador || ''}
                      placeholder="Identificador do cliente"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Notas de Pagamento</label>
                    <Input
                      name="notas_pagamento"
                      defaultValue={editingCliente.cliente.notas_pagamento || ''}
                      placeholder="Ex: A GA paga as QUARTAS"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsClienteModalOpen(false);
                      setEditingCliente(undefined);
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    Salvar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Edição do Abastecimento */}
        {isAbastecimentoModalOpen && editingAbastecimento && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">
                Editar Abastecimento - {editingAbastecimento.cidade}
              </h2>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const abastecimentoData = {
                  icai: formData.get('icai') as string,
                  cidade: formData.get('cidade') as string,
                  setor: formData.get('setor') as string || undefined,
                  contato: formData.get('contato') as string || undefined,
                  telefone: formData.get('telefone') as string,
                  email: formData.get('email') as string || undefined,
                  observacao: formData.get('observacao') as string || undefined,
                };
                handleSaveAbastecimento(abastecimentoData);
              }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">ICAO</label>
                      <Input
                        name="icai"
                        defaultValue={editingAbastecimento.icai || ''}
                        placeholder="Código ICAO"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Cidade</label>
                      <Input
                        name="cidade"
                        defaultValue={editingAbastecimento.cidade || ''}
                        placeholder="Nome da cidade"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Setor</label>
                      <Input
                        name="setor"
                        defaultValue={editingAbastecimento.setor || ''}
                        placeholder="Setor de abastecimento"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Contato</label>
                      <Input
                        name="contato"
                        defaultValue={editingAbastecimento.contato || ''}
                        placeholder="Nome do contato"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Telefone</label>
                    <Input
                      name="telefone"
                      defaultValue={editingAbastecimento.telefone || ''}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      name="email"
                      type="email"
                      defaultValue={editingAbastecimento.email || ''}
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Observação</label>
                    <Input
                      name="observacao"
                      defaultValue={editingAbastecimento.observacao || ''}
                      placeholder="Observações adicionais"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAbastecimentoModalOpen(false);
                      setEditingAbastecimento(undefined);
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    Salvar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}