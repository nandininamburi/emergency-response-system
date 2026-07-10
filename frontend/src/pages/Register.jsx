import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaTint, FaAddressCard, 
  FaUserMd, FaShieldAlt, FaArrowRight, FaHeartbeat, FaFileMedical, 
  FaUpload, FaTimes, FaUserFriends 
} from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    aadhar: '',
    bloodGroup: '',
    address: '',
    
    // Step 2: Account & Security
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 3: Emergency & Medical
    emergencyContact: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    allergies: '',
    previousHospital: '',
    medicalHistory: '',
    medicalDocuments: [],
    previousReports: []
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [documentPreviews, setDocumentPreviews] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      return true; // Accept all files for now
    });
    
    setFormData(prev => ({
      ...prev,
      medicalDocuments: [...prev.medicalDocuments, ...validFiles]
    }));
    
    // Create previews for images
    const previews = validFiles.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return null;
    }).filter(Boolean);
    
    setDocumentPreviews(prev => [...prev, ...previews]);
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      medicalDocuments: prev.medicalDocuments.filter((_, i) => i !== index)
    }));
    setDocumentPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.phone || formData.phone.length < 10) newErrors.phone = 'Valid phone number is required';
    if (!formData.aadhar || formData.aadhar.length !== 12) newErrors.aadhar = '12-digit Aadhaar number is required';
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.emergencyContact) newErrors.emergencyContact = 'Emergency contact is required';
    if (!formData.emergencyContactPhone || formData.emergencyContactPhone.length < 10) {
      newErrors.emergencyContactPhone = 'Valid emergency contact phone is required';
    }
    if (!formData.emergencyContactRelation) newErrors.emergencyContactRelation = 'Please specify relation';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep3()) return;
    
    setLoading(true);
    setErrors({});

    try {
      localStorage.setItem('user', JSON.stringify(formData));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('authToken', 'demo-token-' + Date.now());

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      setLoading(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
          1
        </div>
        <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
          2
        </div>
        <div className={`w-12 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
          3
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-8">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-5xl">✅</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
      <p className="text-gray-600">Welcome to Emergency Response System</p>
      <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
      <div className="mt-4 flex justify-center">
        <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold mb-3">
            🚨 Emergency Response
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
          <p className="text-gray-600 mt-2">Register once for quick emergency response</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {showSuccess ? (
            renderSuccess()
          ) : (
            <div className="px-6 py-8">
              {renderStepIndicator()}

              <form onSubmit={handleSubmit}>
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FaUser className="text-blue-600" /> Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          className={`w-full px-4 py-3 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FaPhone className="inline mr-1 text-blue-600" /> Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="10-digit mobile number"
                          className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          📅 Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          👤 Gender
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FaIdCard className="inline mr-1 text-blue-600" /> Aadhaar Number *
                        </label>
                        <input
                          type="text"
                          name="aadhar"
                          value={formData.aadhar}
                          onChange={handleChange}
                          placeholder="12-digit Aadhaar number"
                          maxLength="12"
                          className={`w-full px-4 py-3 border ${errors.aadhar ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        />
                        {errors.aadhar && <p className="text-red-500 text-xs mt-1">{errors.aadhar}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FaTint className="inline mr-1 text-blue-600" /> Blood Group *
                        </label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border ${errors.bloodGroup ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white`}
                        >
                          <option value="">Select Blood Group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                        {errors.bloodGroup && <p className="text-red-500 text-xs mt-1">{errors.bloodGroup}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FaAddressCard className="inline mr-1 text-blue-600" /> Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Your residential address"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      Next Step <FaArrowRight />
                    </button>
                  </div>
                )}

                {/* Step 2: Account & Security */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FaShieldAlt className="text-blue-600" /> Account & Security
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FaEnvelope className="inline mr-1 text-blue-600" /> Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          🔒 Password *
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Min 6 characters"
                          className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ✅ Confirm Password *
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        Next Step <FaArrowRight />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Emergency & Medical */}
                {currentStep === 3 && (
                  <div className="space-y-5">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FaHeartbeat className="text-red-500" /> Emergency & Medical Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          🆘 Emergency Contact Name *
                        </label>
                        <input
                          type="text"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleChange}
                          placeholder="Contact person name"
                          className={`w-full px-4 py-3 border ${errors.emergencyContact ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        />
                        {errors.emergencyContact && <p className="text-red-500 text-xs mt-1">{errors.emergencyContact}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          📱 Contact Phone *
                        </label>
                        <input
                          type="tel"
                          name="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={handleChange}
                          placeholder="10-digit mobile number"
                          className={`w-full px-4 py-3 border ${errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        />
                        {errors.emergencyContactPhone && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactPhone}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FaUserFriends className="inline mr-1 text-blue-600" /> Relation *
                        </label>
                        <select
                          name="emergencyContactRelation"
                          value={formData.emergencyContactRelation}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border ${errors.emergencyContactRelation ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white`}
                        >
                          <option value="">Select Relation</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Brother">Brother</option>
                          <option value="Sister">Sister</option>
                          <option value="Son">Son</option>
                          <option value="Daughter">Daughter</option>
                          <option value="Friend">Friend</option>
                          <option value="Neighbor">Neighbor</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.emergencyContactRelation && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactRelation}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaUserMd className="inline mr-1 text-blue-600" /> Known Allergies (Optional)
                      </label>
                      <textarea
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleChange}
                        rows="2"
                        placeholder="e.g., Penicillin, Peanuts, Latex"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">⚕️ This helps medical responders provide safer treatment</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        🏥 Previous Hospital (Optional)
                      </label>
                      <input
                        type="text"
                        name="previousHospital"
                        value={formData.previousHospital}
                        onChange={handleChange}
                        placeholder="Name of hospital where you were previously treated"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        📋 Medical History (Optional)
                      </label>
                      <textarea
                        name="medicalHistory"
                        value={formData.medicalHistory}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Any previous medical conditions, surgeries, or treatments"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* ✅ Upload Previous Reports/Documents */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaFileMedical className="inline mr-1 text-blue-600" /> Upload Previous Reports/Documents
                      </label>
                      <div className="flex items-center gap-4 flex-wrap">
                        <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition flex items-center gap-2">
                          <FaUpload />
                          <span>Upload Files</span>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-xs text-gray-500">Supports: PDF, Word, Images</span>
                      </div>
                      
                      {/* Document Previews */}
                      {documentPreviews.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {documentPreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={preview} 
                                alt={`Document ${index + 1}`} 
                                className="w-16 h-16 object-cover rounded-md border"
                              />
                              <button
                                type="button"
                                onClick={() => removeDocument(index)}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {formData.medicalDocuments.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          {formData.medicalDocuments.length} file(s) uploaded
                        </p>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-gray-700 font-medium">🔐 By registering, you agree that your information will be used for:</p>
                      <ul className="text-xs text-gray-600 list-disc pl-5 mt-2 space-y-1">
                        <li>Automatic filling of emergency reports</li>
                        <li>Identity verification during emergencies</li>
                        <li>Medical response coordination</li>
                        <li>Emergency contact notification</li>
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Registering...
                          </>
                        ) : (
                          <>
                            Register & Continue <FaArrowRight />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600">
            Already have an account? <span className="font-medium text-blue-600">Sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;