import { useMemo, useState } from 'react';
import { Box, Typography, TextField, InputAdornment, Button, Fab, MenuItem, Tabs, Tab, Card, CardContent } from '@mui/material';
import { Search, Add, BusinessOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAssignDepartment, useAdminEmployeeProfile, useChangeUserStatus, useCreateDepartment, useCreateUser, useDeleteUser, useDepartments, useEditUser, usePromoteManager, useUsers } from '@/hooks/api';
import { useAuthStore } from '@/store/authStore';
import { EmployeeTable } from '@/components/admin/EmployeeTable';
import { EmployeeForm } from '@/components/admin/EmployeeForm';
import { EditEmployeeForm } from '@/components/admin/EditEmployeeForm';
import { EmployeeDetailModal } from '@/components/admin/EmployeeDetailModal';
import { ChangeDepartmentModal } from '@/components/admin/ChangeDepartmentModal';
import { ChangeStatusModal } from '@/components/admin/ChangeStatusModal';
import { BottomSheet, Toast, EmptyState, SkeletonLoader, ConfirmationDialog } from '@/components/shared';
import { departmentFormSchema, type CreateUserFormData, type DepartmentFormData, type EditUserFormData } from '@/schemas/admin';
import { mapApiUserToEmployee } from '@/utils/mappers';
import type { Employee } from '@/types/vertex';
import type { ApiUser, ApiUserStatus } from '@/types/api';

