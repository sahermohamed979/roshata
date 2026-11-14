import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from '../components/ui/sonner';
import ReactQueryProvider from './components/react-query.provider';
import { RoshtehDatabaseProvider } from './roshteh-db-provider';

export const Providers = ({ children, locale }: { children: React.ReactNode; locale: string }) => {
  return (
    <NextIntlClientProvider locale={locale}>
      <ReactQueryProvider>
        <RoshtehDatabaseProvider>
          <Toaster richColors position={locale === 'en' ? 'top-left' : 'top-right'} />
          {children}
        </RoshtehDatabaseProvider>
      </ReactQueryProvider>
    </NextIntlClientProvider>
  );
};
