import { deleteApp } from 'firebase-admin/app';
import { createApp } from './app.js';
import { readEnvironment } from './core/config/environment.js';
import { createFirebaseClient } from './core/services/firebase/firebase-client.js';
import { LeversService } from './core/services/levers/levers.service.js';
import { ColoniesService } from './core/services/colonies/colonies.service.js';
import { ColonyPollingJob } from './core/jobs/colony-polling.job.js';

const environment = readEnvironment();
const gameApiUrl = process.env['GAME_API_URL']?.trim();
if (!gameApiUrl) throw new Error('Defina GAME_API_URL no ambiente.');
const colonyInfoApiUrl = process.env['COLONY_INFO_API_URL']?.trim();
if (!colonyInfoApiUrl) throw new Error('Defina COLONY_INFO_API_URL no ambiente.');
const firebase = createFirebaseClient(environment.firebaseProjectId);
const colonies = new ColoniesService(firebase.firestore);
const app = createApp({ firestore: firebase.firestore, colonies });
let stopLevers: (() => Promise<void>) | undefined;
const polling = new ColonyPollingJob({
  url: colonyInfoApiUrl,
  colonies,
  onColonyChanged: async (id) => {
    await stopLevers?.();
    stopLevers = undefined;
    if (id) {
      const levers = new LeversService(firebase.firestore, () => id);
      stopLevers = levers.start(gameApiUrl, (error) => app.log.error(error, 'Falha na sincronizacao de levers'));
    }
  },
  onError: (error) => app.log.error(error, 'Falha ao sincronizar colonia'),
});

app.addHook('onClose', async () => {
  await polling.stop();
  await firebase.firestore.terminate();
  await deleteApp(firebase.app);
});

async function shutdown(): Promise<void> {
  try {
    await app.close();
  } catch (error) {
    app.log.error(error);
    process.exitCode = 1;
  }
}

process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());

try {
  await app.listen({ host: '127.0.0.1', port: environment.port });
  polling.start();
} catch (error) {
  app.log.error(error);
  await shutdown();
  process.exitCode = 1;
}