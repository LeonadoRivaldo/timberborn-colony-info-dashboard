import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export function createFirebaseClient(projectId: string) {
  const existingApp = getApps().find((app) => app.name === '[DEFAULT]');
  if (existingApp && existingApp.options.projectId !== projectId) {
    throw new Error('O Firebase ja foi inicializado para outro projeto.');
  }
  const app = existingApp ?? initializeApp({ projectId, credential: applicationDefault() });
  return { app, firestore: getFirestore(app) };
}