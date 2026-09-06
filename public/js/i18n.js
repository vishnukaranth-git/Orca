/**
 * ORCA Multi-Lingual Internationalization (i18n) Engine
 * Supported Languages:
 *  - en: English
 *  - kn: Kannada (ಕನ್ನಡ)
 *  - hi: Hindi (हिन्दी)
 *  - ta: Tamil (தமிழ்)
 */

class OrcaI18n {
  constructor() {
    this.currentLang = localStorage.getItem('orca_language') || 'en';
    if (!['en', 'kn', 'hi', 'ta'].includes(this.currentLang)) {
      this.currentLang = 'en';
    }

    this.translations = {
      en: {
        // Branding & Sidebar
        brand_title: 'ORCA',
        brand_subtitle: 'OCEAN INTELLIGENCE',
        sys_status_online: 'SYS STATUS: ONLINE',
        sys_depth_io: 'DEPTH: 4,812M · IO-BASIN',
        nav_section_title: 'MISSION NAVIGATION',
        tab_ask_orca: 'Ask ORCA',
        tab_command: 'Command Center',
        tab_pfz: 'Fishing Zones',
        tab_disasters: 'Disaster Watch',
        tab_satellite: 'Satellite Lab',
        tab_routes: 'Safe Routes',
        tab_historical: 'Historical Trends',
        tab_simulator: 'What-If',
        sidebar_agents_title: 'ORCA AGENTS',
        sidebar_agents_sub: '7 Core Active · IO Basin',
        sidebar_orbit_sync: 'ORBIT: SENTINEL-1/3 SYNC',

        // Map HUD Controls & Layers
        hud_locate: 'Locate',
        hud_satellite: 'Satellite',
        hud_streetview: 'Street View',
        hud_layers: 'Layers',
        hud_basin_live: 'INDIAN OCEAN BASIN (LIVE)',
        sec_tag: 'SECTORS',
        sec_all: 'All Basin',
        sec_arabian_sea: 'Arabian Sea',
        sec_bay_of_bengal: 'Bay of Bengal',
        sec_lakshadweep_sea: 'Lakshadweep Sea',
        sec_andaman_sea: 'Andaman Sea',
        sec_gulf_of_mannar: 'Gulf of Mannar',
        sec_gulf_of_sri_lanka: 'Palk Strait',
        sec_indian_ocean: 'Equatorial Indian Ocean',
        layers_header: 'GEOSPATIAL LAYERS',
        layer_labels: 'Satellite Labels & Borders',
        layer_streetview: 'Street View Coverage',
        layer_basins: 'Ocean Basins & Sectors',
        layer_pfz: 'Potential Fishing Zones (PFZ)',
        layer_restricted: 'Restricted Maritime Zones',
        layer_hazards: 'Marine Hazard Alerts',
        layer_vessels: 'AIS Vessels',
        layer_eez: 'Indian EEZ Boundary',

        // AI Chat (Ask ORCA)
        chat_new_query: 'New Intelligence Query',
        chat_recent_queries: 'RECENT QUERIES',
        hero_title: 'ASK ORCA',
        hero_subtitle: 'Ocean Intelligence Assistant',
        hero_description: 'Ask anything about the ocean, marine conditions, fishing zones, weather, safety, routes, disasters, satellite observations, or coastal conditions.',
        placeholder_hero: 'Ask ORCA in English, Kannada, Hindi, or Tamil...',
        placeholder_bottom: 'Ask ORCA in English, Kannada, Hindi, or Tamil (e.g. What about afternoon?)...',
        btn_hero_ask: 'Ask ORCA',
        hero_suggested_label: 'Suggested questions',
        btn_send: 'Send',
        btn_listen: '🔊 Listen',
        btn_pause: '⏸ Pause',
        btn_provenance: '🔬 Evidence Provenance',
        ai_modal_title: 'ORCA INTELLIGENCE ENGINE',
        ai_modal_sub: 'Analyzing your marine query...',
        modal_validation_title: 'EVIDENCE INTEGRITY VALIDATION',
        modal_risk_lbl: 'SYNTHESIZED MARINE RISK',
        btn_view_answer: 'VIEW ANSWER',
        suggestions: [
          'Is it safe to fish tomorrow near Mangalore?',
          'Where is the nearest PFZ today?',
          'Are there any cyclone or high-wave warnings near my location?'
        ],

        // AI Chat Card Headings
        card_header_title: 'ORCA MARINE INTELLIGENCE',
        direct_ans_label: 'DIRECT INTELLIGENCE ANSWER',
        score_label: 'SCORE:',
        why_evidence_title: 'WHY / KEY EVIDENCE FINDINGS',
        evidence_specialists_title: 'EVIDENCE FROM SPECIALIST AGENTS',
        sensor_fusion_conf: 'MULTI-AGENT SENSOR FUSION · CONFIDENCE:',
        op_recommendation_title: 'OPERATIONAL RECOMMENDATION & ADVISORY',
        tech_evidence_title: 'TECHNICAL EVIDENCE (EXPAND FOR RESEARCHERS)',
        provenance_btn_text: 'View Full Scientific Provenance Table',

        // PFZ View
        pfz_badge: 'SATELLITE DERIVED · INCOIS METHODOLOGY',
        pfz_title: 'POTENTIAL FISHING ZONES (INDIAN WATERS & EEZ)',
        pfz_subtitle: 'Multi-Factor Explainable PFZ Intelligence · Chlorophyll-a & SST Thermal Fronts',
        filter_all: 'All',
        filter_best: 'Best Overall',
        filter_nearest: 'Nearest',
        filter_safest: 'Safest',
        filter_potential: 'Highest Catch',
        btn_view_on_map: 'VIEW ON MAP',
        pfz_lbl_operational_zones: 'OPERATIONAL ZONES',
        pfz_lbl_active_sectors: '8 ACTIVE SECTORS',
        pfz_lbl_eo_sensors: 'EO SENSORS',
        pfz_lbl_active_sort: 'ACTIVE SORT / FILTER',
        pfz_lbl_coastal_origin: 'COASTAL REFERENCE ORIGIN',
        card_potential: 'Potential',
        card_safety: 'Safety',
        card_distance: 'Distance',
        card_depth: 'Depth',
        card_target_species: 'Target Species:',
        card_coordinates: 'COORDINATES:',
        card_btn_plot: 'OK, PLOT THIS ON MAP →',
        rank_best_overall: 'BEST OVERALL',
        rank_nearest: 'NEAREST',
        rank_safest: 'SAFEST',
        rank_highest_catch: 'HIGHEST CATCH',
        rank_sector_of: 'SECTOR',

        // Disaster Watch
        disaster_badge: 'GDACS · USGS · INCOIS OFFICIAL BULLETINS',
        disaster_title: 'DISASTER WATCH & MARITIME HAZARD MONITOR',
        disaster_subtitle: 'Live Global & Regional Marine Intelligence · Cyclones, Storm Surges & Seismic Advisories',
        disaster_official_tag: 'OFFICIAL BULLETINS ONLY',
        disaster_meta_global_feeds: 'GLOBAL MONITORING FEEDS',
        disaster_meta_gdacs_usgs: 'GDACS (UN/EC) & USGS SEISMIC',
        disaster_meta_basin_threat: 'INDIAN OCEAN BASIN THREAT',
        disaster_meta_no_tsunami: 'NO TSUNAMI WATCH ACTIVE',
        disaster_meta_coastal_warning: 'COASTAL WARNING SECTORS',
        disaster_meta_swell_surge: 'SWELL SURGE & SQUALLY WEATHER',
        disaster_meta_data_honesty: 'DATA HONESTY PROTOCOL',
        disaster_meta_direct_ingestion: 'DIRECT AUTHORITATIVE INGESTION ONLY',
        disaster_action_lbl: 'RECOMMENDED MARITIME ACTION:',
        disaster_notice_text: 'ORCA does not independently simulate or synthesize fake tsunamis or disasters. All seismic and tsunami notifications are directly ingested from authoritative international and national tsunami warning centers (IOTWMS / INCOIS / USGS / GDACS).',

        // Satellite Lab
        sat_badge: 'COPERNICUS & ISRO EO SATELLITE LAB',
        sat_title: 'SATELLITE INTELLIGENCE LAB',
        sat_subtitle: 'Multispectral Earth Observation · Sentinel-1 SAR, Sentinel-2 Optical & Sentinel-3 OLCI/SLSTR',
        sat_sector_label: 'SECTOR:',
        sat_band_sst: 'SST Anomaly',
        sat_band_chl: 'Chlorophyll-a',
        sat_band_flood: 'SAR Flood Radar',
        sat_band_optical: 'True Color Optical',
        sat_btn_plot: 'PLOT ON MAP',
        sat_pre_event: 'PRE-EVENT BASELINE (04:00 UTC)',
        sat_post_event: 'LIVE ORBITAL PASS (10:45 UTC)',
        sat_cursor_sounding: 'CURSOR SOUNDING: Move cursor across satellite swath to inspect pixel telemetry',
        sat_legend_sst: 'SST THERMAL GRADIENT (°C)',
        sat_legend_chl: 'CHLOROPHYLL CONCENTRATION (mg/m³)',
        sat_legend_flood: 'SAR FLOOD INUNDATION / BACKSCATTER',
        sat_legend_optical: 'MULTISPECTRAL REFLECTANCE',

        // Safe Routes
        route_title: 'SAFE ROUTE RECOMMENDATION',
        route_subtitle: 'Bathymetric Fairway Routing & Geofenced Sanctuary Clearance',
        route_origin_label: 'ORIGIN PORT / HARBOR',
        route_dest_label: 'TARGET DESTINATION / FISHING ZONE',
        route_btn_calc: 'CALCULATE SAFE CORRIDOR',
        route_passage_cleared: 'PASSAGE CLEARED',
        route_distance: 'Distance:',
        route_nautical: 'Nautical:',
        route_transit: 'Est. Transit:',
        route_safety_check: 'SAFETY CHECK & GEOFENCING:',
        route_clear_text: '✓ Safe Channel Clear of Marine Sanctuaries & Military Sectors',
        route_recenter_btn: 'RE-FRAME CORRIDOR OVERVIEW',

        // Historical Trends
        hist_title: '7-DAY HISTORICAL TREND ANALYSIS',
        hist_sub: 'Open-Meteo Marine Archive & Climatological Observation',
        hist_station_label: 'OBSERVATION BUOY / CLIMATOLOGICAL SECTOR',
        hist_mean_swell: '7-Day Mean Swell:',
        hist_peak_wave: 'Peak Significant:',
        hist_mean_sst: 'Mean SST Temp:',
        hist_wave_chart_title: 'Wave Height & Swell Dynamics (Last 7 Days)',
        hist_sst_chart_title: 'Sea Surface Temperature (SST °C) Trend',
        tag_historical_archive: 'HISTORICAL ARCHIVE',
        tag_thermal_memory: 'THERMAL MEMORY',

        // What-If Simulator
        sim_badge: 'DECISION INTELLIGENCE · MULTI-SCENARIO PROJECTION',
        sim_title: 'WHAT-IF DEPARTURE TIME SIMULATOR',
        sim_sub: 'Multi-Dimensional Risk Radar & Hourly Forecast Tradeoff Analysis',
        sim_sector_label: 'SECTOR:',
        sim_scenario_a: 'SCENARIO A:',
        sim_scenario_b: 'SCENARIO B:',
        sim_rec_headline: 'AI MARITIME DISPATCH RECOMMENDATION',
        sim_badge_a: 'SCENARIO A',
        sim_badge_b: 'SCENARIO B',
        sim_departure: 'Departure:',
        sim_risk_score: 'Risk Score:',
        sim_wave_swell: 'Wave Swell:',
        sim_wave_period: 'Wave Period:',
        sim_surface_wind: 'Surface Wind:',
        sim_wind_gusts: 'Wind Gusts:',
        sim_catch_potential: 'Catch Potential:',
        sim_fuel_eff: 'Fuel Efficiency:',
        sim_radar_title: 'MULTI-DIMENSIONAL MARITIME RADAR',
        sim_radar_sub: 'NORMALIZED METRICS (0 - 100)',
        sim_param_col: 'PARAMETER',
        sim_variance_col: 'VARIANCE / ADVANTAGE',
        sim_status_low: 'LOW RISK (FAVORABLE)',
        sim_status_mod: 'MODERATE RISK (CAUTION)',
        sim_status_high: 'HIGH RISK (HAZARDOUS)',

        // Landing Page Hero & Sections
        landing_brand_sub: 'OCEAN INTELLIGENCE',
        landing_hero_eyebrow: 'AI-POWERED MARINE INTELLIGENCE',
        landing_hero_headline: 'From Ocean Data<br>to Actionable Intelligence.',
        landing_hero_subtext: 'Ask complex marine questions in natural language. Discover evidence, analyze ocean conditions, and make informed decisions.',
        landing_cta_generate: 'Generate Analysis',
        landing_cta_explore: 'Explore ORCA',

        // Multi-Agent Reasoning Section
        landing_reasoning_eyebrow: 'MULTI-AGENT REASONING',
        landing_reasoning_title: 'How ORCA Turns Questions Into Intelligence',
        landing_reasoning_sub: 'Six deterministic stages that ground every response in verifiable physical oceanography.',
        landing_wf_01_name: 'ASK',
        landing_wf_01_desc: 'Ask a marine question in natural language.',
        landing_wf_02_name: 'PLAN',
        landing_wf_02_desc: 'Understand intent and decompose the task.',
        landing_wf_03_name: 'DISCOVER',
        landing_wf_03_desc: 'Select relevant data sources and tools.',
        landing_wf_04_name: 'ANALYZE',
        landing_wf_04_desc: 'Specialized agents analyze the required marine information.',
        landing_wf_05_name: 'VALIDATE',
        landing_wf_05_desc: 'Cross-agent evidence is compared and validated.',
        landing_wf_06_name: 'EXPLAIN',
        landing_wf_06_desc: 'Generate a clear evidence-based response.',

        // Scientific Foundation Section
        landing_science_eyebrow: 'EARTH OBSERVATION & OCEANOGRAPHY',
        landing_science_title: 'Built on Marine Science & Earth Observation',
        landing_science_sub: 'Real sources, operational datasets, and peer-reviewed numerical models powering ORCA.',

        // Mission Access Modal
        modal_clearance_title: 'ORCA MISSION CLEARANCE',
        modal_clearance_sub: 'Ocean Intelligence Access & Operational Station Gateway',
        tab_commission_station: 'Create Account',
        tab_officer_signin: 'Sign In',
        lbl_login_callsign: 'Maritime Email / Station Call Sign',
        lbl_login_key: 'Security Password / Access Key',
        btn_login_submit: 'Sign In & Launch Console',
        lbl_signup_name: 'Full Name / Officer Call Sign',
        lbl_signup_email: 'Maritime Email / Radio Dispatch',
        lbl_signup_pw: 'Security Password (Letters only: A-Z, a-z)',
        btn_signup_submit: 'Create Account & Launch Console'
      },

      kn: {
        // Branding & Sidebar
        brand_title: 'ORCA',
        brand_subtitle: 'ಸಾಗರ ಗುಪ್ತಚರ ವ್ಯವಸ್ಥೆ',
        sys_status_online: 'ವ್ಯವಸ್ಥೆ: ಆನ್‌ಲೈನ್',
        sys_depth_io: 'ಆಳ: 4,812 ಮೀ · IO-ಬೇಸಿನ್',
        nav_section_title: 'ಮಿಷನ್ ನ್ಯಾವಿಗೇಷನ್',
        tab_ask_orca: 'ORCA ಪ್ರಶ್ನಿಸಿ',
        tab_command: 'ಕಮಾಂಡ್ ಸೆಂಟರ್',
        tab_pfz: 'ಮೀನುಗಾರಿಕಾ ವಲಯ',
        tab_disasters: 'ವಿಪತ್ತು ಎಚ್ಚರಿಕೆ',
        tab_satellite: 'ಉಪಗ್ರಹ ಲ್ಯಾಬ್',
        tab_routes: 'ಸುರಕ್ಷಿತ ಮಾರ್ಗಗಳು',
        tab_historical: '7-ದಿನಗಳ ಇತಿಹಾಸ',
        tab_simulator: 'ಸಿಮ್ಯುಲೇಟರ್',
        sidebar_agents_title: 'ORCA ಏಜೆಂಟ್‌ಗಳು',
        sidebar_agents_sub: '7 ಸಕ್ರಿಯ ಏಜೆಂಟ್‌ಗಳು · IO ಬೇಸಿನ್',
        sidebar_orbit_sync: 'ಕಕ್ಷೆ: ಸೆಂಟಿನೆಲ್-1/3 ಸಿಂಕ್',

        // Map HUD Controls & Layers
        hud_locate: 'ಸ್ಥಳ ಗುರುತಿಸು',
        hud_satellite: 'ಉಪಗ್ರಹ',
        hud_streetview: 'ಸ್ಟ್ರೀಟ್ ವ್ಯೂ',
        hud_layers: 'ಪದರಗಳು',
        hud_basin_live: 'ಹಿಂದೂ ಮಹಾಸಾಗರ (ಲೈವ್)',
        sec_tag: 'ವಲಯಗಳು',
        sec_all: 'ಸಮಗ್ರ ಬೇಸಿನ್',
        sec_arabian_sea: 'ಅರಬ್ಬಿ ಸಮುದ್ರ',
        sec_bay_of_bengal: 'ಬಂಗಾಳ ಕೊಲ್ಲಿ',
        sec_lakshadweep_sea: 'ಲಕ್ಷದ್ವೀಪ ಸಮುದ್ರ',
        sec_andaman_sea: 'ಅಂಡಮಾನ್ ಸಮುದ್ರ',
        sec_gulf_of_mannar: 'ಮನ್ನಾರ್ ಕೊಲ್ಲಿ',
        sec_gulf_of_sri_lanka: 'ಪಾಕ್ ಜಲಸಂಧಿ',
        sec_indian_ocean: 'ಸಮಭಾಜಕ ಹಿಂದೂ ಮಹಾಸಾಗರ',
        layers_header: 'ಭೌಗೋಳಿಕ ಪದರಗಳು',
        layer_labels: 'ಉಪಗ್ರಹ ಲೇಬಲ್‌ಗಳು ಮತ್ತು ಗಡಿಗಳು',
        layer_streetview: 'ಸ್ಟ್ರೀಟ್ ವ್ಯೂ ವ್ಯಾಪ್ತಿ',
        layer_basins: 'ಸಾಗರ ಬೇಸಿನ್‌ಗಳು ಮತ್ತು ವಲಯಗಳು',
        layer_pfz: 'ಸಂಭಾವ್ಯ ಮೀನುಗಾರಿಕಾ ವಲಯಗಳು (PFZ)',
        layer_restricted: 'ನಿರ್ಬಂಧಿತ ಸಮುದ್ರ ವಲಯಗಳು',
        layer_hazards: 'ಸಾಗರ ಅಪಾಯದ ಎಚ್ಚರಿಕೆಗಳು',
        layer_vessels: 'AIS ಹಡಗುಗಳು',
        layer_eez: 'ಭಾರತೀಯ EEZ ಗಡಿ',

        // AI Chat (Ask ORCA)
        chat_new_query: '+ ಹೊಸ ಪ್ರಶ್ನೆ',
        chat_recent_queries: 'ಇತ್ತೀಚಿನ ಪ್ರಶ್ನೆಗಳು',
        hero_title: 'ORCA ಗೆ ಕೇಳಿ',
        hero_subtitle: 'ಸಾಗರ ಗುಪ್ತಚರ AI ಸಹಾಯಕ',
        hero_description: 'ಸಾಗರ, ಸಮುದ್ರ ಪರಿಸ್ಥಿತಿಗಳು, ಮೀನುಗಾರಿಕಾ ವಲಯಗಳು, ಹವಾಮಾನ, ಸುರಕ್ಷತೆ, ಮಾರ್ಗಗಳು, ವಿಪತ್ತುಗಳು, ಉಪಗ್ರಹ ಅವಲೋಕನಗಳು ಅಥವಾ ಕರಾವಳಿ ಪರಿಸ್ಥಿತಿಗಳ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ.',
        placeholder_hero: 'ಕನ್ನಡದಲ್ಲಿ ORCA ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ (ಉದಾ: ನಾಳೆ ಮೀನುಗಾರಿಕೆ ಸುರಕ್ಷಿತವೇ?)...',
        placeholder_bottom: 'ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ ಅಥವಾ ತಮಿಳಿನಲ್ಲಿ ಪ್ರಶ್ನಿಸಿ...',
        btn_hero_ask: 'ORCA ಪ್ರಶ್ನಿಸಿ',
        hero_suggested_label: 'ಸೂಚಿಸಿದ ಪ್ರಶ್ನೆಗಳು',
        btn_send: 'ಕಳುಹಿಸಿ',
        btn_listen: '🔊 ಕೇಳಿ',
        btn_pause: '⏸ ವಿರಾಮ',
        btn_provenance: '🔬 ಸಾಕ್ಷ್ಯ ವಿವರ',
        ai_modal_title: 'ORCA ಗುಪ್ತಚರ ಎಂಜಿನ್',
        ai_modal_sub: 'ನಿಮ್ಮ ಸಾಗರ ಪ್ರಶ್ನೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
        modal_validation_title: 'ಸಾಕ್ಷ್ಯ ಸಮಗ್ರತೆ ಪರಿಶೀಲನೆ',
        modal_risk_lbl: 'ಸಂಯೋಜಿತ ಸಾಗರ ಅಪಾಯ',
        btn_view_answer: 'ಉತ್ತರ ನೋಡಿ',
        suggestions: [
          'ನಾಳೆ ಮಂಗಳೂರು ಬಳಿ ಮೀನುಗಾರಿಕೆ ಸುರಕ್ಷಿತವೇ?',
          'ಇಂದು ಅತ್ಯುತ್ತಮ ಮೀನುಗಾರಿಕಾ ವಲಯ (PFZ) ಎಲ್ಲಿದೆ?',
          'ಮಂಗಳೂರು ಬಳಿ ಚಂಡಮಾರುತ ಅಥವಾ ಎತ್ತರದ ಅಲೆಗಳ ಎಚ್ಚರಿಕೆ ಇದೆಯೇ?'
        ],

        // AI Chat Card Headings
        card_header_title: 'ORCA ಸಾಗರ ಗುಪ್ತಚರ ವ್ಯವಸ್ಥೆ',
        direct_ans_label: 'ನೇರ ಗುಪ್ತಚರ ಉತ್ತರ',
        score_label: 'ಸ್ಕೋರ್:',
        why_evidence_title: 'ಪ್ರಮುಖ ಸಾಕ್ಷ್ಯ ಮತ್ತು ಕಾರಣಗಳು',
        evidence_specialists_title: 'ವಿಶೇಷ ಏಜೆಂಟ್‌ಗಳಿಂದ ಪಡೆದ ಸಾಕ್ಷ್ಯ',
        sensor_fusion_conf: 'ಬಹು-ಏಜೆಂಟ್ ಸಂವೇದಕ ಸಮ್ಮಿಲನ · ವಿಶ್ವಾಸಾರ್ಹತೆ:',
        op_recommendation_title: 'ಕಾರ್ಯಾಚರಣಾ ಶಿಫಾರಸು ಮತ್ತು ಸಲಹೆ',
        tech_evidence_title: 'ತಾಂತ್ರಿಕ ಸಾಕ್ಷ್ಯ (ಸಂಶೋಧಕರಿಗಾಗಿ)',
        provenance_btn_text: 'ಸಂಪೂರ್ಣ ವೈಜ್ಞಾನಿಕ ಸಾಕ್ಷ್ಯ ವಿವರ ನೋಡಿ',

        // PFZ View
        pfz_badge: 'ಉಪಗ್ರಹ ಆಧಾರಿತ · INCOIS ವಿಧಾನ',
        pfz_title: 'ಸಂಭಾವ್ಯ ಮೀನುಗಾರಿಕಾ ವಲಯಗಳು (ಭಾರತೀಯ ಜಲಪ್ರದೇಶ ಮತ್ತು EEZ)',
        pfz_subtitle: 'ಬಹು-ಅಂಶ ವಿವರಿಸಬಹುದಾದ PFZ ಬುದ್ಧಿಮತ್ತೆ · ಕ್ಲೋರೊಫಿಲ್-ಎ ಮತ್ತು SST ಉಷ್ಣ ಮುಂಚೂಣಿಗಳು',
        filter_all: 'ಎಲ್ಲಾ',
        filter_best: 'ಅತ್ಯುತ್ತಮ ಒಟ್ಟಾರೆ',
        filter_nearest: 'ಅತಿ ಹತ್ತಿರದ',
        filter_safest: 'ಅತಿ ಸುರಕ್ಷಿತ',
        filter_potential: 'ಗರಿಷ್ಠ ಕ್ಯಾಚ್',
        btn_view_on_map: 'ನಕ್ಷೆಯಲ್ಲಿ ನೋಡಿ',
        pfz_lbl_operational_zones: 'ಕಾರ್ಯಾಚರಣಾ ವಲಯಗಳು',
        pfz_lbl_active_sectors: '8 ಸಕ್ರಿಯ ವಲಯಗಳು',
        pfz_lbl_eo_sensors: 'EO ಸಂವೇದಕಗಳು',
        pfz_lbl_active_sort: 'ಸಕ್ರಿಯ ವಿಂಗಡಣೆ',
        pfz_lbl_coastal_origin: 'ಕರಾವಳಿ ಉಲ್ಲೇಖ ಕೇಂದ್ರ',
        card_potential: 'ಸಾಮರ್ಥ್ಯ',
        card_safety: 'ಸುರಕ್ಷತೆ',
        card_distance: 'ದೂರ',
        card_depth: 'ಆಳ',
        card_target_species: 'ಗುರಿ ಪ್ರಭೇದಗಳು:',
        card_coordinates: 'ನಿರ್ದೇಶಾಂಕಗಳು:',
        card_btn_plot: 'ಸರಿ, ನಕ್ಷೆಯಲ್ಲಿ ತೋರಿಸಿ →',
        rank_best_overall: 'ಅತ್ಯುತ್ತಮ ಒಟ್ಟಾರೆ',
        rank_nearest: 'ಅತಿ ಹತ್ತಿರದ',
        rank_safest: 'ಅತಿ ಸುರಕ್ಷಿತ',
        rank_highest_catch: 'ಗರಿಷ್ಠ ಕ್ಯಾಚ್',
        rank_sector_of: 'ವಲಯ',

        // Disaster Watch
        disaster_badge: 'GDACS · USGS · INCOIS ಅಧಿಕೃತ ಬುಲೆಟಿನ್‌ಗಳು',
        disaster_title: 'ವಿಪತ್ತು ವೀಕ್ಷಣೆ ಮತ್ತು ಸಾಗರ ಅಪಾಯ ಮಾನಿಟರ್',
        disaster_subtitle: 'ನೈಜ-ಸಮಯದ ಜಾಗತಿಕ ಮತ್ತು ಪ್ರಾದೇಶಿಕ ಸಾಗರ ಬುದ್ಧಿಮತ್ತೆ · ಚಂಡಮಾರುತಗಳು, ಉಲ್ಬಣ ಅಲೆಗಳು ಮತ್ತು ಭೂಕಂಪನ ಎಚ್ಚರಿಕೆಗಳು',
        disaster_official_tag: 'ಅಧಿಕೃತ ಬುಲೆಟಿನ್‌ಗಳು ಮಾತ್ರ',
        disaster_meta_global_feeds: 'ಜಾಗತಿಕ ಮಾನಿಟರಿಂಗ್ ಫೀಡ್‌ಗಳು',
        disaster_meta_gdacs_usgs: 'GDACS (UN/EC) ಮತ್ತು USGS ಭೂಕಂಪನ',
        disaster_meta_basin_threat: 'ಹಿಂದೂ ಮಹಾಸಾಗರ ಬೆದರಿಕೆ',
        disaster_meta_no_tsunami: 'ಯಾವುದೇ ಸುನಾಮಿ ಎಚ್ಚರಿಕೆ ಇಲ್ಲ',
        disaster_meta_coastal_warning: 'ಕರಾವಳಿ ಎಚ್ಚರಿಕೆ ವಲಯಗಳು',
        disaster_meta_swell_surge: 'ಸ್ವೆಲ್ ಸರ್ಜ್ ಮತ್ತು ಬಿರುಗಾಳಿ ಹವಾಮಾನ',
        disaster_meta_data_honesty: 'ಡೇಟಾ ಪ್ರಾಮಾಣಿಕತೆ ಪ್ರೋಟೋಕಾಲ್',
        disaster_meta_direct_ingestion: 'ನೇರ ಅಧಿಕೃತ ಡೇಟಾ ಮಾತ್ರ',
        disaster_action_lbl: 'ಶಿಫಾರಸು ಮಾಡಿದ ಸಾಗರ ಕ್ರಮ:',
        disaster_notice_text: 'ORCA ನಕಲಿ ಸುನಾಮಿ ಅಥವಾ ವಿಪತ್ತುಗಳನ್ನು ಸ್ವತಂತ್ರವಾಗಿ ರಚಿಸುವುದಿಲ್ಲ. ಎಲ್ಲಾ ಭೂಕಂಪನ ಮತ್ತು ಸುನಾಮಿ ಅಧಿಸೂಚನೆಗಳನ್ನು ಅಧಿಕೃತ ಅಂತರರಾಷ್ಟ್ರೀಯ ಮತ್ತು ರಾಷ್ಟ್ರೀಯ ಸುನಾಮಿ ಎಚ್ಚರಿಕೆ ಕೇಂದ್ರಗಳಿಂದ (IOTWMS / INCOIS / USGS / GDACS) ನೇರವಾಗಿ ಪಡೆಯಲಾಗುತ್ತದೆ.',

        // Satellite Lab
        sat_badge: 'ಕೋಪರ್ನಿಕಸ್ ಮತ್ತು ಇಸ್ರೋ EO ಉಪಗ್ರಹ ಲ್ಯಾಬ್',
        sat_title: 'ಉಪಗ್ರಹ ಗುಪ್ತಚರ ಲ್ಯಾಬ್',
        sat_subtitle: 'ಮಲ್ಟಿಸ್ಪೆಕ್ಟ್ರಲ್ ಭೂ ವೀಕ್ಷಣೆ · ಸೆಂಟಿನೆಲ್-1 SAR, ಸೆಂಟಿನೆಲ್-2 ಆಪ್ಟಿಕಲ್ ಮತ್ತು ಸೆಂಟಿನೆಲ್-3 OLCI/SLSTR',
        sat_sector_label: 'ವಲಯ:',
        sat_band_sst: 'SST ವೈಪರೀತ್ಯ',
        sat_band_chl: 'ಕ್ಲೋರೊಫಿಲ್-ಎ',
        sat_band_flood: 'SAR ಪ್ರವಾಹ ರೇಡಾರ್',
        sat_band_optical: 'ನೈಜ ಬಣ್ಣ ಆಪ್ಟಿಕಲ್',
        sat_btn_plot: 'ನಕ್ಷೆಯಲ್ಲಿ ತೋರಿಸಿ',
        sat_pre_event: 'ಘಟನೆಯ ಪೂರ್ವ ಮೂಲರೇಖೆ (04:00 UTC)',
        sat_post_event: 'ಲೈವ್ ಕಕ್ಷೀಯ ಪಾಸ್ (10:45 UTC)',
        sat_cursor_sounding: 'ಕರ್ಸರ್ ಧ್ವನಿ: ಪಿಕ್ಸೆಲ್ ಟೆಲಿಮೆಟ್ರಿಯನ್ನು ಪರೀಕ್ಷಿಸಲು ಕರ್ಸರ್ ಚಲಿಸಿ',
        sat_legend_sst: 'SST ಉಷ್ಣ ತಾಪಮಾನ ಗ್ರೇಡಿಯಂಟ್ (°C)',
        sat_legend_chl: 'ಕ್ಲೋರೊಫಿಲ್ ಸಾಂದ್ರತೆ (mg/m³)',
        sat_legend_flood: 'SAR ಪ್ರವಾಹ ರೇಡಾರ್ ವಿಸ್ತರಣೆ',
        sat_legend_optical: 'ಮಲ್ಟಿಸ್ಪೆಕ್ಟ್ರಲ್ ಪ್ರತಿಫಲನ',

        // Safe Routes
        route_title: 'ಸುರಕ್ಷಿತ ಮಾರ್ಗ ಶಿಫಾರಸು',
        route_subtitle: 'ಬಾತಿಮೆಟ್ರಿಕ್ ಫೇರ್‌ವೇ ರೂಟಿಂಗ್ ಮತ್ತು ಜಿಯೋಫೆನ್ಸ್ಡ್ ಅಭಯಾರಣ್ಯ ಕ್ಲಿಯರೆನ್ಸ್',
        route_origin_label: 'ಮೂಲ ಬಂದರು / ಹಾರ್ಬರ್',
        route_dest_label: 'ಗಮ್ಯಸ್ಥಾನ / ಮೀನುಗಾರಿಕಾ ವಲಯ',
        route_btn_calc: 'ಸುರಕ್ಷಿತ ಮಾರ್ಗವನ್ನು ಲೆಕ್ಕಹಾಕಿ',
        route_passage_cleared: 'ಮಾರ್ಗ ತೆರವುಗೊಂಡಿದೆ',
        route_distance: 'ದೂರ:',
        route_nautical: 'ನಾಟಿಕಲ್:',
        route_transit: 'ಅಂದಾಜು ಸಮಯ:',
        route_safety_check: 'ಸುರಕ್ಷತಾ ತಪಾಸಣೆ ಮತ್ತು ಜಿಯೋಫೆನ್ಸಿಂಗ್:',
        route_clear_text: '✓ ಸಾಗರ ಅಭಯಾರಣ್ಯಗಳು ಮತ್ತು ಮಿಲಿಟರಿ ವಲಯಗಳಿಂದ ಮುಕ್ತ ಸುರಕ್ಷಿತ ಮಾರ್ಗ',
        route_recenter_btn: 'ಮಾರ್ಗ ಅವಲೋಕನ ಮರುಹೊಂದಿಸಿ',

        // Historical Trends
        hist_title: '7-ದಿನಗಳ ಐತಿಹಾಸಿಕ ಪ್ರವೃತ್ತಿ ವಿಶ್ಲೇಷಣೆ',
        hist_sub: 'ಓಪನ್-ಮೆಟಿಯೊ ಸಾಗರ ದಾಖಲೆ ಮತ್ತು ಹವಾಮಾನ ವೀಕ್ಷಣೆ',
        hist_station_label: 'ವೀಕ್ಷಣಾ ಬಯೋಯ್ / ಹವಾಮಾನ ವಲಯ',
        hist_mean_swell: '7-ದಿನಗಳ ಸರಾಸರಿ ಸ್ವಲ್:',
        hist_peak_wave: 'ಗರಿಷ್ಠ ಮಹತ್ವದ ಅಲೆ:',
        hist_mean_sst: 'ಸರಾಸರಿ SST ತಾಪಮಾನ:',
        hist_wave_chart_title: 'ಅಲೆಯ ಎತ್ತರ ಮತ್ತು ಸ್ವಲ್ ಡೈನಾಮಿಕ್ಸ್ (ಕಳೆದ 7 ದಿನಗಳು)',
        hist_sst_chart_title: 'ಸಮುದ್ರ ಮೇಲ್ಮೈ ತಾಪಮಾನ (SST °C) ಪ್ರವೃತ್ತಿ',
        tag_historical_archive: 'ಐತಿಹಾಸಿಕ ದಾಖಲೆ',
        tag_thermal_memory: 'ಉಷ್ಣ ದಾಖಲೆ',

        // What-If Simulator
        sim_badge: 'ನಿರ್ಧಾರ ಬುದ್ಧಿಮತ್ತೆ · ಬಹು-ಪರಿಸ್ಥಿತಿ ಮುನ್ನೋಟ',
        sim_title: 'ಹೊರಡುವ ಸಮಯದ ಸಿಮ್ಯುಲೇಟರ್',
        sim_sub: 'ಬಹು-ಆಯಾಮದ ಅಪಾಯ ಮತ್ತು ಗಂಟೆಯ ಮುನ್ಸೂಚನೆ ವಿಶ್ಲೇಷಣೆ',
        sim_sector_label: 'ವಲಯ:',
        sim_scenario_a: 'ಸನ್ನಿವೇಶ A:',
        sim_scenario_b: 'ಸನ್ನಿವೇಶ B:',
        sim_rec_headline: 'AI ಸಾಗರ ರವಾನೆ ಶಿಫಾರಸು',
        sim_badge_a: 'ಸನ್ನಿವೇಶ A',
        sim_badge_b: 'ಸನ್ನಿವೇಶ B',
        sim_departure: 'ಹೊರಡುವ ಸಮಯ:',
        sim_risk_score: 'ಅಪಾಯ ಸ್ಕೋರ್:',
        sim_wave_swell: 'ಅಲೆಗಳ ಸ್ವೆಲ್:',
        sim_wave_period: 'ಅಲೆಯ ಅವಧಿ:',
        sim_surface_wind: 'ಮೇಲ್ಮೈ ಗಾಳಿ:',
        sim_wind_gusts: 'ಗಾಳಿಯ ವೇಗ:',
        sim_catch_potential: 'ಕ್ಯಾಚ್ ಸಾಮರ್ಥ್ಯ:',
        sim_fuel_eff: 'ಇಂಧನ ದಕ್ಷತೆ:',
        sim_radar_title: 'ಬಹು-ಆಯಾಮದ ಸಾಗರ ರೇಡಾರ್',
        sim_radar_sub: 'ಸಾಮಾನ್ಯೀಕರಿಸಿದ ಮೆಟ್ರಿಕ್‌ಗಳು (0 - 100)',
        sim_param_col: 'ನಿಯತಾಂಕ',
        sim_variance_col: 'ವ್ಯತ್ಯಾಸ / ಪ್ರಯೋಜನ',
        sim_status_low: 'ಕಡಿಮೆ ಅಪಾಯ (ಅನುಕೂಲಕರ)',
        sim_status_mod: 'ಮಧ್ಯಮ ಅಪಾಯ (ಎಚ್ಚರಿಕೆ)',
        sim_status_high: 'ಹೆಚ್ಚಿನ ಅಪಾಯ (ಅಪಾಯಕಾರಿ)',

        // Landing Page Hero & Sections (Kannada)
        landing_brand_sub: 'ಸಾಗರ ಗುಪ್ತಚರ',
        landing_hero_eyebrow: 'AI-ಚಾಲಿತ ಸಾಗರ ಗುಪ್ತಚರ',
        landing_hero_headline: 'ಸಾಗರ ದತ್ತಾಂಶದಿಂದ<br>ಕಾರ್ಯಸಾಧ್ಯ ಗುಪ್ತಚರಕ್ಕೆ.',
        landing_hero_subtext: 'ನೈಸರ್ಗಿಕ ಭಾಷೆಯಲ್ಲಿ ಸಂಕೀರ್ಣ ಸಾಗರ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ. ಸಾಕ್ಷ್ಯಗಳನ್ನು ಅನ್ವೇಷಿಸಿ, ಸಾಗರ ಪರಿಸ್ಥಿತಿಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು ತಿಳುವಳಿಕೆಯುಳ್ಳ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ.',
        landing_cta_generate: 'ವಿಶ್ಲೇಷಣೆ ರಚಿಸಿ',
        landing_cta_explore: 'ORCA ಪರಿಶೋಧಿಸಿ',

        // Multi-Agent Reasoning Section (Kannada)
        landing_reasoning_eyebrow: 'ಮಲ್ಟಿ-ಏಜೆಂಟ್ ತಾರ್ಕಿಕತೆ',
        landing_reasoning_title: 'ORCA ಪ್ರಶ್ನೆಗಳನ್ನು ಹೇಗೆ ಗುಪ್ತಚರವನ್ನಾಗಿ ಪರಿವರ್ತಿಸುತ್ತದೆ',
        landing_reasoning_sub: 'ಪ್ರತಿ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಭೌತಿಕ ಸಾಗರಶಾಸ್ತ್ರದಲ್ಲಿ ಪರಿಶೀಲಿಸುವ ಆರು ಹಂತಗಳು.',
        landing_wf_01_name: 'ಪ್ರಶ್ನಿಸಿ (ASK)',
        landing_wf_01_desc: 'ನೈಸರ್ಗಿಕ ಭಾಷೆಯಲ್ಲಿ ಸಾಗರ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ.',
        landing_wf_02_name: 'ಯೋಜನೆ (PLAN)',
        landing_wf_02_desc: 'ಉದ್ದೇಶವನ್ನು ಗ್ರಹಿಸಿ ಮತ್ತು ಕಾರ್ಯವನ್ನು ವಿಭಜಿಸಿ.',
        landing_wf_03_name: 'ಅನ್ವೇಷಣೆ (DISCOVER)',
        landing_wf_03_desc: 'ಸೂಕ್ತ ಡೇಟಾ ಮೂಲಗಳು ಮತ್ತು ಸಾಧನಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
        landing_wf_04_name: 'ವಿಶ್ಲೇಷಣೆ (ANALYZE)',
        landing_wf_04_desc: 'ವಿಶೇಷ ಏಜೆಂಟ್‌ಗಳು ಅಗತ್ಯವಿರುವ ಸಾಗರ ಮಾಹಿತಿಯನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತವೆ.',
        landing_wf_05_name: 'ಪರಿಶೀಲನೆ (VALIDATE)',
        landing_wf_05_desc: 'ಬಹು-ಏಜೆಂಟ್ ಸಾಕ್ಷ್ಯಗಳನ್ನು ಹೋಲಿಸಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.',
        landing_wf_06_name: 'ವಿವರಣೆ (EXPLAIN)',
        landing_wf_06_desc: 'ಸ್ಪಷ್ಟವಾದ ಸಾಕ್ಷ್ಯಾಧಾರಿತ ಉತ್ತರವನ್ನು ರಚಿಸಿ.',

        // Scientific Foundation Section (Kannada)
        landing_science_eyebrow: 'ಭೂ ವೀಕ್ಷಣೆ ಮತ್ತು ಸಾಗರಶಾಸ್ತ್ರ',
        landing_science_title: 'ಸಾಗರ ವಿಜ್ಞಾನ ಮತ್ತು ಉಪಗ್ರಹ ವೀಕ್ಷಣೆಯ ಮೇಲೆ ನಿರ್ಮಿಸಲಾಗಿದೆ',
        landing_science_sub: 'ORCA ಗೆ ಶಕ್ತಿ ತುಂಬುವ ನೈಜ ಮೂಲಗಳು, ಕಾರ್ಯಾಚರಣೆಯ ಡೇಟಾಸೆಟ್‌ಗಳು ಮತ್ತು ಮಾದರಿಗಳು.',

        // Mission Access Modal (Kannada)
        modal_clearance_title: 'ORCA ಮಿಷನ್ ಕ್ಲಿಯರೆನ್ಸ್',
        modal_clearance_sub: 'ಸಾಗರ ಗುಪ್ತಚರ ವೇದಿಕೆ ಮತ್ತು ಪ್ರವೇಶ ದ್ವಾರ',
        tab_commission_station: 'ಖಾತೆ ರಚಿಸಿ',
        tab_officer_signin: 'ಸೈನ್ ಇನ್',
        lbl_login_callsign: 'ಸಮುದ್ರ ಇಮೇಲ್ / ಕಾಲ್ ಸೈನ್',
        lbl_login_key: 'ಭದ್ರತಾ ಪಾಸ್‌ವರ್ಡ್ / ಕೀ',
        btn_login_submit: 'ಸೈನ್ ಇನ್ ಮಾಡಿ ಮತ್ತು ಕನ್ಸೋಲ್ ಪ್ರಾರಂಭಿಸಿ',
        lbl_signup_name: 'ಪೂರ್ಣ ಹೆಸರು / ಅಧಿಕಾರಿ ಕಾಲ್ ಸೈನ್',
        lbl_signup_email: 'ಸಮುದ್ರ ಇಮೇಲ್ / ರೇಡಿಯೋ ಸಂಪರ್ಕ',
        lbl_signup_pw: 'ಭದ್ರತಾ ಪಾಸ್‌ವರ್ಡ್ (ಕೇವಲ ಅಕ್ಷರಗಳು: A-Z, a-z)',
        btn_signup_submit: 'ಖಾತೆ ರಚಿಸಿ ಮತ್ತು ಕನ್ಸೋಲ್ ಪ್ರಾರಂಭಿಸಿ'
      },

      hi: {
        // Branding & Sidebar
        brand_title: 'ORCA',
        brand_subtitle: 'महासागर खुफिया तंत्र',
        sys_status_online: 'सिस्टम स्थिति: ऑनलाइन',
        sys_depth_io: 'गहराई: 4,812 मी · हिंद महासागर',
        nav_section_title: 'मिशन नेविगेशन',
        tab_ask_orca: 'ORCA से पूछें',
        tab_command: 'कमांड सेंटर',
        tab_pfz: 'मत्स्य क्षेत्र (PFZ)',
        tab_disasters: 'आपदा अलर्ट',
        tab_satellite: 'उपग्रह लैब',
        tab_routes: 'सुरक्षित मार्ग',
        tab_historical: '7-दिवसीय रुझान',
        tab_simulator: 'सिमुलेटर',
        sidebar_agents_title: 'ORCA एजेंट्स',
        sidebar_agents_sub: '7 सक्रिय एजेंट्स · हिंद महासागर',
        sidebar_orbit_sync: 'कक्षा: सेंटिनल-1/3 सिंक',

        // Map HUD Controls & Layers
        hud_locate: 'स्थान खोजें',
        hud_satellite: 'उपग्रह',
        hud_streetview: 'स्ट्रीट व्यू',
        hud_layers: 'परतें',
        hud_basin_live: 'हिंद महासागर बेसिन (लाइव)',
        sec_tag: 'क्षेत्र',
        sec_all: 'समग्र बेसिन',
        sec_arabian_sea: 'अरब सागर',
        sec_bay_of_bengal: 'बंगाल की खाड़ी',
        sec_lakshadweep_sea: 'लक्षद्वीप सागर',
        sec_andaman_sea: 'अंडमान सागर',
        sec_gulf_of_mannar: 'मन्नार की खाड़ी',
        sec_gulf_of_sri_lanka: 'पाक जलडमरूमध्य',
        sec_indian_ocean: 'भूमध्यरेखीय हिंद महासागर',
        layers_header: 'भू-स्थानिक परतें',
        layer_labels: 'उपग्रह लेबल एवं सीमाएं',
        layer_streetview: 'स्ट्रीट व्यू कवरेज',
        layer_basins: 'महासागर बेसिन एवं क्षेत्र',
        layer_pfz: 'संभावित मत्स्य क्षेत्र (PFZ)',
        layer_restricted: 'प्रतिबंधित समुद्री क्षेत्र',
        layer_hazards: 'समुद्री खतरा अलर्ट',
        layer_vessels: 'AIS जहाज',
        layer_eez: 'भारतीय EEZ सीमा',

        // AI Chat (Ask ORCA)
        chat_new_query: '+ नया प्रश्न',
        chat_recent_queries: 'हाल के प्रश्न',
        hero_title: 'ORCA से पूछें',
        hero_subtitle: 'महासागर खुफिया AI सहायक',
        hero_description: 'महासागर, समुद्री स्थिति, मत्स्य क्षेत्र, मौसम, सुरक्षा, मार्ग, आपदाओं, उपग्रह प्रेक्षणों या तटीय परिस्थितियों के बारे में कुछ भी पूछें।',
        placeholder_hero: 'हिन्दी में ORCA से पूछें (उदा: क्या कल मछली पकड़ना सुरक्षित है?)...',
        placeholder_bottom: 'हिन्दी, अंग्रेजी, कन्नड़ या तमिल में पूछें...',
        btn_hero_ask: 'ORCA से पूछें',
        hero_suggested_label: 'सुझाए गए प्रश्न',
        btn_send: 'भेजें',
        btn_listen: '🔊 सुनें',
        btn_pause: '⏸ रोकें',
        btn_provenance: '🔬 साक्ष्य विवरण',
        ai_modal_title: 'ORCA खुफिया इंजन',
        ai_modal_sub: 'आपके समुद्री प्रश्न का विश्लेषण किया जा रहा है...',
        modal_validation_title: 'साक्ष्य अखंडता सत्यापन',
        modal_risk_lbl: 'संश्लेषित समुद्री जोखिम',
        btn_view_answer: 'उत्तर देखें',
        suggestions: [
          'क्या कल मंगलुरु के पास मछली पकड़ना सुरक्षित है?',
          'आज सबसे अच्छा मत्स्य क्षेत्र (PFZ) कहाँ है?',
          'क्या मेरे क्षेत्र के पास चक्रवात या ऊंची लहरों की चेतावनी है?'
        ],

        // AI Chat Card Headings
        card_header_title: 'ORCA समुद्री खुफिया प्रणाली',
        direct_ans_label: 'प्रत्यक्ष खुफिया उत्तर',
        score_label: 'स्कोर:',
        why_evidence_title: 'प्रमुख साक्ष्य एवं निष्कर्ष',
        evidence_specialists_title: 'विशेषज्ञ एजेंटों से साक्ष्य',
        sensor_fusion_conf: 'मल्टी-एजेंट सेंसर संलयन · विश्वास स्तर:',
        op_recommendation_title: 'परिचालन अनुशंसा एवं सलाह',
        tech_evidence_title: 'तकनीकी साक्ष्य (शोधकर्ताओं के लिए)',
        provenance_btn_text: 'पूर्ण वैज्ञानिक साक्ष्य तालिका देखें',

        // PFZ View
        pfz_badge: 'उपग्रह आधारित · INCOIS कार्यप्रणाली',
        pfz_title: 'संभावित मत्स्य क्षेत्र (भारतीय जलक्षेत्र एवं EEZ)',
        pfz_subtitle: 'बहु-कारक व्याख्या योग्य PFZ खुफिया · क्लोरोफिल-ए एवं SST थर्मल फ्रंट्स',
        filter_all: 'सभी',
        filter_best: 'सर्वश्रेष्ठ समग्र',
        filter_nearest: 'निकटतम',
        filter_safest: 'सर्वाधिक सुरक्षित',
        filter_potential: 'अधिकतम पकड़',
        btn_view_on_map: 'मानचित्र पर देखें',
        pfz_lbl_operational_zones: 'परिचालन क्षेत्र',
        pfz_lbl_active_sectors: '8 सक्रिय क्षेत्र',
        pfz_lbl_eo_sensors: 'EO सेंसर',
        pfz_lbl_active_sort: 'सक्रिय फ़िल्टर',
        pfz_lbl_coastal_origin: 'तटीय संदर्भ केंद्र',
        card_potential: 'संभावना',
        card_safety: 'सुरक्षा',
        card_distance: 'दूरी',
        card_depth: 'गहराई',
        card_target_species: 'लक्षित प्रजातियां:',
        card_coordinates: 'निर्देशांक:',
        card_btn_plot: 'ठीक है, इसे मैप पर दिखाएं →',
        rank_best_overall: 'सर्वश्रेष्ठ समग्र',
        rank_nearest: 'निकटतम',
        rank_safest: 'सर्वाधिक सुरक्षित',
        rank_highest_catch: 'अधिकतम पकड़',
        rank_sector_of: 'क्षेत्र',

        // Disaster Watch
        disaster_badge: 'GDACS · USGS · INCOIS आधिकारिक बुलेटिन',
        disaster_title: 'आपदा निगरानी एवं समुद्री खतरा मॉनिटर',
        disaster_subtitle: 'लाइव वैश्विक एवं क्षेत्रीय समुद्री खुफिया · चक्रवात, तूफान की लहरें एवं भूकंपीय सलाह',
        disaster_official_tag: 'केवल आधिकारिक बुलेटिन',
        disaster_meta_global_feeds: 'वैश्विक निगरानी फ़ीड',
        disaster_meta_gdacs_usgs: 'GDACS (UN/EC) एवं USGS भूकंपीय',
        disaster_meta_basin_threat: 'हिंद महासागर बेसिन खतरा',
        disaster_meta_no_tsunami: 'कोई सुनामी अलर्ट सक्रिय नहीं',
        disaster_meta_coastal_warning: 'तटीय चेतावनी क्षेत्र',
        disaster_meta_swell_surge: 'स्वेल सर्ज एवं तूफानी मौसम',
        disaster_meta_data_honesty: 'डेटा ईमानदारी प्रोटोकॉल',
        disaster_meta_direct_ingestion: 'केवल प्रत्यक्ष आधिकारिक डेटा',
        disaster_action_lbl: 'अनुशंसित समुद्री कार्रवाई:',
        disaster_notice_text: 'ORCA स्वतंत्र रूप से नकली सुनामी या आपदाओं का अनुकरण नहीं करता है। सभी भूकंपीय और सुनामी सूचनाएं सीधे आधिकारिक अंतरराष्ट्रीय और राष्ट्रीय सुनामी चेतावनी केंद्रों (IOTWMS / INCOIS / USGS / GDACS) से प्राप्त की जाती हैं।',

        // Satellite Lab
        sat_badge: 'कोपरनिकस एवं इसरो EO उपग्रह लैब',
        sat_title: 'उपग्रह खुफिया लैब',
        sat_subtitle: 'मल्टीस्पेक्ट्रल पृथ्वी अवलोकन · सेंटिनल-1 SAR, सेंटिनल-2 ऑप्टिकल एवं सेंटिनल-3 OLCI/SLSTR',
        sat_sector_label: 'क्षेत्र:',
        sat_band_sst: 'SST विसंगति',
        sat_band_chl: 'क्लोरोफिल-ए',
        sat_band_flood: 'SAR बाढ़ रडार',
        sat_band_optical: 'सत्य रंग ऑप्टिकल',
        sat_btn_plot: 'मानचित्र पर दिखाएं',
        sat_pre_event: 'घटना-पूर्व बेसलाइन (04:00 UTC)',
        sat_post_event: 'लाइव कक्षीय पास (10:45 UTC)',
        sat_cursor_sounding: 'कर्सर साउंडिंग: पिक्सेल टेलीमेट्री का निरीक्षण करने के लिए कर्सर को उपग्रह क्षेत्र पर ले जाएं',
        sat_legend_sst: 'SST थर्मल प्रवणता (°C)',
        sat_legend_chl: 'क्लोरोफिल सांद्रता (mg/m³)',
        sat_legend_flood: 'SAR बाढ़ फैलाव / रडार बैकस्कैटर',
        sat_legend_optical: 'मल्टीस्पेक्ट्रल परावर्तन',

        // Safe Routes
        route_title: 'सुरक्षित मार्ग अनुशंसा',
        route_subtitle: 'बैथिमेट्रिक फेयरवे रूटिंग एवं जियोफेंस्ड अभयारण्य क्लीयरेंस',
        route_origin_label: 'प्रस्थान बंदरगाह / हार्बर',
        route_dest_label: 'गंतव्य / मत्स्य क्षेत्र',
        route_btn_calc: 'सुरक्षित गलियारे की गणना करें',
        route_passage_cleared: 'मार्ग साफ़',
        route_distance: 'दूरी:',
        route_nautical: 'समुद्री मील:',
        route_transit: 'अनुमानित समय:',
        route_safety_check: 'सुरक्षा जांच एवं जियोफेंसिंग:',
        route_clear_text: '✓ समुद्री अभयारण्यों एवं सैन्य क्षेत्रों से मुक्त सुरक्षित चैनल',
        route_recenter_btn: 'गलियारा अवलोकन पुन: व्यवस्थित करें',

        // Historical Trends
        hist_title: '7-दिवसीय ऐतिहासिक रुझान विश्लेषण',
        hist_sub: 'ओपन-मेटियो समुद्री अभिलेखागार एवं जलवायु अवलोकन',
        hist_station_label: 'अवलोकन बोया / जलवायु क्षेत्र',
        hist_mean_swell: '7-दिवसीय औसत स्वेल:',
        hist_peak_wave: 'शीर्ष महत्वपूर्ण लहर:',
        hist_mean_sst: 'औसत SST तापमान:',
        hist_wave_chart_title: 'लहर ऊंचाई एवं स्वेल गतिशीलता (पिछले 7 दिन)',
        hist_sst_chart_title: 'समुद्री सतह तापमान (SST °C) रुझान',
        tag_historical_archive: 'ऐतिहासिक अभिलेखागार',
        tag_thermal_memory: 'थर्मल मेमोरी',

        // What-If Simulator
        sim_badge: 'निर्णय बुद्धिमत्ता · बहु-परिदृश्य प्रक्षेपण',
        sim_title: 'प्रस्थान समय सिमुलेटर',
        sim_sub: 'बहु-आयामी जोखिम रडार एवं प्रति घंटा पूर्वानुमान विश्लेषण',
        sim_sector_label: 'क्षेत्र:',
        sim_scenario_a: 'परिदृश्य A:',
        sim_scenario_b: 'परिदृश्य B:',
        sim_rec_headline: 'AI समुद्री प्रेषण अनुशंसा',
        sim_badge_a: 'परिदृश्य A',
        sim_badge_b: 'परिदृश्य B',
        sim_departure: 'प्रस्थान:',
        sim_risk_score: 'जोखिम स्कोर:',
        sim_wave_swell: 'लहर स्वेल:',
        sim_wave_period: 'लहर अवधि:',
        sim_surface_wind: 'सतही हवा:',
        sim_wind_gusts: 'हवा के झोंके:',
        sim_catch_potential: 'पकड़ संभावना:',
        sim_fuel_eff: 'ईंधन दक्षता:',
        sim_radar_title: 'बहु-आयामी समुद्री रडार',
        sim_radar_sub: 'सामान्यीकृत मेट्रिक्स (0 - 100)',
        sim_param_col: 'पैरामीटर',
        sim_variance_col: 'भिन्नता / लाभ',
        sim_status_low: 'कम जोखिम (अनुकूल)',
        sim_status_mod: 'मध्यम जोखिम (सावधानी)',
        sim_status_high: 'उच्च जोखिम (खतरनाक)',

        // Landing Page Hero & Sections (Hindi)
        landing_brand_sub: 'समुद्री इंटेलिजेंस',
        landing_hero_eyebrow: 'AI-संचालित समुद्री इंटेलिजेंस',
        landing_hero_headline: 'समुद्री डेटा से<br>सटीक इंटेलिजेंस तक।',
        landing_hero_subtext: 'सरल भाषा में जटिल समुद्री प्रश्न पूछें। साक्ष्य खोजें, समुद्री स्थितियों का विश्लेषण करें और सूचित निर्णय लें।',
        landing_cta_generate: 'विश्लेषण उत्पन्न करें',
        landing_cta_explore: 'ORCA का अन्वेषण करें',

        // Multi-Agent Reasoning Section (Hindi)
        landing_reasoning_eyebrow: 'मल्टी-एजेंट रीजनिंग',
        landing_reasoning_title: 'ORCA कैसे प्रश्नों को इंटेलिजेंस में बदलता है',
        landing_reasoning_sub: 'छह चरण जो प्रत्येक उत्तर को प्रमाणित समुद्र विज्ञान पर आधारित करते हैं।',
        landing_wf_01_name: 'पूछें (ASK)',
        landing_wf_01_desc: 'प्राकृतिक भाषा में समुद्री प्रश्न पूछें।',
        landing_wf_02_name: 'योजना (PLAN)',
        landing_wf_02_desc: 'इरादे को समझें और कार्य को विभाजित करें।',
        landing_wf_03_name: 'खोजें (DISCOVER)',
        landing_wf_03_desc: 'प्रासंगिक डेटा स्रोतों और टूल्स का चयन करें।',
        landing_wf_04_name: 'विश्लेषण (ANALYZE)',
        landing_wf_04_desc: 'विशेषज्ञ एजेंट आवश्यक समुद्री जानकारी का विश्लेषण करते हैं।',
        landing_wf_05_name: 'सत्यापन (VALIDATE)',
        landing_wf_05_desc: 'मल्टी-एजेंट साक्ष्यों की तुलना और सत्यापन किया जाता है।',
        landing_wf_06_name: 'व्याख्या (EXPLAIN)',
        landing_wf_06_desc: 'स्पष्ट साक्ष्य-आधारित उत्तर तैयार करें।',

        // Scientific Foundation Section (Hindi)
        landing_science_eyebrow: 'पृथ्वी अवलोकन एवं समुद्र विज्ञान',
        landing_science_title: 'समुद्री विज्ञान एवं उपग्रह अवलोकन पर आधारित',
        landing_science_sub: 'ORCA को संचालित करने वाले वास्तविक स्रोत, परिचालन डेटासेट और मॉडल।',

        // Mission Access Modal (Hindi)
        modal_clearance_title: 'ORCA मिशन क्लीयरेंस',
        modal_clearance_sub: 'समुद्री इंटेलिजेंस एक्सेस और ऑपरेशनल स्टेशन गेटवे',
        tab_commission_station: 'खाता बनाएं',
        tab_officer_signin: 'साइन इन करें',
        lbl_login_callsign: 'समुद्री ईमेल / स्टेशन कॉल साइन',
        lbl_login_key: 'सुरक्षा पासवर्ड / एक्सेस पास',
        btn_login_submit: 'साइन इन करें एवं कंसोल शुरू करें',
        lbl_signup_name: 'पूरा नाम / अधिकारी कॉल साइन',
        lbl_signup_email: 'समुद्री ईमेल / रेडियो डिस्पैच',
        lbl_signup_pw: 'सुरक्षा पासवर्ड (केवल अक्षर: A-Z, a-z)',
        btn_signup_submit: 'खाता बनाएं एवं कंसोल शुरू करें'
      },

      ta: {
        // Branding & Sidebar
        brand_title: 'ORCA',
        brand_subtitle: 'கடல்சார் நுண்ணறிவு',
        sys_status_online: 'கணினி நிலை: ஆன்லைன்',
        sys_depth_io: 'ஆழம்: 4,812 மீ · இந்தியப் பெருங்கடல்',
        nav_section_title: 'பயண வழிசெலுத்தல்',
        tab_ask_orca: 'ORCA விடம் கேளுங்கள்',
        tab_command: 'கட்டளை மையம்',
        tab_pfz: 'மீன்பிடி மண்டலங்கள்',
        tab_disasters: 'பேரிடர் எச்சரிக்கை',
        tab_satellite: 'செயற்கைக்கோள் ஆய்வகம்',
        tab_routes: 'பாதுகாப்பான பாதைகள்',
        tab_historical: '7-நாள் வரலாற்று போக்கு',
        tab_simulator: 'சிமுலேட்டர்',
        sidebar_agents_title: 'ORCA முகவர்கள்',
        sidebar_agents_sub: '7 செயலில் உள்ள முகவர்கள் · இந்தியப் பெருங்கடல்',
        sidebar_orbit_sync: 'சுற்றுப்பாதை: சென்டினல்-1/3',

        // Map HUD Controls & Layers
        hud_locate: 'அமைவிடம்',
        hud_satellite: 'செயற்கைக்கோள்',
        hud_streetview: 'தெருக் காட்சி',
        hud_layers: 'அடுக்குகள்',
        hud_basin_live: 'இந்தியப் பெருங்கடல் (நேரலை)',
        sec_tag: 'மண்டலங்கள்',
        sec_all: 'முழு படுகை',
        sec_arabian_sea: 'அரபிக் கடல்',
        sec_bay_of_bengal: 'வங்காள விரிகுடா',
        sec_lakshadweep_sea: 'லட்சத்தீவு கடல்',
        sec_andaman_sea: 'அந்தமான் கடல்',
        sec_gulf_of_mannar: 'மன்னார் வளைகுடா',
        sec_gulf_of_sri_lanka: 'பாக் நீரிணை',
        sec_indian_ocean: 'பூமத்திய ரேகை இந்தியப் பெருங்கடல்',
        layers_header: 'புவிசார் அடுக்குகள்',
        layer_labels: 'செயற்கைக்கோள் லேபிள்கள் & எல்லைகள்',
        layer_streetview: 'தெருக் காட்சி கவரேஜ்',
        layer_basins: 'பெருங்கடல் படுகைகள் & மண்டலங்கள்',
        layer_pfz: 'சாத்தியமான மீன்பிடி மண்டலங்கள் (PFZ)',
        layer_restricted: 'தடைசெய்யப்பட்ட கடல் மண்டலங்கள்',
        layer_hazards: 'கடல் ஆபத்து எச்சரிக்கைகள்',
        layer_vessels: 'AIS கப்பல்கள்',
        layer_eez: 'இந்திய EEZ எல்லை',

        // AI Chat (Ask ORCA)
        chat_new_query: '+ புதிய வினவல்',
        chat_recent_queries: 'சமீபத்திய வினவல்கள்',
        hero_title: 'ORCA விடம் கேளுங்கள்',
        hero_subtitle: 'கடல்சார் நுண்ணறிவு AI உதவியாளர்',
        hero_description: 'கடல், கடல் நிலைமைகள், மீன்பிடி மண்டலங்கள், வானிலை, பாதுகாப்பு, வழிகள், பேரிடர்கள், செயற்கைக்கோள் அவதானிப்புகள் அல்லது கடலோர நிலைமைகள் பற்றி எதையும் கேளுங்கள்.',
        placeholder_hero: 'தமிழில் ORCA விடம் கேளுங்கள் (எ.கா: நாளை மீன்பிடிக்க செல்வது பாதுகாப்பானதா?)...',
        placeholder_bottom: 'தமிழ், ஆங்கிலம், கன்னடம் அல்லது இந்தியில் கேளுங்கள்...',
        btn_hero_ask: 'ORCA விடம் கேளுங்கள்',
        hero_suggested_label: 'பரிந்துரைக்கப்பட்ட கேள்விகள்',
        btn_send: 'அனுப்பு',
        btn_listen: '🔊 கேளுங்கள்',
        btn_pause: '⏸ நிறுத்து',
        btn_provenance: '🔬 ஆதார விவரம்',
        ai_modal_title: 'ORCA நுண்ணறிவு இயந்திரம்',
        ai_modal_sub: 'உங்கள் கடல் வினவல் பகுப்பாய்வு செய்யப்படுகிறது...',
        modal_validation_title: 'ஆதார ஒருமைப்பாடு சரிபார்ப்பு',
        modal_risk_lbl: 'தொகுக்கப்பட்ட கடல் ஆபத்து',
        btn_view_answer: 'பதிலை காண்க',
        suggestions: [
          'நாளை மங்களூர் அருகே மீன்பிடிக்க செல்வது பாதுகாப்பானதா?',
          'இன்று சிறந்த மீன்பிடி மண்டலம் (PFZ) எங்கு உள்ளது?',
          'என் பகுதி அருகே புயல் அல்லது அதிக அலை எச்சரிக்கைகள் ஏதேனும் உள்ளதா?'
        ],

        // AI Chat Card Headings
        card_header_title: 'ORCA கடல்சார் நுண்ணறிவு அமைப்பு',
        direct_ans_label: 'நேரடி நுண்ணறிவு பதில்',
        score_label: 'மதிப்பெண்:',
        why_evidence_title: 'முக்கிய ஆதாரங்கள் மற்றும் கண்டுபிடிப்புகள்',
        evidence_specialists_title: 'நிபுணர் முகவர்களிடமிருந்து சான்றுகள்',
        sensor_fusion_conf: 'பல முகவர் உணரிகளின் ஒருங்கிணைப்பு · நம்பகத்தன்மை:',
        op_recommendation_title: 'செயல்பாட்டு பரிந்துரை மற்றும் ஆலோசனை',
        tech_evidence_title: 'தொழில்நுட்ப சான்றுகள் (ஆராய்ச்சியாளர்களுக்காக)',
        provenance_btn_text: 'முழு அறிவியல் ஆதார அட்டவணையை காண்க',

        // PFZ View
        pfz_badge: 'செயற்கைக்கோள் வழிபெறப்பட்டது · INCOIS முறை',
        pfz_title: 'சாத்தியமான மீன்பிடி மண்டலங்கள் (இந்திய கடற்பரப்பு & EEZ)',
        pfz_subtitle: 'பல காரணி விளக்கக்கூடிய PFZ நுண்ணறிவு · குளோரோபில்-ஏ & SST வெப்ப முனைகள்',
        filter_all: 'அனைத்தும்',
        filter_best: 'சிறந்த ஒட்டுமொத்த',
        filter_nearest: 'மிக அருகில்',
        filter_safest: 'மிகவும் பாதுகாப்பானது',
        filter_potential: 'அதிகபட்ச பிடிப்பு',
        btn_view_on_map: 'வரைபடத்தில் காண்க',
        pfz_lbl_operational_zones: 'செயல்பாட்டு மண்டலங்கள்',
        pfz_lbl_active_sectors: '8 செயலில் உள்ள மண்டலங்கள்',
        pfz_lbl_eo_sensors: 'EO உணரிகள்',
        pfz_lbl_active_sort: 'செயலில் உள்ள வடிகட்டி',
        pfz_lbl_coastal_origin: 'கடலோர குறிப்பு மையம்',
        card_potential: 'சாத்தியம்',
        card_safety: 'பாதுகாப்பு',
        card_distance: 'தூரம்',
        card_depth: 'ஆழம்',
        card_target_species: 'இலக்கு இனங்கள்:',
        card_coordinates: 'ஆயத்தொலைவுகள்:',
        card_btn_plot: 'சரி, வரைபடத்தில் குறிக்கவும் →',
        rank_best_overall: 'சிறந்த ஒட்டுமொத்த',
        rank_nearest: 'மிக அருகில்',
        rank_safest: 'மிகவும் பாதுகாப்பானது',
        rank_highest_catch: 'அதிகபட்ச பிடிப்பு',
        rank_sector_of: 'மண்டலம்',

        // Disaster Watch
        disaster_badge: 'GDACS · USGS · INCOIS அதிகாரப்பூர்வ அறிவிப்புகள்',
        disaster_title: 'பேரிடர் கண்காணிப்பு & கடல் ஆபத்து கண்காணிப்பாளர்',
        disaster_subtitle: 'நேரலை உலகளாவிய மற்றும் பிராந்திய கடல்சார் நுண்ணறிவு · புயல்கள், புயல் அலைகள் மற்றும் நில அதிர்வு ஆலோசனைகள்',
        disaster_official_tag: 'அதிகாரப்பூர்வ அறிவிப்புகள் மட்டும்',
        disaster_meta_global_feeds: 'உலகளாவிய கண்காணிப்பு ஊட்டங்கள்',
        disaster_meta_gdacs_usgs: 'GDACS (UN/EC) & USGS நில அதிர்வு',
        disaster_meta_basin_threat: 'இந்தியப் பெருங்கடல் அச்சுறுத்தல்',
        disaster_meta_no_tsunami: 'சுனாமி எச்சரிக்கை எதுவும் இல்லை',
        disaster_meta_coastal_warning: 'கடலோர எச்சரிக்கை மண்டலங்கள்',
        disaster_meta_swell_surge: 'அலை எழுச்சி மற்றும் புயல் வானிலை',
        disaster_meta_data_honesty: 'தரவு நேர்மை நெறிமுறை',
        disaster_meta_direct_ingestion: 'நேரடி அதிகாரப்பூர்வ உள்ளீடு மட்டும்',
        disaster_action_lbl: 'பரிந்துரைக்கப்பட்ட கடல்சார் நடவடிக்கை:',
        disaster_notice_text: 'ORCA போலியான சுனாமி அல்லது பேரழிவுகளை சுயாதீனமாக உருவாக்காது. அனைத்து நில அதிர்வு மற்றும் சுனாமி அறிவிப்புகளும் அதிகாரப்பூர்வ சர்வதேச மற்றும் தேசிய சுனாமி எச்சரிக்கை மையங்களிலிருந்து (IOTWMS / INCOIS / USGS / GDACS) நேரடியாக பெறப்படுகின்றன.',

        // Satellite Lab
        sat_badge: 'கோப்பர்நிக்கஸ் & இஸ்ரோ EO செயற்கைக்கோள் ஆய்வகம்',
        sat_title: 'செயற்கைக்கோள் நுண்ணறிவு ஆய்வகம்',
        sat_subtitle: 'மல்டிஸ்பெக்ட்ரல் பூமி கண்காணிப்பு · சென்டினல்-1 SAR, சென்டினல்-2 ஆப்டிகல் & சென்டினல்-3 OLCI/SLSTR',
        sat_sector_label: 'மண்டலம்:',
        sat_band_sst: 'SST முரண்பாடு',
        sat_band_chl: 'குளோரோபில்-ஏ',
        sat_band_flood: 'SAR வெள்ள ரேடார்',
        sat_band_optical: 'உண்மையான வண்ண ஆப்டிகல்',
        sat_btn_plot: 'வரைபடத்தில் குறிக்கவும்',
        sat_pre_event: 'நிகழ்வுக்கு முந்தைய அடிப்படை (04:00 UTC)',
        sat_post_event: 'நேரலை சுற்றுப்பாதை பாஸ் (10:45 UTC)',
        sat_cursor_sounding: 'கர்சர் ஒலித்தல்: டெலிமெட்ரியை ஆய்வு செய்ய செயற்கைக்கோள் பரப்பில் கர்சரை நகர்த்தவும்',
        sat_legend_sst: 'SST வெப்ப சாய்வு (°C)',
        sat_legend_chl: 'குளோரோபில் செறிவு (mg/m³)',
        sat_legend_flood: 'SAR வெள்ள ரேடார் பரவல்',
        sat_legend_optical: 'மல்டிஸ்பெக்ட்ரல் பிரதிபலிப்பு',

        // Safe Routes
        route_title: 'பாதுகாப்பான பாதை பரிந்துரை',
        route_subtitle: 'பாத்திமெட்ரிக் ஃபேர்வே வழித்தடம் & சரணாலய அனுமதி',
        route_origin_label: 'புறப்படும் துறைமுகம்',
        route_dest_label: 'சேருமிடம் / மீன்பிடி மண்டலம்',
        route_btn_calc: 'பாதுகாப்பான பாதையை கணக்கிடுங்கள்',
        route_passage_cleared: 'பாதை அனுமதிக்கப்பட்டது',
        route_distance: 'தூரம்:',
        route_nautical: 'கடல் மைல்:',
        route_transit: 'மதிப்பிடப்பட்ட நேரம்:',
        route_safety_check: 'பாதுகாப்பு சோதனை & ஜியோஃபென்சிங்:',
        route_clear_text: '✓ கடல் சரணாலயங்கள் மற்றும் இராணுவ மண்டலங்கள் இல்லாத பாதுகாப்பான பாதை',
        route_recenter_btn: 'பாதை கண்ணோட்டத்தை மீட்டமைக்கவும்',

        // Historical Trends
        hist_title: '7-நாள் வரலாற்று போக்கு பகுப்பாய்வு',
        hist_sub: 'ஓபன்-மீட்டியோ கடல்சார் காப்பகம் மற்றும் வானிலை கண்காணிப்பு',
        hist_station_label: 'கண்காணிப்பு மிதவை / காலநிலை மண்டலம்',
        hist_mean_swell: '7-நாள் சராசரி அலை:',
        hist_peak_wave: 'அதிகபட்ச அலை உயரம்:',
        hist_mean_sst: 'சராசரி கடல் வெப்பநிலை:',
        hist_wave_chart_title: 'அலை உயரம் மற்றும் அசைவு இயக்கவியல் (கடந்த 7 நாட்கள்)',
        hist_sst_chart_title: 'கடல் மேற்பரப்பு வெப்பநிலை (SST °C) போக்கு',
        tag_historical_archive: 'வரலாற்று காப்பகம்',
        tag_thermal_memory: 'வெப்ப நினைவகம்',

        // What-If Simulator
        sim_badge: 'முடிவு நுண்ணறிவு · பல சூழல் திட்டமிடல்',
        sim_title: 'புறப்படும் நேர சிமுலேட்டர்',
        sim_sub: 'பல பரிமாண ஆபத்து ரேடார் மற்றும் மணிநேர முன்னறிவிப்பு பகுப்பாய்வு',
        sim_sector_label: 'மண்டலம்:',
        sim_scenario_a: 'சூழல் A:',
        sim_scenario_b: 'சூழல் B:',
        sim_rec_headline: 'AI கடல்சார் அனுப்புதல் பரிந்துரை',
        sim_badge_a: 'சூழல் A',
        sim_badge_b: 'சூழல் B',
        sim_departure: 'புறப்படும் நேரம்:',
        sim_risk_score: 'ஆபத்து மதிப்பெண்:',
        sim_wave_swell: 'அலை வீச்சு:',
        sim_wave_period: 'அலை காலம்:',
        sim_surface_wind: 'மேற்பரப்பு காற்று:',
        sim_wind_gusts: 'காற்று வீச்சு:',
        sim_catch_potential: 'பிடிப்பு சாத்தியம்:',
        sim_fuel_eff: 'எரிபொருள் திறன்:',
        sim_radar_title: 'பல பரிமாண கடல்சார் ரேடார்',
        sim_radar_sub: 'தரப்படுத்தப்பட்ட அளவீடுகள் (0 - 100)',
        sim_param_col: 'அளவுரு',
        sim_variance_col: 'மாறுபாடு / நன்மை',
        sim_status_low: 'குறைந்த ஆபத்து (சாதகமானது)',
        sim_status_mod: 'மிதமான ஆபத்து (எச்சரிக்கை)',
        sim_status_high: 'அதிக ஆபத்து (ஆபத்தானது)',

        // Landing Page Hero & Sections (Tamil)
        landing_brand_sub: 'கடல் நுண்ணறிவு',
        landing_hero_eyebrow: 'AI-இயங்கும் கடல் நுண்ணறிவு',
        landing_hero_headline: 'கடல் தரவுகளிலிருந்து<br>செயல்படக்கூடிய நுண்ணறிவுக்கு.',
        landing_hero_subtext: 'இயற்கை மொழியில் சிக்கலான கடல் கேள்விகளைக் கேளுங்கள். ஆதாரங்களைக் கண்டறிந்து, கடல் நிலைமைகளை பகுப்பாய்வு செய்து தகவலறிந்த முடிவுகளை எடுங்கள்.',
        landing_cta_generate: 'பகுப்பாய்வை உருவாக்குங்கள்',
        landing_cta_explore: 'ORCA ஐ ஆராயுங்கள்',

        // Multi-Agent Reasoning Section (Tamil)
        landing_reasoning_eyebrow: 'மல்டி-ஏஜென்ட் பகுத்தறிவு',
        landing_reasoning_title: 'ORCA எவ்வாறு கேள்விகளை நுண்ணறிவாக மாற்றுகிறது',
        landing_reasoning_sub: 'ஒவ்வொரு பதிலையும் சரிபார்க்கக்கூடிய கடல் அறிவியலில் நிலைநிறுத்தும் ஆறு நிலைகள்.',
        landing_wf_01_name: 'கேளுங்கள் (ASK)',
        landing_wf_01_desc: 'இயற்கை மொழியில் கடல் கேள்வியைக் கேளுங்கள்.',
        landing_wf_02_name: 'திட்டமிடுங்கள் (PLAN)',
        landing_wf_02_desc: 'நோக்கத்தைப் புரிந்து பணியைப் பிரிக்கவும்.',
        landing_wf_03_name: 'கண்டறியுங்கள் (DISCOVER)',
        landing_wf_03_desc: 'பொருத்தமான தரவு மூலங்கள் மற்றும் கருவிகளைத் தேர்ந்தெடுக்கவும்.',
        landing_wf_04_name: 'பகுப்பாய்வு (ANALYZE)',
        landing_wf_04_desc: 'சிறப்பு முகவர்கள் தேவையான கடல் தகவல்களைப் பகுப்பாய்வு செய்கின்றன.',
        landing_wf_05_name: 'சரிபார்க்கவும் (VALIDATE)',
        landing_wf_05_desc: 'பல முகவர் ஆதாரங்கள் ஒப்பிடப்பட்டு சரிபார்க்கப்படுகின்றன.',
        landing_wf_06_name: 'விளக்குங்கள் (EXPLAIN)',
        landing_wf_06_desc: 'தெளிவான சான்றுகள் சார்ந்த பதிலை உருவாக்கவும்.',

        // Scientific Foundation Section (Tamil)
        landing_science_eyebrow: 'புவி கண்காணிப்பு மற்றும் கடல் அறிவியல்',
        landing_science_title: 'கடல் அறிவியல் மற்றும் பூமி கண்காணிப்பில் கட்டமைக்கப்பட்டது',
        landing_science_sub: 'ORCA-வை இயக்கும் உண்மையான ஆதாரங்கள், செயல்பாட்டு தரவுத்தொகுப்புகள் மற்றும் மாதிரிகள்.',

        // Mission Access Modal (Tamil)
        modal_clearance_title: 'ORCA பணி அனுமதி',
        modal_clearance_sub: 'கடல் நுண்ணறிவு அணுகல் மற்றும் செயல்பாட்டு நிலைய நுழைவாயில்',
        tab_commission_station: 'கணக்கை உருவாக்கவும்',
        tab_officer_signin: 'உள்நுழைக',
        lbl_login_callsign: 'கடல்சார் மின்னஞ்சல் / நிலைய அழைப்பு குறியீடு',
        lbl_login_key: 'பாதுகாப்பு கடவுச்சொல் / அணுகல் சாவி',
        btn_login_submit: 'உள்நுழைந்து கன்சோலைத் தொடங்கவும்',
        lbl_signup_name: 'முழு பெயர் / அதிகாரி அழைப்பு குறியீடு',
        lbl_signup_email: 'கடல்சார் மின்னஞ்சல் / வானொலி தொடர்பு',
        lbl_signup_pw: 'பாதுகாப்பு கடவுச்சொல் (எழுத்துக்கள் மட்டும்: A-Z, a-z)',
        btn_signup_submit: 'கணக்கை உருவாக்கி கன்சோலைத் தொடங்கவும்'
      }
    };

    this.agentNames = {
      en: {
        "Ocean Agent": "Ocean Agent",
        "Weather Agent": "Weather Agent",
        "Risk Agent": "Risk Agent",
        "PFZ Agent": "PFZ Agent",
        "Satellite Agent": "Satellite Agent",
        "Disaster Agent": "Disaster Agent",
        "Geospatial Agent": "Geospatial Agent",
        "Geofencing Agent": "Geofencing Agent",
        "Route Optimization Agent": "Route Optimization Agent",
        "Historical Agent": "Historical Agent",
        "What-If Agent": "What-If Agent",
        "Evidence Validation Agent": "Evidence Validation Agent",
        "Planner Agent": "Planner Agent",
        "ORCA Synthesis Agent": "ORCA Synthesis Agent"
      },
      kn: {
        "Ocean Agent": "ಸಾಗರ ಏಜೆಂಟ್",
        "Weather Agent": "ಹವಾಮಾನ ಏಜೆಂಟ್",
        "Risk Agent": "ಅಪಾಯ ವಿಶ್ಲೇಷಣಾ ಏಜೆಂಟ್",
        "PFZ Agent": "ಮೀನುಗಾರಿಕಾ ಏಜೆಂಟ್ (PFZ)",
        "Satellite Agent": "ಉಪಗ್ರಹ ಏಜೆಂಟ್",
        "Disaster Agent": "ವಿಪತ್ತು ಎಚ್ಚರಿಕೆ ಏಜೆಂಟ್",
        "Geospatial Agent": "ಭೌಗೋಳಿಕ ಏಜೆಂಟ್",
        "Geofencing Agent": "ಗಡಿ ಭದ್ರತಾ ಏಜೆಂಟ್",
        "Route Optimization Agent": "ಮಾರ್ಗ ಆಪ್ಟಿಮೈಸೇಶನ್ ಏಜೆಂಟ್",
        "Historical Agent": "ಐತಿಹಾಸಿಕ ಏಜೆಂಟ್",
        "What-If Agent": "ಸಿಮ್ಯುಲೇಶನ್ ಏಜೆಂಟ್",
        "Evidence Validation Agent": "ಸಾಕ್ಷ್ಯ ಪರಿಶೀಲನಾ ಏಜೆಂಟ್",
        "Planner Agent": "ಪ್ಲಾನರ್ ಏಜೆಂಟ್",
        "ORCA Synthesis Agent": "ORCA ಸಂಶ್ಲೇಷಣಾ ಏಜೆಂಟ್"
      },
      hi: {
        "Ocean Agent": "महासागर एजेंट",
        "Weather Agent": "मौसम एजेंट",
        "Risk Agent": "जोखिम मूल्यांकन एजेंट",
        "PFZ Agent": "मत्स्य क्षेत्र एजेंट (PFZ)",
        "Satellite Agent": "उपग्रह अवलोकन एजेंट",
        "Disaster Agent": "आपदा निगरानी एजेंट",
        "Geospatial Agent": "भू-स्थानिक एजेंट",
        "Geofencing Agent": "सीमा सुरक्षा एजेंट",
        "Route Optimization Agent": "मार्ग अनुकूलन एजेंट",
        "Historical Agent": "ऐतिहासिक रुझान एजेंट",
        "What-If Agent": "सिमुलेशन एजेंट",
        "Evidence Validation Agent": "साक्ष्य सत्यापन एजेंट",
        "Planner Agent": "योजनाकार एजेंट",
        "ORCA Synthesis Agent": "ORCA संश्लेषण एजेंट"
      },
      ta: {
        "Ocean Agent": "பெருங்கடல் முகவர்",
        "Weather Agent": "வானிலை முகவர்",
        "Risk Agent": "ஆபத்து மதிப்பீட்டு முகவர்",
        "PFZ Agent": "மீன்பிடி மண்டல முகவர் (PFZ)",
        "Satellite Agent": "செயற்கைக்கோள் முகவர்",
        "Disaster Agent": "பேரிடர் கண்காணிப்பு முகவர்",
        "Geospatial Agent": "புவிசார் முகவர்",
        "Geofencing Agent": "எல்லை பாதுகாப்பு முகவர்",
        "Route Optimization Agent": "பாதை தேர்வு முகவர்",
        "Historical Agent": "வரலாற்று போக்கு முகவர்",
        "What-If Agent": "சிமுலேஷன் முகவர்",
        "Evidence Validation Agent": "ஆதார சரிபார்ப்பு முகவர்",
        "Planner Agent": "திட்டமிடல் முகவர்",
        "ORCA Synthesis Agent": "ORCA தொகுப்பு முகவர்"
      }
    };

    this.metricKeys = {
      en: {
        "Wave Height": "Wave Height",
        "Wave Period": "Wave Period",
        "SST": "SST Temp",
        "Current": "Ocean Current",
        "Wind Speed": "Wind Speed",
        "Wind Gusts": "Wind Gusts",
        "Condition": "Condition",
        "Pressure": "Pressure",
        "Risk Score": "Risk Score",
        "Risk Level": "Risk Level",
        "Primary Driver": "Primary Driver",
        "Top Zone": "Top Fishing Zone",
        "Potential": "Catch Potential",
        "Distance": "Distance",
        "Target Species": "Target Species",
        "Chlorophyll-a": "Chlorophyll-a",
        "SAR Radar": "SAR Radar Status",
        "Cyclone Status": "Cyclone Threat",
        "Tsunami Status": "Tsunami Status",
        "Active Bulletins": "Active Bulletins",
        "Completeness": "Completeness",
        "Validated Items": "Validated Items",
        "Conflicts": "Data Conflicts",
        "Coordinates": "Coordinates",
        "Bathymetry": "Bathymetry",
        "Fairway": "Fairway Clearance",
        "Geofence Status": "Geofence Status",
        "Restricted MPAs": "Restricted MPAs",
        "Transit Time": "Transit Time",
        "Waypoints": "Waypoints"
      },
      kn: {
        "Wave Height": "ಅಲೆಯ ಎತ್ತರ",
        "Wave Period": "ಅಲೆಯ ಅವಧಿ",
        "SST": "SST ತಾಪಮಾನ",
        "Current": "ಸಮುದ್ರ ಪ್ರವಾಹ",
        "Wind Speed": "ಗಾಳಿಯ ವೇಗ",
        "Wind Gusts": "ಬಿರುಗಾಳಿ ವೇಗ",
        "Condition": "ಹವಾಮಾನ ಸ್ಥಿತಿ",
        "Pressure": "ವಾತಾವರಣ ಒತ್ತಡ",
        "Risk Score": "ಅಪಾಯ ಸ್ಕೋರ್",
        "Risk Level": "ಅಪಾಯ ಮಟ್ಟ",
        "Primary Driver": "ಮುಖ್ಯ ಅಂಶ",
        "Top Zone": "ಅತ್ಯುತ್ತಮ ವಲಯ",
        "Potential": "ಕ್ಯಾಚ್ ಸಾಮರ್ಥ್ಯ",
        "Distance": "ದೂರ",
        "Target Species": "ಗುರಿ ಪ್ರಭೇದಗಳು",
        "Chlorophyll-a": "ಕ್ಲೋರೊಫಿಲ್-ಎ",
        "SAR Radar": "SAR ರೇಡಾರ್ ಸ್ಥಿತಿ",
        "Cyclone Status": "ಚಂಡಮಾರುತ ಬೆದರಿಕೆ",
        "Tsunami Status": "ಸುನಾಮಿ ಸ್ಥಿತಿ",
        "Active Bulletins": "ಸಕ್ರಿಯ ಬುಲೆಟಿನ್‌ಗಳು",
        "Completeness": "ಸಂಪೂರ್ಣತೆ",
        "Validated Items": "ಪರಿಶೀಲಿಸಿದ ಅಂಶಗಳು",
        "Conflicts": "ಡೇಟಾ ಸಂಘರ್ಷಗಳು",
        "Coordinates": "ನಿರ್ದೇಶಾಂಕಗಳು",
        "Bathymetry": "ಆಳ / ಬಾತಿಮೆಟ್ರಿ",
        "Fairway": "ಮಾರ್ಗ ಕ್ಲಿಯರೆನ್ಸ್",
        "Geofence Status": "ಗಡಿ ಸ್ಥಿತಿ",
        "Restricted MPAs": "ನಿರ್ಬಂಧಿತ ವಲಯಗಳು",
        "Transit Time": "ಪ್ರಯಾಣ ಸಮಯ",
        "Waypoints": "ವೇ ಪಾಯಿಂಟ್‌ಗಳು"
      },
      hi: {
        "Wave Height": "लहर ऊंचाई",
        "Wave Period": "लहर अवधि",
        "SST": "SST तापमान",
        "Current": "समुद्री धारा",
        "Wind Speed": "हवा की गति",
        "Wind Gusts": "हवा के झोंके",
        "Condition": "मौसम स्थिति",
        "Pressure": "वायुमंडलीय दबाव",
        "Risk Score": "जोखिम स्कोर",
        "Risk Level": "जोखिम स्तर",
        "Primary Driver": "मुख्य कारक",
        "Top Zone": "प्रमुख मत्स्य क्षेत्र",
        "Potential": "उत्पादकता संभावना",
        "Distance": "दूरी",
        "Target Species": "लक्षित प्रजातियां",
        "Chlorophyll-a": "क्लोरोफिल-ए",
        "SAR Radar": "SAR रडार स्थिति",
        "Cyclone Status": "चक्रवात खतरा",
        "Tsunami Status": "सुनामी स्थिति",
        "Active Bulletins": "सक्रिय बुलेटिन",
        "Completeness": "पूर्णता",
        "Validated Items": "सत्यापित वस्तुएं",
        "Conflicts": "डेटा विरोधाभास",
        "Coordinates": "निर्देशांक",
        "Bathymetry": "गहराई / बैथिमेट्री",
        "Fairway": "जलमार्ग निकासी",
        "Geofence Status": "सीमा स्थिति",
        "Restricted MPAs": "प्रतिबंधित क्षेत्र",
        "Transit Time": "यात्रा समय",
        "Waypoints": "मार्ग बिंदु"
      },
      ta: {
        "Wave Height": "அலை உயரம்",
        "Wave Period": "அலைக்காலம்",
        "SST": "கடல் வெப்பநிலை (SST)",
        "Current": "கடல் நீரோட்டம்",
        "Wind Speed": "காற்றின் வேகம்",
        "Wind Gusts": "காற்று வீச்சு",
        "Condition": "வானிலை நிலை",
        "Pressure": "வளிமண்டல அழுத்தம்",
        "Risk Score": "ஆபத்து மதிப்பெண்",
        "Risk Level": "ஆபத்து நிலை",
        "Primary Driver": "முதன்மை காரணி",
        "Top Zone": "சிறந்த மீன்பிடி மண்டலம்",
        "Potential": "பிடிப்பு சாத்தியம்",
        "Distance": "தூரம்",
        "Target Species": "இலக்கு இனங்கள்",
        "Chlorophyll-a": "குளோரோபில்-ஏ",
        "SAR Radar": "SAR ரேடார் நிலை",
        "Cyclone Status": "புயல் அச்சுறுத்தல்",
        "Tsunami Status": "சுனாமி நிலை",
        "Active Bulletins": "செயலில் உள்ள அறிக்கைகள்",
        "Completeness": "முழுமை",
        "Validated Items": "சரிபார்க்கப்பட்ட உருப்படிகள்",
        "Conflicts": "தரவு முரண்பாடுகள்",
        "Coordinates": "ஆயத்தொலைவுகள்",
        "Bathymetry": "ஆழம் / பாத்திமெட்ரி",
        "Fairway": "பாதை அனுமதி",
        "Geofence Status": "எல்லை நிலை",
        "Restricted MPAs": "தடைசெய்யப்பட்ட மண்டலங்கள்",
        "Transit Time": "பயண நேரம்",
        "Waypoints": "வழிப்பாயிண்டுகள்"
      }
    };
  }

