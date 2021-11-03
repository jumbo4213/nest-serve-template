import {
  Repository,
  SaveOptions,
  DeepPartial,
  RemoveOptions,
  ObjectID,
  FindManyOptions,
  FindConditions,
  FindOneOptions,
  SelectQueryBuilder,
  In,
  EntityManager,
  ObjectType,
  //  FindOperator,
} from 'typeorm';
import { validate, ValidatorOptions } from 'class-validator';
import { createValidationError } from './explicit-validation.pipe';
import { Type, NotFoundException } from '@nestjs/common';
import { Pagination } from './pagination.dto';
import { keyBy, uniq } from 'lodash';

export abstract class CrudService<T> {
  constructor(protected repo: Repository<T>) {}

  findOneBy(
    propertyName: keyof T,
    value: any | string,
  ): Promise<T | undefined> {
    return this.findOne({
      where: {
        [propertyName]: value,
      },
    });
  }

  findOne(
    id?: string | number | Date | ObjectID,
    options?: FindOneOptions<T>,
  ): Promise<T | undefined>;
  findOne(options?: FindOneOptions<T>): Promise<T | undefined>;
  findOne(
    conditions?: FindConditions<T>,
    options?: FindOneOptions<T>,
  ): Promise<T | undefined>;
  findOne(
    optionsOrConditions?:
      | string
      | number
      | Date
      | ObjectID
      | FindOneOptions<T>
      | FindConditions<T>,
    maybeOptions?: FindOneOptions<T>,
  ): Promise<T | undefined> {
    return this.repo.findOne(optionsOrConditions as any, maybeOptions);
  }

  async getOne(
    optionsOrConditions?:
      | string
      | number
      | Date
      | ObjectID
      | FindOneOptions<T>
      | FindConditions<T>,
    maybeOptions?: FindOneOptions<T>,
  ): Promise<T | undefined> {
    const entity = await this.findOne(optionsOrConditions as any, maybeOptions);
    if (!entity) {
      this.throwNotFoundException();
    }
    return entity;
  }

  throwNotFoundException(): void {
    throw new NotFoundException('数据不存在');
  }

  count(
    optionsOrConditions?: FindManyOptions<T> | FindConditions<T>,
  ): Promise<number> {
    return this.repo.count(optionsOrConditions);
  }

  find(
    optionsOrConditions?: FindManyOptions<T> | FindConditions<T>,
  ): Promise<T[]> {
    return this.repo.find(optionsOrConditions);
  }

  create(): T;
  create(entityLikeArray: DeepPartial<T>[]): T[];
  create(entityLike: DeepPartial<T>): T;
  create(entity?: DeepPartial<T>[] | DeepPartial<T>): T | T[] {
    if (Array.isArray(entity)) {
      return (<DeepPartial<T>[]>entity).map<T>(ent => this.create(ent));
    }
    return entity instanceof (this.repo.target as Type<T>)
      ? entity
      : this.repo.create(entity);
  }

  /**
   * Saves all given entities in the database.
   * If entities do not exist in the database then inserts, otherwise updates.
   */
  save(entities: T[], options?: SaveOptions): Promise<T[]>;
  save(entity: T, options?: SaveOptions): Promise<T>;
  save(entityOrEntities: T | T[], options?: SaveOptions): Promise<T | T[]> {
    return this.repo.save(this.create(entityOrEntities as any), options);
  }

  remove(entities: T[], options?: RemoveOptions): Promise<T[]>;
  remove(entity: T, options?: RemoveOptions): Promise<T>;
  remove(entityOrEntities: T | T[], options?: RemoveOptions): Promise<T | T[]> {
    return this.repo.remove(this.create(entityOrEntities as any), options);
  }

  softRemove(entities: T[], options?: SaveOptions): Promise<T[]>;
  softRemove(entity: T, options?: SaveOptions): Promise<T>;
  softRemove(
    entityOrEntities: T | T[],
    options?: SaveOptions,
  ): Promise<T | T[]> {
    return this.repo.softRemove(this.create(entityOrEntities as any), options);
  }

  async validate(entity: T, options?: ValidatorOptions): Promise<T> {
    entity = this.create(entity);
    const errors = await validate(entity as any, options);
    if (errors.length > 0) {
      throw createValidationError(errors);
    } else {
      return entity;
    }
  }

