export const MOCK_PATIENTS = [
  {
    id: "PAT-10928",
    name: "Ramesh Kumar",
    age: 56,
    gender: "Male",
    abhaId: "91-4829-1029-4810",
    phone: "+91 98765 43210",
    bloodGroup: "O+",
    lastVisit: "2026-08-28T09:30:00Z",
    status: "Active",
    complaint: "Persistent fever and frontal headache for 3 days",
    urgency: "Urgent",
    allergies: ["Penicillin", "Sulfa Drugs"],
    chronicConditions: ["Hypertension (Stage 1)", "Mild Asthma"],
    medications: [
      { name: "Amlodipine", dosage: "5mg", frequency: "Once daily" },
      { name: "Paracetamol", dosage: "650mg", frequency: "As needed for fever" }
    ],
    vitals: {
      temp: "101.4 °F",
      bp: "138/88 mmHg",
      spo2: "97%",
      pulse: "92 bpm"
    },
    aiSummary: "56yo Male with 3-day fever (101.4F) and frontal headache. History of Hypertension. Critical Flag: Penicillin allergy noted. Recommend CBC, Typhoid Panel, and vitals monitoring."
  },
  {
    id: "PAT-10929",
    name: "Priya Sharma",
    age: 34,
    gender: "Female",
    abhaId: "91-1029-4819-2049",
    phone: "+91 98123 45678",
    bloodGroup: "A+",
    lastVisit: "2026-08-27T14:15:00Z",
    status: "Active",
    complaint: "Acute abdominal pain (lower right quadrant)",
    urgency: "Urgent",
    allergies: ["NSAIDs"],
    chronicConditions: ["None"],
    medications: [],
    vitals: {
      temp: "99.2 °F",
      bp: "120/78 mmHg",
      spo2: "99%",
      pulse: "104 bpm"
    },
    aiSummary: "34yo Female presenting with right lower quadrant pain and tachycardia. Pain onset 8 hours ago. NSAID allergy. Triage alert: Rule out acute appendicitis."
  },
  {
    id: "PAT-10930",
    name: "Amit Patil",
    age: 48,
    gender: "Male",
    abhaId: "91-8492-3019-5820",
    phone: "+91 99887 76655",
    bloodGroup: "B+",
    lastVisit: "2026-08-25T11:00:00Z",
    status: "Follow-up",
    complaint: "Routine Type-2 Diabetes follow-up and prescription renewal",
    urgency: "Routine",
    allergies: ["None"],
    chronicConditions: ["Type 2 Diabetes Mellitus", "Dyslipidemia"],
    medications: [
      { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
      { name: "Atorvastatin", dosage: "10mg", frequency: "At bedtime" }
    ],
    vitals: {
      temp: "98.6 °F",
      bp: "126/82 mmHg",
      spo2: "98%",
      pulse: "74 bpm"
    },
    aiSummary: "48yo Male for routine diabetic checkup. Fasting Blood Glucose (142 mg/dL) elevated. Medication adherence reported 95%. No urgent red flags."
  },
  {
    id: "PAT-10931",
    name: "Neha Singh",
    age: 29,
    gender: "Female",
    abhaId: "91-3819-2049-5819",
    phone: "+91 97654 32109",
    bloodGroup: "AB+",
    lastVisit: "2026-08-20T16:00:00Z",
    status: "Completed",
    complaint: "Dry cough, sore throat, and mild nasal congestion",
    urgency: "Routine",
    allergies: ["Dust Mites"],
    chronicConditions: ["Seasonal Allergic Rhinitis"],
    medications: [
      { name: "Cetirizine", dosage: "10mg", frequency: "Once daily" }
    ],
    vitals: {
      temp: "98.4 °F",
      bp: "115/75 mmHg",
      spo2: "99%",
      pulse: "72 bpm"
    },
    aiSummary: "29yo Female with mild upper respiratory symptoms. Vitals stable. Symptomatic therapy prescribed and encounter marked completed."
  },
  {
    id: "PAT-10932",
    name: "Suresh Gupta",
    age: 62,
    gender: "Male",
    abhaId: "91-7482-9102-3948",
    phone: "+91 91234 56789",
    bloodGroup: "O-",
    lastVisit: "2026-08-29T08:10:00Z",
    status: "Active",
    complaint: "Chest tightness and shortness of breath upon walking",
    urgency: "Critical",
    allergies: ["Aspirin"],
    chronicConditions: ["CAD (Post-Stent)", "Hypertension"],
    medications: [
      { name: "Clopidogrel", dosage: "75mg", frequency: "Once daily" },
      { name: "Metoprolol", dosage: "25mg", frequency: "Twice daily" }
    ],
    vitals: {
      temp: "98.8 °F",
      bp: "154/96 mmHg",
      spo2: "94%",
      pulse: "108 bpm"
    },
    aiSummary: "62yo Male presenting with exertional chest tightness and SpO2 94%. High cardiac risk profile. CRITICAL RED FLAG ESCALATION: ECG and immediate physician consultation required."
  }
];
