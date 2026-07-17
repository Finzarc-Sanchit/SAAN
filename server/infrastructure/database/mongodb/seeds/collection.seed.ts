import { connectMongo, disconnectMongo } from '../connection';
import { CollectionModel } from '../models/collection.model';

const collectionSeeds = [
  {
    slug: 'bloody-maroon',
    title: 'Bloody Maroon',
    description: 'A study in depth.',
    tagline: 'The red that commands a room.',
    imageUrl:
      'https://saanlabel.com/cdn/shop/files/19_R_9677c92a-8ca8-4b39-b4e8-6e836ed93c71.jpg?width=1600',
    imageAlt: 'Bloody Maroon',
    status: 'published',
    sortOrder: 0,
    featured: true,
  },
  {
    slug: 'ek-sunheri-dopahar',
    title: 'Ek Sunheri Dopahar',
    description: 'A golden afternoon.',
    tagline: 'Captured in threads of light.',
    imageUrl: 'https://saanlabel.com/cdn/shop/files/02.jpg?width=1600',
    imageAlt: 'Ek Sunheri Dopahar',
    status: 'published',
    sortOrder: 1,
    featured: true,
  },
  {
    slug: 'jhalak',
    title: 'Jhalak',
    description: 'A glimpse, dressed in shadow.',
    tagline: 'Where light meets the unseen.',
    imageUrl:
      'https://saanlabel.com/cdn/shop/files/3_925dc4ea-9e16-4897-82ea-de87552d9bb6.jpg?width=1600',
    imageAlt: 'Jhalak',
    status: 'published',
    sortOrder: 2,
    featured: true,
  },
  {
    slug: 'shells',
    title: 'Shells',
    description: 'Found ornament.',
    tagline: "The ocean's quiet geometry.",
    imageUrl:
      'https://saanlabel.com/cdn/shop/files/2_a6ac4a17-31d9-4ce1-bb19-e11eacbd2a4b.jpg?width=800',
    imageAlt: 'Shells',
    status: 'published',
    sortOrder: 3,
    featured: true,
  },
  {
    slug: 'effortless',
    title: 'Effortless',
    description: 'Everyday, intentional.',
    tagline: 'Design for a simpler pace.',
    imageUrl: 'https://saanlabel.com/cdn/shop/files/5_R.jpg?width=3840',
    imageAlt: 'Effortless',
    status: 'published',
    sortOrder: 4,
    featured: false,
  },
] as const;

export async function seedCollections(): Promise<number> {
  const result = await CollectionModel.bulkWrite(
    collectionSeeds.map((collection) => ({
      updateOne: {
        filter: { slug: collection.slug },
        update: { $set: collection },
        upsert: true,
      },
    })),
  );
  return result.upsertedCount + result.modifiedCount;
}

async function run(): Promise<void> {
  await connectMongo();
  const changedCount = await seedCollections();
  console.log(`Collection seed complete: ${changedCount} records inserted or updated.`);
  await disconnectMongo();
}

if (require.main === module) {
  run().catch(async (error: unknown) => {
    console.error('Collection seed failed', error);
    await disconnectMongo();
    process.exit(1);
  });
}
