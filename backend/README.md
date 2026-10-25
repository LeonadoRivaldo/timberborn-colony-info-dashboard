# Colony Info Backend

Processo local em Node 24, TypeScript strict, Fastify e Firebase Admin SDK.

Fluxo: API local do mod -> backend local -> Firestore -> frontend.
O frontend nao chama este processo. Cada backend atende uma instancia do jogo,
identificada pelas URLs locais configuradas no ambiente.

## Configuracao

Instale as dependencias com `npm ci` nesta pasta.

Configure um arquivo `.env` nesta pasta:

```dotenv
FIREBASE_PROJECT_ID=seu-projeto
GOOGLE_APPLICATION_CREDENTIALS=C:/credenciais/colony-info-service-account.json
PORT=7000
GAME_API_URL=http://localhost:7778/api/
COLONY_INFO_API_URL=http://localhost:7777/api/colony-info
```

`PORT` e a porta deste backend, nao a porta do jogo. Mantenha as tres portas
distintas quando as APIs do jogo usam `7777` e `7778`. Use os hostnames aceitos
pelo mod: a API de snapshot pode rejeitar `127.0.0.1` com `Invalid host`, mesmo
quando `localhost` funciona.

`GOOGLE_APPLICATION_CREDENTIALS` aponta para um JSON de conta de servico guardado
fora do repositorio. Alternativamente, use Application Default Credentials
configuradas no ambiente e omita essa variavel. Nunca envie o JSON ou suas chaves
ao frontend, ao GitHub ou para os logs.

A conta precisa de permissoes IAM de leitura/escrita do Firestore no projeto.
Use uma identidade dedicada com o menor privilegio necessario. A configuracao
Web publica usada pelo frontend nao substitui credenciais administrativas.

## Comandos

```sh
npm run dev
npm run build
npm start
npm test
```

Execute os comandos nesta pasta. `npm start` exige uma compilacao anterior com
`npm run build`; `npm run dev` executa o TypeScript com reinicio automatico.

O processo escuta apenas em `127.0.0.1`, na `PORT` configurada (`7000` no exemplo).
O frontend nao usa essas rotas: acessa o Firestore diretamente.

## Endpoints

| Metodo | Caminho | Finalidade |
| --- | --- | --- |
| GET | `/health` | Confirma que o processo esta ativo; nao valida Firebase ou jogo |
| GET | `/endpoints` | Lista os metodos e URLs registrados |
| POST | `/adapters/:state/:name` | Atualiza um adapter da colonia ativa |
| POST | `/adapters/levers/:state/:name` | Atualiza uma lever da colonia ativa |
| POST | `/adapters/indicators/:state/:name` | Atualiza um indicator da colonia ativa |

Os webhooks recebem os valores na URL, sem exigir corpo. O estado e `true`
somente quando `:state` e exatamente `on`; qualquer outro valor resulta em
`false`. Nao ha validacao que limite o parametro a `on` e `off`.

O controller remove os sufixos finais `_ADAPTER`, `_INDICATOR` e `_LEVER`,
nessa ordem e com distincao entre maiusculas e minusculas. O resultado e usado
como ID e campo `name`. A gravacao usa merge de `{ name, state }`, preservando
outros campos existentes. Um webhook pode recriar um documento excluido.

## Colonias E Polling

O job consulta `COLONY_INFO_API_URL` imediatamente ao iniciar e agenda a proxima
consulta 120 segundos depois da conclusao da anterior. Nao ha sobreposicao,
worker thread, fila externa ou dependencia adicional. Cada consulta tem timeout
de 10 segundos e grava o snapshot atual, sem criar historico:

```text
colonies/{settlementId}                  snapshot completo retornado pela API
colonies/{settlementId}/adapters/{id}     estados dos adapters
colonies/{settlementId}/levers/{id}       estados das levers
colonies/{settlementId}/indicators/{id}   estados e configuracao dos indicators
colonies/{settlementId}/events/{eventId}  historico de chamadas recebidas
```

A identidade vem de `colonyInfo.settlementId`; o nome de exibicao vem de
`colonyInfo.settlementName`. O snapshot inclui timestamp, recursos, populacao,
tempo e energia. Esses dados ficam no documento da colonia, nao em novos
documentos a cada consulta. Subcolecoes permanecem intactas ao atualizar o pai.

