import { AppDataSource } from '../data-source';
import { seedProducts } from './products.seed';

const runSeeds = async (): Promise<void> => {
  await AppDataSource.initialize();
  console.log('Running database seeds...');
  await seedProducts(AppDataSource);
  console.log('✅ All seeds completed');
  await AppDataSource.destroy();
};

runSeeds().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});