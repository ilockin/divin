// ERP / production / finance mock data for DivinArte admin

export const SUPPLIERS = [
  { id: "s1", name: "Botanical PT" },
  { id: "s2", name: "EssênciasIbéria" },
  { id: "s3", name: "VidroPak" },
  { id: "s4", name: "Granel Bio" },
  { id: "s5", name: "Apicultor do Vale" },
];

export const INSUMO_CATEGORIES = [
  "Óleos vegetais", "Manteigas", "Ceras", "Essenciais", "Hidrolatos",
  "Ativos", "Conservantes", "Embalagem", "Rótulos", "Outros",
];

export const INSUMO_UNITS = ["g", "ml", "un", "kg"];

// 14 insumos with realistic data
export const initialInsumos = [
  { id: "i01", name: "Óleo de jojoba",           category: "Óleos vegetais", unit: "ml", supplierId: "s1", cost: 0.024, stock: 4500, minStock: 1000 },
  { id: "i02", name: "Óleo de amêndoa doce",     category: "Óleos vegetais", unit: "ml", supplierId: "s1", cost: 0.011, stock: 6000, minStock: 1500 },
  { id: "i03", name: "Manteiga de karité bio",   category: "Manteigas",      unit: "g",  supplierId: "s4", cost: 0.018, stock: 3200, minStock: 1000 },
  { id: "i04", name: "Manteiga de murumuru",     category: "Manteigas",      unit: "g",  supplierId: "s4", cost: 0.029, stock: 800,  minStock: 500 },
  { id: "i05", name: "Cera de abelha",           category: "Ceras",          unit: "g",  supplierId: "s5", cost: 0.022, stock: 1200, minStock: 600 },
  { id: "i06", name: "Óleo essencial lavanda",   category: "Essenciais",     unit: "ml", supplierId: "s2", cost: 0.380, stock: 350,  minStock: 100 },
  { id: "i07", name: "Óleo essencial eucalipto", category: "Essenciais",     unit: "ml", supplierId: "s2", cost: 0.260, stock: 240,  minStock: 80 },
  { id: "i08", name: "Óleo essencial hortelã",   category: "Essenciais",     unit: "ml", supplierId: "s2", cost: 0.290, stock: 60,   minStock: 80 },
  { id: "i09", name: "Hidrolato de rosa",        category: "Hidrolatos",     unit: "ml", supplierId: "s1", cost: 0.045, stock: 5000, minStock: 1500 },
  { id: "i10", name: "Vitamina C estabilizada",  category: "Ativos",         unit: "g",  supplierId: "s4", cost: 0.180, stock: 120,  minStock: 50 },
  { id: "i11", name: "Conservante natural",      category: "Conservantes",   unit: "ml", supplierId: "s4", cost: 0.062, stock: 480,  minStock: 200 },
  { id: "i12", name: "Frasco de vidro âmbar 100ml", category: "Embalagem",   unit: "un", supplierId: "s3", cost: 1.10,  stock: 240,  minStock: 80 },
  { id: "i13", name: "Boião alumínio 50ml",      category: "Embalagem",      unit: "un", supplierId: "s3", cost: 0.85,  stock: 18,   minStock: 50 },
  { id: "i14", name: "Rótulo adesivo padrão",    category: "Rótulos",        unit: "un", supplierId: "s3", cost: 0.18,  stock: 1200, minStock: 300 },
];

// Ficha técnica by productId — only some products have one initially
export const initialRecipes = {
  p01: { // Spray Sono e Ansiedade (100ml)
    updatedAt: "2025-10-12T10:00:00",
    lines: [
      { id: "r1", insumoId: "i09", qty: 85, unit: "ml" },   // hidrolato
      { id: "r2", insumoId: "i06", qty: 8,  unit: "ml" },   // lavanda
      { id: "r3", insumoId: "i11", qty: 5,  unit: "ml" },   // conservante
      { id: "r4", insumoId: "i12", qty: 1,  unit: "un" },   // frasco 100ml
      { id: "r5", insumoId: "i14", qty: 1,  unit: "un" },   // rótulo
    ],
  },
  p04: { // Manteiga Corporal Vegana (100ml)
    updatedAt: "2025-10-20T15:30:00",
    lines: [
      { id: "r1", insumoId: "i03", qty: 50, unit: "g" },
      { id: "r2", insumoId: "i04", qty: 25, unit: "g" },
      { id: "r3", insumoId: "i02", qty: 20, unit: "ml" },
      { id: "r4", insumoId: "i11", qty: 2,  unit: "ml" },
      { id: "r5", insumoId: "i13", qty: 1,  unit: "un" },
      { id: "r6", insumoId: "i14", qty: 1,  unit: "un" },
    ],
  },
  p06: { // Creme Facial Calmante (50ml) — uses jojoba + karité + rose
    updatedAt: "2025-10-22T11:00:00",
    lines: [
      { id: "r1", insumoId: "i01", qty: 20, unit: "ml" },
      { id: "r2", insumoId: "i03", qty: 15, unit: "g" },
      { id: "r3", insumoId: "i09", qty: 10, unit: "ml" },
      { id: "r4", insumoId: "i11", qty: 2,  unit: "ml" },
      { id: "r5", insumoId: "i13", qty: 1,  unit: "un" },
      { id: "r6", insumoId: "i14", qty: 1,  unit: "un" },
    ],
  },
};

