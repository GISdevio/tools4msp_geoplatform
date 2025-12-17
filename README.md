# Tools4MSP Data Migration

You are in an orphan branch dedicated to the migration of data from the legacy to the new platform.

As outlined in the [dedicated issue](https://github.com/GISdevio/tools4msp_geoplatform/issues/4), the entities that should be migrated are the following.

> [!IMPORTANT]
> The order of the list reflects the order in which entities should be imported in the new platform to ensure that any dependency is resolved correctly.

- Users
- Groups
- Categories
- Keywords
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

## Notable information

## Raster layers migration report

During the migration of raster layers we incurred in some problems downloading or uploading the datasets. It follows the list of errors with the affected layers names.

### No details

These are layers for which details cannot be opened (they miss the `detail_url` property and clicking on the layer title from UI does not trigger a navigation). It follows a list of the layers involved in the form of `[<layer-id>] <layer-name>`.

- `[1388] MC651_or_MC451_or_MC35__Bio_Med_circalittoral_coastal_terrigenous_muds_or_Bio_Med_muddy_detritic_bottoms_or_Med_circalittoral_coarse_sediment0` uploaded by `danilo.scannella`
- `[1392] MD651_or_MD451__Biocenosis_of_Mediterranean_offshore_circalittoral_coastal_terrigenous_muds_or_Biocenosis_of_Mediterranean_open_sea_detritic_bottoms_on_shelf_edge` uploaded by `danilo.scannella`
- `[1393] MD651_or_MD451__Biocenosis_of_Mediterranean_offshore_circalittoral_coastal_terrigenous_muds_or_Biocenosis_of_Mediterranean_open_sea_detritic_bottoms_on_shelf_edge0` uploaded by `danilo.scannella`
- `[1394] MD651_or_MD451__Biocenosis_of_Mediterranean_offshore_circalittoral_coastal_terrigenous_muds_or_Biocenosis_of_Mediterranean_open_sea_detritic_bottoms_on_shelf_edge1` uploaded by `danilo.scannella`

### No original files

There are layers whose original files cannot be downloaded (they miss the "Download original files" link in the UI under `Download Layer > Data`). Trying to use the "Export Layer" function triggers a `DownloadEstimator error` with the following message:

> DownloadEstimator request failed which means that exported files exceeds configured server limits. Try to change download options or add filter to your layer and try again.

It follows a list of the layers involved in the form of `[<layer-id>] <layer-name>`.

- `[1484] MB55 Mediterranean infralittoral sand SoS` uploaded by `danilo.scannella`
- `[472] Marine litter` uploaded by `Training_PS3`
- `[1522] Spawning Habitat of Thornback ray Raja clavata (RJC) SoS` uploaded by `danilo.scannella`
- `[471] a__550_4240_MLITTER` uploaded by `Training_PS3`
- `[617] a__582_4587_CEASCORE` uploaded by `BRIDGEPS`
- `[1547] a__911_5208_CEASCORE` uploaded by `danilo.scannella`
- `[1538] a__911_5208_MAPCEA_IMPACT_LEVEL` uploaded by `danilo.scannella`
- `[1539] a__911_5208_MAPCEA_IMPACT_LEVEL` uploaded by `danilo.scannella`
- `[1543] a__911_5208_MAPCEA_MSFDSUB` uploaded by `danilo.scannella`
- `[1544] a__911_5208_MAP_EFFECT_POTENTIAL` uploaded by `danilo.scannella`
- `[1545] a__911_5208_MAP_SENS_POTENTIAL` uploaded by `danilo.scannella`
- `[1546] a__911_5208_MAP_VULNERABILITY` uploaded by `danilo.scannella`

### Multiple TIF files

There are layers with multiple TIF files in their original files. For these layers, we do not know which file to use. It follows a list of the layers involved in the form of `[<layer-id>] <layer-name>`.

- `[545] BRIDGE-BS - Pilot Site 1 - MSFDPHY CEASCORE - Current condition` uploaded by `admin`
- `[544] BRIDGE-BS - Pilot Site 1 - MSFDSUB CEASCORE - Current condition` uploaded by `admin`
- `[529] BRIDGE-BS - Pilot Site 2 - CEASCORE - Current condition` uploaded by `admin`
- `[531] BRIDGE-BS - Pilot Site 2 - MSFDBIO CEASCORE - Current condition` uploaded by `admin`
- `[533] BRIDGE-BS - Pilot Site 2 - MSFDPHY CEASCORE - Current condition` uploaded by `admin`
- `[532] BRIDGE-BS - Pilot Site 2 - MSFDSUB CEASCORE - Current condition` uploaded by `admin`
- `[551] BRIDGE-BS - Pilot Site 3 - CEASCORE - Current condition` uploaded by `admin`
- `[552] BRIDGE-BS - Pilot Site 3 - MSFDBIO CEASCORE - Current condition` uploaded by `admin`
- `[549] BRIDGE-BS - Pilot Site 3 - MSFDPHY CEASCORE - Current condition` uploaded by `admin`

### Multiple styles

During the migration of raster layers, we found some layers with multiple styles. The support for multiple styles [has been dropped](https://github.com/GeoNode/geonode/discussions/12840) with Geonode 4, therefore we choose to keep only the *default style* in the migration process.

It follows a list of the layers involved in the form of `[<layer-id>] <layer-name>`. The extra styles (i.e., the non-default ones) are collected in the `/data/raster-layers-extra-styles` folder of this repo and are organized in folders named as the corresponding layer id.

- `[2004] NTS_seagrass_habitat_binary` uploaded by `szunino@ogs.it`
- `[2006] LBA Synt & Litter` uploaded by `Tools4msp`
- `[2007] LBA Plume nonsynth` uploaded by `GiulioF`
- `[2008] LBA Fert` uploaded by `Tools4msp`
- `[2010] SoS_seagrass_habitat_binary` uploaded by `szunino@ogs.it`
- `[2012] NAS_seagrass_habitat_binary` uploaded by `szunino@ogs.it`

## Vector layers migration report

During the migration of vector layers we incurred in some problems downloading or uploading the datasets. It follows the list of errors with the affected layers names.

### No original files

There are layers whose original files cannot be downloaded (they miss the "Download original files" link in the UI under `Download Layer > Data`). It follows a list of the layers involved in the form of `[<layer-id>] <layer-name>`.

- `[1475] Bridge_BS_Use_Scenarios` uploaded by `alessandro2`
- `[555] CaseStudySoS0` uploaded by `germana.garofalo@cnr.it`
- `[864] Export_Output_103` uploaded by `Beltrano`
- `[1423] fishingeffort_2023_polygons` uploaded by `alessandro2`
- `[1097] SPMaritimeTransport` uploaded by `isabella`
- `[1143] a__6nm` uploaded by `isabella`
- `[1109] BDnewandextendedZTBFRA` uploaded by `isabella`
- `[1116] NWOWF` uploaded by `isabella`
- `[1154] NW_BD_PSSA0` uploaded by `isabella`
- `[1095] SPFSRU` uploaded by `isabella`
- `[1034] ATBA` uploaded by `isabella`
- `[1045] Acquacoltura` uploaded by `isabella`
- `[1044] AMP_ATBA` uploaded by `isabella`
- `[1042] Difesa_costiera` uploaded by `isabella`
- `[1033] difesa0` uploaded by `isabella`
- `[1048] ZTB` uploaded by `isabella`
- `[1038] Tursiope2nk` uploaded by `isabella`
- `[1032] Protezione` uploaded by `isabella`
- `[1037] ZPS` uploaded by `isabella`
- `[886] ordinanze_sicilia_ag` uploaded by `Beltrano`
- `[1065] Aquaculture` uploaded by `isabella`
- `[1066] BAnuoveFRA` uploaded by `isabella`
- `[1070] RI0` uploaded by `isabella`
- `[1069] CLBAOffshoreWindAreaBD` uploaded by `isabella`
- `[1055] NW_BAtraspmarit` uploaded by `isabella`
- `[910] Stenella_OBIS2` uploaded by `isabella`
- `[924] WWF_Marxan_For_Portal` uploaded by `isabella`
- `[1132] pSIC_per_il_Tursiope` uploaded by `sarretta`
- `[611] _55` uploaded by `omar`
- `[1723] test` uploaded by `alessandro2`

### Misc upload errors

During the upload of some layers a series of miscellaneous errors occurred. It follows a list of the layers involved in the form of `[<layer-id>] <layer-name> -> <error-occurred>`.

- `[995] Depth contour 800-1500m` uploaded by `isabella` -> `Non UFT-8 content found when writing feature -1 of layer`
- `[1770] ReMAP - Sea Use Function Analysis` uploaded by `admin` -> `Non UFT-8 content found when writing feature -1 of layer`
- `[2065] SSF_Adriamed_GSA170` uploaded by `alessandro2` -> `Missing "prj" file`
- `[1708] SSF_Adriamed_GSA17` uploaded by `alessandro2` -> `Missing "prj" file`
- `[2253] EU_2018_Wind_Farms_Criteria_status_D1_birds` uploaded by `admin` -> `Non UFT-8 content found when writing feature -1 of layer`
- `[2154] baltic_nature_D5_eutrophication` uploaded by `admin` -> `Non UFT-8 content found when writing feature -1 of layer`
- `[1689] Fishing_Grounds_SoS` uploaded by `alessandro2` -> `Failed to publish feature type fishing_grounds_sos_ahifmik : 500, This is unexpected, the layer srs seems to be mis-configured.`

### Multiple styles

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
- [1302] scenari_MSP4Biodiversity (uploaded by `alessandro2`)
- [1055] SOUNDSCAPE - Extra noise 2020 - 5km (uploaded by `admin`)
- [2152] baltic_owf_D1_birds_pelagic_surface_4326 (uploaded by `admin`)
- [2249] MSP_MSFD_2018_Nature_Protection_Conservation_ (uploaded by `admin`)
- [2250] MSP_MSFD_2018_Maritime_Traffic_flows_Overall_ (uploaded by `admin`)
- [2268] emodnet_msp_functions_count (uploaded by `admin`)
