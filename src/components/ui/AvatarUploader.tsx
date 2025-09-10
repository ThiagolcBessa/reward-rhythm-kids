import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Camera, Loader2 } from 'lucide-react';

interface AvatarUploaderProps {
  currentAvatarUrl?: string;
  kidId?: string;
  familyId?: string;
  kidName?: string;
  colorHex?: string;
  onAvatarChange: (avatarUrl: string) => void;
}

export const AvatarUploader = ({ 
  currentAvatarUrl, 
  kidId, 
  familyId, 
  kidName = 'K',
  colorHex = '#3B82F6',
  onAvatarChange 
}: AvatarUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please select a PNG or JPEG image file.';
    }

    // Check file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 2MB.';
    }

    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Invalid file",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate file path - use familyId if available, otherwise just kidId
      const fileName = `${kidId || Date.now()}.${file.name.split('.').pop()}`;
      const filePath = familyId ? `${familyId}/${fileName}` : fileName;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true, // Replace existing file
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Call the callback to update the form data
      onAvatarChange(publicUrl);

      toast({
        title: "Avatar uploaded!",
        description: "Profile picture has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Clear the input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <Label>Profile Picture</Label>
      
      <div className="flex items-center gap-4">
        {/* Avatar Preview */}
        <div className="relative">
          {currentAvatarUrl ? (
            <img 
              src={currentAvatarUrl} 
              alt="Avatar preview"
              className="w-16 h-16 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold border-2 border-border"
              style={{ backgroundColor: colorHex }}
            >
              {kidName.charAt(0).toUpperCase()}
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={triggerFileSelect}
            disabled={isUploading}
            className="gap-2"
          >
            {currentAvatarUrl ? (
              <>
                <Camera className="h-4 w-4" />
                Change Photo
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Photo
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            PNG or JPEG, max 2MB
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpg,image/jpeg"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};