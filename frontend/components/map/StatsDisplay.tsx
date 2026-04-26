"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { stats, formatNumber, topCountries } from "../../lib/map-data/country-data";

function useAnimatedNumber(baseValue: number, incrementRatePerSecond: number) {
  const [value, setValue] = useState(baseValue);
  const [displayRate, setDisplayRate] = useState(incrementRatePerSecond);

  useEffect(() => {
    const updatesPerSecond = 20;
    const baseIncrement = incrementRatePerSecond / updatesPerSecond;
    
    const interval = setInterval(() => {
      const variation = 0.7 + Math.random() * 0.6;
      const increment = Math.max(1, Math.floor(baseIncrement * variation));
      setValue((v) => v + increment);
      
      const rateVariation = 0.85 + Math.random() * 0.3;
      setDisplayRate(Math.floor(incrementRatePerSecond * rateVariation));
    }, 1000 / updatesPerSecond);

    return () => clearInterval(interval);
  }, [incrementRatePerSecond]);

  return { value, rate: displayRate };
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.75" fill="currentColor" />
    </svg>
  );
}

function PixelGridTransition({
  firstContent,
  secondContent,
  isActive,
  gridSize = 30,
  animationStepDuration = 0.3,
  className,
}: {
  firstContent: React.ReactNode;
  secondContent: React.ReactNode;
  isActive: boolean;
  gridSize?: number;
  animationStepDuration?: number;
  className?: string;
}) {
  const [showPixels, setShowPixels] = useState(false);
  const [animState, setAnimState] = useState<"idle" | "growing" | "shrinking">("idle");
  const hasActivatedRef = useRef(false);

  const pixels = useMemo(() => {
    const total = gridSize * gridSize;
    const result = [];
    for (let n = 0; n < total; n++) {
      const row = Math.floor(n / gridSize);
      const col = n % gridSize;
      const color = Math.random() > 0.85 ? "var(--swiss-red, #FF3000)" : "var(--swiss-fg, #000000)";
      result.push({ id: n, row, col, color });
    }
    return result;
  } , [gridSize]);

  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);

  useEffect(() => {
    if (!hasActivatedRef.current && !isActive) return;
    if (isActive) hasActivatedRef.current = true;

    const indices = pixels.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledOrder(indices);

    setShowPixels(true);
    setAnimState("growing");

    const shrinkTimer = setTimeout(() => setAnimState("shrinking"), animationStepDuration * 1000);
    const hideTimer = setTimeout(() => {
      setShowPixels(false);
      setAnimState("idle");
    }, animationStepDuration * 2000);

    return () => {
      clearTimeout(shrinkTimer);
      clearTimeout(hideTimer);
    };
  }, [isActive, animationStepDuration, pixels]);

  const delayPerPixel = useMemo(() => animationStepDuration / pixels.length, [animationStepDuration, pixels.length]);
  const orderMap = useMemo(() => {
    const map = new Map<number, number>();
    shuffledOrder.forEach((idx, order) => map.set(idx, order));
    return map;
  }, [shuffledOrder]);

  return (
    <div className={`w-full overflow-hidden max-w-full relative ${className || ""}`}>
      <motion.div
        className="h-full"
        aria-hidden={isActive}
        initial={{ opacity: 1 }}
        animate={{ opacity: isActive ? 0 : 1 }}
        transition={{ duration: 0, delay: animationStepDuration }}
      >
        {firstContent}
      </motion.div>

      <motion.div
        className="absolute inset-0 w-full h-full z-[2] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0, delay: animationStepDuration }}
        style={{ pointerEvents: isActive ? "auto" : "none" }}
        aria-hidden={!isActive}
      >
        {secondContent}
      </motion.div>

      <div
        className="absolute inset-0 w-full h-full pointer-events-none z-[3]"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        }}
      >
        <AnimatePresence>
          {showPixels &&
            pixels.map((pixel) => {
              const order = orderMap.get(pixel.id) ?? 0;
              return (
                <motion.div
                  key={pixel.id}
                  style={{
                    backgroundColor: pixel.color,
                    aspectRatio: "1 / 1",
                    gridArea: `${pixel.row + 1} / ${pixel.col + 1}`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: animState === "growing" ? 1 : 0,
                    scale: animState === "growing" ? 1 : 0,
                  }}
                  transition={{ duration: 0.01, delay: order * delayPerPixel }}
                />
              );
            })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({
  title,
  baseValue,
  incrementRate,
  children,
  infoContent,
  href,
  className,
}: {
  title: string;
  baseValue?: number;
  incrementRate?: number;
  children?: React.ReactNode;
  infoContent?: string;
  href?: string;
  className?: string;
}) {
  const [showInfo, setShowInfo] = useState(false);
  const { value } = useAnimatedNumber(baseValue || 0, incrementRate || 0);
  
  const statsContent = (
    <div className="bg-swiss-muted p-4 md:p-6 w-full min-h-[120px] h-full border-4 border-swiss-fg">
      <div className="space-y-2">
        <h2 className="my-0 font-black text-[10px] tracking-widest uppercase text-swiss-fg pr-6">
          {title}
        </h2>
        {baseValue !== undefined && (
          <div className="text-3xl md:text-4xl tracking-tighter font-black tabular-nums">
            {formatNumber(value)}
          </div>
        )}
        {children}
      </div>
    </div>
  );

  const infoContentView = (
    <div className="bg-swiss-bg p-4 md:p-6 w-full h-full overflow-y-auto flex flex-col gap-y-2 border-4 border-swiss-red">
      {href ? (
        <a
          href={href}
          tabIndex={showInfo ? 0 : -1}
          className="my-0 font-black text-[10px] tracking-widest uppercase text-swiss-red hover:underline underline-offset-2 inline-flex gap-x-0.5 items-center w-fit shrink-0"
        >
          {title}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M6.75011 4H6.00011V5.5H6.75011H9.43945L5.46978 9.46967L4.93945 10L6.00011 11.0607L6.53044 10.5303L10.499 6.56182V9.25V10H11.999V9.25V5C11.999 4.44772 11.5512 4 10.999 4H6.75011Z" />
          </svg>
        </a>
      ) : (
        <span className="my-0 font-black text-[10px] tracking-widest uppercase text-swiss-fg shrink-0">
          {title}
        </span>
      )}
      <span className="tracking-tight text-[10px] font-bold text-swiss-fg/60 leading-tight uppercase">
        {infoContent}
      </span>
    </div>
  );
  
  return (
    <div className={`relative group overflow-hidden ${className || ""}`}>
      <PixelGridTransition
        firstContent={statsContent}
        secondContent={infoContentView}
        isActive={showInfo}
        gridSize={30}
        animationStepDuration={0.3}
        className="h-full"
      />
      {infoContent && (
        <div className={`absolute top-4 right-4 transition-opacity duration-150 z-[20] isolate ${showInfo ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"}`}>
          <button
            aria-label={`Learn more about ${title}`}
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="p-1 m-0 bg-transparent text-swiss-fg border-2 border-swiss-fg hover:bg-swiss-red hover:text-swiss-bg hover:border-swiss-red transition-all duration-150 flex items-center justify-center cursor-pointer"
          >
            <InfoIcon />
          </button>
        </div>
      )}
    </div>
  );
}

function MetricRow({ label, baseValue, incrementRate, showRate = false }: { label: string; baseValue: number; incrementRate: number; showRate?: boolean }) {
  const { value, rate } = useAnimatedNumber(baseValue, incrementRate);
  
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-3 border-b border-swiss-fg/10 pb-1">
      <h3 className="m-0 text-[8px] font-black tracking-widest text-swiss-fg/60 uppercase">
        {label}
      </h3>
      <div className="flex items-center gap-2 text-right">
        <div className="text-swiss-fg text-[10px] font-black tabular-nums">
          {formatNumber(value)}
        </div>
        {showRate && (
          <div className="w-12 text-swiss-red text-right text-[8px] font-black tabular-nums">
            <span>{formatNumber(rate)}</span>
            <span aria-label="per second">/S</span>
          </div>
        )}
      </div>
    </li>
  );
}

