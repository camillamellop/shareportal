import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Contact } from "@/services/firestore";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact;
  onSave: (contact: Omit<Contact, 'id'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Contact>) => Promise<void>;
}

export function ContactModal({ isOpen, onClose, contact, onSave, onUpdate }: ContactModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    empresa: "",
    cargo: "",
    categoria: "clientes" as Contact['categoria'],
    favorito: false,
    observacoes: "",
    endereco: "",
    cidade: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        nome: contact.nome || "",
        telefone: contact.telefone || "",
        email: contact.email || "",
        empresa: contact.empresa || "",
        cargo: contact.cargo || "",
        categoria: contact.categoria || "clientes",
        favorito: contact.favorito || false,
        observacoes: contact.observacoes || "",
        endereco: contact.endereco || "",
        cidade: contact.cidade || "",
      });
    } else {
      setFormData({
        nome: "",
        telefone: "",
        email: "",
        empresa: "",
        cargo: "",
        categoria: "clientes",
        favorito: false,
        observacoes: "",
        endereco: "",
        cidade: "",
      });
    }
  }, [contact, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (contact) {
        await onUpdate(contact.id, formData);
      } else {
        await onSave(formData);
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar contato:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contact ? "Editar Contato" : "Novo Contato"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleChange("telefone", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa</Label>
            <Input
              id="empresa"
              value={formData.empresa}
              onChange={(e) => handleChange("empresa", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo</Label>
            <Input
              id="cargo"
              value={formData.cargo}
              onChange={(e) => handleChange("cargo", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Select value={formData.categoria} onValueChange={(value) => handleChange("categoria", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clientes">Clientes</SelectItem>
                <SelectItem value="colaboradores">Colaboradores</SelectItem>
                <SelectItem value="fornecedores">Fornecedores</SelectItem>
                <SelectItem value="abastecimento">Abastecimento</SelectItem>
                <SelectItem value="hoteis">Hotéis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleChange("endereco", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={formData.cidade}
              onChange={(e) => handleChange("cidade", e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="favorito"
              checked={formData.favorito}
              onCheckedChange={(checked) => handleChange("favorito", checked)}
            />
            <Label htmlFor="favorito">Marcar como favorito</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange("observacoes", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Salvando..." : contact ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}