# Checklist de Testes do MVP - CuidaPet

Documento de apoio para a primeira rodada de testes reais do app CuidaPet com uma usuária beta.

O objetivo é validar se as funções principais do MVP estão claras, estáveis e úteis no uso real antes de liberar o app para mais pessoas.

## Informações do teste

| Campo | Preenchimento |
| --- | --- |
| Nome da usuária |  |
| Data do teste |  |
| Versão/APK testado |  |
| Celular/modelo |  |
| Versão do Android |  |
| Conta usada no app |  |
| Teste feito com internet? |  |
| Observações gerais |  |

## Legenda de status

Use uma das opções abaixo no campo **Status**:

- `OK`: funcionou como esperado.
- `Erro`: não funcionou.
- `Dúvida`: funcionou, mas ficou confuso.
- `Não testado`: não foi possível testar.

---

# 1. Autenticação

| Cenário | Resultado esperado | Status | Observações |
| --- | --- | --- | --- |
| Abrir o app instalado no celular | Exibe a tela inicial/splash do CuidaPet antes de ir para login ou home |  |  |
| Criar uma nova conta com e-mail e senha | Conta é criada e o app entra na Home ou orienta a confirmar e-mail, conforme configuração do Supabase |  |  |
| Fazer login com conta existente | Usuária entra no app e vai para a Home |  |  |
| Fechar completamente o app e abrir novamente | Usuária continua logada e vai direto para a Home |  |  |
| Fazer logout pelo Perfil | Sessão é encerrada e app volta para a tela de login |  |  |
| Tentar entrar com senha errada | App mostra mensagem amigável de erro |  |  |

---

# 2. Cadastro de pets

| Cenário | Resultado esperado | Status | Observações |
| --- | --- | --- | --- |
| Acessar a aba Pets | Lista de pets aparece ou mostra estado vazio claro |  |  |
| Cadastrar pet comum, exemplo cachorro/gato | Pet é salvo e aparece na lista |  |  |
| Cadastrar pet exótico, exemplo cobra, lagarto, ave ou roedor | App permite escolher grupo, espécie, espécie específica e morfo/variação quando fizer sentido |  |  |
| Cadastrar pet com foto | Foto é enviada e aparece no card/lista do pet |  |  |
| Editar/trocar foto de um pet | Nova foto aparece na lista e no detalhe do pet |  |  |
| Cadastrar pet com peso atual | Peso é obrigatório e aparece de forma amigável no card/detalhe |  |  |
| Tentar cadastrar pet sem peso | App bloqueia e mostra erro de campo obrigatório |  |  |
| Cadastrar pet escolhendo idade aproximada | Idade aparece de forma amigável no card ou detalhe |  |  |
| Cadastrar pet escolhendo data de nascimento | Data é salva e aparece no detalhe do pet |  |  |
| Alternar entre idade aproximada e data de nascimento | O app mantém apenas o campo escolhido ativo, sem confundir a usuária |  |  |
| Alterar o grupo do animal durante o cadastro | Campos dependentes são limpos para evitar combinações erradas |  |  |
| Tentar cadastrar pet sem nome | App bloqueia e mostra erro de campo obrigatório |  |  |
| Tentar cadastrar pet sem espécie/grupo obrigatório | App bloqueia e mostra erro de campo obrigatório |  |  |
| Abrir detalhe de um pet cadastrado | Tela mostra dados gerais do pet |  |  |
| Abrir detalhe de pet com foto | Foto aparece no cabeçalho/detalhe do pet |  |  |
| Editar dados de um pet | Dados são atualizados corretamente |  |  |
| Excluir um pet de teste | Pet é removido da lista |  |  |

---

# 3. Registro de peso

| Cenário | Resultado esperado | Status | Observações |
| --- | --- | --- | --- |
| Informar peso atual ao cadastrar um novo pet | App cria o pet e registra automaticamente o primeiro peso |  |  |
| Ver card/lista de pets após cadastrar peso | Último peso aparece no card do pet |  |  |
| Abrir aba/seção Peso no detalhe do pet | Mostra o último peso registrado e o histórico |  |  |
| Registrar novo peso com data atual | Novo registro aparece no histórico/timeline |  |  |
| Registrar peso com observação | Observação é salva junto ao registro |  |  |
| Tentar registrar peso zero ou negativo | App bloqueia e mostra erro amigável |  |  |
| Ver Home com controle de peso | Card de controle de peso mostra pets com último peso registrado |  |  |

---

# 4. Vacinas

| Cenário | Resultado esperado | Status | Observações |
| --- | --- | --- | --- |
| Abrir seção Vacinas no detalhe do pet | Lista de vacinas aparece ou mostra estado vazio claro |  |  |
| Cadastrar vacina aplicada | Vacina é salva e aparece na lista do pet |  |  |
| Cadastrar vacina com próxima dose | Próxima data aparece corretamente |  |  |
| Cadastrar vacina sem próxima dose | App permite salvar sem data futura |  |  |
| Editar vacina cadastrada | Informações são atualizadas |  |  |
| Excluir vacina de teste | Vacina é removida da lista |  |  |
| Cadastrar vacina com próxima dose vencida | App destaca vacina atrasada |  |  |
| Ler aviso veterinário na tela de vacinas | Texto deixa claro que calendário ideal deve ser definido por veterinário |  |  |

