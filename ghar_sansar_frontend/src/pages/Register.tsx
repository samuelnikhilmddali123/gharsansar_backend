import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, ArrowRight } from 'lucide-react';

const Register: React.FC = () => {
  const { register, sendOtp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpSent) {
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setLoading(true);
      const res = await sendOtp(form.email.trim(), 'registration');
      setLoading(false);
      if (res.success) {
        setOtpSent(true);
      } else {
        setError(res.error || 'Failed to send verification code');
      }
      return;
    }

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);
    const res = await register(form.name, form.email, form.password, form.phone, otp.trim());
    setLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-screen bg-[#FAF8F5] p-4"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2 text-gray-900">
          <UserPlus className="w-6 h-6 text-emerald-800" /> {otpSent ? 'Verify Email' : 'Register Account'}
        </h2>
        {error && <p className="text-red-600 mb-4 text-center text-sm bg-red-50 p-2 rounded">{error}</p>}
        
        {otpSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center text-sm text-gray-600 mb-2">
              We sent a 6-digit verification code to <strong>{form.email}</strong>
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              className="w-full text-center tracking-widest text-2xl font-bold px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#00281b] hover:bg-[#04402d] text-white font-semibold py-2.5 rounded-lg transition text-sm cursor-pointer"
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
            <button
              type="button"
              onClick={() => { setOtpSent(false); setOtp(''); }}
              className="w-full text-xs text-center text-gray-500 hover:underline"
            >
              ← Back to Details
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
            <input
              name="phone"
              type="tel"
              placeholder="Phone (10 digits)"
              value={form.phone}
              onChange={handleChange}
              maxLength={10}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#00281b] hover:bg-[#04402d] text-white font-semibold py-2.5 rounded-lg transition text-sm cursor-pointer"
            >
              {loading ? 'Sending OTP...' : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default Register;