import React, { useEffect, useState } from 'react';
import usersService from '../services/modules/users';
import AdminPanel from './ui/AdminPanel';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ui/ToastProvider';

const ViewUsers = () => {
  const { adminToken } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    usersService
      .getAll(adminToken)
      .then((response) => setUsers(response.data))
      .catch((error) => console.error('Error fetching users:', error));
  }, [adminToken]);

  const handleDeleteUser = (id) => {
    usersService
      .deleteUser(id, adminToken)
      .then(() => {
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
        addToast('User deleted successfully', 'success');
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
        addToast('Failed to delete user', 'error');
      });
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <AdminPanel />
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      {users.length > 0 ? (
        <ul className="space-y-3">
          {users.map((user) => (
            <li key={user._id} className="p-4 border rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="text-sm text-gray-500">
                  {user.isverified ? 'Verified' : 'Not Verified'}
                </div>
              </div>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded"
                onClick={() => handleDeleteUser(user._id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No users available.</p>
      )}
    </div>
  );
};

export default ViewUsers;
