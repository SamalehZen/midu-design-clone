import React, { useEffect, useRef } from "react";
import {
  NavDesktopVariant, NavStickyMount, NavSearchMount, NavMenuMount, SmoothScrollMount,
  HeroSectionSroll, AboutSection, WorksSection, WorksSectionVariantB, ServicesSection,
  ServicesListOverlap, PricingSection, FooterBlock, MainExtra0, MainExtra1, SvgTemplates,
  PAGE, CONTENT, EXTRAS,
} from "./generated/sections.jsx";
import { startBehaviors } from "./dynamic/behaviors.js";
import CookieBanner from "./dynamic/CookieBanner.jsx";

const MAIN_EXTRA_COMPONENTS = [MainExtra0, MainExtra1];

export function MainTree() {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    return startBehaviors(ref.current);
  }, []);
  return (
    <div id="main" ref={ref}>
      <div {...PAGE}>
        <div {...CONTENT}>
          <NavDesktopVariant />
          <NavStickyMount />
          <NavSearchMount />
          <NavMenuMount />
          <SmoothScrollMount />
          <HeroSectionSroll />
          <AboutSection />
          <WorksSection />
          <WorksSectionVariantB />
          <ServicesSection />
          <ServicesListOverlap />
          <PricingSection />
        </div>
        <div id="overlay" />
        <div className="framer-1vafowz" />
        <FooterBlock />
      </div>
      {EXTRAS.map((e, i) => {
        const C = MAIN_EXTRA_COMPONENTS[i];
        return C ? <C key={i} /> : <div key={i} {...e.attrs} />;
      })}
    </div>
  );
}

export default function App() {
  return (
    <>
      <MainTree />
      <SvgTemplates />
      <CookieBanner />
    </>
  );
}
