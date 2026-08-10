import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Video, LogOut, Users, FolderKanban, Settings } from 'lucide-react';

interface LayoutProps {
  token: string | null;
  user: any;
  onLogout: () => void;
}

export default function Layout({ token, user, onLogout }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-container">
      <aside className="app-sidebar">
        <div className="logo-container" style={{ marginBottom: '1.5rem' }}>
          <div className="icon-wrapper">
            <Video size={28} className="text-primary" />
          </div>
          <h1>NovaScribe</h1>
        </div>
        <p className="subtitle" style={{ marginBottom: '2rem' }}>AI-Powered Video Transcription & Interview Analysis</p>
        
        {token && user && (
          <div className="sidebar-nav">
            <div style={{ paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Logged in as</div>
              <div style={{ fontWeight: 600, color: '#fff' }}>{user.username}</div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', textTransform: 'capitalize' }}>{user.role}</div>
            </div>

            <button 
              className={`sidebar-btn ${location.pathname.includes('/projects') ? 'active' : ''}`}
              onClick={() => navigate('/projects')}
            >
              <FolderKanban size={18} /> {user.role === 'superuser' ? 'Manage Projects' : 'Projects'}
            </button>

            {user.role === 'superuser' && (
              <>
                <button 
                  className={`sidebar-btn ${location.pathname.includes('/users') ? 'active' : ''}`}
                  onClick={() => navigate('/users')}
                >
                  <Users size={18} /> Manage Users
                </button>
                <button 
                  className={`sidebar-btn ${location.pathname.includes('/technologies') ? 'active' : ''}`}
                  onClick={() => navigate('/technologies')}
                >
                  <Settings size={18} /> Manage Technologies
                </button>
              </>
            )}

            {user.role !== 'superuser' && (
              <button 
                className={`sidebar-btn ${location.pathname.includes('/transcription') ? 'active' : ''}`}
                onClick={() => navigate('/transcription')}
              >
                <Video size={18} /> Transcription
              </button>
            )}

            <button 
              className="sidebar-btn logout-btn"
              onClick={() => {
                onLogout();
                navigate('/login');
              }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        )}
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
      
      {/* Background decorative elements */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>
    </div>
  );
}
