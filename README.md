# Timberborn Colony Info

Dashboard de uma colonia Timberborn, com backend local que sincroniza o snapshot
do jogo para Firestore. A interface publicada no GitHub Pages fala diretamente
com Firestore; nunca chama o backend nem a API local do jogo.

## Projeto

- `frontend/`: Angular, dashboard, autenticacao e consultas Firestore.
- `backend/`: API local, polling da colonia, webhooks e cliente Firebase Admin.
- `.github/workflows/deploy-pages.yml`: testes e deploy apenas do frontend.

O frontend e o backend sao iniciados separadamente. Consulte os READMEs nas
respectivas pastas para desenvolvimento e configuracao local.

## GitHub Pages

Em Settings > Pages, escolha GitHub Actions. O workflow instala dependencias,
testa e compila somente `frontend/`, usando o nome do repositorio como base-href.
Ele usa `frontend/public/firebase-config.json`; se existir a variavel publica
Actions `FIREBASE_CONFIG`, ela substitui o arquivo durante o build.

O frontend requer Email/Password configurado no Firebase e regras do Firestore
que autorizem o UID permitido a ler dados em `colonies/{settlementId}/**` e
atualizar os documentos de `levers`.