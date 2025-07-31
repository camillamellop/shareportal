import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Plus, Clock, AlertCircle, CheckCircle, Filter } from "lucide-react";
import { taskServiceSpecific, Task } from "@/services/firestore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Tarefas() {
  const [tarefas, setTarefas] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending" as const,
    assignedTo: "",
    dueDate: ""
  });
  const { user } = useAuth();

  useEffect(() => {
    loadTarefas();
  }, []);

  const loadTarefas = async () => {
    try {
      setLoading(true);
      const tasks = await taskServiceSpecific.getAll();
      setTarefas(tasks);
    } catch (error) {
      toast.error("Erro ao carregar tarefas");
      console.error("Erro ao carregar tarefas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.description) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      await taskServiceSpecific.create({
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        assignedTo: newTask.assignedTo || user?.uid || "",
        dueDate: new Date(newTask.dueDate).getTime() as any,
      });

      toast.success("Tarefa criada com sucesso!");
      setNewTask({
        title: "",
        description: "",
        status: "pending",
        assignedTo: "",
        dueDate: ""
      });
      loadTarefas();
    } catch (error) {
      toast.error("Erro ao criar tarefa");
      console.error("Erro ao criar tarefa:", error);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      await taskServiceSpecific.update(taskId, { status: newStatus });
      toast.success("Status atualizado com sucesso!");
      loadTarefas();
    } catch (error) {
      toast.error("Erro ao atualizar status");
      console.error("Erro ao atualizar status:", error);
    }
  };

  const getPrioridadeBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Concluída</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">Em andamento</Badge>;
      case "pending":
        return <Badge className="bg-gray-100 text-gray-800">Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Não definido";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando tarefas...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Tarefas</h1>
            <p className="text-muted-foreground">Gerencie suas tarefas e responsabilidades</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>

        {/* Formulário para nova tarefa */}
        <Card>
          <CardHeader>
            <CardTitle>Nova Tarefa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Digite o título da tarefa"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={newTask.status}
                  onValueChange={(value: any) => setNewTask({ ...newTask, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Input
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Digite a descrição da tarefa"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Responsável</label>
                <Input
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  placeholder="Nome do responsável"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Data de vencimento</label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleCreateTask} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Criar Tarefa
            </Button>
          </CardContent>
        </Card>

        {/* Lista de tarefas */}
        <div className="grid gap-4">
          {tarefas.map((tarefa) => (
            <Card key={tarefa.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(tarefa.status)}
                      <h3 className="font-semibold text-lg">{tarefa.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-3">{tarefa.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Responsável: {tarefa.assignedTo}</span>
                      <span>Vencimento: {formatDate(tarefa.dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPrioridadeBadge(tarefa.status)}
                    <Select
                      value={tarefa.status}
                      onValueChange={(value: any) => handleUpdateStatus(tarefa.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_progress">Em andamento</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tarefas.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa encontrada</h3>
              <p className="text-muted-foreground">Crie sua primeira tarefa para começar</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}