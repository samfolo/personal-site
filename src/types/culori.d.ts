declare module "culori" {
  export interface OklchColor {
    mode: "oklch";
    l: number;
    c: number;
    h: number;
  }

  export function oklch(color: OklchColor): OklchColor;
  export function formatHex(color: OklchColor): string | undefined;
}
