"use client";


import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Play, Pause, Volume2, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { CancelToken } from "axios";


// Interface pour les fichiers uploadés
interface UploadedFile {
  file: File;
  url?: string;
  uploadProgress: number;
  isUploading: boolean;
  uploadError?: string;
  uploadSuccess: boolean;
  cancelToken?: CancelToken;
}



export function MediaPreview({
  type,
  uploadedFile,
  action,
  onRemove,
  onRetry
}: {
  type: string;
  uploadedFile: UploadedFile;
  action: boolean;
  onRemove: () => void;
  onRetry?: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaUrl = uploadedFile.url || URL.createObjectURL(uploadedFile.file);

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(1) + ' MB';
  };

  const togglePlay = (element: HTMLAudioElement | HTMLVideoElement) => {
    if (isPlaying) {
      element.pause();
    } else {
      element.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative border rounded-lg p-3 bg-gray-50 space-y-3">
      {/* Header avec statut */}
      {
        action && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate">
                    {uploadedFile.file.name}
                  </span>
                  <div className="flex gap-2 text-xs text-gray-600">
                    <span>{formatFileSize(uploadedFile.file.size)}</span>
                    <Badge variant="outline" className="text-xs">
                      {type}
                    </Badge>

                    {/* Status badges */}
                    {uploadedFile.isUploading && (
                      <Badge variant="secondary" className="text-xs">
                        Upload...
                      </Badge>
                    )}
                    {uploadedFile.uploadSuccess && (
                      <Badge variant="default" className="text-xs bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Uploadé
                      </Badge>
                    )}
                    {uploadedFile.uploadError && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Erreur
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {uploadedFile.isUploading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">{uploadedFile.uploadProgress}%</span>
                  </div>
                ) : uploadedFile.uploadError && onRetry ? (
                  <Button variant="outline" size="sm" onClick={onRetry}>
                    Réessayer
                  </Button>
                ) : null}

                <Button variant="destructive" size="sm" onClick={onRemove}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Barre de progression */}
            {uploadedFile.isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadedFile.uploadProgress}%` }}
                />
              </div>
            )}

            {/* Message d'erreur */}
            {uploadedFile.uploadError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {uploadedFile.uploadError}
                </AlertDescription>
              </Alert>
            )}
          </>
        )
      }


      {/* Prévisualisation du contenu */}
      {!uploadedFile.uploadError && (
        <>
          {type === "image" && (
            <img
              src={mediaUrl}
              alt="Prévisualisation"
              className="max-w-full h-32 object-cover rounded"
            />
          )}

          {type === "audio" && (
            <div className="flex items-center gap-2 p-2 bg-white rounded">
              <Volume2 className="h-5 w-5" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const audio = document.getElementById(`audio-${uploadedFile.file.name}`) as HTMLAudioElement;
                  if (audio) togglePlay(audio);
                }}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <audio
                id={`audio-${uploadedFile.file.name}`}
                src={mediaUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          )}

          {type === "video" && (
            <video
              src={mediaUrl}
              controls
              className="max-w-full h-32 rounded"
              preload="metadata"
            />
          )}
        </>
      )}
    </div>
  );
}