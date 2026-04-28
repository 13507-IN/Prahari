import dynamic from 'next/dynamic';

const DynamicReportsMap = dynamic(() => import('./ReportsMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-swiss-muted flex items-center justify-center animate-pulse text-swiss-fg/40 text-[10px] font-black tracking-widest uppercase border-4 border-swiss-fg">
      LOADING MAP DATA...
    </div>
  )
});

export default DynamicReportsMap;
