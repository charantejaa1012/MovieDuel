import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      success('Welcome back to Movie Duel!');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setFormError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('critic@movieduel.app');
    setPassword('demo1234');
    setLoading(true);
    try {
      await login('critic@movieduel.app', 'demo1234');
      success('Signed in with Demo Critic Account!');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setFormError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-medium">
          {formError}
        </div>
      )}

      <Input
        label="Email Address"
        type="email"
        placeholder="critic@movieduel.app"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={Mail}
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={Lock}
        required
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        size="lg"
        isLoading={loading}
        leftIcon={LogIn}
        className="mt-2"
      >
        Sign In
      </Button>

      {/* Demo Account Quick Access */}
      <button
        type="button"
        onClick={handleDemoLogin}
        className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-purple-400 bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/20 transition-colors flex items-center justify-center gap-1.5"
      >
        <span>Instant Preview with Demo Critic</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      <div className="text-center pt-2 text-xs text-[#A1A1AA]">
        <span>Don&apos;t have an account yet? </span>
        <Link
          to="/register"
          className="text-purple-400 hover:text-purple-300 font-semibold hover:underline"
        >
          Create an account
        </Link>
      </div>
    </form>
  );
}

export default LoginForm;
