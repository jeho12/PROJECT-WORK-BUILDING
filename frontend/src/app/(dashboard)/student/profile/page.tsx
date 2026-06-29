'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileInput } from '@/lib/validations/profile.schema';
import { useAuthStore } from '@/store/authStore';
import { studentService } from '@/services/student.service';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { Upload, MapPin, Save, User } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const FACULTY_DATA: Record<string, { departments: Record<string, string[]> }> = {
  "Science & Science Education": {
    departments: {
      "Mathematical Sciences (Computing & Math)": [
        "Computer Science",
        "Software Engineering",
        "Information Technology",
        "Cyber Security",
        "Mathematics"
      ],
      "Chemical Sciences": [
        "Industrial Chemistry",
        "Biochemistry"
      ],
      "Biological Sciences": [
        "Microbiology",
        "Biotechnology"
      ],
      "Physical Sciences": [
        "Physics with Electronics",
        "Geophysics"
      ]
    }
  },
  "Social & Management Sciences": {
    departments: {
      "Accounting & Finance": [
        "Accounting",
        "Banking & Finance"
      ],
      "Business Administration": [
        "Business Administration"
      ],
      "Economics": [
        "Economics"
      ],
      "Mass Communication": [
        "Mass Communication"
      ],
      "Political Science": [
        "Political Science"
      ]
    }
  },
  "Humanities": {
    departments: {
      "Languages": [
        "English & Literary Studies",
        "French"
      ],
      "History & Diplomatic Studies": [
        "History & Diplomatic Studies"
      ],
      "Christian Religious Studies": [
        "Christian Religious Studies"
      ]
    }
  }
};

