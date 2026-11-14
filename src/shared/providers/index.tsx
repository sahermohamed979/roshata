import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from '../components/ui/sonner';
import NextAuthProvider from './components/next-auth-provider';
import ReactQueryProvider from './components/react-query.provider';
import { RoshtehDatabaseProvider } from './roshteh-db-provider';

export const Providers = ({ children, locale }: { children: React.ReactNode; locale: string }) => {
  return (
    <NextIntlClientProvider locale={locale}>
      <ReactQueryProvider>
        <NextAuthProvider>
          <RoshtehDatabaseProvider>
            <Toaster richColors position={locale === 'en' ? 'top-left' : 'top-right'} />
            {children}
          </RoshtehDatabaseProvider>
        </NextAuthProvider>
      </ReactQueryProvider>
    </NextIntlClientProvider>
  );
};
