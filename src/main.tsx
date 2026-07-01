import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  FileSignature,
  FileText,
  Gavel,
  Landmark,
  MessageCircle,
  SearchCheck,
  Send,
  ShieldCheck,
  Sparkles,
  TimerReset,
  UsersRound,
} from 'lucide-react';
import './styles.css';
import { askPublicBot, config, publicUrl, track } from './runtime';

type Message = { from: 'user' | 'bot'; text: string };

const modules = [
  ['Áreas de trabajo', 'Dominios profesionales con color, icono, tipos, plantillas, automatizaciones, biblioteca y dashboard propio.', Landmark],
  ['Gestión de casos', 'Código, cliente, estado, tipo, prioridad, responsable, área, etiquetas, riesgo, fechas, SLA y cierre.', BriefcaseBusiness],
  ['Expedientes', 'Documentos, observaciones, tareas, comentarios, adjuntos, aprobaciones, vencimientos e historial.', ClipboardCheck],
  ['Workflow configurable', 'Estados, transiciones, checklist, documentos requeridos, tareas y vencimientos por tipo de caso.', SearchCheck],
  ['Calendario', 'Audiencias, reuniones, inspecciones, presentaciones, vencimientos, renovaciones y revisiones críticas.', CalendarDays],
  ['Clientes y partes', 'Clientes, responsables, contrapartes, contactos autorizados y áreas internas relacionadas al caso.', UsersRound],
  ['Documentos y plantillas', 'Plantillas, borradores, versiones, generación documental, paquetes y entregas controladas.', FileText],
  ['Firmas y entregas', 'Solicitud, tracking de estado, token público y trazabilidad de documentos enviados.', FileSignature],
  ['Time tracking', 'Horas por profesional, actividad, tarifa, facturable/no facturable y aprobación operativa.', Clock3],
  ['Honorarios y facturación', 'Por hora, fijo, abono, éxito, gasto, pendiente, vencido, pagado y forecast de cobranza.', BadgeDollarSign],
  ['Vencimientos y alertas', 'Fechas críticas, tareas asociadas, responsables, historial y base para notificaciones automáticas.', TimerReset],
  ['Dashboard', 'Casos abiertos, cerrados, vencimientos, productividad, facturación, horas, riesgo y SLA.', BarChart3],
  ['Biblioteca profesional', 'Procedimientos, modelos, normativa, jurisprudencia, manuales y buenas prácticas consultables por IA.', Landmark],
  ['Copiloto profesional', 'Resúmenes, documentación faltante, casos vencidos, clientes pendientes y borradores revisables.', Bot],
] as const;

const caseTypes = ['Jurídico', 'Contable', 'Escribanía', 'Auditoría', 'Seguros', 'RRHH', 'Gestoría', 'Comercio exterior', 'Certificaciones', 'Ambiental'];

const industries = ['Estudios jurídicos', 'Estudios contables', 'Escribanías', 'Consultoras', 'Auditorías', 'Gestores', 'Seguros', 'Recursos Humanos', 'Certificadoras', 'Comercio exterior'];

const flow = [
  ['Caso', 'Entidad principal: todo gira alrededor del caso, no del cliente ni del documento.'],
  ['Expediente', 'Documentos, tareas, comentarios, adjuntos, aprobaciones, responsables e historial.'],
  ['Workflow', 'Estados configurables por tipo de caso, con checklist, vencimientos y tareas automáticas.'],
  ['Calendario', 'Audiencias, reuniones, presentaciones, inspecciones, renovaciones y fechas críticas.'],
  ['Facturación', 'Horas, honorarios, gastos, abonos, éxito y pendientes de cobro.'],
  ['Links públicos', 'Documentos, modelos y entregas por token público sin exponer el backoffice.'],
  ['Copiloto', 'Resumen, documentación faltante, riesgo, SLA, casos vencidos y próximos pasos.'],
];

