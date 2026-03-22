# Assets Inventory

## Overview

MindStep leverages **3 Bitmoji asset packs** (Food, Kitchen, Home) and the **SDF Slicer** for 3D content, plus logos and lighting. This document catalogs all usable assets.

---

## Asset Packs

### Food Pack (`Assets/Food Pack.lspkg/`)

**Purpose:** Tomato and ingredient models
**Source:** Bitmoji 3D Asset Library
**Usage:** Exercise 1 (Tomato Prep)

#### Key Meshes
```
Meshes/
├── C_tomato_GEO.mesh              ← MAIN: tomato model
├── C_knife_chopping_GEO.mesh      ← cutting knife (for chopping)
├── C_burger_GEO.mesh              ← optional food prop
├── C_salad_leaf_GEO.mesh          ← optional garnish
└── ... (other food items, see full list below)
```

#### Key Materials
```
Materials/
├── tomato.mat                     ← MAIN: red tomato material
├── knife_chopping.mat             ← knife material
└── ... (other food materials)
```

#### Full Mesh List
- C_appleTrapDoor_GEO
- C_basket_GEO
- C_bottle_GEO (× 2 variants)
- C_bowlofchips_GEO
- C_burger_GEO
- C_cap_GEO (× 2)
- C_cereal_box_GEO
- C_cheeseCube_GEO
- C_cheeseWedge_GEO
- C_chip_GEO
- C_chocolate_syrup_GEO + cap
- C_cone_GEO
- C_dip_GEO
- C_drumstick_bit_GEO
- C_food_orangeslice_GEO
- C_gravyBoat_GEO
- C_marshmellow_GEO
- C_pickle_GEO
- C_pieBite_GEO + pie_GEO + shatter pieces
- C_popcorn_GEO + handful + kernel
- C_salad_leaf_GEO
- C_sandwich_GEO
- C_steak_GEO
- **C_tomato_GEO** ← MVP star asset
- C_turkey_GEO + drumstick

---

### Kitchen Pack (`Assets/Kitchen Pack.lspkg/`)

**Purpose:** Utensils, plates, cookware
**Source:** Bitmoji 3D Asset Library
**Usage:** Exercise 2 (Set the Table), Exercise 1 (knife variation)

#### Key Meshes for MVP

```
Meshes/
├── C_plate_GEO.mesh               ← MAIN: dinner plate
├── C_fork_GEO.mesh                ← MAIN: dinner fork
├── C_knife_GEO.mesh               ← MAIN: dinner knife
├── C_jar_GEO.mesh                 ← repurposed as drinking glass
├── C_bowl_GEO.mesh                ← optional bowl
├── C_spoon_GEO.mesh               ← optional spoon
└── ... (full list below)
```

#### Key Materials
```
Materials/
├── plate.mat
├── fork.mat                       (no separate material, default white)
├── knife_sharpener.mat            (can reuse for dinner knife)
├── jar.mat                        ← glass material
└── ... (others)
```

#### Full Mesh List
- C_bowl_GEO
- C_carvingKnife_GEO
- C_coffeeMaker_GEO (× 2)
- C_coffeemaker_GEO
- C_dishes_stack_GEO
- C_disinfectant_spray_GEO
- C_fork_GEO
- C_jar_GEO ← **glass (repurposed)**
- C_knifeSharpener_GEO
- C_knife_chopping_GEO
- C_knife_GEO ← **dinner knife (MVP)**
- C_ladle_GEO
- C_lid_GEO (× 2)
- C_matchstick_GEO
- C_plate_cover_GEO
- C_plate_GEO ← **plate (MVP)**
- C_quarantine_bowl_GEO
- C_shaker_spice_GEO
- C_spoon_GEO
- C_spoon_wooden_GEO
- L_chopstick_GEO, R_chopstick_GEO
- spatula_GEO

---

### Home Pack (`Assets/Home Pack.lspkg/`)

