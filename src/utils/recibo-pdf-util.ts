/* ===== Tipos ===== */
export interface EmpresaInfo {
  razaoSocial: string;
  cnpj: string;
  telefone?: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  logoUrl?: string;
  email?: string;
  inscricaoMunicipal?: string;
}

export interface PagadorInfo {
  nome: string;
  documento?: string;
}

export interface ReciboData {
  numero: string;
  dataEmissao: string | Date;
  pagador: PagadorInfo;
  itens: [];                  // não usamos itens na renderização
  observacao?: string;
  subtotal: number;           // ignorado visualmente
  desconto: number;           // ignorado visualmente
  total: number;
  referenteA?: string;        // usamos para o bloco "Referente a"
  cliente_nome?: string;
  cliente_documento?: string;
  data?: string | Date;
  descricao?: string;
  valor?: number;
  observacoes?: string;
}

/* ===== Helpers ===== */
export const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

const parseLocalDate = (input: string | Date): Date => {
  if (input instanceof Date) return input;
  if (typeof input === "string") {
    const m = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  return new Date(input);
};
const formatDateBR = (d: string | Date) => parseLocalDate(d).toLocaleDateString("pt-BR");
const formatDateLongBR = (d: string | Date) =>
  parseLocalDate(d).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });

/* ===== Valor por extenso ===== */
export function valorPorExtenso(numero: number): string {
  if (!numero || numero === 0) return "zero reais";
  const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const teens = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

  let parteInteira = Math.floor(numero);
  const centavos = Math.round((numero - parteInteira) * 100);

  if (parteInteira === 0) return centavos > 0 ? `${centavos} centavos` : "zero reais";
  let r = "";

  if (parteInteira >= 1000) {
    const milhares = Math.floor(parteInteira / 1000);
    r += `${milhares === 1 ? "mil" : `${milhares} mil`} `;
    parteInteira %= 1000;
  }
  if (parteInteira >= 100) {
    if (parteInteira === 100) { r += "cem "; parteInteira = 0; }
    else { const c = Math.floor(parteInteira / 100); r += `${centenas[c]} `; parteInteira %= 100; }
  }
  if (parteInteira >= 20) {
    const d = Math.floor(parteInteira / 10);
    r += `${dezenas[d]}`;
    parteInteira %= 10;
    if (parteInteira > 0) r += ` e ${unidades[parteInteira]}`;
    r += " ";
  } else if (parteInteira >= 10) {
    r += `${teens[parteInteira - 10]} `;
  } else if (parteInteira > 0) {
    r += `${unidades[parteInteira]} `;
  }
  r += "reais";
  if (centavos > 0) r += ` e ${centavos} centavos`;
  return r.trim();
}

