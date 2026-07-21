'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import StatsCards from '@/components/charts/StatsCards';
import { adminApi } from '@/lib/api';
import { formatDate, formatConfidence } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Trash2, User, Image as ImageIcon } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'predictions'>('users');
  const [stats, setStats] = useState<any>({ total_users: 0, total_predictions: 0, authentic_count: 0, forged_count: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, predsRes] = await Promise.all([
        adminApi.getAnalytics(),
        adminApi.getUsers(),
        adminApi.getAllPredictions()
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPredictions(predsRes.data);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      await adminApi.deleteUser(deleteUserId);
      toast.success('User deleted');
      setUsers(users.filter(u => u.id !== deleteUserId));
    } catch (err) {
      toast.error('Failed to delete user');
    } finally {
      setDeleteUserId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-outfit tracking-tight text-secondary-400">Admin Control Panel</h1>
        <p className="text-dark-400 mt-1">Manage users and monitor system-wide activity.</p>
      </div>

      <StatsCards 
        total={stats.total_predictions} 
        authentic={stats.authentic_count} 
        forged={stats.forged_count} 
      />

      <div className="flex bg-dark-900 rounded-xl p-1 max-w-md border border-white/5">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'users' ? 'bg-secondary-500 text-white shadow-sm' : 'text-dark-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" /> Users
        </button>
        <button
          onClick={() => setActiveTab('predictions')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'predictions' ? 'bg-secondary-500 text-white shadow-sm' : 'text-dark-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Predictions
        </button>
      </div>

      <Card className="p-0 border-white/10 shadow-xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex justify-center p-12"><Spinner className="w-8 h-8 text-secondary-500" /></div>
        ) : activeTab === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-dark-300">
              <thead className="text-xs uppercase bg-dark-900/50 text-dark-400">
                <tr>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-6 py-3 font-medium text-white">{u.username}</td>
                    <td className="px-6 py-3">{u.email}</td>
                    <td className="px-6 py-3">
                      <Badge variant={u.is_admin ? 'warning' : 'default'}>
                        {u.is_admin ? 'Admin' : 'User'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">{formatDate(u.created_at)}</td>
                    <td className="px-6 py-3 text-right">
                      {!u.is_admin && (
                        <Button variant="ghost" size="sm" className="p-2 hover:bg-red-500/10 hover:text-red-500" onClick={() => setDeleteUserId(u.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-dark-300">
              <thead className="text-xs uppercase bg-dark-900/50 text-dark-400">
                <tr>
                  <th className="px-6 py-4">User ID</th>
                  <th className="px-6 py-4">Filename</th>
                  <th className="px-6 py-4">Result</th>
                  <th className="px-6 py-4">Conf.</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-6 py-3 truncate max-w-[100px] text-xs font-mono">{p.user_id}</td>
                    <td className="px-6 py-3 text-white truncate max-w-[150px]">{p.original_filename}</td>
                    <td className="px-6 py-3">
                       <Badge variant={p.result === 'authentic' ? 'success' : 'danger'}>{p.result.toUpperCase()}</Badge>
                    </td>
                    <td className="px-6 py-3">{formatConfidence(p.confidence)}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={!!deleteUserId} onClose={() => setDeleteUserId(null)} title="Delete User">
        <p className="text-dark-300 mb-6">Are you sure you want to delete this user? All their data and predictions will be permanently removed.</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteUserId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteUser}>Delete User</Button>
        </div>
      </Modal>
    </div>
  );
}