  /**
  transformer<TO>(entity: T, to: Type<TO>, options?: ClassTransformOptions): TO;
  transformer<TO>(
    entities: T[],
    to: Type<TO>,
    options?: ClassTransformOptions,
  ): TO[];
  transformer<TO>(
    entityOrEntities: T | T[],
    to: Type<TO>,
    options?: ClassTransformOptions,
  ): TO | TO[] {
    if (Array.isArray(entityOrEntities)) {
      return entityOrEntities.map(ent => this.transformer(ent, to));
    }
    return plainToClass(
      to,
      classToPlain(entityOrEntities, { ...options }),
      options,
    );
  }
 */

  mapSelect<T>(
    { entities, raw }: { entities: T[]; raw: T[] },
    props: string[],
  ): T[] {
    entities.forEach((ent, index) => {
      props.forEach(prop => {
        ent[prop] = raw[index][prop];
      });
    });
    return entities;
  }
  /**
 // Need support FindOperator
  addAndWhere(
    qb: SelectQueryBuilder<T>,
    obj: { [prop in keyof T]?: any },
  ): SelectQueryBuilder<T> {
    if (!qb.expressionMap.wheres) {
      qb.expressionMap.wheres = [];
    }
    const alias = qb.expressionMap.mainAlias.name;
    Object.keys(obj).forEach(key => {
      const val = obj[key];
      if (val === null) {
        qb.andWhere(`${alias}.${key} IS NULL`);
      } else if (Array.isArray(val)) {
        qb.andWhere(`${alias}.${key} IN (:...${key})`, { [key]: val });
      } else {
        qb.andWhere(`${alias}.${key} = :${key}`, { [key]: val });
      }
    });
    return qb;
  }
 */

  static paginationOptions({
    page,
    limit,
    maxLimit,
  }: {
    page: number;
    limit: number;
    maxLimit?: number;
  }) {
    page = +page || 1;
    limit = +limit || 1;
    if (page < 1) {
      page = 1;
    }
    if (limit < 1) {
      limit = 1;
    }
    if (maxLimit && limit > maxLimit) {
      limit = maxLimit;
    }
    return {
      take: limit,
      skip: (page - 1) * limit,
      limit,
      page,
    };
  }

  async paginate(
    options: { page: number; limit: number; maxLimit?: number },
    optionsOrConditionsOrBuilder?: FindManyOptions<T> | SelectQueryBuilder<T>,
  ): Promise<[T[], Pagination]> {
    const { page, limit, skip, take } = CrudService.paginationOptions(options);
    // TODO: count without distinct
    if (optionsOrConditionsOrBuilder instanceof SelectQueryBuilder) {
      const [data, total] = await optionsOrConditionsOrBuilder
        .take(take)
        .skip(skip)
        .getManyAndCount();
      return [data, new Pagination(page, limit, total)];
    } else {
      const [data, total] = await this.repo.findAndCount({
        skip: skip,
        take: take,
        ...optionsOrConditionsOrBuilder,
      });
      return [data, new Pagination(page, limit, total)];
    }
  }

  /**
   * Performance of query with many `relations`
   * @see https://github.com/typeorm/typeorm/issues/3857
   * Separate query to fetch the associated instances
   *
   */
  async loadRelations(
    baseEntities: (T & { id: number })[],
    relations: (string | string[])[],
  ) {
    // Map the base entities into an "id" array, then find all relations based on these ids
    // Wait for all sub finds to complete and spread them into a res object
    const entitiesMap = keyBy(baseEntities, 'id');
    const ids: any[] = Object.keys(entitiesMap);

    if (!ids.length) return;

    await Promise.all(
      relations.map(async relation => {
        const rels = Array.isArray(relation) ? relation : [relation];
        return this.repo
          .findByIds(ids, {
            select: ['id'],
            relations: rels,
          } as any)
          .then(entities => {
            entities.map((entity: any) => {
              Object.assign(entitiesMap[entity.id], entity);
            });
          });
      }),
    );
  }

