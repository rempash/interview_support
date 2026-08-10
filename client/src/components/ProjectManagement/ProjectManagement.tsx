import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../../api/services/ProjectsApi';
import { Trash2, Edit2, Plus, ArrowLeft, FolderKanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../ProjectManagement/ProjectManagement.css';

export default function ProjectManagement() {
  const queryClient = useQueryClient();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isSuperuser = user?.role === 'superuser';
  
  const navigate = useNavigate();

  const { data: projects = [], isLoading, isError, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.findAll(),
  });

  const saveMutation = useMutation({
    mutationFn: (name: string) => {
      if (editingId) {
        return projectsApi.update(editingId, name);
      } else {
        return projectsApi.create(name);
      }
    },
    onSuccess: () => {
      setShowForm(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formName.length < 2) return;
    saveMutation.mutate(formName);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    deleteMutation.mutate(id);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (project: Project) => {
    setEditingId(project.id);
    setFormName(project.name);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormName('');
  };

  return (
    <div className="project-management glass-panel">
      <div className="pm-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FolderKanban size={24} className="text-primary" />
          <h2>{isSuperuser ? 'Project Management' : 'Projects'}</h2>
        </div>
        {isSuperuser && (
          <button className="add-btn" onClick={openAddForm}>
            <Plus size={18} /> Add Project
          </button>
        )}
      </div>

      {isError && <div className="error-message">{(error as any)?.response?.data?.message || 'Failed to fetch projects'}</div>}
      {saveMutation.isError && <div className="error-message">{(saveMutation.error as any)?.response?.data?.message || 'Failed to save project'}</div>}
      {deleteMutation.isError && <div className="error-message">{(deleteMutation.error as any)?.response?.data?.message || 'Failed to delete project'}</div>}

      {showForm && (
        <div className="pm-form-overlay">
          <div className="pm-form-card glass-panel">
            <h3>{editingId ? 'Edit Project' : 'Create Project'}</h3>
            <form onSubmit={handleSave}>
              <div className="input-group">
                <label>Project Name</label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={e => setFormName(e.target.value)} 
                  required 
                  minLength={2}
                  placeholder="e.g. My Awesome Project"
                />
              </div>
              
              <div className="pm-form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)} disabled={saveMutation.isPending}>Cancel</button>
                <button type="submit" className="save-btn" disabled={saveMutation.isPending || formName.length < 2}>
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        {isLoading ? (
          <p>Loading projects...</p>
        ) : (
          <table className="pm-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Created At</th>
                <th>View</th>
                {isSuperuser && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="action-btn" 
                      onClick={() => navigate(`/projects/${p.id}`)}
                      title="View Outcomes"
                      style={{ color: '#38bdf8', border: '1px solid #38bdf8', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', background: 'transparent' }}
                    >
                      View Outcomes
                    </button>
                  </td>
                  {isSuperuser && (
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn edit" onClick={() => openEditForm(p)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="action-btn delete" onClick={() => handleDelete(p.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={isSuperuser ? 3 : 2} className="text-center">No projects found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
