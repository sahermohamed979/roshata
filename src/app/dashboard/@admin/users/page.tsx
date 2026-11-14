'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCog,
  UserPlus,
  Search,
  Shield,
  Stethoscope,
  KeyRound,
  CheckCircle2,
  Lock,
  Edit2,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  UserCheck,
  UserX,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getUsersAction,
  createUserAction,
  updateUserAction,
  resetUserPasswordAction,
  deactivateUserAction,
  deleteUserAction,
  UserItem,
} from '@/features/users/apis/users.action';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'DOCTOR',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    role: 'DOCTOR',
    isActive: true,
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getUsersAction(1, 100);
      if (res.status && res.payload) {
        // payload might be array or paginated items
        const list = Array.isArray(res.payload)
          ? res.payload
          : (res.payload as any).items || [];
        setUsers(list);
      } else {
        toast.error(res.message || 'تعذر تحميل المستخدمين');
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Handle Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.username.trim() || !createForm.password.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (createForm.password.length < 4) {
      toast.error('كلمة المرور يجب أن لا تقل عن 4 أحرف أو أرقام');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createUserAction({
        name: createForm.name.trim(),
        username: createForm.username.trim(),
        password: createForm.password,
        role: createForm.role,
      });

      if (res.status) {
        toast.success(`تم إنشاء حساب ${createForm.name} بنجاح`);
        setIsCreateOpen(false);
        setCreateForm({ name: '', username: '', password: '', role: 'DOCTOR' });
        fetchUsers();
      } else {
        toast.error(res.message || 'فشل إنشاء المستخدم');
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء حفظ المستخدم');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit User
  const openEditModal = (user: UserItem) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      username: user.username || '',
      role: user.role || 'DOCTOR',
      isActive: user.isActive !== false,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!editForm.name.trim() || !editForm.username.trim()) {
      toast.error('الاسم واسم المستخدم مطلوبان');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateUserAction(selectedUser.id, {
        name: editForm.name.trim(),
        username: editForm.username.trim(),
        role: editForm.role,
        isActive: editForm.isActive,
      });

      if (res.status) {
        toast.success('تم تحديث بيانات المستخدم بنجاح');
        setIsEditOpen(false);
        fetchUsers();
      } else {
        toast.error(res.message || 'فشل تحديث البيانات');
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء تعديل البيانات');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reset Password
  const openPasswordModal = (user: UserItem) => {
    setSelectedUser(user);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setShowPassword(false);
    setIsPasswordOpen(true);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!passwordForm.newPassword) {
      toast.error('يرجى إدخال كلمة المرور الجديدة');
      return;
    }
    if (passwordForm.newPassword.length < 4) {
      toast.error('كلمة المرور يجب أن لا تقل عن 4 أحرف أو أرقام');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetUserPasswordAction(selectedUser.id, passwordForm.newPassword);
      if (res.status) {
        toast.success(`تم تغيير كلمة المرور للمستخدم (${selectedUser.name}) بنجاح`);
        setIsPasswordOpen(false);
      } else {
        toast.error(res.message || 'فشل تغيير كلمة المرور');
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (user: UserItem) => {
    const newStatus = !user.isActive;
    try {
      const res = await updateUserAction(user.id, { isActive: newStatus });
      if (res.status) {
        toast.success(newStatus ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب');
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u))
        );
      } else {
        toast.error(res.message || 'فشل تعديل الحالة');
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء تحديث الحالة');
    }
  };

  // Delete User
  const handleDeleteUser = async (user: UserItem) => {
    if (!confirm(`هل أنت متأكد تماماً من رغبتك في حذف المستخدم (${user.name}) نهائياً من النظام؟`)) {
      return;
    }
    try {
      const res = await deleteUserAction(user.id);
      if (res.status) {
        toast.success(`تم حذف المستخدم (${user.name}) بنجاح`);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      } else {
        toast.error(res.message || 'فشل حذف المستخدم');
      }
    } catch {
      toast.error('حدث خطأ أثناء محاولة حذف المستخدم');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-black text-xs border border-purple-200">
            <Shield className="w-3.5 h-3.5" />
            <span>مدير النظام (Admin)</span>
          </span>
        );
      case 'DOCTOR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E3F5EE] text-[#0B7B5E] font-black text-xs border border-[#D0E5DC]">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>طبيب (Doctor)</span>
          </span>
        );
      case 'RECEPTION':
      case 'RECEPTIONIST':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-black text-xs border border-amber-200">
            <KeyRound className="w-3.5 h-3.5" />
            <span>موظف استقبال (Reception)</span>
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none" dir="rtl">
      {/* 1. الترويسة الرئيسية */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-[#E3F5EE] text-[#0B7B5E]">
              <UserCog className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#074C3A] tracking-tight">
              إدارة مستخدمي النظام والصلاحيات
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-500">
            إضافة أطباء وموظفي استقبال جدد وتعديل الأسماء وتعيين كلمات المرور
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={isLoading}
            className="h-11 px-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#0B7B5E]' : 'text-slate-400'}`} />
            <span>تحديث</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="h-11 px-5 rounded-2xl bg-[#0B7B5E] hover:bg-[#09634C] active:scale-95 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مستخدم جديد</span>
          </button>
        </div>
      </div>

      {/* 2. شريط البحث والفلترة */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم أو اسم المستخدم (Username)..."
            className="w-full h-10 pr-10 pl-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B7B5E] focus:bg-white transition-all"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'الكل' },
            { id: 'DOCTOR', label: 'الأطباء' },
            { id: 'RECEPTION', label: 'الاستقبال' },
            { id: 'ADMIN', label: 'المديرون' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterRole(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                filterRole === tab.id
                  ? 'bg-[#0B7B5E] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. جدول المستخدمين */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0B7B5E] mx-auto" />
            <p className="font-bold">جاري تحميل بيانات المستخدمين...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <UserCog className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold">لا يوجد مستخدمين مطابقين للبحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold">
                  <th className="py-3.5 px-4 text-start">الاسم الكامل</th>
                  <th className="py-3.5 px-4 text-start">اسم المستخدم (تسجيل الدخول)</th>
                  <th className="py-3.5 px-4 text-center">نوع الصلاحية</th>
                  <th className="py-3.5 px-4 text-center">الحالة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 text-[#074C3A] font-black">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      @{u.username}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {getRoleBadge(u.role)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>نشط</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-black border border-rose-200">
                          <UserX className="w-3 h-3" />
                          <span>معطل</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#D0E5DC] bg-white hover:bg-[#E3F5EE] text-slate-700 hover:text-[#0B7B5E] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                          title="تعديل الاسم أو اسم المستخدم أو الصلاحية"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openPasswordModal(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-amber-200 hover:border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                          title="تغيير كلمة المرور للمستخدم"
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span>كلمة المرور</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                            u.isActive
                              ? 'border-slate-200 text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={u.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                        >
                          {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition-all cursor-pointer"
                          title="حذف المستخدم نهائياً"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. مودال إضافة مستخدم جديد */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#E3F5EE] text-[#0B7B5E]">
                  <UserPlus className="w-5 h-5" />
                </span>
                <h3 className="text-base font-black text-[#074C3A]">إضافة مستخدم جديد للنظام</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="مثال: د. إسلام كريمة، أ. أحمد الاستقبال..."
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#0B7B5E]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">اسم المستخدم (لتسجيل الدخول) *</label>
                <input
                  type="text"
                  required
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  placeholder="مثال: doctor, reception2, ahmed..."
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold font-mono focus:outline-none focus:border-[#0B7B5E]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">نوع الصلاحية / الدور *</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-[#0B7B5E] cursor-pointer"
                >
                  <option value="DOCTOR">طبيب (Doctor) - فحص المرضى والروشتة</option>
                  <option value="RECEPTION">موظف استقبال (Reception) - الحجوزات والمدفوعات</option>
                  <option value="ADMIN">مدير النظام (Admin) - كافة الصلاحيات والتقارير</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">كلمة المرور *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="أدخل كلمة مرور قوية..."
                    className="w-full h-10 pr-3 pl-10 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#0B7B5E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0B7B5E] hover:bg-[#09634C] text-white font-bold cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء المستخدم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. مودال تعديل بيانات المستخدم */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#E3F5EE] text-[#0B7B5E]">
                  <Edit2 className="w-5 h-5" />
                </span>
                <h3 className="text-base font-black text-[#074C3A]">تعديل بيانات المستخدم</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#0B7B5E]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">اسم المستخدم (Username) *</label>
                <input
                  type="text"
                  required
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold font-mono focus:outline-none focus:border-[#0B7B5E]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">نوع الصلاحية / الدور *</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-[#0B7B5E] cursor-pointer"
                >
                  <option value="DOCTOR">طبيب (Doctor)</option>
                  <option value="RECEPTION">موظف استقبال (Reception)</option>
                  <option value="ADMIN">مدير النظام (Admin)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="userActiveCheck"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0B7B5E] focus:ring-0 cursor-pointer"
                >
                </input>
                <label htmlFor="userActiveCheck" className="font-bold text-slate-700 cursor-pointer">
                  الحساب نشط ومتاح لتسجيل الدخول
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0B7B5E] hover:bg-[#09634C] text-white font-bold cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. مودال تغيير كلمة المرور */}
      {isPasswordOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Lock className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-[#074C3A]">تغيير كلمة المرور</h3>
                  <p className="text-[11px] font-bold text-slate-500">للمستخدم: {selectedUser.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">كلمة المرور الجديدة *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="أدخل كلمة المرور الجديدة..."
                    className="w-full h-10 pr-3 pl-10 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#0B7B5E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">تأكيد كلمة المرور الجديدة *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="أعد كتابة كلمة المرور للتأكيد..."
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#0B7B5E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPasswordOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