const demoCases = [
  ['LEGAL-EXP-0300', 'Compliance response: Evelyn Murphy v. Oakline Construction Co', 'Cancelled', 'Tax & Compliance'],
  ['LEGAL-EXP-0299', 'IP and licensing: Daniel Morris v. Riverside Procurement Inc', 'Completed', 'IP & Technology'],
  ['LEGAL-EXP-0298', 'Real estate dispute: Brightline Logistics v. Gomez Family Trust', 'Approval pending', 'Real Estate Law'],
  ['LEGAL-EXP-0276', 'Employment claim: Harper Sullivan v. Atlas Retail Group', 'In progress', 'Employment Law'],
];

const publicLinks = [
  {
    title: 'Modelo de engagement letter',
    tag: 'MODELO PÚBLICO',
    copy: 'Vista pública real de plantilla documental compartida por token para revisar alcance y variables.',
    detail: 'Cliente Modelo · onboarding de cliente',
    href: publicUrl(config.templateEngagementPath),
  },
  {
    title: 'Modelo de demanda',
    tag: 'DOCUMENTO LEGAL',
    copy: 'Ejemplo de modelo jurídico compartible para mostrar cómo se entrega una plantilla controlada.',
    detail: 'Litigation · complaint package · variables auditables',
    href: publicUrl(config.templateDemandPath),
  },
  {
    title: 'Paquete documental para firma',
    tag: 'FIRMA / ENTREGA',
    copy: 'Link público de entrega documental para cliente, con estado, vencimiento y trazabilidad.',
    detail: 'LEGAL-EXP-0299 · final document package',
    href: publicUrl(config.deliveryPath),
  },
] as const;

const backofficeViews = [
  {
    label: 'Dashboard',
    title: 'Indicadores de operación por casos',
    summary: 'Casos abiertos, cerrados, vencimientos próximos, horas, honorarios pendientes y actividad crítica del cliente demo.',
    image: '/backoffice/caseflow-dashboard.png',
    kpis: [['100', 'casos'], ['24', 'vencimientos'], ['842 h', 'horas'], ['US$ 184k', 'honorarios']],
  },
  {
    label: 'Expedientes',
    title: 'Casos con workflow, cliente, responsable y SLA',
    summary: 'Listado operativo con casos por área, tipo, estado, prioridad, responsable y acceso al expediente completo.',
    image: '/backoffice/caseflow-cases.png',
    kpis: [['100', 'casos'], ['5', 'áreas'], ['20', 'tipos'], ['54', 'relaciones']],
  },
  {
    label: 'Copiloto',
    title: 'Copiloto experto en CaseFlow',
    summary: 'Consulta APIs, usa biblioteca curada del cliente demo, calcula indicadores y orienta próximos pasos sin reemplazar criterio profesional.',
    image: '/backoffice/backoffice-copilot.png',
    kpis: [['KB', 'curada'], ['API', 'lectura'], ['IA', 'asistida'], ['SLA', 'visible']],
  },
] as const;

const practiceAreas = [
  ['Legal', 'Demandas, contratos, audiencias, discovery, firmas y entregas documentales.', 'LEGAL'],
  ['Contable', 'Balances, liquidaciones, presentaciones, checklist documental y vencimientos fiscales.', 'ACCOUNTING'],
  ['Escribanía', 'Poderes, certificaciones, escrituras, identidad, firmas y entrega segura.', 'NOTARY'],
  ['Seguros', 'Siniestros, evidencias, liquidación, terceros, pericias y SLA de respuesta.', 'INSURANCE'],
  ['Auditoría', 'Plan de trabajo, controles, hallazgos, documentación faltante y entregables.', 'AUDIT'],
] as const;

const navigationGroups = [
  ['CRM', ['Leads', 'Clientes', 'Propuestas']],
  ['Operación', ['Casos', 'Tipos de Caso', 'Áreas de trabajo', 'Expedientes', 'Relaciones']],
  ['Gestión', ['Workflow', 'Tareas', 'Agenda', 'Vencimientos']],
  ['Documentación', ['Documentos', 'Plantillas', 'Borradores', 'Firmas', 'Entregas']],
  ['Administración', ['Horas', 'Honorarios', 'Gastos', 'Billing']],
  ['Inteligencia', ['Biblioteca Profesional', 'Automatizaciones', 'Dashboard', 'Copiloto']],
] as const;

