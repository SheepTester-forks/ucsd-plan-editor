export type IVector2 = { x: number; y: number }
export class Vector2 {
  x: number
  y: number

  constructor ({ x = 0, y = 0 }: Partial<IVector2> = {}) {
    this.x = x
    this.y = y
  }

  add ({ x, y }: IVector2): Vector2 {
    return new Vector2({ x: this.x + x, y: this.y + y })
  }

  sub ({ x, y }: IVector2): Vector2 {
    return new Vector2({ x: this.x - x, y: this.y - y })
  }

  scaled (factor: number): Vector2 {
    return new Vector2({ x: this.x * factor, y: this.y * factor })
  }

  get length (): number {
    return Math.hypot(this.x, this.y)
  }

  normalized (): Vector2 {
    return this.scaled(1 / this.length)
  }

  toString (): string {
    return [this.x, this.y].join(' ')
  }
}
