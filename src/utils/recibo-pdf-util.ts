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
  .numbox { display:inline-block; border:1px solid #d1d5db; border-radius:6px; padding:8px 12px; font-weight:700; }
  .numlbl { font-size:11px; color:#6b7280; margin-top:4px; }
  .grid { display:grid; grid-template-columns: 1fr 1fr; gap:24px; margin-bottom: 20px; }
  .lbl { font-size:11px; color:#6b7280; text-transform:uppercase; margin-bottom:6px; }
  .val { font-size:14px; font-weight:700; color:#111827; }
  .muted { font-size:12px; color:#374151; }
  .sec-h { background:#f3f4f6; border:1px solid #e5e7eb; padding:10px 14px; border-radius:6px 6px 0 0; font-size:11px; font-weight:700; text-transform:uppercase; }
  .sec-b { border:1px solid #e5e7eb; border-top:0; border-radius:0 0 6px 6px; padding:14px; font-size:13px; line-height:1.6; }
  .tot { width:320px; margin-left:auto; font-size:14px; margin-top: 6px; border-top:1px solid #e5e7eb; padding-top:8px; }
  .trow { display:flex; justify-content:space-between; padding:4px 0; }
  .obs { background:#fffbeb; border:1px solid #fde68a; padding:10px 14px; border-radius:6px; font-size:13px; margin-top:12px; color:#78350f; }
  .decl { font-size:13px; margin-top:14px; }
  .sign { text-align:center; margin-top: 36px; }
  .sign-line { width: 300px; border-bottom: 1px solid #111827; margin: 10px auto; }
  .logo { height: 48px; object-fit: contain; margin: 0 auto 6px; display:block; }
</style>
</head>
<body>
<div class="container">

  <div class="hdr">
    <h1 class="title">RECIBO DE PAGAMENTO</h1>
    <div class="numwrap">
      <div class="numbox">${recibo.numero}</div>
      <div class="numlbl">Número do recibo</div>
    </div>
  </div>

  <div class="grid">
    <div>
      <div class="lbl">Emissor</div>
      <div class="val">${empresa.razaoSocial}</div>
      ${empresa.cnpj ? `<div class="muted">CNPJ: ${empresa.cnpj}</div>` : ``}
      ${empresa.telefone ? `<div class="muted">/ ${empresa.telefone}</div>` : ``}
      <div class="muted" style="margin-top:6px">
        ${empresa.endereco}<br/>${empresa.cidade} - ${empresa.estado}, ${empresa.cep}
      </div>
      ${empresa.email ? `<div class="muted" style="margin-top:6px">${empresa.email}</div>` : ``}
    </div>
    <div>
      <div class="lbl">Pagador</div>
      <div class="val">${recibo.pagador?.nome || ""}</div>
      ${recibo.pagador?.documento ? `<div class="muted">CNPJ: ${recibo.pagador.documento}</div>` : ``}
      <div class="muted" style="margin-top:6px">Data de emissão: ${formatDateBR(recibo.dataEmissao)}</div>
    </div>
  </div>

  <div class="sec-h">Referente a</div>
  <div class="sec-b">${recibo.referenteA || ""}</div>

  <div class="tot">
    <div class="trow"><div><b>Total:</b></div><div><b>${formatCurrency(recibo.total)}</b></div></div>
  </div>

  ${recibo.observacao ? `<div class="obs"><b>Observação:</b> ${recibo.observacao}</div>` : ``}

  <div class="decl">
    <b>Declaração:</b> Recebemos de <b>${recibo.pagador?.nome || ""}</b>, a importância de
    <b>${valorPorExtenso(Number(recibo.total || 0))}</b>, referente ao descrito acima. Para maior clareza,
    firmo o presente recibo para que produza seus efeitos, dando plena, geral e irrevogável quitação pelo valor recebido.
  </div>

  <div class="sign">
    <img class="logo" src="${logo}" alt="Logo" />
    <div class="sign-line"></div>
    <div class="muted" style="font-weight:600">${empresa.razaoSocial}</div>
    <div class="muted">${empresa.cidade}, ${formatDateLongBR(recibo.dataEmissao)}</div>
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
