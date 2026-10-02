import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Loader2 } from "lucide-react";
import { PlayerProfile } from "./PlayerProfile";
import { LiveStats } from "./LiveStats";
import { PlayerEvaluation } from "./PlayerEvaluation";
import { PlayerReflection } from "./ReflectionAndFooter";
import { PlayerAttendanceGrade } from "./PlayerAttendanceGrade";
import { FootballFormation } from "./Footballformation";
import { NoteToCoach } from "./NoteToCoach";
import { PlayerStats } from "./PlayerStats";

const DARK_PDF_SECTIONS = new Set([
  "pdf-section-note",
  "pdf-section-reflection",
  "pdf-section-evaluation",
  "pdf-section-formation",
  "pdf-section-grade",
  "pdf-section-touches",
  "pdf-section-stats",
]);

function prepareInputsForCapture(container, isDarkSection = false) {
  const replacements = [];

  container.querySelectorAll("input, textarea, select").forEach((el) => {
    if (
      ["checkbox", "radio", "range", "hidden", "file", "color"].includes(
        el.type,
      )
    )
      return;

    const computed = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();

    let displayValue = "";

    if (el.tagName === "SELECT") {
      const selected = el.options[el.selectedIndex];
      displayValue = (selected?.text !== undefined && selected?.text !== "") ? selected.text : (el.value ?? "");
    } else {
      displayValue = (el.value !== null && el.value !== undefined && el.value !== "") ? String(el.value) : "";
    }

    const div = document.createElement("div");

    // ✅ Copy important layout + typography styles
    const stylesToCopy = [
      "width",
      "minWidth",
      "maxWidth",
      "margin",
      "marginTop",
      "marginRight",
      "marginBottom",
      "marginLeft",
      "fontSize",
      "fontWeight",
      "fontFamily",
      "fontStyle",
      "textTransform",
      "letterSpacing",
      "lineHeight",
      "textAlign",
      "color",
      "backgroundColor",
      "border",
      "borderTop",
      "borderRight",
      "borderBottom",
      "borderLeft",
      "borderRadius",
      "boxSizing",
      "position",
    ];

    stylesToCopy.forEach((prop) => {
      try {
        div.style[prop] = computed[prop];
      } catch (e) {}
    });

    // ✅ Set strict exact dimensions from original
    div.style.width = `${rect.width}px`;
    div.style.height = `${rect.height}px`;
    div.style.minHeight = `${rect.height}px`;
    div.style.maxHeight = `${rect.height}px`;
    div.style.boxSizing = "border-box";

    let isCentered = false;
    if (el.tagName === "INPUT" || el.tagName === "SELECT") {
      div.style.display = "flex";
      div.style.alignItems = "center";

      // ✅ Universal Vertical alignment fix:
      // Remove top/bottom padding and set line-height = 1 with !important so class styles never push text down
      div.style.setProperty("padding-top", "0px", "important");
      div.style.setProperty("padding-bottom", "0px", "important");
      div.style.setProperty("line-height", "1", "important");

      div.style.whiteSpace = "nowrap";
      div.style.overflow = "hidden";
      div.style.boxSizing = "border-box";

      // ✅ Horizontal alignment: respect intentional centering vs left-alignment (DO NOT CHANGE HORIZONTAL POSITION)
      const explicitAlign = el.getAttribute("data-align");
      isCentered =
        explicitAlign === "center" ||
        (!explicitAlign && (
          computed.textAlign === "center" ||
          el.className.includes("text-center") ||
          (el.id && (el.id === "playerName" || el.id === "playerAge"))
        ));

      if (isCentered) {
        div.style.justifyContent = "center";
        div.style.textAlign = "center";
        div.style.paddingLeft = "8px";
        div.style.paddingRight = "8px";
      } else if (computed.textAlign === "right") {
        div.style.justifyContent = "flex-end";
        div.style.textAlign = "right";
        div.style.paddingLeft = computed.paddingLeft || "12px";
        div.style.paddingRight = computed.paddingRight || "12px";
      } else {
        div.style.justifyContent = "flex-start";
        div.style.textAlign = "left";
        div.style.paddingLeft = computed.paddingLeft || "12px";
        div.style.paddingRight = computed.paddingRight || "12px";
      }

      if (isDarkSection) {
        div.style.color = "#FFFFFF";
        div.style.fontFamily = computed.fontFamily || "inherit";
        div.style.backgroundColor = computed.backgroundColor && computed.backgroundColor !== "transparent" && computed.backgroundColor !== "rgba(0, 0, 0, 0)"
          ? computed.backgroundColor
          : "#12151D";
        div.style.border = computed.border && computed.border !== "none" && !computed.border.startsWith("0px")
          ? computed.border
          : "1px solid rgba(255, 255, 255, 0.18)";
        div.style.borderRadius = computed.borderRadius || "8px";
        div.style.fontSize = computed.fontSize || "12px";
        div.style.fontWeight = computed.fontWeight || "700";
      } else {
        div.style.fontFamily = computed.fontFamily;
        div.style.fontSize = computed.fontSize;
        div.style.fontWeight = computed.fontWeight;

        // Fix very light text on light PDF
        const colorRGB = computed.color;
        if (colorRGB) {
          const match = colorRGB.match(/\d+/g);
          if (match) {
            const [r, g, b] = match.map(Number);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            if (brightness > 200) div.style.color = "#111111";
          }
        }

        // Fix very dark background on light PDF
        const bgRGB = computed.backgroundColor;
        if (bgRGB && bgRGB !== "rgba(0, 0, 0, 0)" && bgRGB !== "transparent") {
          const match = bgRGB.match(/\d+/g);
          if (match) {
            const [r, g, b] = match.map(Number);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            if (brightness < 50) div.style.backgroundColor = "#f5f5f5";
          }
        }
      }
    } else {
      // TEXTAREA: long responses remain left-aligned with proper padding
      div.style.display = "block";
      div.style.whiteSpace = "pre-wrap";
      div.style.wordBreak = "break-word";
      div.style.overflow = "hidden";
      div.style.textAlign = "left";

      if (isDarkSection) {
        div.style.color = "#FFFFFF";
        div.style.backgroundColor = "#12151D";
        div.style.border = "1px solid rgba(255, 255, 255, 0.18)";
        div.style.borderRadius = "12px";
        div.style.padding = "10px 14px";
        div.style.lineHeight = "1.5";
        div.style.fontSize = computed.fontSize || "12px";
        div.style.fontWeight = "500";
        div.style.height = "auto";
        div.style.minHeight = `${rect.height}px`;
      } else {
        div.style.paddingTop = computed.paddingTop;
        div.style.paddingBottom = computed.paddingBottom;
        div.style.paddingLeft = computed.paddingLeft;
        div.style.paddingRight = computed.paddingRight;
        div.style.lineHeight = computed.lineHeight;
        div.style.fontSize = computed.fontSize;
        div.style.fontWeight = computed.fontWeight;
      }
    }

    // Set text with dedicated vertically centered span for all inputs
    if (el.tagName === "INPUT" || el.tagName === "SELECT") {
      const span = document.createElement("span");
      span.textContent = displayValue;
      span.style.display = "inline-flex";
      span.style.alignItems = "center";
      span.style.justifyContent = isCentered ? "center" : (computed.textAlign === "right" ? "flex-end" : "flex-start");
      span.style.lineHeight = "1";
      span.style.width = "100%";
      span.style.height = "100%";
      span.style.textAlign = isCentered ? "center" : (computed.textAlign === "right" ? "right" : "left");
      // Systematic font metric balance: counteracts html2canvas +2px baseline addition and descent bias
      span.style.transform = "translateY(-0.08em)";
      div.appendChild(span);
    } else {
      div.textContent = displayValue;
    }

    // Keep original class (important for styling)
    div.className = el.className;
    // Re-enforce zero vertical padding after className in case Tailwind classes (e.g. py-2) are applied
    if (el.tagName === "INPUT" || el.tagName === "SELECT") {
      div.style.setProperty("padding-top", "0px", "important");
      div.style.setProperty("padding-bottom", "0px", "important");
      div.style.setProperty("line-height", "1", "important");
    }
    div.setAttribute("data-pdf-replacement", "true");

    // Replace element
    el.parentNode.insertBefore(div, el);
    el.style.display = "none";

    replacements.push({ original: el, replacement: div });
  });

  // Cleanup function
  return () => {
    replacements.forEach(({ original, replacement }) => {
      original.style.display = "";
      if (replacement.parentNode) {
        replacement.parentNode.removeChild(replacement);
      }
    });
  };
}

