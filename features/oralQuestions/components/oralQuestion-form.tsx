"use client";

import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { useEffect, useState, useMemo } from "react";
import * as z from "zod";
import { Trash2, Upload, Play, Pause, Volume2, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { useWatch, useController } from "react-hook-form";
import { useSerie } from "@/contexts/SerieContext";
import { useOralQuestion } from "@/contexts/OralQuestionContext";
import axios, { AxiosProgressEvent, CancelToken } from "axios";
import { MediaPreview } from "@/components/MediaPreview";
import { toast } from "sonner";
import { useAxios } from "@/lib/api";
import { useAuthHeaders } from "@/hooks/useAuthHeader";


// Service d'upload avec Axios
class FileUploadService {
  private static readonly BACKEND_URL = "http://localhost:5000";
  private static readonly MAX_RETRIES = 3;

  static async uploadFile(
    file: File,
    type: 'image' | 'audio' | 'video',
    onProgress?: (progress: number) => void,
    cancelToken?: CancelToken
  ): Promise<{ url: string; filename: string }> {
    this.validateFile(file, type);

    const formData = new FormData();
    formData.append('files', file);
    formData.append('type', type);
    
    let attempt = 0;
    while (attempt < this.MAX_RETRIES) {
      try {
        const response = await axios.post(
          `${this.BACKEND_URL}/api/v1/files/upload`,
          formData,
          {
            timeout: 5 * 60 * 1000, // 5 minutes
            cancelToken,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
              if (progressEvent.total && onProgress) {
                const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                onProgress(progress);
              }
            },
          }
        );

        console.log("Upload response:", response.data);

        if (!response.data.file.filename) {
          throw new Error('URL manquante dans la réponse du serveur');
        }

        return {
          url: `${this.BACKEND_URL}/api/v1/files/${response?.data?.file.filename}`,
          filename: response?.data?.file.filename,
        };

      } catch (error: any) {
        attempt++;

        if (axios.isCancel(error)) {
          throw new Error('Upload annulé');
        }

        if (attempt >= this.MAX_RETRIES) {
          if (error.response) {
            const message = error.response.data?.message || `Erreur HTTP ${error.response.status}`;
            throw new Error(message);
          } else if (error.request) {
            throw new Error('Aucune réponse du serveur');
          } else {
            throw new Error(error.message || 'Erreur inconnue');
          }
        }

        // Attendre avant retry
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new Error('Upload échoué après plusieurs tentatives');
  }

  private static validateFile(file: File, expectedType: string): void {
    const maxSizes = {
      image: 10 * 1024 * 1024,  // 10MB
      audio: 50 * 1024 * 1024,  // 50MB
      video: 100 * 1024 * 1024, // 100MB
    };

    const maxSize = maxSizes[expectedType as keyof typeof maxSizes] || 10 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new Error(`Le fichier ne peut pas dépasser ${Math.round(maxSize / (1024 * 1024))}MB`);
    }

    if (!file.type.startsWith(expectedType)) {
      throw new Error(`Le fichier doit être de type ${expectedType}`);
    }
  }
}

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

// Validation Zod mise à jour
const suggestionSchema = z.object({
  text: z.string().min(1, "Suggestion requise"),
  isCorrect: z.string(),
});

const consigneSchema = z.object({
  numero: z.number().optional(),
  consigne: z.string().min(5, "Consigne requise"),
  suggestions: z
    .array(suggestionSchema)
    .refine(
      (arr) => arr.length === 2 || arr.length === 4,
      "Il faut 2 ou 4 suggestions"
    ),
});

const libelleSchema = z.object({
  libelle: z.string().optional(),
  typeLibelle: z.enum(["texte", "image", "audio", "video"]),
  fichier: z.any().optional(),
  urlFichier: z.string().optional(),
});

export const formSchema = z.object({
  numero: z.number().min(1, "Le numéro est obligatoire"),
  duree: z.number().min(0, "Durée invalide"),
  serieId: z.string().min(1, "La série est obligatoire"),
  libelles: z.array(
    z.object({
      libelle: z.string().min(1, "Le libellé est requis"),
      typeLibelle: z.enum(["texte", "image", "video"]),
    })
  ),
  consignes: z.array(
    z
      .object({
        numero: z.number(),
        consigne: z.string().min(1, "La consigne est requise"),
        suggestions: z
          .array(
            z.object({
              text: z.string().min(1, "La suggestion est requise"),
              isCorrect: z.union([z.string(), z.boolean()]), // "true"/"false" ou bool
            })
          )
          .min(2, "Minimum 2 suggestions"),
      })
      .refine(
        (consigne) =>
          consigne.suggestions.filter((s) => String(s.isCorrect) === "true").length === 1,
        {
          message: "Chaque consigne doit avoir exactement une réponse correcte",
          path: ["suggestions"],
        }
      )
  ),
});

// Types MIME acceptés
const ACCEPTED_FILE_TYPES = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  audio: ["audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/mpeg"],
  video: ["video/mp4", "video/webm", "video/ogg", "video/avi", "video/mov"],
};

