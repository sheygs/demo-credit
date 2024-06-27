import bcrypt from 'bcrypt';
import { config } from '../config';

class UtilService {
  private static readonly saltRounds = config.app.saltRounds;

  static async hash(value: string): Promise<string> {
    // console.log({
    //   value,
    //   xhash: await bcrypt.hash(value, +this.saltRounds),
    //   x: +this.saltRounds,
    // });
    const hashValue = await bcrypt.hash(value, Number(this.saltRounds));
    return hashValue;
  }

  static async compare(value: string, hashedValue: string): Promise<boolean> {
    return bcrypt.compare(value, hashedValue);
  }

  static getEnumValues<T extends Record<string, string>>(enumType: T): string[] {
    return Object.values(enumType);
  }
}

export { UtilService };