export function TotalRequests() {
  const { value, rate } = useAnimatedNumber(stats.totalRequests, 450000);
  
  return (
    <div className="space-y-2 p-6 border-4 border-swiss-fg bg-swiss-bg">
      <h2 className="my-0 font-black text-[10px] tracking-widest uppercase text-swiss-fg/60">
        TOTAL EVENTS PROCESSED
      </h2>
      <div className="text-4xl md:text-5xl tracking-tighter font-black tabular-nums">
        {formatNumber(value)}
      </div>
      <div className="text-[10px] text-swiss-red font-black tracking-widest">
        {formatNumber(rate)} EVENTS / SECOND
      </div>
    </div>
  );
}

function CountryRow({ country, incrementRate }: { country: typeof topCountries[0]; incrementRate: number }) {
  const { value, rate } = useAnimatedNumber(country.requests, incrementRate);
  
  return (
    <li className="flex items-center w-full justify-between py-1 border-b border-swiss-fg/5 hover:bg-swiss-muted transition-colors px-2">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="w-2 h-2" style={{ backgroundColor: country.color }} />
        <h3 className="font-black text-[10px] tracking-widest uppercase text-swiss-fg">
          {country.code}
        </h3>
      </div>
      <div className="flex items-center gap-4">
        <span className="tabular-nums font-black text-[10px]">{formatNumber(value)}</span>
        <div className="w-[8ch] text-right text-[8px] font-black text-swiss-red uppercase">
          <span>{formatNumber(rate)}</span>
          <span aria-label="per second">/S</span>
        </div>
      </div>
    </li>
  );
}

