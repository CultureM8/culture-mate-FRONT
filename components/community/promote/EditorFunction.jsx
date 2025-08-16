'use client'; /*글양식 변환 기능*/
import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

/**markdown */
const parseMarkdown = (text = '') =>
  text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/gim, '<em>$1</em>')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/gim,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gis, '<ul>$1</ul>')
    .replace(/\n/g, '<br>');

export default function EditorFunction({
  value,
  onChange,
  mode = 'plain',
  placeholder = '내용을 입력하세요...',
  className = '',
}) {
  const taRef = useRef(null);

  const autoResize = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(
      el.scrollHeight,
      500
    )}px`; /* 최소 높이 변경가능성있음*/
  };
  useEffect(() => {
    autoResize();
  }, [value]);

  const renderPreview = () => {
    if (mode === 'html') {
      return (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value || '') }}
        />
      );
    }
    if (mode === 'markdown') {
      const html = parseMarkdown(value || '');
      return (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
        />
      );
    }
    return null;
  };

  return (
    <section className={`w-[1200px] mx-auto space-y-3 ${className}`}>
      {/* 입력창 */}
      <div className="text-xs text-gray-400">텍스트</div>
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          autoResize();
        }}
        placeholder={placeholder}
        className="w-full min-h-[500px] p-4 border rounded-md border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto"
        rows={1}
      />

      {/* 미리보기: plain 모드에서는 렌더하지 않음 */}
      {mode !== 'plain' && (
        <>
          <div className="text-xs text-gray-500">
            {mode === 'html' ? '미리보기 (HTML)' : '미리보기 (Markdown)'}
          </div>
          <div className="w-full min-h-[400px] p-4 border rounded-md border-gray-300 bg-gray-50 overflow-y-auto">
            {renderPreview()}
          </div>
        </>
      )}
    </section>
  );
}
