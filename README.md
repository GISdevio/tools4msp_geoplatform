# Tools4MSP Data Migration

You are in an orphan branch dedicated to the migration of data from the legacy to the new platform.

As outlined in the [dedicated issue](https://github.com/GISdevio/tools4msp_geoplatform/issues/4), the entities that should be migrated are the following.

> [!IMPORTANT]
> The order of the list reflects the order in which entities should be imported in the new platform to ensure that any dependency is resolved correctly.

- Users
- Groups
- Categories
- Custom taxonomies
- Licenses (*manually ported*)
- Thesaurus (thesauri, thesaurus keyword labels, thesaurus keywords)*
- Tags (*manually ported*)
- Documents
- Raster layers
- Vector layers
- Vector temporal series (*manually ported*)
- Remote services (*manually ported*)
- Remote layers (*manually ported*)
- Maps (*manually ported*)
- GeoDataBuilders (*manually ported*)
- Geostories (*manually ported*)
- Dashboards (*manually ported*)
- Case studies

For some of them, a set of [automatic migration scripts](#migration-scripts) is provided in this branch, while others require a manual migration (either because they are low in number, or because an automatic approach is too complicated, or even not feasible).

Each automatically migratable entity has its own directory under `/src` with a `README.md` outlining the migration strategy as well as any useful information.

## Migration scripts

The migration scripts are written in Typescript and run on Node.js. To setup the project, you need to:

- install [Node.js v24](https://nodejs.org/en/) on your machine
- enable [Yarn](https://yarnpkg.com/) package manager running `corepack enable`
- install the dependencies running `yarn install`
- [setup the environment](#env-setup)

The entrypoint of the service is in `/src/index.ts`. Here you will find a function called `main`, which in turn calls the various migration functions. Just comment/uncomment the functions you need to run, read the `README.md` file in the corresponding directory, and spin up the process with

```sh
yarn start
```

At the end of the script execution, you will most likely find a report or some generated data in the corresponding directory under `/data`.

### Env setup

The scripts need a `.env` file in the root of the repository containing information on how to authenticated to the platforms.

The structure of the file is the following:

```ini
GEONODE_V3_CSRF_TOKEN=
GEONODE_V3_SESSION_ID=

GEONODE_V4_URL=
GEONODE_V4_CSRF_TOKEN=
GEONODE_V4_SESSION_ID=
```

While there are ways to recover auth information automatically, the easiest and most reliable way to do so is manually bt logging in from the web interface and copying the generated cookies.

## Raster layers migration report

During the migration of raster layers we incurred in some problems downloading the original files. It follows the list of errors with the affected layers names.

### No details

These are layers for which details cannot be opened (they miss the `detail_url` property and clicking on the layer title from UI does not trigger a navigation).

- MC651_or_MC451_or_MC35__Bio_Med_circalittoral_coastal_terrigenous_muds_or_Bio_Med_muddy_detritic_bottoms_or_Med_circalittoral_coarse_sediment0 (uploaded by `danilo.scannella`)
- MD651_or_MD451__Biocenosis_of_Mediterranean_offshore_circalittoral_coastal_terrigenous_muds_or_Biocenosis_of_Mediterranean_open_sea_detritic_bottoms_on_shelf_edge (uploaded by `danilo.scannella`)
- MD651_or_MD451__Biocenosis_of_Mediterranean_offshore_circalittoral_coastal_terrigenous_muds_or_Biocenosis_of_Mediterranean_open_sea_detritic_bottoms_on_shelf_edge0 (uploaded by `danilo.scannella`)
- MD651_or_MD451__Biocenosis_of_Mediterranean_offshore_circalittoral_coastal_terrigenous_muds_or_Biocenosis_of_Mediterranean_open_sea_detritic_bottoms_on_shelf_edge1 (uploaded by `danilo.scannella`)

### No original files

There are layers whose original files cannot be downloaded (they miss the "Download original files" link in the UI under `Download Layer > Data`).

- MB55__Mediterranean_infralittoral_sand0 (uploaded by `danilo.scannella`)
- a__550_4240_MLITTER (uploaded by `Training_PS3`)
- RAJACLA_spawners_persistence1 (uploaded by `danilo.scannella`)
- a__550_4240_MLITTER (uploaded by `Training_PS3`)
- a__582_4587_CEASCORE (uploaded by `BRIDGEPS`)
- a__911_5208_CEASCORE (uploaded by `danilo.scannella`)
- a__911_5208_MAPCEA_IMPACT_LEVEL (uploaded by `danilo.scannella`)
- a__911_5208_MAPCEA_IMPACT_LEVEL (uploaded by `danilo.scannella`)
- a__911_5208_MAPCEA_MSFDSUB (uploaded by `danilo.scannella`)
- a__911_5208_MAP_EFFECT_POTENTIAL (uploaded by `danilo.scannella`)
- a__911_5208_MAP_SENS_POTENTIAL (uploaded by `danilo.scannella`)
- a__911_5208_MAP_VULNERABILITY (uploaded by `danilo.scannella`)

## Vector layers migration report

During the migration of vector layers we found some layers with multiple styles. The support for multiple styles [has been dropped](https://github.com/GeoNode/geonode/discussions/12840) with Geonode 4, therefore we choose to keep only the *default style* in the migration process.

It follows a list of the layers involved in the form of `[<layer-id>] <layer-name>`. The extra styles (i.e., the non-default ones) are collected in the `/data/vector-layers-extra-styles` folder of this repo and are organized in folders named as the corresponding layer id.

- [235] ACCOBAMS_predind_DELDEL_TURTRU_PHOPHO (uploaded by `Tools4msp`)
- [584] Alien_species_occurrence (uploaded by `danilo.scannella`)
- [499] areereperimento_point (uploaded by `amefad`)
- [242] PS1_50kmsea_1kmland0 (uploaded by `BRIDGE-BS`)
- [247] ps3_buffer (uploaded by `BRIDGE-BS`)
- [554] CaseStudySoS (uploaded by `germana.garofalo@cnr.it`)
- [1862] EMODnet_HA_MSP_Supplementary_Regulation_20250 (uploaded by `amefad`)
- [1859] EMODnet_HA_MSP_Zoning_Element_pg_20250124 (uploaded by `amefad`)
- [95] mc35 (uploaded by `EMODnet`)
- [675] Pop_stimata_ISTAT_2023 (uploaded by `alessandro2`)
- [884] Export_Output_211 (uploaded by `Beltrano`)
- [1777] fishingeffort_2024_polygons (uploaded by `alessandro2`)
- [122] hatch_data_model_gee (uploaded by `HATCH`)
- [484] NAS_pilot_area (uploaded by `amefad`)
- [486] NTS_pilot_area (uploaded by `amefad`)
- [488] NTS_subareas (uploaded by `amefad`)
- [489] SoS_subareas (uploaded by `amefad`)
- [487] SoS_pilot_area (uploaded by `amefad`)
- [1150] zoning_elements_4326 (uploaded by `Tools4msp`)
- [1100] BDAquaculture (uploaded by `isabella`)
- [1102] BDArtisanalfishing (uploaded by `isabella`)
- [1103] BDBlueinfrastructures (uploaded by `isabella`)
- [1104] BDMPA (uploaded by `isabella`)
- [1101] BDMappedoffshoresanddeposit (uploaded by `isabella`)
- [1108] BDOGdecomissioning (uploaded by `isabella`)
- [1113] NWMPA (uploaded by `isabella`)
- [1114] NWNewoffshoreMPA (uploaded by `isabella`)
- [1112] NWMappedoffshoresanddeposit (uploaded by `isabella`)
- [246] OSMOSE_mean_fish_abundance (uploaded by `BRIDGE-BS`)
- [244] OSMOSE_mean_fish_biomass (uploaded by `BRIDGE-BS`)
- [243] OSMOSE_mean_fish_yield (uploaded by `BRIDGE-BS`)
- [897] Export_Output_218 (uploaded by `Beltrano`)
- [899] Export_Output8 (uploaded by `Beltrano`)
- [1998] PRED_Med_ggri_Rissos_dolphin (uploaded by `alessandro2`)
- [898] Export_Output6 (uploaded by `Beltrano`)
- [1739] coverage_stats (uploaded by `ssottoriva`)
- [223] soundscape_extra_noise_5km (uploaded by `admin`)
- [1655] BK_scenari_11_12_2024 (uploaded by `alessandro2`)
- [914] Eolico_Proposals (uploaded by `isabella`)
- [443] SSF_GSA16_GNS1 (uploaded by `CNR-IRBIM`)
- [1707] MAB_TUSCAN_ISLANDS (uploaded by `alessandro2`)
- [782] Eolico (uploaded by `isabella`)
- [690] piani_reg_portuali_4326 (uploaded by `amefad`)
- [1302] scenari_MSP4Biodiversity (uploaded by `alessandro2`
