export class Strategy {
  constructor(
    public id: string,
    public userId: string,
    public name?: string,
    public mq?: string,
    public ex?: string
  ) {}
}
