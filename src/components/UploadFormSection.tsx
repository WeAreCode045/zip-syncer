import React from 'react';
import UploadForm from './UploadForm';

interface UploadFormSectionProps {
  show: boolean;
  onUpload: (formData: FormData) => void;
}

const UploadFormSection = ({ show, onUpload }: UploadFormSectionProps) => {
  if (!show) return null;

  return (
    <div className="border rounded-lg p-4 bg-card">
      <UploadForm onUpload={onUpload} />
    </div>
  );
};

export default UploadFormSection;