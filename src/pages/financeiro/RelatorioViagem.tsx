import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";

import "jspdf-autotable";
import {
  Plane, Plus, Search, Filter, Eye, Calendar,
  User, Trash2, Upload, FileText, Receipt, Send, Edit, CheckCircle
} from "lucide-react";

// Imports do Firebase que estavam faltando
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where 
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";

// Importações do seu projeto
import { db, storage } from "@/integrations/firebase/config";
import { RelatorioPreviewLayout } from '@/components/financeiro/RelatorioPreviewLayout';
import { generateRelatorioViagemPDF } from '@/utils/generateRelatorioViagemPDF';
import { toast } from "sonner";

type StatusRelatorio = 'RASCUNHO' | 'SALVO' | 'ENVIADO';
type ViewMode = 'list' | 'form' | 'preview';

interface DespesaViagem { 
  id: string; 
  categoria: string; 
  descricao: string; 
  valor: number; 
  data: string; 
  pago_por: 'Tripulante' | 'Cotista' | 'Share Brasil'; 
  comprovante_url?: string; 
  comprovante_nome?: string; 
  comprovante_file?: File; 
}

interface RelatorioViagem { 
  id: string; 
  numero: string; 
  cotista: string; 
  aeronave: string; 
  tripulante: string; 
  destino: string; 
  data_inicio: any; 
  data_fim: any; 
  despesas: DespesaViagem[]; 
  observacoes: string; 
  status: StatusRelatorio; 
  criado_por: string; 
  total_tripulante: number; 
  total_cotista: number; 
  total_share_brasil: number; 
  valor_total: number; 
}

interface RelatorioViagemForm { 
  numero: string; 
  cotista: string; 
  aeronave: string; 
  tripulante: string; 
  destino: string; 
  data_inicio: string; 
  data_fim: string; 
  despesas: DespesaViagem[]; 
  observacoes: string; 
  criado_por: string; 
}

interface Cotista { 
  id: string; 
  nome: string; 
  email: string; 
}

// --- Constantes ---
const AERONAVES_LIST = ['PT-OPC','PR-MDL','PS-AVE','PT-JPK','PT-OJG','PT-RVJ','PT-WSR','PP-JCP'];
const CATEGORIAS_DESPESA_LIST = ['Alimentação', 'Hospedagem', 'Transporte', 'Combustível', 'Taxas Aeroportuárias', 'Estacionamento', 'Outros'];
const PAGADORES_LIST = ['Tripulante', 'Cotista', 'Share Brasil'];
const COTISTAS_LIST = [ 
  { id: '1', nome: 'NOVA ALIANCA AGRO LTDA', email: 'contato@novaalianca.com' }, 
  { id: '2', nome: 'NOGUEIRA PARTICIPACOES E EMPREENDIMENTOS LTDA', email: 'contato@nogueira.com' }, 
  { id: '3', nome: 'GRF INCORPORADORA E CONSTRUTORA LTDA', email: 'contato@grf.com' }, 
  { id: '4', nome: 'GA SERVICE - GESTAO ADMINISTRATIVA LTDA', email: 'contato@gaservice.com' }, 
  { id: '5', nome: 'AGROCAM AGRICULTURA E PECUARIA CAMPONOVENSE LTDA', email: 'contato@agrocam.com' }, 
  { id: '6', nome: 'ESTANCIA BAHIA EVENTOS LTDA', email: 'contato@estanciabahia.com' }, 
  { id: '7', nome: 'E. R. DE FIGUEIREDO & CIA LTDA', email: 'contato@erfigueiredo.com' }, 
  { id: '8', nome: 'DUILIO NAVES JUNQUEIRA JUNIOR', email: 'contato@duilio.com' }, 
  { id: '9', nome: 'COMPLEXO TURISTICO SANTA ROSA PANTANAL HOTEIS LTDA', email: 'contato@santarosapantanal.com' }, 
  { id: '10', nome: 'WATT - DISTRIBUIDORA BRASIL. DE COMBUSTIVEIS E DERIVADOS DE PETROLEO LTDA', email: 'contato@watt.com' }, 
  { id: '11', nome: 'SOLUCAO TECNICA COMERCIO E SERVICOS DE EQUIPAMENTOS ELETRONICOS LTDA', email: 'contato@solucaotecnica.com' }, 
  { id: '12', nome: 'RICARDO GOMES DOS SANTOS', email: 'contato@ricardogomes.com' }, 
  { id: '13', nome: 'R.O.G HOLDING LTDA', email: 'contato@rogholding.com' }, 
  { id: '14', nome: 'EUGENIO ROBERTO BERGAMIM', email: 'contato@eugeniobergamim.com' }
];

