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
    environment = UnityPy.load(str(data_root / 'resources.assets'))
    textures = {}
    for resource in environment.objects:
        if resource.type.name == 'Texture2D':
            name = resource.peek_name()
            if name in requested:
                texture = resource.read()
                if (texture.m_Width, texture.m_Height) == (80, 80):
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
    (args.output / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print(f"Exported {len(goods)} goods icons from Timberborn {version}")
    print(', '.join(manifest['goods']))


if __name__ == '__main__':
    main()