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
  ['Expedientes', 'Apertura, tipo, cliente, contraparte, responsable, prioridad, estado, auditoría y cierre.', BriefcaseBusiness],
  ['Agenda legal', 'Audiencias, reuniones, presentaciones, vencimientos y revisiones críticas por expediente.', CalendarDays],
  ['Clientes y partes', 'Clientes, contrapartes, abogados, tribunales, responsables internos y contactos autorizados.', UsersRound],
  ['Documentos y plantillas', 'Demandas, poderes, contratos, cartas, acuerdos, escritos y paquetes documentales editables.', FileText],
  ['Firma digital', 'Solicitud de firma, tracking de estado, token público y trazabilidad de documentos enviados.', FileSignature],
  ['Time tracking', 'Horas por profesional, actividad, tarifa, facturable/no facturable y aprobación operativa.', Clock3],
  ['Honorarios', 'Retainers, facturas, honorarios pendientes, vencidos, pagados y forecast de cobranza.', BadgeDollarSign],
  ['Gastos', 'Tasas, sellados, movilidad, pericias, court reporter, transcriptos y gastos reembolsables.', ClipboardCheck],
  ['Dashboard legal', 'Expedientes abiertos, cierres, vencimientos, honorarios pendientes, horas y audiencias.', BarChart3],
  ['Copiloto jurídico', 'Resumen de expedientes, riesgos, vencimientos, escritos faltantes y documentos pendientes.', Bot],
] as const;

const caseTypes = ['Litigation', 'Employment Law', 'Corporate Advisory', 'Real Estate Law', 'IP & Technology', 'Tax & Compliance'];

const flow = [
  ['Intake', 'Cliente, conflicto de interés, alcance, documentos iniciales y apertura formal.'],
  ['Expediente', 'Tipo, responsable, contraparte, prioridad, estado y calendario procesal.'],
  ['Estrategia', 'Tareas, documentos, research, presupuesto y próximos pasos.'],
  ['Audiencias', 'Reuniones, presentaciones, vencimientos y evidencia asociada.'],
  ['Facturación', 'Horas, honorarios, gastos, retainers y pendientes de cobro.'],
  ['Cierre', 'Resultado, documentos finales, firma, conformidad e historial auditado.'],
  ['Insights', 'Dashboard, causas sin movimiento, clientes pendientes y ROI operativo.'],
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
    answer: 'CaseFlow cruza vencimientos, audiencias y tareas abiertas por expediente. Para una demo jurídica conviene pedir: expedientes que vencen esta semana, escritos sin presentar y audiencias sin documentación completa.',
  },
  {
    intent: ['honorario', 'factura', 'cobrar', 'pendiente', 'fee'],
    answer: 'El módulo de honorarios separa retainer, factura mensual, pendiente, vencido y pagado. El dashboard muestra honorarios pendientes y permite priorizar follow-up comercial sin abrir expediente por expediente.',
  },
  {
    intent: ['resumen', 'gomez', 'perez', 'expediente', 'caso'],
    answer: 'El resumen ejecutivo debe incluir cliente, contraparte, estado, tribunal, próximos vencimientos, documentos pendientes, horas cargadas, honorarios y riesgo operativo.',
  },
  {
    intent: ['hora', 'time', 'tracking', 'profesional', 'abogado'],
    answer: 'Time tracking registra profesional, fecha, actividad, descripción, horas, tarifa, moneda, estado y si es facturable. Eso alimenta ROI, honorarios y productividad por abogado.',
  },
  {
    intent: ['firma', 'documento', 'plantilla', 'poder', 'demanda'],
    answer: 'CaseFlow conecta plantillas, documentos generados, envíos y firma electrónica/digital. El objetivo es que poderes, demandas, acuerdos y cartas queden dentro del expediente con trazabilidad.',
  },
  {
    intent: ['roi', 'dashboard', 'indicador', 'metricas'],
    answer: 'El ROI aparece en menos expedientes sin movimiento, menos vencimientos perdidos, más horas facturables capturadas, honorarios pendientes visibles y menor tiempo administrativo por documento.',
  },
];

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function askCopilot(prompt: string) {
  const text = normalize(prompt);
  return copilotKnowledge.find((item) => item.intent.some((key) => text.includes(normalize(key))))?.answer
    ?? 'Lo miraría como expediente completo: cliente, contraparte, estado, audiencia, vencimientos, documentos, horas, honorarios, gastos, firma y próximo paso. Ahí aparece la operación real del estudio.';
}