const DADOS_EMPRESA = {
    razaoSocial: "SHARE BRASIL SERVIÇOS AEROPORTUARIOS EIRELI",
    cnpj: "30.898.549/0001-06",
    inscricaoMunicipal: "102832",
    endereco: "Av. Presidente Artur Bernardes, 1457 - Vila Ipase",
    cidade: "Várzea Grande",
    estado: "MT",
    cep: "78125-100"
};

// --- Serviços Firebase ---
const relatoriosCollectionRef = collection(db, "relatorios");
const cotistasCollectionRef = collection(db, "cotistas");

const relatorioViagemService = {
  getAll: async (): Promise<RelatorioViagem[]> => { 
    const querySnapshot = await getDocs(relatoriosCollectionRef); 
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as RelatorioViagem)); 
  },
  create: async (data: Omit<RelatorioViagem, 'id'>): Promise<RelatorioViagem> => { 
    const docRef = await addDoc(relatoriosCollectionRef, data); 
    return { ...data, id: docRef.id }; 
  },
  updateStatus: async (id: string, status: StatusRelatorio): Promise<void> => { 
    const relatorioDoc = doc(db, "relatorios", id); 
    await updateDoc(relatorioDoc, { status }); 
  },
  countByCotista: async (cotistaNome: string): Promise<number> => { 
    const q = query(relatoriosCollectionRef, where("cotista", "==", cotistaNome)); 
    const querySnapshot = await getDocs(q); 
    return querySnapshot.size; 
  },
  getCotistas: async (): Promise<Cotista[]> => { 
    const querySnapshot = await getDocs(cotistasCollectionRef); 
    if (querySnapshot.empty) { 
      return COTISTAS_LIST; 
    } 
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Cotista)); 
  }
};

const financeiroService = {
    criarContaPagar: async (tripulante: string, valor: number, relatorioNum: string) => { 
      await addDoc(collection(db, "contasAPagar"), { 
        favorecido: tripulante, 
        valor, 
        referencia: `Relatório ${relatorioNum}`, 
        dataCriacao: new Date(), 
        status: 'pendente' 
      }); 
    },
    criarContaReceber: async (cotista: string, valor: number, relatorioNum: string) => { 
      await addDoc(collection(db, "contasAReceber"), { 
        devedor: cotista, 
        valor, 
        referencia: `Relatório ${relatorioNum}`, 
        dataCriacao: new Date(), 
        status: 'pendente' 
      }); 
    }
}

// --- Funções Utilitárias ---
const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

