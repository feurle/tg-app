export function splitContent(content: string, count: number): string[] {
    if (!content || count === 0) return [content || ''];

    // Each paragraph up to and including its </p>, plus any rest after the last one. No lookbehind:
    // Safari before 16.4 cannot parse it and would reject the whole bundle (#148).
    const paragraphs = (content.match(/[\s\S]*?<\/p>|[\s\S]+$/g) ?? []).filter(p => p.trim());
    if (paragraphs.length === 0) return [content];

    const perSegment = Math.ceil(paragraphs.length / count);
    return Array.from({length: count}, (_, i) =>
        paragraphs.slice(i * perSegment, (i + 1) * perSegment).join('')
    );
}
