
export type User = {
    _id?: string;
    name: string;
    email: string;
    password: string;
    role?: "admin" | "candidate";
    codePromo: string;
    parrain?: string;
    refreshToken?: string;
    solde?: number;
};

export type OralQuestion = {
    _id?: string;
    numero: number;
    libelles: { libelle: string; typeLibelle: string }[];
    consignes: {
        numero?: number;
        consigne: string;
        suggestions: { text: string; isCorrect: boolean }[];
    }[];
    serieId: Serie;
    duree?: number;
    startedAt?: Date;
};

export type WrittenQuestion = {
    _id?: string;
    numero: number;
    libelles: { libelle: string; typeLibelle: string }[];
    consignes: {
        numero?: number;
        consigne: string;
        suggestions: { text: string; isCorrect: boolean }[];
    }[];
    serieId: Serie;
    duree?: number;
    startedAt?: Date;
};


export type Serie = {
    _id?: string;
    libelle: string;
    regulationTraffic?: string;
    videos?: string[];
    isFree?: boolean;
    startedAt?: Date;
};

export type PermitType = {
    _id?: string;
    name: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export enum MotifEnum {
    SUBSCRIPTION_PACK = "subscription_pack",
}

export type Transaction = {
    _id?: string;
    montant: number;
    motif?: MotifEnum;
    isvalid?: boolean;
    reference: string;
    user: string; // ObjectId
    parrain?: string; // ObjectId
    createdAt?: Date;
};


export type WrittenTest = {
    _id?: string;
    serie: string; // ObjectId
    user: string;  // ObjectId
    payload?: string;
    resultat: number;
    createdAt?: Date;
};
