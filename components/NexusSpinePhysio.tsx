"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";

export interface PhysioService {
  id: number;
  slug: string;
  title: string;
  regionTag: string;
  region: string;
  focusArea: string;
  tags: string[];
  color: string;
  bgPalette: string[];
  duration: string;
  sessionType: string;
  technique: string;
  description: string;
  conditions: string[];
  approach: string;
}

export interface NexusSpinePhysioProps {
  /** Base path where `/assets/...` are served from in your Next.js `public/` folder (defaults to `""`) */
  assetBasePath?: string;
  /** Optional custom callback when the user clicks "Schedule This Treatment" */
  onScheduleTreatment?: (service: PhysioService) => void;
  /** Optional custom callback when the user clicks "Book Initial Assessment" */
  onBookAssessment?: () => void;
  /** Optional CSS class for the outer container */
  className?: string;
}

const DEFAULT_SERVICES: PhysioService[] = [
  {
    id: 1,
    slug: "cervical-decompression",
    title: "Cervical Decompression",
    regionTag: "01 · C1–C7 CERVICAL",
    region: "Cervical Spine (C1–C7)",
    focusArea: "Neck & Cervical Spine",
    tags: ["cervical", "neck", "spine", "all"],
    color: "0ea5e9",
    bgPalette: ["#071f33", "#0e4369", "#38bdf8"],
    duration: "45 Min",
    sessionType: "Movement",
    technique: "Segmental Decompression",
    description:
      "Gentle hands-on cervical traction and segmental mobilization to relieve pinched nerves, neck stiffness, tension headaches, and cervical disc pressure without forceful manipulation.",
    conditions: ["Disc Herniation", "Pinched Nerve"],
    approach:
      "Our senior physiotherapists apply precise, unhurried manual traction to gently decompress the intervertebral spaces of the cervical spine, reducing pressure on irritated nerve roots while restoring fluid rotation and flexion.",
  },
  {
    id: 2,
    slug: "manual-joint-therapy",
    title: "Manual Joint Therapy",
    regionTag: "02 · T1–T12 THORACIC",
    region: "Thoracic Spine & Facets",
    focusArea: "Thoracic & Posture",
    tags: ["thoracic", "posture", "all"],
    color: "10b981",
    bgPalette: ["#06291e", "#0e5740", "#10b981"],
    duration: "45 Min",
    sessionType: "Joint Mobilization",
    technique: "Maitland & Kaltenborn",
    description:
      "Skilled hands-on joint mobilization and manipulation to restore natural gliding motion, reduce joint capsule stiffness, and eliminate mechanical pain across the spine and extremities.",
    conditions: ["Disc Herniation", "Pinched Nerve"],
    approach:
      "Using graded Maitland and Kaltenborn joint mobilizations, we target the exact stiff spinal segments or peripheral joints so protective muscular guarding relaxes and normal, pain-free motion returns.",
  },
  {
    id: 3,
    slug: "myofascial-release",
    title: "Myofascial Release",
    regionTag: "03 · MYOFASCIAL",
    region: "Cervicothoracic & Soft Tissue",
    focusArea: "Neck & Cervical Spine",
    tags: ["cervical", "thoracic", "shoulder", "all"],
    color: "0284c7",
    bgPalette: ["#08243d", "#0d4e80", "#0284c7"],
    duration: "40 Min",
    sessionType: "Targeted Deep Tissue",
    technique: "Active Myofascial Shearing",
    description:
      "Targeted deep-tissue and fascial release therapy to break down scar tissue adhesions, relieve chronic muscle tightness, and restore elastic, pain-free movement.",
    conditions: [
      "Chronic Trap & Levator Knots",
      "Upper-Back Muscular Adhesions",
      "Post-Injury Tissue Restriction",
      "Occupational Neck & Shoulder Strain",
    ],
    approach:
      "Sustained, directional shear pressure elongates restricted fascial planes and resets overactive muscle spindles, restoring tissue hydration and blood flow without bruising or soreness.",
  },
  {
    id: 4,
    slug: "dry-needling-therapy",
    title: "Dry Needling Therapy",
    regionTag: "04 · NEUROMUSCULAR MOTOR POINTS",
    region: "Neuromuscular Trigger Points",
    focusArea: "Specialized Treatments",
    tags: ["cervical", "thoracic", "lumbar", "specialized", "all"],
    color: "14b8a6",
    bgPalette: ["#052b28", "#0b5954", "#14b8a6"],
    duration: "30 Min",
    sessionType: "Precision Intramuscular",
    technique: "Sterile Micro-Filament",
    description:
      "Precision intramuscular trigger-point therapy using ultra-fine sterile filaments to release deep muscle spasms, reset pain pathways, and accelerate natural tissue recovery.",
    conditions: [
      "Deep Paraspinal Spasms",
      "Stubborn Trigger Points",
      "Radiating Myofascial Pain",
      "Chronic Scapular Aches",
    ],
    approach:
      "By targeting deep motor endplates that manual pressure cannot reach, dry needling elicits a localized twitch response that immediately clears chemical pain mediators and restores resting muscle tone.",
  },
  {
    id: 5,
    slug: "postural-realignment",
    title: "Postural Realignment",
    regionTag: "05 · T1–T6 THORACIC SPINE",
    region: "Thoracic Spine (T1–T6)",
    focusArea: "Thoracic & Posture",
    tags: ["cervical", "thoracic", "posture", "all"],
    color: "38bdf8",
    bgPalette: ["#09263d", "#104d7a", "#38bdf8"],
    duration: "50 Min",
    sessionType: "Kinetic Re-education",
    technique: "Thoracic Extension Mobilization",
    description:
      "Thoracic spine mobilization and postural retraining to correct rounded shoulders, forward-head posture, and upper-back fatigue caused by desk work or athletic asymmetries.",
    conditions: [
      "Forward-Head Posture & Dowager Hump",
      "Rounded Shoulders & Scapular Winging",
      "Postural Thoracic Kyphosis",
      "Desk-Bound Upper-Back Fatigue",
    ],
    approach:
      "We combine hands-on thoracic spine extension work with targeted motor recruitment of deep cervical flexors and lower trapezius so upright posture feels effortless and natural rather than forced.",
  },
  {
    id: 6,
    slug: "rotator-cuff-rehab",
    title: "Rotator Cuff Rehab",
    regionTag: "06 · SCAPULOTHORACIC GIRDLE",
    region: "Shoulder & Scapular Girdle",
    focusArea: "Thoracic & Posture",
    tags: ["thoracic", "shoulder", "all"],
    color: "059669",
    bgPalette: ["#06291e", "#0d5740", "#059669"],
    duration: "45 Min",
    sessionType: "Dynamic Shoulder Rehab",
    technique: "Force Couple Restabilization",
    description:
      "Progressive rotator cuff strengthening and scapular mechanics rehabilitation for shoulder impingement, tendonitis, labral irritation, and pain when reaching overhead.",
    conditions: [
      "Subacromial Impingement & Bursitis",
      "Supraspinatus Tendinopathy",
      "Partial Rotator Cuff Tears",
      "Scapular Dyskinesis & Overhead Pain",
    ],
    approach:
      "Because the shoulder blade glides along the ribcage and thoracic spine, we restore upward scapular rotation and dynamic humeral centering before progressing to high-load overhead movements.",
  },
  {
    id: 7,
    slug: "thoracic-mobility-therapy",
    title: "Thoracic Mobility Therapy",
    regionTag: "07 · T6–T12 MID-SPINE & RIBS",
    region: "Mid-Spine & Ribcage (T6–T12)",
    focusArea: "Thoracic & Posture",
    tags: ["thoracic", "posture", "spine", "all"],
    color: "0ea5e9",
    bgPalette: ["#08243b", "#0e4a78", "#0ea5e9"],
    duration: "45 Min",
    sessionType: "Rotational Spinal Care",
    technique: "Costovertebral Mobilization",
    description:
      "Ribcage and mid-back mobility therapy to unlock spinal rotation, improve rib expansion and breathing mechanics, and remove compensatory strain from the neck and lower back.",
    conditions: [
      "Costovertebral & Rib Joint Locking",
      "Restricted Torso Rotation",
      "Mid-Back Breathing Restriction",
      "Rotational Deficits in Golf & Tennis",
    ],
    approach:
      "Costovertebral joint mobilization and rotational drills restore 360-degree ribcage expansion and mid-back mobility, sparing your lumbar spine from harmful excessive twisting forces.",
  },
  {
    id: 8,
    slug: "sciatica-nerve-therapy",
    title: "Sciatica & Nerve Therapy",
    regionTag: "08 · L1–L4 LUMBAR RADICULAR",
    region: "Lumbar Nerve Roots (L1–L4)",
    focusArea: "Lower Back & Sciatica",
    tags: ["lumbar", "sciatica", "nerve", "all"],
    color: "10b981",
    bgPalette: ["#062b20", "#0e5c45", "#10b981"],
    duration: "45 Min",
    sessionType: "Neural Decompression",
    technique: "Neurodynamic Flossing",
    description:
      "Targeted neural mobilization, nerve flossing, and directional decompression to calm radiating leg pain, numbness, tingling, and sciatic nerve root irritation.",
    conditions: [
      "Acute Sciatica & Gluteal Radiating Pain",
      "Lumbar Radiculopathy (L4/L5/S1)",
      "Piriformis Syndrome Nerve Entrapment",
      "Lower-Limb Paresthesia & Numbness",
    ],
    approach:
      "Rather than stretching an inflamed nerve—which often worsens symptoms—we use gentle neurodynamic gliding and directional decompression to restore neural blood supply and relieve root compression.",
  },
  {
    id: 9,
    slug: "lumbar-disc-rehab",
    title: "Lumbar Disc Rehab",
    regionTag: "09 · L4–L5 LUMBAR DISC COMPLEX",
    region: "Lower Back (L4–L5)",
    focusArea: "Lower Back & Sciatica",
    tags: ["lumbar", "sciatica", "spine", "all"],
    color: "0284c7",
    bgPalette: ["#08263e", "#0d5185", "#0284c7"],
    duration: "50 Min",
    sessionType: "Disc Restabilization",
    technique: "Directional Preference & Traction",
    description:
      "Evidence-based non-surgical rehabilitation for bulging, herniated, or degenerative lower-back discs—focused on centralizing pain and rebuilding confident spinal load tolerance.",
    conditions: [
      "Herniated & Bulging Discs (L4–L5, L5–S1)",
      "Acute Lumbar Spasms & Flexion Intolerance",
      "Degenerative Disc Disease (DDD)",
      "Morning Lower-Back Stiffness",
    ],
    approach:
      "We identify your specific directional preference to reduce intradiscal pressure immediately, then systematically rebuild hip-hinge mechanics and spinal endurance so you can bend and lift without fear.",
  },
  {
    id: 10,
    slug: "spinal-stabilization",
    title: "Spinal Stabilization",
    regionTag: "10 · L3–S1 LUMBOSACRAL CORE",
    region: "Lumbosacral Core (L3–S1)",
    focusArea: "Lower Back & Sciatica",
    tags: ["lumbar", "core", "spine", "all"],
    color: "14b8a6",
    bgPalette: ["#062e2c", "#0c5c57", "#14b8a6"],
    duration: "45 Min",
    sessionType: "Core Neuromuscular Training",
    technique: "Intra-Abdominal Pressure (IAP)",
    description:
      "Neuromuscular retraining of the deep spinal stabilizers—multifidus, transverse abdominis, and pelvic floor—to eliminate recurring lower-back flare-ups under real-world loads.",
    conditions: [
      "Recurrent Chronic Low Back Pain",
      "Lumbar Segmental Micro-Instability",
      "Spondylolisthesis Management",
      "Loss of Core Bracing During Lifting",
    ],
    approach:
      "Traditional crunches often aggravate back pain. We retrain 360-degree intra-abdominal pressure and deep segmental muscle firing so your lumbar spine stays naturally supported through every daily movement.",
  },
  {
    id: 11,
    slug: "si-joint-pelvic-rehab",
    title: "SI Joint & Pelvic Rehab",
    regionTag: "11 · S1–S5 SACROILIAC GIRDLE",
    region: "Sacroiliac & Pelvic Girdle (S1–S5)",
    focusArea: "Pelvis, Hip & Knee",
    tags: ["lower", "pelvis", "hip", "all"],
    color: "38bdf8",
    bgPalette: ["#092842", "#105287", "#38bdf8"],
    duration: "45 Min",
    sessionType: "Pelvic Alignment Therapy",
    technique: "Muscle Energy Technique (MET)",
    description:
      "Sacroiliac (SI) joint realignment and lumbopelvic muscle balancing to resolve one-sided lower-back pain, pelvic asymmetry, and pain when transitioning from sitting to standing.",
    conditions: [
      "Sacroiliac (SI) Joint Dysfunction",
      "One-Sided Sacral & Buttock Pain",
      "Pelvic Torsion & Asymmetry",
      "Postpartum Pelvic Girdle Pain",
    ],
    approach:
      "Through gentle muscle-energy techniques and targeted gluteus medius, adductor, and deep core stabilization, we restore symmetrical force transfer across the pelvis and sacrum.",
  },
  {
    id: 12,
    slug: "hip-mobility-rehab",
    title: "Hip Mobility Rehab",
    regionTag: "12 · ACETABULOFEMORAL JOINT",
    region: "Hip Joint & Pelvis",
    focusArea: "Pelvis, Hip & Knee",
    tags: ["lower", "hip", "pelvis", "all"],
    color: "059669",
    bgPalette: ["#062a1f", "#0d5b43", "#059669"],
    duration: "45 Min",
    sessionType: "Hip Joint Preservation",
    technique: "Capsular Distraction & Gliding",
    description:
      "Joint capsule mobilization and deep hip rotator strengthening for hip impingement (FAI), labral irritation, trochanteric bursitis, and deep groin or lateral hip pain.",
    conditions: [
      "Femoroacetabular Impingement (FAI)",
      "Hip Labral Irritation & Groin Pinching",
      "Greater Trochanteric Pain Syndrome",
      "Deep Squat & Hip Rotation Deficits",
    ],
    approach:
      "When hip internal or external rotation is restricted, the lower back compensates. We mobilize the hip capsule to create joint clearance and restore smooth, impingement-free squatting.",
  },
  {
    id: 13,
    slug: "sports-injury-rehab",
    title: "Sports Injury & ACL Rehab",
    regionTag: "13 · LOWER KINETIC CHAIN",
    region: "Knee & Lower Kinetic Chain",
    focusArea: "Pelvis, Hip & Knee",
    tags: ["lower", "knee", "sports", "all"],
    color: "0ea5e9",
    bgPalette: ["#08243d", "#0e4e82", "#0ea5e9"],
    duration: "50 Min",
    sessionType: "Athletic Return-to-Play",
    technique: "Eccentric Load & Deceleration",
    description:
      "Comprehensive sports physiotherapy for knee, ligament, meniscus, and tendon injuries—rebuilding strength symmetry, deceleration mechanics, and reactive agility for safe return to sport.",
    conditions: [
      "ACL, MCL & Meniscus Tear Rehab",
      "Patellofemoral Pain (Runner’s Knee)",
      "Patellar & Achilles Tendinopathy",
      "Hamstring & Quad Strain Recovery",
    ],
    approach:
      "We bridge the gap between basic clinical exercise and high-speed sports performance using force plates, eccentric rate-of-force training, and multi-directional deceleration biomechanics.",
  },
  {
    id: 14,
    slug: "post-surgical-rehab",
    title: "Post-Surgical Rehabilitation",
    regionTag: "14 · ORTHOPEDIC RECONSTRUCTION",
    region: "Orthopedic Reconstruction",
    focusArea: "Pelvis, Hip & Knee",
    tags: ["lower", "post-op", "all"],
    color: "10b981",
    bgPalette: ["#06291e", "#0e5740", "#10b981"],
    duration: "50 Min",
    sessionType: "Phase-Specific Post-Op",
    technique: "Surgeon Protocol Adherence",
    description:
      "Guided 1-on-1 orthopedic rehabilitation following spinal microdiscectomy, fusion, rotator cuff repair, hip arthroscopy, or knee reconstruction to safely restore full function.",
    conditions: [
      "Post-Op Lumbar Discectomy & Fusion",
      "Post-Op Rotator Cuff & Labral Repair",
      "Total Knee & Hip Arthroplasty (TKA/THA)",
      "Arthroscopic Joint Decompression",
    ],
    approach:
      "Working strictly in step with your surgeon’s clinical protocol, we guide tissue healing from early edema control and gentle scar mobilization to full athletic power and independence.",
  },
];

