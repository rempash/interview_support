import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Video, Loader2, UploadCloud, MessageSquare, RefreshCw, X } from 'lucide-react';
import { questionsApi } from '../../api/services/QuestionsApi';
import { technologiesApi, type Technology } from '../../api/services/TechnologiesApi';
import '../ProjectManagement/ProjectManagement.css'; // Reuse table styles
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { projectsApi } from '../../api/services/ProjectsApi';
import { transcriptionApi } from '../../api/services/TranscriptionApi';

export default function ProjectDetails() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [user] = useState<any | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  const isManagerOrSuperuser = user?.role === 'manager' || user?.role === 'superuser';
  
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [availableTechs, setAvailableTechs] = useState<Technology[]>([]);
  const [selectedTechToGenerate, setSelectedTechToGenerate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.findAll(),
  });
  
  const project = projects.find((p: any) => p.id === projectId);

  const { data: transcriptions = [], isLoading: isLoadingTranscriptions, isError: isErrorTranscriptions } = useQuery({
    queryKey: ['transcriptions', projectId],
    queryFn: () => transcriptionApi.findByProject(projectId!),
    enabled: !!projectId,
  });

  useEffect(() => {
    if (isGenerateModalOpen && availableTechs.length === 0) {
      technologiesApi.findAll().then(techs => {
        setAvailableTechs(techs);
        if (techs.length > 0) setSelectedTechToGenerate(techs[0].name);
      }).catch(err => console.error('Failed to load technologies', err));
    }
  }, [isGenerateModalOpen, availableTechs.length]);

  const handleGenerateQuestions = async () => {
    if (!selectedTechToGenerate) return;
    setIsGenerating(true);
    try {
      const res = await questionsApi.syncQuestions(projectId!, selectedTechToGenerate);
      alert(`Successfully generated ${res.count} questions for ${selectedTechToGenerate}`);
      setIsGenerateModalOpen(false);
    } catch (err) {
      alert('Failed to generate questions. Ensure there are transcriptions for this technology.');
    } finally {
      setIsGenerating(false);
    }
  };

  const projectTechnologies = Array.from(new Set(transcriptions.map((t: any) => t.technology).filter(Boolean))) as string[];

  return (
    <div className="project-management glass-panel" style={{ marginTop: '2rem' }}>
      <div className="pm-header">
        <button className="back-btn" onClick={() => navigate('/projects')}>
          <ArrowLeft size={18} /> Back to Projects
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2>{project ? project.name : 'Project Details'} Outcomes</h2>
          {isManagerOrSuperuser && (
            <button 
              className="add-btn outline" 
              onClick={() => setIsGenerateModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid #10b981', color: '#10b981' }}
            >
              <RefreshCw size={18} /> Generate Questions
            </button>
          )}
          {isManagerOrSuperuser && (
            <button 
              className="add-btn" 
              onClick={() => navigate('/transcription', { state: { projectId } })}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <UploadCloud size={18} /> Upload Transcription
            </button>
          )}
        </div>
      </div>

      <div className="table-container">
        {isLoadingTranscriptions ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader2 className="spinner text-primary" size={32} />
          </div>
        ) : isErrorTranscriptions ? (
          <p className="error-message">Failed to load outcomes.</p>
        ) : (
          <table className="pm-table">
            <thead>
              <tr>
                <th>Video Filename</th>
                <th>Technology</th>
                <th>Date Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transcriptions.map((t: any) => (
                <tr key={t.id}>
                  <td>{t.originalFilename}</td>
                  <td>{t.technology}</td>
                  <td>{new Date(t.createdAt).toLocaleString()}</td>
                  <td>
                    <button 
                      className="add-btn" 
                      onClick={() => navigate(`/transcriptions/${t.id}`)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                      <Video size={16} /> View Outcome
                    </button>
                  </td>
                </tr>
              ))}
              {transcriptions.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center">No transcriptions found for this project.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {projectTechnologies.length > 0 && !isLoadingTranscriptions && !isErrorTranscriptions && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Practice Modes</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {projectTechnologies.map(tech => (
              <div key={tech} className="glass-panel" style={{ padding: '1rem', minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 style={{ margin: 0 }}>{tech}</h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button 
                    className="add-btn outline" 
                    onClick={() => navigate(`/projects/${projectId}/interview?tech=${encodeURIComponent(tech)}`)}
                    style={{ flex: 1, padding: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <MessageSquare size={16} style={{marginRight: '4px'}} /> Start Interview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isGenerateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Generate Practice Questions</h3>
              <button className="icon-btn" onClick={() => setIsGenerateModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Select a technology to aggregate practice questions from the project's transcriptions into the cache.
              </p>
              <div className="form-group">
                <label>Technology</label>
                <select 
                  className="form-control" 
                  value={selectedTechToGenerate} 
                  onChange={(e) => setSelectedTechToGenerate(e.target.value)}
                >
                  {availableTechs.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                className="add-btn outline" 
                onClick={() => setIsGenerateModalOpen(false)}
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button 
                className="add-btn" 
                onClick={handleGenerateQuestions}
                disabled={isGenerating || !selectedTechToGenerate}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {isGenerating ? <Loader2 size={16} className="spinner" /> : <RefreshCw size={16} />}
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
