'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
 useEffect(() => {
  console.error(error);
 }, [error]);

 return (
  <html lang="ar" dir="rtl">
   <body style={{ margin: 0, fontFamily: 'Tajawal, Arial, sans-serif', background: '#F8FAFC', color: '#172033' }}>
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
     <div style={{ maxWidth: 420, width: '100%', background: '#fff', border: '1px solid #E6EAF0', borderRadius: 14, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 40 }}>⚠️</div>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginTop: 12 }}>حدث خطأ غير متوقع</h1>
      <p style={{ fontSize: 14, color: '#667085' }}>نعتذر عن الإزعاج — حاول مرة أخرى</p>
      {error.digest && (
       <p style={{ fontSize: 12, color: '#667085', direction: 'ltr' }}>{error.digest}</p>
      )}
      <button
       onClick={reset}
       style={{ marginTop: 18, background: '#5B5CE2', color: '#fff', border: 0, borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
      >
       حاول مرة أخرى
      </button>
     </div>
    </div>
   </body>
  </html>
 );
}
