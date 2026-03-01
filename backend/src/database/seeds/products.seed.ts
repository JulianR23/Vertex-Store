import { DataSource } from 'typeorm';
import { ProductEntity } from '../entities/product.entity';

const AIRPODS_PRODUCTS: Omit<
  ProductEntity,
  'id' | 'createdAt' | 'updatedAt' | 'transactions'
>[] = [
  {
    name: 'AirPods Pro (2nd Generation)',
    description:
      'Immersive audio experience with Active Noise Cancellation. Features Adaptive Transparency, Personalized Spatial Audio with dynamic head tracking, and up to 30 hours of battery life with the MagSafe Charging Case. Powered by the Apple H2 chip.',
    imageUrl:
      'https://vertex-store-assets.s3.us-east-2.amazonaws.com/airpodsPro-2gen.jpg',
    priceInCents: 110000000,
    stock: 10,
    isActive: true,
  },
  {
    name: 'AirPods (3rd Generation)',
    description:
      'Spatial Audio with dynamic head tracking brings music to life around you. Contoured design with shorter stem. Force sensor controls. Water-resistant design. Up to 6 hours of listening time with one charge.',
    imageUrl:
      'https://vertex-store-assets.s3.us-east-2.amazonaws.com/airpods-3gen.jpg',
    priceInCents: 95000000,
    stock: 15,
    isActive: true,
  },
  {
    name: 'AirPods Max',
    description:
      'Over-ear headphones with high-fidelity audio, Active Noise Cancellation, and Transparency mode. Premium acoustic design with computational audio. Up to 20 hours of listening with ANC and spatial audio enabled.',
    imageUrl:
      'https://vertex-store-assets.s3.us-east-2.amazonaws.com/airpodsMax.jpg',
    priceInCents: 200000000,
    stock: 5,
    isActive: true,
  },
];

export const seedProducts = async (dataSource: DataSource): Promise<void> => {
  const repository = dataSource.getRepository(ProductEntity);

  for (const data of AIRPODS_PRODUCTS) {
    const existing = await repository.findOneBy({ name: data.name });
    if (existing) {
      const { stock, ...dataWithoutStock } = data;
      await repository.update(existing.id, dataWithoutStock);
      console.log(
        `🔄 Updated: ${data.name} (stock preserved: ${existing.stock})`,
      );
    } else {
      await repository.save(repository.create(data));
      console.log(`➕ Inserted: ${data.name} (stock: ${data.stock})`);
    }
  }

  console.log(`✅ Seeded ${AIRPODS_PRODUCTS.length} AirPods products`);
};
