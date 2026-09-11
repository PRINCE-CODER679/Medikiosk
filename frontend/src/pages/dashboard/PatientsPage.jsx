import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Badge, Avatar } from '../../components/ui/Card';
import { Table } from '../../components/ui/TableAndTabs';
import { SearchBar, Select } from '../../components/ui/FormControls';
import { Button } from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { Users, UserPlus, Filter, Eye, Phone, CreditCard, ShieldAlert } from 'lucide-react';
import { ApiService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export function PatientsPage() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    ApiService.getPatients().then((data) => setPatients(data));
  }, []);

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.abhaId.includes(search);
    const matchesStatus = statusFilter === 'ALL' || p.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: t('dash_header_profile'),
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} status={row.status === 'Active' ? 'active' : 'offline'} />
          <div className="text-left">
            <p className="font-bold text-slate-900 leading-tight">{row.name}</p>
            <p className="text-xs text-slate-400 font-mono">{row.id} • {row.age}y / {row.gender}</p>
          </div>
        </div>
      )
    },
    {
      header: t('dash_header_abha'),
      accessor: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-lg w-fit">
          <CreditCard className="w-3.5 h-3.5 text-[#1E56A0]" />
          <span>{row.abhaId}</span>
        </div>
      )
    },
    {
      header: t('dash_header_last_visit'),
      accessor: (row) => (
        <div className="text-left">
          <p className="text-xs font-semibold text-slate-800 line-clamp-1">{row.complaint}</p>
          <p className="text-[11px] text-slate-400 font-medium font-mono">
            {new Date(row.lastVisit).toLocaleDateString()}
          </p>
        </div>
      )
    },
    {
      header: t('dash_header_triage'),
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <Badge variant={row.urgency === 'Critical' ? 'critical' : row.urgency === 'Urgent' ? 'danger' : 'success'} size="sm">
            {row.urgency}
          </Badge>
          <span className="text-xs font-semibold text-slate-600">• {row.status}</span>
        </div>
      )
    },
    {
      header: t('dash_header_action'),
      accessor: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/patients/${row.id}`);
          }}
        >
          <Eye className="w-3.5 h-3.5 mr-1 text-[#1E56A0]" />
          {t('dash_btn_open_profile')}
        </Button>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="text-left bg-transparent">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#1E56A0]" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('patient_detail_title', 'Patient Directory')}</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
            248 {t('kpi_patients_sub', 'Total Registered Patients • ABHA Linked Clinical Records')}
          </p>
        </div>

        <Button variant="primary" icon={UserPlus} onClick={() => alert('Phase 2 Feature: Patient Registration & ABHA Verification will be implemented in Phase 2.')}>
          + Register New Patient
        </Button>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('dash_search_placeholder')}
          />
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Select
              options={[
                { label: t('dash_filter_all_statuses'), value: 'ALL' },
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Follow-up', value: 'FOLLOW-UP' },
                { label: 'Completed', value: 'COMPLETED' }
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredPatients}
          onRowClick={(row) => navigate(`/patients/${row.id}`)}
        />
      </Card>
    </DashboardLayout>
  );
}