**Purpose:** Furniture, tables, environment
**Source:** Bitmoji 3D Asset Library
**Usage:** Both exercises (countertops, tables, environment)

#### Key Meshes for MVP

```
Meshes/
├── C_countertop_empty_GEO.mesh    ← MAIN: counter surface for tomato prep
├── C_table_top_GEO.mesh           ← MAIN: table surface for set table
├── C_stool_GEO.mesh               ← optional seating
├── C_sofa_GEO.mesh                ← optional furniture
└── ... (full list below)
```

#### Key Materials
```
Materials/
├── countertop_empty.mat           ← light counter
├── table_dining.mat               ← dining table
├── stool.mat
├── sofa.mat
└── ... (others)
```

#### Full Mesh List
- Box001 (generic cube, probably ignore)
- C_bin_GEO
- C_countertop_empty_GEO ← **counter (MVP)**
- C_desk_GEO
- C_drawer_GEO + L_drawer1_3 + R_drawer4_6
- C_frame_GEO
- C_ketchupTable_GEO
- C_Labtable_GEO (× 2, one labeled "Labtable.mesh")
- C_lid_GEO
- C_nightstand_GEO
- C_picture_GEO
- C_sofa_GEO
- C_stool_GEO
- C_stool_wooden_GEO
- C_table_cloth_GEO
- C_table_top_GEO ← **table surface (MVP)**
- L_drawer1_GEO, L_drawer2_GEO, L_drawer3_GEO
- R_drawer4_GEO, R_drawer5_GEO, R_drawer6_GEO
- table_leg1–4_GEO

---

### SDF Slicer (`Assets/SDF Slicer.lspkg/`)

**Purpose:** Cutting animation via Signed Distance Field (SDF) shader
**Source:** Snapchat SDF Slicer Example
**Usage:** Exercise 1, Step 4 (knife cutting)

#### Key Files
```
SDF Slicer.lspkg/
├── Scripts/
│   └── SDF Slice Script.js        ← CORE: handles touch → plane movement
├── Materials/
│   ├── SDF Slice Material.mat      ← material for slicing plane
│   └── Uber PBR Cut & Highlight.mat ← shader for cut objects (tomato)
├── Meshes/
│   ├── Plane.mesh                 ← cutting plane (usually invisible)
│   └── lp_C_turkey_one_mesh.mesh  ← demo turkey (for reference, not used)
├── Shaders/
│   ├── SDF Slice Material.ss_graph
│   └── Uber PBR Cut & Highlight.ss_graph
├── Textures/
│   ├── MaterialParams.png
│   ├── turkey_albedo.jpg
│   └── turkey_normal.jpg
│   └── lp_C_turkey_one_mesh SDF.png ← SDF texture (demo)
└── SDF Slicer__PLACE_IN_SCENE.prefab ← optional prefab reference
```

#### Integration Steps (Phase 3)
1. Apply `Uber PBR Cut & Highlight.mat` to tomato mesh
2. Create SDF texture for tomato (bake from mesh, Phase 3)
3. Instantiate `Plane.mesh` with `SDF Slice Material.mat`
4. Attach `SDF Slice Script.js` to slice plane object
5. Bind plane Z position to touch input (swipe down = cutting motion)

---

## Standalone Assets

### Logo
```
Assets/Logo.png
├── Size: 512 × 512 px (assumed)
├── Format: PNG with alpha
├── Usage: Home screen branding (4×4 unit Image in scene)
└── Placement: Center of HomeScreen
```

### Lighting
```
Assets/Echopark.hdr
├── Format: HDR equirectangular
├── Usage: Environment lighting for both exercises
└── Placement: Scene > Lighting > Sky Texture (or direct render)
```

### Camera Texture
```
Assets/Device Camera Texture.deviceCameraTexture
├── Type: Lens Studio device camera input
├── Usage: Optional background video feed (deferred to Phase 2+)
└── Note: Not used in MVP (AR objects float in black void)
```

