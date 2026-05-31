import { useEffect, useRef, useState } from 'react';
import { Phone, ArrowLeft, Send, Camera } from 'lucide-react';
import { isNative } from '../../lib/platform';
import { hapticTap } from '../../lib/haptics';
import type { ChatMessage } from '../../types/order';

interface Props {
  otherName: string;
  otherPhone?: string | null;
  messages: ChatMessage[];
  input: string;
  sending: boolean;
  myUserId: string;
  accentColor: string;
  isDark: boolean;
  onClose: () => void;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onSendPhoto?: (file: File) => Promise<void>;
  emptyText?: string;
}

export function ChatScreen({
  otherName, otherPhone, messages, input, sending, myUserId,
  accentColor, isDark, onClose, onInputChange, onSend, onSendPhoto, emptyText,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [overlayHeight, setOverlayHeight] = useState<number | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 50);
  }, [messages.length]);

  // Android keyboard fix: use visualViewport to shrink overlay when keyboard opens
  useEffect(() => {
    if (!isNative()) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      setOverlayHeight(vv.height);
      // Scroll to bottom so input stays visible
      setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 80);
    };
    vv.addEventListener('resize', update);
    update();
    return () => vv.removeEventListener('resize', update);
  }, []);

  const c = {
    bg:      isDark ? '#111827' : '#f9fafb',
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
    input:   isDark ? '#1f2937' : '#ffffff',
    header:  isDark ? '#1e2433' : '#ffffff',
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onSendPhoto) return;
    e.target.value = '';
    await onSendPhoto(file);
  };

  const renderMsgContent = (msg: ChatMessage, isMine: boolean) => {
    if (msg.photoUrl) {
      return (
        <div>
          <img
            src={msg.photoUrl}
            alt="фото"
            onClick={() => setLightboxUrl(msg.photoUrl!)}
            style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '0.5rem', cursor: 'pointer', display: 'block', objectFit: 'cover' }}
          />
          {msg.text && <div style={{ marginTop: '0.35rem', fontSize: '0.875rem', wordBreak: 'break-word' }}>{msg.text}</div>}
        </div>
      );
    }
    return <>{msg.text}</>;
  };

  const isFullscreen = isNative();

  const overlay = (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: overlayHeight ? `${overlayHeight}px` : '100%',
        zIndex: 99990,
        display: 'flex',
        flexDirection: 'column',
        background: c.bg,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          paddingTop: 'calc(0.75rem + env(safe-area-inset-top))',
          background: c.header,
          borderBottom: `1px solid ${c.border}`,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, display: 'flex', padding: '0.25rem', flexShrink: 0 }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${accentColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
          👤
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{otherName}</div>
          <div style={{ fontSize: '0.72rem', color: c.muted }}>Чат по заказу</div>
        </div>
        {otherPhone && (
          <a
            href={`tel:${otherPhone}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: `${accentColor}18`, color: accentColor, textDecoration: 'none', flexShrink: 0 }}
          >
            <Phone className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: c.subtle }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: c.muted, fontSize: '0.85rem', marginTop: '3rem' }}>
            {emptyText ?? 'Начните переписку'}
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === myUserId;
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
              {!isMine && (
                <span style={{ fontSize: '0.7rem', color: c.muted, marginBottom: '0.15rem', paddingLeft: '0.25rem' }}>{msg.senderName}</span>
              )}
              <div
                style={{
                  maxWidth: '78%',
                  padding: msg.photoUrl ? '0.375rem' : '0.5rem 0.75rem',
                  borderRadius: isMine ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                  background: isMine ? accentColor : c.surface,
                  color: isMine ? 'white' : c.text,
                  fontSize: '0.9rem',
                  wordBreak: 'break-word',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}
              >
                {renderMsgContent(msg, isMine)}
              </div>
              <span style={{ fontSize: '0.65rem', color: c.muted, marginTop: '0.15rem', paddingLeft: '0.25rem', paddingRight: '0.25rem' }}>
                {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
          background: c.surface,
          borderTop: `1px solid ${c.border}`,
          flexShrink: 0,
          alignItems: 'center',
        }}
      >
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        {onSendPhoto && (
          <button
            disabled={sending}
            onClick={() => { hapticTap(); fileRef.current?.click(); }}
            style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: c.subtle, border: `1.5px solid ${c.border}`, color: c.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <Camera className="w-4 h-4" />
          </button>
        )}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
          placeholder="Написать…"
          style={{
            flex: 1,
            height: '2.5rem',
            padding: '0 0.875rem',
            borderRadius: '1.25rem',
            border: `1.5px solid ${c.border}`,
            background: c.input,
            color: c.text,
            fontSize: '0.95rem',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <button
          disabled={(!input.trim() && !sending) ? false : sending}
          onClick={() => { hapticTap(); onSend(); }}
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            background: input.trim() ? accentColor : c.border,
            color: 'white',
            border: 'none',
            cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <>
        {overlay}
        {lightboxUrl && (
          <div
            onClick={() => setLightboxUrl(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
          >
            <img src={lightboxUrl} alt="фото" style={{ maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '0.5rem' }} />
          </div>
        )}
      </>
    );
  }

  // Desktop: render as inline panel inside the order card
  return (
    <div style={{ border: `1.5px solid ${c.border}`, borderRadius: '0.875rem', overflow: 'hidden', marginBottom: '1rem' }}>
      {/* Compact header with name + call */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: c.surface, borderBottom: `1px solid ${c.border}` }}>
        <div style={{ flex: 1, fontWeight: 600, fontSize: '0.85rem', color: c.text }}>{otherName}</div>
        {otherPhone && (
          <a href={`tel:${otherPhone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: accentColor, textDecoration: 'none' }}>
            <Phone className="w-3.5 h-3.5" /> Позвонить
          </a>
        )}
      </div>
      {/* Messages */}
      <div ref={scrollRef} style={{ height: 'clamp(150px, 35vh, 280px)', overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: c.subtle }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: c.muted, fontSize: '0.8rem', marginTop: '2rem' }}>{emptyText ?? 'Начните переписку'}</div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === myUserId;
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
              {!isMine && <span style={{ fontSize: '0.7rem', color: c.muted, marginBottom: '0.15rem', paddingLeft: '0.25rem' }}>{msg.senderName}</span>}
              <div style={{ maxWidth: '80%', padding: msg.photoUrl ? '0.375rem' : '0.5rem 0.75rem', borderRadius: isMine ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem', background: isMine ? accentColor : c.surface, color: isMine ? 'white' : c.text, fontSize: '0.875rem', wordBreak: 'break-word' }}>
                {renderMsgContent(msg, isMine)}
              </div>
              <span style={{ fontSize: '0.65rem', color: c.muted, marginTop: '0.15rem', paddingLeft: '0.25rem', paddingRight: '0.25rem' }}>
                {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>
      {/* Input */}
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.625rem', background: c.surface, borderTop: `1px solid ${c.border}`, alignItems: 'center' }}>
        {onSendPhoto && (
          <button
            disabled={sending}
            onClick={() => fileRef.current?.click()}
            style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', background: c.subtle, border: `1.5px solid ${c.border}`, color: c.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        )}
        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
          placeholder="Написать…"
          style={{ flex: 1, height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.625rem', border: `1.5px solid ${c.border}`, background: c.input, color: c.text, fontSize: '1rem', outline: 'none', fontFamily: 'inherit' }}
        />
        <button
          disabled={!input.trim() || sending}
          onClick={onSend}
          style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: input.trim() ? accentColor : c.border, color: 'white', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
        >
          <img src={lightboxUrl} alt="фото" style={{ maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '0.5rem' }} />
        </div>
      )}
    </div>
  );
}
