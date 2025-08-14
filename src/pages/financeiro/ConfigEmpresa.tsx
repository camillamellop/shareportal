import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Building, Save, FileText, Upload, FileImage, Eye, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { empresaService, ConfigEmpresa as IConfigEmpresa } from "@/services/empresaService";

// Usando interface do serviço

export default function ConfigEmpresa() {
  const [companyData, setCompanyData] = useState<IConfigEmpresa>({
    razaoSocial: "SHARE BRASIL SERVIÇOS AEROPORTUARIOS EIRELI",
    cnpj: "30.898.549/0001-06",
    inscricaoMunicipal: "102832",
    endereco: "Av. Presidente Artur Bernardes, 1457 - Vila Ipase",
    cidade: "Várzea Grande",
    estado: "MT",
    cep: "78125-100",
    telefone: "",
    email: "",
    website: "",
    observacoes: "Empresa especializada em serviços aeroportuários e aviação executiva"
  });

  const [logoPreview, setLogoPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadCompanyConfig();
  }, []);

  const loadCompanyConfig = async () => {
    try {
      const config = await empresaService.getConfig();
      if (config) {
        setCompanyData(config);
        if (config.logo) {
          setLogoPreview(config.logo);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast.error('Erro ao carregar configuração da empresa');
    }
  };

  const handleInputChange = (field: keyof IConfigEmpresa, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
    setSaved(false);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      
      // Upload da logo para o Firebase Storage
      const logoUrl = await empresaService.uploadLogo(file);
      
      setLogoPreview(logoUrl);
      setCompanyData(prev => ({ ...prev, logo: logoUrl }));
      setSaved(false);
      
      toast.success('Logo carregada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer upload da logo:', error);
      toast.error(error.message || 'Erro ao fazer upload da logo');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validar campos obrigatórios
      if (!companyData.razaoSocial || !companyData.cnpj || !companyData.endereco || !companyData.cidade || !companyData.estado) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }
      
      await empresaService.saveConfig(companyData);
      
      setSaved(true);
      toast.success('Configurações da empresa salvas com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatCEP = (cep: string) => {
    return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configuração da Empresa</h1>
            <p className="text-muted-foreground mt-2">
              Configure os dados da empresa que aparecerão nos cabeçalhos dos recibos, relatórios e documentos
            </p>
            {saved && (
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Configurações salvas</span>
              </div>
            )}
          </div>
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logo da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                Logo da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                {logoPreview || companyData.logo ? (
                  <div className="w-40 h-32 border border-border rounded-lg overflow-hidden bg-white flex items-center justify-center p-2">
                    <img 
                      src={logoPreview || companyData.logo} 
                      alt="Logo da Share Brasil" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-40 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted">
                    <div className="text-center">
                      <Building className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Logo da Share Brasil</p>
                    </div>
                  </div>
                )}
                
                <div className="w-full">
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Selecionar Logo</span>
                    </div>
                  </Label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </div>
                
                <div className="text-xs text-muted-foreground text-center space-y-1">
                  <p>Formatos: PNG, JPG, JPEG</p>
                  <p>Tamanho máximo: 2MB</p>
                  <p>Recomendado: 400x200px</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados da Empresa */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Dados da Empresa
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Informações que aparecerão no cabeçalho dos documentos
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="razaoSocial">Razão Social *</Label>
                  <Input
                    id="razaoSocial"
                    value={companyData.razaoSocial ?? ""}
                    onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
                    placeholder="Razão social da empresa"
                    className="font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      value={companyData.cnpj ?? ""}
                      onChange={(e) => handleInputChange('cnpj', e.target.value)}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inscricaoMunicipal">Inscrição Municipal</Label>
                    <Input
                      id="inscricaoMunicipal"
                      value={companyData.inscricaoMunicipal ?? ""}
                      onChange={(e) => handleInputChange('inscricaoMunicipal', e.target.value)}
                      placeholder="Número da inscrição municipal"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço Completo *</Label>
                  <Input
                    id="endereco"
                    value={companyData.endereco ?? ""}
                    onChange={(e) => handleInputChange('endereco', e.target.value)}
                    placeholder="Rua, número, bairro"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      value={companyData.cidade ?? ""}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                      placeholder="Cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado *</Label>
                    <Input
                      id="estado"
                      value={companyData.estado ?? ""}
                      onChange={(e) => handleInputChange('estado', e.target.value)}
                      placeholder="UF"
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={companyData.cep ?? ""}
                      onChange={(e) => handleInputChange('cep', e.target.value)}
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Informações opcionais para documentos
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={companyData.telefone ?? ""}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="(00) 0000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companyData.email ?? ""}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contato@empresa.com.br"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={companyData.website ?? ""}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.empresa.com.br"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={companyData.observacoes ?? ""}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                    placeholder="Informações adicionais sobre a empresa..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview do Cabeçalho */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Pré-visualização do Cabeçalho
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Como aparecerá nos recibos, relatórios e documentos
            </p>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">
                    {companyData.razaoSocial}
                  </h2>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>CNPJ:</strong> {companyData.cnpj} {companyData.inscricaoMunicipal && `• Inscrição Municipal: ${companyData.inscricaoMunicipal}`}</p>
                    <p><strong>Endereço:</strong> {companyData.endereco}, {companyData.cidade} - {companyData.estado}, {companyData.cep}</p>
                    {(companyData.telefone || companyData.email || companyData.website) && (
                      <p>
                        {companyData.telefone && `Tel: ${companyData.telefone}`}
                        {companyData.telefone && companyData.email && ' • '}
                        {companyData.email && `E-mail: ${companyData.email}`}
                        {(companyData.telefone || companyData.email) && companyData.website && ' • '}
                        {companyData.website && `Site: ${companyData.website}`}
                      </p>
                    )}
                  </div>
                </div>
                
                {(logoPreview || companyData.logo) && (
                  <div className="ml-4 flex-shrink-0">
                    <img 
                      src={logoPreview || companyData.logo} 
                      alt="Logo" 
                      className="h-16 w-auto object-contain"
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Este cabeçalho será usado em todos os documentos gerados pelo sistema
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
