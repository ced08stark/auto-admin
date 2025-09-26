
"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Upload, 
  Trash2, 
  Play, 
  Pause, 
  FileVideo, 
  Link, 
  AlertCircle,
  Loader2,
  CheckCircle,
  X
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { da } from "@faker-js/faker";

// ✅ Types pour les vidéos
interface VideoItem {
  id: string;
  type: 'upload' | 'url';
  title?: string;
  file?: File;
  url?: string;
  urlFichier?: string; // URL après upload
  duration?: number;
  size?: number;
  uploadProgress?: number;
  isUploading?: boolean;
  uploadError?: string;
  uploadSuccess?: boolean;
}

// ✅ Schema Zod amélioré avec types plus stricts
const videoSchema = z.object({
  id: z.string(),
  type: z.enum(['upload', 'url']),
  title: z.string().optional(),
  file: z.any().optional(),
  url: z.string().url("URL invalide").optional(),
  urlFichier: z.string().optional(),
  duration: z.number().optional(),
  size: z.number().optional(),
}).refine((data) => {
  if (data.type === 'url') {
    return data.url && data.url.length > 0;
  } else if (data.type === 'upload') {
    return data.file || data.urlFichier;
  }
  return false;
}, {
  message: "Fichier ou URL requis selon le type",
});

const serieSchema = z.object({
  libelle: z.string().min(2, "Libellé requis").max(100, "Libellé trop long"),
  regulationTraffic: z.string().optional(),
  videos: z.array(videoSchema).optional().default([]),
  permitTypeId: z.string().min(1, "Type de permis requis"),
  isFree: z.boolean().default(true),
});

type SerieFormValues = z.infer<typeof serieSchema>;

interface SerieFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: SerieFormValues) => Promise<void> | void;
  initialData?: Partial<SerieFormValues> | null;
  permitTypes: { _id: string; name: string }[];
  isLoading?: boolean;
}

// ✅ Service d'upload avec retry et gestion d'erreur
class VideoUploadService {
  private static readonly BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  private static readonly MAX_RETRIES = 3;
  private static readonly CHUNK_SIZE = 5 * 1024 * 1024; // 5MB par chunk

  static async uploadVideo(
    file: File, 
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<{ url: string; filename: string }> {
    if (!this.BACKEND_URL) {
      throw new Error('Backend URL non configuré');
    }

    // Validation préliminaire
    this.validateFile(file);

    const formData = new FormData();
    formData.append('files', file);
    formData.append('type', 'video');
    formData.append('folder', 'series-videos');

    let attempt = 0;
    while (attempt < this.MAX_RETRIES) {
      try {
        const response = await fetch(`${this.BACKEND_URL}/api/v1/files/upload`, {
          method: 'POST',
          body: formData,
          signal,
          // Upload progress tracking avec XMLHttpRequest
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Upload failed: ${response.status}`);
        }

        const result = await response.json();

        console.log(result)
        
        // Valider la réponse
        if (!result.url) {
          throw new Error('URL manquante dans la réponse du serveur');
        }

        return {
          url: result.url,
          filename: result.filename || file.name,
        };

      } catch (error) {
        attempt++;
        
        if (signal?.aborted) {
          throw new Error('Upload annulé');
        }

        if (attempt >= this.MAX_RETRIES) {
          throw error;
        }

        // Attendre avant retry (backoff exponentiel)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new Error('Upload échoué après plusieurs tentatives');
  }

  // Upload avec suivi de progression via XMLHttpRequest
  static async uploadVideoWithProgress(
    file: File,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<{ url: string; filename: string }> {
    if (!this.BACKEND_URL) {
      throw new Error('Backend URL non configuré');
    }

    this.validateFile(file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      
      formData.append('files', file);
      formData.append('type', 'video');
      formData.append('folder', 'series-videos');

      // Gestion de l'annulation
      if (signal) {
        signal.addEventListener('abort', () => {
          xhr.abort();
          reject(new Error('Upload annulé'));
        });
      }

      // Progression de l'upload
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      // Réponse du serveur
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            if (!result.url) {
              reject(new Error('URL manquante dans la réponse'));
              return;
            }
            resolve({
              url: result.url,
              filename: result.filename || file.name,
            });
          } catch (error) {
            reject(new Error('Réponse serveur invalide'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.message || `Erreur HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`Erreur HTTP ${xhr.status}`));
          }
        }
      });

