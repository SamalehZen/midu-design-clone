import React, { useEffect, useState } from "react";

// Reproduces the Framer runtime cookie banner (measured on the live site at
// 1200x900: outer fixed panel 530x243 at (670,657), inner card 490x203
// background rgb(21,21,21), radius 14px).
const INTER =
  'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
const SWITZER = '"Switzer Medium", "Switzer Medium Placeholder", sans-serif';
const CONSENT_KEY = "framerCookiesConsentMode";
const ACCEPTED_KEY = "framerCookiesBannerDismissed";

const buttonStyle = {
  width: "216px",
  height: "48px",
  padding: "16px 15px",
  borderRadius: "16px",
  border: "0px none",
  fontFamily: SWITZER,
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "16px",
  letterSpacing: "-0.48px",
  textAlign: "center",
  cursor: "pointer",
  display: "block",
};

export default function CookieBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    let stored = null;
    try {
      stored = window.localStorage.getItem(ACCEPTED_KEY);
    } catch (e) {
      stored = null;
    }
    if (!stored) setDismissed(false);
  }, []);

  if (dismissed) return null;

  const close = (mode) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify(mode));
      window.localStorage.setItem(ACCEPTED_KEY, "1");
    } catch (e) {
      /* storage unavailable */
    }
    setDismissed(true);
  };

  return (
    <div style={{ display: "contents" }}>
      <div
        style={{
          position: "fixed",
          zIndex: 10,
          left: 670,
          top: 657,
          width: "530px",
          height: "243px",
          display: "flex",
          padding: "20px",
          boxSizing: "border-box",
          alignItems: "flex-end",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ display: "flex", position: "relative", zIndex: 100 }}>
          <div
            className="--framer-cookie-banner-container --framer-cookie-banner-type-advanced"
            style={{
              width: "490px",
              maxWidth: "490px",
              backgroundColor: "rgb(21, 21, 21)",
              borderRadius: "14px",
              fontFamily: INTER,
              fontSize: "12px",
              color: "rgb(0, 0, 0)",
              boxShadow: "rgba(255, 255, 255, 0) 0px 0px 0px 1px inset",
              boxSizing: "border-box",
            }}
          >
            <div style={{ padding: "24px", boxSizing: "border-box" }}>
              <div style={{ width: "442px" }}>
                <p
                  style={{
                    margin: "0px 0px 10px",
                    padding: "0px",
                    fontFamily: SWITZER,
                    fontSize: "18px",
                    fontWeight: 500,
                    fontStyle: "normal",
                    letterSpacing: "-0.03em",
                    lineHeight: "1em",
                    color: "rgb(255, 255, 255)",
                  }}
                >
                  Designed to remember you
                </p>
                <p
                  style={{
                    margin: "0px",
                    padding: "0px",
                    fontFamily: INTER,
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: "1.5",
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  Cookies help us tailor your experience and keep improving what we do. Accept and
                  we&apos;ll make every visit feel crafted just for you.{" "}
                  <span>
                    Read our{" "}
                    <a
                      href="https://www.framer.com/legal/policy/"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "rgb(255, 255, 255)", textDecoration: "none" }}
                    >
                      Cookie Policy
                    </a>
                    .
                  </span>
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <input
                  type="button"
                  id="__framer-cookie-component-button-customize"
                  className="__framer-cookie-component-button"
                  value="Customize"
                  onClick={() =>
                    close({ analytics: false, marketing: false, necessary: true, preferences: false })
                  }
                  style={{
                    ...buttonStyle,
                    backgroundColor: "rgb(28, 28, 28)",
                    color: "rgba(255, 255, 255, 0.6)",
                  }}
                />
                <input
                  type="button"
                  id="__framer-cookie-component-button-accept"
                  className="__framer-cookie-component-button"
                  value="Accept All"
                  onClick={() =>
                    close({ analytics: true, marketing: true, necessary: true, preferences: true })
                  }
                  style={{ ...buttonStyle, backgroundColor: "rgb(255, 255, 255)", color: "rgb(0, 0, 0)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
