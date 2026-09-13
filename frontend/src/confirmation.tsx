import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type Confirm = (message: string) => Promise<boolean>;
const Context = createContext<Confirm | null>(null);

export function ConfirmationProvider({children}: {children: ReactNode}) {
  const [request,setRequest] = useState<{message: string; resolve: (value: boolean) => void} | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {if (request) dialog.current?.showModal();}, [request]);
  function settle(value: boolean) {dialog.current?.close(); request?.resolve(value); setRequest(null);}
  const confirm: Confirm = message => new Promise(resolve => setRequest({message,resolve}));
  return <Context.Provider value={confirm}>{children}{request && <dialog ref={dialog} aria-labelledby="confirmation-title" aria-describedby="confirmation-description" onCancel={e => {e.preventDefault(); settle(false);}}><h2 id="confirmation-title">Confirm this change</h2><p id="confirmation-description">{request.message}</p><div className="actions"><button autoFocus className="secondary" onClick={() => settle(false)}>Go back</button><button onClick={() => settle(true)}>Confirm change</button></div></dialog>}</Context.Provider>;
}

export function useConfirmation() {const confirm = useContext(Context); if (!confirm) throw new Error('ConfirmationProvider missing'); return confirm;}
