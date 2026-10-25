# Timberborn Goods Icons

60 PNG textures exported from a locally installed copy of Timberborn by
Mechanistry, version `1.1.2.8-ffc2de0-sw` (Steam public build `26072923`).
No images were downloaded from the wiki. Originals are 80 x 80 pixels with
transparency. Goods from both Folktails and Iron Teeth are included.

`manifest.json` records the exact resource path for each good, resolved from
the installed game's `StreamingAssets/Modding/Blueprints.zip`. The exporter
reads only matching goods textures from `Timberborn_Data/resources.assets`;
it does not modify the game installation.

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