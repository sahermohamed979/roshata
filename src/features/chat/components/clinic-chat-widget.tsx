'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  MessageSquare,
  Send,
  X,
  Minus,
  Sparkles,
  Stethoscope,
  KeyRound,
  Shield,
  Circle,
  Volume2,
  VolumeX,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import {
  getChatMessagesAction,
  sendChatMessageAction,
  ChatMessageItem,
} from '../apis/chat.action';
import { NafsIcon } from '@/shared/components/nafs-logo';

// ─── Web Audio API Notification Sound (خفيف وسلس ونقي بدون ملفات خارجية) ─────────
function playClinicChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;

    // النغمة الأولى: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // النغمة الثانية: A5 (880 Hz) بفاصل زمني انسيابي
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.08);
    gain2.gain.setValueAtTime(0.15, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.35);

    setTimeout(() => {
      try {
        ctx.close();
      } catch {}
    }, 500);
  } catch {
    // ignore audio failure
  }
}

export function ClinicChatWidget() {
  const { data: session } = useSession();
  const currentUserRole = (session?.user as any)?.role || 'DOCTOR';
  const currentUserId = (session?.user as any)?.id || '';
  const currentUserName = session?.user?.name || 'مستخدم';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const lastSeenMsgIdRef = useRef<string | null>(null);

  // استرجاع تفضيل الصوت
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nafs_chat_sound');
      if (saved !== null) {
        setSoundEnabled(saved === 'true');
      }
    } catch {}
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('nafs_chat_sound', String(next));
      } catch {}
      if (next) playClinicChime();
      return next;
    });
  };

  // طلب إذن إشعارات النظام في الويندوز/المتصفح
  const requestNotificationPermission = useCallback(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  // قوالب الرسائل السريعة
  const doctorQuickTemplates = [
    'أرسل المريض القادم 🩺',
    'محتاج ملف المريض 📋',
    'سأنتهي من الكشف بعد دقيقتين ⏱️',
    'استراحة 5 دقائق ☕',
    'يرجى تسوية حساب المريض 💳',
  ];

  const receptionQuickTemplates = [
    'المريض القادم في الانتظار 👤',
    'مريض استشارة مستعجل ⚠️',
    'المريض جاهز للكشف ✅',
    'تم تسجيل مريض جديد 📝',
    'يرجى التأكيد على إنهاء الكشف 🔍',
  ];

  const quickTemplates =
    currentUserRole === 'DOCTOR' ? doctorQuickTemplates : receptionQuickTemplates;

  // جلب الرسائل من الـ API
  const fetchMessages = useCallback(async () => {
    try {
      const res = await getChatMessagesAction();
      if (res.status && res.payload) {
        const newItems = res.payload;
        setMessages((prev) => {
          // حساب الرسائل غير المقروءة عند وصولها عبر polling
          if (newItems.length > prev.length) {
            const added = newItems.slice(prev.length);
            const foreignNew = added.filter((m) => m.senderId !== currentUserId);
            if (foreignNew.length > 0 && !isOpen) {
              setUnreadCount((c) => c + foreignNew.length);
              if (soundEnabled) playClinicChime();
            }
          }
          return newItems;
        });
      }
    } catch {}
  }, [currentUserId, isOpen, soundEnabled]);

  // التمرير التلقائي لأسفل المحادثة
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
      requestNotificationPermission();
    }
  }, [messages, isOpen, requestNotificationPermission]);

  // الاتصال بـ Socket.IO للرسائل الفورية مع Polling احتياطي
  useEffect(() => {
    fetchMessages();

    // 1. Polling fallback كل 4 ثوانٍ
    const pollInterval = setInterval(() => {
      fetchMessages();
    }, 4000);

    // 2. محاولة الاتصال بـ Socket.io عبر Ticket
    let socket: Socket | null = null;
    const connectSocket = async () => {
      try {
        const ticketRes = await fetch('/api/realtime/ticket', { method: 'POST' });
        const ticketData = await ticketRes.json();
        const ticket = ticketData.payload?.ticket;

        const host = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
        const socketUrl = `http://${host}:4000`;

        socket = io(socketUrl, {
          auth: { ticket },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 2000,
        });

        socket.on('connect', () => {
          setIsConnected(true);
        });

        socket.on('disconnect', () => {
          setIsConnected(false);
        });

        socket.on('chat:message', (newMsg: ChatMessageItem) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // تنبيه إذا كانت الرسالة من الطرف الآخر
          if (newMsg.senderId !== currentUserId) {
            // تشغيل الصوت التنبيهي إن كان مفعل
            if (soundEnabled) {
              playClinicChime();
            }

            // إشعار سطح المكتب إن كانت النافذة مصغرة
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                const notif = new Notification(`نَفَس · رسالة جديدة من ${newMsg.senderName}`, {
                  body: newMsg.message,
                  icon: '/app-icon.png',
                });
                notif.onclick = () => {
                  window.focus();
                  setIsOpen(true);
                };
              } catch {}
            }

            // زيادة عداد غير المقروء وتوست تفاعلي إذا كانت النافذة مغلقة
            if (!isOpen) {
              setUnreadCount((c) => c + 1);
              toast.info(`رسالة جديدة من ${newMsg.senderName}: "${newMsg.message.slice(0, 35)}..."`, {
                action: {
                  label: 'عرض المحادثة',
                  onClick: () => setIsOpen(true),
                },
                duration: 5000,
              });
            }
          }
        });

        socketRef.current = socket;
      } catch {
        // Fallback to polling only
      }
    };

    connectSocket();

    return () => {
      clearInterval(pollInterval);
      if (socket) {
        socket.disconnect();
      }
    };
  }, [fetchMessages, isOpen, currentUserId, soundEnabled]);

  // إرسال رسالة
  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInputValue('');

    try {
      const res = await sendChatMessageAction(text);
      if (res.status && res.payload) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.payload!.id)) return prev;
          return [...prev, res.payload!];
        });
        scrollToBottom();
      } else {
        toast.error(res.message || 'فشل إرسال الرسالة');
      }
    } catch {
      toast.error('تعذر إرسال الرسالة، يرجى التحقق من الاتصال');
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed bottom-5 left-5 z-50 select-none print:hidden" dir="rtl">
      {/* نافذة الشات المفتوحة */}
      {isOpen ? (
        <div className="bg-white rounded-3xl shadow-2xl border border-[#D0E5DC] w-[360px] sm:w-[410px] h-[530px] flex flex-col overflow-hidden animate-in fade-in-50 slide-in-from-bottom-6">
          {/* 1. ترويسة الشات بتصميم نَفَس الزمردي */}
          <div className="bg-gradient-to-r from-[#074C3A] to-[#0B7B5E] text-white p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <NafsIcon size={34} />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-sm text-white">محادثة العيادة الفورية</h3>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#45DBA5] bg-[#074C3A]/70 px-1.5 py-0.5 rounded-full border border-[#45DBA5]/30">
                    <Circle className="w-1.5 h-1.5 fill-[#45DBA5] animate-pulse" />
                    <span>{isConnected ? 'متصل فورياً' : 'تزامن نشط'}</span>
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 font-medium">
                  تواصل مباشر بين الطبيب ومكتب الاستقبال
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* زر تفعيل/كتم الصوت */}
              <button
                type="button"
                onClick={toggleSound}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  soundEnabled
                    ? 'text-emerald-200 hover:text-white hover:bg-white/10'
                    : 'text-rose-300 hover:text-rose-100 hover:bg-rose-500/20'
                }`}
                title={soundEnabled ? 'تنبيهات الصوت مفعلة (اضغط للكتم)' : 'الصوت مكتوم (اضغط للتفعيل)'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* زر تصغير النافذة */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-100 hover:text-white transition-colors cursor-pointer"
                title="تصغير المحادثة"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. قوالب الرسائل السريعة بضغطة واحدة */}
          <div className="bg-[#F8FBF9] border-b border-[#D0E5DC] px-3 py-2 space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#4A635B]">
              <Sparkles className="w-3 h-3 text-[#CB902B]" />
              <span>رسائل سريعة بنقرة واحدة:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {quickTemplates.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(tmpl)}
                  className="px-2.5 py-1 rounded-xl bg-white border border-[#D0E5DC] hover:border-[#0B7B5E] hover:bg-[#E3F5EE] text-[#0B241D] hover:text-[#0B7B5E] text-[11px] font-bold transition-all whitespace-nowrap shadow-2xs cursor-pointer active:scale-95"
                >
                  {tmpl}
                </button>
              ))}
            </div>
          </div>

          {/* 3. صندوق عرض الرسائل */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8FBF9]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#4A635B] space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#E3F5EE] flex items-center justify-center text-[#0B7B5E]">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-xs font-black text-[#0B241D]">لا توجد رسائل سابقة</p>
                <p className="text-[11px] text-[#4A635B]">
                  ابدأ التواصل الفوري بين الطبيب والاستقبال لتنسيق دخول المرضى.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                const isDoctor = msg.senderRole === 'DOCTOR';
                const isAdmin = msg.senderRole === 'ADMIN';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1 text-[10px] text-[#4A635B] font-bold mb-1 px-1">
                      {isDoctor ? (
                        <span className="flex items-center gap-0.5 text-[#0B7B5E]">
                          <Stethoscope className="w-3 h-3" />
                          <span>{msg.senderName} (طبيب)</span>
                        </span>
                      ) : isAdmin ? (
                        <span className="flex items-center gap-0.5 text-[#074C3A]">
                          <Shield className="w-3 h-3" />
                          <span>{msg.senderName} (إدارة)</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-[#0B7490]">
                          <KeyRound className="w-3 h-3" />
                          <span>{msg.senderName} (استقبال)</span>
                        </span>
                      )}
                      <span>·</span>
                      <span className="font-mono text-[#8D9D97]">{formatMessageTime(msg.createdAt)}</span>
                    </div>

                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs font-bold leading-relaxed shadow-2xs ${
                        isMe
                          ? 'bg-[#0B7B5E] text-white rounded-br-xs'
                          : isDoctor
                          ? 'bg-[#E3F5EE] text-[#0B241D] border border-[#D0E5DC] rounded-bl-xs'
                          : 'bg-white text-[#0B241D] border border-[#D0E5DC] rounded-bl-xs'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 4. حقل كتابة الرسالة */}
          <div className="p-3 bg-white border-t border-[#D0E5DC] flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="اكتب رسالة للاستقبال أو الطبيب..."
              className="flex-1 h-10 px-3.5 rounded-2xl border border-[#D0E5DC] bg-[#F8FBF9] text-xs font-bold text-[#0B241D] placeholder:text-[#8D9D97] focus:outline-none focus:border-[#0B7B5E] focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isSending}
              className="w-10 h-10 rounded-2xl bg-[#0B7B5E] hover:bg-[#09634C] active:scale-95 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer disabled:opacity-40"
              title="إرسال"
            >
              <Send className="w-4 h-4 -scale-x-100" />
            </button>
          </div>
        </div>
      ) : (
        /* زر الشات العائم المصغر مع عداد الرسائل والإشعار والصوت */
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setUnreadCount(0);
          }}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#0B7B5E] hover:bg-[#09634C] text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-emerald-400/30 active:scale-95"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-emerald-100 group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-2.5 -right-2.5 min-w-[20px] h-5 px-1 rounded-full bg-[#C0282E] text-white font-black text-[10px] flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                {unreadCount > 9 ? '+9' : unreadCount}
              </span>
            )}
          </div>
          <span className="font-heading font-black text-xs">
            محادثة العيادة {unreadCount > 0 ? `(${unreadCount})` : ''}
          </span>
          <span className="w-2 h-2 rounded-full bg-[#45DBA5] animate-pulse" />
        </button>
      )}
    </div>
  );
}