export default function NexusSpinePhysio({
  assetBasePath = "",
  onScheduleTreatment,
  onBookAssessment,
  className = "",
}: NexusSpinePhysioProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const loadedRef = useRef(false);

  const currentService = DEFAULT_SERVICES[activeIdx] || DEFAULT_SERVICES[0];
  const nextService1 = DEFAULT_SERVICES[(activeIdx + 1) % DEFAULT_SERVICES.length];
  const nextService2 = DEFAULT_SERVICES[(activeIdx + 2) % DEFAULT_SERVICES.length];

  const handleSelectIndex = useCallback((idx: number) => {
    const w = window as any;
    const isMobile = w.Device && w.Device.mobile;
    const offset = isMobile ? 0.1 : 0.06;
    const targetScroll = (idx / 13.0) * (1 - 2 * offset) + offset;
    if (typeof w.SCROLL_TO_PROGRESS === "function") {
      w.SCROLL_TO_PROGRESS(targetScroll);
    } else if (w.WORK_SCENE) {
      w.WORK_SCENE.scrollProgress = targetScroll;
      w.PHYSIO_SCROLL = targetScroll;
    }
    setActiveIdx(idx);
  }, []);

  const handleWheelOverlay = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const fxScroll = document.querySelector(".FXScroll") as HTMLElement | null;
    if (fxScroll) {
      fxScroll.scrollTop += e.deltaY;
    }
  }, []);

  useEffect(() => {
    const w = window as any;
    w._ENV_ = "production";
    w._CMS_ = "%CMS%";
    w._CACHE_ = "1780406240914";
    w.UIL_STATIC_PATH = `${assetBasePath}assets/data/uil.1780406240914.json`;
    w.PHYSIO_SERVICES = DEFAULT_SERVICES;

    const onScroll = (e: Event) => {
      const custom = e as CustomEvent<{ progress: number; index: number }>;
      if (custom.detail && typeof custom.detail.index === "number") {
        setActiveIdx(custom.detail.index);
      }
    };
    const onOpenModal = () => setDrawerOpen(true);
    const onCloseModal = () => setDrawerOpen(false);

    window.addEventListener("physio-scroll", onScroll);
    window.addEventListener("physio-open-modal", onOpenModal);
    window.addEventListener("physio-close-modal", onCloseModal);

    if (!loadedRef.current) {
      loadedRef.current = true;
      const s1 = document.createElement("script");
      s1.src = `${assetBasePath}assets/js/v8_geometry.js`;
      s1.async = false;
      const s2 = document.createElement("script");
      s2.src = `${assetBasePath}assets/js/app.1780406240914.js`;
      s2.async = false;
      document.body.appendChild(s1);
      document.body.appendChild(s2);
    }

    return () => {
      window.removeEventListener("physio-scroll", onScroll);
      window.removeEventListener("physio-open-modal", onOpenModal);
      window.removeEventListener("physio-close-modal", onCloseModal);
    };
  }, [assetBasePath]);

  return (
    <div
      className={`nexus-spine-component ${className}`}
      style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "#08101E" }}
    >
      <div id="Stage" style={{ position: "absolute", inset: 0, zIndex: 1 }} />

      <div
        className="physio-ui-overlay"
        onWheel={handleWheelOverlay}
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 10 }}
      >
        {/* Top-Left Brand Header */}
        <div
          className="brand-header"
          onClick={() => handleSelectIndex(0)}
          style={{ pointerEvents: "auto", cursor: "pointer" }}
        >
          <div className="brand-title">Nexus Motion</div>
        </div>

        {/* Bottom-Left Anatomical Focus */}
        <div className="focus-panel interactive-card" style={{ pointerEvents: "auto" }}>
          <div className="focus-header">
            ANATOMICAL FOCUS ·{" "}
            <span className="counter">
              {String(activeIdx + 1).padStart(2, "0")} / {String(DEFAULT_SERVICES.length).padStart(2, "0")}
            </span>
          </div>
          <div className="focus-divider" />
          <ul className="focus-list">
            {[currentService, nextService1, nextService2].map((s, i) => {
              const itemIdx = (activeIdx + i) % DEFAULT_SERVICES.length;
              return (
                <li
                  key={s.id}
                  className={`focus-item ${i === 0 ? "active" : ""}`}
                  onClick={() => handleSelectIndex(itemIdx)}
                >
                  <span className="item-num">{String(s.id).padStart(2, "0")}</span>
                  <span className="item-title">{s.title}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Top-Right Clinical Protocol Drawer */}
        <div
          className={`detail-drawer interactive-card ${drawerOpen ? "" : "closed"}`}
          style={{ pointerEvents: drawerOpen ? "auto" : "none" }}
        >
          <div className="drawer-top-bar">
            <button className="icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Back">
              ←
            </button>
            <button className="icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close">
              ✕
            </button>
          </div>
          <div>
            <div className="drawer-section-title">Conditions Treated</div>
            <div className="pill-group">
              {currentService.conditions.map((c) => (
                <div key={c} className="med-pill">
                  {c}
                </div>
              ))}
            </div>
          </div>
          <div className="drawer-divider" />
          <div>
            <div className="drawer-section-title">Clinical Protocol</div>
            <div className="protocol-metrics-row">
              <div className="protocol-metric-col">
                <div className="protocol-value-line">
                  <span className="protocol-num">{currentService.duration.replace(/[^0-9]/g, "") || "45"}</span>
                  <span className="protocol-unit">Min</span>
                </div>
                <div className="protocol-sublabel">{currentService.sessionType}</div>
              </div>
              <div className="protocol-metric-divider" />
              <div className="protocol-metric-col">
                <div className="protocol-value-line">
                  <span className="protocol-num">45</span>
                  <span className="protocol-unit">Min</span>
                </div>
                <div className="protocol-sublabel">Session</div>
              </div>
            </div>
          </div>
          <button
            className="schedule-btn"
            onClick={() =>
              onScheduleTreatment
                ? onScheduleTreatment(currentService)
                : alert(`Scheduling initialized for: ${currentService.title}`)
            }
          >
            Schedule This Treatment →
          </button>
        </div>

        {/* Bottom-Right Biomechanical Evaluation CTA */}
        <div className="cta-card interactive-card" style={{ pointerEvents: "auto" }}>
          <div className="cta-header">
            <div className="cta-status-dot" />
            <div className="cta-title-group">
              <span>BIOMECHANICAL</span>
              <span>EVALUATION</span>
            </div>
          </div>
          <div className="cta-body">
            Clinical assessment to innovate your care experience and biomechanical evaluation.
          </div>
          <button
            className="cta-btn"
            onClick={() =>
              onBookAssessment ? onBookAssessment() : alert("Booking Initial Biomechanical Evaluation...")
            }
          >
            Book Initial Assessment →
          </button>
        </div>
      </div>
    </div>
  );
}
