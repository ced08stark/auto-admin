import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useAuth } from "@clerk/nextjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${sizeType === 'accurate'
      ? (accurateSizes[i] ?? 'Bytest')
      : (sizes[i] ?? 'Bytes')
    }`;
}



export const getAuthHeaders = async () => {
  const { getToken } = useAuth();
  const token = await getToken({ template: "backend" });
  if (!token) throw new Error("Utilisateur non authentifié. Veuillez vous connecter.");
  return { headers: { Authorization: `Bearer ${token}` } };
};

