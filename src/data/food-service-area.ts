import { type LegalArea } from '@/types/legal';

/**
 * Food Service Legal Diagnostic Area
 * Based on "ANAMNESE JURÍDICA" document
 * 39 questions across 4 axes:
 * - EIXO 1: Patrimonial e Societário (Q1-Q9)
 * - EIXO 2: Vigilância, Segurança e EPI (Q10-Q17)
 * - EIXO 3: Consumerista e Digital (Q18-Q23)
 * - EIXO 4: Trabalhista e Engenharia de Pessoal (Q24-Q39)
 */
export const foodServiceArea: LegalArea = {
  id: 'food_service',
  name: 'Diagnóstico Jurídico - Food Service',
  type: 'common',
  description: 'Auditoria de risco jurídico-operacional para empresas de Food Service — restaurantes, deliverys, pizzarias, lanchonetes e afins',
  icon: 'Building2',
  questions: [
    // ============================================================
    // EIXO 1: PATRIMONIAL E SOCIETÁRIO (Perguntas 1–9)
    // ============================================================
    {
      id: 'fs_1',
      text: 'Como está a blindagem dos seus bens pessoais (casa, carros, investimentos)?',
      note: 'EIXO 1: PATRIMONIAL E SOCIETÁRIO',
      type: 'radio',
      weight: 3,
      options: [
        { label: 'Totalmente expostos; utilizo a conta da empresa para pagar despesas pessoais', value: 'expostos', points: 30 },
        { label: 'Estão em CPFs/CNPJs diferentes, mas sem uma Holding ou proteção jurídica específica', value: 'parcial', points: 15 },
        { label: 'Possuo Holding Patrimonial que isola os bens da operação e dos riscos trabalhistas', value: 'protegido', points: 0 },
      ],
    },
    {
      id: 'fs_2',
      text: 'Qual o critério de pagamento em caso de saída de um sócio (Haveres)?',
      type: 'radio',
      weight: 2,
      options: [
        { label: 'Valor de mercado (valuation), o que pode liquidar o caixa da empresa', value: 'mercado', points: 30 },
        { label: 'Valor patrimonial real contábil, preservando a continuidade do negócio', value: 'contabil', points: 15 },
        { label: 'Não há previsão; o contrato é o modelo padrão e geraria disputa judicial', value: 'sem_previsao', points: 30 },
      ],
    },
    {
      id: 'fs_3',
      text: 'Existe proteção contra abertura de concorrência por ex-sócio?',
      type: 'radio',
      weight: 3,
      options: [
        { label: 'Sim, temos Acordo de Sócios com cláusula de Não-Concorrência (Non-Compete)', value: 'acordo', points: 0 },
        { label: 'Existe apenas um acordo verbal de cavalheiros', value: 'verbal', points: 15 },
        { label: 'Não há nenhum documento; o sócio pode sair e abrir um concorrente ao lado', value: 'nenhum', points: 30 },
      ],
    },
    {
      id: 'fs_4',
      text: 'Como está o registro da sua marca e trade dress (identidade visual)?',
      type: 'radio',
      weight: 3,
      options: [
        { label: 'Registro concedido no INPI (Marca blindada)', value: 'registrado', points: 0 },
        { label: 'Pedido em análise ou fiz apenas a pesquisa de nome', value: 'analise', points: 15 },
        { label: 'Não possuo registro; corro risco de perder o nome e ser notificado a qualquer momento', value: 'sem_registro', points: 30 },
      ],
    },
    {
      id: 'fs_5',
      text: 'Existe Acordo de Sócios para casos de morte, invalidez ou herdeiros?',
      type: 'radio',
      weight: 3,
      options: [
        { label: 'Sim, as regras de sucessão e entrada de herdeiros estão blindadas em documento', value: 'blindado', points: 0 },
        { label: 'Existe uma conversa sobre isso, mas nada assinado', value: 'conversa', points: 15 },
        { label: 'Não; em caso de morte a empresa entra em inventário judicial e a operação trava', value: 'nenhum', points: 30 },
      ],
    },
    {
      id: 'fs_6',
      text: 'Seu contrato de locação comercial possui cláusula de vigência em caso de venda do imóvel e direito de renovação?',
      type: 'radio',
      weight: 2,
      options: [
        { label: 'Sim, o contrato está averbado e protege o fundo de comércio', value: 'averbado', points: 0 },
        { label: 'É um contrato simples de papelaria ou feito sem assessoria jurídica', value: 'simples', points: 15 },
        { label: 'Não tenho contrato escrito; é um acordo verbal com o proprietário', value: 'verbal', points: 30 },
      ],
    },
    {
      id: 'fs_7',
      text: 'Existe seguro de vida ou previdência estruturada para os sócios-chave?',
      type: 'radio',
      weight: 2,
      options: [
        { label: 'Sim, para garantir a liquidez da empresa em caso de sucessão', value: 'sim', points: 0 },
        { label: 'Não, nunca pensamos na continuidade do caixa em caso de ausência do sócio principal', value: 'nao', points: 15 },
        { label: 'Existe apenas previdência privada individual sem vínculo com a empresa', value: 'individual', points: 15 },
      ],
    },
    {
      id: 'fs_8',
      text: 'Seus contratos com fornecedores possuem cláusula de multa por atraso na entrega?',
      type: 'radio',
      weight: 2,
      options: [
        { label: 'Sim, protegemos a linha de produção contra falhas de fornecimento', value: 'sim', points: 0 },
        { label: 'Não temos contratos formais com fornecedores (compramos no "fio do bigode")', value: 'informal', points: 30 },
        { label: 'Compramos apenas em atacados com nota fiscal comum, sem contrato de fornecimento', value: 'atacado', points: 15 },
      ],
    },
    {
      id: 'fs_9',
      text: 'Relato Societário/Patrimonial: Descreva dificuldades com sócios, medo de penhoras ou dúvidas sobre a estrutura do seu Contrato Social:',
      type: 'textarea',
      weight: 0,
    },

    // ============================================================
    // EIXO 2: VIGILÂNCIA, SEGURANÇA E EPI (Perguntas 10–17)
    // ============================================================
    {
      id: 'fs_10',
      text: 'Qual a situação do armazenamento de gás (GLP) em relação à periculosidade?',
      note: 'EIXO 2: VIGILÂNCIA, SEGURANÇA E EPI (A ENGENHARIA DO RISCO)',
      type: 'radio',
      weight: 3,
      options: [
        { label: 'Área interna, próxima a fogões ou sem ventilação técnica (Risco de 30% de adicional)', value: 'interno', points: 30 },
        { label: 'Área externa, ventilada, com tubulação de aço e dentro das normas de segurança', value: 'externo', points: 0 },
        { label: 'Não possuo laudo de estanqueidade e desconheço as normas de distanciamento', value: 'sem_laudo', points: 30 },
      ],
    },
    {
      id: 'fs_11',
      text: 'Como é feito o controle de entrega de EPIs (Equipamentos de Proteção Individual)?',
      type: 'radio',
      weight: 3,
      options: [
        { label: 'Entrego os equipamentos, mas não tenho ficha de entrega com CA (Certificado de Aprovação)', value: 'sem_ficha', points: 15 },
        { label: 'Possuo ficha individual de EPI assinada, com registro de substituição e higienização', value: 'ficha_completa', points: 0 },
        { label: 'O funcionário compra o próprio equipamento ou usa o que estiver disponível', value: 'funcionario', points: 30 },
      ],
    },
    {
      id: 'fs_12',
      text: 'Sobre o treinamento para manuseio de equipamentos (Fatiadores, Fornos, Processadores):',
      type: 'radio',
      weight: 2,
      options: [
        { label: 'Existe registro formal de Treinamento e Capacitação Operacional para cada máquina', value: 'formal', points: 0 },
        { label: 'O funcionário aprende "na prática" com os colegas, sem registro de instrução técnica', value: 'pratica', points: 15 },
        { label: 'Não considero necessário o registro de treinamento para máquinas simples', value: 'nao_necessario', points: 30 },
      ],
    },
    {
      id: 'fs_13',
      text: 'Como é feita a gestão de agentes químicos (limpeza pesada)?',
      type: 'radio',
      weight: 3,
      options: [
        { label: 'A equipe usa desengordurantes industriais sem luvas nitrílicas ou óculos de proteção', value: 'sem_protecao', points: 30 },
        { label: 'Fornecemos EPIs certificados e temos a ficha de entrega e treinamento de diluição', value: 'epi_certificado', points: 0 },
        { label: 'Não há controle sobre químicos; o contato dérmico é frequente e sem proteção', value: 'sem_controle', points: 30 },
      ],
    },
    {
      id: 'fs_14',
      text: 'Existe laudo de medição de calor (IBUTG) na cozinha para insalubridade?',
      type: 'radio',
      weight: 3,
      options: [
        { label: 'Não, o ambiente é quente e não sei se ultrapassa o limite legal', value: 'nao_sabe', points: 30 },
        { label: 'Sim, possuo laudo que comprova a neutralização do calor ou o pagamento correto', value: 'laudo', points: 0 },
        { label: 'O ambiente é climatizado, mas não possuo laudo técnico que comprove a temperatura', value: 'climatizado_sem_laudo', points: 15 },
      ],
    },
    {
      id: 'fs_15',
      text: 'Como sua equipe recebe um fiscal da Vigilância Sanitária?',
      type: 'radio',
      weight: 3,
      options: [
        { label: 'Temos um Protocolo de Recebimento de Fiscalização treinado e padronizado', value: 'protocolo', points: 0 },
        { label: 'Recebemos com cordialidade, mas sem saber o que pode ou não ser assinado no auto', value: 'cordialidade', points: 15 },
        { label: 'No improviso; o dono ou gerente tenta "resolver" a situação na hora', value: 'improviso', points: 30 },
      ],
    },
    {
      id: 'fs_16',
      text: 'Existe checklist diário de conformidade sanitária (abertura e fechamento)?',
      type: 'radio',
      weight: 2,
      options: [
        { label: 'Sim, os funcionários preenchem checklists que servem de prova de boa prática', value: 'sim', points: 0 },
        { label: 'Não, confiamos na rotina da equipe de cozinha', value: 'nao', points: 15 },
        { label: 'O gerente faz uma ronda visual, mas não registra nada documentalmente', value: 'visual', points: 15 },
      ],
    },
    {
      id: 'fs_17',
      text: 'Relato Sanitário e Técnico: Conte experiências com multas, acidentes com químicos, queimaduras ou problemas de temperatura:',
      type: 'textarea',
      weight: 0,
    },

    // ============================================================
    // EIXO 3: CONSUMERISTA E DIGITAL (Perguntas 18–23)
    // ============================================================
    {
      id: 'fs_18',
      text: 'Você utiliza o protocolo de "Marco de Entrega" contra Chargebacks?',
      note: 'EIXO 3: CONSUMERISTA E DIGITAL',
      type: 'radio',
      weight: 3,
      options: [
        { label: 'Sim, usamos o código de confirmação para reverter estornos indevidos em 100% dos casos', value: 'sim', points: 0 },
        { label: 'Tentamos contestar via chat, mas raramente ganhamos a disputa', value: 'chat', points: 15 },
        { label: 'Não contestamos; aceitamos o prejuízo das plataformas como custo operacional', value: 'aceita', points: 30 },
      ],
    },
    {
      id: 'fs_19',
      text: 'Seu cardápio digital informa a diferença de preço Balcão vs. Delivery?',
      type: 'radio',
      weight: 2,
      options: [
        { label: 'Sim, é transparente e informa as taxas para evitar publicidade enganosa', value: 'transparente', points: 0 },
        { label: 'Os preços são diferentes, mas não há um aviso claro ao consumidor', value: 'sem_aviso', points: 15 },
        { label: 'O preço é o mesmo, mas o cliente reclama das taxas de entrega ocultas', value: 'taxas_ocultas', points: 30 },
      ],
    },
    {
      id: 'fs_20',
      text: 'O site ou App da empresa possui Termos de Uso e Política de LGPD?',
      type: 'radio',
      weight: 3,
      options: [
        { label: 'Sim, documentos personalizados que protegem a base de dados e a empresa', value: 'personalizado', points: 0 },
        { label: 'Copiei termos genéricos de outro site apenas para constar', value: 'generico', points: 15 },
        { label: 'Não possuo nenhum termo legal no meu site ou cardápio digital', value: 'nenhum', points: 30 },
      ],
    },
    {
      id: 'fs_21',
      text: 'Existe protocolo jurídico para responder avaliações difamatórias (Google/iFood)?',
      type: 'radio',
      weight: 2,
      options: [
        { label: 'Sim, operamos com respostas técnicas e medidas para remoção de conteúdo falso', value: 'protocolo', points: 0 },
        { label: 'Respondemos conforme a emoção ou entramos em discussões públicas com o cliente', value: 'emocao', points: 15 },
        { label: 'Ignoramos as avaliações, mesmo as que prejudicam a nota do estabelecimento', value: 'ignoramos', points: 30 },
      ],
    },
    {
      id: 'fs_22',
      text: 'Como é tratada a devolução de produtos perecíveis com lacre violado?',
      type: 'radio',
      weight: 2,
      options: [
        { label: 'Temos política de recusa baseada na segurança alimentar e prova do lacre de garantia', value: 'politica', points: 0 },
        { label: 'Trocamos o produto sempre, independente do motivo, para evitar nota baixa', value: 'troca_sempre', points: 15 },
        { label: 'Não temos critério; cada atendente decide o que fazer no momento da reclamação', value: 'sem_criterio', points: 30 },
      ],
    },
    {
      id: 'fs_23',
      text: 'Relato Consumerista: Descreva bloqueios de contas em plataformas, multas do Procon ou crises de imagem com clientes:',
      type: 'textarea',
      weight: 0,
    },

    // ============================================================
    // EIXO 4: TRABALHISTA E ENGENHARIA DE PESSOAL (Perguntas 24–39)
    // ============================================================
    {
      id: 'fs_24',
      text: 'Qual a realidade dos laudos LTCAT, PGR e PCMSO?',
      note: 'EIXO 4: TRABALHISTA E ENGENHARIA DE PESSOAL',
      type: 'radio',
      weight: 3,
      options: [
        { label: 'Atualizados, condizentes com a operação e assinados por engenheiro/médico', value: 'atualizados', points: 0 },
        { label: 'São documentos "padrão" da contabilidade que nunca foram ajustados à cozinha', value: 'padrao', points: 15 },
        { label: 'Não possuo nenhum desses laudos ativos na empresa', value: 'nenhum', points: 30 },
      ],
    },
    {
      id: 'fs_25',
      text: 'Como você contrata a mão de obra extra de final de semana?',
      type: 'radio',
      weight: 3,
      options: [
        { label: 'Contrato Intermitente com convocação via WhatsApp/Sistema e recibo legal', value: 'intermitente', points: 0 },
        { label: 'Pago "diária" em dinheiro ou PIX para freelancers sem nenhum contrato', value: 'diaria', points: 30 },
        { label: 'Utilizo funcionários fixos dobrando turno (horas extras excessivas)', value: 'hora_extra', points: 30 },
      ],
    },
    {
      id: 'fs_26',
      text: 'Seu Banco de Horas possui validade e anuência sindical?',
      type: 'radio',
      weight: 3,
      options: [
        { label: 'Sim, instituído via Acordo Coletivo com o Sindicato para compensação anual', value: 'acordo_coletivo', points: 0 },
        { label: 'Temos um acordo individual escrito, mas sem registro no sindicato', value: 'individual', points: 15 },
        { label: 'É um acordo verbal de "folgas" que não fica registrado em lugar nenhum', value: 'verbal', points: 30 },
      ],
    },
    {
      id: 'fs_27',
      text: 'Como é comprovado o Intervalo Intrajornada (pausa para refeição)?',
      type: 'radio',
      weight: 3,
      options: [
        { label: 'Termo de Opção de Intervalo assinado e registro rigoroso no cartão de ponto', value: 'termo', points: 0 },
        { label: 'O funcionário para quando o movimento permite; não há registro da pausa', value: 'sem_registro', points: 15 },
        { label: 'Pagamos o intervalo como hora extra na folha, mas sem documento de suporte', value: 'pago_sem_doc', points: 30 },
      ],
    },
    {
      id: 'fs_28',
      text: 'Como é feito o registro de jornada dos funcionários?',
      type: 'radio',
      weight: 3,
      options: [
        { label: 'Ponto eletrônico biométrico ou digital com geolocalização', value: 'eletronico', points: 0 },
        { label: 'Livro de ponto manual preenchido pelo próprio funcionário', value: 'manual', points: 15 },
        { label: 'Não batemos ponto; confiamos no horário acordado verbalmente', value: 'sem_ponto', points: 30 },
      ],
    },
    {
      id: 'fs_29',
      text: 'Existe proteção contra pedidos de "Tempo à Disposição" (WhatsApp)?',
      type: 'radio',
      weight: 3,
      options: [
        { label: 'Sim, temos Termo de Desconexão Digital assinado por toda a equipe', value: 'termo', points: 0 },
        { label: 'Proibimos o uso do celular, mas enviamos ordens no grupo fora do horário', value: 'contraditorio', points: 15 },
        { label: 'Não há controle; o grupo de WhatsApp da empresa é usado 24h por dia para cobranças', value: 'sem_controle', points: 30 },
      ],
    },
    {
      id: 'fs_30',
      text: 'Qual o meio de pagamento utilizado para adiantamentos (vales) e salários?',
      type: 'radio',
      weight: 2,
      options: [
        { label: 'PIX obrigatoriamente para a conta vinculada ao CPF do funcionário', value: 'pix_cpf', points: 0 },
        { label: 'Dinheiro em espécie com recibo assinado', value: 'dinheiro_recibo', points: 15 },
        { label: 'PIX para conta de familiares ou pagamento em mãos sem recibo imediato', value: 'sem_recibo', points: 30 },
      ],
    },
    {
      id: 'fs_31',
      text: 'Qual o modelo de contrato dos seus motoboys?',
      type: 'radio',
      weight: 3,
      options: [
        { label: 'Logística Civil com locação de espaço na BAG (Estratégia de Desconexão)', value: 'logistica_civil', points: 0 },
        { label: 'Contrato de prestação de serviços autônomo comum (Risco de vínculo)', value: 'autonomo', points: 15 },
        { label: 'São funcionários sem registro ou registrados sem o adicional de periculosidade', value: 'sem_registro', points: 30 },
      ],
    },
    {
      id: 'fs_32',
      text: 'Como está o controle dos Atestados de Saúde Ocupacional (ASO)?',
      type: 'radio',
      weight: 2,
      options: [
        { label: 'Todos em dia, inclusive os exames periódicos de funções de risco', value: 'em_dia', points: 0 },
        { label: 'Fazemos apenas na admissão; nunca renovamos os exames dos funcionários antigos', value: 'so_admissao', points: 15 },
        { label: 'Só fazemos o ASO quando o funcionário vai ser demitido', value: 'so_demissao', points: 30 },
      ],
    },
    {
      id: 'fs_33',
      text: 'Os funcionários que aparecem no marketing assinaram Autorização de Imagem?',
      type: 'radio',
      weight: 2,
      options: [
        { label: 'Sim, todos possuem Termo de Autorização de Imagem e Voz específico', value: 'sim', points: 0 },
        { label: 'Temos autorização apenas verbal ou "implícita"', value: 'verbal', points: 15 },
        { label: 'Não possuímos nada; usamos a imagem livremente nas redes sociais', value: 'nenhum', points: 30 },
      ],
    },
    {
      id: 'fs_34',
      text: 'Existe controle de entrega de ativos (Tablets, Celulares, Máquinas)?',
      type: 'radio',
      weight: 2,
      options: [
        { label: 'Sim, Termo de Responsabilidade e Custódia com previsão de desconto por dano', value: 'termo', points: 0 },
        { label: 'Temos uma lista simples, mas sem as cláusulas de responsabilidade e desconto', value: 'lista', points: 15 },
        { label: 'Entregamos os equipamentos sem qualquer registro formal de cautela', value: 'sem_registro', points: 30 },
      ],
    },
    {
      id: 'fs_35',
      text: 'Como é feita a custódia das senhas e acessos administrativos?',
      type: 'radio',
      weight: 2,
      options: [
        { label: 'Existe um protocolo de custódia e termo de sigilo para quem gerencia as contas', value: 'protocolo', points: 0 },
        { label: 'As senhas circulam livremente entre os funcionários de confiança', value: 'livre', points: 15 },
        { label: 'A senha é a mesma para todos os acessos e nunca foi trocada', value: 'mesma_senha', points: 30 },
      ],
    },
    {
      id: 'fs_36',
      text: 'Existe um Regulamento Interno e Código de Ética entregue mediante protocolo?',
      type: 'radio',
      weight: 2,
      options: [
        { label: 'Sim, todos conhecem as regras de conduta e as punições para assédio e má conduta', value: 'sim', points: 0 },
        { label: 'Temos algumas regras verbais, mas nada assinado ou estruturado', value: 'verbal', points: 15 },
        { label: 'Não há regulamento; as punições são decididas conforme o erro', value: 'nenhum', points: 30 },
      ],
    },
    {
      id: 'fs_37',
      text: 'Como é feita a gestão de multas e danos em veículos da empresa?',
      type: 'radio',
      weight: 2,
      options: [
        { label: 'Temos Termo de Uso assinado com autorização de desconto em folha para multas e avarias', value: 'termo', points: 0 },
        { label: 'O funcionário avisa quando leva multa, mas não temos documento para descontar', value: 'sem_doc', points: 15 },
        { label: 'A empresa assume todos os custos de manutenção e multas dos entregadores', value: 'empresa_assume', points: 30 },
      ],
    },
    {
      id: 'fs_38',
      text: 'Como é feita a conferência do estoque e controle de perdas (desvios)?',
      type: 'radio',
      weight: 2,
      options: [
        { label: 'Existe Termo de Responsabilidade por Estoque e Inventário Periódico', value: 'termo', points: 0 },
        { label: 'O controle é visual; não há responsabilização documental por sumiço de insumos', value: 'visual', points: 15 },
        { label: 'Não há controle de estoque; compramos conforme a necessidade do dia', value: 'sem_controle', points: 30 },
      ],
    },
    {
      id: 'fs_39',
      text: 'Relato Trabalhista: Descreva sua maior dor com processos, sindicatos, faltas ou insegurança na folha de pagamento:',
      type: 'textarea',
      weight: 0,
    },
  ],
};