---

# 5. Tratamentos

| Cenário | Resultado esperado | Status | Observações |
| --- | --- | --- | --- |
| Acessar aba Tratamentos | Lista de tratamentos aparece ou mostra estado vazio claro |  |  |
| Criar tratamento vinculado a um pet | Tratamento é salvo e aparece na lista |  |  |
| Criar tratamento com medicamento, dose, unidade e frequência | App salva as informações conforme preenchidas |  |  |
| Tentar criar tratamento sem pet | App bloqueia e informa que precisa vincular a um pet |  |  |
| Tentar criar tratamento sem medicamento | App bloqueia e mostra erro de campo obrigatório |  |  |
| Tentar criar tratamento com frequência zero ou negativa | App bloqueia e mostra erro amigável |  |  |
| Tentar criar tratamento com data final menor que inicial | App bloqueia e mostra erro amigável |  |  |
| Criar tratamento com doses futuras | App gera agenda de doses automaticamente |  |  |
| Finalizar/cancelar tratamento de teste | Tratamento muda de status e notificações futuras são canceladas |  |  |
| Ler aviso veterinário na tela de tratamento | Texto deixa claro que o CuidaPet não substitui orientação veterinária |  |  |

---

# 6. Agenda de doses

| Cenário | Resultado esperado | Status | Observações |
| --- | --- | --- | --- |
| Acessar aba Hoje | Doses do dia aparecem em ordem clara |  |  |
| Ver dose agendada | Mostra nome do pet, medicamento, dose, horário e status |  |  |
| Marcar dose como aplicada | Status muda para aplicada e horário aplicado é registrado |  |  |
| Pular dose | Status muda para pulada |  |  |
| Aplicar ou pular dose e atualizar tela | A dose continua com status correto após atualizar/reabrir app |  |  |
| Ver agenda sem doses no dia | App mostra estado vazio amigável |  |  |
| Alternar para calendário geral | App mostra cuidados de todos os pets agrupados por data |  |  |
| Ver evento no calendário geral | Evento mostra pet, tipo, data/horário e status quando existir |  |  |
| Conferir eventos de vacina no calendário geral | Vacinas futuras e vencidas aparecem com identificação clara |  |  |
| Conferir pesos no calendário geral | Registros de peso aparecem como eventos históricos |  |  |

---

# 6.1 Agenda individual do pet

| Cenário | Resultado esperado | Status | Observações |
| --- | --- | --- | --- |
| Abrir detalhe de um pet e acessar aba Agenda | Mostra a agenda completa daquele animal |  |  |
| Ver tratamento com múltiplos horários | Doses aparecem nas datas e horários corretos |  |  |
| Ver vacina do pet na agenda individual | Vacina aparece na data correta |  |  |
| Ver peso do pet na agenda individual | Pesagens aparecem como histórico do animal |  |  |
| Abrir agenda de pet sem eventos | App mostra estado vazio amigável |  |  |

---

# 7. Histórico

| Cenário | Resultado esperado | Status | Observações |
| --- | --- | --- | --- |
| Acessar aba Histórico | Mostra doses aplicadas e puladas |  |  |
| Ver dose aplicada no histórico | Mostra pet, medicamento, dose, horário previsto, horário aplicado e status |  |  |
| Ver dose pulada no histórico | Mostra pet, medicamento, dose, horário previsto e status pulada |  |  |
| Conferir ordem da lista | Registros mais recentes aparecem primeiro |  |  |
| Abrir histórico sem registros | App mostra estado vazio amigável |  |  |

---

# 8. Notificações locais

> Testar preferencialmente em celular Android real, com o APK instalado.

| Cenário | Resultado esperado | Status | Observações |
| --- | --- | --- | --- |
| Fazer login após instalar APK limpo | Android solicita permissão de notificações no primeiro acesso após login, ou o app deixa claro que a permissão já foi definida |  |  |
| Abrir Perfil e verificar permissões | Tela mostra status atual das notificações, quantidade pendente e orientação sobre alarmes exatos quando necessário |  |  |
| Tocar em "Ativar notificações" | Android solicita permissão ou app informa que já está permitido |  |  |
| Se aparecer aviso de horários exatos | Botão abre as configurações de alarmes/lembretes exatos do CuidaPet |  |  |
| Criar tratamento com dose para daqui 2 minutos | App agenda notificação futura automaticamente e informa quantos lembretes ficaram pendentes |  |  |
| Fechar completamente o app após criar dose futura | Notificação aparece no horário previsto mesmo com app fechado |  |  |
| Bloquear a tela do celular antes do horário da dose | Notificação aparece na tela bloqueada |  |  |
| Criar tratamento com dois horários futuros | Perfil mostra notificações pendentes para os dois horários após sincronizar |  |  |
| Editar ou recriar tratamento de teste | Notificações antigas são removidas e novas são agendadas sem duplicar |  |  |
| Finalizar/cancelar tratamento | Notificações futuras daquele tratamento são canceladas |  |  |
| Marcar dose como aplicada antes do horário | Notificação daquela dose é cancelada |  |  |
| Pular dose antes do horário | Notificação daquela dose é cancelada |  |  |
| Sincronizar lembretes pelo Perfil | App informa quantidade de notificações pendentes/sincronizadas |  |  |
| Testar com permissão negada | App orienta a ativar notificações nas configurações do celular |  |  |
| Reabrir app depois de sincronizar | Rotina de reconciliação não duplica notificações pendentes |  |  |

