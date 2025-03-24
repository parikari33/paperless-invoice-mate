
import React, { useState, useCallback } from 'react';
import { FileImage, Upload, AlertCircle, CheckCheck, Scan } from 'lucide-react';
import { toast } from 'sonner';
import { ProcessingStatus } from '@/types/invoice';
import { cn } from '@/lib/utils';

interface InvoiceUploaderProps {
  onFileUploaded: (file: File) => void;
  status: ProcessingStatus;
  className?: string;
}

const InvoiceUploader: React.FC<InvoiceUploaderProps> = ({
  onFileUploaded,
  status,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isProcessing = status === ProcessingStatus.UPLOADING || status === ProcessingStatus.PROCESSING;
  const isComplete = status === ProcessingStatus.COMPLETE;

  const handleFile = useCallback((file: File) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large. Please upload an image smaller than 10MB');
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Pass the file to the parent component
    onFileUploaded(file);
  }, [onFileUploaded]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  return (
    <div 
      className={cn(
        'flex flex-col items-center w-full max-w-xl mx-auto',
        className
      )}
    >
      <div
        className={cn(
          'w-full aspect-[4/3] p-6 rounded-xl border-2 border-dashed transition-all duration-300 ease-in-out',
          'bg-background/50 backdrop-blur-sm shadow-sm',
          'relative overflow-hidden group',
          isDragging 
            ? 'border-primary scale-[1.02] bg-primary/5' 
            : 'border-muted hover:border-primary/50 hover:bg-primary/5',
          'flex flex-col items-center justify-center space-y-4 cursor-pointer',
          'animate-fade-in',
          isProcessing && 'opacity-70 pointer-events-none',
          isComplete && 'border-green-500/50 bg-green-500/5',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        {/* Gradient overlay for hover effect */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 transition-opacity duration-300',
          isDragging || isComplete ? 'opacity-80' : 'group-hover:opacity-30'
        )} />

        {previewUrl ? (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg z-10">
            <img 
              src={previewUrl} 
              alt="Invoice Preview" 
              className={cn(
                'max-w-full max-h-full object-contain transition-all duration-500 ease-out',
                isComplete ? 'opacity-60' : 'opacity-100'
              )} 
            />
            {isComplete && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-xs animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-green-500/90 flex items-center justify-center mb-4 animate-scale-in">
                  <CheckCheck className="w-8 h-8 text-white" />
                </div>
                <p className="text-white font-medium shadow-sm">Processing complete</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3 transition-transform group-hover:scale-110 duration-300">
                <Scan className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div className="text-center relative z-10">
              <p className="text-lg font-medium text-foreground mb-1">Upload Invoice Image</p>
              <p className="text-sm text-muted-foreground mb-4">Drag and drop or click to browse</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center text-xs text-muted-foreground mb-4">
                <div className="flex items-center mb-2 sm:mb-0 sm:mr-4">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  <span>JPG, PNG, PDF</span>
                </div>
                <div className="flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  <span>Max 10MB</span>
                </div>
              </div>
            </div>
            
            <div className="mt-2 relative z-10">
              <div className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center shadow-sm">
                <Upload className="w-4 h-4 mr-2" />
                <span className="font-medium">Select File</span>
              </div>
            </div>
          </>
        )}
        
        <input
          id="fileInput"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleInputChange}
          disabled={isProcessing}
        />
      </div>
      
      {previewUrl && !isComplete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPreviewUrl(null);
            // Reset file input
            const fileInput = document.getElementById('fileInput') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
          }}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground flex items-center"
          disabled={isProcessing}
        >
          <AlertCircle className="w-3 h-3 mr-1" />
          <span>Remove and upload a different image</span>
        </button>
      )}
    </div>
  );
};

export default InvoiceUploader;
