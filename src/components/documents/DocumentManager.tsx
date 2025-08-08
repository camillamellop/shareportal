import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FolderPlus, Upload, File, Folder, Plus, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface DocumentFolder {
  id: string;
  name: string;
  files: DocumentFile[];
  createdAt: string;
}

interface DocumentFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  type: string;
}

export function DocumentManager() {
  const [folders, setFolders] = useState<DocumentFolder[]>([
    {
      id: "1",
      name: "I.S",
      files: [],
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      name: "CheckList",
      files: [],
      createdAt: "2024-01-15"
    }
  ]);
  
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder: DocumentFolder = {
      id: Date.now().toString(),
      name: newFolderName,
      files: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setFolders([...folders, newFolder]);
    setNewFolderName("");
  };

  const handleFileUpload = (folderId: string, files: FileList | null) => {
    if (!files) return;
    
    const newFiles: DocumentFile[] = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      uploadedAt: new Date().toISOString().split('T')[0],
      type: file.type || "application/octet-stream"
    }));

    setFolders(folders.map(folder => 
      folder.id === folderId 
        ? { ...folder, files: [...folder.files, ...newFiles] }
        : folder
    ));
  };

  const deleteFolder = (folderId: string) => {
    setFolders(folders.filter(folder => folder.id !== folderId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciamento de Documentos</h2>
          <p className="text-muted-foreground">Organize seus documentos em pastas personalizadas</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <FolderPlus className="h-4 w-4" />
              Nova Pasta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Pasta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nome da pasta"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button onClick={createFolder}>Criar Pasta</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map((folder) => (
          <Card key={folder.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{folder.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => deleteFolder(folder.id)} className="text-red-600">
                      Excluir Pasta
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{folder.files.length} arquivo(s)</Badge>
                <span className="text-xs text-muted-foreground">
                  Criada em {new Date(folder.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id={`upload-${folder.id}`}
                  onChange={(e) => handleFileUpload(folder.id, e.target.files)}
                />
                <label
                  htmlFor={`upload-${folder.id}`}
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Clique para enviar arquivos
                  </span>
                </label>
              </div>

              {/* Files List */}
              {folder.files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Arquivos:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {folder.files.map((file) => (
                      <div key={file.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs">
                        <File className="h-3 w-3 text-muted-foreground" />
                        <span className="flex-1 truncate">{file.name}</span>
                        <span className="text-muted-foreground">{file.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}