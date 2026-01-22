import React, { useState } from 'react';
import { useAuth } from './SupabaseAuthProvider';
import { LogIn, ShieldCheck, Database, Layout, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';

const Login = () => {
  const { signInWithEmail, signUpWithEmail, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        alert('Check your email for a confirmation link!');
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="login-content fade-in">
        <div className="login-card glass-premium">
          <div className="login-header">
            <div className="brand">
              <div className="brand-icon">
                <Layout size={32} />
              </div>
              <h1 className="brand-name">TradeJournal<span>Free</span></h1>
            </div>
            <p className="subtitle">Precision tracking for the modern trader.</p>
          </div>

          <div className="auth-toggle">
            <button
              className={`toggle-btn ${!isSignUp ? 'active' : ''}`}
              onClick={() => setIsSignUp(false)}
            >
              Sign In
            </button>
            <button
              className={`toggle-btn ${isSignUp ? 'active' : ''}`}
              onClick={() => setIsSignUp(true)}
            >
              Register
            </button>
            <div className={`active-bg ${isSignUp ? 'right' : 'left'}`}></div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <div className="input-field">
                <Mail size={18} className="field-icon" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-field">
                <Lock size={18} className="field-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <div className="error-message shake">{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              <span>{loading ? 'Processing...' : (isSignUp ? 'Create Free Account' : 'Access Dashboard')}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="trust-footer">
            <div className="trust-item">
              <ShieldCheck size={14} />
              <span>Full Data Privacy</span>
            </div>
            <div className="trust-item">
              <Database size={14} />
              <span>Cloud Secured</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-wrapper {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #050505;
          position: relative;
          overflow: hidden;
          padding: 1.5rem;
        }

        /* Animated Background Blobs */
        .blobs {
          position: absolute;
          inset: 0;
          z-index: 0;
          filter: blur(80px);
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          opacity: 0.4;
          animation: float 20s infinite alternate;
        }

        .blob-1 {
          width: 400px;
          height: 400px;
          background: #3b82f6;
          top: -100px;
          right: -100px;
          animation-duration: 25s;
        }

        .blob-2 {
          width: 350px;
          height: 350px;
          background: #8b5cf6;
          bottom: -50px;
          left: -50px;
          animation-duration: 20s;
        }

        .blob-3 {
          width: 300px;
          height: 300px;
          background: #3b82f6;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.15;
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(50px, 30px) scale(1.1); }
        }

        .login-content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
        }

        .glass-premium {
          background: rgba(15, 15, 18, 0.7);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          padding: 3rem 2.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .brand-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.5);
        }

        .brand-name {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: white;
        }

        .brand-name span {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 400;
        }

        .subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
        }

        /* Custom Toggle Switch */
        .auth-toggle {
          position: relative;
          background: rgba(255, 255, 255, 0.04);
          padding: 4px;
          border-radius: 14px;
          display: flex;
          margin-bottom: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .toggle-btn {
          flex: 1;
          background: none;
          border: none;
          padding: 0.75rem;
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.9rem;
          z-index: 2;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .toggle-btn.active {
          color: white;
        }

        .active-bg {
          position: absolute;
          top: 4px;
          width: calc(50% - 4px);
          height: calc(100% - 8px);
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }

        .active-bg.left { transform: translateX(0); }
        .active-bg.right { transform: translateX(100%); }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .input-field {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 1rem;
          color: #64748b;
          transition: color 0.3s ease;
        }

        .input-field input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 1rem 1rem 1rem 3rem;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .input-field input:focus {
          background: rgba(255, 255, 255, 0.05);
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .input-field input:focus + .field-icon {
          color: #3b82f6;
        }

        .submit-btn {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          padding: 1rem;
          border-radius: 14px;
          font-weight: 700;
          font-size: 1rem;
          border: none;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 25px -5px rgba(59, 130, 246, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 0.75rem;
          border-radius: 10px;
          font-size: 0.85rem;
          text-align: center;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .trust-footer {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 500;
        }

        @media (max-width: 480px) {
          .glass-premium {
            padding: 2rem 1.5rem;
            border-radius: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
