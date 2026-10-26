# Timberborn Colony Info

Dashboard de uma colonia Timberborn, com backend local que sincroniza o snapshot
do jogo para Firestore. A interface publicada no GitHub Pages fala diretamente
com Firestore; nunca chama o backend nem a API local do jogo.

## Projeto

- `frontend/`: Angular, dashboard, autenticacao e consultas Firestore.
- `backend/`: API local, polling da colonia, webhooks e cliente Firebase Admin.
- `.github/workflows/deploy-pages.yml`: testes e deploy apenas do frontend.

Para desenvolvimento local, frontend e backend continuam iniciados separadamente.
Para executar a aplicacao junta num unico container Docker, consulte a secao abaixo.

## Docker Em WSL

O container unico compila o Angular, serve os arquivos estaticos pelo Fastify e
mantem a API/polling do backend no mesmo processo. O jogo e os mods continuam no
Windows. A porta publicada do backend tambem e a porta que o mod deve chamar.

1. Copie `docker.env.example` para `.env` na raiz do repositorio.
2. Defina `FIREBASE_SERVICE_ACCOUNT_PATH` com o caminho absoluto para a conta de
	servico. Mantenha o JSON fora do repositorio; ele e montado read-only e nao
	entra na imagem.
3. Crie `backend/.env` com pelo menos `FIREBASE_PROJECT_ID`. Pode partir de
	`backend/.env.example`.
4. No WSL, execute:

```sh
docker compose up --build -d
docker compose logs -f colony-info
```

O dashboard fica em `http://localhost:7000/`, `/login` e `/manage`; o health
check esta em `http://localhost:7000/health`. Para parar: `docker compose down`.
O Compose publica `7000` por padrao; `COLONY_INFO_PORT` no `.env` pode trocar a
porta no host sem trocar a porta interna. Configure o mod para enviar webhooks
para `http://localhost:<COLONY_INFO_PORT>`.

Dentro do container, `GAME_API_URL` e `COLONY_INFO_API_URL` usam
`host.docker.internal` para acessar as APIs do jogo no host Windows. Os defaults
sao portas `7778` e `7777`; podem ser substituidos no `.env` da raiz. O Docker
Desktop/WSL precisa permitir o acesso do container a essas portas.

As variaveis `GAME_API_URL` e `COLONY_INFO_API_URL` sao para conexoes iniciadas
pelo backend ate o jogo. Os webhooks chegam no sentido inverso, do mod ate a
porta publicada do container. Frontend e backend compartilham uma origem; o
navegador continua falando diretamente com Firestore.

## GitHub Pages

Em Settings > Pages, escolha GitHub Actions. O workflow instala dependencias,
testa e compila somente `frontend/`, usando o nome do repositorio como base-href.
Ele usa `frontend/public/firebase-config.json`; se existir a variavel publica
Actions `FIREBASE_CONFIG`, ela substitui o arquivo durante o build.

O frontend requer Email/Password configurado no Firebase e regras do Firestore
que autorizem o UID permitido a ler dados em `colonies/{settlementId}/**` e
atualizar os documentos de `levers`.