export const tuple = <T extends string[]>(...args: T) => args;

export const tupleNum = <T extends number[]>(...args: T) => args;

// interface A {a: string; b: boolean; c: number; d: number}
// TPickOption<A, number> => 'c'|'d'
export type TPickOption<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

// interface A {a: string; b: boolean; c: number; d: number}
// OmitType<A, number> => {a: string; b: boolean;}
export type OmitType<T, U> = Pick<T, { [K in keyof T]: T[K] extends U ? never : K }[keyof T]>;
