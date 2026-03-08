'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { admin, auth } from '../lib/api';
import UserCard from '../components/UserCard';
import UserForm from '../components/UserForm';
import UserDetails from '../components/UserDetails';
import StatsCard from '../components/StatsCard';
import Modal from '../components/Modal';
import JointAccountModal from '../components/JointAccountModal';
import JointAccountList from '../components/JointAccountList';
import InputField from '../components/InputField';
import { SkeletonCard, SkeletonList } from '../components/SkeletonLoader';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbar, setSnackbar] = useState({ show: false, message: '' });
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'user' });
  const [editUser, setEditUser] = useState({ email: '', name: '', role: 'user' });
  const [showJointAccountModal, setShowJointAccountModal] = useState(false);
  const [jointAccounts, setJointAccounts] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, page, searchTerm]);

  const checkAuth = async () => {
    try {
      const userData = await auth.me();
      if (userData.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setUser(userData);
    } catch (error) {
      router.push('/login');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, jointAccountsData] = await Promise.all([
        admin.getSystemStats(),
        admin.getAllUsers({ page, limit: 10, search: searchTerm }),
        admin.getJointAccounts().catch(() => []) // Fallback to empty array if endpoint doesn't exist yet
      ]);
      setSystemStats(statsData);
      setUsers(usersData.users);
      setTotalPages(usersData.totalPages);
      setJointAccounts(Array.isArray(jointAccountsData) ? jointAccountsData : []);
    } catch (error) {
      showSnackbar(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const [userData, statsData] = await Promise.all([
        admin.getUserById(userId),
        admin.getUserStats(userId)
      ]);
      setSelectedUser(userData);
      setUserStats(statsData);
    } catch (error) {
      showSnackbar(error.message || 'Failed to load user details');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await admin.createUser(newUser);
      showSnackbar('User created successfully');
      setShowCreateModal(false);
      setNewUser({ email: '', password: '', name: '', role: 'user' });
      loadData();
    } catch (error) {
      showSnackbar(error.message || 'Failed to create user');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const updates = {};
      if (editUser.email) updates.email = editUser.email;
      if (editUser.name) updates.name = editUser.name;
      if (editUser.role) updates.role = editUser.role;
      if (editUser.password) updates.password = editUser.password;

      await admin.updateUser(selectedUser.id, updates);
      showSnackbar('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      loadData();
    } catch (error) {
      showSnackbar(error.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      await admin.deleteUser(userId);
      showSnackbar('User deleted successfully');
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(null);
        setUserStats(null);
      }
      loadData();
    } catch (error) {
      showSnackbar(error.message || 'Failed to delete user');
    }
  };

  const handleLinkJointAccount = async (user1Id, user2Id) => {
    try {
      await admin.linkJointAccount(user1Id, user2Id);
      showSnackbar('Joint account linked successfully');
      loadData();
    } catch (error) {
      showSnackbar(error.message || 'Failed to link joint account');
    }
  };

  const handleUnlinkJointAccount = async (linkId) => {
    if (!confirm('Are you sure you want to unlink this joint account?')) {
      return;
    }
    try {
      await admin.unlinkJointAccount(linkId);
      showSnackbar('Joint account unlinked successfully');
      loadData();
    } catch (error) {
      showSnackbar(error.message || 'Failed to unlink joint account');
    }
  };

  const showSnackbar = (message) => {
    setSnackbar({ show: true, message });
    setTimeout(() => setSnackbar({ show: false, message: '' }), 3000);
  };

  if (loading && !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage users and system</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => setShowJointAccountModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer"
            >
              Link Joint Account
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Create User
            </button>
          </div>
        </div>

        {/* System Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : systemStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatsCard label="Total Users" value={systemStats.totalUsers} color="gray" />
            <StatsCard label="Admins" value={systemStats.totalAdmins} color="gray" />
            <StatsCard label="Total Budgets" value={systemStats.totalBudgets} color="gray" />
            <StatsCard label="Total Transactions" value={systemStats.totalTransactions} color="gray" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Users</h2>
                <InputField
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-auto"
                />
              </div>
            </div>
            {loading ? (
              <SkeletonList />
            ) : (
              <>
                <div className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <UserCard
                      key={u.id}
                      user={u}
                      onView={() => handleViewUser(u.id)}
                      onEdit={() => {
                        setSelectedUser(u);
                        setEditUser({ email: u.email, name: u.name, role: u.role, password: '' });
                        setShowEditModal(true);
                      }}
                      onDelete={() => handleDeleteUser(u.id)}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-gray-600">Page {page} of {totalPages}</span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* User Details */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
            </div>
            <UserDetails user={selectedUser} stats={userStats} />
          </div>
        </div>

        {/* Joint Accounts Section */}
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Joint Accounts</h2>
            <p className="text-sm text-gray-600 mt-1">Manage linked user accounts that share budgets and transactions</p>
          </div>
          <div className="p-4">
            {loading ? (
              <SkeletonList />
            ) : (
              <JointAccountList
                jointAccounts={jointAccounts}
                users={users}
                onUnlink={handleUnlinkJointAccount}
              />
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        title="Create User"
        show={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewUser({ email: '', password: '', name: '', role: 'user' });
        }}
      >
        <UserForm
          user={newUser}
          onSubmit={handleCreateUser}
          onCancel={() => {
            setShowCreateModal(false);
            setNewUser({ email: '', password: '', name: '', role: 'user' });
          }}
          onChange={setNewUser}
          isEdit={false}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
      >
        {selectedUser && (
          <UserForm
            user={editUser}
            onSubmit={handleEditUser}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onChange={setEditUser}
            isEdit={true}
          />
        )}
      </Modal>

      {/* Joint Account Modal */}
      <JointAccountModal
        show={showJointAccountModal}
        onClose={() => setShowJointAccountModal(false)}
        users={users}
        onLink={handleLinkJointAccount}
        currentLinkedUsers={jointAccounts}
      />

      {/* Snackbar */}
      {snackbar.show && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg">
          {snackbar.message}
        </div>
      )}
    </div>
  );
}
