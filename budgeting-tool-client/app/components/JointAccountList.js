export default function JointAccountList({ jointAccounts, users, onUnlink }) {
  if (!jointAccounts || jointAccounts.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No joint accounts linked</p>
        <p className="text-sm text-gray-400 mt-1">Link two users to create a joint account</p>
      </div>
    );
  }

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.name} (${user.email})` : 'Unknown User';
  };

  return (
    <div className="space-y-3">
      {jointAccounts.map((link) => (
        <div key={link.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-semibold text-gray-900">Joint Account</span>
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <div>👤 {getUserName(link.user1Id)}</div>
                <div className="text-gray-400">↕️</div>
                <div>👤 {getUserName(link.user2Id)}</div>
              </div>
            </div>
            <button
              onClick={() => onUnlink(link.id)}
              className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
            >
              Unlink
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
