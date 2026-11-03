import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';

const DEFAULT_GAME_PATH = 'C:/Program Files (x86)/Steam/steamapps/common/Timberborn';
const FACTIONS = new Set(['Folktails', 'IronTeeth']);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultOutput = path.resolve(scriptDirectory, '../src/app/core/models/production-catalog.ts');

function readZipEntries(buffer) {
  let end = buffer.length - 22;
  while (end >= 0 && buffer.readUInt32LE(end) !== 0x06054b50) end -= 1;
  if (end < 0) throw new Error('Blueprints.zip invalido: diretorio central nao encontrado.');

  const entryCount = buffer.readUInt16LE(end + 10);
  let offset = buffer.readUInt32LE(end + 16);
  const entries = new Map();
  for (let index = 0; index < entryCount; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error('Blueprints.zip invalido: cabecalho central corrompido.');
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength);
    entries.set(name, { method, compressedSize, localOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return {
    names: [...entries.keys()],
    readJson(name) {
      const entry = entries.get(name);
      const localNameLength = buffer.readUInt16LE(entry.localOffset + 26);
      const localExtraLength = buffer.readUInt16LE(entry.localOffset + 28);
      const start = entry.localOffset + 30 + localNameLength + localExtraLength;
      const data = buffer.subarray(start, start + entry.compressedSize);
      if (entry.method !== 0 && entry.method !== 8) throw new Error(`Compressao nao suportada em ${name}.`);
      const text = (entry.method === 8 ? inflateRawSync(data) : data).toString('utf8').replace(/^\uFEFF/, '');
      return JSON.parse(text);
    }
  };
}

function toAmounts(items) {
  return (items ?? []).map((item) => ({ id: item.Id, amount: Number(item.Amount) }));
}

async function main() {
  const gamePath = process.argv[2] ?? DEFAULT_GAME_PATH;
  const outputPath = process.argv[3] ? path.resolve(process.argv[3]) : defaultOutput;
  const dataRoot = path.join(gamePath, 'Timberborn_Data', 'StreamingAssets');
  const version = (await readFile(path.join(dataRoot, 'Version.txt'), 'utf8')).trim();
  const zip = readZipEntries(await readFile(path.join(dataRoot, 'Modding', 'Blueprints.zip')));

  const recipeSpecs = new Map();
  for (const name of zip.names.filter((item) => item.startsWith('Recipes/') && item.endsWith('.json'))) {
    const spec = zip.readJson(name).RecipeSpec;
    recipeSpecs.set(spec.Id, spec);
  }

  const buildings = [];
  const botRecipeIds = new Set();
  for (const name of zip.names.filter((item) => item.startsWith('Buildings/') && item.endsWith('.blueprint.json'))) {
    const blueprint = zip.readJson(name);
    if (!blueprint.ManufactorySpec) continue;
    const [id, factionPart] = path.posix.basename(name).split('.');
    if (blueprint.BotManufactorySpec) {
      for (const recipeId of blueprint.ManufactorySpec.ProductionRecipeIds) botRecipeIds.add(recipeId);
    }
    buildings.push({
      id,
      faction: FACTIONS.has(factionPart) ? factionPart : 'Common',
      maxWorkers: Number(blueprint.WorkplaceSpec?.MaxWorkers ?? 0),
      recipeIds: [...blueprint.ManufactorySpec.ProductionRecipeIds]
    });
  }

  const recipes = [];
  for (const recipeId of new Set(buildings.flatMap((building) => building.recipeIds))) {
    const spec = recipeSpecs.get(recipeId);
    if (!spec) throw new Error(`Receita ${recipeId} referenciada por um predio mas nao encontrada.`);
    // Bot assembly yields a unit instead of a stocked good.
    const products = botRecipeIds.has(recipeId) ? [{ id: 'Bot', amount: 1 }] : toAmounts(spec.Products);
    if (!products.length) continue;
    recipes.push({
      id: spec.Id,
      cycleHours: Number(spec.CycleDurationInHours),
      ingredients: toAmounts(spec.Ingredients),
      products,
      fuel: spec.Fuel ? { id: spec.Fuel, cyclesPerUnit: Number(spec.CyclesFuelLasts) } : null
    });
  }

  const producedRecipeIds = new Set(recipes.map((recipe) => recipe.id));
  const catalog = {
    gameVersion: version,
    recipes: recipes.sort((left, right) => left.id.localeCompare(right.id)),
    buildings: buildings
      .map((building) => ({ ...building, recipeIds: building.recipeIds.filter((id) => producedRecipeIds.has(id)) }))
      .filter((building) => building.recipeIds.length)
      .sort((left, right) => `${left.id}.${left.faction}`.localeCompare(`${right.id}.${right.faction}`))
  };

  const source = `// Gerado por scripts/export-production-data.mjs a partir do Timberborn ${version} instalado. Nao editar manualmente.\n`
    + `import type { ProductionCatalog } from './production.model';\n\n`
    + `export const PRODUCTION_CATALOG: ProductionCatalog = ${JSON.stringify(catalog, null, 2)};\n`;
  await writeFile(outputPath, source, 'utf8');
  console.log(`Catalogo gerado: ${catalog.recipes.length} receitas e ${catalog.buildings.length} predios (Timberborn ${version}).`);
}

main().catch((error) => {
  console.error(`Erro: ${error.message}`);
  process.exitCode = 1;
});
