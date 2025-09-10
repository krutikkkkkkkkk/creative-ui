declare module "class-variance-authority" {
  // You can expand this as needed for your usage
  export function cva(
    base?: string,
    options?: Record<string, any>
  ): (...args: any[]) => string;
  export type VariantProps<T> = Record<string, any>;
}
