import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export const getServerAuthHeaders = (req: NextRequest) => {
  const auth = getAuth(req);

  if (!auth.userId) {
    throw new Error("Utilisateur non authentifié côté serveur.");
  }

  // auth a une méthode getToken()
  return auth.getToken({ template: "backend" }).then((token) => {
    if (!token) throw new Error("Impossible d'obtenir un token.");
    return { headers: { Authorization: `Bearer ${token}` } };
  });
};
