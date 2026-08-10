import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { technologiesApi, type Technology } from '../../api/services/TechnologiesApi';
import { Settings, Plus, Edit2, Trash2, Loader2, X } from 'lucide-react';
import '../ProjectManagement/ProjectManagement.css'; // Reusing styles

export default function TechnologyManagement() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technology | null>(null);
  const [techName, setTechName] = useState('');
  const [error, setError] = useState('');

  const { data: technologies = [], isLoading } = useQuery({
    queryKey: ['technologies'],
    queryFn: () => technologiesApi.findAll(),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => technologiesApi.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      closeModal();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create technology');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => technologiesApi.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      closeModal();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update technology');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => technologiesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!techName.trim()) {
      setError('Name is required');
      return;
    }
    if (editingTech) {
      updateMutation.mutate({ id: editingTech.id, name: techName });
    } else {
      createMutation.mutate(techName);
    }
  };

  const openModal = (tech?: Technology) => {
    if (tech) {
      setEditingTech(tech);
      setTechName(tech.name);
    } else {
      setEditingTech(null);
      setTechName('');
    }
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTech(null);
    setTechName('');
    setError('');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 className="spinner text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="project-management glass-panel">
      <div className="pm-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings className="text-primary" size={24} />
          <h2>Manage Technologies</h2>
        </div>
        <button className="add-btn" onClick={() => openModal()}>
          <Plus size={18} /> Add Technology
        </button>
      </div>

      <div className="table-container">
        <table className="pm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date Added</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {technologies.map((tech) => (
              <tr key={tech.id}>
                <td>{tech.name}</td>
                <td>{new Date(tech.createdAt).toLocaleDateString()}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      className="icon-btn outline" 
                      onClick={() => openModal(tech)}
                      title="Edit Technology"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="icon-btn outline delete" 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this technology?')) {
                          deleteMutation.mutate(tech.id);
                        }
                      }}
                      title="Delete Technology"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {technologies.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center">No technologies found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTech ? 'Edit Technology' : 'Add New Technology'}</h3>
              <button className="icon-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Technology Name</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={techName}
                    onChange={e => setTechName(e.target.value)}
                    placeholder="e.g., React, Python, AWS"
                    autoFocus
                  />
                </div>
                {error && <div className="error-message" style={{ color: '#ff6b6b', marginTop: '0.5rem', fontSize: '0.9rem' }}>{error}</div>}
              </div>
              <div className="modal-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="add-btn outline" onClick={closeModal}>Cancel</button>
                <button 
                  type="submit" 
                  className="add-btn" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Technology'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
