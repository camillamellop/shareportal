import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/integrations/firebase/config";
import { auth } from "@/integrations/firebase/config";

export interface UploadResult {
  url: string;
  path: string;
}

export class FirebaseStorageService {
  /**
   * Faz upload de uma imagem para o Firebase Storage
   */
  static async uploadImage(
    file: File, 
    folder: string = "profile-photos"
  ): Promise<UploadResult> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Criar nome único para o arquivo
      const timestamp = Date.now();
      const fileName = `${user.uid}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);

      // Fazer upload do arquivo
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        url: downloadURL,
        path: snapshot.ref.fullPath
      };
    } catch (error) {
      console.error("Erro no upload da imagem:", error);
      throw error;
    }
  }

  /**
   * Deleta uma imagem do Firebase Storage
   */
  static async deleteImage(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Erro ao deletar imagem:", error);
      throw error;
    }
  }

  /**
   * Converte um arquivo para base64 (para preview)
   */
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
} 