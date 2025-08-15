  const communicationsMenu = [
    {
      label: "Comunicações",
      icon: MessageSquare,
      color: "primary",
      onClick: () => navigate("/recados")
    }
  ];
import { Clock, Calendar, Plane, MapPin, Users, Settings, Wrench, CheckCircle, FileText, Fuel, AlertTriangle, WrenchIcon, Folder, Plus, Edit2, Upload, X } from "lucide-react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface DocumentFolder {
  id: string;
  name: string;
  documents: DocumentFile[];
  isEditing: boolean;
}

interface DocumentFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: Date;
  url: string;
}

export function RightSidebar() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }));
  
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  const [documentFolders, setDocumentFolders] = useState<DocumentFolder[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
      setCurrentDate(now.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const addNewFolder = () => {
    const newFolder: DocumentFolder = {
      id: `folder_${Date.now()}`,
      name: 'Nova Pasta',
      documents: [],
      isEditing: true
    };
    setDocumentFolders(prev => [...prev, newFolder]);
  };

  const updateFolderName = (folderId: string, newName: string) => {
    setDocumentFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, name: newName, isEditing: false }
          : folder
      )
    );
  };

  const toggleFolderEdit = (folderId: string) => {
    setDocumentFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, isEditing: !folder.isEditing }
          : folder
      )
    );
  };

  const deleteFolder = (folderId: string) => {
    setDocumentFolders(prev => prev.filter(folder => folder.id !== folderId));
  };

  const handleFileUpload = (folderId: string, file: File) => {
    const newDocument: DocumentFile = {
      id: `doc_${Date.now()}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: new Date(),
      url: URL.createObjectURL(file)
    };

    setDocumentFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, documents: [...folder.documents, newDocument] }
          : folder
      )
    );
  };

  const flightOperations = [{
    label: "Solicitar Voo",
    icon: Calendar,
    color: "primary",
    onClick: () => navigate("/agendamento-voo")
  }, {
    label: "Coordenação Voos",
    icon: Settings,
    color: "secondary",
    onClick: () => navigate("/coordenacao-voos")
  }, {
    label: "Diário de Bordo",
    icon: Plane,
    color: "accent",
    onClick: () => navigate("/diario-aeronaves")
  }, {
    label: "Controle de Abastecimento",
    icon: Fuel,
    color: "primary",
    onClick: () => navigate("/controle-abastecimento")
  }, {
    label: "Gestão de Tripulação",
    icon: Users,
    color: "secondary",
    onClick: () => navigate("/gestao-tripulacao")
  }, {
    label: "Documentos",
    icon: FileText,
    color: "accent",
    onClick: () => navigate("/documentos")
  }];

  const aircraftMaintenance = [];


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Wrench className="w-4 h-4" />;
      case 'normal':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <aside className="hidden xl:block w-80 bg-background border-l border-border shadow-card min-h-screen">
      <div className="p-4 space-y-6">
        {/* Relógio e Data */}
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold text-foreground">{currentTime}</span>
              </div>
              <p className="text-sm text-muted-foreground">{currentDate}</p>
            </div>
          </CardContent>
        </Card>

        {/* Operações de Voo */}
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Plane className="w-5 h-5 text-primary" />
              Operações de Voo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {flightOperations.map((operation, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start border-border hover:bg-accent hover:border-primary transition-colors"
                onClick={operation.onClick}
              >
                <operation.icon className="mr-3 h-4 w-4" />
                {operation.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Comunicações */}
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Comunicações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {communicationsMenu.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start border-border hover:bg-accent hover:border-primary transition-colors"
                onClick={item.onClick}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </CardContent>
        </Card>
  {/* ...apenas relógio/data e operações de voo... */}
      </div>
    </aside>
  );
}