export function TopCountries() {
  const incrementRates = [160000, 24000, 19000, 17000, 15000, 15000, 14000];
  
  // Custom mapping for CommunitySync narrative
  const regionalData = [
    { code: "URBAN ZONES", label: "high-density reports", color: "#FF3000" },
    { code: "RURAL AREAS", label: "active monitoring", color: "#000000" },
    { code: "SEMI-URBAN", label: "growing engagement", color: "#000000" },
  ];

  return (
    <div className="space-y-4 p-6 border-4 border-swiss-fg bg-swiss-bg h-full">
      <h2 className="my-0 font-black text-[10px] tracking-widest uppercase text-swiss-fg/60">
        REGIONAL ENGAGEMENT
      </h2>
      <ul className="list-none pl-0 space-y-3">
        {regionalData.map((region, index) => (
          <li key={region.code} className="flex items-center w-full justify-between py-1 border-b border-swiss-fg/5 hover:bg-swiss-muted transition-colors px-2">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="w-2 h-2" style={{ backgroundColor: region.color }} />
              <div>
                <h3 className="font-black text-[10px] tracking-widest uppercase text-swiss-fg">
                  {region.code}
                </h3>
                <p className="text-[8px] font-bold text-swiss-fg/40 uppercase">{region.label}</p>
              </div>
            </div>
            <div className="text-right text-[8px] font-black text-swiss-red uppercase">
              REAL-TIME
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RegionCount() {
  return (
    <div className="flex items-center gap-3 mt-4 px-6">
      <span aria-hidden="true" className="text-swiss-red">▲</span>
      <div className="text-left">
        <span className="font-black text-[10px] tracking-widest text-swiss-fg/60 uppercase">ACTIVE REPORT STREAM</span>
      </div>
    </div>
  );
}

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
      <div className="flex flex-col">
        <StatCard 
          title="ACTIVE CITIZENS" 
          baseValue={stats.totalDeployments} 
          incrementRate={24}
          infoContent="THE TOTAL NUMBER OF REGISTERED CITIZENS CONTRIBUTING TO COMMUNITYSYNC."
          className="flex-1"
        />
        <StatCard 
          title="ISSUE PIPELINE"
          infoContent="REAL-TIME MONITORING OF INCOMING ISSUES AND COMMUNITY-DRIVEN VALIDATION."
          className="flex-1"
        >
          <ul className="space-y-4 list-none pl-0 mt-4">
            <div>
              <MetricRow label="REPORTS" baseValue={stats.aiGatewayRequests} incrementRate={95} />
              <p className="text-[7px] font-bold text-swiss-fg/40 uppercase mt-1">REAL-TIME ISSUE SUBMISSIONS ACROSS MULTIPLE CATEGORIES</p>
            </div>
            <div>
              <MetricRow label="VERIFICATIONS" baseValue={stats.firewallActions.systemBlocks} incrementRate={5400} />
              <p className="text-[7px] font-bold text-swiss-fg/40 uppercase mt-1">COMMUNITY-DRIVEN VALIDATION OF RESOLUTIONS</p>
            </div>
          </ul>
        </StatCard>
      </div>

      <div className="flex flex-col">
        <StatCard 
          title="SAFETY PROTOCOLS" 
          baseValue={stats.firewallActions.total} 
          incrementRate={29000}
          infoContent="AUTONOMOUS MONITORING AND EMERGENCY RESPONSE COORDINATION SYSTEM."
          className="flex-1"
        >
          <ul className="space-y-4 list-none pl-0 mt-4">
            <div>
              <MetricRow
                label="COORDINATION"
                baseValue={stats.firewallActions.systemChallenges}
                incrementRate={12300}
                showRate
              />
              <p className="text-[7px] font-bold text-swiss-fg/40 uppercase mt-1">NGO AND GOVERNMENT ACTION TRACKING</p>
            </div>
            <div>
              <MetricRow
                label="DISPATCHES"
                baseValue={stats.firewallActions.customWafBlocks}
                incrementRate={1270}
                showRate
              />
              <p className="text-[7px] font-bold text-swiss-fg/40 uppercase mt-1">VOLUNTEER TASK ASSIGNMENTS AND EXECUTION</p>
            </div>
          </ul>
        </StatCard>
      </div>

      <div className="flex flex-col">
        <StatCard 
          title="VOLUNTEER FORCE"
          infoContent="REAL-TIME VISIBILITY INTO VOLUNTEER ENGAGEMENT AND COMMUNITY RESPONSE CAPACITY."
          className="flex-1"
        >
          <ul className="space-y-2 list-none pl-0 mt-4">
            <MetricRow label="ACTIVE NOW" baseValue={stats.botManagement.botsBlocked} incrementRate={1600} />
            <MetricRow
              label="RESERVE"
              baseValue={stats.botManagement.humansVerified}
              incrementRate={9300}
            />
          </ul>
        </StatCard>
        <StatCard 
          title="RESOLUTION RATE" 
          baseValue={stats.cacheHits} 
          incrementRate={305000}
          infoContent="PERCENTAGE OF ISSUES RESOLVED WITHIN TARGET RESPONSE TIME FRAME."
          className="flex-1"
        >
          <p className="text-swiss-fg/60 text-[10px] font-black uppercase mt-1 tracking-widest">STATUS: STABLE</p>
        </StatCard>
      </div>
    </div>
  );
}
