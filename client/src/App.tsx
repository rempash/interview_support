import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import ProjectManagement from './components/ProjectManagement/ProjectManagement';
import UploadVideo from './components/UploadVideo/UploadVideo';
import TranscriptionDisplay from './components/TranscriptionDisplay/TranscriptionDisplay';
import UserManagement from './components/UserManagement/UserManagement';
import ProjectDetails from './components/ProjectDetails/ProjectDetails';
import AssistInterview from './components/AssistInterview/AssistInterview';
import OutcomeViewer from './components/OutcomeViewer/OutcomeViewer';
import TechnologyManagement from './components/TechnologyManagement/TechnologyManagement';
import Layout from './components/Layout/Layout';
import './App.css';

function App() {
  const [transcriptionData, setTranscriptionData] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(JSON.parse(localStorage.getItem('user') || 'null'));

  const handleLogin = (newToken: string, loggedInUser: any) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setToken(newToken);
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setTranscriptionData(null);
  };

  return (
    <Routes>
      <Route element={<Layout token={token} user={user} onLogout={handleLogout} />}>
        {/* Public Route */}
        <Route path="/login" element={
          !token ? <Login onLoginSuccess={handleLogin} /> : <Navigate to="/" replace />
        } />

        {/* Protected Routes */}
        {token ? (
          <>
            <Route path="/" element={
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'rgba(255,255,255,0.5)' }}>
                <h2>Welcome. Please select an option from the sidebar.</h2>
              </div>
            } />
            <Route path="/transcription" element={
              <>
                {!transcriptionData && (
                  <UploadVideo 
                    onUploadStart={() => setIsProcessing(true)} 
                    onUploadSuccess={(data) => {
                      setTranscriptionData(data);
                      setIsProcessing(false);
                    }} 
                    onUploadError={() => setIsProcessing(false)}
                    isProcessing={isProcessing}
                    token={token!}
                  />
                )}

                {transcriptionData && (
                  <TranscriptionDisplay 
                    transcriptionData={transcriptionData} 
                    onReset={() => setTranscriptionData(null)} 
                  />
                )}
              </>
            } />
            <Route path="/users" element={
              user?.role === 'superuser' ? <UserManagement /> : <Navigate to="/" replace />
            } />
            <Route path="/technologies" element={
              user?.role === 'superuser' ? <TechnologyManagement /> : <Navigate to="/" replace />
            } />
            <Route path="/projects" element={<ProjectManagement />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/projects/:id/interview" element={<AssistInterview />} />
            <Route path="/transcriptions/:id" element={<OutcomeViewer />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Route>
    </Routes>
  );
}

export default App;
