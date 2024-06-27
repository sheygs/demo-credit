import { db } from '../connection';
import { UnprocessableEntityException } from '../../utils';

type DateType = {
  created_at: Date;
  updated_at: Date;
};

type ResponseType<Result> = Promise<Result & DateType>;

class Model {
  static tableName: string;

  private static get table() {
    if (!this.tableName) {
      throw new UnprocessableEntityException('Table name required');
    }

    return db(this.tableName);
  }

  public static async all<Result>(): Promise<Result[]> {
    return this.table;
  }

  public static async create<Payload, Result>(data: Payload): ResponseType<Result> {
    try {
      const [id] = await this.table.insert(data);

      // fetch the inserted user data using the id
      const record = await this.findById<Result>(id.toString());

      return record;
    } catch (error) {
      throw error;
    }
  }

  public static async update<Payload, Result>(
    id: string,
    data: Payload,
  ): ResponseType<Result> {
    const [result] = await this.table.where({ id }).update(data).returning('*');
    return result;
  }

  public static async findById<Result>(id: string): ResponseType<Result> {
    return this.table.where('id', id).first();
  }

  public static async findBy<Payload, Result>(
    data: Payload,
  ): ResponseType<Result | null> {
    return this.table.where(data as string).first();
  }
}

export { Model, DateType };
