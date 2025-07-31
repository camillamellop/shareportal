import { Calendar, CheckSquare, Plane, Clock, Users, FileText, ArrowRight, User, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import aviationHero from "@/assets/aviation-hero.jpg";

export function MainContent() {
  const quickAccess = [
    {
      title: "Conciliação Bancária",
      description: "Gerencie movimentações bancárias",
      icon: Calendar,
      href: "/financeiro/conciliacao",
      gradient: "from-primary to-primary-dark",
    },
    {
      title: "Agenda & Contatos",
      description: "Acesso à agenda de contatos",
      icon: Calendar,
      href: "/agenda/contatos",
    },
    {
      title: "Meu Perfil",
      description: "Informações pessoais e documentos",
      icon: User,
      href: "/perfil",
      gradient: "from-primary-dark to-primary",
    },
  ];

  const todayTasks = [
    { id: 1, title: "Revisar documentos de voo", completed: false },
    { id: 2, title: "Verificar meteorologia", completed: true },
    { id: 3, title: "Confirmar tripulação", completed: false },
  ];

  const scheduledFlights: any[] = [];

  return (
    <main className="flex-1 p-6 space-y-6 bg-gradient-subtle">
      {/* Hero Section com Mensagem de Boas-vindas */}
      <div className="relative mb-8 rounded-2xl overflow-hidden shadow-elevated">
        <div 
          className="h-64 bg-cover bg-center bg-no-repeat relative"
          style={{ backgroundImage: `url(${aviationHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent" />
          <div className="relative h-full flex items-center px-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-3">
                Bem-vindo ao Portal Share Brasil
              </h1>
              <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
                Acesse rapidamente as principais funcionalidades do sistema de gestão para aviação
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Acessos Rápidos */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Acessos Rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickAccess.map((item, index) => (
            <Card
              key={index}
              className="group bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer overflow-hidden hover-scale"
            >
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-lg bg-custom-cyan flex items-center justify-center mb-3 shadow-primary">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-border hover:bg-primary hover:text-primary-foreground hover:border-primary group"
                >
                  Acessar
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tarefas do Dia */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-foreground">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Tarefas do Dia
            </CardTitle>
            <Badge className="bg-primary text-primary-foreground">
              {todayTasks.filter(task => !task.completed).length} pendentes
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayTasks.length > 0 ? (
              todayTasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/20">
                  <Checkbox 
                    checked={task.completed}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </span>
                  {task.completed && <Check className="h-4 w-4 text-primary" />}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>Nenhuma tarefa programada para hoje</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voos Agendados */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-foreground">
              <Plane className="mr-2 h-5 w-5 text-primary" />
              Voos Agendados
            </CardTitle>
            <Button variant="outline" size="sm" className="border-border hover:bg-accent">
              Ver todos
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center py-8 text-muted-foreground">
              <Plane className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>Nenhum voo agendado</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}