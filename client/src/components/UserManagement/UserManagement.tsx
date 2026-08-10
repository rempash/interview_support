import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, type User } from '../../api/services/UsersApi';
import { Trash2, Edit2, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './UserManagement.css';

// No token needed, handled by Api interceptor

export default function UserManagement() {
  const queryClient = useQueryClient();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('developer');
  
  const navigate = useNavigate();

  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.findAll(),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editingId) {
        return usersApi.update({ id: editingId, ...payload });
      } else {
        return usersApi.create(payload);
      }
    },
    onSuccess: () => {
      setShowForm(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { username: formUsername, role: formRole };
    if (formPassword) payload.password = formPassword;
    saveMutation.mutate(payload);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    deleteMutation.mutate(id);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (user: User) => {
    setEditingId(user.id);
    setFormUsername(user.username);
    setFormPassword('');
    setFormRole(user.role);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormUsername('');
    setFormPassword('');
    setFormRole('developer');
  };

  return (
    <div className="user-management glass-panel">
      <div className="um-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Back
        </button>
        <h2>User Management</h2>
        <button className="add-btn" onClick={openAddForm}>
          <Plus size={18} /> Add User
        </button>
      </div>

      {isError && <div className="error-message">{(error as any)?.response?.data?.message || 'Failed to fetch users'}</div>}
      {saveMutation.isError && <div className="error-message">{(saveMutation.error as any)?.response?.data?.message || 'Failed to save user'}</div>}
      {deleteMutation.isError && <div className="error-message">{(deleteMutation.error as any)?.response?.data?.message || 'Failed to delete user'}</div>}

      {showForm && (
        <div className="um-form-overlay">
          <div className="um-form-card glass-panel">
            <h3>{editingId ? 'Edit User' : 'Create User'}</h3>
            <form onSubmit={handleSave}>
              <div className="input-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={formUsername} 
                  onChange={e => setFormUsername(e.target.value)} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Password {editingId && <span className="text-muted">(Leave blank to keep unchanged)</span>}</label>
                <input 
                  type="password" 
                  value={formPassword} 
                  onChange={e => setFormPassword(e.target.value)} 
                  required={!editingId} 
                />
              </div>
              <div className="input-group">
                <label>Role</label>
                <select value={formRole} onChange={e => setFormRole(e.target.value)}>
                  <option value="developer">Developer</option>
                  <option value="manager">Manager</option>
                  <option value="superuser">Superuser</option>
                </select>
              </div>
              
              <div className="um-form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)} disabled={saveMutation.isPending}>Cancel</button>
                <button type="submit" className="save-btn" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        {isLoading ? (
          <p>Loading users...</p>
        ) : (
          <table className="um-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit" onClick={() => openEditForm(u)} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(u.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