const dashboardWidgets = [
  ['Casos activos', '76', 'Operación abierta por área'],
  ['Casos próximos a vencer', '24', 'SLA y vencimientos críticos'],
  ['Horas trabajadas', '842 h', 'Time tracking facturable'],
  ['Honorarios pendientes', 'US$ 184k', 'Billing operativo'],
  ['Documentos pendientes', '38', 'Borradores y entregas abiertas'],
  ['Firmas pendientes', '12', 'Solicitudes en curso'],
  ['Casos sin movimiento', '9', 'Riesgo operativo'],
  ['Automatizaciones', '5', 'Reglas activas por área'],
] as const;

const caseDetailBlocks = [
  ['Información general', 'Código, cliente, área de trabajo, responsable, prioridad, estado, SLA y riesgo en una cabecera clara.'],
  ['Timeline', 'Comentarios, cambios de estado, documentos, firmas, automatizaciones y actividad cronológica.'],
  ['Expediente', 'Documentos, carpetas, versiones, etiquetas, adjuntos, entregas y trazabilidad documental.'],
  ['Checklist', 'Progreso visual por tipo de caso, requisitos pendientes y documentos esperados.'],
  ['Workflow', 'Estados visibles y transiciones permitidas sin hardcodear el flujo.'],
  ['Vencimientos', 'Calendario, próximos eventos, alertas, responsables y fechas críticas.'],
  ['Costos', 'Horas, gastos, honorarios, billing y forecast operativo.'],
  ['Relaciones', 'Cliente, empresa, contrato, caso, documento, otros casos y terceros conectados.'],
] as const;

const coreCapabilities = [
  'Usuarios',
  'Roles',
  'Permisos',
  'Multiempresa',
  'Expedientes',
  'Workflow',
  'Documentos',
  'Automatizaciones',
  'Dashboard',
  'Notificaciones',
  'APIs',
  'Copiloto IA',
] as const;

const externalAccess = [
  ['Link de entrega documental', 'El cliente recibe un token seguro para abrir documentos, ver contexto, descargar o imprimir.'],
  ['Link de firma o aprobación', 'Una firma, aceptación o rechazo sigue su propio flujo de estado y queda trazado en el expediente.'],
  ['Formulario externo', 'Sirve para pedir documentación, aprobar una propuesta o completar datos sin dar acceso al backoffice.'],
  ['API pública controlada', 'El cliente puede integrar su web, intranet, CRM o un portal custom sin duplicar operación.'],
] as const;

const botCapabilities = [
  ['Consultar', 'Busca casos, vencimientos, plantillas, tareas, entregas, honorarios y documentos del cliente demo.'],
  ['Calcular', 'Devuelve indicadores sin depender del LLM: pendientes, vencidos, sin movimiento, horas y cobranza.'],
  ['Guiar', 'Sugiere próximos pasos según workflow, tipo de caso, checklist y estado actual.'],
  ['Generar', 'Puede preparar borradores desde plantillas y pedir datos faltantes antes de crear documentos.'],
] as const;

const documentLibrary = [
  ['Jurídico', 'Engagement letter, demanda, contrato, NDA, poder, discovery, índice de evidencia, acuerdo y cierre.'],
  ['Contable', 'Solicitud documental, liquidación mensual, balance, estados de resultados, certificación e informe.'],
  ['Escribanía', 'Escritura pública, poder general, poder especial, certificación de firmas, minuta y acta.'],
  ['Seguros', 'Denuncia de siniestro, informe pericial, carta de cobertura, liquidación e informe técnico.'],
  ['Auditoría', 'Plan de auditoría, programa de trabajo, hallazgos, riesgos detectados e informe final.'],
] as const;