// ---------- Cálculo de custos (puros — recebem os insumos do estado) ----------
export const getInsumo = (insumos, id) => insumos.find((i) => i.id === id);

// custo de uma linha da ficha técnica = custo unitário do insumo × quantidade
export const lineCost = (line, insumos) => {
  const ins = getInsumo(insumos, line.insumoId);
  return ins ? ins.cost * line.qty : 0;
};

// custo total de produção de uma ficha técnica (um produto)
export const recipeCost = (recipe, insumos) =>
  recipe ? recipe.lines.reduce((sum, l) => sum + lineCost(l, insumos), 0) : 0;

// margem face ao preço de venda — devolve { custo, margemEur, margemPct }
export const recipeMargin = (recipe, insumos, price) => {
  const custo = recipeCost(recipe, insumos);
  const margemEur = (price || 0) - custo;
  const margemPct = price ? (margemEur / price) * 100 : 0;
  return { custo, margemEur, margemPct };
};

// total de uma compra de insumos = soma de (quantidade × custo) das linhas
export const purchaseTotal = (purchase) =>
  (purchase?.lines || []).reduce((sum, l) => sum + (l.qty || 0) * (l.cost || 0), 0);

// ---------- Production orders ----------
export const PRODUCTION_STATES = [
  { id: "planeada", label: "Planeada", tone: "muted" },
  { id: "em_producao", label: "Em produção", tone: "amber" },
  { id: "concluida", label: "Concluída", tone: "green" },
  { id: "cancelada", label: "Cancelada", tone: "red" },
];

export const initialProductionOrders = [
  { id: "OP-2025-018", productId: "p01", qty: 80, status: "concluida", date: "2025-10-22", notes: "Lote regular Outono" },
  { id: "OP-2025-019", productId: "p04", qty: 60, status: "em_producao", date: "2025-10-28", notes: "" },
  { id: "OP-2025-020", productId: "p06", qty: 40, status: "planeada", date: "2025-11-05", notes: "Preparar para Black Friday" },
  { id: "OP-2025-021", productId: "p01", qty: 100, status: "planeada", date: "2025-11-12", notes: "" },
];

// ---------- Purchases (compras de insumos) ----------
export const PURCHASE_STATES = [
  { id: "rascunho", label: "Rascunho", tone: "muted" },
  { id: "encomendada", label: "Encomendada", tone: "amber" },
  { id: "recebida", label: "Recebida", tone: "green" },
  { id: "cancelada", label: "Cancelada", tone: "red" },
];

export const initialPurchases = [
  { id: "CP-2025-041", supplierId: "s1", date: "2025-10-08", status: "recebida",
    lines: [
      { insumoId: "i01", qty: 2000, cost: 0.024 },
      { insumoId: "i02", qty: 3000, cost: 0.011 },
      { insumoId: "i09", qty: 2500, cost: 0.045 },
    ] },
  { id: "CP-2025-042", supplierId: "s2", date: "2025-10-15", status: "recebida",
    lines: [
      { insumoId: "i06", qty: 250, cost: 0.380 },
      { insumoId: "i07", qty: 150, cost: 0.260 },
    ] },
  { id: "CP-2025-043", supplierId: "s3", date: "2025-10-21", status: "encomendada",
    lines: [
      { insumoId: "i12", qty: 200, cost: 1.10 },
      { insumoId: "i13", qty: 100, cost: 0.85 },
      { insumoId: "i14", qty: 1000, cost: 0.18 },
    ] },
  { id: "CP-2025-044", supplierId: "s4", date: "2025-10-26", status: "rascunho",
    lines: [
      { insumoId: "i03", qty: 1500, cost: 0.018 },
      { insumoId: "i10", qty: 100, cost: 0.180 },
    ] },
];

// ---------- Finance series ----------
export const financeSeries = [
  { month: "Mai", receita: 4800, custos: 1700 },
  { month: "Jun", receita: 5200, custos: 1850 },
  { month: "Jul", receita: 5700, custos: 1980 },
  { month: "Ago", receita: 6100, custos: 2120 },
  { month: "Set", receita: 6650, custos: 2310 },
  { month: "Out", receita: 7400, custos: 2580 },
];

