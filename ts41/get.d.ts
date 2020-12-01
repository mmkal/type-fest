import {Split} from './utilities';
import {StringDigit} from '../source/utilities';

/**
Like @see Get but receives an array of strings as a path parameter.
*/
type GetWithPath<ObjectType, Keys extends readonly string[]> =
	Keys extends []
	? ObjectType
	: Keys extends [infer Head, ...infer Tail]
	? GetWithPath<PropertyOf<ObjectType, Extract<Head, string>>, Extract<Tail, string[]>>
	: never;

/**
Splits a dot-prop style path into a tuple comprised of the properties in the path. Handles square-bracket notation.

@example
```
ToPath<'foo.bar.baz'>
//=> ['foo', 'bar', 'baz']

ToPath<'foo[0].bar.baz'>
//=> ['foo', '0', 'bar', 'baz']
```
*/
type ToPath<S extends string> = Split<FixPathSquareBrackets<S>, '.'>;

/**
Replaces square-bracketed dot notation with dots, for example, `foo[0].bar` -> `foo.0.bar`.
*/
type FixPathSquareBrackets<Path extends string> =
	Path extends `${infer Head}[${infer Middle}]${infer Tail}`
	? `${Head}.${Middle}${FixPathSquareBrackets<Tail>}`
	: Path;

/**
Returns true if `S` is made up out of `C` repeated 0 or more times.

@example
```
ConsistsOnlyOf<'aaa', 'a'> //=> true
ConsistsOnlyOf<'aBa', 'a'> //=> false
ConsistsOnlyOf<'', 'a'> //=> true
```
*/
type ConsistsOnlyOf<LongString extends string, Substring extends string> =
	LongString extends ''
	? true
	: LongString extends `${Substring}${infer Tail}`
	? ConsistsOnlyOf<Tail, Substring>
  : false;

/**
Convert a type which may have number keys to one with string keys, making it possible to index using strings retrieved from template types.

@example
```
type WithNumbers = {foo: string; 0: boolean};
type WithStrings = WithStringKeys<WithNumbers>;

type WithNumbersKeys = keyof WithNumbers;
//=> 'foo' | 0
type WithStringsKeys = keyof WithStrings;
//=> 'foo' | '0'
```
*/
type WithStringKeys<ObjectType extends Record<string | number, any>> = {
	[Key in `${Extract<keyof ObjectType, string | number>}`]: ObjectType[Key]
};

/**
Get a property of an object or array. Works when indexing arrays using number-literal-strings, for example, `PropertyOf<number[], '0'> = number`, and when indexing objects with number keys.

Returns `unknown` if `Key` is not a property of `ObjectType`.
*/
type PropertyOf<ObjectType, Key extends string> =
	ObjectType extends null | undefined
	? undefined
	: Key extends keyof ObjectType
	? ObjectType[Key]
	: ObjectType extends ArrayLike<infer Item>
	? ConsistsOnlyOf<Key, StringDigit> extends true
	? Item
	: unknown
	: Key extends keyof WithStringKeys<ObjectType>
	? WithStringKeys<ObjectType>[Key]
	: unknown;

// This works by first splitting the path based on `.` and `[...]` characters into a tuple of string keys. Then it recursively uses the head key to get the next property of the current object, until there are no keys left. Number keys extract the item type from arrays, or are converted to strings to extract types from tuples and dictionaries with number keys.
/**
Get a deeply-nested property from an object using a key path, like Lodash's `.get()` function.

Use-case: Retrieve a property from deep inside an API response or some other complex object.

@example
```
import {Get} from 'type-fest';
import * as lodash from 'lodash';

const get = <ObjectType, Path extends string>(object: ObjectType, path: Path): Get<ObjectType, Path> =>
	lodash.get(object, path);

interface ApiResponse {
	hits: {
		hits: Array<{
			_id: string
			_source: {
				name: Array<{
					given: string[]
					family: string
				}>
				birthDate: string
			}
		}>
	}
}

const getName = (apiResponse: ApiResponse) =>
	get(apiResponse, 'hits.hits[0]._source.name');
	//=> Array<{given: string[]; family: string}>
```
*/
export type Get<Object, Path extends string> = GetWithPath<Object, ToPath<Path>>;
