import { useEffect, useRef } from 'react';

export default function AdsterraBanner() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // 1) Configuración global que Adsterra lee del window
    (window as any).atOptions = {
      key: '2649afb6dc13fb7f8122254837b5eeb5',
      format: 'iframe',
      height: 50,
      width: 320,
      params: {},
    };

    // 2) Script invocador
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://bauval.org/22/2649afb6dc13fb7f8122254837b5eeb5';

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
      delete (window as any).atOptions;
    };
  }, []);

  return (
    <div
      ref={ref}
      id="container-2649afb6dc13fb7f8122254837b5eeb5"
      style={{
        width: 320,
        height: 50,
        margin: '2rem auto',
        display: 'flex',
        justifyContent: 'center',
      }}
    />
  );
}