export default function StudentProfilePage() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();
  const studentId = user?.id || '';
  const [loading, setLoading] = useState(false);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [coordsCaptured, setCoordsCaptured] = useState<{ lat: number; lng: number } | null>(null);
  const [reverseAddress, setReverseAddress] = useState<string>('');

  const { coords, loading: isLocating, capture } = useGeolocation();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors }
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema)
  });

  const { data: profile, isLoading: initialLoading } = useQuery({
    queryKey: ['student_profile', studentId],
    queryFn: () => studentService.getProfile(studentId),
    enabled: !!studentId
  });

  const watchedFaculty = watch('faculty');
  const watchedDepartment = watch('department');

  const facultyOptions = Object.keys(FACULTY_DATA);
  const departmentOptions = watchedFaculty && FACULTY_DATA[watchedFaculty]
    ? Object.keys(FACULTY_DATA[watchedFaculty].departments)
    : [];
  const programmeOptions = watchedFaculty && watchedDepartment && FACULTY_DATA[watchedFaculty]?.departments[watchedDepartment]
    ? FACULTY_DATA[watchedFaculty].departments[watchedDepartment]
    : [];

  const hasCustomFaculty = profile?.faculty && !facultyOptions.includes(profile.faculty);
  const hasCustomDepartment = profile?.department && !departmentOptions.includes(profile.department);
  const hasCustomProgramme = profile?.programme && !programmeOptions.includes(profile.programme);

  useEffect(() => {
    if (profile) {
      setValue('matricNumber', profile.matricNumber);
      setValue('faculty', profile.faculty);
      setValue('department', profile.department);
      setValue('programme', profile.programme || '');
      setValue('level', profile.level);
      setValue('organizationName', profile.organizationName);
      setValue('organizationAddress', profile.organizationAddress);
      setValue('trainingStartDate', profile.trainingStartDate);
      setValue('trainingEndDate', profile.trainingEndDate);
      setValue('industrySupervisorName', profile.industrySupervisorName);

      if (profile.passportUrl) {
        setPassportPreview(profile.passportUrl);
      }
      if (profile.orgLatitude && profile.orgLongitude) {
        setCoordsCaptured({ lat: profile.orgLatitude, lng: profile.orgLongitude });
        setReverseAddress(profile.organizationAddress);
      }
    }
  }, [profile, setValue]);

  // Reset department & programme when faculty changes
  useEffect(() => {
    if (watchedFaculty) {
      const allowedDepts = FACULTY_DATA[watchedFaculty]?.departments || {};
      const currentDept = getValues('department');
      if (!Object.keys(allowedDepts).includes(currentDept) && currentDept !== profile?.department) {
        setValue('department', '');
        setValue('programme', '');
      }
    }
  }, [watchedFaculty, setValue, getValues, profile]);

  // Reset programme when department changes
  useEffect(() => {
    if (watchedFaculty && watchedDepartment) {
      const allowedProgs = FACULTY_DATA[watchedFaculty]?.departments[watchedDepartment] || [];
      const currentProg = getValues('programme');
      if (!allowedProgs.includes(currentProg) && currentProg !== profile?.programme) {
        setValue('programme', '');
      }
    }
  }, [watchedDepartment, watchedFaculty, setValue, getValues, profile]);

  // Set coordinates when geolocation captures them
  useEffect(() => {
    if (coords) {
      setCoordsCaptured(coords);
      // Map to the address that the user typed in the form
      const typedAddress = getValues('organizationAddress') || getValues('organizationName') || 'Captured GPS Coordinates';
      setReverseAddress(typedAddress);
      toast.success('Placement coordinates captured successfully!');
    }
  }, [coords, getValues]);

  // Dropzone config
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size exceeds the 2MB limit.');
        return;
      }
      setPassportFile(file);
      setPassportPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1
  });

  const onSubmit = async (data: ProfileInput) => {
    if (!coordsCaptured) {
      toast.error('Please capture your organization GPS coordinates before saving.');
      return;
    }

    setLoading(true);
    try {
      let passportUrl = passportPreview || '';
      
      // Upload passport image if changed
      if (passportFile) {
        const uploadedUrl = await studentService.uploadPassport(studentId, passportFile);
        passportUrl = uploadedUrl;
      }

      await studentService.updateProfile(studentId, {
        ...data,
        orgLatitude: coordsCaptured.lat,
        orgLongitude: coordsCaptured.lng,
        passportUrl
      });

      // Update state in Zustand auth store
      updateUser({ profileComplete: true });
      queryClient.invalidateQueries({ queryKey: ['student_profile', studentId] });
      toast.success('SIWES Profile successfully saved!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Configure Profile</h1>
        <div className="h-64 flex items-center justify-center bg-white border border-border-custom rounded-xl shadow-xs">
          <p className="text-text-secondary text-sm">Loading profile settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">SIWES Student Profile</h1>
        <p className="text-sm text-text-secondary mt-1">
          Provide your placement specifications, upload a passport photo, and lock down your GPS coordinates.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main profile forms columns (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Academic Information Card */}
            <div className="bg-white border border-border-custom rounded-xl shadow-xs p-6 space-y-4">
              <h3 className="text-base font-bold text-text-primary border-b border-border-custom pb-2">Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-name" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    id="profile-name"
                    title="Full Name"
                    placeholder="Full Name"
                    type="text"
                    value={user?.name || ''}
                    readOnly
                    className="w-full px-3 py-2 text-sm bg-slate-100 border border-border-custom rounded-lg outline-none text-text-secondary cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="profile-email" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    School Email Address
                  </label>
                  <input
                    id="profile-email"
                    title="School Email Address"
                    placeholder="School Email Address"
                    type="text"
                    value={user?.email || ''}
                    readOnly
                    className="w-full px-3 py-2 text-sm bg-slate-100 border border-border-custom rounded-lg outline-none text-text-secondary cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Matric Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AUL/CSC/22/1004"
                    {...register('matricNumber')}
                    className={`w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary ${
                      errors.matricNumber ? 'border-rose-400 focus:border-rose-400' : ''
                    }`}
                  />
                  {errors.matricNumber && (
                    <p className="text-xs text-rose-500 mt-1">{errors.matricNumber.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Academic Level
                  </label>
                  <select
                    {...register('level')}
                    className={`w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary ${
                      errors.level ? 'border-rose-400 focus:border-rose-400' : ''
                    }`}
                  >
                    <option value="">Select Level</option>
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                  </select>
                  {errors.level && (
                    <p className="text-xs text-rose-500 mt-1">{errors.level.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Faculty
                  </label>
                  <select
                    {...register('faculty')}
                    className={`w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary ${
                      errors.faculty ? 'border-rose-400 focus:border-rose-400' : ''
                    }`}
                  >
                    <option value="">Select Faculty</option>
                    {facultyOptions.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                    {hasCustomFaculty && (
                      <option value={profile?.faculty}>{profile?.faculty}</option>
                    )}
                  </select>
                  {errors.faculty && (
                    <p className="text-xs text-rose-500 mt-1">{errors.faculty.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    {...register('department')}
                    className={`w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary ${
                      errors.department ? 'border-rose-400 focus:border-rose-400' : ''
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departmentOptions.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                    {hasCustomDepartment && (
                      <option value={profile?.department}>{profile?.department}</option>
                    )}
                  </select>
                  {errors.department && (
                    <p className="text-xs text-rose-500 mt-1">{errors.department.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Programme / Course of Study
                  </label>
                  <select
                    {...register('programme')}
                    className={`w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary ${
                      errors.programme ? 'border-rose-400 focus:border-rose-400' : ''
                    }`}
                  >
                    <option value="">Select Programme</option>
                    {programmeOptions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    {hasCustomProgramme && (
                      <option value={profile?.programme}>{profile?.programme}</option>
                    )}
                  </select>
                  {errors.programme && (
                    <p className="text-xs text-rose-500 mt-1">{errors.programme.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Industrial Placement Information Card */}
            <div className="bg-white border border-border-custom rounded-xl shadow-xs p-6 space-y-4">
              <h3 className="text-base font-bold text-text-primary border-b border-border-custom pb-2">Industrial Placement Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chevron Nigeria Limited"
                    {...register('organizationName')}
                    className={`w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary ${
                      errors.organizationName ? 'border-rose-400' : ''
                    }`}
                  />
                  {errors.organizationName && (
                    <p className="text-xs text-rose-500 mt-1">{errors.organizationName.message}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Physical Placement Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 Chevron Drive, Lekki, Lagos"
                    {...register('organizationAddress')}
                    className={`w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary ${
                      errors.organizationAddress ? 'border-rose-400' : ''
                    }`}
                  />
                  {errors.organizationAddress && (
                    <p className="text-xs text-rose-500 mt-1">{errors.organizationAddress.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Training Start Date
                  </label>
                  <input
                    type="date"
                    {...register('trainingStartDate')}
                    className={`w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary ${
                      errors.trainingStartDate ? 'border-rose-400' : ''
                    }`}
                  />
                  {errors.trainingStartDate && (
                    <p className="text-xs text-rose-500 mt-1">{errors.trainingStartDate.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Training End Date
                  </label>
                  <input
                    type="date"
                    {...register('trainingEndDate')}
                    className={`w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary ${
                      errors.trainingEndDate ? 'border-rose-400' : ''
                    }`}
                  />
                  {errors.trainingEndDate && (
                    <p className="text-xs text-rose-500 mt-1">{errors.trainingEndDate.message}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Industry Supervisor Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Engr. Festus Dada"
                    {...register('industrySupervisorName')}
                    className={`w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary ${
                      errors.industrySupervisorName ? 'border-rose-400' : ''
                    }`}
                  />
                  {errors.industrySupervisorName && (
                    <p className="text-xs text-rose-500 mt-1">{errors.industrySupervisorName.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Passport & Geolocation (1 col) */}
          <div className="space-y-6">
            {/* Passport Upload Card */}
            <div className="bg-white border border-border-custom rounded-xl shadow-xs p-6 space-y-4">
              <h3 className="text-base font-bold text-text-primary border-b border-border-custom pb-2">Passport Photograph</h3>
              <div 
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
                  isDragActive ? 'border-primary bg-blue-50/50' : 'border-border-custom hover:bg-slate-50/55'
                }`}
              >
                <input {...getInputProps()} />
                {passportPreview ? (
                  <div className="relative group w-28 h-28 rounded-full overflow-hidden border border-border-custom">
                    <img 
                      src={passportPreview} 
                      alt="Passport preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                      Change Photo
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-text-secondary mb-2" />
                    <p className="text-xs font-medium text-text-primary">Drag & drop image here</p>
                    <p className="text-[10px] text-text-secondary mt-1">Supports PNG, JPG (Max 2MB)</p>
                  </>
                )}
              </div>
            </div>

            {/* GPS Location Tracker Card */}
            <div className="bg-white border border-border-custom rounded-xl shadow-xs p-6 space-y-4">
              <h3 className="text-base font-bold text-text-primary border-b border-border-custom pb-2">Placement Location (GPS)</h3>
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={capture}
                  disabled={isLocating}
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 text-xs font-bold text-text-primary rounded-lg border border-border-custom transition-all gap-2"
                >
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{isLocating ? 'Capturing GPS...' : 'Set Placement Coordinates'}</span>
                </button>

                {coordsCaptured ? (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                    <div className="flex justify-between font-mono">
                      <span className="text-text-secondary">Latitude:</span>
                      <span className="font-semibold text-text-primary">{coordsCaptured.lat.toFixed(5)}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-text-secondary">Longitude:</span>
                      <span className="font-semibold text-text-primary">{coordsCaptured.lng.toFixed(5)}</span>
                    </div>
                    <div className="border-t border-slate-200/60 pt-2">
                      <span className="text-text-secondary font-semibold block uppercase text-[10px]">Verified Reverse Address:</span>
                      <span className="text-text-primary leading-relaxed mt-0.5 block">{reverseAddress}</span>
                    </div>

                    {/* OpenStreetMap Static Map Iframe */}
                    <div className="mt-3 rounded-lg overflow-hidden border border-border-custom h-32 bg-slate-100 relative">
                      <iframe 
                        title="Student SIWES Placement Organization Google Map Location"
                        width="100%" 
                        height="100%" 
                        src={`https://maps.google.com/maps?q=${coordsCaptured.lat},${coordsCaptured.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight={0} 
                        marginWidth={0}
                        className="pointer-events-none"
                      ></iframe>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed border-slate-200 rounded-lg text-xs text-text-secondary">
                    GPS Coordinates not set. Click button above to verify placement coordinates.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end border-t border-border-custom pt-6">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-light disabled:bg-blue-300 text-sm font-bold text-white rounded-xl shadow-md transition-all gap-2"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{loading ? 'Saving Changes...' : 'Save SIWES Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
