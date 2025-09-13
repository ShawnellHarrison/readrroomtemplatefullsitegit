import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window { 
    adsbygoogle: any[] 
  }
}

type AdBannerProps = {
  slot: string;                   // Your Ad Unit slot id, e.g. "1234567890"
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  fullWidthResponsive?: boolean;
  className?: string;
  dataAdTest?: "on" | "off";      // Use "on" in dev
  height?: number;                // Reserve height to avoid CLS
  style?: React.CSSProperties;
};

const AdBanner: React.FC<AdBannerProps> = ({
  slot,
  format = "auto",
  fullWidthResponsive = true,
  className = "",
  dataAdTest = "off",
  height = 280,
  style = {}
}) => {
  const insRef = useRef<HTMLDivElement & { dataset: any }>(null);
  const [pushed, setPushed] = useState(false);

  useEffect(() => {
    const el = insRef.current as unknown as HTMLDivElement | null;
    if (!el) return;

    // Don't initialize the same node twice
    const alreadyInitialized = el.getAttribute("data-adsbygoogle-status") === "done" || pushed;
    if (alreadyInitialized) return;

    const tryPush = () => {
      if (!el) return;
      const width = el.clientWidth;
      const isVisible = !!(el.offsetParent !== null);
      const status = el.getAttribute("data-adsbygoogle-status");
      if (status === "done" || pushed) return;

      if (width > 0 && isVisible && (window as any).adsbygoogle) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setPushed(true);
        } catch (error) {
          // Ignore dev-time tag noise; don't re-push
          console.warn('AdSense initialization skipped:', error);
        }
      }
    };

    const ro = new ResizeObserver(() => tryPush());
    ro.observe(el);

    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) tryPush();
    }, { rootMargin: "200px" });
    io.observe(el);

    const t = setTimeout(tryPush, 100);
    return () => { 
      clearTimeout(t); 
      ro.disconnect(); 
      io.disconnect(); 
    };
  }, [pushed]);

  return (
    <ins
      ref={insRef as any}
      className={`adsbygoogle block w-full ${className}`}
      style={{ 
        display: "block", 
        width: "100%", 
        minHeight: height,
        ...style 
      }}
      data-ad-client="ca-pub-7547620682925490"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      data-adtest={dataAdTest}
    />
  );
};

export default AdBanner;