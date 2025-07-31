import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, FileText, Camera, Save, Lock, Mail, Phone, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { FirebaseStorageService } from "@/services/firebase-storage";
import { userServiceSpecific } from "@/services/firestore";
import { toast } from "sonner";
import { PhotoConfirmDialog } from "@/components/PhotoConfirmDialog";

export default function Perfil() {
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Carregar dados do usuário ao montar o componente
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await userServiceSpecific.getCurrentUser();
        if (user) {
          setUserData(user);
          if (user.photoURL) {
            setProfilePhoto(user.photoURL);
          }
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
      // Fazer upload para o Firebase Storage
      const uploadResult = await FirebaseStorageService.uploadImage(selectedFile, "profile-photos");
      
      // Salvar URL no Firestore
      await userServiceSpecific.updateProfilePhoto(uploadResult.url, uploadResult.path);
      
      // Atualizar estado local
      setProfilePhoto(uploadResult.url);
      
      toast.success("Foto do perfil atualizada com sucesso!");
      
      // Limpar estados
      setShowConfirmDialog(false);
      setPreviewPhoto("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      toast.error("Erro ao fazer upload da foto");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPhoto = () => {
    setShowConfirmDialog(false);
    setPreviewPhoto("");
    setSelectedFile(null);
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
            <TabsTrigger value="salario" className="text-muted-foreground">
              Salário
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="banco" className="text-foreground">Banco</Label>
                    <Input id="banco" defaultValue="Banco do Brasil" className="bg-input border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agencia" className="text-foreground">Agência</Label>
                    <Input id="agencia" defaultValue="1234-5" className="bg-input border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conta" className="text-foreground">Conta</Label>
                    <Input id="conta" defaultValue="12345-6" className="bg-input border-border" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="salario" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Informações Salariais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salario-base" className="text-foreground">Salário Base</Label>
                    <Input id="salario-base" defaultValue="R$ 8.500,00" disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargo-salario" className="text-foreground">Cargo</Label>
                    <Input id="cargo-salario" defaultValue="Piloto Comercial" disabled className="bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ferias" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Férias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ferias-vencimento" className="text-foreground">Próximo Vencimento</Label>
                    <Input id="ferias-vencimento" defaultValue="15/08/2024" disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ferias-saldo" className="text-foreground">Saldo de Dias</Label>
                    <Input id="ferias-saldo" defaultValue="30 dias" disabled className="bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentos" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Documentos Profissionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenca" className="text-foreground">Licença de Piloto</Label>
                    <Input id="licenca" defaultValue="PLA-12345" className="bg-input border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validade-licenca" className="text-foreground">Validade da Licença</Label>
                    <Input id="validade-licenca" type="date" defaultValue="2025-12-31" className="bg-input border-border" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cma" className="text-foreground">CMA (Certificado Médico)</Label>
                    <Input id="cma" defaultValue="CMA-67890" className="bg-input border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validade-cma" className="text-foreground">Validade do CMA</Label>
                    <Input id="validade-cma" type="date" defaultValue="2024-06-30" className="bg-input border-border" />
                  </div>
                </div>
              </CardContent>
            </Card>
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