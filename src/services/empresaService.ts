import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage } from '@/config/firebase';

export interface ConfigEmpresa {
  razaoSocial: string;
  cnpj: string;
  inscricaoMunicipal: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone?: string;
  email?: string;
  website?: string;
  logo?: string;
  observacoes?: string;
  updatedAt?: any;
}

export class EmpresaService {
  private configDoc = 'config/empresa';

  async getConfig(): Promise<ConfigEmpresa | null> {
    try {
      const docRef = doc(db, this.configDoc);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as ConfigEmpresa;
      }
      
      // Retornar configuração padrão da Share Brasil
      return {
        razaoSocial: "SHARE BRASIL SERVIÇOS AEROPORTUARIOS EIRELI",
        cnpj: "30.898.549/0001-06",
        inscricaoMunicipal: "102832",
        endereco: "Av. Presidente Artur Bernardes, 1457 - Vila Ipase",
        cidade: "Várzea Grande",
        estado: "MT",
        cep: "78125-100",
        observacoes: "Empresa especializada em serviços aeroportuários e aviação executiva"
      };
    } catch (error) {
      console.error('Erro ao buscar configuração da empresa:', error);
      throw error;
    }
  }

  async saveConfig(config: ConfigEmpresa): Promise<void> {
    try {
      const docRef = doc(db, this.configDoc);
      await setDoc(docRef, {
        ...config,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Erro ao salvar configuração da empresa:', error);
      throw error;
    }
  }

  async uploadLogo(file: File): Promise<string> {
    try {
      // Validações
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Logo deve ter no máximo 2MB');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem');
      }

      // Upload para Firebase Storage
      const fileName = `logo_empresa_${Date.now()}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `empresa/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Erro ao fazer upload da logo:', error);
      throw error;
    }
  }

  // Método para gerar cabeçalho formatado para documentos
  generateDocumentHeader(config: ConfigEmpresa): string {
    let header = config.razaoSocial;
    
    if (config.cnpj) {
      header += `\nCNPJ: ${config.cnpj}`;
      if (config.inscricaoMunicipal) {
        header += ` • Inscrição Municipal: ${config.inscricaoMunicipal}`;
      }
    }
    
    if (config.endereco) {
      header += `\nEndereço: ${config.endereco}, ${config.cidade} - ${config.estado}`;
      if (config.cep) {
        header += `, ${config.cep}`;
      }
    }

    const contatos = [];
    if (config.telefone) contatos.push(`Tel: ${config.telefone}`);
    if (config.email) contatos.push(`E-mail: ${config.email}`);
    if (config.website) contatos.push(`Site: ${config.website}`);
    
    if (contatos.length > 0) {
      header += `\n${contatos.join(' • ')}`;
    }
    
    return header;
  }

  // Método para gerar cabeçalho HTML para documentos
  generateHTMLHeader(config: ConfigEmpresa): string {
    return `
      <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #333;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="flex: 1; text-align: left;">
            <h2 style="margin: 0; font-size: 18px; font-weight: bold; margin-bottom: 10px;">
              ${config.razaoSocial}
            </h2>
            <div style="font-size: 12px; line-height: 1.4;">
              ${config.cnpj ? `<p style="margin: 2px 0;"><strong>CNPJ:</strong> ${config.cnpj}${config.inscricaoMunicipal ? ` • <strong>Inscrição Municipal:</strong> ${config.inscricaoMunicipal}` : ''}</p>` : ''}
              ${config.endereco ? `<p style="margin: 2px 0;"><strong>Endereço:</strong> ${config.endereco}, ${config.cidade} - ${config.estado}${config.cep ? `, ${config.cep}` : ''}</p>` : ''}
              ${config.telefone || config.email || config.website ? `<p style="margin: 2px 0;">` +
                [
                  config.telefone ? `Tel: ${config.telefone}` : '',
                  config.email ? `E-mail: ${config.email}` : '',
                  config.website ? `Site: ${config.website}` : ''
                ].filter(Boolean).join(' • ') + `</p>` : ''}
            </div>
          </div>
          ${config.logo ? `
            <div style="margin-left: 20px;">
              <img src="${config.logo}" alt="Logo" style="height: 60px; width: auto;" />
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

export const empresaService = new EmpresaService();