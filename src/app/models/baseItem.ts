export class BaseItem {
  id: number = -1;
  readonly type: string;

  protected constructor(type: string) {
    this.type = type;
  }

  equals(data: BaseItem): boolean {
    return JSON.stringify(this) === JSON.stringify(data);
  }

  equalsTypeAndID(data: BaseItem): boolean {
    return data && this.id === data.id && this.type === data.type;
  }

  static fromJson(o: any): BaseItem {
    const t: BaseItem = new BaseItem("");
    Object.assign(t, o);
    return t;
  }
}
