import { createClient } from 'next-sanity';
import { isSanityConfigured, sanityApiVersion, sanityDataset, sanityProjectId } from './env';

export const sanityClient = isSanityConfigured()
  ? createClient({
      projectId: sanityProjectId!,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      useCdn: true,
      token: process.env.SANITY_API_READ_TOKEN,
    })
  : null;
