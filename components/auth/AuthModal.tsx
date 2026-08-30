import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { useApp } from '@/context/AppContext';
import { X, Mail, Lock, User, LogIn, Sparkles, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff, KeyRound, ShieldCheck, RefreshCw } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, setUser } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Countdown timer for resending OTP / Verification link
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      // authDomain = rflix-91ab8.firebaseapp.com (Firebase's own server)
      // COOP: unsafe-none is set on keyoon.com so window.closed works fine
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred?.user) {
        setSuccessMsg('Signed in with Google! Welcome to Keyoon.');
        setTimeout(() => onClose(), 500);
      }
    } catch (err: any) {
      const code: string = err?.code ?? '';
      // User closed the popup — not an error
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setLoading(false);
        return;
      }
      // Popup was blocked by browser — fall back to full page redirect
      if (code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch {
          setError('Sign-in failed. Please allow popups for this site and try again.');
          setLoading(false);
        }
        return;
      }
      setError(err.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  const dispatchVerification = async (targetUser: any, targetEmail: string) => {
    // 1. Generate 6-digit verification OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 2. Save OTP to Firestore for validation
    try {
      await setDoc(doc(db, 'email_verifications', targetEmail), {
        email: targetEmail,
        otp: generatedOtp,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
        verified: false,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore verification record notice:', e);
    }

    // 3. Send official Firebase Email Verification Link
    try {
      if (targetUser) {
        await sendEmailVerification(targetUser);
      }
    } catch (e) {
      console.warn('Firebase email verification notice:', e);
    }

    setResendCooldown(60);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address to reset password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setSuccessMsg(`Password reset link sent to ${cleanEmail}. Please check your inbox.`);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account exists with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Failed to send password reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpOrLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (auth.currentUser) {
        // Force refresh user token to check if email was verified via link
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          setSuccessMsg('🎉 Email verified successfully! Welcome to Keyoon.');
          setTimeout(() => {
            onClose();
          }, 800);
          return;
        }
      }

      // If not yet verified via link, check fallback OTP or prompt
      const cleanOtp = otpInput.trim();
      if (cleanOtp) {
        const vSnap = await getDoc(doc(db, 'email_verifications', cleanEmail));
        if (vSnap.exists()) {
          const vData = vSnap.data();
          if (vData.otp === cleanOtp && Date.now() < vData.expiresAt) {
            await updateDoc(doc(db, 'email_verifications', cleanEmail), { verified: true });
            setSuccessMsg('🎉 Code verified successfully! Welcome to Keyoon.');
            setTimeout(() => onClose(), 800);
            return;
          } else if (Date.now() >= vData.expiresAt) {
            setError('Verification code has expired. Please click "Resend Verification Email" below.');
            setLoading(false);
            return;
          }
        }
      }

      setError('Verification not detected yet. Please check your inbox (including Spam/Junk folder) and click the link in the email from Keyoon.');
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanName = name.trim();

    if (!cleanEmail) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        if (!cleanName) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        const fbUser = userCredential.user;

        // Update Auth Profile
        await updateProfile(fbUser, {
          displayName: cleanName,
        });

        // Initialize Firestore Profile
        const userProfile = {
          id: fbUser.uid,
          name: cleanName,
          email: cleanEmail,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=6366f1&color=fff&size=200`,
          role: 'customer' as const,
          joinedDate: new Date().toISOString().split('T')[0],
          lifetimeSpend: 0,
          activeSubscriptionsCount: 0,
          preferredCurrency: 'USD' as const,
          emailAlertsEnabled: true,
          autoRenewEnabled: true,
        };

        try {
          await setDoc(doc(db, 'users', fbUser.uid), userProfile);
        } catch { }

        setUser(userProfile);

        // Dispatch verification email link
        await dispatchVerification(fbUser, cleanEmail);
        setMode('verify');
        setSuccessMsg(`Verification email sent to ${cleanEmail}! Please check your inbox.`);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        
        // If email/password account is not verified, enforce verification
        if (!userCredential.user.emailVerified && userCredential.user.providerData[0]?.providerId === 'password') {
          await dispatchVerification(userCredential.user, cleanEmail);
          setMode('verify');
          setError('Your email is not verified yet. We sent a fresh verification link to your inbox.');
          setLoading(false);
          return;
        }

        setSuccessMsg('Welcome back!');
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const code = err.code || '';

      if (code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is currently disabled in your Firebase Console. Go to Firebase Console > Authentication > Sign-in method > Enable Email/Password.');
      } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please verify your credentials or click "Create one" below.');
      } else if (code === 'auth/email-already-in-use') {
        setError('This email address is already registered. Please sign in instead.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address format.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Access temporarily disabled. Please reset password or try again in a few minutes.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network connection error. Please check your internet connection.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-md rounded-3xl bg-zinc-900/95 border border-white/10 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl z-10 overflow-hidden"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Modal Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="relative h-10 w-10 rounded-2xl overflow-hidden bg-zinc-950 border border-white/15 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0">
                <img
                  src="/images/Fabicon.png"
                  alt="Keyoon"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex items-center tracking-tight text-2xl font-black font-sans leading-none select-none">
                <span className="text-white drop-shadow-sm">Key</span>
                <span className="text-cyan-400">oon</span>
              </div>
            </div>
            <h3 className="text-xl font-black tracking-tight text-white font-sans">
              {mode === 'login' ? 'Sign In to Your Account' : mode === 'signup' ? 'Create an Account' : mode === 'verify' ? 'Verify Your Email' : 'Reset Your Password'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              {mode === 'forgot'
                ? 'Enter your registered email address and we will send you a password reset link.'
                : mode === 'verify'
                ? `We sent a 6-digit OTP code & verification link to ${email}`
                : 'Access your subscriptions, instant login credentials, and warranty protection.'}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 mb-4 leading-relaxed"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 mb-4 leading-relaxed"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {mode !== 'forgot' && mode !== 'verify' && (
            <>
              {/* 1-Click Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs transition-all flex items-center justify-center gap-3 shadow-md hover:scale-[1.02] disabled:opacity-50 mb-4 cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative px-3 bg-zinc-900 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                  Or with email
                </span>
              </div>
            </>
          )}

          {/* Form Router */}
          {mode === 'verify' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Verification Link Sent</h4>
                  <p className="text-xs text-slate-300 font-mono font-bold bg-zinc-900 px-3 py-1.5 rounded-xl border border-white/5 inline-block max-w-full truncate">
                    {email}
                  </p>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed text-left bg-zinc-900/60 p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="font-bold text-slate-200 block mb-1">To activate your Keyoon account:</span>
                  <span className="block">1. Open your email inbox (check Spam/Junk if needed).</span>
                  <span className="block">2. Click the verification link sent by Keyoon.</span>
                  <span className="block">3. Click the confirmation button below.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleVerifyOtpOrLink()}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>I Have Clicked The Link · Confirm</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <button
                  type="button"
                  onClick={() => dispatchVerification(auth.currentUser, email)}
                  disabled={resendCooldown > 0 || loading}
                  className="text-cyan-400 hover:underline font-bold disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 ? `Resend Email (${resendCooldown}s)` : 'Resend Verification Email'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  Change Email
                </button>
              </div>
            </div>
          ) : mode === 'forgot' ? (
            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-white/10 focus:border-cyan-500/50 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-[1.02] disabled:opacity-50 mt-3 cursor-pointer"
              >
                {loading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Email</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.code === 'Space') {
                          e.stopPropagation();
                        }
                      }}
                      placeholder="Alex Vance"
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-white/10 focus:border-cyan-500/50 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-white/10 focus:border-cyan-500/50 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-zinc-300">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[10px] text-cyan-400 hover:underline font-semibold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (min. 6 chars)"
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-950/80 border border-white/10 focus:border-cyan-500/50 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-[1.02] disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle Mode */}
          {mode !== 'forgot' && mode !== 'verify' && (
            <div className="mt-5 text-center text-xs text-zinc-400">
              {mode === 'login' ? (
                <p>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-cyan-400 hover:underline font-bold cursor-pointer"
                  >
                    Create one
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-cyan-400 hover:underline font-bold cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