### Render Target
```
Assets/Render Target.renderTarget
├── Type: Off-screen render texture
├── Usage: Optional for post-processing, UI rendering
└── Note: Not used in MVP
```

---

## Usage Mapping by Exercise

### Exercise 1: Tomato Prep
```
3D Props:
├── Tomato
│   ├── Mesh: Food Pack > C_tomato_GEO
│   ├── Material: Food Pack > tomato.mat
│   └── Position: in front of user
├── Knife
│   ├── Mesh: Kitchen Pack > C_knife_chopping_GEO (or C_knife_GEO)
│   ├── Material: Kitchen Pack > knife_chopping.mat
│   └── Position: to the left
└── Countertop
    ├── Mesh: Home Pack > C_countertop_empty_GEO
    ├── Material: Home Pack > countertop_empty.mat
    └── Position: ground plane

Cutting Mechanics:
├── SDF Slicer Script: SDF Slicer > Scripts > SDF Slice Script.js
├── Material: SDF Slicer > Materials > Uber PBR Cut & Highlight.mat
└── Cutting Plane: SDF Slicer > Meshes > Plane.mesh

Lighting:
└── Echopark.hdr (environment)
```

### Exercise 2: Set the Table
```
3D Props:
├── Plate
│   ├── Mesh: Kitchen Pack > C_plate_GEO
│   ├── Material: Kitchen Pack > plate.mat
│   └── Position: user's hand (draggable)
├── Fork
│   ├── Mesh: Kitchen Pack > C_fork_GEO
│   └── Position: left side
├── Knife
│   ├── Mesh: Kitchen Pack > C_knife_GEO
│   └── Position: right side
├── Glass
│   ├── Mesh: Kitchen Pack > C_jar_GEO (repurposed)
│   ├── Material: Kitchen Pack > jar.mat
│   └── Position: top-right
└── Dining Table
    ├── Mesh: Home Pack > C_table_top_GEO
    ├── Material: Home Pack > table_dining.mat
    └── Position: ground plane

Lighting:
└── Echopark.hdr (environment)
```

---

## Asset Optimization Notes

### Mesh Complexity
- Bitmoji meshes are **moderate-poly** (~3k–10k triangles each)
- Acceptable for Spectacles Gen 4 (target 30 FPS, ~50k triangles budget per scene)
- **Recommendation:** Combine Home Pack furniture into single static batch for Exercise 2

### Texture Sizing
- Bitmoji textures: ~2k × 2k PNG (with mipmaps)
- **Recommendation:** Use half-res (1k × 1k) for MVP to save memory
- Lens Studio auto-compresses to PVR on device

### Material Reuse
- **Reuse countertop material** for table (both light wood)
- **Reuse knife material** across exercises
- Reduces unique materials loaded in VRAM

---

## Where to Find Assets in Lens Studio

1. Open `MindStep/MindStep` project in Lens Studio
2. **Assets** panel (left sidebar) → expand:
   ```
   Assets/
   ├── Device Camera Texture.deviceCameraTexture
   ├── Echopark.hdr
   ├── Food Pack.lspkg/
   │   ├── Meshes/
   │   │   └── C_tomato_GEO.mesh ← click to view in 3D
   │   └── Materials/
   │       └── tomato.mat
   ├── Home Pack.lspkg/
   ├── Kitchen Pack.lspkg/
   ├── Logo.png
   ├── Render Target.renderTarget
   ├── Scene.scene
   └── SDF Slicer.lspkg/
   ```

3. **Drag & drop** mesh/material onto scene objects to assign

---

## Licensing & Attribution

All Bitmoji assets are part of the **Snapchat Bitmoji Pack** (proprietary).
Usage is granted for Spectacles Lens development only.

**SDF Slicer** is a Snapchat sample (Apache 2.0 / proprietary hybrid).
See `SDF Slicer.lspkg/LICENSE` (if present).

