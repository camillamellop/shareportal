import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Building, Save, FileText, Upload, FileImage } from "lucide-react";
import { useState } from "react";

export default function ConfigEmpresa() {
  const [companyData, setCompanyData] = useState({
    razaoSocial: "Aviation Solutions Ltda",
    nomeFantasia: "Aviation Solutions",
    cnpj: "12.345.678/0001-90",
    ie: "123.456.789.123",
    endereco: "Av. das Américas, 1000",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    cep: "22640-100",
    telefone: "(21) 3333-4444",
    email: "contato@aviationsolutions.com.br",
    website: "https://www.aviationsolutions.com.br",
    atividade: "Aviação Executiva",
    observacoes: "Empresa especializada em aviação executiva e serviços aeroportuários"
  });

  const [logoPreview, setLogoPreview] = useState<string>("");

  const handleInputChange = (field: string, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configuração da Empresa</h1>
            <p className="text-muted-foreground mt-2">
              Configure os dados da empresa que aparecerão nos recibos e relatórios
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Configurações
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
                {logoPreview ? (
                  <div className="w-32 h-32 border border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    <img 
                      src={logoPreview} 
                      alt="Logo da empresa" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted">
                    <div className="text-center">
                      <Building className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Sem logo</p>
                    </div>
                  </div>
                )}
                
                <div className="w-full">
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 p-2 border border-border rounded-lg hover:bg-muted transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Escolher Logo</span>
                    </div>
                  </Label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  Formatos aceitos: PNG, JPG, JPEG<br/>
                  Tamanho recomendado: 300x300px
                </p>
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="razao-social">Razão Social</Label>
                  <Input 
                    id="razao-social" 
                    value={companyData.razaoSocial}
                    onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome-fantasia">Nome Fantasia</Label>
                  <Input 
                    id="nome-fantasia" 
                    value={companyData.nomeFantasia}
                    onChange={(e) => handleInputChange('nomeFantasia', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input 
                      id="cnpj" 
                      value={companyData.cnpj}
                      onChange={(e) => handleInputChange('cnpj', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ie">Inscrição Estadual</Label>
                    <Input 
                      id="ie" 
                      value={companyData.ie}
                      onChange={(e) => handleInputChange('ie', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input 
                    id="endereco" 
                    value={companyData.endereco}
                    onChange={(e) => handleInputChange('endereco', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input 
                      id="cidade" 
                      value={companyData.cidade}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input 
                      id="estado" 
                      value={companyData.estado}
                      onChange={(e) => handleInputChange('estado', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input 
                      id="cep" 
                      value={companyData.cep}
                      onChange={(e) => handleInputChange('cep', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informações Adicionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input 
                      id="telefone" 
                      value={companyData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={companyData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    value={companyData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="atividade">Atividade Principal</Label>
                  <Input 
                    id="atividade" 
                    value={companyData.atividade}
                    onChange={(e) => handleInputChange('atividade', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea 
                    id="observacoes" 
                    value={companyData.observacoes}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview do Cabeçalho */}
            <Card>
              <CardHeader>
                <CardTitle>Preview do Cabeçalho dos Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-border rounded-lg p-6 bg-background">
                  <div className="flex items-start gap-4">
                    {logoPreview && (
                      <div className="w-16 h-16 flex-shrink-0">
                        <img 
                          src={logoPreview} 
                          alt="Logo" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">{companyData.razaoSocial}</h3>
                      <p className="text-sm text-muted-foreground">{companyData.nomeFantasia}</p>
                      <p className="text-sm text-muted-foreground">CNPJ: {companyData.cnpj}</p>
                      <p className="text-sm text-muted-foreground">IE: {companyData.ie}</p>
                      <p className="text-sm text-muted-foreground">
                        {companyData.endereco}, {companyData.cidade} - {companyData.estado}, {companyData.cep}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tel: {companyData.telefone} | Email: {companyData.email}
                      </p>
                      {companyData.website && (
                        <p className="text-sm text-muted-foreground">
                          Site: {companyData.website}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Este cabeçalho aparecerá nos recibos, relatórios de viagem e cobranças
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}