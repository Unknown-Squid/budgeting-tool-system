export default function UserCard({ user, onView, onEdit, onDelete }) {
  return (
    <div
      className="p-4 hover:bg-gray-50 cursor-pointer"
      onClick={onView}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-600">{user.email}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded ${
            user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {user.role}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-600 hover:text-red-700 text-sm cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
