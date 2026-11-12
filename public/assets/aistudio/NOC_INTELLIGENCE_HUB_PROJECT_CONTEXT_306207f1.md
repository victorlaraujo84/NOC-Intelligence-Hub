# NOC Intelligence Hub — Contexto inicial do projeto

Fonte principal: [Análise operacional do NOC](chatgpt-conversation://6af50de1-083c-83ea-aaf4-b818c9e8dc3d). Consolidação em 12 de novembro de 2026.

## 1. Visão e decisões

O NOC Intelligence Hub é uma iniciativa para integrar ferramentas existentes e apoiar a gestão de um NOC 24×7 de infraestrutura e serviços de TI. A visão reúne visibilidade operacional, qualidade do monitoramento, escalas, passagem de turno e relatórios sobre a operação. Os problemas a investigar são lacunas de cobertura, perda de contexto entre turnos, fragmentação de informações e dificuldade de atribuir contribuições individuais com evidência. O impacto desses problemas ainda precisa ser medido.

| Status | Registro |
| --- | --- |
| Decisão expressa pelo usuário | Começar pelo Discovery técnico de Zabbix-Analyzer, Triggers Factory e OperaDash antes de implementar o Hub. |
| Esclarecimento do usuário | ECC refere-se ao projeto `affaan-m/ECC`, Everything Claude Code. |
| Diretrizes do Discovery | Inspecionar os projetos existentes em modo somente leitura. Documentar conclusões com evidências. Preservar as aplicações e avaliar reutilização e integração antes de propor reescritas. |
| Escopo funcional discutido | Core Hub, Shift Manager, Shift Intelligence e Performance Intelligence. Monitoring Quality permanece no escopo atribuído ao Triggers Factory na conversa. Validar as fronteiras no código. |
| Propostas em aberto | Quarto repositório para o Hub, topologia, stack, modelo de identidade, contratos, persistência, Docker Compose, uso do ECC e sequência de implementação. |
| Evidência pendente | URLs e branches dos três projetos, tecnologias atuais, APIs, autenticação, dados, implantação, volumes, incidentes e baseline operacional. |

O histórico acessível contém cinco turnos e nenhum anexo. As descrições dos produtos registram a visão discutida. O Discovery deverá confirmar suas capacidades efetivas.

## 2. Aplicações existentes e fronteiras

| Aplicação | Papel descrito na conversa | O que confirmar no Discovery |
| --- | --- | --- |
| Zabbix-Analyzer | Análise e inteligência sobre monitoramento e dados do Zabbix. | Origem e fluxo dos eventos, ingestão e correlação, consultas, exportações, APIs, retenção, autenticação e custo de processamento. |
| Triggers Factory | Gestão e qualidade das triggers do Zabbix. Referência de Monitoring Quality. | Fluxos de gestão de triggers, regras, dados e interfaces reutilizáveis. Verificar como o Hub pode consumir resultados preservando essa responsabilidade. |
| OperaDash | Visibilidade e acompanhamento operacional. | Dashboards, fontes, identidade, componentes reutilizáveis e alternativas para integração com o portal. |

## 3. Requisitos funcionais discutidos

Os itens abaixo são escopo de trabalho para validação. A coluna de aceite registra critérios sugeridos para orientar a discussão.

| Módulo | Capacidades discutidas | Aceite sugerido |
| --- | --- | --- |
| **Core Hub** | Portal central, autenticação e autorização por papéis, cadastro de analistas e equipes, configurações, integrações e auditoria. | Identidade consistente entre equipes e integrações. Papéis controlam ações e acesso aos dados. Ações auditáveis registram responsável e horário. |
| **Shift Manager** | Escalas 24×7 configuráveis, incluindo 4×1, 5×2, 6×1 e 12×36. Planejamento e registro de jornadas realizadas. Trocas, ausências, substituições, histórico e validação de cobertura. | Uma escala planejada pode ser comparada à realizada. Trocas e ausências preservam histórico. Lacunas de cobertura aparecem conforme a regra configurada. |
| **Shift Intelligence** | Passagem estruturada de turno, transferência de incidentes e pendências, registro de ações, confirmação de recebimento e continuidade auditável. | Um item pode ser registrado, transferido e recebido com responsáveis, horários e histórico consultável. |
| **Performance Intelligence** | Relatórios semanais individuais e coletivos, indicadores por jornada e turno, produtividade, eficiência, qualidade, reconhecimento de contribuições, tendências e comparação contextualizada. | Os indicadores podem ser rastreados até os registros de origem. Relatórios distinguem eventos do turno de ações comprovadas e mostram as condições da comparação. |

Validar regras de fuso horário e jornadas que atravessam a meia-noite, cobertura mínima, sobreposição, aprovações, identificação dos analistas entre sistemas, acesso a dados individuais e retenção. Esses detalhes ainda carecem de definição.

## 4. Métricas, metas e dados fictícios

### Indicadores operacionais

A conversa definiu as dimensões jornada, turno, analista e equipe para os relatórios semanais. As fórmulas abaixo são propostas para validar com a operação e com os dados disponíveis.

| Dimensão | Indicador candidato | Definição a validar |
| --- | --- | --- |
| Cobertura | Percentual de cobertura realizada | Horas-postos cobertas ÷ horas-postos requeridas na janela. Contar sobreposição conforme a política de cobertura e apresentar previsto e realizado separadamente. |
| Continuidade | Recebimento de pendências | Pendências com recebimento confirmado ÷ pendências transferidas na janela. Exibir pendências abertas e critério de corte. |
| Atividade e produtividade | Ações registradas por hora de jornada realizada | Contar apenas ações atribuíveis a partir de registros verificáveis. Informar denominador, volume, natureza do trabalho e dados faltantes. |
| Eficiência | Tempo até primeira ação registrada | Diferença entre início elegível do atendimento e primeira ação verificável. Definir evento inicial, janela e tratamento de casos sem ação. |
| Qualidade | Contribuições verificáveis e qualidade da passagem | Definir critérios e evidências para contribuição e completude. Comparar resultados considerando severidade, volume, jornada e condições do turno. |

O fato de um alerta ocorrer durante a jornada indica exposição do turno. Atribuir uma ação individual exige autoria verificável. Antes de publicar avaliações individuais, validar fórmulas, critérios de atribuição, comparabilidade e permissões.

### Metas técnicas sugeridas na conversa

| Indicador | Meta inicial proposta | Condição a especificar |
| --- | --- | --- |
| Latência de API P95 | Abaixo de 300 ms em consultas simples | Endpoints, concorrência, volume e condições de cache. |
| Abertura de dashboards | Abaixo de 2 s | Tela, ponto inicial e final de medição, rede, dispositivo e carga. |
| Relatório semanal | Abaixo de 10 s com dados pré-agregados | Período, tamanho da base e forma de entrega. |
| Processamento de eventos | Sem perda e com reprocessamento seguro | Definir falhas cobertas, retenção, recuperação e deduplicação. |
| Recursos e testes | Limites por container e cobertura dos fluxos críticos e de carga | Definir orçamento de CPU/memória, cenários e critérios de falha. |

Medir P95, memória, fila e atraso de processamento, consultas lentas e tempo de geração dos relatórios. As metas aguardam baseline e aprovação.

### Exemplo fictício para validar as regras

Dados criados para esta consolidação. Em uma jornada de 8 h, ocorreram 12 alertas. A pessoa identificada como `Analista A` registrou 3 ações com autoria verificável. O relatório do turno pode mostrar os 12 alertas. O indicador individual usa as 3 ações verificadas, o que resulta em 0,375 ação por hora no exemplo. Se 4 de 5 pendências transferidas tiveram recebimento confirmado até o corte, a taxa ilustrativa é 80%. Esses números servem para conferir os cálculos. A fonte consultada não fornece dados operacionais reais.

## 5. Arquitetura e desempenho — hipóteses

Comparar três opções sobre o código real e as necessidades do NOC.

| Opção | Desenho a avaliar | Questão de decisão |
| --- | --- | --- |
| A. Monorepo | Módulos do Hub em uma base comum e avaliação do que pode ser incorporado. | Quais componentes ganham com versionamento conjunto e quais gerariam acoplamento ou reescrita? |
| B. Aplicações independentes | Integração por interfaces existentes, como APIs, webhooks ou exportações, quando comprovadas. | É possível compartilhar identidade e contexto com manutenção e operação aceitáveis? |
| C. Híbrida | Hub central com seus módulos e adaptadores para aplicações existentes independentes. | O portal e os contratos centrais entregam a integração esperada com isolamento de falhas? |

- **Candidata inicial para o Hub:** TypeScript, Next.js/React no frontend, NestJS na API e PostgreSQL para persistência relacional. Preservar runtimes existentes onde a integração for suficiente.
- **Alternativa discutida:** Go para a API ou para ingestão e correlação intensivas. A escolha depende de profiling, volume, concorrência e custo de manutenção. Node.js continua candidato para escalas, usuários e relatórios.
- **Componentes condicionais:** Redis para cache ou filas mediante necessidade medida, BullMQ caso existam workers Node.js, TimescaleDB se a carga temporal justificar e Traefik ou Nginx se houver necessidade de roteamento e TLS no proxy.
- **Integração:** avaliar APIs versionadas, eventos operacionais e identidade compartilhada. Definir o sistema responsável por cada dado, permissões e auditoria. Inventariar contratos atuais antes de estabelecer contratos novos.
- **Processamento:** avaliar ingestão incremental, tarefas pesadas assíncronas, reprocessamento idempotente, índices por período/turno/analista, particionamento se justificado, agregações semanais e cache. Medir o efeito sobre os fluxos interativos.
- **Decisão:** comparar reutilização, manutenção, isolamento de falhas, segurança, performance, evolução e custo operacional. Registrar escolhas e evidências em ADRs após revisão.

## 6. Estratégia Docker — proposta

Docker Compose foi sugerido como ponto de partida para desenvolvimento e implantação. A prontidão de cada aplicação ainda será avaliada.

1. Inventariar Dockerfiles, arquivos Compose, imagens e versões, serviços, portas, redes, volumes, dependências, variáveis esperadas, verificações de saúde e rotinas de migração. Registrar nomes e referências de configuração sem reproduzir valores secretos.
2. Propor a composição mínima após o inventário. Avaliar portal e API, PostgreSQL, adaptadores ou serviços existentes e, quando justificados, workers, Redis e proxy. Definir persistência, exposição de portas e ordem de inicialização.
3. Planejar isolamento dos serviços analíticos, limites por container, coleta de logs e métricas e validação dos fluxos críticos sob carga. Levantar requisitos de backup, restauração e recuperação antes de escolher a topologia de produção.
4. Usar evidências estáticas durante o Discovery. A validação de build, subida, health checks e recuperação pertence à fase Foundation, após revisão do plano.

## 7. Codex e ECC

ECC apoia planejamento, revisão, testes, verificação e documentação no ambiente de engenharia. O desempenho do Hub em produção depende do desenho da aplicação e das medições. O repositório oficial documenta o plugin nativo para Codex e trata a sincronização manual como compatibilidade legada. Verificar os recursos disponíveis no ambiente, revisar hooks e permissões e adotar um único método de configuração. A instalação permanece pendente de confirmação no ambiente do projeto. [ECC — Codex App and CLI](https://github.com/affaan-m/ECC#codex-app-and-cli)

```powershell
codex plugin list --json
# Se for adotada a instalação nativa e o plugin estiver ausente:
codex plugin marketplace add affaan-m/ECC
codex plugin add ecc@ecc
codex plugin list --json
```

A conversa também mencionou o instalador guiado `ecc-universal@2.2.3`. A versão fica registrada como referência histórica. Para a instalação futura, seguir o procedimento oficial compatível com o Codex disponível.

Fluxo de engenharia proposto: repositório privado, `main` protegida, branches por funcionalidade, PRs pequenos, testes unitários, de integração e E2E conforme o risco e decisões registradas em Markdown e ADRs. Definir o `AGENTS.md` do Hub após revisar o Discovery. Usar ECC onde estiver disponível e for adequado à tarefa.

## 8. Preparação do workspace

A conversa propôs um quarto repositório, `noc-intelligence-hub`, inicialmente dedicado ao contexto, à documentação e ao desenho de integração. Para o ambiente local, uma estrutura possível é:

```text
NOC-Workspace/
├── noc-intelligence-hub/
├── zabbix-analyzer/
├── triggers-factory/
└── operadash/
```

1. Reunir os URLs reais ou os caminhos locais e identificar a branch ou commit de referência de cada projeto. Usar acesso autorizado para repositórios privados.
2. Colocar os checkouts na estrutura acima ou ajustar os caminhos no prompt. Abrir o projeto Codex no diretório do Hub e verificar que a sessão enxerga os três projetos. Em ambiente remoto, disponibilizar os repositórios autorizados no próprio ambiente.
3. Salvar este Markdown no Hub e incluí-lo como contexto da primeira tarefa. Permitir leitura dos projetos existentes e concentrar os resultados do Discovery em `noc-intelligence-hub/docs/discovery/`.

## 9. Prompt inicial de Discovery — copiar para o Codex

```text
Realize o Discovery técnico do NOC Intelligence Hub. Leia NOC_INTELLIGENCE_HUB_PROJECT_CONTEXT.md e inspecione os repositórios Zabbix-Analyzer, Triggers Factory e OperaDash. Use os caminhos ../zabbix-analyzer, ../triggers-factory e ../operadash quando corresponderem ao workspace. Confirme o acesso e registre branch e commit de cada fonte. Se uma fonte estiver indisponível, documente a lacuna e prossiga com as acessíveis.

Escopo: análise estática e documentação em docs/discovery/ dentro do Hub. Mantenha os três repositórios existentes em modo somente leitura. Não instale dependências, execute scripts de instalação ou migração, acesse produção, execute comandos destrutivos ou implemente código de produto. Use exemplos e referências de configuração para mapear variáveis. Não leia ou reproduza valores de .env, tokens, senhas ou credenciais. Não envie código ou dados a serviços externos sem autorização.

1. Inventarie linguagens, frameworks, runtimes e versões, estrutura, dependências, entrypoints, serviços, bancos, sistemas externos, autenticação, permissões, APIs, Docker, testes e documentação.
2. Descreva a arquitetura atual e os fluxos de dados. Mapeie acoplamentos, pontos de integração, componentes reutilizáveis, riscos defensivos de segurança, possíveis gargalos e tarefas candidatas a processamento assíncrono.
3. Mapeie interfaces e dados que possam servir ao Core Hub, Shift Manager, Shift Intelligence e Performance Intelligence. Valide a fronteira de Monitoring Quality do Triggers Factory. Avalie identidade de analistas, APIs versionadas, eventos, persistência, auditoria e rastreabilidade de métricas.
4. Avalie a prontidão Docker por serviço com evidência estática. Registre portas, volumes, redes, nomes de variáveis, dependências, verificações de saúde e lacunas para Compose.
5. Compare monorepo, aplicações independentes e Hub híbrido por reutilização, manutenção, desempenho, segurança, isolamento de falhas, evolução e custo operacional. Recomende uma opção com condições e pontos ainda sujeitos a decisão.

Entregue:
- docs/discovery/REPOSITORY_INVENTORY.md
- docs/discovery/ARCHITECTURE_AS_IS.md
- docs/discovery/INTEGRATION_OPPORTUNITIES.md
- docs/discovery/TECHNICAL_RISKS.md
- docs/discovery/DOCKER_READINESS.md
- docs/discovery/RECOMMENDATIONS.md

Para cada conclusão material, cite repositório, commit, caminho e linha ou símbolo. Classifique como fato verificado, hipótese ou informação não encontrada e indique como resolver lacunas. Use português do Brasil e mantenha nomes de arquivos e identificadores técnicos originais.

Finalize com um resumo executivo da situação dos três projetos, pontos reais de integração, riscos prioritários, arquitetura recomendada, dependências e próximas tarefas. Submeta as recomendações à revisão antes de iniciar implementação.
```

## 10. Roadmap proposto e próximos passos

| Fase | Entrega e condição de revisão |
| --- | --- |
| 0. Discovery | Seis documentos com evidências e lacunas. Revisar a recomendação e selecionar arquitetura, limites dos módulos e dependências. |
| 1. Foundation | Estrutura do Hub e ambiente Compose reproduzível. Demonstrar inicialização, persistência e saúde dos serviços definidos. |
| 2. Core | Portal, identidade, equipes, papéis e auditoria. Verificar permissões e registros de ações. |
| 3. Shift Manager | Escalas planejadas e realizadas, cobertura e mudanças de jornada. Testar os padrões e exceções acordados. |
| 4. Shift Intelligence | Fluxo de transferência e confirmação de pendências com trilha auditável. |
| 5. Integrations | Contratos e adaptadores validados para as integrações aprovadas. Verificar comportamento sob indisponibilidade e reprocessamento. |
| 6. Performance | Relatórios semanais individuais e coletivos. Validar rastreabilidade, fórmulas, permissões e desempenho com volume representativo. |
| 7. Hardening | Verificar segurança, observabilidade, recuperação e carga com critérios aprovados. Consolidar documentação de operação. |

**Próxima ação:** disponibilizar as três referências de código, registrar os commits e executar o prompt da seção 9. Na revisão do Discovery, decidir o desenho inicial, confirmar escopo e métricas com a operação e publicar o `AGENTS.md` e os ADRs pertinentes. A documentação de visão, módulos, arquitetura, estratégia de integração, roadmap e decisões pode então ser organizada em `docs/`. Dividir a implementação aprovada em entregas verificáveis. O cadastro de modelos de turno é o exemplo de primeira fatia do Shift Manager discutido na conversa.

