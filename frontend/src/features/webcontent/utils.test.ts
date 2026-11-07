import { describe, expect, it } from 'vitest';
import { splitContent } from './utils';

describe('splitContent', () => {
    it('splits after each closing paragraph and spreads the paragraphs over the segments', () => {
        const content = '<p>a</p><p>b</p><p>c</p>';
        expect(splitContent(content, 1)).toEqual(['<p>a</p><p>b</p><p>c</p>']);
        expect(splitContent(content, 2)).toEqual(['<p>a</p><p>b</p>', '<p>c</p>']);
        expect(splitContent(content, 3)).toEqual(['<p>a</p>', '<p>b</p>', '<p>c</p>']);
    });

    it('keeps whitespace between paragraphs with the following paragraph', () => {
        expect(splitContent('<p>a</p>\n<p>b</p>', 2)).toEqual(['<p>a</p>', '\n<p>b</p>']);
    });

    it('keeps text after the last paragraph and drops trailing whitespace', () => {
        expect(splitContent('<p>a</p><ul><li>x</li></ul>', 2)).toEqual(['<p>a</p>', '<ul><li>x</li></ul>']);
        expect(splitContent('<p>a</p>\n', 2)).toEqual(['<p>a</p>', '']);
    });

    it('returns empty segments when there are more segments than paragraphs', () => {
        expect(splitContent('<p>a</p>', 3)).toEqual(['<p>a</p>', '', '']);
    });

    it('treats content without paragraphs as a single paragraph', () => {
        expect(splitContent('plain text', 2)).toEqual(['plain text', '']);
    });

    it('returns the content as is for no segments or empty content', () => {
        expect(splitContent('<p>a</p>', 0)).toEqual(['<p>a</p>']);
        expect(splitContent('', 2)).toEqual(['']);
        expect(splitContent('   ', 2)).toEqual(['   ']);
    });
});