export default function AdminEmployees() {
  const { t } = useTranslation();
  const currentUser = useAuthStore((s) => s.user);
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: departments = [], isLoading: departmentsLoading } = useDepartments();
  const createUserMutation = useCreateUser();
  const editUserMutation = useEditUser();
  const deleteUserMutation = useDeleteUser();
  const assignDepartmentMutation = useAssignDepartment();
  const createDepartmentMutation = useCreateDepartment();
  const promoteMutation = usePromoteManager();
  const changeStatusMutation = useChangeUserStatus();

  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<ApiUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<ApiUser | null>(null);
  const [statusTarget, setStatusTarget] = useState<ApiUser | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptUser, setDeptUser] = useState<ApiUser | null>(null);
  const [addDeptOpen, setAddDeptOpen] = useState(false);
  const [statusSnapshots, setStatusSnapshots] = useState<Record<string, ApiUser>>({});
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const employeeProfileQuery = useAdminEmployeeProfile(detailOpen ? detailEmployee?.id ?? null : null);

  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: { name: '' },
  });

  const displayUsers = useMemo(() => {
    const map = new Map<string, ApiUser>();
    for (const u of users) map.set(String(u.Id), u);
    for (const s of Object.values(statusSnapshots)) {
      const existing = map.get(String(s.Id));
      if (existing) {
        map.set(String(s.Id), { ...existing, Status: s.Status });
      } else {
        map.set(String(s.Id), s);
      }
    }
    return Array.from(map.values());
  }, [users, statusSnapshots]);

  const employees = useMemo(() => displayUsers.map((u) => mapApiUserToEmployee(u, departments)), [displayUsers, departments]);

  const filtered = useMemo(() => {
    let result = employees;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) =>
        e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.department.toLowerCase().includes(q),
      );
    }
    if (deptFilter !== 'all') result = result.filter((e) => e.department === deptFilter);
    return result;
  }, [employees, search, deptFilter]);

  const showToast = (message: string, severity: 'success' | 'error') => setToast({ open: true, message, severity });

  const handleAdd = async (data: CreateUserFormData) => {
    try {
      await createUserMutation.mutateAsync({
        Name: data.name,
        Email: data.email,
        Password: data.password,
        Role: data.role,
        DepartmentId: data.departmentId,
      });
      setFormOpen(false);
      showToast('Employee created successfully', 'success');
    } catch (err) {
      showToast((err as { message?: string } | null)?.message ?? 'Failed to create employee.', 'error');
    }
  };

  const handleDepartmentChange = async (userId: string, departmentId: string) => {
    try {
      await assignDepartmentMutation.mutateAsync({ TargetUserId: userId, DepartmentId: departmentId });
      showToast('Department updated', 'success');
    } catch (err) {
      showToast((err as { message?: string } | null)?.message ?? 'Failed to update department.', 'error');
    }
  };

  const handleAddDepartment = async (data: DepartmentFormData) => {
    try {
      await createDepartmentMutation.mutateAsync(data.name);
      reset();
      setAddDeptOpen(false);
      showToast(t('admin.departmentAdded'), 'success');
    } catch (err) {
      showToast((err as { message?: string } | null)?.message ?? 'Failed to create department.', 'error');
    }
  };

  const openDetail = (emp: Employee) => { setDetailEmployee(emp); setDetailOpen(true); };
  const openDeptModal = (emp: Employee) => {
    const user = users.find((u) => String(u.Id) === emp.id);
    if (!user) return;
    setDeptUser(user);
    setDeptModalOpen(true);
  };

  const openEdit = (emp: Employee) => {
    const user = users.find((u) => String(u.Id) === emp.id);
    if (!user) return;
    setEditUser(user);
  };

  const openDelete = (emp: Employee) => {
    const user = users.find((u) => String(u.Id) === emp.id);
    if (!user) return;
    setDeleteTarget(user);
  };

  const openPromote = (emp: Employee) => {
    const user = users.find((u) => String(u.Id) === emp.id);
    if (!user) return;
    setPromoteTarget(user);
  };

  const openChangeStatus = (emp: Employee) => {
    const user = users.find((u) => String(u.Id) === emp.id);
    if (!user) return;
    setStatusTarget(user);
  };

  const handleEdit = async (data: EditUserFormData) => {
    if (!editUser) return;
    try {
      await editUserMutation.mutateAsync({
        TargetUserId: String(editUser.Id),
        Name: data.name,
        Role: data.role,
      });
      setEditUser(null);
      showToast(t('admin.employeeUpdated'), 'success');
    } catch (err) {
      showToast((err as { message?: string } | null)?.message ?? 'Failed to update employee.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUserMutation.mutateAsync(String(deleteTarget.Id));
      setStatusSnapshots((prev) => {
        const next = { ...prev };
        delete next[String(deleteTarget.Id)];
        return next;
      });
      setDeleteTarget(null);
      showToast(t('admin.employeeDeleted'), 'success');
    } catch (err) {
      showToast((err as { message?: string } | null)?.message ?? 'Failed to delete employee.', 'error');
    }
  };

  const handlePromote = async () => {
    if (!promoteTarget) return;
    try {
      await promoteMutation.mutateAsync(String(promoteTarget.Id));
      setPromoteTarget(null);
      showToast(t('role.roleUpdated'), 'success');
    } catch (err) {
      showToast((err as { message?: string } | null)?.message ?? 'Failed to promote employee.', 'error');
    }
  };

  const handleChangeStatus = async (userId: string, status: ApiUserStatus) => {
    try {
      await changeStatusMutation.mutateAsync({ UserId: userId, Status: status });
      if (statusTarget) {
        setStatusSnapshots((prev) => ({ ...prev, [userId]: { ...statusTarget, Status: status } }));
      }
      setStatusTarget(null);
      showToast(t('admin.statusUpdated'), 'success');
    } catch (err) {
      showToast((err as { message?: string } | null)?.message ?? 'Failed to update employee status.', 'error');
    }
  };

  const isLoading = usersLoading || departmentsLoading;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={1.5}>
        <Box>
          <Typography variant="h2" sx={{ color: 'text.primary' }}>{t('admin.employeeMgmt')}</Typography>
          <Typography sx={{ fontSize: 15, color: 'text.secondary', mt: 0.25 }}>
            {t('admin.employeesTotal', { count: employees.length })}
          </Typography>
        </Box>
        <Box display="flex" gap={0.75}>
          <Button variant="outlined" size="small" startIcon={<BusinessOutlined sx={{ fontSize: 16 }} />} onClick={() => setTab(tab === 1 ? 0 : 1)}
            sx={{ borderRadius: 2, display: { xs: 'none', sm: 'flex' }, py: 0.5, px: 1.25, fontSize: 13 }}>
            {t('admin.departmentMgmt')}
          </Button>
          <Button variant="contained" size="small" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={() => setFormOpen(true)}
            sx={{ borderRadius: 2, display: { xs: 'none', sm: 'flex' }, py: 0.5, px: 1.25, fontSize: 13 }}>
            {t('common.add')} {t('nav.employees')}
          </Button>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5, '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', minHeight: 36, py: 0.5, color: 'text.secondary', '&.Mui-selected': { color: '#145DB8' } }, '& .MuiTabs-indicator': { backgroundColor: '#145DB8', height: 2.5 } }}>
        <Tab label={t('nav.employees')} />
        <Tab label={t('admin.departmentMgmt')} />
      </Tabs>

      {tab === 0 ? (
        <>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search') + '...'} fullWidth size="small"
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.disabled', fontSize: 18 }} /></InputAdornment> } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} size="small"
              sx={{ minWidth: { xs: '100%', sm: 160 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <MenuItem value="all">{t('admin.employeeTable.department')} — {t('common.all')}</MenuItem>
              {departments.map((d) => <MenuItem key={d.Id} value={d.Name}>{d.Name}</MenuItem>)}
            </TextField>
          </Box>

          {isLoading ? <SkeletonLoader type="list" count={5} /> : filtered.length > 0 ? (
            <EmployeeTable
              employees={filtered}
              currentUserId={currentUser?.id}
              onView={openDetail}
              onEdit={openEdit}
              onChangeDepartment={openDeptModal}
              onChangeStatus={openChangeStatus}
              onPromote={openPromote}
              onDelete={openDelete}
            />
          ) : (
            <EmptyState icon="👥" title={search || deptFilter !== 'all' ? 'No employees found' : 'No employees yet'}
              description={search || deptFilter !== 'all' ? 'Try adjusting your search or filter.' : 'Add your first employee to get started.'}
              action={<Button variant="contained" startIcon={<Add />} onClick={() => setFormOpen(true)}>{t('common.add')} Employee</Button>} />
          )}

          <Fab color="primary" size="small" onClick={() => setFormOpen(true)}
            sx={{ position: 'fixed', bottom: 24, right: 24, backgroundColor: '#145DB8', '&:hover': { backgroundColor: '#1E7AE6' }, display: { sm: 'none' } }}>
            <Add />
          </Fab>
        </>
      ) : (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary' }}>{t('admin.departmentMgmt')}</Typography>
            <Button variant="contained" size="small" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={() => { reset(); setAddDeptOpen(true); }}
              sx={{ borderRadius: 2, py: 0.5, px: 1.25, fontSize: 13 }}>
              {t('admin.addDepartment')}
            </Button>
          </Box>

          {departmentsLoading ? <SkeletonLoader type="list" count={3} /> : departments.length === 0 ? (
            <EmptyState icon="🏢" title={t('admin.noDepartments')} description="Create your first department to organize employees."
              action={<Button variant="contained" size="small" startIcon={<Add />} onClick={() => { reset(); setAddDeptOpen(true); }}>{t('admin.addDepartment')}</Button>} />
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 1.5 }}>
              {departments.map((dept) => (
                <Card key={dept.Id} sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary' }}>{dept.Name}</Typography>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 1 }}>
                      {users.filter((u) => u.DepartmentId === dept.Id).length} {t('nav.employees')}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      <BottomSheet open={formOpen} onClose={() => setFormOpen(false)} title={t('common.add') + ' Employee'}>
        <EmployeeForm departments={departments} onSubmit={handleAdd}
          onCancel={() => setFormOpen(false)} isSubmitting={createUserMutation.isPending} />
      </BottomSheet>

      <BottomSheet open={addDeptOpen} onClose={() => setAddDeptOpen(false)} title={t('admin.addDepartment')}>
        <Box component="form" onSubmit={handleSubmit(handleAddDepartment)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField {...register('name')} label={t('admin.departmentName')} error={!!errors.name} helperText={errors.name?.message} fullWidth autoFocus />
          <Box display="flex" gap={2}>
            <Button variant="outlined" fullWidth onClick={() => setAddDeptOpen(false)} sx={{ borderRadius: 2, py: 1.1 }}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained" fullWidth disabled={createDepartmentMutation.isPending} sx={{ borderRadius: 2, py: 1.1 }}>
              {createDepartmentMutation.isPending ? t('common.saving') : t('common.add')}
            </Button>
          </Box>
        </Box>
      </BottomSheet>

      <EmployeeDetailModal
        employee={detailEmployee}
        profile={employeeProfileQuery.data?.Profile ?? null}
        transactions={employeeProfileQuery.data?.Transactions ?? []}
        transactionsLoading={employeeProfileQuery.isFetching}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setDetailEmployee(null); }}
      />
      <ChangeDepartmentModal user={deptUser}
        currentDepartment={deptUser ? (departments.find((d) => d.Id === deptUser.DepartmentId)?.Name ?? '—') : ''}
        departments={departments} open={deptModalOpen}
        onClose={() => { setDeptModalOpen(false); setDeptUser(null); }}
        onConfirm={handleDepartmentChange} isSubmitting={assignDepartmentMutation.isPending} />

      <ChangeStatusModal
        key={statusTarget?.Id ?? 'none'}
        user={statusTarget}
        currentStatus={statusTarget?.Status ?? 'Active'}
        open={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleChangeStatus}
        isSubmitting={changeStatusMutation.isPending}
      />

      <BottomSheet open={!!editUser} onClose={() => setEditUser(null)} title={t('common.edit') + ' Employee'}>
        {editUser && (
          <EditEmployeeForm
            initialValues={{ name: editUser.Name, role: editUser.Role }}
            onSubmit={handleEdit}
            onCancel={() => setEditUser(null)}
            isSubmitting={editUserMutation.isPending}
          />
        )}
      </BottomSheet>

      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('admin.deleteEmployeeTitle')}
        message={t('admin.deleteEmployeeMessage', { name: deleteTarget?.Name ?? '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        confirmColor="error"
        icon="🗑️"
      />

      <ConfirmationDialog
        open={!!promoteTarget}
        onClose={() => setPromoteTarget(null)}
        onConfirm={handlePromote}
        title={t('role.changeRoleConfirmTitle')}
        message={t('role.changeRoleConfirmMessage', { name: promoteTarget?.Name ?? '', from: promoteTarget?.Role ?? '', to: 'Manager' })}
        confirmLabel={t('role.promoteToManager')}
        cancelLabel={t('common.cancel')}
        icon="⬆️"
      />

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} />
    </Box>
  );
}
