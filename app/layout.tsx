import type { Metadata } from 'next';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import './globals.css';
import './festival.css';
export const metadata: Metadata = { title: 'Stay Hub | PgBee × Dhwani ’26', description: 'Discover Stay Hub in Vattappara, Kerala. Your home away from home for Dhwani ’26.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
