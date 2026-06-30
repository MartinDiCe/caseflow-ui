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
  Scale,
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
  ['Copiloto', 'Resúmenes, documentación faltante, casos vencidos, clientes pendientes y borradores revisables.', Bot],
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
    detail: 'Sterling Whitman LLP · onboarding de cliente',
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

function App() {
  const roi = useMemo(() => ({
    cases: 300,
    clients: 120,
    open: 200,
    closed: 50,
  }), []);
  useEffect(() => {
    track('VIEW', { actionCode: 'caseflow_page_home', actionLabel: 'CaseFlow landing', category: 'NAVIGATION' });
  }, []);
  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#inicio">
          <span className="brand-mark"><Scale size={22} /></span>
          <span><strong>CaseFlow</strong><small>Case operations</small></span>
        </a>
        <div><a data-mkt="caseflow_nav_modules" href="#modulos">Módulos</a><a data-mkt="caseflow_nav_flow" href="#flujo">Flujo</a><a data-mkt="caseflow_nav_dashboard" href="#dashboard">Dashboard</a><a data-mkt="caseflow_nav_links" href="#links">Links</a><a data-mkt="caseflow_nav_demo" href="#demo">Demo</a></div>
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
          <header><Landmark size={22} /><strong>Sterling Whitman LLP</strong><span>CaseFlow Demo</span></header>
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
        <article><strong>{roi.clients}</strong><span>clientes</span></article>
        <article><strong>{roi.cases}</strong><span>casos demo</span></article>
        <article><strong>{roi.open}</strong><span>casos abiertos</span></article>
        <article><strong>{roi.closed}</strong><span>casos cerrados</span></article>
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

      <section className="section backoffice">
        <div className="section-title">
          <p className="eyebrow">BACKOFFICE REAL</p>
          <h2>Un panel pensado para operar, no para decorar.</h2>
          <p>La demo se apoya en datos subidos por API: 120 clientes, 300 expedientes, flujos de estado, tareas, documentos, vencimientos y costos.</p>
        </div>
        <div className="workspace">
          <aside>
            <button className="active"><BriefcaseBusiness size={18} /> Expedientes</button>
            <button><CalendarDays size={18} /> Agenda</button>
            <button><FileText size={18} /> Documentos</button>
            <button><BadgeDollarSign size={18} /> Honorarios</button>
            <button><Bot size={18} /> Copiloto</button>
          </aside>
          <article>
            <header><span>LEGAL-EXP-0299</span><strong>IP and licensing: Daniel Morris v. Riverside Procurement Inc</strong><em>Completed</em></header>
            <div className="workspace-grid">
              <p><b>Cliente</b><span>Daniel Morris</span></p>
              <p><b>Tipo</b><span>IP & Technology</span></p>
              <p><b>Responsable</b><span>Margaret Sterling</span></p>
              <p><b>Próximo paso</b><span>Final document package</span></p>
            </div>
            <div className="timeline">
              <span><SearchCheck size={16} /> Conflict check completo</span>
              <span><FileText size={16} /> Discovery package generado</span>
              <span><FileSignature size={16} /> Entrega documental enviada</span>
              <span><ShieldCheck size={16} /> Historial auditado</span>
            </div>
          </article>
        </div>
      </section>

      <section className="section kb-strip">
        <article>
          <p className="eyebrow">KB PARA COPILOTO</p>
          <h2>Experto en operación por casos.</h2>
          <p>El copiloto entiende casos, expedientes, tipos, workflows, checklist, vencimientos, documentos, honorarios, gastos, clientes, SLA y documentación pendiente.</p>
        </article>
        <div className="kb-list">
          <span><CalendarDays size={18} /> Casos que vencen esta semana.</span>
          <span><FileText size={18} /> Documentación todavía no presentada.</span>
          <span><BadgeDollarSign size={18} /> Clientes con honorarios pendientes.</span>
          <span><TimerReset size={18} /> Causas sin movimiento hace 90 días.</span>
          <span><MessageCircle size={18} /> Resumen ejecutivo para cliente o socio.</span>
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
          <h2>Sterling Whitman LLP, una demo vertical sobre el motor universal de CaseFlow.</h2>
          <p>La demo jurídica muestra clientes, casos, documentos, estados, vencimientos, costos y dashboard; el mismo motor aplica a estudios contables, seguros, auditorías, gestorías y certificadoras.</p>
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
