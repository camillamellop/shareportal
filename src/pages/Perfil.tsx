import { useEffect, useState } from "react";
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
import {
  User,
  FileText,
  Camera,
  Save,
  Calendar,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Heart,
  GraduationCap,
  Folder,
  Upload,
  Download,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { PhotoConfirmDialog } from "@/components/PhotoConfirmDialog";
import { FirebaseStorageService } from "@/services/firebase-storage";
import { userServiceSpecific } from "@/services/firestore";
import {
  addHolerite,
  listHolerites,
  deleteHolerite,
  addDocumento,
  listDocumentos,
  deleteDocumento,
} from "@/services/perfilDataService";

// ------------------------------------
// Tipos auxiliares
// ------------------------------------
type FeriasSolicitacao = {
  id: string;
  dataInicio: string;
  dataFim: string;
  dias: number;
  motivo: string;
  status: "pendente" | "aprovada" | "rejeitada";
  dataSolicitacao: string;
};

type PastaDoc = {
  id: string;
  nome: string;
  icone: "User" | "Heart" | "FileText" | "GraduationCap" | "Folder";
  documentos: Array<{
    id: string;
    nome: string;
    tipo: string;
    tamanho: string;
    dataUpload: string;
    url: string;
  }>;
};

type DocumentosState = {
  pastas: PastaDoc[];
  pastaAtiva: string;
};

// ------------------------------------
// Componente
// ------------------------------------
export default function Perfil() {
  // Perfil
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Campos extras do perfil (controlados)
  const [cpf, setCpf] = useState<string>("");
  const [telefone, setTelefone] = useState<string>("");
  const [cargo, setCargo] = useState<string>("");

  // Dialog de foto
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Holerites
  const [holerites, setHolerites] = useState<any[]>([]);
  const [uploadingHolerite, setUploadingHolerite] = useState(false);

  // Férias
  const [feriasData, setFeriasData] = useState({
    totalDias: 30,
    diasTirou: 15,
    diasRestantes: 15,
    proximoVencimento: "2024-08-15",
    feriasSolicitadas: [] as FeriasSolicitacao[],
  });
  const [showSolicitarFerias, setShowSolicitarFerias] = useState(false);
  const [novaSolicitacao, setNovaSolicitacao] = useState({
    dataInicio: "",
    dataFim: "",
    dias: 0,
    motivo: "",
  });

  // Documentos
  const [documentos, setDocumentos] = useState<DocumentosState>({
    pastas: [
      { id: "pessoal", nome: "Documentos Pessoais", icone: "User", documentos: [] },
      { id: "atestados", nome: "Atestados Médicos", icone: "Heart", documentos: [] },
      { id: "financeiros", nome: "Documentos Financeiros", icone: "FileText", documentos: [] },
      { id: "academicos", nome: "Acadêmicos/Certificados", icone: "GraduationCap", documentos: [] },
      { id: "outros", nome: "Outros", icone: "Folder", documentos: [] },
    ],
    pastaAtiva: "pessoal",
  });
  const [uploadingDocumento, setUploadingDocumento] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [novoDocumento, setNovoDocumento] = useState<{ nome: string; pasta: string; arquivo: File | null }>({
    nome: "",
    pasta: "pessoal",
    arquivo: null,
  });

  // ------------------------------------
  // Carregamento inicial
  // ------------------------------------
  useEffect(() => {
    const load = async () => {
      try {
        // Carrega usuário do Firestore (documento próprio da app)
        const user = await userServiceSpecific.getCurrentUser();
        if (user) {
          setUserData(user);
          if (user.photoURL) setProfilePhoto(user.photoURL);
          setCpf(user.cpf || "");
          setTelefone(user.telefone || "");
          setCargo(user.cargo || "");
        } else {
          // cria doc básico se não existir
          await userServiceSpecific.createOrUpdateCurrentUser({
            name: "Usuário",
            email: "",
            role: "cotista",
          });
          const newUser = await userServiceSpecific.getCurrentUser();
          if (newUser) setUserData(newUser);
        }

        // Carrega holerites do Firestore (subcoleção do usuário)
        const hols = await listHolerites();
        setHolerites(hols);

        // Carrega documentos do Firestore e distribui nas pastas
        const docs = await listDocumentos();
        setDocumentos((prev) => ({
          ...prev,
          pastas: prev.pastas.map((p) => ({
            ...p,
            documentos: docs
              .filter((d: any) => d.pasta === p.id)
              .map((d: any) => ({
                id: d.id,
                nome: d.nome,
                tipo: d.tipo,
                tamanho: d.tamanho,
                dataUpload: d.dataUpload,
                url: d.url,
              })),
          })),
        }));
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      }
    };
    load();
  }, []);

  // ------------------------------------
  // Foto de perfil
  // ------------------------------------
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
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
      const uploadResult = await FirebaseStorageService.uploadImage(selectedFile, "profile-photos");
      await userServiceSpecific.updateProfilePhoto(uploadResult.url, uploadResult.path);
      setProfilePhoto(uploadResult.url);
      toast.success("Foto do perfil atualizada!");
      setShowConfirmDialog(false);
      setPreviewPhoto("");
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Erro upload foto:", error);
      toast.error(`Erro ao fazer upload: ${error?.message || "Erro desconhecido"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPhoto = () => {
    setShowConfirmDialog(false);
    setPreviewPhoto("");
    setSelectedFile(null);
  };

  // ------------------------------------
  // Salvar perfil (campos básicos)
  // ------------------------------------
  const handleSaveProfile = async () => {
    if (!userData) return;
    setLoading(true);
    try {
      await userServiceSpecific.updateCurrentUserProfile({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        cargo,
        cpf,
        telefone,
        dataNascimento: userData.dataNascimento,
      });
      toast.success("Perfil atualizado!");
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // Holerites
  // ------------------------------------
  const handleHoleriteUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máx. 10MB.");
      return;
    }
    const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) {
      toast.error("Tipo não suportado. Use PDF/JPG/PNG.");
      return;
    }
    setUploadingHolerite(true);
    try {
      const up = await FirebaseStorageService.uploadImage(file, "holerites");
      const month = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      await addHolerite({
        fileName: file.name,
        fileUrl: up.url,
        filePath: up.path,
        month,
      });
      const hols = await listHolerites();
      setHolerites(hols);
      toast.success("Holerite enviado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar holerite");
    } finally {
      setUploadingHolerite(false);
    }
  };

  const handleDeleteHolerite = async (holeriteId: string) => {
    try {
      await deleteHolerite(holeriteId);
      const hols = await listHolerites();
      setHolerites(hols);
      toast.success("Holerite removido!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao remover holerite");
    }
  };

  // ------------------------------------
  // Férias
  // ------------------------------------
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
      toast.error(`Você só tem ${feriasData.diasRestantes} dias restantes`);
      return;
    }
    const nova: FeriasSolicitacao = {
      id: Date.now().toString(),
      dataInicio: novaSolicitacao.dataInicio,
      dataFim: novaSolicitacao.dataFim,
      dias,
      motivo: novaSolicitacao.motivo,
      status: "pendente",
      dataSolicitacao: new Date().toISOString(),
    };
    setFeriasData((prev) => ({
      ...prev,
      feriasSolicitadas: [nova, ...prev.feriasSolicitadas],
      diasRestantes: prev.diasRestantes - dias,
    }));
    setNovaSolicitacao({ dataInicio: "", dataFim: "", dias: 0, motivo: "" });
    setShowSolicitarFerias(false);
    toast.success("Solicitação enviada!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aprovada":
        return "bg-green-100 text-green-800 border-green-300";
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "rejeitada":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aprovada":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pendente":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "rejeitada":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  // ------------------------------------
  // Documentos
  // ------------------------------------
  const getPastaIcon = (icone: PastaDoc["icone"]) => {
    switch (icone) {
      case "User":
        return <User className="h-5 w-5" />;
      case "FileText":
        return <FileText className="h-5 w-5" />;
      case "Heart":
        return <Heart className="h-5 w-5" />;
      case "GraduationCap":
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
    if (novoDocumento.arquivo.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máx. 10MB.");
      return;
    }
    setUploadingDocumento(true);
    try {
      const up = await FirebaseStorageService.uploadImage(
        novoDocumento.arquivo,
        `documentos/${novoDocumento.pasta}`
      );
      const meta = {
        nome: novoDocumento.nome,
        url: up.url,
        path: up.path,
        tamanho: `${(novoDocumento.arquivo.size / (1024 * 1024)).toFixed(1)} MB`,
        tipo: novoDocumento.arquivo.type,
        pasta: novoDocumento.pasta,
      };
      await addDocumento(meta);

      // Recarregar a pasta ativa
      const docs = await listDocumentos(novoDocumento.pasta);
      setDocumentos((prev) => ({
        ...prev,
        pastas: prev.pastas.map((p) =>
          p.id === novoDocumento.pasta
            ? {
                ...p,
                documentos: docs.map((d: any) => ({
                  id: d.id,
                  nome: d.nome,
                  tipo: d.tipo,
                  tamanho: d.tamanho,
                  dataUpload: d.dataUpload,
                  url: d.url,
                })),
              }
            : p
        ),
      }));

      setNovoDocumento({ nome: "", pasta: "pessoal", arquivo: null });
      setShowUploadModal(false);
      toast.success("Documento enviado!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar documento");
    } finally {
      setUploadingDocumento(false);
    }
  };

  const handleDeleteDocumento = async (pastaId: string, documentoId: string) => {
    try {
      await deleteDocumento(documentoId);
      const docs = await listDocumentos(pastaId);
      setDocumentos((prev) => ({
        ...prev,
        pastas: prev.pastas.map((p) =>
          p.id === pastaId
            ? {
                ...p,
                documentos: docs.map((d: any) => ({
                  id: d.id,
                  nome: d.nome,
                  tipo: d.tipo,
                  tamanho: d.tamanho,
                  dataUpload: d.dataUpload,
                  url: d.url,
                })),
              }
            : p
        ),
      }));
      toast.success("Documento removido!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao remover documento");
    }
  };

  // ------------------------------------
  // Render
  // ------------------------------------
  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground mt-2">Gerencie suas informações pessoais e configurações</p>
          </div>
          <Button className="flex items-center gap-2" onClick={handleSaveProfile} disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        {/* Tabs */}
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

          {/* PESSOAL */}
          <TabsContent value="pessoal" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={profilePhoto} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {(userData?.name || "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="photo-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                        <span>
                          <Camera className="h-4 w-4" />
                          Alterar Foto
                        </span>
                      </Button>
                    </Label>
                    <Input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
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
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={userData?.name || ""}
                      onChange={(e) => setUserData((prev: any) => (prev ? { ...prev, name: e.target.value } : null))}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData?.email || ""}
                      onChange={(e) => setUserData((prev: any) => (prev ? { ...prev, email: e.target.value } : null))}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input
                      id="cargo"
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      placeholder="Ex: Piloto Comercial"
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data-nascimento">Data de Nascimento</Label>
                    <Input
                      id="data-nascimento"
                      type="date"
                      value={userData?.dataNascimento || ""}
                      onChange={(e) =>
                        setUserData((prev: any) => (prev ? { ...prev, dataNascimento: e.target.value } : null))
                      }
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleSaveProfile} disabled={loading} className="bg-primary hover:bg-primary/90">
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BANCÁRIO */}
          <TabsContent value="bancario" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Dados Bancários</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="banco">Banco</Label>
                    <Input id="banco" placeholder="Digite o nome do banco" className="bg-input border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agencia">Agência</Label>
                    <Input id="agencia" placeholder="Digite a agência" className="bg-input border-border" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="conta">Conta</Label>
                    <Input id="conta" placeholder="Digite o número da conta" className="bg-input border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chave-pix">Chave PIX</Label>
                    <Input id="chave-pix" placeholder="Digite sua chave PIX" className="bg-input border-border" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HOLERITE */}
          <TabsContent value="holerite" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Holerites
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload */}
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="holerite-upload" className="cursor-pointer">
                      <Button variant="outline" className="flex items-center gap-2" disabled={uploadingHolerite} asChild>
                        <span>
                          {uploadingHolerite ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
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
                        if (file) handleHoleriteUpload(file);
                      }}
                    />
                    <p className="text-sm text-muted-foreground">Aceita PDF, JPG, JPEG ou PNG (máx. 10MB)</p>
                  </div>
                </div>

                {/* Lista */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Holerites Salvos</h3>
                  {holerites.length > 0 ? (
                    <div className="space-y-2">
                      {holerites.map((h: any) => (
                        <div key={h.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">{h.fileName}</p>
                              <p className="text-sm text-muted-foreground">
                                Enviado em {new Date(h.uploadDate).toLocaleDateString("pt-BR")} • {h.month}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => window.open(h.fileUrl, "_blank")}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteHolerite(h.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

          {/* FÉRIAS */}
          <TabsContent value="ferias" className="mt-6">
            <div className="space-y-6">
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
                        {new Date(feriasData.proximoVencimento).toLocaleDateString("pt-BR")}
                      </div>
                      <div className="text-sm text-muted-foreground">Próximo Vencimento</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                              onChange={(e) =>
                                setNovaSolicitacao((prev) => ({ ...prev, dataInicio: e.target.value }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="data-fim">Data de Fim</Label>
                            <Input
                              id="data-fim"
                              type="date"
                              value={novaSolicitacao.dataFim}
                              onChange={(e) => setNovaSolicitacao((prev) => ({ ...prev, dataFim: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="motivo">Motivo</Label>
                          <Textarea
                            id="motivo"
                            placeholder="Descreva o motivo da solicitação..."
                            value={novaSolicitacao.motivo}
                            onChange={(e) => setNovaSolicitacao((prev) => ({ ...prev, motivo: e.target.value }))}
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
                          <Button onClick={handleSolicitarFerias}>Solicitar</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Histórico de Solicitações</CardTitle>
                </CardHeader>
                <CardContent>
                  {feriasData.feriasSolicitadas.length > 0 ? (
                    <div className="space-y-3">
                      {feriasData.feriasSolicitadas.map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(s.status)}
                            <div>
                              <p className="font-medium text-foreground">
                                {new Date(s.dataInicio).toLocaleDateString("pt-BR")} -{" "}
                                {new Date(s.dataFim).toLocaleDateString("pt-BR")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {s.dias} dias • {s.motivo}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Solicitado em {new Date(s.dataSolicitacao).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(s.status)}>
                            {s.status === "aprovada" ? "Aprovada" : s.status === "pendente" ? "Pendente" : "Rejeitada"}
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

          {/* DOCUMENTOS */}
          <TabsContent value="documentos" className="mt-6">
            <div className="space-y-6">
              {/* Pastas */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    Pastas de Documentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {documentos.pastas.map((p) => (
                      <div
                        key={p.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          documentos.pastaAtiva === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setDocumentos((prev) => ({ ...prev, pastaAtiva: p.id }))}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-lg ${
                              documentos.pastaAtiva === p.id ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            {getPastaIcon(p.icone)}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{p.nome}</p>
                            <p className="text-xs text-muted-foreground">
                              {p.documentos.length} documento{p.documentos.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Lista da pasta ativa + Upload */}
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-foreground flex items-center gap-2">
                    {getPastaIcon(
                      (documentos.pastas.find((p) => p.id === documentos.pastaAtiva)?.icone as PastaDoc["icone"]) || "Folder"
                    )}
                    {documentos.pastas.find((p) => p.id === documentos.pastaAtiva)?.nome}
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
                            onChange={(e) => setNovoDocumento((prev) => ({ ...prev, nome: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pasta-documento">Pasta</Label>
                          <select
                            id="pasta-documento"
                            className="w-full p-2 border rounded-md bg-background text-foreground"
                            value={novoDocumento.pasta}
                            onChange={(e) => setNovoDocumento((prev) => ({ ...prev, pasta: e.target.value }))}
                          >
                            {documentos.pastas.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.nome}
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
                              const file = e.target.files?.[0] || null;
                              setNovoDocumento((prev) => ({ ...prev, arquivo: file }));
                            }}
                          />
                          <p className="text-sm text-muted-foreground">Aceita PDF, JPG, PNG, DOC, DOCX (máx. 10MB)</p>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleUploadDocumento} disabled={uploadingDocumento}>
                            {uploadingDocumento ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
                    const pastaAtiva = documentos.pastas.find((p) => p.id === documentos.pastaAtiva);
                    return pastaAtiva && pastaAtiva.documentos.length > 0 ? (
                      <div className="space-y-2">
                        {pastaAtiva.documentos.map((d) => (
                          <div key={d.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <div>
                                <p className="font-medium text-sm text-foreground">{d.nome}</p>
                                <p className="text-xs text-muted-foreground">
                                  {d.tamanho} • {new Date(d.dataUpload).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => window.open(d.url, "_blank")}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => handleDeleteDocumento(pastaAtiva.id, d.id)}
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

        {/* Diálogo de confirmação da foto */}
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