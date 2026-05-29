import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Chatbot',
  description: 'AI-powered chatbot with Claude API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