export default function RelatoriosViagem() {
  // Estado para visualização de relatório salvo
  const [relatorioVisualizar, setRelatorioVisualizar] = useState<RelatorioViagem | null>(null);
  const [relatorios, setRelatorios] = useState<RelatorioViagem[]>([]);
  const [cotistas, setCotistas] = useState<Cotista[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showNovaDespesaForm, setShowNovaDespesaForm] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAeronave, setFilterAeronave] = useState("todas");
  const [filterStatus, setFilterStatus] = useState<StatusRelatorio | "todos">("todos");
  const [formData, setFormData] = useState<RelatorioViagemForm>({ 
    numero: "", 
    cotista: "", 
    aeronave: "", 
    tripulante: "", 
    destino: "", 
    data_inicio: new Date().toISOString().split("T")[0], 
    data_fim: new Date().toISOString().split("T")[0], 
    despesas: [], 
    observacoes: "", 
    criado_por: "Usuario Atual" 
  });
  const [novaDespesa, setNovaDespesa] = useState<Partial<DespesaViagem>>({ 
    data: new Date().toISOString().split("T")[0], 
    categoria: "", 
    descricao: "", 
    valor: 0, 
    pago_por: "Tripulante", 
    comprovante_file: undefined 
  });

  const resetForm = () => {
      setFormData({ 
        numero: "", 
        cotista: "", 
        aeronave: "", 
        tripulante: "", 
        destino: "", 
        data_inicio: new Date().toISOString().split("T")[0], 
        data_fim: new Date().toISOString().split("T")[0], 
        despesas: [], 
        observacoes: "", 
        criado_por: "Usuario Atual" 
      });
      setNovaDespesa({ 
        data: new Date().toISOString().split("T")[0], 
        categoria: "", 
        descricao: "", 
        valor: 0, 
        pago_por: "Tripulante", 
        comprovante_file: undefined 
      });
      setShowNovaDespesaForm(true);
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    if (isNaN(d.getTime())) return 'Data inválida';
    const userTimezoneOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: StatusRelatorio) => {
    switch(status) {
        case 'SALVO': return "border-cyan-500 text-cyan-400";
        case 'ENVIADO': return "border-green-500 text-green-400";
        case 'RASCUNHO': return "border-gray-500 text-gray-400";
        default: return "border-yellow-500 text-yellow-400";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
        try {
            setLoading(true);
            const [relatoriosData, cotistasData] = await Promise.all([ 
              relatorioViagemService.getAll(), 
              relatorioViagemService.getCotistas() 
            ]);
            setRelatorios(relatoriosData);
            setCotistas(cotistasData);
        } catch (err) {
            console.error("Erro ao carregar dados iniciais:", err);
            toast.error("Não foi possível carregar os dados do Firebase.");
        } finally { 
          setLoading(false); 
        }
    };
    fetchData();
  }, []);
  
  useEffect(() => {
    if (formData.cotista) { 
      generateReportNumber(formData.cotista); 
    } else { 
      handleInputChange('numero', ''); 
    }
  }, [formData.cotista, cotistas]);

  const generateReportNumber = async (cotistaNome: string) => {
      const cotista = cotistas.find(c => c.nome === cotistaNome);
      if (!cotista) return;
      const abrev = cotista.nome.replace(/[^A-Z0-9]/ig, "").substring(0, 3).toUpperCase();
      const count = await relatorioViagemService.countByCotista(cotistaNome);
      const nextNum = (count + 1).toString().padStart(3, '0');
      handleInputChange('numero', `REL-${abrev}-${nextNum}`);
  };

  const loadRelatorios = async () => {
    try {
      setLoading(true);
      const data = await relatorioViagemService.getAll();
      setRelatorios(data);
    } catch (err) {
      console.error("Erro ao carregar relatórios:", err);
      toast.error("Erro ao recarregar relatórios do Firebase.");
    } finally { 
      setLoading(false); 
    }
  };

  const handleInputChange = (field: keyof RelatorioViagemForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const adicionarDespesa = () => {
    if (!novaDespesa.categoria || !novaDespesa.descricao || !novaDespesa.valor) { 
      toast.error("Preencha todos os campos obrigatórios da despesa"); 
      return; 
    }
    const despesa: DespesaViagem = { 
      id: `despesa_${Date.now()}`, 
      categoria: novaDespesa.categoria!, 
      descricao: novaDespesa.descricao!, 
      valor: Number(novaDespesa.valor!), 
      data: novaDespesa.data!, 
      pago_por: novaDespesa.pago_por as any, 
      comprovante_file: novaDespesa.comprovante_file, 
      comprovante_nome: novaDespesa.comprovante_file?.name 
    };
    setFormData(prev => ({ ...prev, despesas: [...prev.despesas, despesa] }));
    setNovaDespesa({ 
      data: new Date().toISOString().split("T")[0], 
      categoria: "", 
      descricao: "", 
      valor: 0, 
      pago_por: "Tripulante", 
      comprovante_file: undefined 
    });
    setShowNovaDespesaForm(false);
    toast.success("Despesa adicionada.");
  };

  const removerDespesa = (id: string) => {
    setFormData(prev => ({ ...prev, despesas: prev.despesas.filter(d => d.id !== id) }));
    toast.success("Despesa removida.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { 
      setNovaDespesa(prev => ({ ...prev, comprovante_file: file })); 
    }
  };

  const handlePreview = () => {
    if (!formData.cotista || !formData.tripulante || !formData.aeronave || !formData.destino) { 
        toast.error("Por favor, preencha todas as informações da viagem para pré-visualizar.");
        return;
    }
    setViewMode('preview');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const despesasComUrl = await Promise.all(
        formData.despesas.map(async (despesa) => {
          if (despesa.comprovante_file) {
            const fileRef = ref(storage, `comprovantes/${formData.numero}/${despesa.comprovante_file.name}`);
            await uploadBytes(fileRef, despesa.comprovante_file);
            const url = await getDownloadURL(fileRef);
            return { ...despesa, comprovante_url: url, comprovante_file: undefined };
          }
          return despesa;
        })
      );
      
      const totals = despesasComUrl.reduce((acc, d) => {
        if (d.pago_por === 'Tripulante') acc.total_tripulante += d.valor;
        else if (d.pago_por === 'Cotista') acc.total_cotista += d.valor;
        else if (d.pago_por === 'Share Brasil') acc.total_share_brasil += d.valor;
        acc.valor_total += d.valor;
        return acc;
      }, { total_tripulante: 0, total_cotista: 0, total_share_brasil: 0, valor_total: 0 });
      
      // Remove campos undefined das despesas
      const cleanDespesas = despesasComUrl.map((d) => {
        const obj: any = {};
        Object.entries(d).forEach(([k, v]) => {
          if (v !== undefined) obj[k] = v;
        });
        return obj;
      });
      // Remove campos undefined do relatório
      const dataToSave: any = { ...formData, despesas: cleanDespesas, ...totals, status: 'SALVO' as StatusRelatorio, data_criacao: new Date() };
      Object.keys(dataToSave).forEach((k) => {
        if (dataToSave[k] === undefined) delete dataToSave[k];
      });
      await relatorioViagemService.create(dataToSave);
      toast.success("Relatório salvo com sucesso !");
      
  resetForm();
  setViewMode('list');
  setSearchTerm("");
  setFilterAeronave("todas");
  setFilterStatus("todos");
  await loadRelatorios();
    } catch (error) {
      console.error("Erro ao salvar relatório:", error);
      toast.error("Erro ao salvar relatório no Firebase.");
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleSendEmail = async (relatorio: RelatorioViagem) => {
      const cotista = cotistas.find(c => c.nome === relatorio.cotista);
      if (!cotista) { 
        toast.error("Cotista não encontrado."); 
        return; 
      }
      
      const subject = `Relatório de Viagem: ${relatorio.numero}`;
      let body = `Olá, ${relatorio.cotista}.\n\nSegue o resumo do relatório de viagem para ${relatorio.destino}:\n\n` + 
                `Período: ${formatDate(relatorio.data_inicio)} a ${formatDate(relatorio.data_fim)}\n` + 
                `Aeronave: ${relatorio.aeronave}\n\nDespesas:\n`;
      
      relatorio.despesas.forEach(d => { 
        body += `- ${d.descricao}: ${formatCurrency(d.valor)} (Pago por: ${d.pago_por})\n`; 
      });
      
      body += `\nTotal Geral: ${formatCurrency(relatorio.valor_total)}\n\nAtenciosamente,\nShare Brasil`;
      window.open(`mailto:${cotista.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
      
      setIsSubmitting(true);
      try {
        if (relatorio.total_cotista > 0) { 
          await financeiroService.criarContaReceber(relatorio.cotista, relatorio.total_cotista, relatorio.numero); 
        }
        if (relatorio.total_tripulante > 0) { 
          await financeiroService.criarContaPagar(relatorio.tripulante, relatorio.total_tripulante, relatorio.numero); 
        }
        await relatorioViagemService.updateStatus(relatorio.id, 'ENVIADO');
        toast.success(`Relatório ${relatorio.numero} enviado e pendências geradas!`);
        await loadRelatorios();
      } catch(error) {
        console.error("Erro ao gerar pendências:", error); 
        toast.error("Erro ao gerar pendências financeiras.");
      } finally { 
        setIsSubmitting(false); 
      }
  };

  const filteredRelatorios = relatorios.filter(r => {
    const search = searchTerm.toLowerCase();
    return (filterStatus === "todos" || r.status === filterStatus) &&
           (filterAeronave === "todas" || r.aeronave === filterAeronave) &&
           (searchTerm === "" || r.cotista.toLowerCase().includes(search) || 
            r.tripulante.toLowerCase().includes(search) || 
            r.destino.toLowerCase().includes(search));
  });

  // Calcular totais para preview
  const totalsForPreview = formData.despesas.reduce(
    (acc, d) => {
      if (d.pago_por === 'Tripulante') acc.total_tripulante += d.valor;
      else if (d.pago_por === 'Cotista') acc.total_cotista += d.valor;
      else if (d.pago_por === 'Share Brasil') acc.total_share_brasil += d.valor;
      acc.valor_total += d.valor;
      return acc;
    },
    { total_tripulante: 0, total_cotista: 0, total_share_brasil: 0, valor_total: 0 }
  );

  return (
    <Layout>
      <div className="p-6">
        {viewMode === 'preview' ? (
          <RelatorioPreviewLayout
            dadosEmpresa={DADOS_EMPRESA}
            formData={formData}
            totals={totalsForPreview}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            setViewMode={setViewMode}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        ) : viewMode === 'form' ? (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white">Novo Relatório de Viagem</h1>
              <p className="text-gray-400">Preencha as informações da viagem e adicione as despesas</p>
            </div>
            
            <div className="space-y-6">
              {/* Formulário de informações da viagem */}
              <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Informações da Viagem
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="cotista" className="text-sm font-medium text-gray-300">Cotista *</label>
                    <select 
                      id="cotista" 
                      value={formData.cotista} 
                      onChange={(e) => handleInputChange('cotista', e.target.value)} 
                      required 
                      className="w-full h-10 px-3 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="" disabled>Selecione o cotista</option>
                      {cotistas.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="numero-relatorio" className="text-sm font-medium text-gray-300">Número do Relatório</label>
                    <input 
                      id="numero-relatorio" 
                      value={formData.numero} 
                      placeholder="Selecione um cotista para gerar" 
                      readOnly 
                      className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-md text-gray-400 cursor-not-allowed" 
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="tripulante" className="text-sm font-medium text-gray-300">Tripulante *</label>
                    <input 
                      id="tripulante" 
                      value={formData.tripulante} 
                      onChange={(e) => handleInputChange('tripulante', e.target.value)} 
                      placeholder="Nome do tripulante" 
                      required 
                      className="w-full h-10 px-3 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="aeronave" className="text-sm font-medium text-gray-300">Aeronave *</label>
                    <select 
                      id="aeronave" 
                      value={formData.aeronave} 
                      onChange={(e) => handleInputChange('aeronave', e.target.value)} 
                      required 
                      className="w-full h-10 px-3 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="" disabled>Selecione</option>
                      {AERONAVES_LIST.map((a) => (<option key={a} value={a}>{a}</option>))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="destino" className="text-sm font-medium text-gray-300">Destino *</label>
                    <input 
                      id="destino" 
                      value={formData.destino} 
                      onChange={(e) => handleInputChange('destino', e.target.value)} 
                      placeholder="Cidade de destino" 
                      required 
                      className="w-full h-10 px-3 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="data_inicio" className="text-sm font-medium text-gray-300">Data de Início *</label>
                    <input 
                      id="data_inicio" 
                      type="date" 
                      value={formData.data_inicio} 
                      onChange={(e) => handleInputChange('data_inicio', e.target.value)} 
                      required 
                      className="w-full h-10 px-3 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="data_fim" className="text-sm font-medium text-gray-300">Data de Fim *</label>
                    <input 
                      id="data_fim" 
                      type="date" 
                      value={formData.data_fim} 
                      onChange={(e) => handleInputChange('data_fim', e.target.value)} 
                      min={formData.data_inicio} 
                      required 
                      className="w-full h-10 px-3 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="observacoes" className="text-sm font-medium text-gray-300">Observações</label>
                  <textarea 
                    id="observacoes" 
                    value={formData.observacoes} 
                    onChange={(e) => handleInputChange('observacoes', e.target.value)} 
                    placeholder="Observações sobre a viagem..." 
                    rows={3} 
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                  />
                </div>
              </div>
              
              {/* Formulário de despesas */}
              <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Despesas da Viagem
                </h3>
                
                {showNovaDespesaForm ? (
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-white">Adicionar Nova Despesa</h4>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Data da Despesa *</label>
                        <input 
                          type="date" 
                          value={novaDespesa.data} 
                          onChange={(e) => setNovaDespesa(p => ({ ...p, data: e.target.value }))} 
                          required 
                          className="w-full h-10 px-3 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Tipo de Despesa *</label>
                        <select 
                          value={novaDespesa.categoria} 
                          onChange={(e) => setNovaDespesa(p => ({ ...p, categoria: e.target.value }))} 
                          required 
                          className="w-full h-10 px-3 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="" disabled>Selecione o tipo</option>
                          {CATEGORIAS_DESPESA_LIST.map((c) => (<option key={c} value={c}>{c}</option>))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Descrição *</label>
                        <input 
                          value={novaDespesa.descricao} 
                          onChange={(e) => setNovaDespesa(p => ({ ...p, descricao: e.target.value }))} 
                          placeholder="Descrição da despesa" 
                          required 
                          className="w-full h-10 px-3 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Valor (R$) *</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={novaDespesa.valor} 
                          onChange={(e) => setNovaDespesa(p => ({ ...p, valor: Number(e.target.value) }))} 
                          placeholder="0,00" 
                          required 
                          className="w-full h-10 px-3 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Pago Por *</label>
                        <select 
                          value={novaDespesa.pago_por} 
                          onChange={(e) => setNovaDespesa(p => ({ ...p, pago_por: e.target.value as any }))} 
                          required 
                          className="w-full h-10 px-3 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="" disabled>Quem pagou</option>
                          {PAGADORES_LIST.map((p) => (<option key={p} value={p}>{p}</option>))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Comprovante</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="file" 
                            accept=".jpg,.jpeg,.png,.pdf" 
                            onChange={handleFileUpload} 
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-cyan-400 hover:file:bg-gray-600" 
                          />
                        </div>
                        {novaDespesa.comprovante_file && (
                          <p className="text-sm text-gray-400">Arquivo: {novaDespesa.comprovante_file.name}</p>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={adicionarDespesa} 
                      className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-cyan-500 hover:bg-cyan-600 text-white h-10 py-2 px-4"
                    >
                      <Plus className="mr-2 w-4 h-4" />
                      Adicionar Despesa
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => setShowNovaDespesaForm(true)} 
                    className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border-2 border-dashed border-gray-600 hover:border-cyan-500 hover:text-cyan-500 text-gray-400 h-12 py-2 px-4"
                  >
                    <Plus className="mr-2 w-4 h-4" />
                    Adicionar Outra Despesa
                  </button>
                )}
                
                {formData.despesas.length > 0 && (
                  <div className="space-y-3 pt-4">
                    <h4 className="font-medium text-white">Despesas Adicionadas ({formData.despesas.length})</h4>
                    {formData.despesas.map((d) => (
                      <div key={d.id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="border px-2 py-0.5 rounded-full text-xs font-semibold border-gray-500 text-gray-300">{d.categoria}</span>
                            <span className={`border px-2 py-0.5 rounded-full text-xs font-semibold ${
                              d.pago_por === 'Tripulante' ? 'border-blue-500 text-blue-400' : 
                              d.pago_por === 'Cotista' ? 'border-green-500 text-green-400' : 
                              'border-purple-500 text-purple-400'
                            }`}>
                              {d.pago_por}
                            </span>
                          </div>
                          <h5 className="font-medium text-white">{d.descricao}</h5>
                          <div className="text-sm text-gray-400 flex gap-4 mt-1 flex-wrap">
                            <span>Data: {formatDate(d.data)}</span>
                            <span className="font-medium text-green-400">{formatCurrency(d.valor)}</span>
                            {d.comprovante_nome && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {d.comprovante_nome}
                              </span>
                            )}
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removerDespesa(d.id)} 
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    <div className="bg-gray-900 rounded-lg p-4">
                      <h5 className="font-medium mb-2 text-white">Resumo Financeiro</h5>
                      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Tripulante:</span>
                          <p className="font-medium text-blue-400 text-lg">
                            {formatCurrency(formData.despesas.reduce((a, d) => d.pago_por === 'Tripulante' ? a + d.valor : a, 0))}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Cotista:</span>
                          <p className="font-medium text-green-400 text-lg">
                            {formatCurrency(formData.despesas.reduce((a, d) => d.pago_por === 'Cotista' ? a + d.valor : a, 0))}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Share Brasil:</span>
                          <p className="font-medium text-purple-400 text-lg">
                            {formatCurrency(formData.despesas.reduce((a, d) => d.pago_por === 'Share Brasil' ? a + d.valor : a, 0))}
                          </p>
                        </div>
                        <div className="font-semibold text-white">
                          <span className="text-gray-300">Total Geral:</span>
                          <p className="text-2xl">
                            {formatCurrency(formData.despesas.reduce((a, d) => a + d.valor, 0))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => {setViewMode('list'); resetForm();}} 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-600 bg-transparent hover:bg-gray-700 text-gray-200 h-10 py-2 px-4"
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  onClick={handlePreview} 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-cyan-500 hover:bg-cyan-600 text-white h-10 py-2 px-4"
                >
                  Pré-visualizar Relatório
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Modal de visualização do relatório salvo */}
            {relatorioVisualizar && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
                  <button 
                    onClick={() => setRelatorioVisualizar(null)} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                  >
                    ✕
                  </button>
                  <RelatorioPreviewLayout
                    dadosEmpresa={DADOS_EMPRESA}
                    formData={relatorioVisualizar}
                    totals={{
                      total_tripulante: relatorioVisualizar.total_tripulante,
                      total_cotista: relatorioVisualizar.total_cotista,
                      total_share_brasil: relatorioVisualizar.total_share_brasil,
                      valor_total: relatorioVisualizar.valor_total,
                    }}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                    setViewMode={() => setRelatorioVisualizar(null)}
                    handleSubmit={() => {}}
                    isSubmitting={false}
                    status={relatorioVisualizar.status}
                  />
                </div>
              </div>
            )}
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white">Relatórios de Viagem</h1>
                <p className="text-gray-400">Gerencie os registros e despesas de viagem</p>
              </div>
              <button 
                onClick={() => { setViewMode('form'); resetForm(); }} 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-cyan-500 hover:bg-cyan-600 text-white h-10 py-2 px-4"
              >
                <Plus className="mr-2 w-4 h-4" /> 
                Novo Relatório
              </button>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    placeholder="Buscar por cotista, tripulante ou destino" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full h-10 pl-10 pr-3 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                  />
                </div>
                <select 
                  value={filterAeronave} 
                  onChange={(e) => setFilterAeronave(e.target.value)} 
                  className="w-full h-10 px-3 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="todas">Todas as Aeronaves</option>
                  {AERONAVES_LIST.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value as any)} 
                  className="w-full h-10 px-3 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="RASCUNHO">Rascunho</option>
                  <option value="SALVO">Salvo</option>
                  <option value="ENVIADO">Enviado</option>
                </select>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                <p className="mt-2 text-gray-400">Carregando...</p>
              </div>
            ) : filteredRelatorios.length === 0 ? (
              <div className="text-center py-16 bg-gray-800 rounded-lg">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">Nenhum relatório encontrado.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRelatorios.map((relatorio) => (
                  <div key={relatorio.id} className="bg-gray-800 p-5 rounded-lg border border-gray-700 hover:border-cyan-500 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-semibold text-white">{relatorio.numero} - {relatorio.destino}</h3>
                          <span className={`border px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(relatorio.status)}`}>
                            {relatorio.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4" /> {relatorio.tripulante}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Plane className="w-4 h-4" /> {relatorio.aeronave}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" /> {formatDate(relatorio.data_inicio)} - {formatDate(relatorio.data_fim)}
                          </span>
                        </div>
                        <div className="font-medium text-white text-xl pt-1">
                          {formatCurrency(relatorio.valor_total)}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <button 
                          onClick={() => setRelatorioVisualizar(relatorio)} 
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 h-9 px-3"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </button>
                        <button 
                          onClick={() => setRelatorioVisualizar(relatorio)} 
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 h-9 px-3"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </button>
                        <button
                          onClick={async () => {
                            await generateRelatorioViagemPDF(
                              {
                                numero: relatorio.numero,
                                cotista: relatorio.cotista,
                                aeronave: relatorio.aeronave,
                                tripulante: relatorio.tripulante,
                                destino: relatorio.destino,
                                data_inicio: relatorio.data_inicio,
                                data_fim: relatorio.data_fim,
                                despesas: relatorio.despesas,
                                observacoes: relatorio.observacoes,
                              },
                              {
                                total_tripulante: relatorio.total_tripulante,
                                total_cotista: relatorio.total_cotista,
                                total_share_brasil: relatorio.total_share_brasil,
                                valor_total: relatorio.valor_total,
                              },
                              {
                                ...DADOS_EMPRESA,
                                // Se quiser adicionar logo personalizada:
                                // logoUrl: '/logo-sharebrasil.png'
                              }
                            );
                          }}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-green-600 hover:bg-green-700 text-white h-9 px-3"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Baixar PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}