Observações importantes para Android:

- Testar com o celular bloqueado e com o app fechado.
- Android pode atrasar notificações em modo economia de bateria/Doze, mesmo com `allowWhileIdle`.
- Para remédios, permitir **Alarmes e lembretes exatos** nas configurações do app aumenta a precisão.
- O botão de notificação de teste só aparece em ambiente de desenvolvimento; no APK de teste real, validar criando um tratamento para poucos minutos no futuro.

---

# Perguntas para feedback da usuária

## Primeira impressão

| Pergunta | Resposta |
| --- | --- |
| O app parece fácil de entender na primeira abertura? |  |
| Ficou claro para que serve o CuidaPet? |  |
| Alguma tela pareceu confusa ou poluída? Qual? |  |
| O texto dos botões está claro? |  |

## Cadastro de animais

| Pergunta | Resposta |
| --- | --- |
| Foi fácil cadastrar um animal? |  |
| As opções de grupo, espécie, espécie específica e morfo fizeram sentido? |  |
| Faltou alguma espécie, variação ou tipo de animal? |  |
| O cadastro ficou longo demais? |  |

## Tratamentos e doses

| Pergunta | Resposta |
| --- | --- |
| Foi fácil cadastrar um tratamento? |  |
| Ficou claro que a dose deve ser preenchida conforme orientação veterinária? |  |
| A agenda de hoje ajudou a entender o que precisa ser feito? |  |
| O histórico ajudou a conferir o que já foi aplicado ou pulado? |  |

## Peso e vacinas

| Pergunta | Resposta |
| --- | --- |
| O controle de peso parece útil? |  |
| O histórico de peso está fácil de entender? |  |
| O cadastro de vacinas está claro? |  |
| A indicação de vacina vencida/próxima ajudou? |  |

## Notificações

| Pergunta | Resposta |
| --- | --- |
| A notificação apareceu no horário esperado? |  |
| O texto da notificação foi claro? |  |
| Você confiaria no app para lembrar um remédio importante? Por quê? |  |
| Alguma permissão ou configuração do celular ficou confusa? |  |

## Uso geral

| Pergunta | Resposta |
| --- | --- |
| O que você mais gostou no app? |  |
| O que mais te incomodou? |  |
| O que precisa melhorar antes de indicar para outra pessoa? |  |
| Que funcionalidade você esperava encontrar e ainda não existe? |  |
| De 0 a 10, quanto você indicaria o CuidaPet para outro tutor? |  |

---

# Bugs encontrados

Use esta seção para registrar problemas encontrados durante o teste.

## Bug 1

| Campo | Preenchimento |
| --- | --- |
| Descrição |  |
| Onde aconteceu? |  |
| Passos para reproduzir |  |
| Resultado esperado |  |
| Resultado obtido |  |
| Impacto | Baixo / Médio / Alto |
| Prioridade | Baixa / Média / Alta / Crítica |
| Status | Aberto / Em análise / Corrigido / Não reproduzido |
| Evidência | Print, vídeo ou observação |

## Bug 2

| Campo | Preenchimento |
| --- | --- |
| Descrição |  |
| Onde aconteceu? |  |
| Passos para reproduzir |  |
| Resultado esperado |  |
| Resultado obtido |  |
| Impacto | Baixo / Médio / Alto |
| Prioridade | Baixa / Média / Alta / Crítica |
| Status | Aberto / Em análise / Corrigido / Não reproduzido |
| Evidência | Print, vídeo ou observação |

## Bug 3

| Campo | Preenchimento |
| --- | --- |
| Descrição |  |
| Onde aconteceu? |  |
| Passos para reproduzir |  |
| Resultado esperado |  |
| Resultado obtido |  |
| Impacto | Baixo / Médio / Alto |
| Prioridade | Baixa / Média / Alta / Crítica |
| Status | Aberto / Em análise / Corrigido / Não reproduzido |
| Evidência | Print, vídeo ou observação |

---

# Resultado da rodada

| Campo | Preenchimento |
| --- | --- |
| Teste concluído? | Sim / Não |
| Principais problemas encontrados |  |
| Principais melhorias sugeridas |  |
| Pode liberar para mais usuários? | Sim / Não / Com ajustes |
| Ajustes obrigatórios antes da próxima rodada |  |
