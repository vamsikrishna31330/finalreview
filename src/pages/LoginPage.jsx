import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useDatabase } from '../hooks/useDatabase.js';
import { useUI } from '../hooks/useUI.js';
import './LoginPage.css';

const LoginPage = () => {
  const { login, roles } = useAuth();
  const { query, run } = useDatabase();
  const { pushNotification } = useUI();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState(null);
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    location: '',
    organization: ''
  });
  const availableRoles = useMemo(() => roles, [roles]);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const profile = await login(email, password);
      const redirectPath = location.state?.from?.pathname ?? `/dashboard/${profile.role}`;
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setSignupError(null);
    if (!signupForm.name.trim()) {
      setSignupError('Name is required');
      return;
    }
    if (!signupForm.email.trim()) {
      setSignupError('Email is required');
      return;
    }
    if (signupForm.password.length < 6) {
      setSignupError('Password must be at least 6 characters');
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }
    setSignupLoading(true);
    try {
      const existing = query('SELECT id FROM users WHERE email = ?', [signupForm.email.trim()]);
      if (existing.length) {
        setSignupError('An account with this email already exists');
        setSignupLoading(false);
        return;
      }
      run(
        'INSERT INTO users (name, email, password, role, location, organization) VALUES (?, ?, ?, ?, ?, ?)',
        [
          signupForm.name.trim(),
          signupForm.email.trim(),
          signupForm.password,
          signupForm.role,
          signupForm.location.trim() || null,
          signupForm.organization.trim() || null
        ]
      );
      pushNotification({
        title: 'Account created',
        message: 'You can now access the dashboard',
        status: 'success'
      });
      setEmail(signupForm.email.trim());
      setPassword(signupForm.password);
      setSignupForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'farmer',
        location: '',
        organization: ''
      });
      setMode('login');
    } catch (err) {
      setSignupError(err.message);
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="background">
        <div className="image" />
        <div className="overlay" />
      </div>
      <div className="login-content">
        <div className="intro">
          <h1>AgriConnect Platform</h1>
          <p>Empowering farmers, experts, and communities with data-driven collaboration.</p>
          <ul>
            <li>Access sector-wise resources and events</li>
            <li>Collaborate through forums and discussion boards</li>
            <li>Manage user roles and connections without any backend</li>
          </ul>
        </div>
        <div className="card">
          <div className="auth-switcher">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => {
                setMode('login');
                setError(null);
              }}
            >
              Log in
            </button>
            <button
              type="button"
              className={mode === 'signup' ? 'active' : ''}
              onClick={() => {
                setMode('signup');
                setSignupError(null);
              }}
            >
              Sign up
            </button>
          </div>
          {mode === 'login' ? (
            <>
              <p>Enter your account credentials to access role-based dashboards.</p>
              <form onSubmit={handleSubmit}>
                <label>
                  Email
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </label>
                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={loading}>
                  {loading ? 'Signing in...' : 'Access dashboard'}
                </button>
              </form>
            </>
          ) : (
            <>
              <p>Create a new account to access role-based dashboards.</p>
              <form onSubmit={handleSignup} className="signup-form">
                <div className="grid-two">
                  <label>
                    Full name
                    <input
                      value={signupForm.name}
                      onChange={(event) => setSignupForm((prev) => ({ ...prev, name: event.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Role
                    <select
                      value={signupForm.role}
                      onChange={(event) => setSignupForm((prev) => ({ ...prev, role: event.target.value }))}
                    >
                      {availableRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  Email
                  <input
                    type="email"
                    value={signupForm.email}
                    onChange={(event) => setSignupForm((prev) => ({ ...prev, email: event.target.value }))}
                    required
                  />
                </label>
                <div className="grid-two">
                  <label>
                    Password
                    <input
                      type="password"
                      value={signupForm.password}
                      onChange={(event) => setSignupForm((prev) => ({ ...prev, password: event.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Confirm password
                    <input
                      type="password"
                      value={signupForm.confirmPassword}
                      onChange={(event) => setSignupForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                      required
                    />
                  </label>
                </div>
                <div className="grid-two">
                  <label>
                    Location
                    <input
                      value={signupForm.location}
                      onChange={(event) => setSignupForm((prev) => ({ ...prev, location: event.target.value }))}
                      placeholder="City, Region"
                    />
                  </label>
                  <label>
                    Organization
                    <input
                      value={signupForm.organization}
                      onChange={(event) => setSignupForm((prev) => ({ ...prev, organization: event.target.value }))}
                      placeholder="Affiliation (optional)"
                    />
                  </label>
                </div>
                {signupError && <p className="error">{signupError}</p>}
                <button type="submit" disabled={signupLoading}>
                  {signupLoading ? 'Creating account...' : 'Create account'}
                </button>
              </form>
            </>
          )}
          <div className="available-roles">
            <h3>Available Roles</h3>
            <div className="tags">
              {availableRoles.map((role) => (
                <span key={role.id}>{role.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
