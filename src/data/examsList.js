/**
 * Competitive / entrance / recruitment exams a student can pick as their target.
 * Grouped for <optgroup>. Values are stored as plain strings in Student.targetExam.
 */
export const EXAM_GROUPS = [
  {
    group: "Engineering & Architecture",
    exams: [
      "JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "SRMJEEE", "MHT CET", "WBJEE", "KCET", "KEAM",
      "TS EAMCET", "AP EAPCET", "COMEDK UGET", "GUJCET", "UPSEE / AKTU", "OJEE", "BCECE", "REAP", "TNEA",
      "JEECUP", "JKCET", "MET (Manipal)", "AEEE (Amrita)", "NATA", "JEE Main Paper 2 (B.Arch)", "UCEED", "CEED",
    ],
  },
  {
    group: "Medical & Allied Health",
    exams: [
      "NEET UG", "NEET PG", "NEET MDS", "AIIMS Nursing", "INI-CET", "FMGE", "NExT", "JIPMER",
      "AIAPGET", "BSc Nursing Entrance", "GPAT", "NIPER JEE",
    ],
  },
  {
    group: "Civil Services & State PSC",
    exams: [
      "UPSC Civil Services (CSE)", "UPSC CAPF", "UPSC ESE (Engineering Services)", "UPSC CMS", "UPSC IFS",
      "UPSC EPFO", "BPSC", "UPPSC", "MPPSC", "RPSC (RAS)", "MPSC", "GPSC", "KPSC (Karnataka)",
      "TNPSC", "WBPSC", "HPSC", "PPSC", "OPSC", "JPSC", "UKPSC", "APPSC", "TSPSC", "KPSC (Kerala)",
      "CGPSC", "Assam PSC", "HPPSC",
    ],
  },
  {
    group: "SSC & Central Government",
    exams: [
      "SSC CGL", "SSC CHSL", "SSC MTS", "SSC CPO", "SSC GD Constable", "SSC JE", "SSC Stenographer",
      "SSC Selection Post", "DSSSB", "EPFO", "FCI", "IB ACIO", "NIACL", "LIC AAO", "LIC ADO",
    ],
  },
  {
    group: "Banking & Insurance",
    exams: [
      "IBPS PO", "IBPS Clerk", "IBPS RRB PO", "IBPS RRB Clerk", "IBPS SO", "SBI PO", "SBI Clerk",
      "RBI Grade B", "RBI Assistant", "NABARD Grade A", "SEBI Grade A", "IDBI Executive", "IDBI Assistant",
      "NIACL Assistant", "UIIC", "Cooperative Bank Exams",
    ],
  },
  {
    group: "Railways",
    exams: [
      "RRB NTPC", "RRB Group D", "RRB ALP", "RRB JE", "RRB Technician", "RRB Section Controller",
      "RRB Paramedical", "RPF Constable", "RPF SI",
    ],
  },
  {
    group: "Defence & Police",
    exams: [
      "NDA", "CDS", "AFCAT", "Agniveer (Army)", "Agniveer (Navy)", "Agniveer (Air Force)", "INET",
      "Indian Coast Guard", "Territorial Army", "State Police Constable", "State Police SI",
      "Delhi Police", "UP Police", "Bihar Police", "Rajasthan Police", "MP Police", "Maharashtra Police",
    ],
  },
  {
    group: "Teaching & Education",
    exams: [
      "CTET", "UPTET", "REET", "HTET", "MAHA TET", "TNTET", "KTET", "Bihar TET", "KVS", "NVS",
      "DSSSB Teacher", "UGC NET", "CSIR NET", "SET", "B.Ed Entrance", "D.El.Ed Entrance",
    ],
  },
  {
    group: "University Entrance (UG/PG)",
    exams: [
      "CUET UG", "CUET PG", "GATE", "IIT JAM", "NEST", "ISI Admission Test", "IISER Aptitude Test",
      "TIFR GS", "JNU Entrance", "BHU UET", "AMU Entrance", "DU Entrance", "NPAT (NMIMS)", "IPMAT",
      "SET (Symbiosis)", "JMI Entrance", "Christ University Entrance",
    ],
  },
  {
    group: "Law",
    exams: ["CLAT UG", "CLAT PG", "AILET", "LSAT India", "MH CET Law", "SLAT", "AIBE", "Judicial Services"],
  },
  {
    group: "Management & Commerce",
    exams: [
      "CAT", "XAT", "MAT", "CMAT", "SNAP", "NMAT", "IIFT", "TISSNET", "MAH-CET (MBA)", "ATMA",
      "CA Foundation", "CA Intermediate", "CA Final", "CS Foundation", "CS Executive", "CMA Foundation",
      "CMA Intermediate",
    ],
  },
  {
    group: "Design, Hospitality & Others",
    exams: [
      "NCHM JEE", "NIFT Entrance", "NID DAT", "ICAR AIEEA", "Patwari", "Forest Guard",
      "Postal Assistant", "India Post GDS", "Anganwadi",
    ],
  },
];

/** Flat, de-duplicated, alphabetical list (handy for validation / search). */
export const ALL_EXAMS = [...new Set(EXAM_GROUPS.flatMap((g) => g.exams))].sort((a, b) =>
  a.localeCompare(b, "en")
);

/** Sentinel <option> value meaning "my choice isn't listed". */
export const OTHER_OPTION = "__other__";
