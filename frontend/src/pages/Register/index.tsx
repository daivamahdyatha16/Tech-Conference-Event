import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import logoFull from '../../assets/logo/logo.png';

const registerSchema = Yup.object({
  fullName: Yup.string().min(2, 'Full name must be at least 2 characters').required('Full name is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  phoneNumber: Yup.string()
    .matches(/^[0-9]+$/, 'Phone number must contain numbers only')
    .min(10, 'Phone number must be at least 10 digits')
    .required('Phone number is required'),
  role: Yup.string()
    .oneOf(['ATTENDEE', 'ORGANIZER'], 'Invalid role selected')
    .required('Please select an account type'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  referralCode: Yup.string().optional(),
});

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      role: 'ATTENDEE',
      password: '',
      confirmPassword: '',
      referralCode: '',
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitError('');
        await register({
          fullName: values.fullName,
          email: values.email,
          phoneNumber: values.phoneNumber,
          password: values.password,
          role: values.role as 'ATTENDEE' | 'ORGANIZER',
          referredByCode: values.referralCode.trim() ? values.referralCode.trim() : undefined,
        });

        toast.success('Registration successful! Please log in.');
        navigate('/login', { state: location.state });
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Failed to register account.';
        setSubmitError(msg);
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
        <button
          type="button"
          onClick={() => navigate(from)}
          className="mb-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer transition-all"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="mb-6 text-center">
          <img src={logoFull} alt="TechCon Logo" className="mx-auto h-12 w-auto object-contain mb-3" />
          <h2 className="text-2xl font-bold text-slate-900">Create New Account</h2>
          <p className="mt-1 text-sm text-slate-500">Choose your account type and complete the registration form</p>
        </div>

        {submitError && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-600 font-medium">
            {submitError}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                  formik.values.role === 'ATTENDEE'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-sm'
                    : 'border-slate-200 bg-slate-50/50 text-slate-500 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="ATTENDEE"
                  checked={formik.values.role === 'ATTENDEE'}
                  onChange={formik.handleChange}
                  className="sr-only"
                />
                <span className="text-sm font-bold">Participant</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Discover & Buy Event Tickets</span>
              </label>

              <label
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                  formik.values.role === 'ORGANIZER'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-sm'
                    : 'border-slate-200 bg-slate-50/50 text-slate-500 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="ORGANIZER"
                  checked={formik.values.role === 'ORGANIZER'}
                  onChange={formik.handleChange}
                  className="sr-only"
                />
                <span className="text-sm font-bold">Event Organizer</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Create & Manage Events</span>
              </label>
            </div>
            {formik.touched.role && formik.errors.role && (
              <p className="mt-1 text-xs text-red-500">{formik.errors.role}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">Full Name</label>
            <input
              type="text"
              {...formik.getFieldProps('fullName')}
              placeholder="Jane Doe"
              className={`w-full rounded-xl border py-2.5 px-3.5 text-sm outline-none transition-all ${
                formik.touched.fullName && formik.errors.fullName ? 'border-red-500 bg-red-50/30' : 'border-slate-200 bg-slate-50/50 focus:border-blue-500'
              }`}
            />
            {formik.touched.fullName && formik.errors.fullName && <p className="mt-1 text-xs text-red-500">{formik.errors.fullName}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">Email Address</label>
              <input
                type="email"
                {...formik.getFieldProps('email')}
                placeholder="jane@example.com"
                className={`w-full rounded-xl border py-2.5 px-3.5 text-sm outline-none transition-all ${
                  formik.touched.email && formik.errors.email ? 'border-red-500 bg-red-50/30' : 'border-slate-200 bg-slate-50/50 focus:border-blue-500'
                }`}
              />
              {formik.touched.email && formik.errors.email && <p className="mt-1 text-xs text-red-500">{formik.errors.email}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">Phone Number</label>
              <input
                type="text"
                {...formik.getFieldProps('phoneNumber')}
                placeholder="081234567890"
                className={`w-full rounded-xl border py-2.5 px-3.5 text-sm outline-none transition-all ${
                  formik.touched.phoneNumber && formik.errors.phoneNumber ? 'border-red-500 bg-red-50/30' : 'border-slate-200 bg-slate-50/50 focus:border-blue-500'
                }`}
              />
              {formik.touched.phoneNumber && formik.errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{formik.errors.phoneNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                {...formik.getFieldProps('password')}
                placeholder="••••••••"
                className={`w-full rounded-xl border py-2.5 px-3.5 text-sm outline-none transition-all ${
                  formik.touched.password && formik.errors.password ? 'border-red-500 bg-red-50/30' : 'border-slate-200 bg-slate-50/50 focus:border-blue-500'
                }`}
              />
              {formik.touched.password && formik.errors.password && <p className="mt-1 text-xs text-red-500">{formik.errors.password}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                {...formik.getFieldProps('confirmPassword')}
                placeholder="••••••••"
                className={`w-full rounded-xl border py-2.5 px-3.5 text-sm outline-none transition-all ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500 bg-red-50/30' : 'border-slate-200 bg-slate-50/50 focus:border-blue-500'
                }`}
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{formik.errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Show Password
            </label>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">Referral Code (Optional)</label>
            <input
              type="text"
              {...formik.getFieldProps('referralCode')}
              placeholder="Enter friend's referral code (if any)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 disabled:opacity-60 cursor-pointer transition-all"
          >
            {formik.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Registering...
              </>
            ) : (
              'Register Now'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-semibold text-blue-600 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;