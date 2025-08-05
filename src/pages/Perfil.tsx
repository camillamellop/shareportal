import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, FileText, Camera, Save, Lock, Mail, Phone, MapPin, Calendar, Plus, CheckCircle, Clock, AlertTriangle, Heart, GraduationCap, Folder, Upload, Download, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { FirebaseStorageService } from "@/services/firebase-storage";
import { userServiceSpecific } from "@/services/firestore";
import { auth } from "@/integrations/firebase/config";
import { toast } from "sonner";
import { PhotoConfirmDialog } from "@/components/PhotoConfirmDialog";

export default function Perfil() {
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [holerites, setHolerites] = useState<any[]>([]);
  const [uploadingHolerite, setUploadingHolerite] = useState(false);
  const [feriasData, setFeriasData] = useState({
    totalDias: 30,
    diasTirou: 15,
    diasRestantes: 15,
    proximoVencimento: "2024-08-15",
    feriasSolicitadas: []
  });
  const [showSolicitarFerias, setShowSolicitarFerias] = useState(false);
  const [novaSolicitacao, setNovaSolicitacao] = useState({
    dataInicio: "",
    dataFim: "",
    dias: 0,
    motivo: ""
  });
  const [documentos, setDocumentos] = useState({
    pastas: [
      {
        id: "pessoal",
        nome: "Documentos Pessoais",
        icone: "User",
        documentos: []
      },
      {
        id: "atestados",
        nome: "Atestados Médicos",
        icone: "Heart",
        documentos: []
      },
      {
        id: "financeiros",
        nome: "Documentos Financeiros",
        icone: "FileText",
        documentos: []
      },
      {
        id: "outros",
        nome: "Outros",
        icone: "Folder",
        documentos: []
      }
    ],
    pastaAtiva: "pessoal"
  });
  const [uploadingDocumento, setUploadingDocumento] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [novoDocumento, setNovoDocumento] = useState({
    nome: "",
    pasta: "pessoal",
    arquivo: null as File | null
  });

  // Carregar dados do usuário ao montar o componente
  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log("Carregando dados do usuário...");
        const user = await userServiceSpecific.getCurrentUser();
        console.log("Usuário carregado:", user);
        if (user) {
          setUserData(user);
          if (user.photoURL) {
            setProfilePhoto(user.photoURL);
          }
        } else {
          console.log("Usuário não encontrado, criando...");
          // Criar usuário se não existir
          await userServiceSpecific.createOrUpdateCurrentUser({
            name: "Usuário Demo",
            email: "demo@sharebrasil.com",
            role: "cotista"
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    loadUserData();
  }, []);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Criar preview da foto
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string;
      setPreviewPhoto(previewUrl);
      setSelectedFile(file);
      setShowConfirmDialog(true);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmPhoto = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      console.log("Iniciando upload da foto...");
      console.log("Usuário atual:", auth.currentUser);
      
      // Fazer upload para o Firebase Storage
      const uploadResult = await FirebaseStorageService.uploadImage(selectedFile, "profile-photos");
      console.log("Upload concluído:", uploadResult);
      
      // Salvar URL no Firestore
      console.log("Salvando no Firestore...");
      await userServiceSpecific.updateProfilePhoto(uploadResult.url, uploadResult.path);
      console.log("Salvo no Firestore com sucesso");
      
      // Atualizar estado local
      setProfilePhoto(uploadResult.url);
      
      toast.success("Foto do perfil atualizada com sucesso!");
      
      // Limpar estados
      setShowConfirmDialog(false);
      setPreviewPhoto("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      toast.error(`Erro ao fazer upload da foto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPhoto = () => {
    setShowConfirmDialog(false);
    setPreviewPhoto("");
    setSelectedFile(null);
  };

  const handleHoleriteUpload = async (file: File) => {
    // Validar tamanho do arquivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB permitido.");
      return;
    }

    // Validar tipo do arquivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo não suportado. Use PDF, JPG, JPEG ou PNG.");
      return;
    }

    setUploadingHolerite(true);
    try {
      // Fazer upload para o Firebase Storage
      const uploadResult = await FirebaseStorageService.uploadImage(file, "holerites");
      
      // Criar objeto do holerite
      const holeriteData = {
        id: Date.now().toString(),
        fileName: file.name,
        fileUrl: uploadResult.url,
        filePath: uploadResult.path,
        uploadDate: new Date().toISOString(),
        month: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      };

      // Adicionar à lista local
      setHolerites(prev => [holeriteData, ...prev]);
      
      toast.success("Holerite enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload do holerite:", error);
      toast.error("Erro ao fazer upload do holerite");
    } finally {
      setUploadingHolerite(false);
    }
  };

  const calcularDias = (dataInicio: string, dataFim: string) => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSolicitarFerias = () => {
    if (!novaSolicitacao.dataInicio || !novaSolicitacao.dataFim || !novaSolicitacao.motivo) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const dias = calcularDias(novaSolicitacao.dataInicio, novaSolicitacao.dataFim);
    
    if (dias > feriasData.diasRestantes) {
      toast.error(`Você só tem ${feriasData.diasRestantes} dias restantes de férias`);
      return;
    }

    const novaSolicitacaoCompleta = {
      id: Date.now().toString(),
      dataInicio: novaSolicitacao.dataInicio,
      dataFim: novaSolicitacao.dataFim,
      dias: dias,
      motivo: novaSolicitacao.motivo,
      status: "pendente",
      dataSolicitacao: new Date().toISOString()
    };

    setFeriasData(prev => ({
      ...prev,
      feriasSolicitadas: [novaSolicitacaoCompleta, ...prev.feriasSolicitadas],
      diasRestantes: prev.diasRestantes - dias
    }));

    setNovaSolicitacao({
      dataInicio: "",
      dataFim: "",
      dias: 0,
      motivo: ""
    });

    setShowSolicitarFerias(false);
    toast.success("Solicitação de férias enviada com sucesso!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovada':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejeitada':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovada':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejeitada':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPastaIcon = (icone: string) => {
    switch (icone) {
      case 'User':
        return <User className="h-5 w-5" />;
      case 'FileText':
        return <FileText className="h-5 w-5" />;
      case 'Heart':
        return <Heart className="h-5 w-5" />;
      case 'GraduationCap':
        return <GraduationCap className="h-5 w-5" />;
      default:
        return <Folder className="h-5 w-5" />;
    }
  };

  const handleUploadDocumento = async () => {
    if (!novoDocumento.arquivo || !novoDocumento.nome) {
      toast.error("Selecione um arquivo e informe o nome");
      return;
    }

    // Validar tamanho do arquivo (máximo 10MB)
    if (novoDocumento.arquivo.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB permitido.");
      return;
    }

    setUploadingDocumento(true);
    try {
      // Fazer upload para o Firebase Storage
      const uploadResult = await FirebaseStorageService.uploadImage(novoDocumento.arquivo, `documentos/${novoDocumento.pasta}`);
      
      // Criar objeto do documento
      const documentoData = {
        id: Date.now().toString(),
        nome: novoDocumento.nome,
        tipo: novoDocumento.arquivo.type,
        tamanho: `${(novoDocumento.arquivo.size / (1024 * 1024)).toFixed(1)} MB`,
        dataUpload: new Date().toISOString(),
        url: uploadResult.url
      };

      // Adicionar à pasta correspondente
      setDocumentos(prev => ({
        ...prev,
        pastas: prev.pastas.map(pasta => 
          pasta.id === novoDocumento.pasta 
            ? { ...pasta, documentos: [documentoData, ...pasta.documentos] }
            : pasta
        )
      }));

             // Limpar formulário
       setNovoDocumento({
         nome: "",
         pasta: "pessoal",
         arquivo: null
       });

      setShowUploadModal(false);
      toast.success("Documento enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload do documento:", error);
      toast.error("Erro ao fazer upload do documento");
    } finally {
      setUploadingDocumento(false);
    }
  };

  const handleDeleteDocumento = (pastaId: string, documentoId: string) => {
    setDocumentos(prev => ({
      ...prev,
      pastas: prev.pastas.map(pasta => 
        pasta.id === pastaId 
          ? { ...pasta, documentos: pasta.documentos.filter(doc => doc.id !== documentoId) }
          : pasta
      )
    }));
    toast.success("Documento removido com sucesso!");
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas informações pessoais e configurações
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>

        <Tabs defaultValue="pessoal" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-muted">
            <TabsTrigger value="pessoal" className="text-foreground">
              Pessoal
            </TabsTrigger>
            <TabsTrigger value="bancario" className="text-muted-foreground">
              Bancário
            </TabsTrigger>
                         <TabsTrigger value="holerite" className="text-muted-foreground">
               Holerite
             </TabsTrigger>
            <TabsTrigger value="ferias" className="text-muted-foreground">
              Férias
            </TabsTrigger>
            <TabsTrigger value="documentos" className="text-muted-foreground">
              Documentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pessoal" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={profilePhoto} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      JS
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="photo-upload" className="cursor-pointer">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2" 
                        asChild
                      >
                        <span>
                          <Camera className="h-4 w-4" />
                          Alterar Foto
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-foreground">Nome Completo</Label>
                    <Input 
                      id="nome" 
                      defaultValue="João Silva" 
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">E-mail</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      defaultValue="joao.silva@sharebrasil.com" 
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-foreground">Telefone</Label>
                    <Input 
                      id="telefone" 
                      defaultValue="(11) 99999-9999" 
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-foreground">CPF</Label>
                    <Input 
                      id="cpf" 
                      defaultValue="123.456.789-00" 
                      disabled 
                      className="bg-muted border-border text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cargo" className="text-foreground">Cargo</Label>
                    <Input 
                      id="cargo" 
                      defaultValue="Piloto Comercial" 
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data-admissao" className="text-foreground">Data de Admissão</Label>
                    <Input 
                      id="data-admissao" 
                      type="date" 
                      defaultValue="2020-03-01" 
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bancario" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Dados Bancários</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="banco" className="text-foreground">Banco</Label>
                    <Input id="banco" defaultValue="Banco do Brasil" className="bg-input border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agencia" className="text-foreground">Agência</Label>
                    <Input id="agencia" defaultValue="1234-5" className="bg-input border-border" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="conta" className="text-foreground">Conta</Label>
                    <Input id="conta" defaultValue="12345-6" className="bg-input border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chave-pix" className="text-foreground">Chave PIX</Label>
                    <Input 
                      id="chave-pix" 
                      placeholder="Digite sua chave PIX" 
                      className="bg-input border-border" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

                     <TabsContent value="holerite" className="mt-6">
             <Card className="bg-card border-border">
               <CardHeader>
                 <CardTitle className="text-foreground flex items-center gap-2">
                   <FileText className="h-5 w-5" />
                   Holerites
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 {/* Upload de Holerite */}
                 <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                   <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                   <div className="space-y-2">
                     <Label htmlFor="holerite-upload" className="cursor-pointer">
                       <Button 
                         variant="outline" 
                         className="flex items-center gap-2"
                         disabled={uploadingHolerite}
                         asChild
                       >
                         <span>
                           {uploadingHolerite ? (
                             <>
                               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                               Enviando...
                             </>
                           ) : (
                             <>
                               <Camera className="h-4 w-4" />
                               Fazer Upload do Holerite
                             </>
                           )}
                         </span>
                       </Button>
                     </Label>
                     <Input
                       id="holerite-upload"
                       type="file"
                       accept=".pdf,.jpg,.jpeg,.png"
                       className="hidden"
                       onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                           handleHoleriteUpload(file);
                         }
                       }}
                     />
                     <p className="text-sm text-muted-foreground">
                       Aceita PDF, JPG, JPEG ou PNG (máx. 10MB)
                     </p>
                   </div>
                 </div>

                 {/* Lista de Holerites */}
                 <div className="space-y-3">
                   <h3 className="text-lg font-semibold text-foreground">Holerites Salvos</h3>
                   {holerites.length > 0 ? (
                     <div className="space-y-2">
                       {holerites.map((holerite) => (
                         <div key={holerite.id} className="flex items-center justify-between p-3 border rounded-lg">
                           <div className="flex items-center gap-3">
                             <FileText className="h-5 w-5 text-primary" />
                             <div>
                               <p className="font-medium text-foreground">{holerite.fileName}</p>
                               <p className="text-sm text-muted-foreground">
                                 Enviado em {new Date(holerite.uploadDate).toLocaleDateString('pt-BR')}
                               </p>
                             </div>
                           </div>
                           <Button 
                             variant="outline" 
                             size="sm"
                             onClick={() => window.open(holerite.fileUrl, '_blank')}
                           >
                             Download
                           </Button>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center py-8 text-muted-foreground">
                       <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
                       <p>Nenhum holerite enviado ainda</p>
                       <p className="text-sm">Faça upload do seu primeiro holerite acima</p>
                     </div>
                   )}
                 </div>
               </CardContent>
             </Card>
           </TabsContent>

                     <TabsContent value="ferias" className="mt-6">
             <div className="space-y-6">
               {/* Resumo de Férias */}
               <Card className="bg-card border-border">
                 <CardHeader>
                   <CardTitle className="text-foreground flex items-center gap-2">
                     <Calendar className="h-5 w-5" />
                     Resumo de Férias
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div className="text-center p-4 border rounded-lg">
                       <div className="text-2xl font-bold text-primary">{feriasData.totalDias}</div>
                       <div className="text-sm text-muted-foreground">Total de Dias</div>
                     </div>
                     <div className="text-center p-4 border rounded-lg">
                       <div className="text-2xl font-bold text-green-600">{feriasData.diasTirou}</div>
                       <div className="text-sm text-muted-foreground">Dias Utilizados</div>
                     </div>
                     <div className="text-center p-4 border rounded-lg">
                       <div className="text-2xl font-bold text-blue-600">{feriasData.diasRestantes}</div>
                       <div className="text-sm text-muted-foreground">Dias Restantes</div>
                     </div>
                     <div className="text-center p-4 border rounded-lg">
                       <div className="text-lg font-bold text-orange-600">
                         {new Date(feriasData.proximoVencimento).toLocaleDateString('pt-BR')}
                       </div>
                       <div className="text-sm text-muted-foreground">Próximo Vencimento</div>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               {/* Solicitar Férias */}
               <Card className="bg-card border-border">
                 <CardHeader className="flex flex-row items-center justify-between">
                   <CardTitle className="text-foreground flex items-center gap-2">
                     <Plus className="h-5 w-5" />
                     Solicitar Férias
                   </CardTitle>
                   <Dialog open={showSolicitarFerias} onOpenChange={setShowSolicitarFerias}>
                     <DialogTrigger asChild>
                       <Button className="flex items-center gap-2">
                         <Plus className="h-4 w-4" />
                         Nova Solicitação
                       </Button>
                     </DialogTrigger>
                     <DialogContent className="sm:max-w-[425px]">
                       <DialogHeader>
                         <DialogTitle>Solicitar Férias</DialogTitle>
                       </DialogHeader>
                       <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label htmlFor="data-inicio">Data de Início</Label>
                             <Input
                               id="data-inicio"
                               type="date"
                               value={novaSolicitacao.dataInicio}
                               onChange={(e) => setNovaSolicitacao(prev => ({
                                 ...prev,
                                 dataInicio: e.target.value
                               }))}
                             />
                           </div>
                           <div className="space-y-2">
                             <Label htmlFor="data-fim">Data de Fim</Label>
                             <Input
                               id="data-fim"
                               type="date"
                               value={novaSolicitacao.dataFim}
                               onChange={(e) => setNovaSolicitacao(prev => ({
                                 ...prev,
                                 dataFim: e.target.value
                               }))}
                             />
                           </div>
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="motivo">Motivo</Label>
                           <Textarea
                             id="motivo"
                             placeholder="Descreva o motivo da solicitação..."
                             value={novaSolicitacao.motivo}
                             onChange={(e) => setNovaSolicitacao(prev => ({
                               ...prev,
                               motivo: e.target.value
                             }))}
                           />
                         </div>
                         {novaSolicitacao.dataInicio && novaSolicitacao.dataFim && (
                           <div className="p-3 bg-muted rounded-lg">
                             <p className="text-sm text-muted-foreground">
                               Dias solicitados: {calcularDias(novaSolicitacao.dataInicio, novaSolicitacao.dataFim)}
                             </p>
                           </div>
                         )}
                         <div className="flex justify-end gap-2">
                           <Button variant="outline" onClick={() => setShowSolicitarFerias(false)}>
                             Cancelar
                           </Button>
                           <Button onClick={handleSolicitarFerias}>
                             Solicitar
                           </Button>
                         </div>
                       </div>
                     </DialogContent>
                   </Dialog>
                 </CardHeader>
               </Card>

               {/* Histórico de Solicitações */}
               <Card className="bg-card border-border">
                 <CardHeader>
                   <CardTitle className="text-foreground">Histórico de Solicitações</CardTitle>
                 </CardHeader>
                 <CardContent>
                   {feriasData.feriasSolicitadas.length > 0 ? (
                     <div className="space-y-3">
                       {feriasData.feriasSolicitadas.map((solicitacao) => (
                         <div key={solicitacao.id} className="flex items-center justify-between p-4 border rounded-lg">
                           <div className="flex items-center gap-3">
                             {getStatusIcon(solicitacao.status)}
                             <div>
                               <p className="font-medium text-foreground">
                                 {new Date(solicitacao.dataInicio).toLocaleDateString('pt-BR')} - {new Date(solicitacao.dataFim).toLocaleDateString('pt-BR')}
                               </p>
                               <p className="text-sm text-muted-foreground">
                                 {solicitacao.dias} dias • {solicitacao.motivo}
                               </p>
                               <p className="text-xs text-muted-foreground">
                                 Solicitado em {new Date(solicitacao.dataSolicitacao).toLocaleDateString('pt-BR')}
                               </p>
                             </div>
                           </div>
                           <Badge className={getStatusColor(solicitacao.status)}>
                             {solicitacao.status === 'aprovada' ? 'Aprovada' : 
                              solicitacao.status === 'pendente' ? 'Pendente' : 'Rejeitada'}
                           </Badge>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center py-8 text-muted-foreground">
                       <Calendar className="mx-auto h-12 w-12 mb-2 opacity-50" />
                       <p>Nenhuma solicitação de férias encontrada</p>
                       <p className="text-sm">Faça sua primeira solicitação acima</p>
                     </div>
                   )}
                 </CardContent>
               </Card>
             </div>
           </TabsContent>

                     <TabsContent value="documentos" className="mt-6">
             <div className="space-y-6">
               {/* Seletor de Pastas */}
               <Card className="bg-card border-border">
                 <CardHeader>
                   <CardTitle className="text-foreground flex items-center gap-2">
                     <Folder className="h-5 w-5" />
                     Pastas de Documentos
                   </CardTitle>
                 </CardHeader>
                                   <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {documentos.pastas.map((pasta) => (
                        <div
                          key={pasta.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            documentos.pastaAtiva === pasta.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setDocumentos(prev => ({ ...prev, pastaAtiva: pasta.id }))}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${
                              documentos.pastaAtiva === pasta.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                              {getPastaIcon(pasta.icone)}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-foreground">{pasta.nome}</p>
                              <p className="text-xs text-muted-foreground">
                                {pasta.documentos.length} documento{pasta.documentos.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
               </Card>

               {/* Conteúdo da Pasta Ativa */}
               <Card className="bg-card border-border">
                 <CardHeader className="flex flex-row items-center justify-between">
                   <CardTitle className="text-foreground flex items-center gap-2">
                     {getPastaIcon(documentos.pastas.find(p => p.id === documentos.pastaAtiva)?.icone || 'Folder')}
                     {documentos.pastas.find(p => p.id === documentos.pastaAtiva)?.nome}
                   </CardTitle>
                   <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
                     <DialogTrigger asChild>
                       <Button className="flex items-center gap-2">
                         <Upload className="h-4 w-4" />
                         Adicionar Documento
                       </Button>
                     </DialogTrigger>
                     <DialogContent className="sm:max-w-[425px]">
                       <DialogHeader>
                         <DialogTitle>Adicionar Documento</DialogTitle>
                       </DialogHeader>
                       <div className="space-y-4">
                         <div className="space-y-2">
                           <Label htmlFor="nome-documento">Nome do Documento</Label>
                           <Input
                             id="nome-documento"
                             placeholder="Ex: Licença de Piloto"
                             value={novoDocumento.nome}
                             onChange={(e) => setNovoDocumento(prev => ({
                               ...prev,
                               nome: e.target.value
                             }))}
                           />
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="pasta-documento">Pasta</Label>
                           <select
                             id="pasta-documento"
                             className="w-full p-2 border rounded-md bg-background text-foreground"
                             value={novoDocumento.pasta}
                             onChange={(e) => setNovoDocumento(prev => ({
                               ...prev,
                               pasta: e.target.value
                             }))}
                           >
                             {documentos.pastas.map((pasta) => (
                               <option key={pasta.id} value={pasta.id}>
                                 {pasta.nome}
                               </option>
                             ))}
                           </select>
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="arquivo-documento">Arquivo</Label>
                           <Input
                             id="arquivo-documento"
                             type="file"
                             accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                             onChange={(e) => {
                               const file = e.target.files?.[0];
                               if (file) {
                                 setNovoDocumento(prev => ({
                                   ...prev,
                                   arquivo: file
                                 }));
                               }
                             }}
                           />
                           <p className="text-sm text-muted-foreground">
                             Aceita PDF, JPG, PNG, DOC, DOCX (máx. 10MB)
                           </p>
                         </div>
                         <div className="flex justify-end gap-2">
                           <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                             Cancelar
                           </Button>
                           <Button 
                             onClick={handleUploadDocumento}
                             disabled={uploadingDocumento}
                           >
                             {uploadingDocumento ? (
                               <>
                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                 Enviando...
                               </>
                             ) : (
                               <>
                                 <Upload className="h-4 w-4 mr-2" />
                                 Enviar
                               </>
                             )}
                           </Button>
                         </div>
                       </div>
                     </DialogContent>
                   </Dialog>
                 </CardHeader>
                 <CardContent>
                   {(() => {
                     const pastaAtiva = documentos.pastas.find(p => p.id === documentos.pastaAtiva);
                     return pastaAtiva && pastaAtiva.documentos.length > 0 ? (
                                               <div className="space-y-2">
                          {pastaAtiva.documentos.map((documento) => (
                            <div key={documento.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <div>
                                  <p className="font-medium text-sm text-foreground">{documento.nome}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {documento.tamanho} • {new Date(documento.dataUpload).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-7 px-2"
                                  onClick={() => window.open(documento.url, '_blank')}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-7 px-2"
                                  onClick={() => handleDeleteDocumento(pastaAtiva.id, documento.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                                           ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <Folder className="mx-auto h-8 w-8 mb-2 opacity-50" />
                          <p className="text-sm">Nenhum documento nesta pasta</p>
                          <p className="text-xs">Adicione seu primeiro documento acima</p>
                        </div>
                      );
                   })()}
                 </CardContent>
               </Card>
             </div>
           </TabsContent>
        </Tabs>

        {/* Diálogo de confirmação de foto */}
        <PhotoConfirmDialog
          isOpen={showConfirmDialog}
          onClose={handleCancelPhoto}
          onConfirm={handleConfirmPhoto}
          previewUrl={previewPhoto}
          loading={loading}
        />
      </div>
    </Layout>
  );
}