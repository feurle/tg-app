import { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

interface Props {
    value: string;
    onChange: (html: string) => void;
}

export default function RichTextEditor({ value, onChange }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
        ],
        content: value,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    const setLink = useCallback(() => {
        if (!editor) return;
        const prev = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('URL', prev ?? 'https://');
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
    }, [editor]);

    const [showHeadings, setShowHeadings] = useState(false);

    if (!editor) return null;

    return (
        <div className="rte-wrapper">
            <div className="rte-toolbar">
                {/* Text style */}
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'rte-btn active' : 'rte-btn'} title="Fett (Ctrl+B)">
                    <b>B</b>
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'rte-btn active' : 'rte-btn'} title="Kursiv (Ctrl+I)">
                    <i>I</i>
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={editor.isActive('strike') ? 'rte-btn active' : 'rte-btn'} title="Durchgestrichen">
                    <s>S</s>
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleCode().run()}
                    className={editor.isActive('code') ? 'rte-btn active' : 'rte-btn'} title="Inline-Code">
                    {'<>'}
                </button>

                <div className="rte-divider" />

                {/* Headings */}
                <div style={{ position: 'relative' }}>
                    <button type="button"
                        className={editor.isActive('heading') ? 'rte-btn active' : 'rte-btn'}
                        title="Überschrift"
                        onClick={() => setShowHeadings(v => !v)}>
                        H▾
                    </button>
                    {showHeadings && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, zIndex: 10,
                            background: 'var(--surface)', border: '1px solid var(--border)',
                            borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            display: 'flex', flexDirection: 'column', minWidth: 72,
                        }}>
                            {([1, 2, 3] as const).map(level => (
                                <button key={level} type="button"
                                    className={editor.isActive('heading', { level }) ? 'rte-btn active' : 'rte-btn'}
                                    style={{ textAlign: 'left', padding: '5px 10px' }}
                                    onClick={() => {
                                        editor.chain().focus().toggleHeading({ level }).run();
                                        setShowHeadings(false);
                                    }}>
                                    H{level}
                                </button>
                            ))}
                            <button type="button" className="rte-btn"
                                style={{ textAlign: 'left', padding: '5px 10px' }}
                                onClick={() => {
                                    editor.chain().focus().setParagraph().run();
                                    setShowHeadings(false);
                                }}>
                                ¶
                            </button>
                        </div>
                    )}
                </div>

                <div className="rte-divider" />

                {/* Lists */}
                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'rte-btn active' : 'rte-btn'} title="Aufzählung">
                    •≡
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'rte-btn active' : 'rte-btn'} title="Nummerierte Liste">
                    1≡
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={editor.isActive('blockquote') ? 'rte-btn active' : 'rte-btn'} title="Zitat">
                    ❝
                </button>

                <div className="rte-divider" />

                {/* Link */}
                <button type="button" onClick={setLink}
                    className={editor.isActive('link') ? 'rte-btn active' : 'rte-btn'} title="Link einfügen / bearbeiten">
                    🔗
                </button>

                <div className="rte-divider" />

                {/* Block / misc */}
                <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="rte-btn" title="Trennlinie">
                    —
                </button>

                <div className="rte-divider" />

                {/* History */}
                <button type="button" onClick={() => editor.chain().focus().undo().run()}
                    className="rte-btn" disabled={!editor.can().undo()} title="Rückgängig (Ctrl+Z)">
                    ↩
                </button>
                <button type="button" onClick={() => editor.chain().focus().redo().run()}
                    className="rte-btn" disabled={!editor.can().redo()} title="Wiederholen (Ctrl+Y)">
                    ↪
                </button>
            </div>

            <EditorContent editor={editor} className="rte-content" />
        </div>
    );
}
