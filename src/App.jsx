import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import { useDatabase } from './hooks/useDatabase.js';
import AppShell from './layouts/AppShell.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import AuthGuard from './components/AuthGuard.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import FarmerDashboard from './pages/farmer/FarmerDashboard.jsx';
import ExpertDashboard from './pages/expert/ExpertDashboard.jsx';
import PublicPortal from './pages/public/PublicPortal.jsx';
import ResourcesPage from './pages/resources/ResourcesPage.jsx';
import ResourceDetailPage from './pages/resources/ResourceDetailPage.jsx';
import VideoPlayerPage from './pages/resources/VideoPlayerPage.jsx';
import ForumsPage from './pages/forums/ForumsPage.jsx';
import EventsPage from './pages/events/EventsPage.jsx';
import SectorsPage from './pages/sectors/SectorsPage.jsx';
import UserManagementPage from './pages/admin/UserManagementPage.jsx';
import QueryConsolePage from './pages/admin/QueryConsolePage.jsx';
import ConnectionsPage from './pages/connections/ConnectionsPage.jsx';
import NotificationsPage from './pages/notifications/NotificationsPage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';
import UserDashboard from './pages/user/UserDashboard.jsx';

const App = () => {
  const { ready, error } = useDatabase();
  const { loading, user } = useAuth();

  if (error) {
    return (
      <div style={{ padding: '4rem', fontFamily: 'var(--font-sans)' }}>
        <h1>Database initialization failed</h1>
        <pre>{error.message}</pre>
      </div>
    );
  }

  if (!ready || loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <AuthGuard>
            <AppShell />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to={user?.role ? `/dashboard/${user.role}` : '/public'} replace />} />
        <Route path="dashboard">
          <Route path="user" element={<UserDashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="farmer" element={<FarmerDashboard />} />
          <Route path="expert" element={<ExpertDashboard />} />
          <Route path="public" element={<PublicPortal />} />
        </Route>
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="resources/:id" element={<ResourceDetailPage />} />
        <Route path="video/:id" element={<VideoPlayerPage />} />
        <Route path="forums" element={<ForumsPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="sectors" element={<SectorsPage />} />
        <Route path="connections" element={<ConnectionsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="admin/users" element={<UserManagementPage />} />
        <Route path="admin/console" element={<QueryConsolePage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
};

export default App;