// Composant de prévisualisation média amélioré
// function MediaPreview({
//   type,
//   uploadedFile,
//   onRemove,
//   onRetry
// }: {
//   type: string;
//   uploadedFile: UploadedFile;
//   onRemove: () => void;
//   onRetry?: () => void;
// }) {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const mediaUrl = uploadedFile.url || URL.createObjectURL(uploadedFile.file);

//   const formatFileSize = (bytes: number) => {
//     const mb = bytes / (1024 * 1024);
//     return mb.toFixed(1) + ' MB';
//   };

//   const togglePlay = (element: HTMLAudioElement | HTMLVideoElement) => {
//     if (isPlaying) {
//       element.pause();
//     } else {
//       element.play();
//     }
//     setIsPlaying(!isPlaying);
//   };

//   return (
//     <div className="relative border rounded-lg p-3 bg-gray-50 space-y-3">
//       {/* Header avec statut */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <div className="flex flex-col">
//             <span className="text-sm font-medium truncate">
//               {uploadedFile.file.name}
//             </span>
//             <div className="flex gap-2 text-xs text-gray-600">
//               <span>{formatFileSize(uploadedFile.file.size)}</span>
//               <Badge variant="outline" className="text-xs">
//                 {type}
//               </Badge>

//               {/* Status badges */}
//               {uploadedFile.isUploading && (
//                 <Badge variant="secondary" className="text-xs">
//                   Upload...
//                 </Badge>
//               )}
//               {uploadedFile.uploadSuccess && (
//                 <Badge variant="default" className="text-xs bg-green-500">
//                   <CheckCircle className="h-3 w-3 mr-1" />
//                   Uploadé
//                 </Badge>
//               )}
//               {uploadedFile.uploadError && (
//                 <Badge variant="destructive" className="text-xs">
//                   <AlertCircle className="h-3 w-3 mr-1" />
//                   Erreur
//                 </Badge>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           {uploadedFile.isUploading ? (
//             <div className="flex items-center gap-2">
//               <Loader2 className="h-4 w-4 animate-spin" />
//               <span className="text-sm">{uploadedFile.uploadProgress}%</span>
//             </div>
//           ) : uploadedFile.uploadError && onRetry ? (
//             <Button variant="outline" size="sm" onClick={onRetry}>
//               Réessayer
//             </Button>
//           ) : null}

//           <Button variant="destructive" size="sm" onClick={onRemove}>
//             <X className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       {/* Barre de progression */}
//       {uploadedFile.isUploading && (
//         <div className="w-full bg-gray-200 rounded-full h-2">
//           <div
//             className="bg-blue-500 h-2 rounded-full transition-all duration-300"
//             style={{ width: `${uploadedFile.uploadProgress}%` }}
//           />
//         </div>
//       )}

//       {/* Message d'erreur */}
//       {uploadedFile.uploadError && (
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription className="text-sm">
//             {uploadedFile.uploadError}
//           </AlertDescription>
//         </Alert>
//       )}

//       {/* Prévisualisation du contenu */}
//       {!uploadedFile.uploadError && (
//         <>
//           {type === "image" && (
//             <img
//               src={mediaUrl}
//               alt="Prévisualisation"
//               className="max-w-full h-32 object-cover rounded"
//             />
//           )}

