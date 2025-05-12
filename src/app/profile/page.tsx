"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// New Avatar component
const Avatar = ({ 
  src, 
  name, 
  email, 
  size = 'default', 
  className = '' 
}: { 
  src?: string | null, 
  name?: string | null, 
  email?: string | null, 
  size?: 'small' | 'default' | 'large', 
  className?: string 
}) => {
  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    default: 'w-24 h-24 text-4xl',
    large: 'w-32 h-32 text-5xl'
  };

  const fallbackText = name 
    ? name[0].toUpperCase() 
    : (email 
      ? email[0].toUpperCase() 
      : '?');

  return (
    <div className={`rounded-full overflow-hidden bg-yellow-300 flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {src ? (
        <Image 
          src={src} 
          alt="avatar" 
          width={size === 'small' ? 32 : 96} 
          height={size === 'small' ? 32 : 96} 
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-bold text-gray-900">{fallbackText}</span>
      )}
    </div>
  );
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoized user data to prevent unnecessary re-renders
  const userData = useMemo(() => {
    if (!session?.user) return null;
    return {
      email: session.user.email ?? '',
      id: session.user.id ?? '',
      image: session.user.image ?? '',
      name: session.user.name ?? '',
      username: session.user.username ?? ''
    };
  }, [session]);

  // Memoized file change handler
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Reset states
    setError("");
    setSuccess("");
    
    // Get file
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, GIF, WebP).");
      return;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("avatar", file);
    
    // Set uploading state
    setUploading(true);
    
    try {
      // Upload avatar
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to upload avatar");
        return;
      }

      // Optimistically update local state
      setLocalImageUrl(data.image);

      // Update session
      await update({ image: data.image });

      // Set success message
      setSuccess("Avatar updated successfully!");
      
      // Reload to ensure fresh data
      window.location.reload();
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [update]);

  // Memoized navigation handlers
  const handleGoBack = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleLogout = useCallback(async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  }, []);

  // If no user data, return loading or redirect state
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading profile...
      </div>
    );
  }

  // Determine image source with cache busting
  const displayImage = localImageUrl || userData.image;
  const imageSrc = displayImage ? `${displayImage}?t=${Date.now()}` : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4 relative">
      <div className="absolute top-4 left-4">
        <button 
          onClick={handleGoBack}
          className="px-4 py-2 bg-yellow-300 text-black rounded font-semibold hover:bg-yellow-400"
        >
          Back to Home
        </button>
      </div>
      <div className="absolute top-4 right-4">
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded font-semibold hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col items-center space-y-6">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            className="mt-2 px-4 py-2 bg-yellow-300 text-black rounded font-semibold hover:bg-yellow-400"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Change Avatar"}
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {error && <div className="text-red-400 text-center">{error}</div>}
        {success && <div className="text-green-400 text-center">{success}</div>}
        <div className="w-full mt-4 space-y-2">
          <div><span className="font-semibold text-yellow-300">Name:</span> {userData.name || "-"}</div>
          <div><span className="font-semibold text-yellow-300">Username:</span> {userData.username || "-"}</div>
          <div><span className="font-semibold text-yellow-300">Email:</span> {userData.email || "-"}</div>
        </div>
      </div>
    </div>
  );
} 