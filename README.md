# NOC Intelligence Hub

Protótipo de portal operacional 24×7 para um NOC, com dados simulados para demonstrar os fluxos de trabalho.

## Funcionalidades

- Visão central de serviços, topologia, alertas prioritários e trilha de auditoria.
- Gestão de escalas e passagem de turno.
- Indicadores de desempenho e visualizações de integrações com Zabbix Analyzer, Trigger Factory e OperaDash.

## Executar localmente

Node.js e npm.

Na raiz do projeto, execute:

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite e navegue pelas seções do menu lateral. Os dados de demonstração vêm de [`mockNocData.ts`](src/data/mockNocData.ts).

## Comandos

- `npm run lint` — Verifica os tipos do TypeScript.
- `npm run build` — Gera a versão de distribuição.
- `npm run preview` — Pré-visualiza o build do Vite.

## Arquivos de referência

- [Dados simulados](src/data/mockNocData.ts)
- [Gestão de turnos](src/components/ShiftManagerView.tsx)
- [Passagem de turno](src/components/ShiftIntelligenceView.tsx)
