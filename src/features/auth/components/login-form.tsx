'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from 'cn';
import { Controller, useForm } from 'react-hook-form';
import { LoginFormType } from '../types/auth';
import { loginSchema } from '../schemas/login.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldError, FieldLabel, Field } from '@/shared/components/ui/field';
import { Button } from '@/shared/components/ui/button';
import { useRouter } from 'next/navigation';
import { Loader2, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';


/**
 * نموذج تسجيل الدخول المطابق للتصميم تماماً مع التحقق البصري ودعم اللغتين
 */
export function LoginForm() {
  const t = useTranslations('Auth.login');
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema(t)),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormType) => {
    try {
      const loginResponse = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (!loginResponse?.ok) {
        if (
          loginResponse?.error === 'Invalid credentials' ||
          loginResponse?.error === 'CredentialsSignin'
        ) {
          toast.error(t('invalidCredentials'));
        } else {
          toast.error(loginResponse?.error ?? t('unknownError'));
        }
        return;
      }

      toast.success(t('login-success'));
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error(t('unknownError'));
    }
  };

  const onError = (errors: typeof form.formState.errors) => {
    console.log('❌ Form validation failed with errors:', errors);
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      {/* رأس النموذج */}
      <div className="text-center sm:text-start mb-8">
        <h2 className="text-3xl sm:text-4xl font-heading font-black text-[#0B241D] tracking-tight">
          {t('title')}
        </h2>
        <p className="text-sm text-[#4A635B] mt-2 font-medium">
          {t('subtitle')}
        </p>
      </div>

      {/* حقول الإدخال */}
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-5" noValidate>
        {/* اسم المستخدم */}
        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel className="block text-xs font-bold text-[#0B241D] mb-2 text-start">
                {t('usernameLabel')}
              </FieldLabel>

              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder={t('usernamePlaceholder')}
                className={cn(
                  'w-full h-12 px-4 rounded-xl border border-[#D0E5DC] bg-white text-[#0B241D] text-sm placeholder:text-[#8D9D97] transition-all duration-150',
                  'focus:outline-none focus:border-[#0B7B5E] focus:ring-4 focus:ring-[#0B7B5E]/15',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  fieldState.invalid && 'border-destructive focus:border-destructive focus:ring-destructive/10'
                )}
                {...field}
              />

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* كلمة المرور */}
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel className="block text-xs font-bold text-[#0B241D] mb-2 text-start">
                {t('passwordLabel')}
              </FieldLabel>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder={t('passwordPlaceholder')}
                  className={cn(
                    'w-full h-12 pr-4 pl-12 rounded-xl border border-[#D0E5DC] bg-white text-[#0B241D] text-sm placeholder:text-[#8D9D97] transition-all duration-150',
                    'focus:outline-none focus:border-[#0B7B5E] focus:ring-4 focus:ring-[#0B7B5E]/15',
                    'disabled:opacity-60 disabled:cursor-not-allowed',
                    fieldState.invalid && 'border-destructive focus:border-destructive focus:ring-destructive/10'
                  )}
                  {...field}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0B7B5E] p-1 rounded-lg transition-colors cursor-pointer select-none"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* زر الدخول الزمردي */}
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className={cn(
            'w-full h-12 bg-[#0B7B5E] hover:bg-[#09634C] active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center cursor-pointer select-none mt-7',
            form.formState.isSubmitting && 'opacity-70 pointer-events-none'
          )}
        >
          {form.formState.isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('submitting')}</span>
            </span>
          ) : (
            <span>{t('submitBtn')}</span>
          )}
        </Button>
      </form>

      {/* رابط تجربة البرنامج والتواصل مع الشركة المطورة */}
      <div className="mt-8 pt-5 border-t border-[#D0E5DC]/80 text-center select-none">
        <p className="text-xs text-[#4A635B] mb-2 font-medium">
          تريد تجربة المنظومة لعيادتك أو معرفة الأسعار؟
        </p>
        <a
          href="https://www.vyro.software/en"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            toast.info('تواصل مع فريق تطوير Vyro Software لتجربة المنظومة ومعرفة كل التفاصيل: https://www.vyro.software/en', {
              duration: 6000,
            });
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E3F5EE] border border-[#D0E5DC] text-[#0B7B5E] hover:text-[#09634C] hover:bg-[#d5eee4] text-xs font-bold transition-all shadow-2xs"
        >
          <span>جرب الموقع تجريبياً · تواصل مع Vyro Software</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
