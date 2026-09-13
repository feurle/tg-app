export function splitContent(content: string, count: number): string[] {
    if (!content || count === 0) return [content || ''];

    const paragraphs = content.split(/(?<=<\/p>)/).filter(p => p.trim());
    if (paragraphs.length === 0) return [content];

    const perSegment = Math.ceil(paragraphs.length / count);
    return Array.from({length: count}, (_, i) =>
        paragraphs.slice(i * perSegment, (i + 1) * perSegment).join('')
    );
}
