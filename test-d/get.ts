import {Get} from '../ts41/get';
import {expectTypeOf} from 'expect-type';

interface ApiResponse {
  hits: {
    hits: Array<{
      _id: string;
      _source: {
        name: Array<{
          given: string[];
          family: string;
        }>;
        birthDate: string;
      };
    }>;
  };
}

expectTypeOf<Get<ApiResponse, 'hits.hits[0]._source.name'>>().toEqualTypeOf<Array<{given: string[]; family: string}>>();
expectTypeOf<Get<ApiResponse, 'hits.hits.0._source.name'>>().toEqualTypeOf<Array<{given: string[]; family: string}>>();

// TypeScript is structurally typed - it's _possible_ this value exists even though it's not on the parent interface, so the type is `unknown`.
expectTypeOf<Get<ApiResponse, 'hits.someNonsense.notTheRightPath'>>().toBeUnknown();

interface WithTuples {
  foo: [
    {
			bar: number
		},
    {
			baz: boolean
		}
  ];
}

expectTypeOf<Get<WithTuples, 'foo[0].bar'>>().toBeNumber();
expectTypeOf<Get<WithTuples, 'foo.0.bar'>>().toBeNumber();

expectTypeOf<Get<WithTuples, 'foo[1].bar'>>().toBeUnknown();
expectTypeOf<Get<WithTuples, 'foo.1.bar'>>().toBeUnknown();

interface WithNumberKeys {
  foo: {
    1: {
      bar: number;
    };
  };
}

expectTypeOf<Get<WithNumberKeys, 'foo[1].bar'>>().toBeNumber();
expectTypeOf<Get<WithNumberKeys, 'foo.1.bar'>>().toBeNumber();

expectTypeOf<Get<WithNumberKeys, 'foo[2].bar'>>().toBeUnknown();
expectTypeOf<Get<WithNumberKeys, 'foo.2.bar'>>().toBeUnknown();

interface WithModifiers {
  foo: ReadonlyArray<{
    bar?: {
      readonly baz: {
        qux: number;
      };
    };
  }>;
}

expectTypeOf<Get<WithModifiers, 'foo[0].bar.baz'>>().toEqualTypeOf<{ qux: number }>();
