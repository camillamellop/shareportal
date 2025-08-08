<<<<<<< HEAD
import { Clock, Calendar, Plane, MapPin, Users, Settings, Wrench, CheckCircle, FileText, Fuel, AlertTriangle, WrenchIcon, Folder, Plus, Edit2, Upload, X, Trash2 } from "lucide-react";
=======
import { Clock, Calendar, Plane, MapPin, Users, Settings, Wrench, CheckCircle, FileText, Fuel, AlertTriangle, WrenchIcon, Folder, Plus, Edit2, Upload, X } from "lucide-react";
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { useToast } from "@/components/ui/use-toast";



export function RightSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
=======

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
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
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

<<<<<<< HEAD

=======
  const [documentFolders, setDocumentFolders] = useState<DocumentFolder[]>([
    {
      id: '1',
      name: 'Manuais Técnicos',
      documents: [
        {
          id: 'doc1',
          name: 'Manual_Citation_CJ3.pdf',
          size: '2.5 MB',
          uploadedAt: new Date('2024-01-15'),
          url: '#'
        }
      ],
      isEditing: false
    },
    {
      id: '2',
      name: 'Certificações',
      documents: [
        {
          id: 'doc2',
          name: 'Cert_ANAC_2024.pdf',
          size: '1.8 MB',
          uploadedAt: new Date('2024-01-10'),
          url: '#'
        }
      ],
      isEditing: false
    },
    {
      id: '3',
      name: 'Relatórios de Voo',
      documents: [],
      isEditing: false
    }
  ]);
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524

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
<<<<<<< HEAD
      isEditing: true,
      createdAt: new Date()
    };
    setDocumentFolders(prev => [...prev, newFolder]);
    toast({
      title: "Nova pasta criada!",
      description: "Edite o nome para personalizar.",
    });
  };

  const updateFolderName = (folderId: string, newName: string) => {
    if (newName.trim() === '') {
      toast({
        title: "Erro",
        description: "O nome da pasta não pode estar vazio",
        variant: "destructive",
      });
      return;
    }
    
    setDocumentFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, name: newName.trim(), isEditing: false }
          : folder
      )
    );
    toast({
      title: "Sucesso",
      description: "Nome da pasta atualizado!",
    });
=======
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
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
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
<<<<<<< HEAD
    const folder = documentFolders.find(f => f.id === folderId);
    if (folder && folder.documents.length > 0) {
      if (!confirm(`Tem certeza que deseja excluir a pasta "${folder.name}" com ${folder.documents.length} documento(s)?`)) {
        return;
      }
    }
    
    setDocumentFolders(prev => prev.filter(folder => folder.id !== folderId));
    toast({
      title: "Sucesso",
      description: "Pasta excluída!",
    });
  };

  const handleFileUpload = (folderId: string, file: File) => {
    // Validar tipo de arquivo
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "Erro",
        description: "Tipo de arquivo não suportado. Use: PDF, DOC, DOCX, JPG, PNG, TXT",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "Arquivo muito grande. Máximo 10MB permitido.",
        variant: "destructive",
      });
      return;
    }