  /**
   * Load relations by foreign key
   * Only support many to one relations
   * Has not support child and many to many relations
   */
  async loadRelationsByForeignKey(baseEntities: T[], relations: string[]) {
    return CrudService.loadRelationsByForeignKey(
      this.repo.manager,
      this.repo.target as any,
      baseEntities,
      relations,
    );
    // if (!baseEntities.length) return;

    // const targetMap: Record<
    //   string,
    //   {
    //     Entity: any;
    //     values: any[];
    //     ref: string;
    //     property: Record<string, string>;
    //   }
    // > = {};

    // relations.forEach((relation) => {
    //   const rel = this.repo.metadata.relations.find(
    //     (rel) => rel.propertyName == relation,
    //   );
    //   if (!rel) throw new Error(`Invalid relation: ${relation}`);
    //   if (rel.isManyToOne) {
    //     const col = rel.foreignKeys[0].columnNames[0];
    //     const ref = rel.foreignKeys[0].referencedColumnNames[0];
    //     const propertyName = rel.propertyName;
    //     const ids = uniq(
    //       baseEntities.filter((ent) => ent[col]).map((ent) => ent[col]),
    //     );
    //     if (!ids.length) return;

    //     const key = rel.inverseEntityMetadata.tableName + '.' + ref;
    //     if (targetMap[key]) {
    //       targetMap[key].values = uniq(targetMap[key].values.concat(ids));
    //       targetMap[key].property[col] = propertyName;
    //     } else {
    //       targetMap[key] = {
    //         Entity: rel.inverseEntityMetadata.target,
    //         values: ids,
    //         ref: ref,
    //         property: { [col]: propertyName },
    //       };
    //     }
    //   } else {
    //     throw new Error(`Unsupport type: ${relation} ${rel.relationType}`);
    //   }
    // });

    // await Promise.all(
    //   Object.values(targetMap).map(
    //     async ({ Entity, values, ref, property }) => {
    //       const entities = await this.repo.manager.find(Entity, {
    //         [ref]: values.length == 1 ? values[0] : In(values),
    //       });
    //       const map = keyBy(entities, ref);
    //       baseEntities.forEach((ent) => {
    //         for (const col in property) {
    //           if (ent[col]) {
    //             ent[property[col]] = map[ent[col]];
    //           }
    //         }
    //       });
    //     },
    //   ),
    // );
  }

  /**
   * Load relations by foreign key
   * Only support many to one relations
   * Has not support child and many to many relations
   */
  static async loadRelationsByForeignKey<T>(
    manager: EntityManager,
    target: ObjectType<T>,
    baseEntities: T[],
    relations: string[],
  ) {
    if (!baseEntities.length) return;
    const repo = manager.getRepository(target);
    const targetMap: Record<
      string,
      {
        Entity: any;
        values: any[];
        ref: string;
        property: Record<string, string>;
      }
    > = {};

    relations.forEach(relation => {
      const rel = repo.metadata.relations.find(
        rel => rel.propertyName == relation,
      );
      if (!rel) throw new Error(`Invalid relation: ${relation}`);
      if (rel.isManyToOne) {
        const col = rel.foreignKeys[0].columnNames[0];
        const ref = rel.foreignKeys[0].referencedColumnNames[0];
        const propertyName = rel.propertyName;
        const ids = uniq(
          baseEntities.filter(ent => ent[col]).map(ent => ent[col]),
        );
        if (!ids.length) return;

        const key = rel.inverseEntityMetadata.tableName + '.' + ref;
        if (targetMap[key]) {
          targetMap[key].values = uniq(targetMap[key].values.concat(ids));
          targetMap[key].property[col] = propertyName;
        } else {
          targetMap[key] = {
            Entity: rel.inverseEntityMetadata.target,
            values: ids,
            ref: ref,
            property: { [col]: propertyName },
          };
        }
      } else {
        throw new Error(`Unsupport type: ${relation} ${rel.relationType}`);
      }
    });

    await Promise.all(
      Object.values(targetMap).map(
        async ({ Entity, values, ref, property }) => {
          const entities = await manager.find(Entity, {
            where: { [ref]: values.length == 1 ? values[0] : In(values) },
            withDeleted: true, // Include deleted item
          });
          const map = keyBy(entities, ref);
          baseEntities.forEach(ent => {
            for (const col in property) {
              if (ent[col]) {
                ent[property[col]] = map[ent[col]];
              }
            }
          });
        },
      ),
    );
  }
}
