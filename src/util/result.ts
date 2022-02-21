import { none, Option, some } from 'fp-ts/Option'

export class Result<T = never, E = never> implements IterableIterator<T> {
  private _isOk: boolean
  private _value: T
  private _err: E

  private constructor(isOk: boolean, value: T, err: E) {
    this._isOk = isOk
    this._value = value
    this._err = err
  }

  /**
   * Contains the success value.
   */
  static Ok<T extends void>(): Result<T, never>
  static Ok<T>(value: T): Result<T, never>
  static Ok<T>(value?: T): Result<T, never> {
    return new Result<T, never>(true, value as T, null as never)
  }

  /**
   * Contains the err value.
   */
  static Err<T>(err: T): Result<never, T> {
    return new Result<never, T>(false, null as never, err)
  }

  /**
   * Returns `true` if the result is `Ok`.
   */
  isOk(): this is Result<T, never> {
    return this._isOk
  }

  /**
   * Returns `true` if the result is `Err`.
   */
  isErr(): this is Result<never, E> {
    return !this._isOk
  }

  [Symbol.iterator](): this {
    return this
  }

  next(): IteratorResult<T> {
    if (this.isOk()) {
      return {
        done: true,
        value: this._value,
      }
    }
    return {
      done: true,
      value: undefined,
    }
  }

  /**
   * Returns `res` if the result is `Ok`, otherwise returns the `Err` value.
   */
  and<U>(res: Result<U, E>): Result<U, E> {
    if (this.isOk()) {
      return res
    }
    return this as unknown as Result<U, E>
  }

  /**
   * Calls `op` if the result is `Ok`, otherwise returns the `Err` value.
   *
   * This function can be used for control flow based on `Result` values.
   */
  andThen<U>(op: (value: T) => U): Result<U, E> {
    return this.map(op)
  }

  /**
   * Returns `res` if the result is `Err`, otherwise returns the `Ok` value.
   */
  or<F>(res: Result<T, F>): Result<T, F> {
    if (this.isErr()) {
      return res
    }
    return this as unknown as Result<T, F>
  }

  /**
   * Calls `op` if the result is `Err`, otherwise returns the `Ok` value.
   *
   * This function can be used for control flow based on result values.
   */
  orElse<F>(op: (err: E) => F): Result<T, F> {
    return this.mapErr(op)
  }

  /**
   * Returns a copy.
   */
  clone(): Result<T, E> {
    return new Result(this._isOk, this._value, this._err)
  }

  /**
   * Returns `true` if the result is an `Ok` value containing the given value.
   */
  contains(value: T): boolean {
    return this.isOk() && this._value === value
  }

  /**
   * Returns `true` if the result is an `Err` value containing the given value.
   */
  containsErr(err: E): boolean {
    return this.isErr() && this._err === err
  }

  /**
   * Returns the contained `Ok` value.
   *
   * Throws an error if the value is an `Err`, with the error message including the passed message,
   * and the content of the `Err`
   */
  expect(msg: string): T {
    if (this.isOk()) {
      return this._value
    }
    throw new Error(`${msg}: ${this._err}`)
  }

  /**
   * Returns the contained `Err` value.
   *
   * Throws an error if the value is an `Ok`, with the error message including the passed message,
   * and the content of the `Ok`
   */
  expectErr(msg: string): E {
    if (this.isErr()) {
      return this._err
    }
    throw new Error(`${msg}: ${this._value}`)
  }

  /**
   * Check if the `Ok` value matches a type guard.
   * Returns an `Err` if the type guard fails.
   * Passes through error if is already an `Err` value.
   * @param typeGuard A type guard to check if the `Ok` value is compatiable with `TReduced`
   * @param error Error to return if `typeGuard` fails
   */
  guard<TReduced extends T, TError = E>(
    typeGuard: (value: T) => value is TReduced,
    error: TError
  ): Result<TReduced, TError | E> {
    if (this.isOk() && typeGuard(this._value)) {
      return Result.Ok(this._value)
    } else if (this.isErr()) {
      return Result.Err(this._err)
    }
    return Result.Err(error)
  }

