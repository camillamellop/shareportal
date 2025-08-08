import { MapPin, User, Camera, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { Logo } from "@/components/Logo";
import { NotificacaoVoos } from "@/components/shared/NotificacaoVoos";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { FirebaseStorageService } from "@/services/firebase-storage";
import { userServiceSpecific } from "@/services/firestore";
import { toast } from "sonner";
import { PhotoConfirmDialog } from "@/components/PhotoConfirmDialog";
import { auth } from "@/integrations/firebase/config";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [headerPhoto, setHeaderPhoto] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Carregar foto do usuário ao montar o componente
  useEffect(() => {
    const loadUserPhoto = async () => {
      try {
        console.log("Carregando foto do usuário...");
        const user = await userServiceSpecific.getCurrentUser();
        console.log("Usuário encontrado:", user);
        
        if (user && user.photoURL) {
          console.log("Foto do usuário encontrada:", user.photoURL);
          setHeaderPhoto(user.photoURL);
        } else {
          console.log("Usuário não tem foto, usando placeholder");
          setHeaderPhoto("");
        }
      } catch (error) {
        console.error("Erro ao carregar foto do usuário:", error);
        setHeaderPhoto("");
      }
    };

    loadUserPhoto();
  }, []);

  const handleHeaderPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("Arquivo selecionado:", file.name, file.size, file.type);

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    // Criar preview da foto
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string;
      console.log("Preview criado:", previewUrl.substring(0, 50) + "...");
      setPreviewPhoto(previewUrl);
      setSelectedFile(file);
      setShowConfirmDialog(true);
    };
    reader.onerror = (error) => {
      console.error("Erro ao ler arquivo:", error);
      toast.error("Erro ao ler o arquivo selecionado");
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmPhoto = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      console.log("Iniciando upload da foto...");
      
      // Fazer upload para o Firebase Storage
      const uploadResult = await FirebaseStorageService.uploadImage(selectedFile, "profile-photos");
      console.log("Upload concluído:", uploadResult);
      
      // Salvar URL no Firestore
      await userServiceSpecific.updateProfilePhoto(uploadResult.url, uploadResult.path);
      console.log("URL salva no Firestore");
      
      // Atualizar estado local
      setHeaderPhoto(uploadResult.url);
      console.log("Estado local atualizado");
      
      toast.success("Foto do perfil atualizada com sucesso!");
      
      // Limpar estados
      setShowConfirmDialog(false);
      setPreviewPhoto("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      toast.error("Erro ao fazer upload da foto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPhoto = () => {
    setShowConfirmDialog(false);
    setPreviewPhoto("");
    setSelectedFile(null);
  };

<<<<<<< HEAD
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };

=======
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
  return (
    <header className="h-16 bg-gradient-card border-b border-border px-4 lg:px-6 flex items-center justify-between shadow-card">
      {/* Logo e Título */}
      <div className="flex items-center space-x-2 lg:space-x-4">
        <Logo />
        <div className="hidden sm:block">
          <h1 className="text-lg lg:text-xl font-bold text-foreground">Portal Share Brasil</h1>
          <p className="text-xs lg:text-sm text-muted-foreground">Portal do Colaborador</p>
        </div>
      </div>

      {/* Barra de Pesquisa Central */}
      <div className="hidden md:block flex-1 max-w-md mx-4">
        <GlobalSearch />
      </div>

      {/* Área de Status e Perfil */}
      <div className="flex items-center space-x-2 lg:space-x-4">
        {/* Widget de Clima */}
        <div className="hidden lg:block">
          <WeatherWidget />
        </div>

        {/* Notificações de Voo */}
        <div className="hidden sm:block">
          <NotificacaoVoos 
            userId={user?.email || 'demo_user'} 
            userType="coordenador" 
          />
        </div>

        {/* Localização */}
        <div className="hidden xl:flex items-center space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">São Paulo</span>
        </div>

        {/* Perfil do Usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 lg:h-10 lg:w-10 rounded-full">
              <Avatar className="h-8 w-8 lg:h-10 lg:w-10 border-2 border-primary">
                <AvatarImage 
                  src={headerPhoto} 
                  alt="Perfil" 
                  onError={(e) => {
                    console.log("Erro ao carregar imagem:", e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="h-4 w-4 lg:h-5 lg:w-5" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-card border-border shadow-elevated" align="end">
            <DropdownMenuLabel className="text-foreground">Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <Label htmlFor="header-photo-upload" className="cursor-pointer">
              <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
                <Camera className="mr-2 h-4 w-4" />
                Alterar Foto
              </DropdownMenuItem>
            </Label>
            <Input
              id="header-photo-upload"
              type="file"
              accept="image/*"
              onChange={handleHeaderPhotoUpload}
              className="hidden"
            />
            <DropdownMenuSeparator className="bg-border" />
<<<<<<< HEAD
            <DropdownMenuItem 
              className="text-destructive hover:bg-destructive/10 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
=======
            <DropdownMenuItem className="text-destructive hover:bg-destructive/10 cursor-pointer">
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Diálogo de confirmação de foto */}
      <PhotoConfirmDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelPhoto}
        onConfirm={handleConfirmPhoto}
        previewUrl={previewPhoto}
        loading={loading}
      />
    </header>
  );
}