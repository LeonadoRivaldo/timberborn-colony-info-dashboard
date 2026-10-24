# Colony Info

Dashboard de goods do Timberborn. Angular 22 standalone e zoneless, Signals,
Bootstrap 5, Font Awesome 7 e SDK modular oficial do Firebase.

## Desenvolvimento

Node 24 LTS e npm 11.

```sh
npm ci
npm start -- --port 4230
npm test -- --watch=false
npm run build -- --base-href /colony-info/
```

## Firebase

1. Crie um projeto e registre um aplicativo Web no console Firebase.
2. Em Authentication, habilite Email/Password, desabilite Google e crie seu usuario
  manualmente no console. A aplicacao oferece apenas login, sem cadastro.
3. Adicione `localhost` e `<usuario>.github.io` aos dominios autorizados.
4. Crie o banco Cloud Firestore. Nao use regras abertas de modo de teste.
5. Preencha `public/firebase-config.json` com a configuracao Web publica:

```json
{
  "apiKey": "CONFIGURACAO_WEB_DO_FIREBASE",
  "authDomain": "SEU_PROJETO.firebaseapp.com",
  "projectId": "SEU_PROJETO",
  "appId": "SEU_APP_ID"
}
```

6. Publique `firestore.rules` pelo console ou usando o CLI autenticado:

```sh
npx firebase-tools deploy --only firestore:rules --project SEU_PROJETO
```

Essa configuracao identifica o projeto e fica publica no navegador. Nunca use
conta de servico ou chave privada no frontend. As regras autorizam apenas o
proprietario autenticado via Google em `users/{uid}/**`; outros caminhos sao negados.
Essas regras antigas ainda precisam ser adaptadas ao login por senha e ao UID
autorizado para ler `adapters` e `levers`. Trocar o formulario nao altera regras
publicadas nem bloqueia cadastros pela API do Firebase; isso exige configuracao
administrativa separada do projeto.
Regras nao sao publicadas automaticamente pelo workflow Pages.

Sem configuracao, o login fica indisponivel e a aplicacao mostra esse estado.

## Estrutura

- `core/services/firebase`: inicializacao antes das rotas, com token de injecao.
- `core/services/auth`: login email/senha, logout, Signals somente leitura e guard assincrono.
- `core/services/firestore`: repositorio generico com converter e observacao em tempo real.
- `core/services/goods`: repositorio de goods por usuario.
- `core/models`: modelos dos documentos.
- `features/login` e `features/dashboard`: paginas lazy-loaded.

## Repositorio Generico

```ts
interface GoodDocument { name: string; stock: number }

@Injectable({ providedIn: 'root' })
export class GoodsRepository extends FirestoreRepository<GoodDocument> {
  readonly collectionPath = 'users/UID/goods';
}
```

Defina a colecao como propriedade ou getter. O exemplo real usa o UID da sessao,
nunca um UID fornecido pela tela.

| Operacao | Comportamento |
| --- | --- |
| `read(id)` | Documento tipado ou null |
| `list(constraints?)` | Lista com filtros/ordenacao/limite do SDK |
| `create(data)` | Cria documento e retorna ID gerado |
| `write(id, data)` | Cria ou substitui integralmente |
| `update(id, partial)` | Atualiza campos; aceita increment/deleteField |
| `delete(id)` | Remove documento |
| `watchDocument(id)` | Observable de documento em tempo real |
| `watchList(constraints?)` | Observable de consulta em tempo real |

Resultados usam `{ id, data: T }`, sem sobrescrever campos do documento.
Use `toSignal(repository.watchList(), { initialValue: [] })` em contexto de injecao
para converter leituras em Signals com encerramento automatico da inscricao.
Erros do SDK sao propagados. Tipos nao validam dados em runtime: sobrescreva
`converter` com validacao de dominio quando necessario. Consultas compostas
podem exigir indices indicados pelo Firestore.

O dashboard lista `colonies`, seleciona a primeira por padrao e permite trocar
a selecao. Nomes vem de `colonyInfo.settlementName`; o ID do documento e o
`settlementId` fornecido pelo mod.

O resumo de alimentos soma somente os IDs comestiveis documentados para
Folktails e Iron Teeth (`core/models/food-catalog.ts`). Ingredientes crus como
corn, cassava e soybean nao entram nessa soma antes de serem processados.
Coffee entra na lista consumivel de Iron Teeth, embora nao satisfaca Hunger.
Fonte da classificacao: [Timberborn Wiki - Food](https://timberborn.wiki.gg/wiki/Food)
e [Ingredients](https://timberborn.wiki.gg/wiki/Ingredients). Como o snapshot
atual nao inclui faccao, a lista usa a uniao dos alimentos das duas faccoes.

As listas observam `colonies/{settlementId}/adapters` e
`colonies/{settlementId}/levers`. Trocar de colonia cancela as inscricoes antigas
e limpa os dados exibidos. O clique altera somente `state` da lever selecionada.
O backend local observa apenas a colonia atualmente carregada no jogo; alterar
uma colonia offline nao executa comandos nessa instancia do jogo.

O frontend acessa somente o Firestore, nunca o backend ou localhost do jogo.
O backend grava o snapshot da colonia a cada 120 segundos. As regras publicadas
precisam autorizar seu UID nesses novos caminhos; a aplicacao nao as publica
automaticamente. Dados antigos na raiz nao sao migrados por esta mudanca.

## GitHub Pages

O workflow do repositorio esta em `.github/workflows/deploy-pages.yml` e publica
somente o frontend. Usa `public/firebase-config.json` por padrao; a variavel
Actions `FIREBASE_CONFIG` pode substitui-la. Para dominio proprio, ajuste base-href
para `/` e autorize o dominio no Firebase.