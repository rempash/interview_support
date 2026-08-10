import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { transcriptionApi } from '../../api/services/TranscriptionApi';
import { projectsApi } from '../../api/services/ProjectsApi';
import { technologiesApi } from '../../api/services/TechnologiesApi';
import { UploadCloud, Loader2 } from 'lucide-react';
import './UploadVideo.css';

interface Props {
  onUploadStart: () => void;
  onUploadSuccess: (data: any) => void;
  onUploadError: (error: Error) => void;
  isProcessing: boolean;
  token: string;
}

export default function UploadVideo({ onUploadStart, onUploadSuccess, onUploadError, isProcessing }: Props) {
  const location = useLocation();
  const [technology, setTechnology] = useState('');
  const [projectId, setProjectId] = useState(location.state?.projectId || '');

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.findAll(),
  });

  const { data: technologies = [] } = useQuery({
    queryKey: ['technologies'],
    queryFn: () => technologiesApi.findAll(),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => transcriptionApi.uploadVideo(formData),
    onSuccess: (data) => {
      onUploadSuccess(data);
    },
    onError: (error: any) => {
      console.error('Upload failed', error);
      onUploadError(error);
    }
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    onUploadStart();

    const formData = new FormData();
    formData.append('video', file);
    formData.append('technology', technology);
    formData.append('projectId', projectId);

    uploadMutation.mutate(formData);
  }, [onUploadStart, technology, projectId, uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv'],
      'video/x-matroska': ['.mkv']
    },
    maxFiles: 1,
    disabled: isProcessing || !projectId
  });

  return (
    <div className="upload-container glass-panel">
      
      {!isProcessing && (
        <div className="settings-panel" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <label htmlFor="project-select">Project:</label>
            <select 
              id="project-select" 
              value={projectId} 
              onChange={e => setProjectId(e.target.value)}
              className="tech-select"
            >
              <option value="" disabled>Select a project</option>
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tech-select">Technology Focus:</label>
            <select 
              id="tech-select" 
              value={technology} 
              onChange={e => setTechnology(e.target.value)}
              className="tech-select"
            >
              <option value="" disabled>Select a technology</option>
              {technologies.map((t: any) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''} ${isProcessing ? 'disabled' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="processing-state">
            <Loader2 className="spinner text-primary" size={48} />
            <h3>Processing Interview...</h3>
            <p>This might take a moment. We're transcribing the audio and analyzing your performance.</p>
          </div>
        ) : (
          <div className="idle-state">
            <div className="upload-icon-circle">
              <UploadCloud size={32} className="text-primary" />
            </div>
            <h3>{isDragActive ? 'Drop video here' : 'Click or drag interview video to upload'}</h3>
            {!projectId && <p style={{ color: '#ff6b6b' }}>Please select a project first</p>}
            {projectId && <p>Supports MP4, MOV, AVI, WEBM, MKV</p>}
            <button className="upload-btn" type="button">Select File</button>
          </div>
        )}
      </div>
      {uploadMutation.isError && (
        <div className="error-message">
          {(uploadMutation.error as any)?.response?.data?.message || 'Transcription failed. Please try again.'}
        </div>
      )}
    </div>
  );
}
