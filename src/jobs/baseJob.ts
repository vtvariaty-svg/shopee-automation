export abstract class BaseJob {
  abstract name: string;

  async run(): Promise<void> {
    throw new Error('Not implemented');
  }
}
