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
PORT=7778
GAME_API_URL=http://localhost:7778/api/
COLONY_INFO_API_URL=http://localhost:7777/api/colony-info
```

Use uma `PORT` diferente da porta da API do jogo, por exemplo `7000`.

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

O processo escuta apenas em `127.0.0.1:7778`. O endpoint `GET /health` confirma
somente que o processo esta ativo, nao valida credenciais ou acesso ao Firestore.
O frontend nao usa essas rotas. Os webhooks existentes continuam em
`POST /adapters/:state/:name` e `POST /adapters/levers/:state/:name`.

## Colonias E Polling

O job consulta `COLONY_INFO_API_URL` imediatamente ao iniciar e agenda a proxima
consulta 120 segundos depois da conclusao da anterior. Nao ha sobreposicao,
worker thread, fila externa ou dependencia adicional. Cada consulta tem timeout
de 10 segundos e grava o snapshot atual, sem criar historico:

```text
colonies/{settlementId}               snapshot completo retornado pela API
colonies/{settlementId}/adapters/{id} automacoes dos adapters
colonies/{settlementId}/levers/{id}   automacoes das levers
```

A identidade vem de `colonyInfo.settlementId`; o nome de exibicao vem de
`colonyInfo.settlementName`. O snapshot inclui timestamp, recursos, populacao,
tempo e energia. Esses dados ficam no documento da colonia, nao em novos
documentos a cada consulta. Subcolecoes permanecem intactas ao atualizar o pai.

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

## Levers

O backend observa `colonies/{settlementId}/levers`, sem rota HTTP para comandos
do frontend. O webhook de levers apenas recebe atualizacoes vindas do jogo.
Cada documento usa `{ name: string, state: boolean, springReturn: false }`.
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
    models/
      stored-document.ts
    services/
      firebase/
        firebase-client.ts
      firestore/
        firestore.repository.ts
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
regras permitem ao frontend ler. Esses caminhos serao definidos posteriormente.

Os testes usam doubles do SDK: validam contrato, CRUD, consultas, erros e limpeza
de listeners, mas nao verificam credenciais, IAM, indices ou conectividade real.
Nao existem credenciais reais versionadas ou acesso remoto nos testes.