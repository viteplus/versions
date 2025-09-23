/**
 * A generic type representing a function with any arguments and any return type.
 *
 * @remarks
 * This type is a very flexible function type, allowing any arguments of any type
 * and returning any type. Use with caution, as it bypasses TypeScript's type safety.
 *
 * @example
 * ```ts
 * const exampleFn: FunctionType = (a, b, c) => a + b + c;
 *
 * const anotherFn: FunctionType = (...args) => args.length;
 * ```
 *
 * @since 2.0.0
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FunctionType = (...args: Array<any>) => any;

/**
 * Represents a generic constructor type.
 *
 * @remarks
 * This utility type describes a class constructor that accepts any number of arguments
 * and returns any instance type. Useful for mixins or generic factory functions.
 *
 * @example
 * ```ts
 * function WithTimestamp<TBase extends ConstructorType>(Base: TBase) {
 *   return class extends Base {
 *     timestamp = Date.now();
 *   };
 * }
 * ```
 *
 * @since 2.0.0
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ConstructorType = new (...args: Array<any>) => any;

/**
 * A type representing a function with a specific return type, arguments, and optional context.
 *
 * @typeParam Return - The type returned by the function. Defaults to `unknown`.
 * @typeParam Args - A tuple of argument types for the function. Defaults to an empty array `[]`.
 * @typeParam Context - The type of `this` context for the function. Defaults to `unknown`.
 *
 * @remarks
 * This type allows you to strongly type functions with a specific `this` context and arguments.
 *
 * @example
 * ```ts
 * const fn: FunctionLikeType<number, [string, string], { prefix: string }> = function(this, a, b) {
 *   return (this.prefix + a + b).length;
 * }
 * ```
 *
 * @since 2.0.0
 */

export type FunctionLikeType<Return = unknown, Args extends Array<unknown> = [], Context = unknown> =
    (this: Context, ...args: Args) => Return;

/**
 * A type representing a constructor with specific arguments and return type.
 *
 * @typeParam Return - The instance type returned by the constructor. Defaults to `unknown`.
 * @typeParam Args - A tuple of argument types for the constructor. Defaults to an empty array `[]`.
 *
 * @remarks
 * This type allows strong typing of class constructors with defined argument types.
 *
 * @example
 * ```ts
 * class MyClass {
 *   constructor(public name: string) {}
 * }
 *
 * const ctor: ConstructorLikeType<MyClass, [string]> = MyClass;
 * const instance = new ctor("Hello");
 * ```
 *
 * @since 2.0.0
 */

export type ConstructorLikeType<Return = unknown, Args extends Array<unknown> = []> =
    new(...args: Args) => Return;

/**
 * Recursively makes all properties of a type optional.
 *
 * @typeParam T - The type to transform into a deeply partial type.
 *
 * @remarks
 * This type is similar to TypeScript's built-in `Partial<T>`, but it applies recursively
 * to all nested objects. Arrays and other non-object types are left unchanged.
 *
 * Use `DeepPartialType` when you need to work with objects where only some properties,
 * including nested properties, may be provided.
 *
 * @example
 * ```ts
 * interface User {
 *   name: string;
 *   address: {
 *     street: string;
 *     city: string;
 *   };
 * }
 *
 * const partialUser: DeepPartialType<User> = {
 *   name: "Alice",
 *   address: { city: "Wonderland" }
 * };
 * ```
 *
 * @since 2.0.0
 */

export type DeepPartialType<T> = T extends object
    ? { [P in keyof T]?: DeepPartialType<T[P]> }
    : T;

/**
 * Makes specific keys of a type required while leaving the rest unchanged.
 *
 * @typeParam T - The base type.
 * @typeParam K - The subset of keys from `T` that should be required.
 *
 * @remarks
 * This utility type is useful when you want to enforce that certain properties
 * of a type are mandatory, without affecting the optionality of other properties.
 * It works by combining:
 * - `Omit<T, K>` to remove the keys that will become required.
 * - `Required<Pick<T, K>>` to mark the specified keys as required.
 *
 * @example
 * ```ts
 * interface User {
 *   id?: number;
 *   name?: string;
 *   email?: string;
 * }
 *
 * // Make 'id' and 'name' required, 'email' remains optional
 * type UserWithRequiredIdName = RequireKeysType<User, 'id' | 'name'>;
 *
 * const user: UserWithRequiredIdName = {
 *   id: 1,
 *   name: "Alice"
 * };
 * ```
 *
 * @since 2.0.0
 */

export type RequireKeysType<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
