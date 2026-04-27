import dynamic from 'next/dynamic';

const DynamicMapPicker = dynamic(() => import('./MapPicker'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-swiss-muted flex items-center justify-center animate-pulse text-swiss-fg/40 text-[10px] font-black tracking-widest uppercase">LOADING MAP...</div>
});

export default DynamicMapPicker;
