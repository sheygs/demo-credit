import bcrypt from 'bcrypt';
import { config } from '../config';

class SecurityUtils {
  private static readonly saltRounds = config.app.saltRounds;

  static async hash(value: string): Promise<string> {
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

export { SecurityUtils };
