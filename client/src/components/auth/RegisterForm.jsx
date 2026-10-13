import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const { register } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!name || !email || !password || !confirmPassword) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please verify your password.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      success('Account created successfully! Welcome to Movie Duel.');
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.');
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
        label="Full Name"
        type="text"
        placeholder="Alex Wilder"
        value={name}
        onChange={(e) => setName(e.target.value)}
        leftIcon={User}
        required
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="alex@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={Mail}
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="At least 6 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={Lock}
        required
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        leftIcon={Lock}
        required
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        size="lg"
        isLoading={loading}
        leftIcon={UserPlus}
        className="mt-2"
      >
        Create Duelist Account
      </Button>

      <div className="text-center pt-2 text-xs text-[#A1A1AA]">
        <span>Already have an account? </span>
        <Link
          to="/login"
          className="text-purple-400 hover:text-purple-300 font-semibold hover:underline"
        >
          Sign in here
        </Link>
      </div>
    </form>
  );
}

export default RegisterForm;