function Copilot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: 'Soy el copiloto de CaseFlow. Preguntame por vencimientos, honorarios, time tracking, documentos o resumen de expediente.' },
  ]);
  const prompts = ['¿Qué expedientes vencen esta semana?', '¿Qué clientes tienen honorarios pendientes?', 'Preparame un resumen ejecutivo'];
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
          <span><strong>CaseFlow</strong><small>Legal operations</small></span>
        </a>
        <div><a data-mkt="caseflow_nav_modules" href="#modulos">Módulos</a><a data-mkt="caseflow_nav_flow" href="#flujo">Flujo</a><a data-mkt="caseflow_nav_dashboard" href="#dashboard">Dashboard</a><a data-mkt="caseflow_nav_links" href="#links">Links</a><a data-mkt="caseflow_nav_demo" href="#demo">Demo</a></div>
      </nav>

      <section id="inicio" className="hero">
        <img src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1800&q=84" alt="Biblioteca jurídica profesional" />
        <div className="hero-overlay" />
        <div className="hero-copy">
          <p className="eyebrow">EXPEDIENTES · AUDIENCIAS · DOCUMENTOS · HONORARIOS</p>
          <h1>El BackOffice jurídico para estudios que viven de expedientes, vencimientos y clientes.</h1>
          <p>Centralizá casos, documentos, audiencias, tareas, firmas, honorarios, gastos y time tracking sobre DiceProjects Core con copiloto jurídico y dashboard operativo.</p>
          <div className="actions">
            <a className="button primary" href="#demo" onClick={() => track('CLICK', { actionCode: 'caseflow_cta_demo', actionLabel: 'Ver demo jurídica', category: 'CTA' })}>Ver demo jurídica <ArrowRight size={18} /></a>
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
        <article><strong>{roi.clients}</strong><span>clientes jurídicos</span></article>
        <article><strong>{roi.cases}</strong><span>expedientes demo</span></article>
        <article><strong>{roi.open}</strong><span>casos abiertos</span></article>
        <article><strong>{roi.closed}</strong><span>casos cerrados</span></article>
      </section>

      <section id="modulos" className="section">
        <div className="section-title">
          <p className="eyebrow">GESTIÓN JURÍDICA COMPLETA</p>
          <h2>No es un tablero de tareas. Es la operación legal completa.</h2>
          <p>CaseFlow conecta el expediente con el cliente, el calendario, los documentos, los costos y la inteligencia operativa del estudio.</p>
        </div>
        <div className="cards">
          {modules.map(([title, copy, Icon]) => <article key={title}><Icon /><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section className="section split">
        <div>
          <p className="eyebrow">PARA ESTUDIOS Y ÁREAS LEGALES</p>
          <h2>El mismo Core, adaptado al lenguaje jurídico.</h2>
          <p>CaseFlow puede operar demandas, mediaciones, reclamos laborales, contratos, compliance, real estate, IP, auditorías y expedientes internos.</p>
        </div>
        <div className="case-type-list">
          {caseTypes.map((item) => <span key={item}><CheckCircle2 size={16} /> {item}</span>)}
        </div>
      </section>

      <section id="flujo" className="section flows">
        <div className="section-title">
          <p className="eyebrow">FLUJO DEL EXPEDIENTE</p>
          <h2>Del intake al cierre, sin perder trazabilidad.</h2>
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
          <p className="eyebrow">DASHBOARD LEGAL</p>
          <h2>Indicadores que importan en un estudio jurídico.</h2>
          <p>Expedientes abiertos, cierres, vencimientos críticos, audiencias, horas facturables, honorarios pendientes y gastos reembolsables.</p>
        </div>
        <div className="metrics">
          <article><TimerReset /><strong>24</strong><span>vencimientos próximos</span></article>
          <article><Gavel /><strong>18</strong><span>audiencias agendadas</span></article>
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
              <span><FileSignature size={16} /> Firma solicitada al cliente</span>
              <span><ShieldCheck size={16} /> Historial auditado</span>
            </div>
          </article>
        </div>
      </section>

      <section className="section kb-strip">
        <article>
          <p className="eyebrow">KB PARA COPILOTO</p>
          <h2>Experto en gestión jurídica y operación de estudio.</h2>
          <p>El copiloto entiende expedientes, vencimientos, presentaciones, escritos, honorarios, gastos, clientes y documentación pendiente.</p>
        </article>
        <div className="kb-list">
          <span><CalendarDays size={18} /> Expedientes que vencen esta semana.</span>
          <span><FileText size={18} /> Escritos todavía no presentados.</span>
          <span><BadgeDollarSign size={18} /> Clientes con honorarios pendientes.</span>
          <span><TimerReset size={18} /> Causas sin movimiento hace 90 días.</span>
          <span><MessageCircle size={18} /> Resumen ejecutivo para cliente o socio.</span>
        </div>
      </section>

      <section id="links" className="section public-links">
        <div className="section-title">
          <p className="eyebrow">LINKS PÚBLICOS DEMO</p>
          <h2>Cómo se comparte documentación legal sin abrir el backoffice.</h2>
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
          <h2>Sterling Whitman LLP, un estudio jurídico premium funcionando sobre DiceProjects.</h2>
          <p>La demo muestra clientes, casos, documentos, estados, vencimientos, costos y dashboard realista para vender una plataforma jurídica completa.</p>
        </div>
        <form>
          <input placeholder="Nombre" />
          <input placeholder="Email" />
          <textarea placeholder="Contanos si querés demo para estudio jurídico, área legal corporativa o escribanía" />
          <button className="button primary" type="button">Solicitar demo</button>
        </form>
      </section>

      <footer>CaseFlow no es gestión genérica de tareas. Es BackOffice jurídico sobre DiceProjects Core.</footer>
      <Copilot />
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
