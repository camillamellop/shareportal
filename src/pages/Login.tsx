import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { auth } from "@/integrations/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, preencha email e senha");
      return;
    }

    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login realizado com sucesso!");
      navigate("/");
    } catch (error: any) {
      let errorMessage = "Erro inesperado durante o login";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "Usuário não encontrado";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Senha incorreta";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Email inválido";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Muitas tentativas. Tente novamente mais tarde";
      }
      
      toast.error(errorMessage);
      console.error("Erro no login:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      {/* Aviões voando animados */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Avião voando da esquerda para direita */}
        <div className="absolute top-1/4 animate-fly-right" style={{
          animationDelay: '0s'
        }}>
          <Plane size={24} className="text-primary/30" />
        </div>
        <div className="absolute top-1/3 animate-fly-right" style={{
          animationDelay: '8s'
        }}>
          <Plane size={20} className="text-secondary/40" />
        </div>
        <div className="absolute top-2/3 animate-fly-right" style={{
          animationDelay: '12s'
        }}>
          <Plane size={28} className="text-accent/35" />
        </div>

        {/* Avião voando da direita para esquerda */}
        <div className="absolute top-1/2 animate-fly-left" style={{
          animationDelay: '5s'
        }}>
          <Plane size={22} className="text-primary/25" />
        </div>
        <div className="absolute top-3/4 animate-fly-left" style={{
          animationDelay: '15s'
        }}>
          <Plane size={26} className="text-secondary/30" />
        </div>

        {/* Avião voando diagonal */}
        <div className="absolute animate-fly-diagonal" style={{
          animationDelay: '3s'
        }}>
          <Plane size={18} className="text-accent/40" />
        </div>
        <div className="absolute animate-fly-diagonal" style={{
          animationDelay: '10s'
        }}>
          <Plane size={24} className="text-primary/20" />
        </div>
      </div>

      {/* Background decorativo com tema de aviação */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 transform rotate-12">
          <Plane size={60} className="text-primary" />
        </div>
        <div className="absolute top-40 right-32 transform -rotate-45">
          <Plane size={40} className="text-secondary" />
        </div>
        <div className="absolute bottom-32 left-1/4 transform rotate-45">
          <Plane size={35} className="text-accent" />
        </div>
        <div className="absolute bottom-20 right-20 transform -rotate-12">
          <Plane size={50} className="text-primary" />
        </div>
      </div>

      <Card className="w-full max-w-md mx-4 shadow-2xl border-0 backdrop-blur-sm bg-card/80">
        <CardContent className="p-8 text-center space-y-6 rounded-md">
          {/* Logo da empresa */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-32 h-32 flex items-center justify-center">
              <Logo className="w-full h-full" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-primary">Share Brasil</h1>
              <p className="text-muted-foreground">Portal Colaborador</p>
            </div>
          </div>

<<<<<<< HEAD
          {/* Formulário de Login */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-left block text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-left block text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit"
              size="lg" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>


=======
          {/* Botão de login */}
          <Button 
            onClick={handleLogin} 
            size="lg" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524

          {/* Texto decorativo */}
          <p className="text-sm text-muted-foreground">
            Bem-vindo de volta ao nosso sistema
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;