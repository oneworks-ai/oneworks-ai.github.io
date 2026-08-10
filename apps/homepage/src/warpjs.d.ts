declare module 'warpjs' {
  type Point = [number, number]

  export default class Warp {
    constructor(element: SVGElement)
    interpolate(threshold: number): boolean
    transform(transformer: (point: Point) => Point): void
  }
}
