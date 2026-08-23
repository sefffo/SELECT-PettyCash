import { useState } from 'react';
import { Box, Typography, Avatar, Chip, IconButton, Tooltip, useTheme, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { MoreHorizOutlined, VisibilityOutlined, EditOutlined, SwapHorizOutlined, TrendingUpOutlined, ToggleOnOutlined, DeleteOutlined, PaidOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { Employee, UserRole } from '@/types/vertex';

interface EmployeeTableProps {
  employees: Employee[];
  currentUserId?: string;
  showDepartment?: boolean;
  onView: (emp: Employee) => void;
  onEdit?: (emp: Employee) => void;
  onChangeDepartment?: (emp: Employee) => void;
  onChangeStatus?: (emp: Employee) => void;
  onPromote?: (emp: Employee) => void;
  onDelete?: (emp: Employee) => void;
  onDirectRequest?: (emp: Employee) => void;
}

const roleLabel: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  employee: 'Employee',
  finance: 'Finance',
};

const roleColor: Record<UserRole, { light: string; dark: string }> = {
  admin: { light: '#0369A1', dark: '#7DD3FC' },
  manager: { light: '#145DB8', dark: '#60A5FA' },
  employee: { light: '#475569', dark: '#94A3B8' },
  finance: { light: '#6D28D9', dark: '#C4B5FD' },
};

const roleBg: Record<UserRole, string> = {
  admin: 'rgba(56, 189, 248, 0.12)',
  manager: 'rgba(20, 93, 184, 0.12)',
  employee: 'rgba(100, 116, 139, 0.12)',
  finance: 'rgba(124, 58, 237, 0.12)',
};

export function EmployeeTable({ employees, currentUserId, showDepartment = true, onView, onEdit, onChangeDepartment, onChangeStatus, onPromote, onDelete, onDirectRequest }: EmployeeTableProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuEmployee, setMenuEmployee] = useState<Employee | null>(null);

  if (employees.length === 0) return null;

  const openMenu = (event: React.MouseEvent<HTMLElement>, emp: Employee) => {
    setMenuEmployee(emp);
    setMenuAnchor(event.currentTarget);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuEmployee(null);
  };

  const runAction = (action: (emp: Employee) => void) => {
    if (!menuEmployee) return;
    const emp = menuEmployee;
    closeMenu();
    action(emp);
  };

  const canPromote = menuEmployee ? menuEmployee.userRole === 'employee' || menuEmployee.userRole === 'finance' : false;

  const headers = [
    t('admin.employeeTable.employee'),
    t('admin.employeeTable.email'),
    ...(showDepartment ? [t('admin.employeeTable.department')] : []),
    t('admin.employeeTable.role'),
    t('admin.employeeTable.status'),
    '',
  ];

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box sx={{ minWidth: { xs: 0, md: 700 }, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, px: 2, py: 1, gap: 1.5, alignItems: 'center' }}>
          {headers.map((h) => (
            <Typography key={h} sx={{ flex: h === '' ? '0 0 48px' : h === t('admin.employeeTable.employee') || h === t('admin.employeeTable.email') ? 1.2 : 1, textAlign: h === '' ? 'right' : 'left', fontSize: 12, fontWeight: 600, color: 'text.disabled' }}>
              {h}
            </Typography>
          ))}
        </Box>

        {employees.map((emp, i) => (
          <Box
            component={motion.div}
            key={emp.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            sx={{
              display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1, md: 1.5 },
              alignItems: { xs: 'stretch', md: 'center' }, minWidth: 0, px: 2, py: 1.5,
              borderRadius: 2, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider',
              transition: 'all 0.2s',
              '&:hover': { borderColor: '#145DB8' },
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} flex={1.2}>
              <Avatar sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 700, backgroundColor: '#145DB8', flexShrink: 0 }}>
                {emp.name.charAt(0)}
              </Avatar>
              <Box minWidth={0}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }} noWrap>{emp.name}</Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', display: { xs: 'block', md: 'none' } }}>
                  {emp.email}
                </Typography>
              </Box>
            </Box>

            <Typography sx={{ fontSize: 13, color: 'text.secondary', display: { xs: 'none', md: 'block' }, flex: 1.2 }}>
              {emp.email}
            </Typography>

            {showDepartment && (
              <Box flex={1}>
                <Typography sx={{ fontSize: 11, color: 'text.disabled', fontWeight: 600, display: { xs: 'block', md: 'none' }, mb: 0.25 }}>
                  {t('admin.employeeTable.department')}
                </Typography>
                <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{emp.department}</Typography>
              </Box>
            )}

            <Box flex={1}>
              <Typography sx={{ fontSize: 11, color: 'text.disabled', fontWeight: 600, display: { xs: 'block', md: 'none' }, mb: 0.25 }}>
                {t('admin.employeeTable.role')}
              </Typography>
              <Chip label={roleLabel[emp.userRole]} size="small"
                sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: 11, backgroundColor: roleBg[emp.userRole], color: roleColor[emp.userRole][isDark ? 'dark' : 'light'] }} />
            </Box>

            <Box flex={1}>
              <Typography sx={{ fontSize: 11, color: 'text.disabled', fontWeight: 600, display: { xs: 'block', md: 'none' }, mb: 0.25 }}>
                {t('admin.employeeTable.status')}
              </Typography>
              <Chip label={emp.status === 'active' ? t('common.active') : t('common.inactive')} size="small"
                sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: 11, backgroundColor: emp.status === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(100, 116, 139, 0.15)', color: emp.status === 'active' ? '#22C55E' : (isDark ? '#94A3B8' : '#64748B') }} />
            </Box>

            <Box display="flex" flex={{ xs: '0 0 auto', md: '0 0 48px' }} justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center">
              <Tooltip title={t('admin.moreActions')}>
                <IconButton size="small" onClick={(e) => openMenu(e, emp)} aria-label={t('admin.moreActions')}
                  sx={{ width: { xs: 40, md: 32 }, height: { xs: 40, md: 32 }, color: 'text.secondary' }}>
                  <MoreHorizOutlined sx={{ fontSize: { xs: 22, md: 20 } }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 210, mt: 0.5, boxShadow: '0 8px 32px rgba(7, 19, 33, 0.18)' } } }}
      >
        <MenuItem onClick={() => runAction(onView)} data-testid="employee-action-view" sx={{ fontSize: 13, py: 1 }}>
          <ListItemIcon><VisibilityOutlined sx={{ fontSize: 18 }} /></ListItemIcon>
          <ListItemText>{t('admin.viewProfile')}</ListItemText>
        </MenuItem>
        {onDirectRequest && (
          <MenuItem onClick={() => runAction(onDirectRequest)} data-testid="employee-action-direct-request" sx={{ fontSize: 13, py: 1 }}>
            <ListItemIcon><PaidOutlined sx={{ fontSize: 18 }} /></ListItemIcon>
            <ListItemText>{t('manager.requestMoney')}</ListItemText>
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem onClick={() => runAction(onEdit)} data-testid="employee-action-edit" sx={{ fontSize: 13, py: 1 }}>
            <ListItemIcon><EditOutlined sx={{ fontSize: 18 }} /></ListItemIcon>
            <ListItemText>{t('admin.editEmployee')}</ListItemText>
          </MenuItem>
        )}
        {onChangeDepartment && (
          <MenuItem onClick={() => runAction(onChangeDepartment)} data-testid="employee-action-department" sx={{ fontSize: 13, py: 1 }}>
            <ListItemIcon><SwapHorizOutlined sx={{ fontSize: 18 }} /></ListItemIcon>
            <ListItemText>{t('admin.changeDepartment')}</ListItemText>
          </MenuItem>
        )}
        {onChangeStatus && (
          <MenuItem onClick={() => runAction(onChangeStatus)} data-testid="employee-action-status" sx={{ fontSize: 13, py: 1 }}>
            <ListItemIcon><ToggleOnOutlined sx={{ fontSize: 18 }} /></ListItemIcon>
            <ListItemText>{t('admin.changeStatus')}</ListItemText>
          </MenuItem>
        )}
        {onPromote && canPromote && (
          <MenuItem onClick={() => runAction(onPromote)} data-testid="employee-action-promote" sx={{ fontSize: 13, py: 1 }}>
            <ListItemIcon><TrendingUpOutlined sx={{ fontSize: 18 }} /></ListItemIcon>
            <ListItemText>{t('role.promoteToManager')}</ListItemText>
          </MenuItem>
        )}
        {onDelete && menuEmployee?.id !== currentUserId && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={() => runAction(onDelete)} data-testid="employee-action-delete" sx={{ fontSize: 13, py: 1, color: '#DC2626' }}>
              <ListItemIcon><DeleteOutlined sx={{ fontSize: 18, color: '#DC2626' }} /></ListItemIcon>
              <ListItemText>{t('admin.deleteEmployee')}</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
}
