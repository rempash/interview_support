import { FileText, Copy, CheckCircle, RotateCcw, Download } from 'lucide-react';
import { useState } from 'react';
import { transcriptionApi } from '../../api/services/TranscriptionApi';
import './TranscriptionDisplay.css';

interface Props {
  transcriptionData: any;
  onReset: () => void;
}

export default function TranscriptionDisplay({ transcriptionData, onReset }: Props) {
  const [copied, setCopied] = useState(false);
  const [rawTranscript, setRawTranscript] = useState<string | null>(transcriptionData.transcript || null);
  const [isLoadingRaw, setIsLoadingRaw] = useState(false);

  const fetchRawTranscript = async () => {
    try {
      setIsLoadingRaw(true);
      const data = await transcriptionApi.getRawTranscript(transcriptionData.id);
      setRawTranscript(data.transcript);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingRaw(false);
    }
  };

  const handleCopy = async () => {
    if (rawTranscript) {
      await navigator.clipboard.writeText(rawTranscript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const review = transcriptionData.review;

  return (
    <div className="transcription-container glass-panel">
      <div className="transcription-header">
        <div className="header-left">
          <FileText size={20} className="text-primary" />
          <h2>Interview Analysis</h2>
        </div>
        <div className="header-actions">
          <button className="icon-btn outline" onClick={onReset} title="Analyze another interview">
            <RotateCcw size={18} />
            <span>New</span>
          </button>
        </div>
      </div>
      
      <div className="transcription-content-wrapper">
        {review && (
          <div className="review-section">
            <h3 className="section-title">Senior Engineer Feedback ({transcriptionData.technology})</h3>
            
            <div className="review-grid">
              <div className="review-card good">
                <h4>What went well</h4>
                <ul>
                  {review.good?.length > 0 ? (
                    review.good.map((item: string, i: number) => <li key={i}>{item}</li>)
                  ) : (
                    <li>No positive points identified.</li>
                  )}
                </ul>
              </div>
              
              <div className="review-card bad">
                <h4>Areas for improvement</h4>
                <ul>
                  {review.bad?.length > 0 ? (
                    review.bad.map((item: string, i: number) => <li key={i}>{item}</li>)
                  ) : (
                    <li>No negative points identified.</li>
                  )}
                </ul>
              </div>
            </div>
            
            <div className="review-card practice">
              <h4>Recommended Practice Questions</h4>
              <ul>
                {review.practiceQuestions?.map((item: string, i: number) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>
        )}

        <div className="raw-transcript-section">
          <div className="section-header-row">
            <h3 className="section-title">Raw Transcript</h3>
            {rawTranscript ? (
              <button className="icon-btn small" onClick={handleCopy}>
                {copied ? <CheckCircle size={14} className="text-success" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            ) : (
              <button className="icon-btn small outline" onClick={fetchRawTranscript} disabled={isLoadingRaw}>
                <Download size={14} />
                <span>{isLoadingRaw ? 'Loading...' : 'Load Transcript'}</span>
              </button>
            )}
          </div>
          {rawTranscript && (
            <div className="transcript-box">
              <p>{rawTranscript}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