O snapshot e preservado integralmente. A validacao do polling verifica apenas
identificacao da colonia e timestamp; nao valida cada campo de recursos,
populacao ou energia. O formato atual tambem inclui:

- `resources.goods[].trend`: `{ type, daysLeft }`, com os tipos `HighDepletion`,
  `MediumDepletion`, `LowDepletion`, `Stable`, `LowGrowth`, `MediumGrowth` e
  `HighGrowth`. No snapshot observado, `Stable` retorna `daysLeft: -1`; esse
  valor nao representa um prazo valido. O backend nao calcula tendencias.
- Populacao: bem-estar medio, castores, forca de trabalho de castores e bots,
  camas, postos de trabalho, contaminacao e indicadores gerais da populacao.
- Redes de energia: `batteryChargeLevel`, `generatorCount` e `valid`, alem
  dos valores de geracao, demanda e baterias.

Ao detectar outra colonia, o job encerra o listener de levers anterior e observa
apenas a nova colonia. As chamadas ao jogo nao incluem settlementId na URL.
Falhas desativam o contexto e os comandos; o proximo ciclo tenta novamente.
Webhooks sem colonia identificada retornam erro 503, sem gravar na raiz.

A deteccao de troca de save ocorre somente no proximo polling: durante esse
intervalo, o contexto ainda e o ultimo conhecido. Para troca imediata, reinicie
o backend junto com o save ou acrescente futuramente uma notificacao do mod.

Dados antigos em `adapters` e `levers` na raiz nao sao migrados nem excluidos.
Novos webhooks alimentam as subcolecoes. Regras publicadas precisam permitir
ao UID autorizado ler `colonies` e suas subcolecoes e alterar as levers.
O job para antes do encerramento do cliente Firestore.

## Indicators

Cada documento recebido do jogo possui `name` e `state`. O frontend pode
adicionar a propriedade `config`, sem duplicar o nome:

```json
{
  "name": "DROUGHT",
  "state": true,
  "config": {
    "visible": true,
    "color": "#e2bb66"
  }
}
```

Atualizacoes do webhook preservam `config` por usarem merge. O frontend
atualiza apenas `config.visible` e `config.color`. Remover do painel apenas
desativa a visibilidade; excluir na pagina de gerenciamento apaga o documento.
O nome apresentado e formatado no frontend, sem persistir um alias.

## Event Log

As chamadas HTTP de adapters, levers e indicators geram documentos em
`colonies/{colonyId}/events/{eventId}`. Cada evento inclui `colonyId`, metodo,
endpoint sem query string, horario UTC de recebimento (`timestamp` ISO), status
HTTP, duracao em milissegundos, sucesso e mensagem de erro quando disponivel.
Headers, tokens e corpos das requisicoes nao sao armazenados. `/health` e
`/endpoints` nao geram eventos.
O endpoint inclui os parametros do caminho, como estado e nome da automacao;
nao coloque segredos nesses valores. Polling e comandos enviados ao jogo nao
geram documentos nesta colecao: suas falhas usam o logger do backend.

A colonia e capturada no inicio da chamada. A gravacao e iniciada em
`onResponse`, depois que a resposta foi enviada, e nao e aguardada pelo fluxo
do endpoint. Falhas de gravacao sao capturadas e registradas no logger do
backend, sem alterar o resultado da chamada original. Nao ha retry automatico
nem fila duravel: indisponibilidade do Firestore ou encerramento do processo
pode causar perda de eventos. Sem colonia ativa, nao ha persistencia e um
aviso e registrado no logger. Nao ha exclusao automatica de eventos.

O frontend le diretamente os ultimos 100 eventos da colonia selecionada,
ordenados por `timestamp` decrescente. As regras publicadas do Firestore devem
permitir leitura dessa subcolecao ao UID autorizado; escrita deve ficar restrita
ao backend com Admin SDK. Nenhuma regra e publicada automaticamente.

## Comandos Das Levers