const copilotKnowledge = [
  {
    intent: ['vence', 'vencimiento', 'semana', 'audiencia', 'deadline'],
    answer: 'CaseFlow cruza vencimientos, calendario y tareas abiertas por caso. Sirve para audiencias legales, presentaciones contables, inspecciones, renovaciones, certificados, contratos y cualquier fecha crítica de un proceso profesional.',
  },
  {
    intent: ['honorario', 'factura', 'cobrar', 'pendiente', 'fee'],
    answer: 'El módulo de honorarios/facturación separa cobro por hora, fijo, abono, éxito, gasto, pendiente, vencido y pagado. El dashboard muestra pendientes y permite priorizar follow-up sin abrir caso por caso.',
  },
  {
    intent: ['resumen', 'gomez', 'perez', 'expediente', 'caso'],
    answer: 'El resumen ejecutivo debe incluir cliente, tipo de caso, estado, responsable, próximos vencimientos, documentos pendientes, tareas, horas cargadas, honorarios, SLA y riesgo operativo.',
  },
  {
    intent: ['hora', 'time', 'tracking', 'profesional', 'abogado', 'contador', 'consultor'],
    answer: 'Time tracking registra profesional, fecha, actividad, descripción, horas, tarifa, moneda, estado y si es facturable. Alimenta ROI, honorarios y productividad por responsable, área o tipo de caso.',
  },
  {
    intent: ['firma', 'documento', 'plantilla', 'poder', 'demanda'],
    answer: 'CaseFlow conecta plantillas, documentos generados, envíos controlados y solicitudes de firma/aceptación. El objetivo es que contratos, demandas, balances, poderes, informes, cartas, certificados o entregables queden dentro del expediente con trazabilidad.',
  },
  {
    intent: ['roi', 'dashboard', 'indicador', 'metricas'],
    answer: 'El ROI aparece en menos casos sin movimiento, menos vencimientos perdidos, más horas facturables capturadas, honorarios pendientes visibles, menor tiempo administrativo por documento y mejor SLA.',
  },
  {
    intent: ['tipo', 'tipos', 'checklist', 'workflow', 'contable', 'seguro', 'auditoria'],
    answer: 'Los tipos de caso vuelven universal a CaseFlow: jurídico, contable, seguros, auditoría, RRHH, gestoría o comercio exterior pueden definir workflow, campos, checklist, documentos, vencimientos y plantillas propias.',
  },
];

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function askCopilot(prompt: string) {
  const text = normalize(prompt);
  return copilotKnowledge.find((item) => item.intent.some((key) => text.includes(normalize(key))))?.answer
    ?? 'Lo miraría como caso completo: cliente, partes, estado, calendario, vencimientos, documentos, horas, honorarios, gastos, entregas y próximo paso. Ahí aparece la operación real.';
}

function Copilot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: 'Soy el copiloto de CaseFlow. Preguntame por vencimientos, honorarios, time tracking, documentos o resumen de expediente.' },
  ]);
  const prompts = ['¿Qué casos vencen esta semana?', '¿Qué documentación falta?', '¿Sirve para estudio contable?'];
  const send = (value: string) => {
    if (!value.trim()) return;
    track('BOT_QUESTION', { actionCode: 'caseflow_public_copilot_question', actionLabel: value.slice(0, 120), category: 'COPILOT' });
    setMessages((current) => [...current, { from: 'user', text: value }, { from: 'bot', text: askCopilot(value) }]);
    void askPublicBot(value).then((remoteAnswer) => {
      if (remoteAnswer) {
        setMessages((current) => [...current.slice(0, -1), { from: 'bot', text: remoteAnswer }]);
      }
    });
    setInput('');
    setOpen(true);
  };
  return (
    <>
      <button className="copilot-pill" type="button" onClick={() => setOpen((value) => !value)}><Sparkles size={18} /> Copiloto</button>
      {open && (
        <aside className="copilot-panel">
          <header><Bot size={20} /><strong>Copiloto CaseFlow</strong><button type="button" onClick={() => setOpen(false)}>x</button></header>
          <div className="prompt-row">{prompts.map((prompt) => <button key={prompt} type="button" onClick={() => send(prompt)}>{prompt}</button>)}</div>
          <div className="chat-log">{messages.slice(-6).map((message, index) => <p key={`${message.from}-${index}`} className={message.from}>{message.text}</p>)}</div>
          <form onSubmit={(event) => { event.preventDefault(); send(input); }}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Preguntar por expediente..." />
            <button type="submit"><Send size={17} /></button>
          </form>
        </aside>
      )}
    </>
  );
}

function BackofficeGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeView = backofficeViews[activeIndex] || backofficeViews[0];
  return (
    <section id="backoffice" className="section backoffice-section">
      <div className="section-head">
        <div>
          <p className="eyebrow">BACKOFFICE REAL</p>
          <h2>La operación se ve desde el panel, no desde una promesa.</h2>
          <p>Capturas reales del backoffice DiceProjects usando un cliente demo de CaseFlow: dashboard, expedientes y copiloto sobre datos cargados por API.</p>
        </div>
      </div>
      <div className="backoffice-tabs" role="tablist" aria-label="Galeria de backoffice CaseFlow">
        {backofficeViews.map((view, index) => (
          <button key={view.label} type="button" className={index === activeIndex ? 'active' : ''} onClick={() => setActiveIndex(index)} role="tab" aria-selected={index === activeIndex}>
            {view.label}
          </button>
        ))}
      </div>
      <div className="backoffice-showcase">
        <aside className="backoffice-side">
          <div className="backoffice-window-dots"><span /><span /><span /></div>
          <p>Cliente Modelo · CaseFlow Demo</p>
          <nav>
            {backofficeViews.map((view, index) => (
              <button key={view.label} className={index === activeIndex ? 'active' : ''} type="button" onClick={() => setActiveIndex(index)}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {view.label}
              </button>
            ))}
          </nav>
        </aside>
        <article className="backoffice-board screenshot-board">
          <header className="backoffice-board-head">
            <div>
              <small>CaseFlow Backoffice</small>
              <h3>{activeView.title}</h3>
              <p>{activeView.summary}</p>
            </div>
            <div className="board-status">
              <span>LIVE</span>
              <strong>Q2 2026</strong>
            </div>
          </header>
          <div className="screenshot-stage">
            <img src={activeView.image} alt={`${activeView.title} - captura CaseFlow`} loading="lazy" />
          </div>
          <div className="screenshot-proof">
            {activeView.kpis.map(([value, label]) => <span key={label}><b>{value}</b>{label}</span>)}
          </div>
        </article>
      </div>
    </section>
  );
}

