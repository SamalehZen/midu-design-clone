import React, { useEffect, useState } from "react";

// Measured on the original: the label reads "London, UK" and shows hh:mm AM/PM.
const ZONE = "Europe/London";
const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, hour: "2-digit", minute: "2-digit", hour12: true });
const to12 = (d) => {
  const p = fmt.formatToParts(d);
  const h = p.find((x) => x.type === "hour").value;
  const m = p.find((x) => x.type === "minute").value;
  const ap = (p.find((x) => x.type === "dayPeriod") || { value: "AM" }).value.toUpperCase();
  return h + ":" + m + " " + ap;
};

export function Clock() {
  const [text, setText] = useState(() => to12(new Date()));
  useEffect(() => {
    const id = setInterval(() => setText(to12(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  return text;
}