O backend observa `colonies/{settlementId}/levers`, sem rota HTTP para comandos
do frontend. O webhook de levers apenas recebe atualizacoes vindas do jogo.
Os webhooks gravam `{ name: string, state: boolean }`. O modelo tambem declara
`springReturn: false`, mas o controller nao inicializa esse campo e o listener
usa somente nome e estado.
A primeira leitura apenas registra o estado inicial, sem executar comandos.
Mudancas posteriores de nome/estado e novos documentos disparam:

- `state: true`: GET `${GAME_API_URL}/switch-on/{name}`.
- `state: false`: GET `${GAME_API_URL}/switch-off/{name}`.

A barra final da URL base e normalizada e o nome e codificado na URL.
Exclusoes e alteracoes sem mudanca de nome/estado nao enviam comandos.
`springReturn` nao tem logica de retorno automatico. O backend nao regrava os
documentos. Requisicoes sao sequenciais, com timeout de 5 segundos; falhas sao
registradas sem retry automatico. O shutdown cancela listener e comandos pendentes.

## Estrutura Do Codigo

```text
src/
  app.ts
  main.ts
  core/
    config/
    controllers/
      adapters-webhook.controler.ts
    jobs/
      colony-polling.job.ts
    models/
      colony.model.ts
      lever.model.ts
      stored-document.ts
    routes/
      adapters.routes.ts
    services/
      adapters/
      colonies/
      events/
      firebase/
        firebase-client.ts
      firestore/
        firestore.repository.ts
      levers/
```

O cliente Firebase e criado na inicializacao. Servicos recebem a instancia
Firestore pelo construtor, sem singletons globais ou dependencias do Angular.
SIGINT e SIGTERM encerram o servidor e o cliente Firebase.

## Servico Generico

Estenda `FirestoreRepository<T>` e defina `collectionPath` como propriedade ou
getter quando as colecoes forem decididas. Passe a instancia do Firestore Admin
ao construtor. Nenhuma colecao e criada apenas por instanciar o repositorio.

| Metodo | Comportamento |
| --- | --- |
| `read(id)` | Retorna `{ id, data: T }` ou null |
| `list(buildQuery?)` | Lista documentos; aceita builder de consulta Admin SDK |
| `create(data)` | Grava e retorna ID gerado |
| `write(id, data)` | Cria ou substitui integralmente |
| `write(id, partial, { merge: true })` | Cria ou mescla campos, preservando os demais |
| `update(id, partial)` | Atualiza campos, incluindo operacoes FieldValue |
| `delete(id)` | Remove documento |
| `watchDocument(id, onNext, onError)` | Observa documento; retorna unsubscribe |
| `watchList(onNext, onError, buildQuery?)` | Observa consulta; retorna unsubscribe |

Consultas usam os metodos oficiais do SDK, como `where`, `orderBy`, `limit` e
`startAfter`, dentro de `buildQuery`. Erros sao propagados ao chamador.
Quem cria listeners deve executar o unsubscribe ao encerrar seu trabalho.

O converter padrao fornece tipagem estatica; nao valida documentos em runtime.
Sobrescreva `converter` com validacao de dominio quando o formato for definido.

Signals pertencem ao frontend Angular; o processo Node usa Promises e callbacks
do SDK, sem adicionar Angular ou uma camada reativa desnecessaria ao backend.

## Seguranca E Validacao

Firebase Admin ignora as regras de seguranca do Firestore e usa IAM. Os dados
gravados pelo backend ainda precisam respeitar o formato e os caminhos que as
regras permitem ao frontend ler.

Autorize somente o UID esperado a ler a colonia e suas subcolecoes. O frontend
precisa atualizar `state` das levers, os campos de configuracao dos indicators
e excluir adapters, levers e indicators pela pagina de gerenciamento. Restrinja
essas operacoes nas regras; o historico `events` deve permitir apenas leitura
ao frontend. Nao abra escrita anonima para viabilizar o dashboard.

O servidor HTTP local nao implementa autenticacao dos webhooks. O bind em
loopback limita a exposicao, mas nao autentica processos locais. Nao exponha a
porta em rede sem adicionar protecao apropriada. Alterar arquivos de regras no
repositorio nao publica as regras no Firebase.

Os testes usam doubles do SDK: validam contrato, CRUD, consultas, erros e limpeza
de listeners, mas nao verificam credenciais, IAM, indices ou conectividade real.
Nao existem credenciais reais versionadas ou acesso remoto nos testes.