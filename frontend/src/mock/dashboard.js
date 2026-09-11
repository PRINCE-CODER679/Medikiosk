export const MOCK_DASHBOARD_STATS = {
  totalPatients: 248,
  totalPatientsTrend: "+12.4%",
  encountersToday: 126,
  encountersTrend: "+8.2%",
  redFlagsCount: 8,
  redFlagsUrgent: 3,
  redFlagsModerate: 5,
  documentsProcessed: 394,
  documentsTrend: "+18.0%",
  systemStatus: {
    kioskConnected: true,
    kioskId: "Kiosk 04",
    apiHealth: "Operational",
    dbEngine: "SQLAlchemy Abstract",
    activeKiosks: 4,
    totalKiosks: 4
  },
  intakeActivityHourly: [
    { hour: "08:00", intakes: 12, alerts: 0 },
    { hour: "09:00", intakes: 24, alerts: 1 },
    { hour: "10:00", intakes: 38, alerts: 3 },
    { hour: "11:00", intakes: 29, alerts: 2 },
    { hour: "12:00", intakes: 15, alerts: 0 },
    { hour: "13:00", intakes: 8, alerts: 0 }
  ]
};
