import * as parse5 from 'parse5';

import { Element } from './parser';
import { IContentOptions, normalizeContent } from '../utils/content';

export abstract class HtmlUtils {

    public static getAttributeValue(element: Element, attributeName: string): string | null {
        for (let attribute of element.attrs) {
            if (attribute.name === attributeName) {
                return attribute.value;
            }
        }

        return null;
    }

    public static getNormalizedAttributeValue(element: Element, attributeName: string, options: IContentOptions): string | null {
        let value = HtmlUtils.getAttributeValue(element, attributeName);
        if (value === null) {
            return null;
        }

        return normalizeContent(value, options);
    }

    public static getElementContent(element: Element, options: IContentOptions): string {
        let content = parse5.serialize(element, {});

        // Un-escape characters that get escaped by parse5
        content = content
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');

        return normalizeContent(content, options);
    }
}
