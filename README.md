# CaseFlow Pub

Landing comercial de CaseFlow by DiceProjects.

CaseFlow Pub posiciona la gestión de casos como una plataforma para organizaciones que trabajan por casos, expedientes y procesos profesionales. La demo actual usa un estudio jurídico como caso de éxito, pero el producto no queda limitado a una profesión.

## Stack

- React + Vite
- TypeScript
- CSS propio
- Lucide Icons
- Netlify-ready

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

URL local por defecto:

```text
http://localhost:3006
```

## Posicionamiento

CaseFlow no se vende como un gestor genérico de tareas. Se presenta como una plataforma operativa por casos:

- Caso como entidad principal.
- Expedientes con flujo de estados.
- Calendario de audiencias, reuniones, inspecciones, presentaciones y vencimientos.
- Documentos, plantillas, borradores, envíos y entregas públicas.
- Honorarios, gastos, costos y time tracking.
- Dashboard de casos.
- Copiloto operativo conectado al contexto del expediente.

## Funcionalidades actuales y alcance

Disponible en la demo/API:

- Casos y tipos de caso.
- Estados y workflows configurables.
- Tareas, participantes, documentos, vencimientos, eventos/calendario, time tracking, honorarios, gastos, firmas/entregas, notas e historial.
- Dashboard y links públicos documentales.
- Copiloto comercial con KB específica.
- Workspaces por rubro/línea de negocio: legal, contable, escribanía, seguros, auditoría, etc.
- Acceso externo opcional: APIs públicas controladas, links seguros, formularios y landings sin obligar a portal cerrado.
- Capturas reales del backoffice DiceProjects para dashboard, expedientes y copiloto.

No se debe vender como terminado todavía:

- Portal cliente completo.
- OCR documental.
- Integraciones AFIP/ARCA, Drive, SharePoint, Outlook o Gmail.
- Automatizaciones outbound avanzadas.

## Demo

La landing acompaña el tenant demo `Sterling Whitman LLP`, cargado por API como operación profesional multiworkspace:

- 100 casos.
- 20 tipos de caso.
- 5 workspaces: legal, accounting, notary, insurance y audit.
- 10 leads.
- 5 propuestas.
- 40 links seguros.
- 54 relaciones.
- 30 documentos en Biblioteca Profesional.
- 5 automatizaciones.
- 20 documentos de billing.

Es una demostración vertical del motor universal de CaseFlow, no un producto limitado al rubro jurídico.

## Criterio UI

La interfaz pública debe transmitir plataforma enterprise y backoffice moderno:

- Mucho blanco, grises y azules institucionales.
- Caso como entidad principal.
- Workspace como dominio operativo.
- Dashboard ejecutivo antes que tablas.
- Biblioteca Profesional en lugar de "knowledge" visible para usuario final.
- Copiloto como asistente profesional, no como chatbot genérico.
- Links externos como extensión opcional, sin prometer portal cerrado obligatorio.

## Criterio de acceso externo

CaseFlow se comunica como:

```text
BackOffice CaseFlow
-> APIs públicas controladas
-> Links seguros / formularios / landings opcionales
-> Portal custom sólo si el cliente lo necesita
```

No se promete portal cliente obligatorio. Los links públicos documentales y de aprobación simulan la experiencia externa profesional sin exponer el backoffice.

## Copiloto

El copiloto público y comercial debe entender:

- qué es un caso;
- qué es un workspace;
- cómo nacen checklist, vencimientos y plantillas por tipo;
- cómo se consultan expedientes, documentos y links públicos;
- cómo se calcula operación sin depender del LLM para KPIs básicos;
- qué módulos existen en la demo y cómo aplican a estudios jurídicos, contables, escribanías, auditorías, seguros y otros equipos profesionales.
