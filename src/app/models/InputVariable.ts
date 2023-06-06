export class InputVariable {
  constructor(
    public name: string,
    public type: string,
    public defaultValue: string,
    public boolValue?: boolean,
    public start?: number,
    public end?: number,
    public step?: number
  ) {}
}
