// Gerado por scripts/export-production-data.mjs a partir do Timberborn 1.1.2.8-ffc2de0-sw instalado. Nao editar manualmente.
import type { ProductionCatalog } from './production.model';

export const PRODUCTION_CATALOG: ProductionCatalog = {
  "gameVersion": "1.1.2.8-ffc2de0-sw",
  "recipes": [
    {
      "id": "Algae",
      "cycleHours": 288,
      "ingredients": [
        {
          "id": "Water",
          "amount": 60
        }
      ],
      "products": [
        {
          "id": "Algae",
          "amount": 70
        }
      ],
      "fuel": null
    },
    {
      "id": "AlgaeRation",
      "cycleHours": 0.25,
      "ingredients": [
        {
          "id": "Algae",
          "amount": 1
        },
        {
          "id": "CanolaOil",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "AlgaeRation",
          "amount": 6
        }
      ],
      "fuel": {
        "id": "Log",
        "cyclesPerUnit": 10
      }
    },
    {
      "id": "Antidote",
      "cycleHours": 2,
      "ingredients": [
        {
          "id": "Paper",
          "amount": 1
        },
        {
          "id": "Dandelion",
          "amount": 2
        },
        {
          "id": "Berries",
          "amount": 2
        }
      ],
      "products": [
        {
          "id": "Antidote",
          "amount": 2
        }
      ],
      "fuel": null
    },
    {
      "id": "Badwater",
      "cycleHours": 0.33,
      "ingredients": [],
      "products": [
        {
          "id": "Badwater",
          "amount": 1
        }
      ],
      "fuel": null
    },
    {
      "id": "BadwaterExtracted",
      "cycleHours": 10,
      "ingredients": [],
      "products": [
        {
          "id": "Badwater",
          "amount": 40
        }
      ],
      "fuel": null
    },
    {
      "id": "Biofuel.Carrot",
      "cycleHours": 6,
      "ingredients": [
        {
          "id": "Carrot",
          "amount": 2
        },
        {
          "id": "Water",
          "amount": 2
        }
      ],
      "products": [
        {
          "id": "Biofuel",
          "amount": 5
        }
      ],
      "fuel": null
    },
    {
      "id": "Biofuel.Potato",
      "cycleHours": 6,
      "ingredients": [
        {
          "id": "Potato",
          "amount": 2
        },
        {
          "id": "Water",
          "amount": 2
        }
      ],
      "products": [
        {
          "id": "Biofuel",
          "amount": 30
        }
      ],
      "fuel": null
    },
    {
      "id": "Biofuel.Spadderdock",
      "cycleHours": 6,
      "ingredients": [
        {
          "id": "Spadderdock",
          "amount": 2
        },
        {
          "id": "Water",
          "amount": 2
        }
      ],
      "products": [
        {
          "id": "Biofuel",
          "amount": 25
        }
      ],
      "fuel": null
    },
    {
      "id": "Book",
      "cycleHours": 3,
      "ingredients": [
        {
          "id": "Paper",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "Book",
          "amount": 1
        }
      ],
      "fuel": null
    },
    {
      "id": "Bot.Folktails",
      "cycleHours": 72,
      "ingredients": [
        {
          "id": "BotChassis",
          "amount": 1
        },
        {
          "id": "BotLimb",
          "amount": 4
        },
        {
          "id": "BotHead",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "Bot",
          "amount": 1
        }
      ],
      "fuel": null
    },
    {
      "id": "Bot.IronTeeth",
      "cycleHours": 72,
      "ingredients": [
        {
          "id": "BotChassis",
          "amount": 1
        },
        {
          "id": "BotLimb",
          "amount": 4
        },
        {
          "id": "BotHead",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "Bot",
          "amount": 1
        }
      ],
      "fuel": null
    },
    {
      "id": "BotChassis.Folktails",
      "cycleHours": 18,
      "ingredients": [
        {
          "id": "Plank",
          "amount": 5
        },
        {
          "id": "MetalBlock",
          "amount": 1
        },
        {
          "id": "Biofuel",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "BotChassis",
          "amount": 1
        }
      ],
      "fuel": null
    },
    {
      "id": "BotChassis.IronTeeth",
      "cycleHours": 18,
      "ingredients": [
        {
          "id": "Plank",
          "amount": 5
        },
        {
          "id": "MetalBlock",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "BotChassis",
          "amount": 1
        }
      ],
      "fuel": null
    },
    {
      "id": "BotHead.Folktails",
      "cycleHours": 18,
      "ingredients": [
        {
          "id": "Plank",
          "amount": 1
        },
        {
          "id": "Gear",
          "amount": 3
        },
        {
          "id": "MetalBlock",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "BotHead",
          "amount": 1
        }
      ],
      "fuel": null
    },
    {
      "id": "BotHead.IronTeeth",
      "cycleHours": 18,
      "ingredients": [
        {
          "id": "Plank",
          "amount": 1
        },
        {
          "id": "Gear",
          "amount": 3
        },
        {
          "id": "MetalBlock",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "BotHead",
          "amount": 1
        }
      ],
      "fuel": null
    },
    {
      "id": "BotLimb.Folktails",
      "cycleHours": 4.5,
      "ingredients": [
        {
          "id": "Plank",
          "amount": 1
        },
        {
          "id": "Gear",
          "amount": 3
        }
      ],
      "products": [
        {
          "id": "BotLimb",
          "amount": 1
        }
      ],
      "fuel": null
    },
    {
      "id": "BotLimb.IronTeeth",
      "cycleHours": 4.5,
      "ingredients": [
        {
          "id": "Plank",
          "amount": 1
        },
        {
          "id": "Gear",
          "amount": 3
        }
      ],
      "products": [
        {
          "id": "BotLimb",
          "amount": 1
        }
      ],
      "fuel": null
    },
    {
      "id": "Bread",
      "cycleHours": 1,
      "ingredients": [
        {
          "id": "WheatFlour",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "Bread",
          "amount": 5
        }
      ],
      "fuel": {
        "id": "Log",
        "cyclesPerUnit": 10
      }
    },
    {
      "id": "CanolaOil",
      "cycleHours": 1.25,
      "ingredients": [
        {
          "id": "CanolaSeeds",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "CanolaOil",
          "amount": 1
        }
      ],
      "fuel": null
    },
    {
      "id": "Catalyst",
      "cycleHours": 3,
      "ingredients": [
        {
          "id": "MapleSyrup",
          "amount": 1
        },
        {
          "id": "Extract",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "Catalyst",
          "amount": 3
        }
      ],
      "fuel": null
    },
    {
      "id": "CattailCracker",
      "cycleHours": 0.5,
      "ingredients": [
        {
          "id": "CattailFlour",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "CattailCracker",
          "amount": 4
        }
      ],
      "fuel": {
        "id": "Log",
        "cyclesPerUnit": 10
      }
    },
    {
      "id": "CattailFlour",
      "cycleHours": 0.25,
      "ingredients": [
        {
          "id": "CattailRoot",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "CattailFlour",
          "amount": 1
        }
      ],
      "fuel": null
    },
    {
      "id": "Coffee",
      "cycleHours": 1,
      "ingredients": [
        {
          "id": "CoffeeBean",
          "amount": 1
        },
        {
          "id": "Water",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "Coffee",
          "amount": 4
        }
      ],
      "fuel": {
        "id": "Log",
        "cyclesPerUnit": 10
      }
    },
    {
      "id": "CornRation",
      "cycleHours": 0.5,
      "ingredients": [
        {
          "id": "Corn",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "CornRation",
          "amount": 5
        }
      ],
      "fuel": {
        "id": "Log",
        "cyclesPerUnit": 10
      }
    },
    {
      "id": "Dirt",
      "cycleHours": 6,
      "ingredients": [],
      "products": [
        {
          "id": "Dirt",
          "amount": 4
        }
      ],
      "fuel": null
    },
    {
      "id": "EggplantRation",
      "cycleHours": 0.5,
      "ingredients": [
        {
          "id": "Eggplant",
          "amount": 1
        },
        {
          "id": "CanolaOil",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "EggplantRation",
          "amount": 6
        }
      ],
      "fuel": {
        "id": "Log",
        "cyclesPerUnit": 10
      }
    },
    {
      "id": "Explosives",
      "cycleHours": 3,
      "ingredients": [
        {
          "id": "Badwater",
          "amount": 5
        }
      ],
      "products": [
        {
          "id": "Explosives",
          "amount": 1
        }
      ],
      "fuel": null
    },
    {
      "id": "Extract",
      "cycleHours": 1.5,
      "ingredients": [
        {
          "id": "Badwater",
          "amount": 4
        }
      ],
      "products": [
        {
          "id": "Extract",
          "amount": 1
        }
      ],
      "fuel": {
        "id": "Log",
        "cyclesPerUnit": 10
      }
    },
    {
      "id": "FermentedCassava",
      "cycleHours": 2,
      "ingredients": [
        {
          "id": "Cassava",
          "amount": 4
        }
      ],
      "products": [
        {
          "id": "FermentedCassava",
          "amount": 10
        }
      ],
      "fuel": null
    },
    {
      "id": "FermentedMushroom",
      "cycleHours": 2,
      "ingredients": [
        {
          "id": "Mushroom",
          "amount": 4
        }
      ],
      "products": [
        {
          "id": "FermentedMushroom",
          "amount": 16
        }
      ],
      "fuel": null
    },
    {
      "id": "FermentedSoybean",
      "cycleHours": 3,
      "ingredients": [
        {
          "id": "Soybean",
          "amount": 6
        },
        {
          "id": "CanolaOil",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "FermentedSoybean",
          "amount": 20
        }
      ],
      "fuel": null
    },
    {
      "id": "Fireworks",
      "cycleHours": 3,
      "ingredients": [
        {
          "id": "Badwater",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "Fireworks",
          "amount": 10
        }
      ],
      "fuel": null
    },
    {
      "id": "Gear",
      "cycleHours": 3,
      "ingredients": [
        {
          "id": "Plank",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "Gear",
          "amount": 1
        }
      ],
      "fuel": null
    },
    {
      "id": "Grease",
      "cycleHours": 4,
      "ingredients": [
        {
          "id": "Extract",
          "amount": 1
        },
        {
          "id": "CanolaOil",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "Grease",
          "amount": 2
        }
      ],
      "fuel": null
    },
    {
      "id": "GrilledChestnut",
      "cycleHours": 0.33,
      "ingredients": [
        {
          "id": "Chestnut",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "GrilledChestnut",
          "amount": 2
        }
      ],
      "fuel": {
        "id": "Log",
        "cyclesPerUnit": 10
      }
    },
    {
      "id": "GrilledPotato",
      "cycleHours": 0.52,
      "ingredients": [
        {
          "id": "Potato",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "GrilledPotato",
          "amount": 4
        }
      ],
      "fuel": {
        "id": "Log",
        "cyclesPerUnit": 10
      }
    },
    {
      "id": "GrilledSpadderdock",
      "cycleHours": 0.4,
      "ingredients": [
        {
          "id": "Spadderdock",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "GrilledSpadderdock",
          "amount": 3
        }
      ],
      "fuel": {
        "id": "Log",
        "cyclesPerUnit": 10
      }
    },
    {
      "id": "MaplePastry",
      "cycleHours": 1.5,
      "ingredients": [
        {
          "id": "WheatFlour",
          "amount": 1
        },
        {
          "id": "MapleSyrup",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "MaplePastry",
          "amount": 3
        }
      ],
      "fuel": {
        "id": "Log",
        "cyclesPerUnit": 10
      }
    },
    {
      "id": "MetalBlock",
      "cycleHours": 2,
      "ingredients": [
        {
          "id": "ScrapMetal",
          "amount": 2
        }
      ],
      "products": [
        {
          "id": "MetalBlock",
          "amount": 1
        }
      ],
      "fuel": {
        "id": "Log",
        "cyclesPerUnit": 5
      }
    },
    {
      "id": "MetalPart",
      "cycleHours": 3,
      "ingredients": [
        {
          "id": "ScrapMetal",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "MetalPart",
          "amount": 1
        }
      ],
      "fuel": {
        "id": "Log",
        "cyclesPerUnit": 5
      }
    },
    {
      "id": "Mushroom",
      "cycleHours": 192,
      "ingredients": [
        {
          "id": "Water",
          "amount": 40
        }
      ],
      "products": [
        {
          "id": "Mushroom",
          "amount": 45
        }
      ],
      "fuel": null
    },
    {
      "id": "Paper",
      "cycleHours": 1.56,
      "ingredients": [
        {
          "id": "Log",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "Paper",
          "amount": 2
        }
      ],
      "fuel": null
    },
    {
      "id": "Plank",
      "cycleHours": 1.25,
      "ingredients": [
        {
          "id": "Log",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "Plank",
          "amount": 1
        }
      ],
      "fuel": null
    },
    {
      "id": "PunchCard",
      "cycleHours": 1.5,
      "ingredients": [
        {
          "id": "Paper",
          "amount": 2
        },
        {
          "id": "Plank",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "PunchCard",
          "amount": 2
        }
      ],
      "fuel": null
    },
    {
      "id": "ScrapMetal",
      "cycleHours": 18,
      "ingredients": [
        {
          "id": "TreatedPlank",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "ScrapMetal",
          "amount": 5
        }
      ],
      "fuel": null
    },
    {
      "id": "ScrapMetal.Efficient",
      "cycleHours": 18,
      "ingredients": [
        {
          "id": "TreatedPlank",
          "amount": 1
        },
        {
          "id": "Extract",
          "amount": 2
        }
      ],
      "products": [
        {
          "id": "ScrapMetal",
          "amount": 10
        }
      ],
      "fuel": null
    },
    {
      "id": "TreatedPlank",
      "cycleHours": 3,
      "ingredients": [
        {
          "id": "Plank",
          "amount": 1
        },
        {
          "id": "PineResin",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "TreatedPlank",
          "amount": 1
        }
      ],
      "fuel": null
    },
    {
      "id": "Water",
      "cycleHours": 0.33,
      "ingredients": [],
      "products": [
        {
          "id": "Water",
          "amount": 1
        }
      ],
      "fuel": null
    },
    {
      "id": "Water.Efficient",
      "cycleHours": 1,
      "ingredients": [],
      "products": [
        {
          "id": "Water",
          "amount": 5
        }
      ],
      "fuel": null
    },
    {
      "id": "WheatFlour",
      "cycleHours": 0.5,
      "ingredients": [
        {
          "id": "Wheat",
          "amount": 1
        }
      ],
      "products": [
        {
          "id": "WheatFlour",
          "amount": 1
        }
      ],
      "fuel": null
    }
  ],
  "buildings": [
    {
      "id": "BadwaterPump",
      "faction": "Folktails",
      "maxWorkers": 1,
      "recipeIds": [
        "Badwater"
      ]
    },
    {
      "id": "BadwaterRig",
      "faction": "Folktails",
      "maxWorkers": 10,
      "recipeIds": [
        "BadwaterExtracted"
      ]
    },
    {
      "id": "Bakery",
      "faction": "Folktails",
      "maxWorkers": 1,
      "recipeIds": [
        "Bread",
        "CattailCracker",
        "MaplePastry"
      ]
    },
    {
      "id": "BotAssembler",
      "faction": "Folktails",
      "maxWorkers": 2,
      "recipeIds": [
        "Bot.Folktails"
      ]
    },
    {
      "id": "BotAssembler",
      "faction": "IronTeeth",
      "maxWorkers": 2,
      "recipeIds": [
        "Bot.IronTeeth"
      ]
    },
    {
      "id": "BotPartFactory",
      "faction": "Folktails",
      "maxWorkers": 1,
      "recipeIds": [
        "BotChassis.Folktails",
        "BotLimb.Folktails",
        "BotHead.Folktails"
      ]
    },
    {
      "id": "BotPartFactory",
      "faction": "IronTeeth",
      "maxWorkers": 1,
      "recipeIds": [
        "BotChassis.IronTeeth",
        "BotLimb.IronTeeth",
        "BotHead.IronTeeth"
      ]
    },
    {
      "id": "Centrifuge",
      "faction": "Folktails",
      "maxWorkers": 2,
      "recipeIds": [
        "Extract"
      ]
    },
    {
      "id": "Centrifuge",
      "faction": "IronTeeth",
      "maxWorkers": 2,
      "recipeIds": [
        "Extract"
      ]
    },
    {
      "id": "CoffeeBrewery",
      "faction": "IronTeeth",
      "maxWorkers": 1,
      "recipeIds": [
        "Coffee"
      ]
    },
    {
      "id": "DeepBadwaterPump",
      "faction": "IronTeeth",
      "maxWorkers": 1,
      "recipeIds": [
        "Badwater"
      ]
    },
    {
      "id": "DeepWaterPump",
      "faction": "IronTeeth",
      "maxWorkers": 1,
      "recipeIds": [
        "Water"
      ]
    },
    {
      "id": "DirtExcavator",
      "faction": "Folktails",
      "maxWorkers": 4,
      "recipeIds": [
        "Dirt"
      ]
    },
    {
      "id": "DirtExcavator",
      "faction": "IronTeeth",
      "maxWorkers": 4,
      "recipeIds": [
        "Dirt"
      ]
    },
    {
      "id": "EfficientMine",
      "faction": "IronTeeth",
      "maxWorkers": 10,
      "recipeIds": [
        "ScrapMetal",
        "ScrapMetal.Efficient"
      ]
    },
    {
      "id": "ExplosivesFactory",
      "faction": "Folktails",
      "maxWorkers": 1,
      "recipeIds": [
        "Explosives",
        "Fireworks"
      ]
    },
    {
      "id": "ExplosivesFactory",
      "faction": "IronTeeth",
      "maxWorkers": 1,
      "recipeIds": [
        "Explosives",
        "Fireworks"
      ]
    },
    {
      "id": "Fermenter",
      "faction": "IronTeeth",
      "maxWorkers": 1,
      "recipeIds": [
        "FermentedCassava",
        "FermentedSoybean",
        "FermentedMushroom"
      ]
    },
    {
      "id": "FoodFactory",
      "faction": "IronTeeth",
      "maxWorkers": 1,
      "recipeIds": [
        "CornRation",
        "EggplantRation",
        "AlgaeRation"
      ]
    },
    {
      "id": "GearWorkshop",
      "faction": "Folktails",
      "maxWorkers": 1,
      "recipeIds": [
        "Gear"
      ]
    },
    {
      "id": "GearWorkshop",
      "faction": "IronTeeth",
      "maxWorkers": 1,
      "recipeIds": [
        "Gear"
      ]
    },
    {
      "id": "GreaseFactory",
      "faction": "IronTeeth",
      "maxWorkers": 2,
      "recipeIds": [
        "Grease"
      ]
    },
    {
      "id": "Grill",
      "faction": "Folktails",
      "maxWorkers": 1,
      "recipeIds": [
        "GrilledPotato",
        "GrilledChestnut",
        "GrilledSpadderdock"
      ]
    },
    {
      "id": "Gristmill",
      "faction": "Folktails",
      "maxWorkers": 1,
      "recipeIds": [
        "WheatFlour",
        "CattailFlour"
      ]
    },
    {
      "id": "Herbalist",
      "faction": "Folktails",
      "maxWorkers": 1,
      "recipeIds": [
        "Antidote"
      ]
    },
    {
      "id": "HydroponicGarden",
      "faction": "IronTeeth",
      "maxWorkers": 1,
      "recipeIds": [
        "Mushroom",
        "Algae"
      ]
    },
    {
      "id": "IndustrialLumberMill",
      "faction": "IronTeeth",
      "maxWorkers": 2,
      "recipeIds": [
        "Plank"
      ]
    },
    {
      "id": "LargeWaterPump",
      "faction": "Folktails",
      "maxWorkers": 3,
      "recipeIds": [
        "Water.Efficient"
      ]
    },
    {
      "id": "LumberMill",
      "faction": "Folktails",
      "maxWorkers": 1,
      "recipeIds": [
        "Plank"
      ]
    },
    {
      "id": "Metalsmith",
      "faction": "IronTeeth",
      "maxWorkers": 1,
      "recipeIds": [
        "MetalPart"
      ]
    },
    {
      "id": "Mine",
      "faction": "Folktails",
      "maxWorkers": 10,
      "recipeIds": [
        "ScrapMetal"
      ]
    },
    {
      "id": "OilPress",
      "faction": "IronTeeth",
      "maxWorkers": 1,
      "recipeIds": [
        "CanolaOil"
      ]
    },
    {
      "id": "PaperMill",
      "faction": "Folktails",
      "maxWorkers": 1,
      "recipeIds": [
        "Paper"
      ]
    },
    {
      "id": "PrintingPress",
      "faction": "Folktails",
      "maxWorkers": 2,
      "recipeIds": [
        "Book",
        "PunchCard"
      ]
    },
    {
      "id": "Refinery",
      "faction": "Folktails",
      "maxWorkers": 2,
      "recipeIds": [
        "Biofuel.Carrot",
        "Biofuel.Potato",
        "Biofuel.Spadderdock",
        "Catalyst"
      ]
    },
    {
      "id": "Smelter",
      "faction": "Folktails",
      "maxWorkers": 1,
      "recipeIds": [
        "MetalBlock"
      ]
    },
    {
      "id": "Smelter",
      "faction": "IronTeeth",
      "maxWorkers": 1,
      "recipeIds": [
        "MetalBlock"
      ]
    },
    {
      "id": "WaterPump",
      "faction": "Folktails",
      "maxWorkers": 1,
      "recipeIds": [
        "Water"
      ]
    },
    {
      "id": "WoodWorkshop",
      "faction": "Folktails",
      "maxWorkers": 1,
      "recipeIds": [
        "TreatedPlank"
      ]
    },
    {
      "id": "WoodWorkshop",
      "faction": "IronTeeth",
      "maxWorkers": 1,
      "recipeIds": [
        "TreatedPlank"
      ]
    }
  ]
};
