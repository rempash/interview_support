import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { transcriptionApi } from '../../api/services/TranscriptionApi';
import TranscriptionDisplay from '../TranscriptionDisplay/TranscriptionDisplay';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function OutcomeViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: transcriptionData, isLoading, isError } = useQuery({
    queryKey: ['transcription', id],
    queryFn: () => transcriptionApi.findById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: '#fff' }}>
        <Loader2 className="spinner text-primary" size={48} />
      </div>
    );
  }

  if (isError || !transcriptionData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ff6b6b' }}>
        Failed to load transcription data.
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}
      >
        <ArrowLeft size={16} /> Back to Project
      </button>
      <TranscriptionDisplay 
        transcriptionData={transcriptionData} 
        onReset={() => navigate(-1)} 
      />
    </div>
  );
}
