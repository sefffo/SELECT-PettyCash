import { useMemo, useState } from 'react';
import { Box, Typography, TextField, InputAdornment, Button } from '@mui/material';
import { Search, PaidOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useManagerApprovedRequests, useManagerPendingRequests, useManagerRejectedRequests, useMyProfile, useUsers, useDepartments, useSubmitDirectGrant } from '@/hooks/api';
import { EmployeeTable } from '@/components/admin/EmployeeTable';
import { EmployeeDetailModal } from '@/components/admin/EmployeeDetailModal';
import { DirectMoneyRequestDialog, EmptyState, SkeletonLoader } from '@/components/shared';
import { mapApiUserToEmployee } from '@/utils/mappers';
import type { AdminProfileInfo, ApiUser, ManagerRequestItem } from '@/types/api';
import type { Employee } from '@/types/vertex';

const normalizeName = (name: string | null | undefined) => (name ?? '').trim().toLowerCase();

export default function ManagerEmployees() {
  const { t } = useTranslation();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: myProfile, isLoading: profileLoading } = useMyProfile();
  const { data: departments = [] } = useDepartments();
  const { data: pending = [], isLoading: pendingLoading } = useManagerPendingRequests();
  const { data: approved = [], isLoading: approvedLoading } = useManagerApprovedRequests();
  const { data: rejected = [], isLoading: rejectedLoading } = useManagerRejectedRequests();
  const submitDirectGrant = useSubmitDirectGrant();

  const [search, setSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<ApiUser | null>(null);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestTargetId, setRequestTargetId] = useState('');

  const employees = useMemo(() => {
    const managerDepartment = myProfile?.DepartmentId;
    if (!managerDepartment) return [];
    const dept = managerDepartment.trim().toLowerCase();
    return users
      .filter((u) => (u.DepartmentId ?? '').trim().toLowerCase() === dept)
      .map((u) => mapApiUserToEmployee(u, []));
  }, [users, myProfile?.DepartmentId]);

  const eligibleEmployees = useMemo(() => {
    const managerDepartment = myProfile?.DepartmentId;
    if (!managerDepartment) return [];
    const dept = managerDepartment.trim().toLowerCase();
    return users
      .filter((u) => u.Role === 'Employee' && (u.DepartmentId ?? '').trim().toLowerCase() === dept)
      .map((u) => ({
        id: String(u.Id),
        name: u.Name,
        email: u.Email,
        department: departments.find((d) => d.Id === u.DepartmentId)?.Name ?? '—',
      }));
  }, [users, myProfile?.DepartmentId, departments]);

  const filtered = useMemo(() => {
    if (!search) return employees;
    const q = search.toLowerCase();
    return employees.filter((e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q));
  }, [employees, search]);

  const allRequests = useMemo(() => [...pending, ...approved, ...rejected], [pending, approved, rejected]);

  const transactions = useMemo(
    () => (detailEmployee ? allRequests.filter((r) => normalizeName(r.EmployeeName) === normalizeName(detailEmployee.name)) : []),
    [allRequests, detailEmployee],
  );

  const profile: AdminProfileInfo | null = useMemo(() => {
    if (!detailUser) return null;
    return { Id: String(detailUser.Id), Name: detailUser.Name, Email: detailUser.Email, Role: detailUser.Role };
  }, [detailUser]);

  const isLoading = usersLoading || profileLoading || pendingLoading || approvedLoading || rejectedLoading;

  const openDetail = (emp: Employee) => {
    const user = users.find((u) => String(u.Id) === emp.id) ?? null;
    setDetailUser(user);
    setDetailEmployee(emp);
    setDetailOpen(true);
  };

  const openDirectRequest = (emp: Employee) => {
    setRequestTargetId(emp.id);
    setRequestDialogOpen(true);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={1.5}>
        <Box>
          <Typography variant="h2" sx={{ color: 'text.primary' }}>{t('nav.employees')}</Typography>
          <Typography sx={{ fontSize: 15, color: 'text.secondary', mt: 0.25 }}>
            {t('admin.employeesTotal', { count: employees.length })}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PaidOutlined sx={{ fontSize: 16 }} />}
          onClick={() => {
            setRequestTargetId('');
            setRequestDialogOpen(true);
          }}
          sx={{ borderRadius: 2, py: 0.6, px: 1.5, fontSize: 13, flexShrink: 0 }}
        >
          {t('manager.requestMoney')}
        </Button>
      </Box>

      <Box sx={{ mb: 2.5, maxWidth: 420 }}>
        <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search') + '...'} fullWidth size="small"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.disabled', fontSize: 18 }} /></InputAdornment> } }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
      </Box>

      {isLoading ? <SkeletonLoader type="list" count={5} /> : filtered.length > 0 ? (
        <EmployeeTable employees={filtered} showDepartment={false} onView={openDetail} onDirectRequest={openDirectRequest} />
      ) : (
        <EmptyState icon="👥" title={search ? t('manager.noEmployeesTitle') : t('manager.emptyTeamTitle')}
          description={search ? t('manager.noEmployeesHint') : t('manager.emptyTeamHint')} />
      )}

      <EmployeeDetailModal
        employee={detailEmployee}
        profile={profile}
        transactions={transactions as ManagerRequestItem[]}
        transactionsLoading={pendingLoading || approvedLoading || rejectedLoading}
        showDepartment={false}
        showEmployeeId={false}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setDetailUser(null); setDetailEmployee(null); }}
      />

      <DirectMoneyRequestDialog
        open={requestDialogOpen}
        onClose={() => setRequestDialogOpen(false)}
        title={t('directMoney.title')}
        hint={t('directMoney.hint')}
        submitLabel={t('directMoney.submit')}
        submittingLabel={t('directMoney.submitting')}
        successMessage={t('directMoney.success')}
        employees={eligibleEmployees}
        initialEmployeeId={requestTargetId || undefined}
        submit={(params) => submitDirectGrant.mutateAsync(params)}
      />
    </Box>
  );
}
