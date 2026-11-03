import { cp, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDirectory = path.dirname(fileURLToPath(import.meta.url));
const modAssetsDirectory = process.argv[2] ?? process.env.TIMBERBORN_MOD_ASSETS;

if (!modAssetsDirectory) {
  console.error('Pass the TimberColonyInfo Assets/Mods/TimberColonyInfo directory or set TIMBERBORN_MOD_ASSETS.');
  process.exit(1);
}

const buildDirectory = path.resolve(frontendDirectory, '../dist/colony-info-timberborn/browser');
await stat(path.join(buildDirectory, 'index.html'));

const destination = path.resolve(modAssetsDirectory, 'Root/colony-info');
await mkdir(destination, { recursive: true });
await cp(buildDirectory, destination, { recursive: true });
console.log(`Timberborn dashboard copied to ${destination}`);