'use client';

import { useState } from 'react';
import { useAuth } from '../store/authContext';

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          throw new Error('Please enter your name.');
        }
        await registerWithEmail(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sos-overlay" role="dialog" aria-modal="true" aria-label="Login">
      <div className="sos-modal" style={{ maxWidth: '400px' }}>
        <button className="sos-modal__close" onClick={onClose} aria-label="Close">✕</button>

        <div className="sos-modal__header">
          <span className="sos-modal__icon">⚽</span>
          <h2 className="sos-modal__title">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="sos-modal__subtitle">
            {isSignUp ? 'Sign up for StadiumGPT fan services' : 'Sign in to access personalized features'}
          </p>
        </div>

        {error && (
          <div className="crowd-zone__alert" style={{ marginBottom: '16px', padding: '8px 12px', background: 'rgba(255, 0, 0, 0.1)', borderRadius: '8px', border: '1px solid rgba(255,0,0,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="sos-modal__options" style={{ gap: '12px' }}>
          {isSignUp && (
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label" htmlFor="displayName">Name</label>
              <input
                id="displayName"
                type="text"
                className="chat-input__field"
                style={{ width: '100%' }}
                placeholder="Alex Smith"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="chat-input__field"
              style={{ width: '100%' }}
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="chat-input__field"
              style={{ width: '100%' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="btn btn--primary btn--full" style={{ marginTop: '8px' }} disabled={loading}>
            {loading ? 'Processing…' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
          <span style={{ padding: '0 10px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
        </div>

        <button
          className="btn btn--ghost btn--full"
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <span style={{ fontSize: '1.1rem' }}>🌐</span> Continue with Google
        </button>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {isSignUp ? 'Already have an account?' : 'New to StadiumGPT?'} {' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontWeight: 'bold', cursor: 'pointer' }}
            disabled={loading}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