/* ===== PDF (idêntico ao preview) ===== */
export function generateReciboPDF(recibo: ReciboData, empresa: EmpresaInfo) {
  try {
    const logo = empresa.logoUrl || "https://i.ibb.co/qL88CDcV/Logo-Share.png";
    const html = `
<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8" />
<title>Recibo ${recibo.numero}</title>
<style>
  @media print {
    @page { margin: 20mm; size: A4; }
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  }
  body { font-family: Arial, sans-serif; margin: 0; padding: 28px; color: #111827; }
  .container { max-width: 850px; margin: 0 auto; }
  .hdr { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 24px; }
  .title { font-weight:800; font-size:20px; margin:0; }
  .numwrap { text-align:right; }
  .numbox { display:inline-block; border:1px solid rgb(197, 217, 247); border-radius:6px; padding:8px 12px; font-weight:700; }
  .numlbl { font-size:11px; color:#6b7280; margin-top:4px; }
  .grid { display:grid; grid-template-columns: 1fr 1fr; gap:24px; margin-bottom: 20px; }
  .lbl { font-size:11px; color:#6b7280; text-transform:uppercase; margin-bottom:6px; }
  .val { font-size:14px; font-weight:700; color:#111827; }
  .muted { font-size:12px; color:#374151; }
  .sec-h { background:#f3f4f6; border:1px solid rgb(154, 186, 252); padding:10px 14px; border-radius:6px 6px 0 0; font-size:11px; font-weight:700; text-transform:uppercase; }
  .sec-b { border:1px solid #e5e7eb; border-top:0; border-radius:0 0 6px 6px; padding:14px; font-size:13px; line-height:1.6; }
  .tot { width:320px; margin-left:auto; font-size:14px; margin-top: 6px; border-top:1px solid #e5e7eb; padding-top:8px; }
  .trow { display:flex; justify-content:space-between; padding:4px 0; }
  .obs { background:#fffbeb; border:1px solid #fde68a; padding:10px 14px; border-radius:6px; font-size:13px; margin-top:12px; color:#78350f; }
  .decl { font-size:13px; margin-top:14px; line-height:1.6; }
  .sign { text-align:center; margin-top: 36px; }
  .sign-line { width: 300px; border-bottom: 1px solid #111827; margin: 10px auto; }
  .logo { height: 60px; object-fit: contain; margin: 0 auto 10px; display:block; }
  .empresa-nome { font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 4px; }
  .local-data { font-size: 12px; color: #6b7280; }
</style>
</head>
<body>
<div class="container">

  <!-- Header: título + badge com NÚMERO -->
  <div class="hdr">
    <h2 class="title">RECIBO DE PAGAMENTO</h2>
    <div class="numwrap">
      <div class="numbox">${recibo.numero || "—"}</div>
      <div class="numlbl">Número do recibo</div>
    </div>
  </div>

  <!-- Emissor / Pagador -->
  <div class="grid">
    <div>
      <div class="lbl">Emissor</div>
      <div class="val">${empresa.razaoSocial || "Empresa"}</div>
      ${empresa.cnpj ? `<div class="muted">CNPJ: ${empresa.cnpj}</div>` : ""}
      ${empresa.telefone ? `<div class="muted">Telefone: ${empresa.telefone}</div>` : ""}
      ${empresa.endereco || empresa.cidade || empresa.estado || empresa.cep ? `
        <div class="muted" style="margin-top:8px; line-height:1.4;">
          ${empresa.endereco || ""}<br>
          ${empresa.cidade || ""} - ${empresa.estado || ""}, ${empresa.cep || ""}
        </div>
      ` : ""}
      ${empresa.email ? `<div class="muted" style="margin-top:8px;">${empresa.email}</div>` : ""}
    </div>

    <div>
      <div class="lbl">Pagador</div>
      <div class="val">${recibo.cliente_nome || recibo.pagador?.nome || ""}</div>
      ${recibo.cliente_documento || recibo.pagador?.documento ? `
        <div class="muted">Documento: ${recibo.cliente_documento || recibo.pagador?.documento}</div>
      ` : ""}
      <div class="muted" style="margin-top:8px;">
        Data de emissão: ${formatDateBR(recibo.data || recibo.dataEmissao)}
      </div>
    </div>
  </div>

  <!-- Referente a (sem tabela) -->
  <div style="margin-bottom:20px;">
    <div class="sec-h">Referente a</div>
    <div class="sec-b">
      ${recibo.descricao || recibo.referenteA || "Serviços prestados"}
    </div>
  </div>

  <!-- TOTAL -->
  <div class="tot">
    <div class="trow" style="font-weight:700; border-top:2px solid #374151;">
      <span>Total:</span>
      <span>${formatCurrency(recibo.valor || recibo.total || 0)}</span>
    </div>
  </div>

  <!-- Observação -->
  ${recibo.observacoes || recibo.observacao ? `
    <div class="obs">
      <b>Observação:</b> ${recibo.observacoes || recibo.observacao}
    </div>
  ` : ""}

  <!-- Declaração -->
  <div class="decl">
    <b>Declaração:</b> Recebemos de <b>${recibo.cliente_nome || recibo.pagador?.nome || ""}</b>, a importância de
    <b>${valorPorExtenso(Number(recibo.valor || recibo.total || 0))}</b>, referente ao descrito acima. Para maior
    clareza, firmo o presente recibo para que produza seus efeitos, dando plena, geral e irrevogável
    quitação pelo valor recebido.
  </div>

  <!-- Assinatura com LOGO -->
  <div class="sign">
    <img src="${logo}" alt="Logo" class="logo" />
    <div class="sign-line"></div>
    <p class="empresa-nome">${empresa.razaoSocial || "Empresa"}</p>
    <p class="local-data">
      ${empresa.cidade || "Cidade"}, ${formatDateLongBR(recibo.data || recibo.dataEmissao)}
    </p>
  </div>

</div>
</body>
</html>
    `;

    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) {
      console.error("Não foi possível abrir a janela para impressão");
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
  }
}
