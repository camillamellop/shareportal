import { Layout } from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Folder,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Download,
  Search,
  Grid3X3,
  List,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface DocumentFolder {
  id: string;
  name: string;
  documents: DocumentFile[];
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: Date;
  url: string;
  type: string;
}

export default function Documentos() {
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<DocumentFolder | null>(null);
  const [editingFolder, setEditingFolder] = useState<DocumentFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setLoading(true);
      // Simulação: substitua por carregamento real (ex.: Firebase)
      const mockFolders: DocumentFolder[] = [
        {
          id: "1",
          name: "Manuais Técnicos",
          documents: [
            {
              id: "doc1",
              name: "Manual_Citation_CJ3.pdf",
              size: "2.5 MB",
              uploadedAt: new Date("2024-01-15"),
              url: "#",
              type: ".pdf",
            },
          ],
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-15"),
        },
        {
          id: "2",
          name: "Certificações",
          documents: [
            {
              id: "doc2",
              name: "Cert_ANAC_2024.pdf",
              size: "1.8 MB",
              uploadedAt: new Date("2024-01-10"),
              url: "#",
              type: ".pdf",
            },
          ],
          createdAt: new Date("2024-01-05"),
          updatedAt: new Date("2024-01-10"),
        },
        {
          id: "3",
          name: "Relatórios de Voo",
          documents: [],
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-15"),
        },
        {
          id: "4",
          name: "Procedimentos Operacionais",
          documents: [],
          createdAt: new Date("2024-01-20"),
          updatedAt: new Date("2024-01-20"),
        },
      ];
      setFolders(mockFolders);
    } catch (error) {
      console.error("Erro ao carregar pastas:", error);
      toast.error("Erro ao carregar pastas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Digite um nome para a pasta");
      return;
    }

    const newFolder: DocumentFolder = {
      id: `folder_${Date.now()}`,
      name: newFolderName.trim(),
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setFolders((prev) => [...prev, newFolder]);
    setNewFolderName("");
    setShowAddFolderModal(false);
    toast.success("Pasta criada com sucesso!");
  };

  const handleEditFolder = (folder: DocumentFolder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setShowAddFolderModal(true);
  };

  const handleUpdateFolder = () => {
    if (!editingFolder || !newFolderName.trim()) {
      toast.error("Digite um nome para a pasta");
      return;
    }

    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === editingFolder.id
          ? { ...folder, name: newFolderName.trim(), updatedAt: new Date() }
          : folder
      )
    );

    setNewFolderName("");
    setEditingFolder(null);
    setShowAddFolderModal(false);
    toast.success("Nome da pasta atualizado!");
  };

  const handleDeleteFolder = (folder: DocumentFolder) => {
    if (folder.documents.length > 0) {
      if (
        !confirm(
          `Tem certeza que deseja excluir a pasta "${folder.name}" com ${folder.documents.length} documento(s)?`
        )
      ) {
        return;
      }
    }

    setFolders((prev) => prev.filter((f) => f.id !== folder.id));
    toast.success("Pasta excluída!");
  };

  const handleFileUpload = (folderId: string, file: File) => {
    // Tipos permitidos
    const allowedTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".txt"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      toast.error("Tipo de arquivo não suportado. Use: PDF, DOC, DOCX, JPG, PNG, TXT");
      return;
    }

    // Tamanho máx. 10 MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB permitido.");
      return;
    }

    const newDocument: DocumentFile = {
      id: `doc_${Date.now()}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: new Date(),
      url: URL.createObjectURL(file),
      type: fileExtension,
    };

    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? {
              ...folder,
              documents: [...folder.documents, newDocument],
              updatedAt: new Date(),
            }
          : folder
      )
    );

    setShowUploadModal(false);
    setSelectedFolder(null);
    toast.success(`Arquivo "${file.name}" enviado com sucesso!`);
  };

  const handleDeleteDocument = (folderId: string, documentId: string) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? {
              ...folder,
              documents: folder.documents.filter((doc) => doc.id !== documentId),
              updatedAt: new Date(),
            }
          : folder
      )
    );
    toast.success("Documento excluído!");
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case ".pdf":
        return <FileText className="h-8 w-8 text-red-500" />;
      case ".doc":
      case ".docx":
        return <FileText className="h-8 w-8 text-blue-500" />;
      case ".jpg":
      case ".jpeg":
      case ".png":
        return <FileText className="h-8 w-8 text-green-500" />;
      default:
        return <FileText className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case ".pdf":
        return "PDF";
      case ".doc":
        return "DOC";
      case ".docx":
        return "DOCX";
      case ".jpg":
      case ".jpeg":
        return "JPG";
      case ".png":
        return "PNG";
      case ".txt":
        return "TXT";
      default:
        return type.toUpperCase().replace(".", "");
    }
  };

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground font-medium">
              Carregando documentos...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Documentos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas pastas e documentos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              title={viewMode === "grid" ? "Visualização em lista" : "Visualização em grade"}
            >
              {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
            <Button onClick={() => setShowAddFolderModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Pasta
            </Button>
          </div>
        </div>

        {/* Busca */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Buscar Documentos</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome da pasta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Grid/Lista de Pastas */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFolders.map((folder) => (
              <Card
                key={folder.id}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setSelectedFolder(folder)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Folder className="h-12 w-12 text-primary" />
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFolder(folder);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder);
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="font-semibold text-foreground mb-2 truncate">
                      {folder.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {folder.documents.length} documento
                      {folder.documents.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Criado em {folder.createdAt.toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFolders.map((folder) => (
              <Card
                key={folder.id}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setSelectedFolder(folder)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Folder className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground">{folder.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {folder.documents.length} documento
                          {folder.documents.length !== 1 ? "s" : ""} • Criado em{" "}
                          {folder.createdAt.toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFolder(folder);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder);
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredFolders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Folder className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhuma pasta encontrada</p>
            <p className="text-sm">Crie uma pasta para começar a organizar seus documentos</p>
          </div>
        )}

        {/* Modal Criar/Editar Pasta */}
        <Dialog open={showAddFolderModal} onOpenChange={setShowAddFolderModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFolder ? "Editar Pasta" : "Nova Pasta"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="folderName">Nome da Pasta</Label>
                <Input
                  id="folderName"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Digite o nome da pasta"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      editingFolder ? handleUpdateFolder() : handleCreateFolder();
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddFolderModal(false);
                    setNewFolderName("");
                    setEditingFolder(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={editingFolder ? handleUpdateFolder : handleCreateFolder}>
                  {editingFolder ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Visualizar Pasta */}
        <Dialog open={!!selectedFolder} onOpenChange={() => setSelectedFolder(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-primary" />
                  {selectedFolder?.name}
                </DialogTitle>
                <Button variant="outline" size="sm" onClick={() => setShowUploadModal(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar Arquivo
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {selectedFolder?.documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Pasta vazia</p>
                  <p className="text-sm">Envie arquivos para esta pasta</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedFolder?.documents.map((doc) => (
                    <Card key={doc.id} className="group">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          {getFileIcon(doc.type)}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Download">
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => selectedFolder && handleDeleteDocument(selectedFolder.id, doc.id)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              title="Excluir"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <Badge variant="secondary">{getFileTypeLabel(doc.type)}</Badge>
                            <span>{doc.size}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Enviado em {doc.uploadedAt.toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Upload de Arquivo */}
        <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Arquivo para "{selectedFolder?.name}"</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fileUpload">Selecionar Arquivo</Label>
                <Input
                  id="fileUpload"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && selectedFolder) {
                      handleFileUpload(selectedFolder.id, file);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Tipos suportados: PDF, DOC, DOCX, JPG, PNG, TXT (máx. 10MB)
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}