function App() {
  const roi = useMemo(() => ({
    cases: 100,
    areas: 5,
    relations: 54,
    links: 40,
  }), []);
  useEffect(() => {
    track('VIEW', { actionCode: 'caseflow_page_home', actionLabel: 'CaseFlow landing', category: 'NAVIGATION' });
  }, []);
  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#inicio">
          <span className="brand-mark" />
          <span><strong>CaseFlow Pub</strong><small>by DiceProjects</small></span>
        </a>
        <div><a data-mkt="caseflow_nav_modules" href="#modulos">Módulos</a><a data-mkt="caseflow_nav_flow" href="#flujo">Flujo</a><a data-mkt="caseflow_nav_backoffice" href="#backoffice">Backoffice</a><a data-mkt="caseflow_nav_links" href="#links">Links</a><a data-mkt="caseflow_nav_demo" href="#demo">Demo</a></div>
      </nav>

      <section id="inicio" className="hero">
        <img src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1800&q=84" alt="Biblioteca jurídica profesional" />
        <div className="hero-overlay" />
        <div className="hero-copy">
          <p className="eyebrow">CASOS · EXPEDIENTES · WORKFLOWS · VENCIMIENTOS</p>
          <h1>La plataforma para gestionar casos, expedientes y procesos profesionales.</h1>
          <p>Centralizá casos, expedientes, documentos, tareas, calendarios, vencimientos, responsables, honorarios, gastos y time tracking sobre DiceProjects Core con copiloto operativo.</p>
          <div className="actions">
            <a className="button primary" href="#demo" onClick={() => track('CLICK', { actionCode: 'caseflow_cta_demo', actionLabel: 'Ver demo CaseFlow', category: 'CTA' })}>Ver demo CaseFlow <ArrowRight size={18} /></a>
            <a className="button secondary" href="#modulos" onClick={() => track('CLICK', { actionCode: 'caseflow_cta_modules', actionLabel: 'Ver módulos', category: 'CTA' })}>Ver módulos</a>
          </div>
        </div>
        <div className="legal-board">
          <header><Landmark size={22} /><strong>Cliente Modelo</strong><span>CaseFlow Demo</span></header>
          {demoCases.map(([code, title, status, type]) => (
            <article key={code}>
              <b>{code}</b>
              <div><strong>{title}</strong><span>{type}</span></div>
              <em>{status}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="proof">
        <article><strong>{roi.areas}</strong><span>áreas</span></article>
        <article><strong>{roi.cases}</strong><span>casos demo</span></article>
        <article><strong>{roi.relations}</strong><span>relaciones</span></article>
        <article><strong>{roi.links}</strong><span>links seguros</span></article>
      </section>

      <section className="section enterprise-shell">
        <div className="section-title">
          <p className="eyebrow">PLATAFORMA ENTERPRISE</p>
          <h2>Una interfaz organizada por operación profesional, no por rubro.</h2>
          <p>La navegación separa CRM, operación, gestión, documentación, administración e inteligencia para que el caso sea el punto de unión entre personas, documentos, vencimientos, costos y copiloto.</p>
        </div>
        <div className="shell-board">
          <aside className="shell-sidebar">
            {navigationGroups.map(([group, items]) => (
              <div key={group}>
                <strong>{group}</strong>
                {items.map((item) => <span key={item}>{item}</span>)}
              </div>
            ))}
          </aside>
          <article className="shell-dashboard">
            <header>
              <small>Cliente Modelo · Operación profesional</small>
              <h3>Executive Case Operations</h3>
              <p>Dashboard principal por casos, áreas, vencimientos, documentos, firmas, horas y automatizaciones.</p>
            </header>
            <div className="widget-grid">
              {dashboardWidgets.map(([title, value, detail]) => (
                <div key={title}>
                  <span>{title}</span>
                  <strong>{value}</strong>
                  <small>{detail}</small>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="modulos" className="section">
        <div className="section-title">
          <p className="eyebrow">GESTIÓN DE CASOS COMPLETA</p>
          <h2>No es un tablero de tareas. Es la operación profesional por caso.</h2>
          <p>CaseFlow conecta el caso con el expediente, el workflow, el calendario, los documentos, los costos, los honorarios y la inteligencia operativa.</p>
        </div>
        <div className="cards">
          {modules.map(([title, copy, Icon]) => <article key={title}><Icon /><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section className="section split">
        <div>
          <p className="eyebrow">NO APUNTA A UNA PROFESIÓN. APUNTA A UNA FORMA DE TRABAJAR.</p>
          <h2>Todos los equipos que trabajan por casos pueden usar el mismo motor.</h2>
          <p>Jurídico, contable, seguros, auditoría, recursos humanos, gestoría, certificaciones, ambiente o comercio exterior comparten la misma necesidad: caso, expediente, workflow, documentos, vencimientos, responsables y dashboard.</p>
        </div>
        <div className="case-type-list">
          {industries.map((item) => <span key={item}><CheckCircle2 size={16} /> {item}</span>)}
        </div>
      </section>

      <section className="section split">
        <div>
          <p className="eyebrow">TIPOS DE CASO</p>
          <h2>La capa que vuelve universal a CaseFlow.</h2>
          <p>Cada tipo puede definir workflow, documentos, tareas, vencimientos y checklist operativo. Un caso laboral y un balance contable usan el mismo Core con reglas diferentes.</p>
        </div>
        <div className="case-type-list">
          {caseTypes.map((item) => <span key={item}><ShieldCheck size={16} /> {item}</span>)}
        </div>
      </section>

      <section className="section workspace-types">
        <div className="section-title">
          <p className="eyebrow">ÁREAS POR NEGOCIO</p>
          <h2>Una misma empresa puede operar varias prácticas sin mezclar criterios.</h2>
          <p>Cada área de trabajo ordena la operación por rubro, equipo o línea de negocio. Al crearla, puede heredar plantillas, checklist, vencimientos y reglas base.</p>
        </div>
        <div className="workspace-type-grid">
          {practiceAreas.map(([title, copy, code]) => (
            <article key={code}>
              <small>{code}</small>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="flujo" className="section flows">
        <div className="section-title">
          <p className="eyebrow">ARQUITECTURA OPERATIVA</p>
          <h2>Del caso al dashboard, sin perder trazabilidad.</h2>
        </div>
        <div>
          {flow.map(([title, copy], index) => (
            <article key={title}>
              <b>{index + 1}</b>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section case-center">
        <div className="section-title">
          <p className="eyebrow">EL CASO COMO ENTIDAD PRINCIPAL</p>
          <h2>La vista de caso debe sentirse como el centro de mando.</h2>
          <p>El caso conecta expediente, workflow, tareas, documentos, firmas, vencimientos, costos, relaciones, historial y copiloto. No es una ficha: es la operación completa.</p>
        </div>
        <div className="case-detail-grid">
          {caseDetailBlocks.map(([title, copy]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section external-access">
        <div>
          <p className="eyebrow">BACKOFFICE PRIMERO. ACCESO EXTERNO CUANDO SUMA.</p>
          <h2>No obliga a tener portal cerrado.</h2>
          <p>CaseFlow permite exponer información por APIs públicas controladas, formularios y links compartibles. El portal cliente puede existir, pero no es requisito para operar ni para mostrar valor.</p>
        </div>
        <div className="external-grid">
          {externalAccess.map(([title, copy]) => (
            <article key={title}>
              <ExternalLink size={20} />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="dashboard" className="section dashboard">
        <div>
          <p className="eyebrow">DASHBOARD</p>
          <h2>Indicadores que importan en una operación por casos.</h2>
          <p>Casos abiertos, cierres, vencimientos críticos, calendario, productividad, horas facturables, honorarios pendientes, riesgo y SLA.</p>
        </div>
        <div className="metrics">
          <article><TimerReset /><strong>24</strong><span>vencimientos próximos</span></article>
          <article><Gavel /><strong>18</strong><span>eventos críticos</span></article>
          <article><Clock3 /><strong>842 h</strong><span>horas facturables</span></article>
          <article><BadgeDollarSign /><strong>US$ 184k</strong><span>honorarios pendientes</span></article>
        </div>
      </section>

      <BackofficeGallery />

      <section className="section document-library">
        <div className="section-title">
          <p className="eyebrow">BIBLIOTECA DOCUMENTAL</p>
          <h2>Modelos profesionales integrados al expediente, no archivos sueltos.</h2>
          <p>Cada documento nace desde un tipo de caso, queda versionado, puede requerir firma o aprobación, se entrega por link seguro y mantiene historial dentro del expediente.</p>
        </div>
        <div className="document-library-board">
          <article className="document-flow-card">
            <small>TRAZABILIDAD DOCUMENTAL</small>
            <h3>Plantilla → Borrador → Revisión → Firma → Entrega → Historial</h3>
            <p>El documento conserva expediente, responsable, versión, estado, fecha, firmantes, referencias y auditoría. El copiloto puede explicar qué falta y sugerir próximos pasos.</p>
            <div>
              <span>Versiones</span>
              <span>Firmas</span>
              <span>Entregas</span>
              <span>Auditoría</span>
            </div>
          </article>
          <div className="document-library-grid">
            {documentLibrary.map(([title, copy]) => (
              <article key={title}>
                <FileText size={20} />
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section kb-strip">
        <article>
          <p className="eyebrow">BIBLIOTECA PROFESIONAL</p>
          <h2>La base de conocimiento que vuelve útil al copiloto.</h2>
          <p>Procedimientos, modelos, plantillas, normativa, jurisprudencia, manuales y buenas prácticas quedan disponibles para que el copiloto responda con contexto del área y del tipo de caso.</p>
        </article>
        <div className="bot-capabilities">
          {botCapabilities.map(([title, copy]) => (
            <span key={title}><Bot size={18} /><b>{title}</b>{copy}</span>
          ))}
        </div>
      </section>

      <section className="section core-section">
        <div>
          <p className="eyebrow">CONSTRUIDO SOBRE DICEPROJECTS CORE</p>
          <h2>CaseFlow reutiliza el Core común y lo especializa por caso.</h2>
          <p>La plataforma hereda seguridad, multiempresa, roles, permisos, expedientes, workflow, documentos, automatizaciones, dashboards, APIs, notificaciones y copiloto IA.</p>
        </div>
        <div className="core-list">
          {coreCapabilities.map((item) => <span key={item}><CheckCircle2 size={16} /> {item}</span>)}
        </div>
      </section>

      <section className="section bot-examples">
        <div className="section-title">
          <p className="eyebrow">EJEMPLOS DE PREGUNTAS</p>
          <h2>El copiloto entiende la operación real de cada cliente.</h2>
        </div>
        <div className="kb-list">
          <span><CalendarDays size={18} /> Casos que vencen esta semana.</span>
          <span><FileText size={18} /> Documentación todavía no presentada.</span>
          <span><BadgeDollarSign size={18} /> Clientes con honorarios pendientes.</span>
          <span><TimerReset size={18} /> Causas sin movimiento hace 90 días.</span>
          <span><MessageCircle size={18} /> Resumen ejecutivo para cliente o socio.</span>
          <span><ClipboardCheck size={18} /> Checklist incompleto por área.</span>
          <span><FileSignature size={18} /> Entregas pendientes de firma o aceptación.</span>
        </div>
      </section>

      <section id="links" className="section public-links">
        <div className="section-title">
          <p className="eyebrow">LINKS PÚBLICOS DEMO</p>
          <h2>Cómo se comparte documentación sin abrir el backoffice.</h2>
          <p>Modelos, paquetes documentales y entregas se ven por token público, con lenguaje de cliente y sin exponer IDs internos ni pantallas operativas.</p>
        </div>
        <div className="link-grid">
          {publicLinks.map((item) => (
            <a className="public-card" href={item.href} target="_blank" rel="noreferrer" key={item.title} onClick={() => track('CASE_VIEW', { actionCode: `caseflow_public_link_${item.tag.toLowerCase().replace(/[\s/]+/g, '_')}`, actionLabel: item.title, category: 'PUBLIC_LINK', entityType: 'CASE', metadata: { href: item.href, detail: item.detail } })}>
              <span className="link-top"><small>{item.tag}</small><ExternalLink size={18} /></span>
              <strong>{item.title}</strong>
              <p>{item.copy}</p>
              <em>{item.detail}</em>
            </a>
          ))}
        </div>
      </section>

      <section id="demo" className="section lead">
        <div>
          <p className="eyebrow">CASO DE ÉXITO DEMO</p>
          <h2>Cliente Modelo, una demo con varias áreas sobre el motor universal de CaseFlow.</h2>
          <p>La demo muestra 100 casos, 20 tipos, 5 áreas de trabajo, leads, propuestas, links seguros, relaciones, biblioteca profesional, automatizaciones y billing; el mismo motor aplica a estudios contables, seguros, auditorías, gestorías y certificadoras.</p>
        </div>
        <form>
          <input placeholder="Nombre" />
          <input placeholder="Email" />
          <textarea placeholder="Contanos si querés demo para estudio jurídico, contable, consultora, seguros, gestoría o área profesional" />
          <button className="button primary" type="button">Solicitar demo</button>
        </form>
      </section>

      <footer>CaseFlow no es gestión genérica de tareas. Es la plataforma para organizaciones que trabajan por casos, expedientes y procesos profesionales.</footer>
      <Copilot />
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
