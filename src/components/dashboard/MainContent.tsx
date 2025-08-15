import { Calendar, CheckSquare, Plane, Clock, Users, FileText, ArrowRight, User, Check, Wrench, DollarSign, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";

import aviationHero from "@/assets/aviation-hero.jpg";
import { useNavigate } from "react-router-dom";
import { taskServiceSpecific, Task } from "@/services/firestore";
import { useAuth } from "@/hooks/useAuth";

export function MainContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Carregar tarefas do dia
  useEffect(() => {
    const loadTodayTasks = async () => {
      if (!user) return;
      
      try {
        setLoadingTasks(true);
        // Buscar tarefas do usuário atual
        const userTasks = await taskServiceSpecific.getByUser(user.uid);
        
        // Filtrar tarefas de hoje
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        
        const todayTasksFiltered = userTasks.filter(task => {
          const taskDate = new Date(task.dueDate.toDate());
          const taskDateString = taskDate.toISOString().split('T')[0];
          return taskDateString === todayString;
        });
        
        setTodayTasks(todayTasksFiltered);
      } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
      } finally {
        setLoadingTasks(false);
      }
    };

    loadTodayTasks();
  }, [user]);

  const quickAccess = [
    {
      title: "Conciliação Bancária",
      description: "Gerencie movimentações bancárias",
      icon: DollarSign,
      href: "/financeiro/conciliacao",
      summary: "5 pendentes",
      color: "primary"
    },
    {
      title: "Acessar Portal Cliente",
      description: "Acesso ao portal do cliente",
      icon: User,
      href: "https://cliente.share-brasil.com/",
      summary: "Portal externo",
      color: "secondary"
    },
    {
      title: "Meu Perfil",
      description: "Informações pessoais e documentos",
      icon: User,
      href: "/perfil",
      summary: "Atualizado",
      color: "primary"
    }
  ];

  // Dados dos voos agendados (vazio por enquanto)
  const scheduledFlights: unknown[] = [];

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await taskServiceSpecific.update(taskId, { status: newStatus });
      
      // Atualizar estado local
      setTodayTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus as 'pending' | 'in_progress' | 'completed' }
            : task
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
    }
  };



  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'media':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'baixa':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <main className="flex-1 p-6 space-y-6 bg-gradient-subtle">
      {/* Hero Section */}
      <div className="relative mb-8 rounded-2xl overflow-hidden shadow-elevated">
        <div 
          className="h-48 bg-cover bg-center bg-no-repeat relative"
          style={{ backgroundImage: `url(${aviationHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent" />
          <div className="relative h-full flex items-center px-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Bem-vindo ao Portal Share Brasil
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Acesse rapidamente as principais funcionalidades do sistema
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Acesso Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickAccess.map((item, index) => (
          <Card key={index} className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-custom-cyan flex items-center justify-center shadow-primary`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                                 <Button 
                   variant="outline" 
                   size="sm"
                   onClick={() => {
                     if (item.href.startsWith('http')) {
                       window.open(item.href, '_blank');
                     } else {
                       navigate(item.href);
                     }
                   }}
                   className="border-border hover:bg-primary hover:text-primary-foreground hover:border-primary"
                 >
                   Acessar
                   <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="text-lg font-bold text-primary">{item.summary}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cards de Informações Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tarefas do Dia */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-foreground">
              <CheckSquare className="mr-2 h-5 w-5 text-primary" />
              Tarefas do Dia
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/tarefas')}>
              + Nova
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingTasks ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Carregando tarefas...</p>
              </div>
            ) : todayTasks.length > 0 ? (
              todayTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/20">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500' : 
                      task.status === 'in_progress' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className={`text-sm ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {task.dueDate ? new Date(task.dueDate.toDate()).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : 'Sem horário'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={task.status === 'completed'}
                      onCheckedChange={() => handleToggleTaskStatus(task.id, task.status)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Badge className={`text-xs ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      'bg-yellow-100 text-yellow-800 border-yellow-300'
                    }`}>
                      {task.status === 'completed' ? 'Concluída' :
                       task.status === 'in_progress' ? 'Em andamento' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>Nenhuma tarefa programada para hoje</p>
                                 <Button 
                   variant="outline" 
                   size="sm"
                   onClick={() => navigate('/tarefas')}
                 >
                   Criar Tarefa
                 </Button>
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
            <Button variant="outline" size="sm" onClick={() => navigate('/agendamento')}>
              Ver Todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {scheduledFlights.length > 0 ? (
              scheduledFlights.map((flight) => (
                <div key={flight.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/20">
                  <div className="flex items-center space-x-3">
                    <Plane className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">{flight.route}</p>
                        <Badge variant="secondary" className="text-xs">{flight.flightNumber}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{flight.timeRange}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{flight.pilot}</p>
                    <Badge className={`text-xs ${getStatusColor(flight.status)}`}>
                      {flight.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Plane className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>Sem voos agendados</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => navigate('/agendamento-voo')}
                >
                  Solicitar Voo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      
    </main>
  );
}