export const costBreakdown = [
  { name: "Insumos", value: 56 },
  { name: "Embalagem", value: 18 },
  { name: "Envios", value: 14 },
  { name: "Marketing", value: 8 },
  { name: "Outros", value: 4 },
];

// ---------- Shipping methods (now CRUD) ----------
export const initialShippingMethods = [
  { id: "sm1", name: "CTT Normal",          description: "Entrega standard pela CTT.",          cost: 4.9,  eta: "2-3 dias úteis",  zones: "Portugal Continental", active: true },
  { id: "sm2", name: "CTT Expresso",        description: "Entrega no dia útil seguinte.",       cost: 7.9,  eta: "1 dia útil",       zones: "Portugal Continental", active: true },
  { id: "sm3", name: "Recolha na loja",     description: "Levantamento gratuito no atelier.",   cost: 0,    eta: "Disponível em 24h", zones: "Porto",               active: true },
  { id: "sm4", name: "Envio Ilhas",         description: "Para Madeira e Açores via CTT.",      cost: 9.9,  eta: "5-7 dias úteis",   zones: "Madeira, Açores",      active: false },
];

// ---------- Gestão de Envios (Prompt 2B) ----------
// Zonas por país — métodos disponíveis + override de custo/prazo por método
export const initialShippingZones = [
  { id: "z-pt",  name: "Portugal",         active: true,  methodIds: ["sm1", "sm2", "sm3"], overrides: {} },
  { id: "z-es",  name: "Espanha",          active: true,  methodIds: ["sm1", "sm2"],        overrides: { sm1: { cost: 7.9, eta: "4-6 dias úteis" } } },
  { id: "z-eu",  name: "Resto da Europa",  active: true,  methodIds: ["sm1"],               overrides: { sm1: { cost: 12.9, eta: "5-8 dias úteis" } } },
  { id: "z-int", name: "Internacional",    active: false, methodIds: ["sm1"],               overrides: { sm1: { cost: 19.9, eta: "7-15 dias úteis" } } },
];

// 18 distritos de Portugal Continental + Madeira + Açores
export const PT_DISTRICTS = [
  "Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco", "Coimbra", "Évora", "Faro",
  "Guarda", "Leiria", "Lisboa", "Portalegre", "Porto", "Santarém", "Setúbal",
  "Viana do Castelo", "Vila Real", "Viseu", "Madeira", "Açores",
];

// Comunidades autónomas de Espanha
export const ES_REGIONS = [
  "Andaluzia", "Aragão", "Astúrias", "Ilhas Baleares", "Canárias", "Cantábria",
  "Castela-Mancha", "Castela e Leão", "Catalunha", "Comunidade Valenciana",
  "Estremadura", "Galiza", "La Rioja", "Madrid", "Múrcia", "Navarra", "País Basco",
  "Ceuta", "Melilha",
];

// Regras específicas por distrito/região (têm prioridade sobre a zona do país).
// Distritos sem regra herdam da zona. Chave = nome do distrito.
export const initialDistrictRules = {
  PT: {
    "Madeira": { methodIds: ["sm4"], overrides: { sm4: { cost: 9.9, eta: "5-7 dias úteis" } } },
    "Açores":  { methodIds: ["sm4"], overrides: { sm4: { cost: 11.9, eta: "6-9 dias úteis" } } },
  },
  ES: {
    "Canárias":      { methodIds: ["sm1"], overrides: { sm1: { cost: 14.9, eta: "7-10 dias úteis" } } },
    "Ilhas Baleares":{ methodIds: ["sm1"], overrides: { sm1: { cost: 10.9, eta: "5-7 dias úteis" } } },
  },
};

// Regras por categoria/produto — que categorias podem usar que métodos.
// `default` aplica-se às categorias sem regra específica.
export const initialCategoryRules = {
  default: ["sm1", "sm2", "sm3"],
  bySlug: {
    "corporais": ["sm1", "sm2"],
  },
};

// ---------- Languages ----------
export const initialLanguages = [
  { code: "pt-PT", label: "Português",   active: true,  default: true },
  { code: "en-GB", label: "Inglês",      active: true,  default: false },
  { code: "es-ES", label: "Espanhol",    active: false, default: false },
  { code: "fr-FR", label: "Francês",     active: false, default: false },
];

// available languages catalog when "adicionar idioma"
export const LANGUAGE_CATALOG = [
  { code: "pt-PT", label: "Português" },
  { code: "en-GB", label: "Inglês" },
  { code: "es-ES", label: "Espanhol" },
  { code: "fr-FR", label: "Francês" },
  { code: "it-IT", label: "Italiano" },
  { code: "de-DE", label: "Alemão" },
  { code: "pt-BR", label: "Português (Brasil)" },
];
