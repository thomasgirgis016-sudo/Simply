import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  Award,
  Crown,
  Key,
  Users,
  Filter,
  CheckCheck
} from 'lucide-react';
import { UserAccount, AccountStatus, UserRole, GradeLevel, ExamBoard, TargetGrade } from '../types';
import {
  getAllUsers,
  approveUser,
  rejectUser,
  toggleUserRole,
  deleteUser,
  approveAllPendingUsers,
  createPreApprovedUser
} from '../services/auth';

interface AdminDashboardProps {
  currentUser: UserAccount;
  onRefreshUser?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onRefreshUser,
}) => {
  const [users, setUsers] = useState<UserAccount[]>(() => getAllUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Add Account Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Password123!');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newGrade, setNewGrade] = useState<GradeLevel>('Year 11 / Grade 10 (IGCSE Exam Yr)');
  const [newBoard, setNewBoard] = useState<ExamBoard>('Both');
  const [newTarget, setNewTarget] = useState<TargetGrade>('9 / A*');
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const reloadUsers = () => {
    setUsers(getAllUsers());
    if (onRefreshUser) onRefreshUser();
  };

  useEffect(() => {
    reloadUsers();
  }, []);

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const pending = users.filter((u) => u.status === 'pending').length;
    const approved = users.filter((u) => u.status === 'approved' || !u.status).length;
    const admins = users.filter((u) => u.role === 'admin').length;
    return { total, pending, approved, admins };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'approved' && (u.status === 'approved' || !u.status)) ||
        u.status === statusFilter;

      const matchesRole =
        roleFilter === 'all' ||
        (roleFilter === 'student' && (!u.role || u.role === 'student')) ||
        u.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchQuery, statusFilter, roleFilter]);

  const handleApprove = (u: UserAccount) => {
    const ok = approveUser(u.id, currentUser.email);
    if (ok) {
      reloadUsers();
      showToast(`Account for ${u.name} (${u.email}) approved successfully!`);
    }
  };

  const handleReject = (u: UserAccount) => {
    if (u.id === currentUser.id) {
      alert("You cannot suspend your own admin account.");
      return;
    }
    const ok = rejectUser(u.id);
    if (ok) {
      reloadUsers();
      showToast(`Account for ${u.name} suspended.`);
    }
  };

  const handleToggleRole = (u: UserAccount) => {
    if (u.id === currentUser.id) {
      alert("You cannot remove your own admin role.");
      return;
    }
    const ok = toggleUserRole(u.id);
    if (ok) {
      reloadUsers();
      showToast(`Role updated for ${u.name}.`);
    }
  };

  const handleDelete = (u: UserAccount) => {
    if (u.id === currentUser.id) {
      alert("You cannot delete your own admin account.");
      return;
    }
    if (confirm(`Are you sure you want to permanently delete account: ${u.email}?`)) {
      const ok = deleteUser(u.id);
      if (ok) {
        reloadUsers();
        showToast(`Account ${u.email} permanently removed.`);
      }
    }
  };

  const handleApproveAll = () => {
    const count = approveAllPendingUsers(currentUser.email);
    reloadUsers();
    showToast(`Approved ${count} pending student account${count === 1 ? '' : 's'}!`);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setIsAdding(true);

    try {
      const res = await createPreApprovedUser({
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
        grade: newGrade,
        board: newBoard,
        targetGrade: newTarget,
        adminEmail: currentUser.email,
      });

      if (res.success) {
        reloadUsers();
        setIsAddModalOpen(false);
        setNewName('');
        setNewEmail('');
        showToast(`Account for ${res.user?.name} created & pre-approved!`);
      } else {
        setAddError(res.error || 'Failed to create account.');
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fadeIn pb-12">
      {/* Toast Alert */}
      {actionSuccessMsg && (
        <div className="fixed top-20 right-4 z-50 rounded-2xl border border-emerald-500/40 bg-emerald-950/90 px-4 py-3 text-xs font-bold text-emerald-200 shadow-2xl backdrop-blur-md flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>Simply IGCSE Administrative Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Account Management & Student Approvals
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Review new registrations, accept pending student accounts, assign admin privileges, and manage curriculum access.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={reloadUsers}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
              title="Refresh list"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-purple-500 transition cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>New Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Accounts</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1 font-mono">{metrics.total}</div>
          <span className="text-[10px] text-slate-500">Registered users</span>
        </div>

        <div className={`rounded-2xl border p-4 shadow-md transition ${
          metrics.pending > 0
            ? 'border-amber-500/50 bg-amber-950/20 ring-1 ring-amber-500/30'
            : 'border-slate-800 bg-slate-900/80'
        }`}>
          <div className="flex items-center justify-between text-xs font-medium text-amber-300">
            <span>Pending Approvals</span>
            <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-amber-300 mt-1 font-mono">{metrics.pending}</div>
          <span className="text-[10px] text-amber-400/80">Requires your review</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Students</span>
            <UserCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{metrics.approved}</div>
          <span className="text-[10px] text-slate-500">Full tool access</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Administrators</span>
            <Crown className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 mt-1 font-mono">{metrics.admins}</div>
          <span className="text-[10px] text-slate-500">System managers</span>
        </div>
      </div>

      {/* Batch Approval Banner if Pending Accounts Exist */}
      {metrics.pending > 0 && (
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/30 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {metrics.pending} student account{metrics.pending === 1 ? '' : 's'} waiting for approval
              </h4>
              <p className="text-xs text-amber-200/80">
                These students cannot access study tools or past papers until approved.
              </p>
            </div>
          </div>

          <button
            onClick={handleApproveAll}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition cursor-pointer shadow-md shrink-0"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Approve All ({metrics.pending})</span>
          </button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or email..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <span className="text-slate-400 font-semibold mr-1">Status:</span>
            {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition cursor-pointer shrink-0 ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <span className="text-slate-400 font-semibold mr-1">Role:</span>
            {(['all', 'student', 'admin'] as const).map((rl) => (
              <button
                key={rl}
                onClick={() => setRoleFilter(rl)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition cursor-pointer shrink-0 ${
                  roleFilter === rl
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {rl === 'all' ? 'All' : rl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table / List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Registered Accounts ({filteredUsers.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Current Admin: <strong className="text-slate-300">{currentUser.email}</strong>
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            No accounts matched your filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredUsers.map((u) => {
              const isPending = u.status === 'pending';
              const isApproved = u.status === 'approved' || !u.status;
              const isRejected = u.status === 'rejected' || u.status === 'suspended';
              const isAdmin = u.role === 'admin';
              const isSelf = u.id === currentUser.id;

              return (
                <div
                  key={u.id}
                  className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                    isPending ? 'bg-amber-950/10' : 'hover:bg-slate-900'
                  }`}
                >
                  {/* Left: User Details */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm uppercase ${
                        isAdmin
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                          : isPending
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {isAdmin ? <Crown className="h-5 w-5" /> : u.name.charAt(0)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{u.name}</span>
                        {isSelf && (
                          <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] font-bold text-slate-300">
                            YOU
                          </span>
                        )}
                        {/* Status Badge */}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            isPending
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
                              : isApproved
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {isPending ? 'Pending Approval' : isApproved ? 'Active Student' : 'Suspended'}
                        </span>

                        {/* Role Badge */}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            isAdmin
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {isAdmin ? 'Admin' : 'Student'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 mt-0.5 font-mono truncate">
                        {u.email}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
                        <span>{u.grade?.split('(')[0] || 'Year 11'}</span>
                        <span>•</span>
                        <span>Board: {u.board || 'Both'}</span>
                        <span>•</span>
                        <span className="text-amber-300 font-semibold">Goal: {u.targetGrade || '9 / A*'}</span>
                        <span>•</span>
                        <span className="text-slate-400">
                          Joined {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                    {/* Approve Button */}
                    {isPending && (
                      <button
                        onClick={() => handleApprove(u)}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-sm cursor-pointer"
                        title="Accept & activate student account"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Accept Account</span>
                      </button>
                    )}

                    {/* Re-activate if rejected */}
                    {isRejected && (
                      <button
                        onClick={() => handleApprove(u)}
                        className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Reactivate</span>
                      </button>
                    )}

                    {/* Suspend / Reject button */}
                    {isApproved && !isSelf && (
                      <button
                        onClick={() => handleReject(u)}
                        className="rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition cursor-pointer"
                        title="Suspend access"
                      >
                        Suspend
                      </button>
                    )}

                    {/* Role toggle button */}
                    {!isSelf && (
                      <button
                        onClick={() => handleToggleRole(u)}
                        className={`rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                          isAdmin
                            ? 'border-purple-500/30 bg-purple-950/40 text-purple-300 hover:bg-purple-900/50'
                            : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white'
                        }`}
                        title={isAdmin ? 'Demote to regular student' : 'Grant Administrator privileges'}
                      >
                        {isAdmin ? 'Make Student' : 'Make Admin'}
                      </button>
                    )}

                    {/* Delete button */}
                    {!isSelf && (
                      <button
                        onClick={() => handleDelete(u)}
                        className="rounded-xl p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete account permanently"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Pre-Approved Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-400 border border-indigo-500/30">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Enroll New Student Account</h3>
                <p className="text-xs text-slate-400">Pre-approved with immediate access</p>
              </div>
            </div>

            {addError && (
              <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300">
                {addError}
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="alex.morgan@school.edu"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Temporary Password</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Account Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Target Grade</label>
                  <select
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value as TargetGrade)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="9 / A*">9 / A*</option>
                    <option value="8 / A*">8 / A*</option>
                    <option value="7 / A">7 / A</option>
                    <option value="6 / B">6 / B</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md"
                >
                  {isAdding ? 'Creating...' : 'Enroll Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
