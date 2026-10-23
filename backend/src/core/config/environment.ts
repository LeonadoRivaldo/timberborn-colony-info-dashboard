export interface Environment {
  readonly firebaseProjectId: string;
  readonly port: number;
}

export function readEnvironment(environment: NodeJS.ProcessEnv = process.env): Environment {
  const firebaseProjectId = environment['FIREBASE_PROJECT_ID']?.trim();
  if (!firebaseProjectId) throw new Error('Defina FIREBASE_PROJECT_ID no ambiente.');

  const port = Number(environment['PORT'] ?? 7778);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT deve ser um inteiro entre 1 e 65535.');
  }

  return { firebaseProjectId, port };
}