  /**
   * Validate an `Ok` value, returning an `Err` if it is not.
   * Passes through error if it is already an `Err` value.
   * @param validate Check to see if the `Ok` value is valid
   * @param error Error to return if the `Ok` value is not valid
   */
  validate<TError = E>(
    validate: (value: T) => boolean,
    error: TError
  ): Result<T, TError | E> {
    if (this.isOk()) {
      if (validate(this._value)) {
        return this
      }
      return Result.Err(error)
    }
    return this
  }

  /**
   * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value,
   * leaving an `Err` value untouched.
   *
   * This function can be used to compose the results of two functions.
   */
  map<U>(f: (value: T) => U): Result<U, E> {
    if (this.isOk()) {
      return Result.Ok(f(this._value))
    } else {
      return Result.Err(this._err)
    }
  }

  /**
   * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value,
   * leaving an `Ok` value untouched.
   *
   * This function can be used to pass through a successful result while handling an error.
   */
  mapErr<U>(f: (err: E) => U): Result<T, U> {
    if (this.isErr()) {
      return Result.Err(f(this._err))
    } else {
      return this as unknown as Result<T, U>
    }
  }

  /**
   * Applies a function to the contained value (if `Ok`), or returns the provided default (if `Err`).
   */
  mapOr<U>(f: (value: T) => U, defaultValue: U): U {
    if (this.isOk()) {
      return f(this._value)
    }
    return defaultValue
  }

  /**
   * Maps a `Result<T, E>` to `U` by applying a function to a contained `Ok` value,
   * or a fallback function to a contained `Err` value.
   *
   * This function can be used to unpack a successful result while handling an error.
   */
  mapOrElse<U>(ok: (value: T) => U, err: (err: E) => U): U {
    return this.match({ Ok: ok, Err: err })
  }

  /**
   * Executes the `Ok` case if the value is `Ok` or the `Err` case if the value is `Err`.
   */
  match<U>(cases: { Ok: (value: T) => U; Err: (err: E) => U }): U {
    if (this.isOk()) {
      return cases.Ok(this._value)
    } else {
      return cases.Err(this._err)
    }
  }

  nonNull<U = E>(error: U): Result<Exclude<T, null>, U> {
    if (this.isOk()) {
      if (this._value === null) {
        return Result.Err(error)
      }
    }

    return this as unknown as Result<Exclude<T, null>, U>
  }

  /**
   * Converts from `Result<T, E>` to `Option<T>`.
   */
  ok(): Option<T> {
    if (this.isOk()) {
      return some(this._value)
    }
    return none
  }

  /**
   * Converts from `Result<T, E>` to `Option<E>`.
   */
  err(): Option<E> {
    if (this.isErr()) {
      return some(this._err)
    }
    return none
  }

  /**
   * Returns the contained `Ok` value.
   *
   * Throws an error if the value is an `Err`, with an error message provided by the `Err`'s value.
   *
   * Because this function may throw an error, its use is generally discouraged. Instead, prefer to use `match` and
   * handle the `Err` case explicitly, or call `unwrapOr` or `unwrapOrElse`.
   */
  unwrap(): T {
    if (this.isOk()) {
      return this._value
    }

    switch (typeof this._err) {
      case 'string':
        throw new Error(this._err)

      case 'object':
        throw new Error(JSON.stringify(this._err, null, 2))

      default:
        throw new Error(String(this._err))
    }
  }

  /**
   * Returns the container `Err` value.
   *
   * Throws an error if the value is an `Ok`, with a custom error message provided by the `Ok`'s value.
   */
  unwrapErr(): E {
    if (this.isErr()) {
      return this._err
    }
    throw new Error(`Failed unwrapErr: ${this._value}`)
  }

  /**
   * Returns the contained `Ok` value or a provided default.
   */
  unwrapOr(defaultValue: T): T {
    if (this.isOk()) {
      return this._value
    }
    return defaultValue
  }

  /**
   * Returns the contained `Ok` value or computes it from the `Err` value.
   */
  unwrapOrElse(op: (err: E) => T): T {
    if (this.isOk()) {
      return this._value
    } else {
      return op(this._err)
    }
  }
}
