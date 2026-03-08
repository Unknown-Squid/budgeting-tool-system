import { useState } from 'react';
import InputField from './InputField';

export default function JointAccountModal({ show, onClose, users, onLink, currentLinkedUsers = [] }) {
  const [selectedUser1, setSelectedUser1] = useState('');
  const [selectedUser2, setSelectedUser2] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUser1 && selectedUser2 && selectedUser1 !== selectedUser2) {
      onLink(selectedUser1, selectedUser2);
      setSelectedUser1('');
      setSelectedUser2('');
      onClose();
    }
  };

  // Get users that are not already linked
  const availableUsers = users.filter(u => 
    !currentLinkedUsers.some(link => 
      (link.user1Id === u.id || link.user2Id === u.id) && 
      (link.user1Id !== selectedUser1 && link.user2Id !== selectedUser1) &&
      (link.user1Id !== selectedUser2 && link.user2Id !== selectedUser2)
    )
  );

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${show ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Link Joint Account</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User 1</label>
            <select
              value={selectedUser1}
              onChange={(e) => setSelectedUser1(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white cursor-pointer"
            >
              <option value="">Select User 1</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User 2</label>
            <select
              value={selectedUser2}
              onChange={(e) => setSelectedUser2(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white cursor-pointer"
            >
              <option value="">Select User 2</option>
              {availableUsers
                .filter(u => u.id !== selectedUser1)
                .map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
            </select>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> When two users are linked, they can:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>See each other's budgets and transactions</li>
                <li>Create and edit budgets together</li>
                <li>Share financial data</li>
              </ul>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Link Accounts
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
