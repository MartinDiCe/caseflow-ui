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

No se debe vender como terminado todavía:

- Portal cliente completo.
- OCR documental.
- Integraciones AFIP/ARCA, Drive, SharePoint, Outlook o Gmail.
- Automatizaciones outbound avanzadas.

## Demo

La landing acompaña el tenant demo `Sterling Whitman LLP`, cargado por API con 120 clientes y 300 expedientes jurídicos. Es una demostración vertical del motor universal de CaseFlow.
