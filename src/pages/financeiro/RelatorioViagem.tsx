import React, { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import {
  Plane, Plus, Search, Eye,
  Send, Edit, FileText, Receipt, Trash2, ChevronDown, X
} from "lucide-react";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/integrations/firebase/config";
import { RelatorioPreviewLayout } from '@/components/financeiro/RelatorioPreviewLayout';
import { generateRelatorioViagemPDF } from '@/utils/generateRelatorioViagemPDF';
import { toast } from "sonner";

import { getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  runTransaction,
  getDoc,
  startAt,
  endAt,
  limit as fbLimit,
  where, // <- para auto-pre
} from "firebase/firestore";
// TYPES
export type StatusRelatorio = 'RASCUNHO' | 'SALVO' | 'ENVIADO' | 'EXCLUIDO';
type ViewMode = 'list' | 'form' | 'preview';

export interface DespesaViagem {
  id: string;
  categoria: string;
  descricao: string;
  valor: number;
  data: string; // ISO (yyyy-mm-dd)
  pago_por: 'Tripulante' | 'Cotista' | 'Share Brasil';
  comprovante_url?: string;
  comprovante_nome?: string;
  comprovante_file?: File;
}

export interface RelatorioViagem {
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
  prefixo_cotista: string;
  criado_em?: any;
  atualizado_em?: any;
  enviado_em?: any;
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
  prefixo_cotista: string;
}

interface Cotista { id: string; nome: string; email?: string; prefixo: string }
interface Aeronave { id: string; codigo: string; modelo?: string }
interface Tripulante { id: string; nome: string; email?: string; funcao?: string }

// CONSTANTES
const CATEGORIAS_DESPESA_LIST = [
  'Alimentação','Hospedagem','Transporte','Combustível',
  'Taxas Aeroportuárias','Estacionamento','Outros'
];
const PAGADORES_LIST: Array<'Tripulante' | 'Cotista' | 'Share Brasil'> = ['Tripulante','Cotista','Share Brasil'];

const DADOS_EMPRESA = {
  razaoSocial: "SHARE BRASIL SERVIÇOS AEROPORTUARIOS EIRELI",
  cnpj: "30.898.549/0001-06",
  inscricaoMunicipal: "102832",
  endereco: "Av. Presidente Artur Bernardes, 1457 - Vila Ipase",
  cidade: "Várzea Grande",
  estado: "MT",
  cep: "78125-100"
};

// AUTOCOMPLETE COMPONENT
interface AutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{id: string; nome?: string; codigo?: string; label: string;}>;
  placeholder: string;
  onSelect?: (item: any) => void;
  disabled?: boolean;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  label, value, onChange, options, placeholder, onSelect, disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      const filtered = options.filter(option => option.label.toLowerCase().includes(value.toLowerCase()));
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [value, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleOptionClick = (option: any) => {
    onChange(option.label);
    setIsOpen(false);
    onSelect?.(option);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={placeholder}
        />
        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div key={option.id || index} className="px-3 py-2 cursor-pointer hover:bg-gray-700 text-white border-b border-gray-700 last:border-b-0" onClick={() => handleOptionClick(option)}>
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-400">Nenhuma opção encontrada. Você pode digitar manualmente.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// FIREBASE REFS
const relatoriosCollectionRef = collection(db, "relatorios");
const cotistasCollectionRef = collection(db, "clientes");
const aeronavesCollectionRef = collection(db, "aeronaves");
const tripulantesCollectionRef = collection(db, "tripulacao");

const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

export default function RelatoriosViagem() {
  const [relatorioVisualizar, setRelatorioVisualizar] = useState<RelatorioViagem | null>(null);
  const [relatorios, setRelatorios] = useState<RelatorioViagem[]>([]);
  const [cotistas, setCotistas] = useState<Cotista[]>([]);
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
  const [tripulantes, setTripulantes] = useState<Tripulante[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
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
    criado_por: "Usuário Atual",
    prefixo_cotista: ""
  });

  const [novaDespesa, setNovaDespesa] = useState<Partial<DespesaViagem>>({
    data: new Date().toISOString().split("T")[0],
    categoria: "",
    descricao: "",
    valor: 0,
    pago_por: "Tripulante",
    comprovante_file: undefined
  });

  // UTILS
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date?.toDate ? date.toDate() : new Date(date);
    if (isNaN(d.getTime())) return 'Data inválida';
    const userTimezoneOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
  };

  const generateReportNumber = async (prefixoCotista: string) => {
    if (!prefixoCotista) return '';
    try {
      const qy = query(
        relatoriosCollectionRef,
        where("prefixo_cotista", "==", prefixoCotista),
        orderBy("numero", "desc"),
        limit(1)
      );
      const snapshot = await getDocs(qy);
      let proximoNumero = 1;
      if (!snapshot.empty) {
        const ultimoRelatorio: any = snapshot.docs[0].data();
        const ultimoNumero: string = ultimoRelatorio.numero;
        const match = ultimoNumero.match(/REL([A-Z]+)-(\d+)/);
        if (match) proximoNumero = parseInt(match[2]) + 1;
      }
      return `REL${prefixoCotista}-${proximoNumero.toString().padStart(3,'0')}`;
    } catch (error) {
      console.error("Erro ao gerar número do relatório:", error);
      const timestamp = Date.now().toString().slice(-6);
      return `REL${prefixoCotista}-${timestamp}`;
    }
  };

  const calcularTotaisDetalhados = () => {
    const total_tripulante = formData.despesas.reduce((sum, d) => d.pago_por === 'Tripulante' ? sum + (d.valor || 0) : sum, 0);
    const total_cotista = formData.despesas.reduce((sum, d) => d.pago_por === 'Cotista' ? sum + (d.valor || 0) : sum, 0);
    const total_share_brasil = formData.despesas.reduce((sum, d) => d.pago_por === 'Share Brasil' ? sum + (d.valor || 0) : sum, 0);
    const valor_total = total_tripulante + total_cotista + total_share_brasil;
    return { total_tripulante, total_cotista, total_share_brasil, valor_total };
  };

  const filteredRelatorios = relatorios.filter((relatorio) => {
    const matchesSearch = searchTerm === "" ||
      relatorio.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      relatorio.cotista?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      relatorio.destino?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      relatorio.tripulante?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAeronave = filterAeronave === "todas" || relatorio.aeronave === filterAeronave;
    const matchesStatus = filterStatus === "todos" || relatorio.status === filterStatus;
    return matchesSearch && matchesAeronave && matchesStatus;
  });

  const getStatusColor = (status: StatusRelatorio) => {
    switch (status) {
      case 'RASCUNHO': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'SALVO': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'ENVIADO': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

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
      criado_por: "Usuário Atual",
      prefixo_cotista: ""
    });
    setNovaDespesa({
      data: new Date().toISOString().split("T")[0],
      categoria: "",
      descricao: "",
      valor: 0,
      pago_por: "Tripulante",
      comprovante_file: undefined
    });
  };

  // === NOVO: upload do comprovante ao adicionar a despesa ===
  const uploadComprovante = async (file: File, relatorioNumero: string, despesaId: string) => {
    const path = `relatorios/${relatorioNumero || 'sem-numero'}/despesas/${despesaId}/${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return { url, nome: file.name };
  };

  const adicionarDespesa = async () => {
    if (!novaDespesa.descricao || !novaDespesa.categoria || !novaDespesa.valor || !novaDespesa.data) {
      toast.error("Preencha Data, Categoria, Descrição e Valor.");
      return;
    }

    const id = Date.now().toString();
    let comprovante_url: string | undefined;
    let comprovante_nome: string | undefined;

    try {
      if (novaDespesa.comprovante_file) {
        const uploaded = await uploadComprovante(novaDespesa.comprovante_file, formData.numero || 'novo', id);
        comprovante_url = uploaded.url;
        comprovante_nome = uploaded.nome;
      }

      const despesa: DespesaViagem = {
        id,
        categoria: novaDespesa.categoria!,
        descricao: novaDespesa.descricao!,
        valor: Number(novaDespesa.valor),
        data: novaDespesa.data!,
        pago_por: novaDespesa.pago_por!,
        comprovante_nome,
        comprovante_url
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

      toast.success("Despesa adicionada com sucesso!");
    } catch (e) {
      console.error(e);
      toast.error("Falha ao anexar comprovante. Tente novamente.");
    }
  };

  const removerDespesa = (index: number) => {
    setFormData(prev => ({ ...prev, despesas: prev.despesas.filter((_, i) => i !== index) }));
    toast.success("Despesa removida");
  };

  const handleSubmit = async () => {
    if (!formData.numero || !formData.cotista || !formData.aeronave || !formData.tripulante || !formData.destino) {
      toast.error("Preencha todos os campos obrigatórios do relatório.");
      return;
    }
    if (formData.despesas.length === 0) {
      toast.error("Adicione pelo menos uma despesa");
      return;
    }

    setIsSubmitting(true);
    try {
      const totals = calcularTotaisDetalhados();
      const relatorioData = {
        ...formData,
        ...totals,
        status: 'SALVO' as StatusRelatorio,
        criado_em: new Date(),
        atualizado_em: new Date()
      };
      await addDoc(relatoriosCollectionRef, relatorioData);
      toast.success("Relatório salvo com sucesso!");
      resetForm();
      setViewMode('list');
      loadRelatorios();
    } catch (error) {
      console.error("Erro ao salvar relatório:", error);
      toast.error("Erro ao salvar relatório");
    } finally {
      setIsSubmitting(false);
    }
  };

  // LOADERS
  const loadCotistas = async () => {
    try {
      const snapshot = await getDocs(cotistasCollectionRef);
      const data = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Cotista[];
      setCotistas(data);
    } catch (e) { console.error(e); }
  };

  const loadAeronaves = async () => {
    try {
      const snapshot = await getDocs(aeronavesCollectionRef);
      const data = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Aeronave[];
      setAeronaves(data);
    } catch (e) { console.error(e); }
  };

  const loadTripulantes = async () => {
    try {
      const snapshot = await getDocs(tripulantesCollectionRef);
      const data = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Tripulante[];
      setTripulantes(data);
    } catch (e) { console.error(e); }
  };

  const loadRelatorios = async () => {
    try {
      const snapshot = await getDocs(relatoriosCollectionRef);
      const data = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as RelatorioViagem[];
      setRelatorios(data.sort((a, b) => {
        const ad = a.criado_em?.toDate ? a.criado_em.toDate().getTime() : new Date(a.criado_em || 0).getTime();
        const bd = b.criado_em?.toDate ? b.criado_em.toDate().getTime() : new Date(b.criado_em || 0).getTime();
        return bd - ad;
      }));
    } catch (e) {
      console.error("Erro ao carregar relatórios", e);
      toast.error("Erro ao carregar relatórios");
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      await Promise.all([loadRelatorios(), loadCotistas(), loadAeronaves(), loadTripulantes()]);
      setLoading(false);
    };
    bootstrap();
  }, []);

  const iniciarNovoRelatorio = () => {
    resetForm();
    setViewMode('form');
  };

  const handleCotistaSelect = async (cotista: Cotista) => {
    const numero = await generateReportNumber(cotista.prefixo);
    setFormData(prev => ({ ...prev, cotista: cotista.nome, prefixo_cotista: cotista.prefixo, numero }));
  };

  const cotistasOptions = cotistas.map(c => ({ id: c.id, label: c.nome, ...c }));
  const aeronavesOptions = aeronaves.map(a => ({ id: a.id, label: `${a.codigo}${a.modelo ? ` - ${a.modelo}` : ''}`, ...a }));
  const tripulantesOptions = tripulantes.map(t => ({ id: t.id, label: `${t.nome}${t.funcao ? ` - ${t.funcao}` : ''}`, ...t }));

  return (
    <Layout>
      <div className="p-6">
        {viewMode === 'preview' ? (
          <RelatorioPreviewLayout
            dadosEmpresa={DADOS_EMPRESA}
            formData={formData}
            totals={calcularTotaisDetalhados()}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            setViewMode={setViewMode}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        ) : viewMode === 'form' ? (
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-6">
              <Plane className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">{formData.numero ? `Editando Relatório #${formData.numero}` : 'Novo Relatório de Viagem'}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Número do Relatório</label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Será gerado automaticamente"
                  readOnly
                />
              </div>

              <Autocomplete
                label="Cotista"
                value={formData.cotista}
                onChange={(value) => setFormData(prev => ({ ...prev, cotista: value }))}
                options={cotistasOptions}
                placeholder="Digite o nome do cotista"
                onSelect={handleCotistaSelect}
              />

              <Autocomplete
                label="Aeronave"
                value={formData.aeronave}
                onChange={(value) => setFormData(prev => ({ ...prev, aeronave: value }))}
                options={aeronavesOptions}
                placeholder="Digite o código da aeronave"
              />

              <Autocomplete
                label="Tripulante"
                value={formData.tripulante}
                onChange={(value) => setFormData(prev => ({ ...prev, tripulante: value }))}
                options={tripulantesOptions}
                placeholder="Digite o nome do tripulante"
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Destino</label>
                <input
                  type="text"
                  value={formData.destino}
                  onChange={(e) => setFormData(prev => ({ ...prev, destino: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Cidade de destino"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Data Início</label>
                <input
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Data Fim</label>
                <input
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* NOVA DESPESA */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-green-400" />
                Adicionar Nova Despesa
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Data</label>
                  <input
                    type="date"
                    value={novaDespesa.data || ''}
                    onChange={(e) => setNovaDespesa(prev => ({ ...prev, data: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
                  <select
                    value={novaDespesa.categoria || ''}
                    onChange={(e) => setNovaDespesa(prev => ({ ...prev, categoria: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    {CATEGORIAS_DESPESA_LIST.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Pago Por</label>
                  <select
                    value={novaDespesa.pago_por || 'Tripulante'}
                    onChange={(e) => setNovaDespesa(prev => ({ ...prev, pago_por: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PAGADORES_LIST.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={Number(novaDespesa.valor) || 0}
                    onChange={(e) => setNovaDespesa(prev => ({ ...prev, valor: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                  <input
                    type="text"
                    value={novaDespesa.descricao || ''}
                    onChange={(e) => setNovaDespesa(prev => ({ ...prev, descricao: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição da despesa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Comprovante</label>
                  <input
                    type="file"
                    onChange={(e) => setNovaDespesa(prev => ({ ...prev, comprovante_file: e.target.files?.[0] }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-gray-600 file:text-white hover:file:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept="image/*,.pdf"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={adicionarDespesa}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Despesa
              </button>
            </div>

            {/* LISTA DE DESPESAS */}
            {formData.despesas.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Despesas Adicionadas ({formData.despesas.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-600">
                      <tr className="text-gray-400">
                        <th className="p-3">Data</th>
                        <th className="p-3">Categoria</th>
                        <th className="p-3">Descrição</th>
                        <th className="p-3">Pago Por</th>
                        <th className="p-3">Comprovante</th>
                        <th className="p-3 text-right">Valor</th>
                        <th className="p-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.despesas.map((d, index) => (
                        <tr key={d.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                          <td className="p-3 text-gray-300">{formatDate(d.data)}</td>
                          <td className="p-3 text-gray-300">{d.categoria}</td>
                          <td className="p-3 text-white">{d.descricao}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              d.pago_por === 'Tripulante' ? 'bg-blue-500/20 text-blue-400' :
                              d.pago_por === 'Cotista' ? 'bg-green-500/20 text-green-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {d.pago_por}
                            </span>
                          </td>
                          <td className="p-3 text-gray-300">
                            {d.comprovante_url ? (
                              <a href={d.comprovante_url} target="_blank" rel="noreferrer" className="underline text-blue-300">abrir</a>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-medium text-green-400">{formatCurrency(d.valor)}</td>
                          <td className="p-3 text-center">
                            <button onClick={() => removerDespesa(index)} className="text-red-400 hover:text-red-300 p-1" title="Remover despesa">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-white">Total Geral:</span>
                    <span className="text-cyan-400">{formatCurrency(calcularTotaisDetalhados().valor_total)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* OBSERVAÇÕES */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Observações</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Observações adicionais sobre a viagem..."
              />
            </div>

            {/* AÇÕES */}
            <div className="flex gap-4 justify-end">
              <button type="button" onClick={() => setViewMode('list')} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">Cancelar</button>
              <button type="button" onClick={() => setViewMode('preview')} disabled={formData.despesas.length === 0} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2">
                <Eye className="w-4 h-4" /> Pré-visualizar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* MODAL VISUALIZAR */}
            {relatorioVisualizar && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
                  <button onClick={() => setRelatorioVisualizar(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
                    <X className="w-6 h-6" />
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

            {/* HEADER LISTA */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Plane className="w-8 h-8 text-blue-400" />
                <h1 className="text-2xl font-bold text-white">Relatórios de Viagem</h1>
              </div>
              <button onClick={iniciarNovoRelatorio} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white h-10 px-4">
                <Plus className="w-4 h-4 mr-2" /> Novo Relatório
              </button>
            </div>

            {/* FILTROS */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar por número, cotista, destino ou tripulante..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <select value={filterAeronave} onChange={(e) => setFilterAeronave(e.target.value)} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="todas">Todas as Aeronaves</option>
                  {aeronaves.map(a => (<option key={a.id} value={a.codigo}>{a.codigo}</option>))}
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="todos">Todos os Status</option>
                  <option value="RASCUNHO">Rascunho</option>
                  <option value="SALVO">Salvo</option>
                  <option value="ENVIADO">Enviado</option>
                </select>
              </div>
            </div>

            {/* LISTA */}
            {loading ? (
              <div className="text-center py-10"><div className="text-white">Carregando...</div></div>
            ) : (
              <div className="space-y-4">
                {filteredRelatorios.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">Nenhum relatório encontrado</div>
                ) : (
                  filteredRelatorios.map((relatorio) => (
                    <div key={relatorio.id} className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">Relatório #{relatorio.numero}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(relatorio.status)}`}>{relatorio.status}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-300">
                            <div><strong>Cotista:</strong> {relatorio.cotista}</div>
                            <div><strong>Aeronave:</strong> {relatorio.aeronave}</div>
                            <div><strong>Destino:</strong> {relatorio.destino}</div>
                            <div><strong>Tripulante:</strong> {relatorio.tripulante}</div>
                            <div><strong>Período:</strong> {formatDate(relatorio.data_inicio)} a {formatDate(relatorio.data_fim)}</div>
                            <div><strong>Total:</strong> {formatCurrency(relatorio.valor_total)}</div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4 md:mt-0">
                          <button onClick={() => setRelatorioVisualizar(relatorio)} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white h-9 px-3">
                            <Eye className="w-4 h-4 mr-2" /> Ver
                          </button>

                          {(relatorio.status === 'RASCUNHO' || relatorio.status === 'SALVO') && (
                            <button
                              onClick={() => {
                                setFormData({
                                  numero: relatorio.numero,
                                  cotista: relatorio.cotista,
                                  aeronave: relatorio.aeronave,
                                  tripulante: relatorio.tripulante,
                                  destino: relatorio.destino,
                                  data_inicio: relatorio.data_inicio?.toDate ? relatorio.data_inicio.toDate().toISOString().split('T')[0] : relatorio.data_inicio,
                                  data_fim: relatorio.data_fim?.toDate ? relatorio.data_fim.toDate().toISOString().split('T')[0] : relatorio.data_fim,
                                  despesas: relatorio.despesas,
                                  observacoes: relatorio.observacoes,
                                  criado_por: relatorio.criado_por,
                                  prefixo_cotista: relatorio.prefixo_cotista
                                });
                                setViewMode('form');
                              }}
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-yellow-600 hover:bg-yellow-700 text-white h-9 px-3"
                            >
                              <Edit className="w-4 h-4 mr-2" /> Editar
                            </button>
                          )}

                          {relatorio.status === 'SALVO' && (
                            <button
                              onClick={async () => {
                                try {
                                  const docRef = doc(db, "relatorios", relatorio.id);
                                  await updateDoc(docRef, { status: 'ENVIADO', atualizado_em: new Date(), enviado_em: new Date() });
                                  toast.success("Relatório enviado com sucesso!");
                                  loadRelatorios();
                                } catch (error) {
                                  console.error("Erro ao enviar relatório:", error);
                                  toast.error("Erro ao enviar relatório");
                                }
                              }}
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-green-600 hover:bg-green-700 text-white h-9 px-3"
                            >
                              <Send className="w-4 h-4 mr-2" /> Enviar
                            </button>
                          )}

                          {relatorio.status === 'ENVIADO' && (
                            <button
                              onClick={async () => {
                                try {
                                  await generateRelatorioViagemPDF(relatorio, {
                                    total_tripulante: relatorio.total_tripulante,
                                    total_cotista: relatorio.total_cotista,
                                    total_share_brasil: relatorio.total_share_brasil,
                                    valor_total: relatorio.valor_total,
                                  }, DADOS_EMPRESA);
                                } catch (error) {
                                  console.error("Erro ao gerar PDF:", error);
                                  toast.error("Erro ao gerar PDF");
                                }
                              }}
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-purple-600 hover:bg-purple-700 text-white h-9 px-3"
                            >
                              <FileText className="w-4 h-4 mr-2" /> Baixar PDF
                            </button>
                          )}

                          {relatorio.status === 'RASCUNHO' && (
                            <button
                              onClick={async () => {
                                if (confirm("Tem certeza que deseja excluir este relatório?")) {
                                  try {
                                    const docRef = doc(db, "relatorios", relatorio.id);
                                    await updateDoc(docRef, { status: 'EXCLUIDO', excluido_em: new Date() });
                                    toast.success("Relatório excluído com sucesso!");
                                    loadRelatorios();
                                  } catch (error) {
                                    console.error("Erro ao excluir relatório:", error);
                                    toast.error("Erro ao excluir relatório");
                                  }
                                }
                              }}
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-red-600 hover:bg-red-700 text-white h-9 px-3"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Excluir
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
