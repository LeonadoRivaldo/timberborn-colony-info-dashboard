# Timberborn Goods Icons

60 good icons plus 15 population UI icons exported from a locally installed copy of Timberborn by
Mechanistry, version `1.1.2.8-ffc2de0-sw` (Steam public build `26072923`).
No images were downloaded from the wiki. Good icons are 80 x 80 pixels and
population UI icons are 48 x 48 or 52 x 52, with transparency. Goods from both
Folktails and Iron Teeth are included. The population set includes adults,
children, bots, workforce, unemployed, and bed status icons.
The exported population filenames are listed in `manifest.json`; they include
`ico-adult`, `ico-child`, `ico-child-grow`, `ico-bot`, worker status icons,
and bed status icons. `ico-beavers` is a solid-color HUD tile rather than a
standalone pictogram, so the summary uses the adult pictogram instead.

`manifest.json` records the exact resource path for each good, resolved from
the installed game's `StreamingAssets/Modding/Blueprints.zip`. The exporter
reads matching goods and population textures from
`Timberborn_Data/resources.assets`; it does not modify the game installation.

These are game assets, not original artwork of this dashboard. All rights to
Timberborn artwork belong to their respective owners, including Mechanistry.
No independent redistribution license is asserted here. Verify the applicable
game/fan-content terms or obtain permission before public redistribution.

## Re-export

From the frontend directory, with uv available:

```powershell
uv run --python 3.12 --with UnityPy==1.25.0 scripts/export-good-icons.py 'C:\Program Files (x86)\Steam\steamapps\common\Timberborn'
```

The script validates that each requested texture exists unambiguously at
80 x 80 pixels before writing. A future game update may require adapting
the extractor. Update `src/app/core/models/good-icon-catalog.ts` when IDs change.