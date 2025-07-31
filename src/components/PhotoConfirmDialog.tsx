import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Check, X } from "lucide-react";

interface PhotoConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  previewUrl: string;
  loading: boolean;
}

export function PhotoConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  previewUrl,
  loading
}: PhotoConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Confirmar Nova Foto
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Deseja salvar esta nova foto de perfil?
            </p>
          </div>
          
          <div className="flex justify-center">
            <Avatar className="w-24 h-24 border-4 border-primary">
              <AvatarImage src={previewUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                <Camera className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              A foto será salva permanentemente no seu perfil
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            {loading ? "Salvando..." : "Salvar Foto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 