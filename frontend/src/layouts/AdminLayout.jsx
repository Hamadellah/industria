import { createContext, useContext, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AdminShellContext = createContext({ openMenu: () => {} });
export const useAdminShell = () => useContext(AdminShellContext);

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Vous êtes déconnecté.');
    navigate('/login');
  };

  return (
    <AdminShellContext.Provider value={{ openMenu: () => setOpen(true) }}>
      <div className="min-h-screen bg-slate-50">
        <AdminSidebar open={open} onClose={() => setOpen(false)} onLogout={handleLogout} />
        <div className="lg:pl-64">
          <Outlet />
        </div>
      </div>
    </AdminShellContext.Provider>
  );
}