  t(key) {
    const dict = this.translations[this.currentLang] || this.translations.en;
    return dict[key] || this.translations.en[key] || key;
  }

  tAgent(agentName) {
    const map = this.agentNames[this.currentLang] || this.agentNames.en;
    return map[agentName] || this.agentNames.en[agentName] || agentName;
  }

  tMetric(metricKey) {
    const map = this.metricKeys[this.currentLang] || this.metricKeys.en;
    return map[metricKey] || this.metricKeys.en[metricKey] || metricKey;
  }

  setLanguage(lang) {
    if (!['en', 'kn', 'hi', 'ta'].includes(lang)) return;
    this.currentLang = lang;
    localStorage.setItem('orca_language', lang);
    this.applyTranslations();
  }

  applyTranslations() {
    const dict = this.translations[this.currentLang] || this.translations.en;

    // 1. Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        if (dict[key].includes('<')) {
          el.innerHTML = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // 2. Update active pill across all language selectors (top nav & sidebar)
    document.querySelectorAll('.lang-pill-btn').forEach(btn => {
      if (btn.dataset.lang === this.currentLang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 3. Update AI Assistant inputs & suggestions
    if (window.orcaAIAssistant) {
      window.orcaAIAssistant.currentLanguage = this.currentLang;
      const heroInput = document.getElementById('ask-orca-hero-input');
      const bottomInput = document.getElementById('ask-orca-bottom-input');
      if (heroInput) heroInput.placeholder = dict.placeholder_hero;
      if (bottomInput) bottomInput.placeholder = dict.placeholder_bottom;

      // Update hero quick suggestions
      const suggestionBtns = document.querySelectorAll('.hero-suggestion-btn');
      if (suggestionBtns.length && dict.suggestions) {
        suggestionBtns.forEach((btn, idx) => {
          if (dict.suggestions[idx]) {
            const span = btn.querySelector('span');
            if (span) span.textContent = dict.suggestions[idx];
            btn.dataset.query = dict.suggestions[idx];
          }
        });
      }
    }

    // 4. Update Sector pills text
    const regionKeyMap = {
      'all': 'sec_all',
      'arabian_sea': 'sec_arabian_sea',
      'bay_of_bengal': 'sec_bay_of_bengal',
      'lakshadweep_sea': 'sec_lakshadweep_sea',
      'andaman_sea': 'sec_andaman_sea',
      'gulf_of_mannar': 'sec_gulf_of_mannar',
      'gulf_of_sri_lanka': 'sec_gulf_of_sri_lanka',
      'indian_ocean': 'sec_indian_ocean'
    };
    document.querySelectorAll('.region-selector-pill').forEach(pill => {
      const rKey = pill.dataset.region;
      if (rKey && regionKeyMap[rKey] && dict[regionKeyMap[rKey]]) {
        pill.textContent = dict[regionKeyMap[rKey]];
      }
    });

    // 5. Trigger dynamic re-renders across all active components
    if (window.orcaApp) {
      if (typeof window.orcaApp.renderPFZTable === 'function') {
        window.orcaApp.renderPFZTable();
      }
      if (typeof window.orcaApp.loadDisasterData === 'function') {
        window.orcaApp.loadDisasterData();
      }
      if (window.orcaApp.simulator && typeof window.orcaApp.simulator.runSimulation === 'function') {
        window.orcaApp.simulator.runSimulation();
      }
      if (window.orcaApp.lastCalculatedRoute && typeof window.orcaApp.displayRouteResults === 'function') {
        window.orcaApp.displayRouteResults(window.orcaApp.lastCalculatedRoute);
      }
    }

    if (window.lucide) {
      lucide.createIcons();
    }

    // Dispatch global event
    window.dispatchEvent(new CustomEvent('orca:languageChanged', { detail: { lang: this.currentLang } }));
  }

  init() {
    this.applyTranslations();

    // Bind sidebar language buttons
    document.querySelectorAll('.lang-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetLang = btn.dataset.lang;
        if (targetLang) {
          this.setLanguage(targetLang);
        }
      });
    });
  }
}

window.orcaI18n = new OrcaI18n();
