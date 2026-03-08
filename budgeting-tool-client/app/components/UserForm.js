import InputField from './InputField';

export default function UserForm({ user, onSubmit, onCancel, onChange, isEdit = false }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <InputField
        label="Name"
        type="text"
        placeholder="Name"
        required
        value={user?.name || ''}
        onChange={(e) => onChange({ ...user, name: e.target.value })}
      />
      <InputField
        label="Email"
        type="email"
        placeholder="Email"
        required
        value={user?.email || ''}
        onChange={(e) => onChange({ ...user, email: e.target.value })}
      />
      <InputField
        label={isEdit ? "New Password (leave blank to keep current)" : "Password"}
        type="password"
        placeholder={isEdit ? "New Password (leave blank to keep current)" : "Password"}
        required={!isEdit}
        value={user?.password || ''}
        onChange={(e) => onChange({ ...user, password: e.target.value })}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select
          value={user?.role || 'user'}
          onChange={(e) => onChange({ ...user, role: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white cursor-pointer"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          {isEdit ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
