import { db } from '../connection';
import { UnprocessableEntityException } from '../../utils';

type DateType = {
  created_at: Date;
  updated_at: Date;
};

type ResponseType<T> = Promise<T & DateType>;

class Model {
  static tableName: string;

  private static get table() {
    if (!this.tableName) {
      throw new UnprocessableEntityException('table name required');
    }

    return db(this.tableName);
  }

  public static async all<T>(): Promise<T[]> {
    return this.table;
  }

  public static async create<Payload, T>(data: Payload): ResponseType<T> {
    try {
      const [id] = await this.table.insert(data);

      // fetch the inserted user data using the id
      const record = await this.findById<T>(id.toString());

      return record;
    } catch (error) {
      throw error;
    }
  }

  public static async update<Payload, T>(id: string, data: Payload): ResponseType<T> {
    await this.table.where({ id }).update(data);

    // fetch the inserted user data using the id
    const record = await this.findById<T>(id.toString());

    return record;
  }

  public static async findById<T>(id: string): ResponseType<T> {
    return this.table.where('id', id).first();
  }

  public static async findBy<Payload, T>(data: Payload): ResponseType<T | null> {
    return this.table.where(data as any).first();
  }
}

export { Model, DateType, ResponseType };
