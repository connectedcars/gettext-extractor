import * as ts from 'typescript';

import { IJsExtractorFunction } from '../../parser';
import { Validate } from '../../../utils/validate';
import { IContentOptions, normalizeContent, validateContentOptions } from '../../../utils/content';
import { IJsExtractorOptions, validateOptions, IArgumentIndexMapping } from '../common';
import { JsUtils } from '../../utils';
import { IAddMessageCallback, IMessageData } from '../../../parser';
import { JsCommentUtils } from '../comments';

export function callExpressionExtractor(calleeName: string | string[], options: IJsExtractorOptions): IJsExtractorFunction {
    Validate.required.argument({calleeName});

    let calleeNames = [].concat(calleeName);

    for (let name of calleeNames) {
        if (typeof name !== 'string' || name.length === 0) {
            throw new TypeError(`Argument 'calleeName' must be a non-empty string or an array containing non-empty strings`);
        }
    }

    validateOptions(options);
    validateContentOptions(options);

    let contentOptions: IContentOptions = {
        trimWhiteSpace: false,
        preserveIndentation: true,
        replaceNewLines: false
    };

    if (options.content) {
        if (options.content.trimWhiteSpace !== undefined) {
            contentOptions.trimWhiteSpace = options.content.trimWhiteSpace;
        }
        if (options.content.preserveIndentation !== undefined) {
            contentOptions.preserveIndentation = options.content.preserveIndentation;
        }
        if (options.content.replaceNewLines !== undefined) {
            contentOptions.replaceNewLines = options.content.replaceNewLines;
        }
    }

    return (node: ts.Node, sourceFile: ts.SourceFile, addMessage: IAddMessageCallback) => {
        if (node.kind === ts.SyntaxKind.CallExpression) {
            let callExpression = <ts.CallExpression>node;

            let matches = calleeNames.reduce((matchFound, name) => (
                matchFound || JsUtils.calleeNameMatchesCallExpression(name, callExpression)
            ), false);

            if (matches) {
                let message = extractArguments(callExpression, options.arguments, contentOptions);
                if (message) {
                    message.comments = JsCommentUtils.extractComments(callExpression, sourceFile, options.comments);
                    addMessage(message);
                }
            }
        }
    };
}

function extractArguments(callExpression: ts.CallExpression, argumentMapping: IArgumentIndexMapping, contentOptions: IContentOptions): IMessageData {
    let callArguments = callExpression.arguments;
    let textArgument = callArguments[argumentMapping.text],
        textPluralArgument = callArguments[argumentMapping.textPlural],
        contextArgument = callArguments[argumentMapping.context];

    textArgument = checkAndConcatenateStrings(textArgument);
    textPluralArgument = checkAndConcatenateStrings(textPluralArgument);

    let textPluralValid = typeof argumentMapping.textPlural !== 'number' || isTextLiteral(textPluralArgument);

    if (isTextLiteral(textArgument) && textPluralValid) {
        let message: IMessageData = {
            text: normalizeContent(textArgument.text, contentOptions)
        };

        if (isTextLiteral(textPluralArgument)) {
            message.textPlural = normalizeContent(textPluralArgument.text, contentOptions);
        }
        if (isTextLiteral(contextArgument)) {
            message.context = normalizeContent(contextArgument.text, contentOptions);
        }

        return message;
    }

    return null;
}

function isTextLiteral(expression: ts.Expression): expression is ts.LiteralExpression {
    return expression && (expression.kind === ts.SyntaxKind.StringLiteral || expression.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral);
}

function isParenthesizedExpression(expression: ts.Expression): expression is ts.ParenthesizedExpression {
    return expression && expression.kind === ts.SyntaxKind.ParenthesizedExpression;
}

function isBinaryExpression(expression: ts.Expression): expression is ts.BinaryExpression {
    return expression && expression.kind === ts.SyntaxKind.BinaryExpression;
}

function getAdditionExpression(expression: ts.Expression): ts.BinaryExpression | null {
    while (isParenthesizedExpression(expression)) {
        expression = expression.expression;
    }

    if (isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        return expression;
    }

    return null;
}

function checkAndConcatenateStrings(expression: ts.Expression): ts.Expression {
    let addition: ts.BinaryExpression;

    if (!expression || !(addition = getAdditionExpression(expression))) {
        return expression;
    }

    let concatenated = ts.createStringLiteral('');

    if (processStringAddition(addition, concatenated)) {
        return concatenated;
    }

    return expression;
}

function processStringAddition(expression: ts.BinaryExpression, concatenated: ts.StringLiteral): boolean {
    let addition: ts.BinaryExpression;

    if (isTextLiteral(expression.left)) {
        concatenated.text += expression.left.text;
    } else if (addition = getAdditionExpression(expression.left)) {
        if (!processStringAddition(addition, concatenated)) {
            return false;
        }
    } else {
        return false;
    }

    if (isTextLiteral(expression.right)) {
        concatenated.text += expression.right.text;
        return true;
    } else if (addition = getAdditionExpression(expression.right)) {
        return processStringAddition(addition, concatenated);
    } else {
        return false;
    }
}
