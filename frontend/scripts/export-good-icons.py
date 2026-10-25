import argparse
import json
from pathlib import Path
from zipfile import ZipFile

import UnityPy


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('game', type=Path)
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parents[1] / 'public/goods')
    args = parser.parse_args()
    data_root = args.game / 'Timberborn_Data'
    version = (data_root / 'StreamingAssets/Version.txt').read_text().strip()
    with ZipFile(data_root / 'StreamingAssets/Modding/Blueprints.zip') as archive:
        names = [name for name in archive.namelist() if '/Goods/' in '/' + name and name.endswith('.json')]
        goods = [json.loads(archive.read(name).decode('utf-8-sig'))['GoodSpec'] for name in names]
    requested = {Path(good['Icon']).name for good in goods}
    requested.add('BeaverBustIcon')
    population_icons = {
        'ico-adult', 'ico-child', 'ico-child-grow', 'ico-bot', 'ico-beavers',
        'ico-workers', 'ico-work-beaver', 'ico-work-bot', 'ico-no-work-beaver',
        'ico-no-work-bot', 'ico-work-empty-beaver', 'ico-work-empty-bot',
        'ico-bed', 'ico-bed-empty', 'ico-no-bed',
    }
    requested.update(population_icons)
    environment = UnityPy.load(str(data_root / 'resources.assets'))
    textures = {}
    for resource in environment.objects:
        if resource.type.name == 'Texture2D':
            name = resource.peek_name()
            if name in requested:
                texture = resource.read()
                expected_size = (112, 112) if name == 'BeaverBustIcon' else (80, 80) if name in {Path(good['Icon']).name for good in goods} else None
                valid_size = (texture.m_Width, texture.m_Height) == expected_size if expected_size else (
                    texture.m_Width == texture.m_Height and 24 <= texture.m_Width <= 64
                )
                if valid_size:
                    if name in textures:
                        raise ValueError(f'Ambiguous goods texture: {name}')
                    textures[name] = texture
    missing = requested - textures.keys()
    if missing:
        raise ValueError(f'Missing goods textures: {sorted(missing)}')
    args.output.mkdir(parents=True, exist_ok=True)
    manifest = {'gameVersion': version, 'source': 'Installed Timberborn game, Mechanistry', 'goods': {}}
    for good in sorted(goods, key=lambda item: item['Id']):
        image = textures[Path(good['Icon']).name].image
        image.save(args.output / f"{good['Id']}.png", optimize=True)
        manifest['goods'][good['Id']] = {'resource': good['Icon'], 'width': image.width, 'height': image.height}
    beaver_icon = textures['BeaverBustIcon'].image
    beaver_icon.save(args.output / 'BeaverBustIcon.png', optimize=True)
    manifest['otherIcons'] = {'BeaverBustIcon': {'resource': 'BeaverBustIcon', 'width': beaver_icon.width, 'height': beaver_icon.height}}
    population_output = args.output.parent / 'population'
    population_output.mkdir(parents=True, exist_ok=True)
    manifest['populationIcons'] = {}
    for name in sorted(population_icons):
        image = textures[name].image
        image.save(population_output / f'{name}.png', optimize=True)
        manifest['populationIcons'][name] = {
            'resource': name,
            'width': image.width,
            'height': image.height,
            'path': f'population/{name}.png',
        }
    (args.output / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print(f"Exported {len(goods)} goods icons from Timberborn {version}")
    print(', '.join(manifest['goods']))


if __name__ == '__main__':
    main()