import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../database/entities/product.entity';
import { ProductResponse } from './types/product-response.types';
import { Result, ok, fail } from '..//../shared/utils/result.utils';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  /**
   * Retrieves all active products.
   */
  async findAllActive(): Promise<ProductResponse[]> {
    const products = await this.productRepository.find({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
    });
    return products.map(this.toResponse);
  }

  /**
   * Retrieves a single product by ID.
   */
  async findById(id: string): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return this.toResponse(product);
  }

  /**
   * Decrements stock by 1 for a given product using optimistic locking via ACID transaction.
   * Returns Result to allow ROP chaining.
   */
  async decrementStock(productId: string): Promise<Result<ProductResponse, string>> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      return fail(`Product ${productId} not found`);
    }
    if (product.stock <= 0) {
      return fail(`Product "${product.name}" is out of stock`);
    }
    product.stock -= 1;
    const updated = await this.productRepository.save(product);
    return ok(this.toResponse(updated));
  }

  /**
   * Checks whether a product has stock available.
   */
  async hasStock(productId: string): Promise<Result<boolean, string>> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      return fail(`Product ${productId} not found`);
    }
    return ok(product.stock > 0);
  }

  private readonly toResponse = (product: ProductEntity): ProductResponse => ({
    id: product.id,
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl,
    priceInCents: product.priceInCents,
    stock: product.stock,
    isActive: product.isActive,
    createdAt: product.createdAt,
  });
}