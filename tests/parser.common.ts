import { Parser, IAddMessageCallback } from '../src/parser';
import { CatalogBuilder, IMessage } from '../src/builder';
import { IGettextExtractorStats } from '../src/extractor';

export function registerCommonParserTests(parserClass: any): void {
    let parser: Parser<any, any>,
        builder: CatalogBuilder,
        messages: IMessage[];

    beforeEach(() => {
        messages = [];

        builder = <any>{
            stats: {},
            addMessage: jest.fn((message: IMessage) => {
                messages.push(message);
            })
        };
    });

    test('one extractor', () => {
        let extractor = jest.fn();
        parser = new parserClass(builder, [extractor]);
        parser.parseString('');
        expect(extractor).toHaveBeenCalled();
    });

    test('multiple extractors', () => {
        let extractor1 = jest.fn(),
            extractor2 = jest.fn();
        parser = new parserClass(builder, [extractor1, extractor2]);
        parser.parseString('');
        expect(extractor1).toHaveBeenCalled();
        expect(extractor2).toHaveBeenCalled();
    });

    test('extractor added later', () => {
        let extractor = jest.fn();
        parser = new parserClass(builder);
        parser.addExtractor(extractor);
        parser.parseString('');
        expect(extractor).toHaveBeenCalled();
    });

    test('second extractor added later', () => {
        let extractor1 = jest.fn(),
            extractor2 = jest.fn();
        parser = new parserClass(builder, [extractor1]);
        parser.parseString('');
        expect(extractor1).toHaveBeenCalled();
        expect(extractor2).not.toHaveBeenCalled();

        extractor1.mockClear();
        extractor2.mockClear();

        parser.addExtractor(extractor2);
        parser.parseString('');
        expect(extractor1).toHaveBeenCalled();
        expect(extractor2).toHaveBeenCalled();
    });

    test('addMessage call', () => {
        let extractor = jest.fn().mockImplementationOnce((node: any, file: any, addMessage: IAddMessageCallback) => {
            addMessage({
                text: 'Foo'
            });
        });

        parser = new parserClass(builder, [extractor]);
        parser.parseString('');

        expect(messages).toEqual([
            {
                text: 'Foo'
            }
        ]);
    });

    test('fluid api', () => {
        let extractor1 = jest.fn(),
            extractor2 = jest.fn();

        parser = new parserClass(builder, [extractor1]);

        expect(parser.parseString('')).toBe(parser);
        expect(parser.parseFilesGlob('tests/fixtures/*.ts')).toBe(parser);
        expect(parser.parseFile('tests/fixtures/empty.ts')).toBe(parser);
        expect(parser.addExtractor(extractor2)).toBe(parser);
    });

    describe('stats', () => {

        let stats: IGettextExtractorStats;

        beforeEach(() => {
            stats = {
                numberOfMessages: 0,
                numberOfPluralMessages: 0,
                numberOfMessageUsages: 0,
                numberOfContexts: 0,
                numberOfParsedFiles: 0,
                numberOfParsedFilesWithMessages: 0
            };
        });

        test('no files with messages', () => {
            let extractor = jest.fn();

            parser = new parserClass(builder, [extractor], stats);

            parser.parseString('');
            parser.parseString('');
            parser.parseString('');

            expect(stats.numberOfParsedFiles).toBe(3);
            expect(stats.numberOfParsedFilesWithMessages).toBe(0);
        });

        test('some files with messages', () => {
            let extractor = jest.fn().mockImplementationOnce((node: any, file: any, addMessage: IAddMessageCallback) => {
                addMessage({
                    text: 'Foo'
                });
            });

            parser = new parserClass(builder, [extractor], stats);

            parser.parseString('');
            parser.parseString('');
            parser.parseString('');

            expect(stats.numberOfParsedFiles).toBe(3);
            expect(stats.numberOfParsedFilesWithMessages).toBe(1);
        });

        test('all files with messages', () => {
            let extractor = jest.fn().mockImplementation((node: any, file: any, addMessage: IAddMessageCallback) => {
                addMessage({
                    text: 'Foo'
                });
            });

            parser = new parserClass(builder, [extractor], stats);

            parser.parseString('');
            parser.parseString('');
            parser.parseString('');

            expect(stats.numberOfParsedFiles).toBe(3);
            expect(stats.numberOfParsedFilesWithMessages).toBe(3);
        });
    });

    test('parsing without extractors', () => {
        const ERROR_MESSAGE = `Missing extractor functions. Provide them when creating the parser or dynamically add extractors using 'addExtractor()'`;

        parser = new parserClass(builder);

        expect(() => {
            parser.parseString('');
        }).toThrow(ERROR_MESSAGE);

        expect(() => {
            parser.parseFile('tests/fixtures/empty.ts');
        }).toThrow(ERROR_MESSAGE);

        expect(() => {
            parser.parseFilesGlob('tests/fixtures/*.ts');
        }).toThrow(ERROR_MESSAGE);
    });

    describe('argument validation', () => {

        beforeEach(() => {
            parser = new parserClass(builder, [jest.fn()]);
        });

        describe('parseFile', () => {

            test('fileName: (none)', () => {
                expect(() => {
                    (<any>parser.parseFile)();
                }).toThrow(`Missing argument 'fileName'`);
            });

            test('fileName: null', () => {
                expect(() => {
                    (<any>parser.parseFile)(null);
                }).toThrow(`Argument 'fileName' must be a non-empty string`);
            });

            test('fileName: wrong type', () => {
                expect(() => {
                    (<any>parser.parseFile)(42);
                }).toThrow(`Argument 'fileName' must be a non-empty string`);
            });

            test('options: wrong type', () => {
                expect(() => {
                    (<any>parser.parseFile)('foo.ts', 'bar');
                }).toThrow(`Argument 'options' must be an object`);
            });

            test('options.lineNumberStart: wrong type', () => {
                expect(() => {
                    (<any>parser.parseFile)('foo.ts', {
                        lineNumberStart: 'bar'
                    });
                }).toThrow(`Property 'options.lineNumberStart' must be a number`);
            });

            test('options.transformSource: wrong type', () => {
                expect(() => {
                    (<any>parser.parseFile)('foo.ts', {
                        transformSource: 42
                    });
                }).toThrow(`Property 'options.transformSource' must be a function`);
            });
        });

        describe('parseFilesGlob', () => {

            test('pattern: (none)', () => {
                expect(() => {
                    (<any>parser.parseFilesGlob)();
                }).toThrow(`Missing argument 'pattern'`);
            });

            test('pattern: null', () => {
                expect(() => {
                    (<any>parser.parseFilesGlob)(null);
                }).toThrow(`Argument 'pattern' must be a non-empty string`);
            });

            test('pattern: wrong type', () => {
                expect(() => {
                    (<any>parser.parseFilesGlob)(42);
                }).toThrow(`Argument 'pattern' must be a non-empty string`);
            });

            test('globOptions: wrong type', () => {
                expect(() => {
                    (<any>parser.parseFilesGlob)('*.ts;', 'foo');
                }).toThrow(`Argument 'globOptions' must be an object`);
            });

            test('options: wrong type', () => {
                expect(() => {
                    (<any>parser.parseFilesGlob)('*.ts;', {}, 'foo');
                }).toThrow(`Argument 'options' must be an object`);
            });

            test('options.lineNumberStart: wrong type', () => {
                expect(() => {
                    (<any>parser.parseFilesGlob)('*.ts;', {}, {
                        lineNumberStart: 'foo'
                    });
                }).toThrow(`Property 'options.lineNumberStart' must be a number`);
            });

            test('options.transformSource: wrong type', () => {
                expect(() => {
                    (<any>parser.parseFile)('foo.ts', {
                        transformSource: 42
                    });
                }).toThrow(`Property 'options.transformSource' must be a function`);
            });
        });

        describe('parseString', () => {

            test('source: (none)', () => {
                expect(() => {
                    (<any>parser.parseString)();
                }).toThrow(`Missing argument 'source'`);
            });

            test('source: null', () => {
                expect(() => {
                    (<any>parser.parseString)(null);
                }).toThrow(`Argument 'source' must be a string`);
            });

            test('source: wrong type', () => {
                expect(() => {
                    (<any>parser.parseString)(42);
                }).toThrow(`Argument 'source' must be a string`);
            });

            test('fileName: (none)', () => {
                expect(() => {
                    (<any>parser.parseString)('let foo = 42;');
                }).not.toThrow();
            });

            test('fileName: wrong type', () => {
                expect(() => {
                    (<any>parser.parseString)('let foo = 42;', 42);
                }).toThrow(`Argument 'fileName' must be a non-empty string`);
            });

            test('options: wrong type', () => {
                expect(() => {
                    (<any>parser.parseString)('let foo = 42;', 'foo.ts', 'bar');
                }).toThrow(`Argument 'options' must be an object`);
            });

            test('options.lineNumberStart: wrong type', () => {
                expect(() => {
                    (<any>parser.parseString)('let foo = 42;', 'foo.ts', {
                        lineNumberStart: 'bar'
                    });
                }).toThrow(`Property 'options.lineNumberStart' must be a number`);
            });

            test('options.transformSource: wrong type', () => {
                expect(() => {
                    (<any>parser.parseFile)('foo.ts', {
                        transformSource: 42
                    });
                }).toThrow(`Property 'options.transformSource' must be a function`);
            });
        });

        describe('addExtractor', () => {

            test('extractor: (none)', () => {
                expect(() => {
                    (<any>parser.addExtractor)();
                }).toThrow(`Missing argument 'extractor'`);
            });

            test('extractor: null', () => {
                expect(() => {
                    (<any>parser.addExtractor)(null);
                }).toThrow(`Invalid extractor function provided. 'null' is not a function`);
            });

            test('extractor: wrong type', () => {
                expect(() => {
                    (<any>parser.addExtractor)(42);
                }).toThrow(`Invalid extractor function provided. '42' is not a function`);
            });
        });
    });
}
