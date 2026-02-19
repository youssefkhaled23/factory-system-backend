import { Injectable } from '@nestjs/common';
import {
  PaginatedResult,
  PaginationOptions,
} from 'src/interfaces/pagination.interfaces';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class PaginationService {
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_LIMIT = 10;
  private readonly MAX_LIMIT = 100;

  async pagination<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResult<T>> {
    if (paginationOptions.hasPagination === false) {
      const results = await query.getMany();
      return {
        results,
        pagination: null,
      };
    }

    const page = Number(paginationOptions.page) || this.DEFAULT_PAGE;
    const limit = Number(paginationOptions.limit) || this.DEFAULT_LIMIT;
    const safePage = page < 1 ? this.DEFAULT_PAGE : page;
    const safeLimit =
      limit < 1 ? this.DEFAULT_LIMIT : Math.min(limit, this.MAX_LIMIT);

    query.skip((safePage - 1) * safeLimit);
    query.take(safeLimit);

    const [results, total] = await query.getManyAndCount();

    const pages = Math.ceil(total / safeLimit);
    return {
      results,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        pages,
        hasNext: safePage < pages,
        hasPrev: safePage > 1,
      },
    };
  }

  async paginationRaw<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResult<T>> {
    if (paginationOptions.hasPagination === false) {
      const results = await query.getRawMany();
      return {
        results,
        pagination: null,
      };
    }

    const page = Math.max(
      Number(paginationOptions.page) || this.DEFAULT_PAGE,
      1,
    );
    const limit = Math.min(
      Math.max(Number(paginationOptions.limit) || this.DEFAULT_LIMIT, 1),
      this.MAX_LIMIT,
    );

    query.offset((page - 1) * limit);
    query.limit(limit);

    const results = await query.getRawMany<T>();

    const total = await query.getCount();

    const pages = Math.ceil(total / limit);

    return {
      results,
      pagination: {
        total,
        page,
        limit,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    };
  }
}
