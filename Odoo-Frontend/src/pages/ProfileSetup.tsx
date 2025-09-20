import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../services/apiClient';

type ActiveSection = 'profile' | 'email' | 'password';

// Password validation helper
const validatePasswordStrength = (password: string): string | null => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
};

export const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<ActiveSection>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email change state
  const [emailData, setEmailData] = useState({
    newEmail: '',
    otp: '',
    step: 1 // 1: enter email, 2: verify OTP
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: '',
    step: 1 // 1: enter passwords, 2: verify OTP
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSendEmailOTP = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      await apiClient.sendEmailChangeOTP({ newEmail: emailData.newEmail });
      
      setEmailData(prev => ({ ...prev, step: 2 }));
      setMessage({ type: 'success', text: 'OTP sent to your new email address!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send OTP. Please try again.' });
      console.error('Send email OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordOTP = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      await apiClient.sendPasswordChangeOTP({ 
        username: user?.username || '', 
        currentPassword: passwordData.currentPassword 
      });
      
      setPasswordData(prev => ({ ...prev, step: 2 }));
      setMessage({ type: 'success', text: 'OTP sent to your registered email!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send OTP. Please check your current password and try again.' });
      console.error('Send password OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailData.step === 1) {
      await handleSendEmailOTP();
    } else {
      setLoading(true);
      setMessage(null);
      
      try {
        await apiClient.changeEmail({ 
          newEmail: emailData.newEmail, 
          otp: emailData.otp 
        });
        
        setMessage({ type: 'success', text: 'Email address updated successfully!' });
        setEmailData({ newEmail: '', otp: '', step: 1 });
        setActiveSection('profile');
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to update email. Please check your OTP.' });
        console.error('Change email error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.step === 1) {
      if (!passwordData.currentPassword) {
        setMessage({ type: 'error', text: 'Please enter your current password!' });
        return;
      }
      
      // Validate password strength
      const passwordError = validatePasswordStrength(passwordData.newPassword);
      if (passwordError) {
        setMessage({ type: 'error', text: passwordError });
        return;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match!' });
        return;
      }
      await handleSendPasswordOTP();
    } else {
      setLoading(true);
      setMessage(null);
      
      try {
        await apiClient.changePassword({ 
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          otp: passwordData.otp 
        });
        
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '', otp: '', step: 1 });
        setActiveSection('profile');
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to update password. Please check your details.' });
        console.error('Change password error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (activeSection !== 'profile') {
      setActiveSection('profile');
      setEmailData({ newEmail: '', otp: '', step: 1 });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '', otp: '', step: 1 });
      setMessage(null);
    } else {
      navigate(-1);
    }
  };

  return (
    <AppLayout title="My Profile">
      <div className="max-w-2xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
          <div></div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveSection('profile')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === 'profile'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveSection('email')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === 'email'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Change Email
          </button>
          <button
            onClick={() => setActiveSection('password')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === 'password'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Profile Info Section */}
          {activeSection === 'profile' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
              
              <div className="space-y-6">
                {/* User Avatar */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={32} className="text-gray-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{user?.username || 'User'}</h4>
                    <p className="text-sm text-gray-500">User ID: {user?.id || 'N/A'}</p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                      {user?.username || 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                      {user?.email || 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                    <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user?.is_verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user?.is_verified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                    <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                      {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Change Email Section */}
          {activeSection === 'email' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {emailData.step === 1 ? 'Change Email Address' : 'Verify New Email'}
              </h3>
              
              <form onSubmit={handleEmailSubmit}>
                {emailData.step === 1 ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Email</label>
                      <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                        {user?.email}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail size={16} className="inline mr-2" />
                        New Email Address
                      </label>
                      <input
                        type="email"
                        id="newEmail"
                        name="newEmail"
                        value={emailData.newEmail}
                        onChange={handleEmailChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your new email address"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Email</label>
                      <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                        {emailData.newEmail}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="emailOtp" className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        id="emailOtp"
                        name="otp"
                        value={emailData.otp}
                        onChange={handleEmailChange}
                        required
                        maxLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter 6-digit OTP"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save size={16} />
                    {loading ? 'Processing...' : emailData.step === 1 ? 'Send OTP' : 'Update Email'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Change Password Section */}
          {activeSection === 'password' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {passwordData.step === 1 ? 'Change Password' : 'Verify Identity'}
              </h3>
              
              <form onSubmit={handlePasswordSubmit}>
                {passwordData.step === 1 ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        <Lock size={16} className="inline mr-2" />
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          id="currentPassword"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          id="newPassword"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                          placeholder="Enter your new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        <p>Password must contain:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>At least 8 characters</li>
                          <li>At least 1 uppercase letter</li>
                          <li>At least 1 number</li>
                          <li>At least 1 special character (!@#$%^&*etc.)</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                          placeholder="Confirm your new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        We've sent a verification code to your registered email address. 
                        Please enter it below to confirm your password change.
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="passwordOtp" className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        id="passwordOtp"
                        name="otp"
                        value={passwordData.otp}
                        onChange={handlePasswordChange}
                        required
                        maxLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter 6-digit OTP"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save size={16} />
                    {loading ? 'Processing...' : passwordData.step === 1 ? 'Send OTP' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};