      // Gestion des erreurs
      xhr.addEventListener('error', () => {
        reject(new Error('Erreur réseau lors de l\'upload'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Timeout lors de l\'upload'));
      });

      // Configuration et envoi
      xhr.open('POST', `${this.BACKEND_URL}/api/v1/files/upload`);
      xhr.timeout = 10 * 60 * 1000; // 10 minutes timeout
      xhr.send(formData);
    });
  }

  private static validateFile(file: File): void {
    // Validation du type
    if (!file.type.startsWith('video/')) {
      throw new Error('Le fichier doit être une vidéo');
    }

    // Validation de la taille (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Le fichier ne peut pas dépasser 500MB');
    }

    // Validation de l'extension
    const validExtensions = ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      throw new Error(`Extension non supportée. Extensions acceptées: ${validExtensions.join(', ')}`);
    }
  }
}

// ✅ Composant pour prévisualiser une vidéo
function VideoPreview({ video, onRemove, onRetry }: { 
  video: VideoItem; 
  onRemove: () => void;
  onRetry?: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);
  
  const videoUrl = video.type === 'upload' && video.file 
    ? URL.createObjectURL(video.file) 
    : video.url || video.urlFichier;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(1) + ' MB';
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border rounded-lg p-3 bg-gray-50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileVideo className="h-5 w-5 text-blue-500" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {video.title || video.file?.name || "Vidéo sans titre"}
            </p>
            <div className="flex gap-2 text-xs text-gray-600 flex-wrap">
              {video.size && <span>{formatFileSize(video.size)}</span>}
              {video.duration && <span>{formatDuration(video.duration)}</span>}
              <Badge variant="outline" className="text-xs">
                {video.type === 'upload' ? 'Fichier' : 'URL'}
              </Badge>
              
              {/* Status badge */}
              {video.isUploading && (
                <Badge variant="secondary" className="text-xs">
                  Upload...
                </Badge>
              )}
              {video.uploadSuccess && (
                <Badge variant="default" className="text-xs bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Uploadé
                </Badge>
              )}
              {video.uploadError && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Erreur
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {video.isUploading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">{video.uploadProgress || 0}%</span>
            </div>
          ) : video.uploadError && onRetry ? (
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
      {video.isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${video.uploadProgress || 0}%` }}
          />
        </div>
      )}

      {/* Message d'erreur */}
      {video.uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {video.uploadError}
          </AlertDescription>
        </Alert>
      )}

      {/* Prévisualisation vidéo */}
      {videoUrl && !loadError && !video.isUploading && (
        <div className="relative">
          <video
            src={videoUrl}
            className="w-full h-32 rounded object-cover"
            controls={false}
            preload="metadata"
            onError={() => setLoadError(true)}
            onLoadedMetadata={(e) => {
              const target = e.target as HTMLVideoElement;
              if (!video.duration && target.duration) {
                video.duration = target.duration;
              }
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const videoElement = document.querySelector(`video[src="${videoUrl}"]`) as HTMLVideoElement;
                if (videoElement) {
                  if (isPlaying) {
                    videoElement.pause();
                  } else {
                    videoElement.play();
                  }
                  setIsPlaying(!isPlaying);
                }
              }}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {loadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Impossible de charger la vidéo. Vérifiez le fichier ou l'URL.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export const SerieFormModal: React.FC<SerieFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  permitTypes,
  isLoading = false,
}) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [uploadControllers, setUploadControllers] = useState<Map<string, AbortController>>(new Map());

  const form = useForm<any>({
    resolver: zodResolver(serieSchema),
    defaultValues: {
      libelle: "",
      regulationTraffic: "",
      videos: [],
      permitTypeId: "",
      isFree: true,
    },
  });

  const { register, handleSubmit, reset, formState, setValue, watch }: any = form;

  // ✅ Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      const safeInitialData: SerieFormValues = {
        libelle: initialData.libelle || "",
        regulationTraffic: initialData.regulationTraffic || "",
        videos: initialData.videos || [],
        permitTypeId: initialData.permitTypeId || "",
        isFree: initialData.isFree ?? true,
      };
      
      reset(safeInitialData);
      
      // Convertir les vidéos initiales au nouveau format
      if (initialData.videos && Array.isArray(initialData.videos)) {
        const convertedVideos: VideoItem[] = initialData.videos.map((video, index) => ({
          id: video.id || `initial-${index}`,
          type: video.type || 'url',
          url: video.url,
          urlFichier: video.urlFichier,
          title: video.title,
          duration: video.duration,
          size: video.size,
          uploadSuccess: !!video.urlFichier,
        }));
        setVideos(convertedVideos);
      }
    } else {
      reset({
        libelle: "",
        regulationTraffic: "",
        videos: [],
        permitTypeId: "",
        isFree: true,
      });
      setVideos([]);
    }
  }, [initialData, reset, open]);

  // ✅ Cleanup des controllers d'upload à la fermeture
  useEffect(() => {
    if (!open) {
      // Annuler tous les uploads en cours
      uploadControllers.forEach(controller => controller.abort());
      setUploadControllers(new Map());
    }
  }, [open]);

  // ✅ Upload réel d'une vidéo
  const uploadSingleVideo = async (videoId: string, file: File) => {
    const controller = new AbortController();
    setUploadControllers(prev => new Map(prev.set(videoId, controller)));

    try {
      // Mettre à jour le statut
      setVideos(prev => prev.map(video => 
        video.id === videoId 
          ? { ...video, isUploading: true, uploadProgress: 0, uploadError: undefined }
          : video
      ));

      // Upload avec progression
      const result = await VideoUploadService.uploadVideoWithProgress(
        file,
        (progress) => {
          setVideos(prev => prev.map(video => 
            video.id === videoId 
              ? { ...video, uploadProgress: progress }
              : video
          ));
        },
        controller.signal
      );

      // Succès
      setVideos(prev => prev.map(video => 
        video.id === videoId 
          ? { 
              ...video, 
              isUploading: false, 
              uploadSuccess: true,
              urlFichier: result.url,
              uploadProgress: 100,
              uploadError: undefined
            }
          : video
      ));
      console.log(result)
      toast.success(`${file.name} uploadé avec succès`);
      
    } catch (error: any) {
      // Gestion d'erreur
      if (error.message !== 'Upload annulé') {
        setVideos(prev => prev.map(video => 
          video.id === videoId 
            ? { 
                ...video, 
                isUploading: false, 
                uploadError: error.message || 'Erreur inconnue',
                uploadProgress: 0
              }
            : video
        ));
        toast.error(`Erreur upload ${file.name}: ${error.message}`);
      }
    } finally {
      // Cleanup controller
      setUploadControllers(prev => {
        const newMap = new Map(prev);
        newMap.delete(videoId);
        return newMap;
      });
    }
  };

  // ✅ Upload de fichiers vidéo multiples avec axios
  // Ajoutez ceci en haut du fichier si ce n'est pas déjà fait

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validation globale
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      try {
        if (!file.type.startsWith('video/')) {
          throw new Error(`${file.name} n'est pas un fichier vidéo valide`);
        }
        if (file.size > 500 * 1024 * 1024) {
          throw new Error(`${file.name} est trop volumineux (max 500MB)`);
        }
        validFiles.push(file);
      } catch (error: any) {
        errors.push(error.message);
      }
    });

    errors.forEach(error => toast.error(error));
    if (validFiles.length === 0) {
      event.target.value = '';
      return;
    }

    // Créer les nouvelles vidéos
    const newVideos: VideoItem[] = validFiles.map((file) => {
      const videoId = `upload-${Date.now()}-${Math.random()}`;
      return {
        id: videoId,
        type: 'upload',
        file,
        title: file.name.replace(/\.[^/.]+$/, ""),
        size: file.size,
        isUploading: true,
        uploadProgress: 0,
      };
    });

    setVideos(prev => [...prev, ...newVideos]);
    toast.success(`${validFiles.length} vidéo${validFiles.length > 1 ? 's' : ''} ajoutée${validFiles.length > 1 ? 's' : ''} - Upload en cours...`);
    event.target.value = '';

    // Récupérer le token si besoin (à adapter selon votre logique d'auth)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    // Upload chaque vidéo avec axios
    await Promise.all(
      newVideos.map(async (video) => {
        const formData = new FormData();
        if (video.file) {
          formData.append("files", video.file);
          formData.append("type", "video");
          formData.append("folder", "series-videos");
        }
        try {
          setVideos(prev => prev.map(v => v.id === video.id ? { ...v, isUploading: true, uploadProgress: 0, uploadError: undefined } : v));
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/files/upload`,
            formData,
            {
              headers: {
                ...(token ? { Authorization: `basic ${token}` } : {}),
                "Content-Type": "multipart/form-data",
              },
              onUploadProgress: (progressEvent) => {
                const progress = progressEvent.total
                  ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                  : 0;
                setVideos(prev => prev.map(v => v.id === video.id ? { ...v, uploadProgress: progress } : v));
              },
            }
          );
          const result = response.data;
          setVideos(prev => prev.map(v =>
            v.id === video.id
              ? {
                  ...v,
                  isUploading: false,
                  uploadSuccess: true,
                  urlFichier: result.url || result.file?.filename,
                  uploadProgress: 100,
                  uploadError: undefined,
                }
              : v
          ));
          toast.success(`${video.file?.name} uploadé avec succès`);
        } catch (error: any) {
          setVideos(prev => prev.map(v =>
            v.id === video.id
              ? {
                  ...v,
                  isUploading: false,
                  uploadError: error?.response?.data?.message || error.message || "Erreur inconnue",
                  uploadProgress: 0,
                }
              : v
          ));
          toast.error(`Erreur upload ${video.file?.name}: ${error?.response?.data?.message || error.message}`);
        }
      })
    );
  };


  // ✅ Ajouter plusieurs vidéos par URL
  const handleAddMultipleVideoUrls = (urlsText: string) => {
    if (!urlsText.trim()) {
      toast.error("Veuillez saisir au moins une URL");
      return;
    }

    const urls = urlsText
      .split(/[\n,\s]+/)
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      toast.error("Aucune URL valide trouvée");
      return;
    }

    const validVideos: VideoItem[] = [];
    const errors: string[] = [];

    urls.forEach((url, index) => {
      try {
        new URL(url);
        
        const newVideo: VideoItem = {
          id: `url-${Date.now()}-${index}`,
          type: 'url',
          url,
          title: `Vidéo ${videos.length + validVideos.length + 1}`,
          uploadSuccess: true, // Les URLs sont considérées comme "prêtes"
        };
        
        validVideos.push(newVideo);
      } catch {
        errors.push(`URL invalide: ${url}`);
      }
    });

    if (validVideos.length > 0) {
      setVideos(prev => [...prev, ...validVideos]);
      toast.success(`${validVideos.length} vidéo${validVideos.length > 1 ? 's' : ''} ajoutée${validVideos.length > 1 ? 's' : ''}`);
    }

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }
  };

  // ✅ Ajouter une vidéo par URL
  const handleAddSingleVideoUrl = (url: string, title?: string) => {
    if (!url.trim()) {
      toast.error("URL requise");
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error("URL invalide");
      return;
    }

    const newVideo: VideoItem = {
      id: `url-${Date.now()}`,
      type: 'url',
      url: url.trim(),
      title: title?.trim() || `Vidéo ${videos.length + 1}`,
      uploadSuccess: true,
    };

    setVideos(prev => [...prev, newVideo]);
    toast.success("Vidéo ajoutée");
  };

  // ✅ Supprimer une vidéo
  const handleRemoveVideo = (videoId: string) => {
    // Annuler l'upload si en cours
    const controller = uploadControllers.get(videoId);
    if (controller) {
      controller.abort();
      setUploadControllers(prev => {
        const newMap = new Map(prev);
        newMap.delete(videoId);
        return newMap;
      });
    }
    
    setVideos(prev => prev.filter(video => video.id !== videoId));
  };

  // ✅ Soumission du formulaire avec validation des uploads
  const handleFormSubmit = async (formValues: SerieFormValues) => {
    // Vérifier que tous les uploads sont terminés
    const pendingUploads = videos.filter(v => v.isUploading);
    if (pendingUploads.length > 0) {
      toast.error(`${pendingUploads.length} upload(s) en cours. Veuillez attendre.`);
      return;
    }

    // Vérifier qu'il n'y a pas d'erreurs d'upload
    const failedUploads = videos.filter(v => v.type === 'upload' && v.uploadError && !v.uploadSuccess);
    if (failedUploads.length > 0) {
      toast.error(`${failedUploads.length} vidéo(s) ont échoué à l'upload. Réessayez ou supprimez-les.`);
      return;
    }

    // Formater les vidéos pour l'envoi
    const formattedVideos = videos
      .filter(v => v.uploadSuccess || v.type === 'url') // Seulement les vidéos prêtes
      .map(video => (video.urlFichier));

    const finalValues: any = {
      ...formValues,
      videos: formattedVideos,
    };

    try {
      await onSubmit(finalValues);
    } catch (error) {
      console.error('Erreur soumission formulaire:', error);
    }
  };

  const [urlInput, setUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [multiUrlInput, setMultiUrlInput] = useState("");
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  // Stats pour l'affichage
  const uploadStats = {
    total: videos.length,
    uploading: videos.filter(v => v.isUploading).length,
    success: videos.filter(v => v.uploadSuccess).length,
    errors: videos.filter(v => v.uploadError).length,
    files: videos.filter(v => v.type === 'upload').length,
    urls: videos.filter(v => v.type === 'url').length,
  };

  const canSubmit = uploadStats.uploading === 0 && uploadStats.errors === 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileVideo className="h-5 w-5" />
            {initialData ? "Modifier la série" : "Créer une série"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Modifiez les informations de la série et gérez ses vidéos."
              : "Créez une nouvelle série avec ses vidéos associées."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="libelle">Libellé de la série *</Label>
              <Input
                id="libelle"
                placeholder="Nom de la série..."
                {...register("libelle")}
                className={formState.errors.libelle ? "border-red-500" : ""}
              />
              {formState.errors.libelle && (
                <p className="text-sm text-red-500 mt-1">
                  {formState.errors.libelle.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="regulationTraffic">Réglementation routière</Label>
              <Input
                id="regulationTraffic"
                placeholder="Informations sur la réglementation..."
                {...register("regulationTraffic")}
              />
            </div>
            <div>
              <Label>Type de permis *</Label>
              <Select
                onValueChange={(value) => setValue("permitTypeId", value)}
               // value={ initialData?.permitTypeId || watch("permitTypeId") || "" }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type de permis" />
                </SelectTrigger>
                <SelectContent>
                  {permitTypes.map((pt) => (
                    <SelectItem key={pt._id} value={pt._id}>
                      {pt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formState.errors.permitTypeId && (
                <p className="text-sm text-red-500 mt-1">
                  {formState.errors.permitTypeId.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFree"
                checked={watch("isFree")}
                onCheckedChange={(checked) => setValue("isFree", !!checked)}
              />
              <Label htmlFor="isFree">Série gratuite</Label>
            </div>
          </div>

          {/* Gestion des vidéos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Vidéos ({videos.length})
              </Label>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "upload" | "url")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Fichier
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  URL Externe
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <Label htmlFor="video-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Sélectionner des vidéos
                    </p>
                    <p className="text-sm text-gray-600">
                      Cliquez pour sélectionner ou glissez-déposez vos fichiers
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Formats supportés: MP4, WebM, AVI, MOV • Max 100MB par fichier
                    </p>
                  </Label>
                </div>
                
                {/* Statistiques d'upload */}
                {videos.filter(v => v.type === 'upload').length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      📁 {videos.filter(v => v.type === 'upload').length} fichier(s) uploadé(s) • 
                      {videos.filter(v => v.isUploading).length > 0 && 
                        ` ${videos.filter(v => v.isUploading).length} en cours...`
                      }
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                {/* Toggle pour ajout simple/multiple */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={!showBulkAdd ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowBulkAdd(false)}
                  >
                    Ajout simple
                  </Button>
                  <Button
                    type="button"
                    variant={showBulkAdd ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowBulkAdd(true)}
                  >
                    Ajout multiple
                  </Button>
                </div>

                {!showBulkAdd ? (
                  /* Ajout simple */
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="https://youtube.com/watch?v=..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="col-span-2"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && urlInput.trim()) {
                            e.preventDefault();
                            handleAddSingleVideoUrl(urlInput, titleInput);
                            setUrlInput("");
                            setTitleInput("");
                          }
                        }}
                      />
                      <Input
                        placeholder="Titre (optionnel)"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        handleAddSingleVideoUrl(urlInput, titleInput);
                        setUrlInput("");
                        setTitleInput("");
                      }}
                      disabled={true}
                      className="w-full"
                    >
                      <Link className="mr-2 h-4 w-4" />
                      Ajouter la vidéo
                    </Button>
                  </div>
                ) : (
                  /* Ajout multiple */
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      URLs multiples (une par ligne)
                    </Label>
                    <textarea
                      placeholder={`https://youtube.com/watch?v=video1
https://vimeo.com/video2
https://example.com/video3.mp4

Vous pouvez coller plusieurs URLs, une par ligne`}
                      value={multiUrlInput}
                      onChange={(e) => setMultiUrlInput(e.target.value)}
                      className="w-full h-32 p-3 border rounded-lg resize-none text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          handleAddMultipleVideoUrls(multiUrlInput);
                          setMultiUrlInput("");
                        }}
                        disabled={true}
                        className="flex-1"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Ajouter toutes les vidéos
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setMultiUrlInput("")}
                      >
                        Effacer
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      💡 Conseil: Copiez-collez directement depuis YouTube, Vimeo, ou toute autre plateforme
                    </p>
                  </div>
                )}
                
                {/* Statistiques URL */}
                {videos.filter(v => v.type === 'url').length > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      🔗 {videos.filter(v => v.type === 'url').length} vidéo(s) externe(s) ajoutée(s)
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Liste des vidéos avec actions groupées */}
            {videos.length > 0 && (
              <div className="space-y-3">
                {/* Header avec actions groupées */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-sm">
                      {videos.length} vidéo{videos.length > 1 ? 's' : ''} ajoutée{videos.length > 1 ? 's' : ''}
                    </span>
                    {videos.some(v => v.isUploading) && (
                      <Badge variant="outline" className="animate-pulse">
                        {videos.filter(v => v.isUploading).length} upload(s) en cours
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {videos.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setVideos([]);
                          toast.success("Toutes les vidéos supprimées");
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Tout supprimer
                      </Button>
                    )}
                  </div>
                </div>

                {/* Liste des vidéos */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {videos.map((video, index) => (
                    <div key={video.id} className="relative">
                      {/* Numéro de vidéo */}
                      <div className="absolute -left-2 -top-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
                        {index + 1}
                      </div>
                      <VideoPreview
                        video={video}
                        onRemove={() => handleRemoveVideo(video.id)}
                      />
                    </div>
                  ))}
                </div>

                {/* Résumé */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-800">
                      {videos.filter(v => v.type === 'upload').length}
                    </div>
                    <div className="text-blue-600">Fichiers uploadés</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-800">
                      {videos.filter(v => v.type === 'url').length}
                    </div>
                    <div className="text-blue-600">Vidéos externes</div>
                  </div>
                </div>
              </div>
            )}

            {/* Message d'aide quand aucune vidéo */}
            {videos.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileVideo className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucune vidéo ajoutée</p>
                <p className="text-xs mt-1">Utilisez les onglets ci-dessus pour ajouter vos vidéos</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || videos.some(v => v.isUploading)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {initialData ? "Modification..." : "Création..."}
                </>
              ) : (
                initialData ? "Mettre à jour" : "Créer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};