function trimCanvasBottom(canvas, isDark = false) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  let lastContentRow = canvas.height - 1;

  for (let row = canvas.height - 1; row >= 0; row--) {
    const pixels = ctx.getImageData(0, row, width, 1).data;
    let isBlank = true;
    for (let i = 0; i < pixels.length; i += 4) {
      const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
      if (isDark) {
        if (avg > 25) {
          isBlank = false;
          break;
        }
      } else {
        if (avg < 245) {
          isBlank = false;
          break;
        }
      }
    }
    if (!isBlank) {
      lastContentRow = row;
      break;
    }
  }

  const trimmedHeight = Math.min(lastContentRow + 24, canvas.height);
  if (trimmedHeight >= canvas.height) return canvas;

  const trimmed = document.createElement("canvas");
  trimmed.width = width;
  trimmed.height = trimmedHeight;
  const tCtx = trimmed.getContext("2d");
  if (isDark) {
    tCtx.fillStyle = "#07090E";
    tCtx.fillRect(0, 0, width, trimmedHeight);
  }
  tCtx.drawImage(canvas, 0, 0, width, trimmedHeight, 0, 0, width, trimmedHeight);
  return trimmed;
}

export function PdfReportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Preparing report…");
  const [shareFile, setShareFile] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const action = searchParams.get("action");
  const sectionParam = searchParams.get("section"); // e.g. "lineup", "stats"

  // Map route keys to section IDs
  const ROUTE_TO_SECTION = {
    register: "pdf-section-profile",
    stats: "pdf-section-stats",
    "touch-counter": "pdf-section-touches",
    reflection: "pdf-section-reflection",
    evaluation: "pdf-section-evaluation",
    roster: "pdf-section-grade",
    lineup: "pdf-section-formation",
    "note-to-coach": "pdf-section-note",
  };

  const ALL_SECTIONS = [
    { id: "pdf-section-profile", label: "Register" },
    { id: "pdf-section-stats", label: "Player Stats" },
    { id: "pdf-section-touches", label: "Total Touches" },
    { id: "pdf-section-evaluation", label: "Player Evaluation" },
    { id: "pdf-section-reflection", label: "Player Reflection" },
    { id: "pdf-section-grade", label: "Player Grade" },
    { id: "pdf-section-formation", label: "Starting Lineup" },
    { id: "pdf-section-note", label: "Note to Coach" },
  ];

  // If sectionParam is set, only include that single section
  const SECTIONS =
    sectionParam && ROUTE_TO_SECTION[sectionParam]
      ? ALL_SECTIONS.filter((s) => s.id === ROUTE_TO_SECTION[sectionParam])
      : ALL_SECTIONS;

  // Determine which section components to render
  const renderAll = !sectionParam;
  const targetSectionId = sectionParam ? ROUTE_TO_SECTION[sectionParam] : null;

  useEffect(() => {
    const timer = setTimeout(() => generatePDF(), 2500);
    return () => clearTimeout(timer);
  }, []);

  const generatePDF = async () => {
    const root = document.documentElement;

    const hasOnlyDarkSections = SECTIONS.every((s) => DARK_PDF_SECTIONS.has(s.id));
    if (!hasOnlyDarkSections) {
      const styleOverride = document.createElement("style");
      styleOverride.id = "pdf-theme-override";
      styleOverride.textContent = `:root { --bg-primary:#fff !important; }`;
      document.head.appendChild(styleOverride);
    }

    await new Promise((r) => setTimeout(r, 1000));

    try {
      let pdf = null;
      let isFirstPage = true;

      const pageWidth = 210; // A4 width in mm
      const margin = 5;

      for (let i = 0; i < SECTIONS.length; i++) {
        const { id, label } = SECTIONS[i];
        const sectionEl = document.getElementById(id);

        setStatus(`Capturing ${label}…`);
        setProgress(Math.round(((i + 0.5) / SECTIONS.length) * 90));

        if (!sectionEl) continue;

        const isDarkSection = DARK_PDF_SECTIONS.has(id);
        const cleanup = prepareInputsForCapture(sectionEl, isDarkSection);

        // Inject the FOOTBALLER ATHLETICS logo to the bottom of the section
        const footer = document.createElement("div");
        footer.className = "text-center pt-8 pb-3";
        if (isDarkSection) {
          footer.innerHTML = `<span class="text-[11px] tracking-[0.2em] text-white/50 uppercase">
            <strong class="font-black text-white/80">FOOTBALLER</strong> <span class="font-normal text-white/60">ATHLETICS</span>
          </span>`;
        } else {
          footer.innerHTML = `<span class="text-[12px] tracking-[0.15em] text-black uppercase">
            <strong class="font-black">FOOTBALLER</strong> <span class="font-normal">ATHLETICS</span>
          </span>`;
        }
        sectionEl.appendChild(footer);
        sectionEl.style.transform = "scale(1)";
        sectionEl.offsetHeight; // force reflow

        const canvas = await html2canvas(sectionEl, {
          scale: 2, // Higher scale for better text clarity
          useCORS: true,
          backgroundColor: isDarkSection ? "#07090E" : "#ffffff",
          removeContainer: true, // Helps with layout shifting
          onclone: (clonedDoc) => {
            // Exclude action buttons completely from generated PDF
            clonedDoc.querySelectorAll('[data-action-bar]').forEach((el) => el.remove());

            if (isDarkSection) {
              const elements = clonedDoc.getElementsByTagName("*");
              for (let el of elements) {
                if (el.getAttribute("data-pdf-replacement") === "true") {
                  el.style.color = "#ffffff";
                }
              }
            } else {
              const elements = clonedDoc.getElementsByTagName("*");
              for (let el of elements) {
                if (el.getAttribute("data-pdf-replacement") === "true") {
                  el.style.color = "black";
                }
              }
              
              // Fix invisible unselected footers without touching React code:
              // Swap the white outlines for the dark touches-light.png file.
              const images = clonedDoc.getElementsByTagName("img");
              for (let img of images) {
                const srcStr = img.src || "";
                if (srcStr.includes("touches-intro.png") || srcStr.includes("touches-intro2.png")) {
                  // Ensure visibility on white pdf background
                  img.src = srcStr.replace(/touches-intro2?\.png/, "touches-light.png");
                  img.style.opacity = "0.4";
                  
                  // Flip right foot
                  if (srcStr.includes("touches-intro2.png")) {
                    img.style.transform = "scaleX(-1)";
                  }
                }
              }
            }

            // Starting Lineup tactical group title pills vertical centering fix
            clonedDoc.querySelectorAll('[data-tactical-title="true"]').forEach((pill) => {
              pill.style.display = "inline-flex";
              pill.style.alignItems = "center";
              pill.style.justifyContent = "center";
              pill.style.paddingTop = "0px";
              pill.style.paddingBottom = "0px";
              pill.style.lineHeight = "1";
              pill.style.overflow = "visible";
              const inner = pill.querySelector("span");
              if (inner) {
                inner.style.display = "inline-block";
                inner.style.transform = "translateY(-5.5px)";
                inner.style.lineHeight = "1";
              }
            });

            // Starting Lineup position card headers & badges alignment fix
            clonedDoc.querySelectorAll('[data-position-header="true"]').forEach((hdr) => {
              hdr.style.display = "flex";
              hdr.style.alignItems = "center";
              hdr.style.justifyContent = "center";
              hdr.style.textAlign = "center";
              hdr.style.overflow = "visible";
            });

            clonedDoc.querySelectorAll('[data-position-header="true"] svg').forEach((svg) => {
              svg.style.display = "inline-block";
              svg.style.verticalAlign = "middle";
              svg.style.flexShrink = "0";
              svg.style.transform = "translateY(1px)";
            });

            clonedDoc.querySelectorAll('[data-position-label="true"]').forEach((lblSpan) => {
              lblSpan.style.display = "inline-flex";
              lblSpan.style.alignItems = "center";
              lblSpan.style.verticalAlign = "middle";
              lblSpan.style.overflow = "visible";
              lblSpan.style.lineHeight = "1";
              lblSpan.style.whiteSpace = "nowrap";
              lblSpan.style.color = "#ffffff";
              lblSpan.style.transform = "translateY(-4.5px)";
            });

            // Team Roster index badges & grade buttons
            clonedDoc.querySelectorAll('[data-roster-badge="true"]').forEach((b) => {
              b.style.display = "flex";
              b.style.alignItems = "center";
              b.style.justifyContent = "center";
              b.style.lineHeight = "1";
              const s = b.querySelector("span");
              if (s) {
                s.style.display = "inline-block";
                s.style.transform = "translateY(-2.5px)";
                s.style.lineHeight = "1";
              }
            });

            clonedDoc.querySelectorAll('[data-grade-btn="true"]').forEach((btn) => {
              btn.style.display = "flex";
              btn.style.alignItems = "center";
              btn.style.justifyContent = "center";
              btn.style.lineHeight = "1";
              const s = btn.querySelector("span");
              if (s) {
                s.style.display = "inline-block";
                s.style.transform = "translateY(-2.5px)";
                s.style.lineHeight = "1";
              }
            });

            // Player Evaluation rating buttons
            clonedDoc.querySelectorAll('[data-eval-btn="true"]').forEach((btn) => {
              btn.style.display = "flex";
              btn.style.alignItems = "center";
              btn.style.justifyContent = "center";
              btn.style.lineHeight = "1";
              const s = btn.querySelector("span");
              if (s) {
                s.style.display = "inline-block";
                s.style.transform = "translateY(-2.5px)";
                s.style.lineHeight = "1";
              }
            });

            // Tag chips (Reflection & Note to Coach)
            clonedDoc.querySelectorAll('[data-tag-chip="true"]').forEach((chip) => {
              chip.style.display = "inline-flex";
              chip.style.alignItems = "center";
              chip.style.justifyContent = "center";
              chip.style.lineHeight = "1";
              const s = chip.querySelector("span");
              if (s) {
                s.style.display = "inline-block";
                s.style.transform = "translateY(-2px)";
                s.style.lineHeight = "1";
              }
            });

            // Player Evaluation legend dots & text alignment fix
            clonedDoc.querySelectorAll('[data-legend-bar="true"]').forEach((bar) => {
              bar.style.paddingTop = "6px";
              bar.style.paddingBottom = "6px";
              bar.style.lineHeight = "1";
            });

            clonedDoc.querySelectorAll('[data-legend-dot="true"]').forEach((dot) => {
              dot.style.display = "inline-block";
              dot.style.verticalAlign = "middle";
              dot.style.transform = "none";
              dot.style.flexShrink = "0";
            });

            clonedDoc.querySelectorAll('[data-legend-text="true"]').forEach((txt) => {
              txt.style.display = "inline-block";
              txt.style.verticalAlign = "middle";
              txt.style.transform = "none";
              txt.style.lineHeight = "1";
            });
          },
        });

        sectionEl.removeChild(footer);
        cleanup();

        // ✅ Trim extra white space
        const trimmed = trimCanvasBottom(canvas, isDarkSection);

        const imgWidth = pageWidth;
        const imgHeight = (trimmed.height * imgWidth) / trimmed.width;

        const sectionMargin = isDarkSection ? 0 : margin;
        const pageHeight = isDarkSection ? imgHeight : imgHeight + margin * 2;

        // ✅ First page create
        if (isFirstPage) {
          pdf = new jsPDF({
            orientation: "p",
            unit: "mm",
            format: [pageWidth, pageHeight], // 🔥 dynamic height
          });

          isFirstPage = false;
        } else {
          pdf.addPage([pageWidth, pageHeight]); // 🔥 dynamic page
        }

        if (isDarkSection) {
          pdf.setFillColor(7, 9, 14); // #07090E
          pdf.rect(0, 0, pageWidth, pageHeight, "F");
        }

        pdf.addImage(
          trimmed.toDataURL("image/jpeg", 0.95),
          "JPEG",
          0,
          sectionMargin,
          imgWidth,
          imgHeight,
        );

        setProgress(Math.round(((i + 1) / SECTIONS.length) * 90));
      }

      setStatus("Finalizing PDF…");
      setProgress(100);

      const blob = pdf.output("blob");

      if (action === "share" && navigator.share) {
        setStatus("Report Ready!");
        const fileName = `player-report-${
          new Date().toISOString().split("T")[0]
        }.pdf`;

        const pdfFile = new File([blob], fileName, {
          type: "application/pdf",
        });

        setShareFile(pdfFile);
        return;
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `player-report-${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      await new Promise((r) => setTimeout(r, 800));
      navigate(-1);
    } catch (err) {
      console.error("PDF generation error:", err);
      setStatus("Error — going back…");
      await new Promise((r) => setTimeout(r, 2000));
      navigate(-1);
    } finally {
      document.getElementById("pdf-theme-override")?.remove();
    }
  };

  const lightThemeVars = {
    backgroundColor: "#ffffff",
    color: "#000000",
    "--bg-primary": "#ffffff",
    "--bg-secondary": "#f5f5f5",
    "--bg-card": "#ffffff",
    "--bg-input": "#f0f0f0",
    "--text-primary": "#000000",
    "--text-secondary": "#333333",
    "--text-input": "#000000",
    "--border-color": "#000000",
    "--color-accent": "#000000",
    "--color-accent-new": "#000000",
    "--color-accent-hover": "#333333",
    "--category-header-bg": "#000000",
    "--category-header-text": "#ffffff",
    "--ball-fill": "#000000",
    "--ball-stroke": "#000000",
    "--ball-stroke-width": "3",
    "--field-bg": "#ffffff",
    "--field-line": "#000000",
    "--slider-filled": "#000000",
    "--slider-unfilled": "#cccccc",
    "--slider-thumb": "#000000",
    "--checkbox-checked-bg": "#000000",
    "--checkbox-check-color": "#ffffff",
  };

  const darkThemeVars = {
    backgroundColor: "#07090E",
    color: "#ffffff",
    "--bg-primary": "#07090E",
    "--bg-secondary": "#0E1118",
    "--bg-card": "#12151D",
    "--bg-input": "#181C26",
    "--text-primary": "#ffffff",
    "--text-secondary": "rgba(255, 255, 255, 0.7)",
    "--text-input": "#ffffff",
    "--border-color": "rgba(255, 255, 255, 0.15)",
    "--color-accent": "#FF4422",
    "--color-accent-new": "#FF4422",
    "--color-accent-hover": "#E03311",
  };

  return (
    <>
      {/* ── Loading overlay ── */}
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm">
        <div className="bg-[#111] rounded-lg p-8 max-w-sm w-full mx-4 shadow-2xl border border-white/10">
          <div className="flex flex-col items-center gap-4">
            <Loader2
              className={`w-12 h-12 text-[var(--color-accent)] ${!shareFile ? "animate-spin" : ""}`}
            />
            <div className="text-center">
              <h3 className="text-lg font-black uppercase text-white mb-2">
                {shareFile ? "Ready to Share" : "Generating PDF Report"}
              </h3>
              <p className="text-sm text-gray-400">{status}</p>
            </div>

            {shareFile ? (
              <div className="w-full flex flex-col gap-2 mt-2">
                <button
                  onClick={async () => {
                    try {
                      await navigator.share({
                        title: "Check out my football performance report!",
                        text: "I just completed my football training session. Check out my performance metrics and reflections!",
                        files: [shareFile],
                      });
                    } catch (e) {
                      if (e.name !== "AbortError") console.error(e);
                    }
                    navigate(-1);
                  }}
                  className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-black uppercase py-3 rounded tracking-wider transition-colors"
                >
                  Share PDF Now
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="w-full bg-transparent hover:bg-white/10 text-white font-bold uppercase py-2 rounded tracking-wider transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[var(--color-accent)] h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{progress}% complete</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Render container ── */}
      <div
        ref={containerRef}
        className="max-w-md mx-auto"
      >
        {/* REGISTER */}
        {(renderAll || targetSectionId === "pdf-section-profile") && (
          <div
            id="pdf-section-profile"
            style={{ ...lightThemeVars, background: "#fff", marginBottom: "8px", padding: "16px" }}
          >
            <PlayerProfile />
          </div>
        )}

        {/* PLAYER STATS */}
        {(renderAll || targetSectionId === "pdf-section-stats") && (
          <div
            id="pdf-section-stats"
            style={{ ...darkThemeVars, background: "#07090E", color: "#ffffff", marginBottom: "8px", padding: "20px" }}
          >
            <PlayerStats isPdf={true} />
          </div>
        )}

        {/* TOTAL TOUCHES (Touch Counter) */}
        {(renderAll || targetSectionId === "pdf-section-touches") && (
          <div
            id="pdf-section-touches"
            style={{ ...darkThemeVars, background: "#07090E", color: "#ffffff", marginBottom: "8px", padding: "20px" }}
          >
            <LiveStats isPdf={true} />
          </div>
        )}

        {/* PLAYER EVALUATION */}
        {(renderAll || targetSectionId === "pdf-section-evaluation") && (
          <div
            id="pdf-section-evaluation"
            style={{ ...darkThemeVars, background: "#07090E", color: "#ffffff", marginBottom: "8px", padding: "20px" }}
          >
            <PlayerEvaluation isPdf={true} />
          </div>
        )}

        {/* PLAYER REFLECTION */}
        {(renderAll || targetSectionId === "pdf-section-reflection") && (
          <div
            id="pdf-section-reflection"
            style={{ ...darkThemeVars, background: "#07090E", color: "#ffffff", marginBottom: "8px", padding: "20px" }}
          >
            <PlayerReflection isPdf={true} />
          </div>
        )}

        {/* PLAYER GRADE / TEAM ROSTER */}
        {(renderAll || targetSectionId === "pdf-section-grade") && (
          <div
            id="pdf-section-grade"
            style={{ ...darkThemeVars, background: "#07090E", color: "#ffffff", marginBottom: "8px", padding: "20px" }}
          >
            <PlayerAttendanceGrade isPdf={true} />
          </div>
        )}

        {/* STARTING LINEUP */}
        {(renderAll || targetSectionId === "pdf-section-formation") && (
          <div
            id="pdf-section-formation"
            style={{ ...darkThemeVars, background: "#07090E", color: "#ffffff", marginBottom: "8px", padding: "20px" }}
          >
            <FootballFormation isPdf={true} />
          </div>
        )}

        {/* NOTE TO COACH */}
        {(renderAll || targetSectionId === "pdf-section-note") && (
          <div
            id="pdf-section-note"
            style={{ ...darkThemeVars, background: "#07090E", color: "#ffffff", marginBottom: "8px", padding: "20px" }}
          >
            <NoteToCoach isPdf={true} />
          </div>
        )}
      </div>
    </>
  );
}