=======
    setDocumentFolders(prev => prev.filter(folder => folder.id !== folderId));
  };

  const handleFileUpload = (folderId: string, file: File) => {
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
    const newDocument: DocumentFile = {
      id: `doc_${Date.now()}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: new Date(),
<<<<<<< HEAD
      url: URL.createObjectURL(file),
      type: fileExtension
=======
      url: URL.createObjectURL(file)
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
    };

    setDocumentFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, documents: [...folder.documents, newDocument] }
          : folder
      )
    );
<<<<<<< HEAD
    toast({
      title: "Sucesso",
      description: `Arquivo "${file.name}" enviado com sucesso!`,
    });
  };

  const deleteDocument = (folderId: string, documentId: string) => {
    setDocumentFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, documents: folder.documents.filter(doc => doc.id !== documentId) }
          : folder
      )
    );
    toast({
      title: "Sucesso",
      description: "Documento excluído!",
    });
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case '.pdf':
        return <FileText className="h-3 w-3 text-red-500" />;
      case '.doc':
      case '.docx':
        return <FileText className="h-3 w-3 text-blue-500" />;
      case '.jpg':
      case '.jpeg':
      case '.png':
        return <FileText className="h-3 w-3 text-green-500" />;
      default:
        return <FileText className="h-3 w-3 text-muted-foreground" />;
    }
=======
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
  };

  const flightOperations = [{
    label: "Solicitar Voo",
    icon: Calendar,
    color: "primary",
    onClick: () => navigate("/agendamento")
  }, {
    label: "Coordenação Voos",
    icon: Settings,
    color: "secondary",
    onClick: () => navigate("/coordenacao")
  }, {
    label: "Diário de Bordo",
    icon: Plane,
    color: "accent",
    onClick: () => navigate("/diario")
  }, {
    label: "Controle de Abastecimento",
    icon: Fuel,
    color: "primary",
    onClick: () => navigate("/abastecimento")
  }, {
    label: "Gestão de Tripulação",
    icon: Users,
    color: "secondary",
    onClick: () => navigate("/tripulacao")
  }, {
    label: "Documentos",
    icon: FileText,
    color: "accent",
    onClick: () => navigate("/documentos")
  }];

<<<<<<< HEAD
  const aircraftMaintenance = [];
=======
  const aircraftMaintenance = [
    {
      registration: "PR-MDL",
      model: "Citation CJ3+",
      status: "active",
      lastMaintenance: "2024-12-15",
      nextMaintenance: "2025-03-15",
      hours: 1250,
      priority: "normal"
    },
    {
      registration: "PT-OPC",
      model: "King Air 350",
      status: "active",
      lastMaintenance: "2024-11-20",
      nextMaintenance: "2025-02-20",
      hours: 2100,
      priority: "normal"
    },
    {
      registration: "PS-AVE",
      model: "Phenom 300E",
      status: "active",
      lastMaintenance: "2024-12-01",
      nextMaintenance: "2025-03-01",
      hours: 890,
      priority: "normal"
    },
  ];
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524

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

        {/* Manutenção de Aeronaves */}
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <WrenchIcon className="w-5 h-5 text-primary" />
              Manutenção de Aeronaves
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
<<<<<<< HEAD
            {aircraftMaintenance.length > 0 ? (
              aircraftMaintenance.map((aircraft, index) => (
                <div key={index} className="p-3 border border-border rounded-lg bg-card hover:bg-accent transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{aircraft.registration}</h4>
                    <Badge className={getStatusColor(aircraft.status)}>
                      {aircraft.status === 'active' ? 'Ativo' : 'Manutenção'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{aircraft.model}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{aircraft.hours}h</span>
                    <div className="flex items-center gap-1">
                      {getPriorityIcon(aircraft.priority)}
                      <span className={getPriorityColor(aircraft.priority).split(' ')[1]}>
                        {aircraft.priority === 'normal' ? 'Normal' : 'Urgente'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <WrenchIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma aeronave</p>
                <p className="text-xs">Dados de manutenção aparecerão aqui</p>
              </div>
            )}
          </CardContent>
        </Card>


=======
            {aircraftMaintenance.map((aircraft, index) => (
              <div key={index} className="p-3 border border-border rounded-lg bg-card hover:bg-accent transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{aircraft.registration}</h4>
                  <Badge className={getStatusColor(aircraft.status)}>
                    {aircraft.status === 'active' ? 'Ativo' : 'Manutenção'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{aircraft.model}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{aircraft.hours}h</span>
                  <div className="flex items-center gap-1">
                    {getPriorityIcon(aircraft.priority)}
                    <span className={getPriorityColor(aircraft.priority).split(' ')[1]}>
                      {aircraft.priority === 'normal' ? 'Normal' : 'Urgente'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Documentos */}
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Documentos
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={addNewFolder}
                className="h-8 px-2"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {documentFolders.map((folder) => (
              <div key={folder.id} className="p-3 border border-border rounded-lg bg-card hover:bg-accent transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    {folder.isEditing ? (
                      <Input
                        value={folder.name}
                        onChange={(e) => updateFolderName(folder.id, e.target.value)}
                        onBlur={() => toggleFolderEdit(folder.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            toggleFolderEdit(folder.id);
                          }
                        }}
                        className="h-6 text-sm"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm font-medium text-foreground truncate">
                        {folder.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFolderEdit(folder.id)}
                      className="h-6 w-6 p-0"
                      title="Editar nome"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteFolder(folder.id)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      title="Excluir pasta"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {folder.documents.length > 0 ? (
                    folder.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 p-2 bg-background rounded text-xs">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground truncate flex-1">{doc.name}</span>
                        <span className="text-muted-foreground">{doc.size}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-2 text-xs text-muted-foreground">
                      Nenhum documento
                    </div>
                  )}
                  
                  <div className="relative">
                    <input
                      type="file"
                      id={`upload-${folder.id}`}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(folder.id, file);
                        }
                      }}
                    />
                    <label
                      htmlFor={`upload-${folder.id}`}
                      className="flex items-center justify-center gap-1 w-full h-8 px-2 border border-border rounded bg-background hover:bg-accent transition-colors cursor-pointer text-xs text-muted-foreground"
                    >
                      <Upload className="h-3 w-3" />
                      Anexar
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
      </div>
    </aside>
  );
}