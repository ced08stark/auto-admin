"use client";

import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import * as z from "zod";
import { Trash2, Upload, Play, Pause, Volume2 } from "lucide-react";
import { useWatch, useController } from "react-hook-form";
import { useSerie } from "@/contexts/SerieContext";
import { useOralQuestion } from "@/contexts/OralQuestionContext";

// ✅ Validation Zod basée sur ton schema Mongoose
const suggestionSchema = z.object({
  text: z.string().min(1, "Suggestion requise"),
  isCorrect: z.boolean(),
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
  fichier: z.any().optional(), // Pour les fichiers uploadés
  urlFichier: z.string().optional(), // URL du fichier stocké
});

const formSchema = z.object({
  numero: z.number(),
  libelles: z.array(libelleSchema).min(1, "Au moins un libellé"),
  consignes: z.array(consigneSchema).min(1, "Au moins une consigne"),
  serieId: z.string().min(1, "Série requise"),
  duree: z.number().optional(),
});

// Types MIME acceptés par type de libellé
const ACCEPTED_FILE_TYPES = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  audio: ["audio/mp3", "audio/wav", "audio/ogg", "audio/m4a"],
  video: ["video/mp4", "video/webm", "video/ogg", "video/avi"],
};

interface MediaPreviewProps {
  type: string;
  file: File | null;
  url?: string;
  onRemove: () => void;
}

function MediaPreview({ type, file, url, onRemove }: MediaPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaUrl = file ? URL.createObjectURL(file) : url;

  if (!mediaUrl) return null;

  const togglePlay = (audioElement: HTMLAudioElement | HTMLVideoElement) => {
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative border rounded p-2 bg-gray-50">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="absolute top-1 right-1 z-10"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {type === "image" && (
        <img
          src={mediaUrl}
          alt="Prévisualisation"
          className="max-w-full h-32 object-cover rounded"
        />
      )}

      {type === "audio" && (
        <div className="flex items-center gap-2 p-2">
          <Volume2 className="h-5 w-5" />
          <span className="text-sm">{file?.name || "Audio"}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const audio = document.getElementById(`audio-${mediaUrl}`) as HTMLAudioElement;
              if (audio) togglePlay(audio);
            }}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <audio
            id={`audio-${mediaUrl}`}
            src={mediaUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      )}

      {type === "video" && (
        <div className="space-y-2">
          <video
            src={mediaUrl}
            controls
            className="max-w-full h-32 rounded"
            preload="metadata"
          />
          <p className="text-xs text-gray-600">{file?.name || "Vidéo"}</p>
        </div>
      )}
    </div>
  );
}

interface LibelleFieldProps {
  index: number;
  control: any;
  onRemove: () => void;
  canRemove: boolean;
}


function LibelleField({ index, control, onRemove, canRemove }: LibelleFieldProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 🔎 Observer le type choisi pour ce libellé
  const typeLibelle = useWatch({
    control,
    name: `libelles.${index}.typeLibelle`,
  });

  const { field: libelleField } = useController({
    control,
    name: `libelles.${index}.libelle`,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Ici, vous pourriez uploader vers votre backend et stocker l'URL
      libelleField.onChange(""); // reset du champ texte car on est sur fichier
    }
  };

  const getAcceptedTypes = (type: string) => {
    return ACCEPTED_FILE_TYPES[type as keyof typeof ACCEPTED_FILE_TYPES]?.join(",") || "";
  };

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

      {/* Sélecteur du type */}
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

      {/* Affichage dynamique selon le type */}
      {typeLibelle === "texte" && (
        <FormTextarea
          control={control}
          name={`libelles.${index}.libelle`}
          label="Contenu du libellé"
          required
        />
      )}

      {typeLibelle && typeLibelle !== "texte" && (
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
            />
            <Upload className="h-5 w-5 text-gray-400" />
          </div>

          {selectedFile && (
            <MediaPreview
              type={typeLibelle}
              file={selectedFile}
              onRemove={() => setSelectedFile(null)}
            />
          )}

          {/* Description associée */}
          <FormInput
            control={control}
            name={`libelles.${index}.libelle`}
            label="Description (optionnelle)"
            placeholder={`Description du ${typeLibelle}...`}
          />
        </div>
      )}
    </div>
  );
}

export default function WrittenQuestionForm({
  initialData,
  pageTitle,
}: {
  initialData?: any;
  pageTitle: string;
}) {
  const router = useRouter();
  const { series } = useSerie();
  console.log("Available series:", series);
  const { createOralQuestion } = useOralQuestion();


  const form: any = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      numero: 1,
      duree: undefined,
      libelles: [{ libelle: "", typeLibelle: "texte" }],
      consignes: [
        {
          numero: 1,
          consigne: "",
          suggestions: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        },
      ],
    },
  });

  const { fields: libellesFields, append: appendLibelle, remove: removeLibelle } = useFieldArray({
    control: form.control,
    name: "libelles",
  });

  const { fields: consignesFields, append: appendConsigne, remove: removeConsigne } = useFieldArray({
    control: form.control,
    name: "consignes",
  });

async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("✅ Form submitted", values);
    // Ici vous devriez gérer l'upload des fichiers avant de sauvegarder

    const result = await createOralQuestion(values);
    if (result?.success) {
      router.push("/dashboard/oral-questions");
    }
    else{
      alert("created question failure")
    }
    // Optionally, handle error feedback here
  }
  return (
    <Card className="mx-auto w-full max-w-4xl">{/*max-w-4xl*/}
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Numéro de question */}
            <FormInput
              control={form.control}
              name="numero"
              label="Numéro de la question"
              type="number"
              required
            />

            {/* Durée */}
            <FormInput
              control={form.control}
              name="duree"
              label="Durée (minutes)"
              type="number"
            />
          </div>

          {/* ⚡ Select Serie */}
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
                    ],
                  })
                }
              >
                + Ajouter une consigne
              </Button>
            </div>

            <div className="space-y-6">
              {consignesFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormInput
                      control={form.control}
                      name={`consignes.${index}.numero`}
                      label="Numéro consigne"
                      type="number"
                    />
                  </div>

                  <FormTextarea
                    control={form.control}
                    name={`consignes.${index}.consigne`}
                    label="Consigne"
                    required
                    className="mb-4"
                  />

                  {/* Suggestions */}
                  <div>
                    <h5 className="font-medium mb-2">Suggestions de réponse</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {form.watch(`consignes.${index}.suggestions`)?.map(
                        (_s: any, sIndex: number) => (
                          <div
                            key={sIndex}
                            className="border rounded p-3 bg-white space-y-2"
                          >
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
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/written-questions")}
            >
              Annuler
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Enregistrer la question
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}