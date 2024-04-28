
export type SanityEnv = {
    SANITY_PROJECT_ID: string;
    SANITY_DATASET: string;
    SANITY_API_VERSION: string;
    SANITY_PERSPECTIVE: string;
    SANITY_TOKEN: string;
};

export const config = process.env;