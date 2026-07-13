import { ConflictError } from '../../shared/errors/conflict-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
import { generateUniqueSizeId } from '../../shared/utils/size-id';
import type { ISizeRepository } from './size.repository.interface';
import type { CreateSizeDto, UpdateSizeDto } from './size.dto';
import type { GarmentSize } from './size.types';

export class SizeService {
  constructor(private readonly sizeRepository: ISizeRepository) {}

  async listSizes(): Promise<GarmentSize[]> {
    return this.sizeRepository.findMany();
  }

  async getSizeById(id: string): Promise<GarmentSize> {
    const size = await this.sizeRepository.findById(id);
    if (!size) {
      throw new NotFoundError('Size not found');
    }

    return size;
  }

  async createSize(input: CreateSizeDto): Promise<GarmentSize> {
    if (await this.sizeRepository.labelExists(input.label)) {
      throw new ConflictError(`Size label "${input.label.toUpperCase()}" is already in use`);
    }

    const sizeId = await generateUniqueSizeId((candidate) =>
      this.sizeRepository.sizeIdExists(candidate),
    );

    return this.sizeRepository.create({
      label: input.label,
      sortOrder: input.sortOrder,
      sizeId,
    });
  }

  async updateSize(id: string, input: UpdateSizeDto): Promise<GarmentSize> {
    const existing = await this.sizeRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Size not found');
    }

    if (input.label) {
      const labelTaken = await this.sizeRepository.labelExists(input.label, id);
      if (labelTaken) {
        throw new ConflictError(`Size label "${input.label.toUpperCase()}" is already in use`);
      }
    }

    return this.sizeRepository.update(id, input);
  }

  async deleteSize(id: string): Promise<void> {
    const existing = await this.sizeRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Size not found');
    }

    if (await this.sizeRepository.isSizeInUse(existing.sizeId)) {
      throw new ConflictError('Size is used by one or more products and cannot be deleted');
    }

    await this.sizeRepository.delete(id);
  }
}
