import { useState, useEffect } from 'react';
import { admin, auth } from '../lib/api';

export function useAdminData(userPage = 1, searchTerm = '') {
  const [systemStats, setSystemStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, usersData] = await Promise.all([
          admin.getSystemStats(),
          admin.getAllUsers({ page: userPage, limit: 10, search: searchTerm })
        ]);
        setSystemStats(statsData);
        setUsers(usersData.users);
        setTotalPages(usersData.totalPages);
        setError(null);
      } catch (err) {
        console.error('Failed to load admin data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userPage, searchTerm]);

  const refreshData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        admin.getSystemStats(),
        admin.getAllUsers({ page: userPage, limit: 10, search: searchTerm })
      ]);
      setSystemStats(statsData);
      setUsers(usersData.users);
      setTotalPages(usersData.totalPages);
    } catch (err) {
      setError(err);
    }
  };

  return {
    systemStats,
    users,
    totalPages,
    loading,
    error,
    refreshData,
    setSystemStats,
    setUsers,
    setTotalPages
  };
}