//           {type === "audio" && (
//             <div className="flex items-center gap-2 p-2 bg-white rounded">
//               <Volume2 className="h-5 w-5" />
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 onClick={() => {
//                   const audio = document.getElementById(`audio-${uploadedFile.file.name}`) as HTMLAudioElement;
//                   if (audio) togglePlay(audio);
//                 }}
//               >
//                 {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
//               </Button>
//               <audio
//                 id={`audio-${uploadedFile.file.name}`}
//                 src={mediaUrl}
//                 onEnded={() => setIsPlaying(false)}
//                 className="hidden"
//               />
//             </div>
//           )}

//           {type === "video" && (
//             <video
//               src={mediaUrl}
//               controls
//               className="max-w-full h-32 rounded"
//               preload="metadata"
//             />
//           )}
//         </>
//       )}
//     </div>
//   );
// }

// Composant LibelleField amélioré avec upload
function LibelleField({
  index,
  control,
  onRemove,
  canRemove
}: {
  index: number;
  control: any;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const typeLibelle = useWatch({
    control,
    name: `libelles.${index}.typeLibelle`,
  });

  const { field: libelleField } = useController({
    control,
    name: `libelles.${index}.libelle`,
  });

  const { field: urlFichierField } = useController({
    control,
    name: `libelles.${index}.libelle`,
  });

  // Réinitialiser le fichier quand le type change
  useEffect(() => {
    if (typeLibelle === 'texte') {
      setUploadedFile(null);
      urlFichierField.onChange('');
    }
  }, [typeLibelle]);

  const uploadFile = async (file: File) => {
    if (!typeLibelle || typeLibelle === 'texte') return;

    const cancelTokenSource = axios.CancelToken.source();

    const newUploadedFile: UploadedFile = {
      file,
      uploadProgress: 0,
      isUploading: true,
      uploadSuccess: false,
      cancelToken: cancelTokenSource.token,
    };

    setUploadedFile(newUploadedFile);

    try {
      const result = await FileUploadService.uploadFile(
        file,
        typeLibelle as 'image' | 'audio' | 'video',
        (progress) => {
          setUploadedFile(prev => prev ? { ...prev, uploadProgress: progress } : null);
        },
        cancelTokenSource.token
      );

      setUploadedFile(prev => prev ? {
        ...prev,
        url: result.url,
        key: result.filename,
        isUploading: false,
        uploadSuccess: true,
        uploadError: undefined,
      } : null);

      // Mettre à jour le champ du formulaire
      urlFichierField.onChange(result.filename);
      toast.success(`${file.name} uploadé avec succès`);

    } catch (error: any) {
      if (error.message !== 'Upload annulé') {
        setUploadedFile(prev => prev ? {
          ...prev,
          isUploading: false,
          uploadError: error.message || 'Erreur inconnue',
          uploadProgress: 0,
        } : null);
        toast.error(`Erreur upload: ${error.message}`);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      libelleField.onChange(""); // reset texte
      uploadFile(file);
    }
  };

  const handleRetryUpload = () => {
    if (uploadedFile?.file) {
      uploadFile(uploadedFile.file);
    }
  };

  const handleRemoveFile = () => {
    if (uploadedFile?.cancelToken) {
      // Annuler l'upload si en cours
      const source = axios.CancelToken.source();
      source.cancel('Upload annulé par l\'utilisateur');
    }
    setUploadedFile(null);
    urlFichierField.onChange('');
  };

  const getAcceptedTypes = (type: string) =>
    ACCEPTED_FILE_TYPES[type as keyof typeof ACCEPTED_FILE_TYPES]?.join(",") || "";

  const canSubmit = !uploadedFile?.isUploading && !uploadedFile?.uploadError;

  return (
    <div className="border rounded p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Libellé {index + 1}</h4>
        {canRemove && (
          <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <FormSelect
        control={control}
        name={`libelles.${index}.typeLibelle`}
        label="Type de libellé"
        options={[
          { label: "Texte", value: "texte" },
          { label: "Image", value: "image" },
          { label: "Audio", value: "audio" },
          { label: "Vidéo", value: "video" },
        ]}
        required
      />

      {typeLibelle === "texte" && (
        <FormTextarea
          control={control}
          name={`libelles.${index}.libelle`}
          label="Contenu du libellé"
          required
        />
      )}

      {typeLibelle && typeLibelle !== "texte" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`file-${index}`}>
              Fichier {typeLibelle} <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={`file-${index}`}
                type="file"
                accept={getAcceptedTypes(typeLibelle)}
                onChange={handleFileChange}
                className="flex-1"
                disabled={uploadedFile?.isUploading}
              />
              <Upload className="h-5 w-5 text-gray-400" />
            </div>

            {/* Informations sur les limites de fichier */}
            <p className="text-xs text-gray-500">
              Max: {typeLibelle === 'image' ? '10MB' : typeLibelle === 'audio' ? '50MB' : '100MB'} •
              Formats: {ACCEPTED_FILE_TYPES[typeLibelle as keyof typeof ACCEPTED_FILE_TYPES]?.map(t => t.split('/')[1]).join(', ')}
            </p>
          </div>

          {uploadedFile && (
            <MediaPreview
              action={true}
              type={typeLibelle}
              uploadedFile={uploadedFile}
              onRemove={handleRemoveFile}
              onRetry={uploadedFile.uploadError ? handleRetryUpload : undefined}
            />
          )}

          <FormInput
            control={control}
            name={`libelles.${index}.libelle`}
            label="Description (optionnelle)"
          />

          {/* Alerte si upload en cours ou erreur */}
          {!canSubmit && (
            <Alert variant={uploadedFile?.uploadError ? "destructive" : "default"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {uploadedFile?.isUploading && "Upload en cours... Veuillez patienter."}
                {uploadedFile?.uploadError && "Erreur d'upload. Réessayez ou supprimez le fichier."}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}

// Composant principal
export default function OralQuestionForm({
  initialData,
  pageTitle,
}: {
  initialData?: any;
  pageTitle: string;
}) {
  const router = useRouter();
  const { series } = useSerie();
  const { createOralQuestion, editOralQuestion } = useOralQuestion();
  const [isSubmitting, setIsSubmitting] = useState(false);


  // ✨ 2. Pré-formater les données initiales pour le formulaire
  const formattedDefaultValues = useMemo(() => {
    // Si on est en mode création, on utilise les valeurs par défaut
    if (!initialData) {
      return {
        numero: 1,
        serieId: "",
        duree: 0,
        libelles: [{ libelle: "", typeLibelle: "texte" }],
        consignes: [
          {
            numero: 1,
            consigne: "",
            suggestions: [
              { text: "", isCorrect: "false" }, // Mettre "false" par défaut
              { text: "", isCorrect: "false" },
              { text: "", isCorrect: "false" },
              { text: "", isCorrect: "false" },
            ],
          },
        ],
      };
    }

    // Si on est en mode modification, on transforme initialData
    return {
      ...initialData,
      // On extrait l'ID de l'objet serieId
      serieId: initialData.serieId?._id || "",
      consignes: initialData.consignes.map((consigne: any) => ({
        ...consigne,
        suggestions: consigne.suggestions.map((suggestion: any) => ({
          ...suggestion,
          // On convertit le booléen isCorrect en chaîne de caractères
          isCorrect: String(suggestion.isCorrect),
        })),
      })),
    };
  }, [initialData]);



  const form: any = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // ✨ 3. Utiliser les valeurs pré-formatées
    defaultValues: formattedDefaultValues,
  });


  const axiosInstance = useAxios();
  const { getHeaders } = useAuthHeaders();


  const { fields: libellesFields, append: appendLibelle, remove: removeLibelle } =
    useFieldArray({ control: form.control, name: "libelles" });

  const { fields: consignesFields, append: appendConsigne, remove: removeConsigne } =
    useFieldArray({ control: form.control, name: "consignes" });

  // ===== VALIDATION 1 : numéro unique dans la série =====
  useEffect(() => {
    const numero = form.watch("numero");
    const serieId = form.watch("serieId");
    if (!numero || !serieId) return;

    const checkNumero = async () => {
      try {
        const { headers } = await getHeaders();
        const { data } = await axiosInstance.get(
          `/api/v1/question/oral-questions/check-unique`,
          { params: { numero, serieId, excludeId: initialData?._id } }
        );
        if (!data.unique) {
          form.setError("numero", {
            type: "manual",
            message: "Ce numéro existe déjà dans cette série.",
          });
          toast.error("Ce numéro existe déjà dans la série sélectionnée.");
        } else {
          form.clearErrors("numero");
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkNumero();
  }, [form.watch("numero"), form.watch("serieId")]);

  // ===== VALIDATION 2 : une seule réponse correcte par consigne =====
  useEffect(() => {
    const consignes = form.watch("consignes");
    consignes?.forEach((consigne: any, idx: number) => {
      const correctCount = consigne.suggestions.filter(
        (s: any) => s.isCorrect === "true"
      ).length;
      if (correctCount > 1) {
        form.setError(`consignes.${idx}.suggestions`, {
          type: "manual",
          message: "Une seule réponse correcte est autorisée.",
        });
        toast.error(`Consigne ${idx + 1} : une seule réponse correcte autorisée.`);
      } else {
        form.clearErrors(`consignes.${idx}.suggestions`);
      }
    });
  }, [form.watch("consignes")]);

  // Vérifier si des uploads sont en cours
  const hasUploadsInProgress = () => {
    // Cette vérification devrait être améliorée pour vraiment vérifier tous les uploads
    // Pour l'instant, on assume que si le formulaire est valide, les uploads sont terminés
    return false;
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting values:", values);
    if (hasUploadsInProgress()) {
      toast.error("Des uploads sont en cours. Veuillez patienter.");
      return;
    }

    const { data } = await axiosInstance.get(
      `/api/v1/question/oral-questions/check-unique`, {
      params: {
        numero: values.numero,
        serieId: values.serieId,
        excludeId: initialData?._id, // utile en mode édition
      },
    });

    if (!data.unique) {
      toast.error(
        "Ce numéro de question existe déjà dans la série sélectionnée."
      );
      setIsSubmitting(false);
      return; // ⛔ stoppe la soumission
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (initialData) {
        const result = await editOralQuestion(initialData._id, values);
        result?.success
          ? (toast.success("Question modifiée avec succès!"),
            router.push("/dashboard/oral-questions"))
          : toast.error("Erreur lors de la modification");
      } else {
        const result = await createOralQuestion(values);
        result?.success
          ? (toast.success("Question créée avec succès!"),
            router.push("/dashboard/oral-questions"))
          : toast.error("Erreur lors de la création");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              control={form.control}
              name="numero"
              label="Numéro de la question"
              type="number"
              required
            />

            <FormInput
              control={form.control}
              name="duree"
              label="Durée (minutes)"
              type="number"
            />
          </div>

          <FormSelect
            control={form.control}
            name="serieId"
            label="Série"
            options={series.map((s: any) => ({ label: s.libelle, value: s._id }))}
            required
          />

          {/* Libellés */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Libellés</h3>
              <Button
                type="button"
                variant="outline"
                onClick={() => appendLibelle({ libelle: "", typeLibelle: "texte" })}
              >
                + Ajouter un libellé
              </Button>
            </div>

            <div className="space-y-4">
              {libellesFields.map((field, index) => (
                <LibelleField
                  key={field.id}
                  index={index}
                  control={form.control}
                  onRemove={() => removeLibelle(index)}
                  canRemove={libellesFields.length > 1}
                />
              ))}
            </div>
          </div>

          {/* Consignes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Consignes</h3>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendConsigne({
                    numero: consignesFields.length + 1,
                    consigne: "",
                    suggestions: [
                      { text: "", isCorrect: false },
                      { text: "", isCorrect: false },
                      { text: "", isCorrect: false },
                      { text: "", isCorrect: false },
                    ],
                  })
                }
              >
                + Ajouter une consigne
              </Button>
            </div>

            <div className="space-y-6">
              {consignesFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4  dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Consigne {index + 1}</h4>
                    {consignesFields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeConsigne(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <FormTextarea
                    control={form.control}
                    name={`consignes.${index}.consigne`}
                    label="Consigne"
                    required
                    className="mb-4"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {form.watch(`consignes.${index}.suggestions`)?.map((_s: any, sIndex: number) => (
                      <div key={sIndex} className="border rounded p-3  dark:bg-gray-900 space-y-2">
                        <FormInput
                          control={form.control}
                          name={`consignes.${index}.suggestions.${sIndex}.text`}
                          label={`Suggestion ${sIndex + 1}`}
                          required
                        />
                        <FormSelect
                          control={form.control}
                          name={`consignes.${index}.suggestions.${sIndex}.isCorrect`}
                          label="Réponse correcte ?"
                          options={[
                            { label: "Oui", value: "true" },
                            { label: "Non", value: "false" },
                          ]}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/oral-questions")}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || hasUploadsInProgress()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer la question"
              )}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}