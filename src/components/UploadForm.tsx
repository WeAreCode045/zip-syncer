import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface UploadFormProps {
  onUpload: (data: FormData) => void;
}

const UploadForm = ({ onUpload }: UploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !version) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("version", version);
    formData.append("description", description);

    onUpload(formData);
    
    // Reset form
    setFile(null);
    setVersion("");
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-card rounded-lg shadow-sm animate-slide-up">
      <div className="space-y-2">
        <Label htmlFor="plugin">Plugin File (ZIP)</Label>
        <Input
          id="plugin"
          type="file"
          accept=".zip"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="cursor-pointer"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="version">Version</Label>
        <Input
          id="version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          placeholder="1.0.0"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's new in this version?"
          className="resize-none"
        />
      </div>

      <Button type="submit" className="w-full">
        <Upload className="mr-2 h-4 w-4" />
        Upload Plugin
      </Button>
    </form>
  );
};

export default UploadForm;