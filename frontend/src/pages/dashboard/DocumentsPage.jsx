import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Badge } from '../../components/ui/Card';
import { Table } from '../../components/ui/TableAndTabs';
import { Button } from '../../components/ui/Button';
import { FileSearch, Upload, CheckCircle2, FileText } from 'lucide-react';

export function DocumentsPage() {
  const sampleEntities = [
    { entity: 'Medicine', value: 'Amlodipine 5mg', source: 'Prescription Scan', confidence: '96%' },
    { entity: 'Diagnosis', value: 'Essential Hypertension', source: 'Discharge Summary', confidence: '95%' },
    { entity: 'Lab Test', value: 'CBC & Blood Sugar', source: 'Lab Report', confidence: '92%' },
    { entity: 'Allergy', value: 'Penicillin Anaphylaxis', source: 'Clinical Note Scan', confidence: '99%' }
  ];

  const columns = [
    { header: 'Extracted Entity', field: 'entity', accessor: (row) => <span className="font-bold text-slate-900 text-xs">{row.entity}</span> },
    { header: 'Clinical Value', field: 'value', accessor: (row) => <span className="font-mono text-xs font-semibold text-[#1E56A0]">{row.value}</span> },
    { header: 'Document Source', field: 'source', accessor: (row) => <span className="text-xs text-slate-600 font-medium">{row.source}</span> },
    { header: 'OCR Confidence', field: 'confidence', accessor: (row) => <Badge variant="success" size="sm">{row.confidence}</Badge> }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-[#1E56A0]" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Documents &amp; OCR Intelligence</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
            Scan prescriptions, lab reports, and discharge summaries into structured medical entities (Phase 7–9 Placeholder)
          </p>
        </div>

        <Button variant="primary" icon={Upload} onClick={() => alert('Phase 7 Feature: OCR scanning pipeline will be implemented in Phase 7.')}>
          + Upload Test Document
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Extracted Clinical Entities (OCR Pipeline)">
            <Table columns={columns} data={sampleEntities} />
          </Card>
        </div>

        <Card title="Document Extraction Pipeline Architecture">
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 font-mono text-[11px] text-[#1E56A0] leading-relaxed">
              Document Scan → OCR Engine → Clinical Entity Extractor → Doctor Verification
            </div>
            <p className="text-slate-600 font-medium">
              Extracted medications, diagnoses, and lab results automatically populate the patient timeline in later phases.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
