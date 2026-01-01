'use client';

import { useSession } from 'next-auth/react';

export default function DebugAuth() {
  const { data: session, status } = useSession();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 z-50">
      <h2 className="text-lg font-bold mb-2">Debug Auth</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Status:</h3>
          <pre className="text-sm bg-gray-800 p-2 rounded">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
        <div>
          <h3 className="font-semibold">Session:</h3>
          <pre className="text-sm bg-gray-800 p-2 rounded max-h-40 overflow-auto">
            {JSON.stringify(session, null, 2) || 'Aucune session'}
          </pre>
        </div>
      </div>
    </div>
  );
}
