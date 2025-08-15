import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus, 
  Pin, 
  Clock, 
  Loader2,
  Filter,
  MoreVertical
} from "lucide-react";
import { messageServiceSpecific, Message } from "@/services/firestore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Recados() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState<{
    title: string;
    content: string;
    priority: "low" | "medium" | "high";
    recipients: string[];
    isPinned: boolean;
  }>({
    title: "",
    content: "",
    priority: "medium",
    recipients: [],
    isPinned: false
  });
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const allMessages = await messageServiceSpecific.getAll();
      setMessages(allMessages);
    } catch (error) {
      toast.error("Erro ao carregar mensagens");
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.title || !newMessage.content) {
      toast.error("Por favor, preencha título e conteúdo");
      return;
    }

    try {
      await messageServiceSpecific.create({
        title: newMessage.title,
        content: newMessage.content,
        sender: user?.uid || "",
        recipients: newMessage.recipients,
        priority: newMessage.priority,
      });

      toast.success("Mensagem enviada com sucesso!");
      setNewMessage({
        title: "",
        content: "",
        priority: "medium",
        recipients: [],
        isPinned: false
      });
      setShowForm(false);
      loadMessages();
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await messageServiceSpecific.update(messageId, {
        readAt: new Date() as any
      });
      loadMessages();
    } catch (error) {
      toast.error("Erro ao marcar como lida");
      console.error("Erro ao marcar como lida:", error);
    }
  };

  // Handler para editar mensagem
  const handleEditMessage = (message: Message) => {
    setShowForm(true);
    setNewMessage({
      title: message.title,
      content: message.content,
      priority: message.priority,
      recipients: message.recipients,
      isPinned: message.priority === 'high',
    });
    // Pode-se adicionar lógica para armazenar o id da mensagem em edição
    // e atualizar ao salvar
    // Exemplo: setEditingMessageId(message.id)
  };

  // Handler para excluir mensagem
  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este recado?')) return;
    try {
      await messageServiceSpecific.delete(id);
      toast.success('Recado excluído com sucesso!');
      loadMessages();
    } catch (error) {
      toast.error('Erro ao excluir recado');
      console.error('Erro ao excluir recado:', error);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">Alta</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Baixa</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Agora";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Agora";
    if (diffInHours < 24) return `há ${diffInHours}h`;
    if (diffInHours < 48) return "ontem";
    return date.toLocaleDateString('pt-BR');
  };

  const filteredMessages = messages.filter(message =>
    message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = messages.filter(m => !m.readAt).length;
  const pinnedCount = messages.filter(m => m.priority === "high").length;

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando mensagens...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Recados</h1>
            <p className="text-muted-foreground mt-1 lg:mt-2">
              Central de comunicação interna da equipe
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Novo Recado
          </Button>
        </div>

        {/* Formulário de nova mensagem */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Enviar Recado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Título</label>
                <Input
                  value={newMessage.title}
                  onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                  placeholder="Digite o título da mensagem..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Mensagem</label>
                <Textarea 
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  placeholder="Digite sua mensagem..."
                  rows={4}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="priority" 
                    className="rounded"
                    checked={newMessage.priority === "high"}
                    onChange={(e) => setNewMessage({ 
                      ...newMessage, 
                      priority: e.target.checked ? "high" : "medium" 
                    })}
                  />
                  <label htmlFor="priority" className="text-sm text-foreground">
                    Prioridade alta
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSendMessage}
                    className="flex-1 sm:flex-none"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Layout principal */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
          {/* Lista de mensagens */}
          <div className="xl:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Recados da Equipe
                  </CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar recados..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma mensagem encontrada</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? "Nenhuma mensagem corresponde à busca" : "Nenhuma mensagem ainda"}
                    </p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 border border-border rounded-lg hover:bg-accent transition-colors ${
                        !message.readAt ? 'bg-primary/5 border-primary/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(message.sender)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h4 className="font-semibold text-foreground truncate">
                              {message.title}
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap">
                              {getPriorityBadge(message.priority)}
                              {!message.readAt && (
                                <Badge className="bg-primary text-primary-foreground text-xs">
                                  Novo
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-foreground mb-3 line-clamp-2">
                            {message.content}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDate(message.createdAt)}
                            </div>
                            <div className="flex gap-2">
                              {!message.readAt && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleMarkAsRead(message.id)}
                                >
                                  Marcar como lida
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditMessage(message)}
                              >
                                Editar
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total de Recados</span>
                    <span className="font-semibold">{messages.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Não Lidos</span>
                    <Badge className="bg-red-100 text-red-800">{unreadCount}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Prioridade Alta</span>
                    <Badge className="bg-yellow-100 text-yellow-800">{pinnedCount}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Esta Semana</span>
                    <span className="font-semibold">
                      {messages.filter(m => {
                        const date = m.createdAt.toDate ? m.createdAt.toDate() : new Date(m.createdAt);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return date > weekAgo;
                      }).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}