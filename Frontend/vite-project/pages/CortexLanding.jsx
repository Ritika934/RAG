import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaDatabase,
  FaFileAlt,
  FaFileUpload,
  FaGithub,
  FaLinkedin,
  FaLock,
  FaPlay,
  FaQuoteLeft,
  FaRobot,
  FaSearch,
} from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";

const features = [
  {
    icon: FaFileUpload,
    title: "Upload and understand documents",
    description:
      "Drop in PDFs, reports, SOPs, or notes and turn them into a searchable knowledge layer in minutes.",
    tone: "from-red-500 via-orange-500 to-amber-400",
  },
  {
    icon: FaDatabase,
    title: "Context-aware retrieval",
    description:
      "CortexAI finds the most relevant chunks before answering, so responses stay grounded in your documents.",
    tone: "from-blue-500 via-sky-500 to-cyan-400",
  },
  {
    icon: FaRobot,
    title: "Answers that feel actionable",
    description:
      "Ask natural questions, compare sections, summarize large files, and get precise responses with clear context.",
    tone: "from-violet-500 via-indigo-500 to-blue-500",
  },
  {
    icon: FaLock,
    title: "Built for focused private work",
    description:
      "A clean flow for research, internal docs, study material, and workflows where speed and trust both matter.",
    tone: "from-green-500 via-emerald-500 to-lime-400",
  },
];

const testimonials = [
  {
    quote:
      "CortexAI cut the time we spend reading long documents. The answers feel direct, clean, and genuinely useful.",
    name: "Aarav Mehta",
    role: "Product Analyst",
    tone: "from-yellow-300/90 via-orange-300/80 to-amber-200/70",
  },
  {
    quote:
      "The upload-to-answer experience is exactly what I wanted from a RAG app. It feels simple without feeling basic.",
    name: "Riya Sharma",
    role: "Research Student",
    tone: "from-sky-300/90 via-cyan-300/80 to-blue-200/70",
  },
  {
    quote:
      "We stopped digging through PDFs manually. CortexAI gives us the important part almost instantly.",
    name: "Kabir Nanda",
    role: "Operations Associate",
    tone: "from-emerald-300/90 via-lime-300/80 to-green-200/70",
  },
];

const footerLinks = [
  { label: "GitHub", href: "#", icon: FaGithub },
  { label: "LinkedIn", href: "#", icon: FaLinkedin },
  { label: "LeetCode", href: "#", icon: SiLeetcode },
];

const heroLines = [
  "Upload PDFs. Ask anything. Get instant answers.",
  "No need to read every long document line by line.",
  "Reading long documents manually? Here is your solution.",
];

function AnimatedBackground({ trail }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {trail.map((point) => (
        <motion.div
          key={point.id}
          className="absolute rounded-full bg-yellow-300/90"
          style={{
            left: point.x - point.size / 2,
            top: point.y - point.size / 2,
            width: point.size,
            height: point.size,
          }}
          initial={{ opacity: 0.9, scale: 1 }}
          animate={{ opacity: 0, scale: 0.25 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function TypewriterTitle() {
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    const currentLine = heroLines[lineIndex];

    if (displayedText.length < currentLine.length) {
      const timeout = window.setTimeout(() => {
        setDisplayedText(currentLine.slice(0, displayedText.length + 1));
      }, 55);

      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(() => {
      setDisplayedText("");
      setLineIndex((prev) => (prev + 1) % heroLines.length);
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [displayedText, lineIndex]);

  return (
    <div className="min-h-[82px] md:min-h-[96px]">
      <p className="text-2xl text-white/78 md:text-4xl">
        {displayedText}
        <span className="ml-1 inline-block h-[0.95em] w-[2px] translate-y-1 animate-pulse bg-yellow-300 align-middle" />
      </p>
    </div>
  );
}

function DemoMockup() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const steps = [1, 2, 3, 4];
    const timers = steps.map((step, index) =>
      window.setTimeout(() => setDemoStep(step), 1500 * (index + 1))
    );
    const resetTimer = window.setTimeout(() => {
      setIsPlaying(false);
      setDemoStep(0);
    }, 8600);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(resetTimer);
    };
  }, [isPlaying]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black p-6 md:p-8"
    >
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <p className="text-base uppercase tracking-[0.35em] text-white/40">
            Live Workflow
          </p>
        </div>
        <button
          onClick={() => {
            setDemoStep(0);
            setIsPlaying(true);
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-yellow-300/25 bg-yellow-300/10 text-yellow-100 transition hover:bg-yellow-300/20"
        >
          <FaPlay />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <div className="relative min-h-[520px] rounded-3xl border border-white/10 bg-black p-5">
          <div className="mb-3 flex items-center gap-2 text-sm text-white/55">
            <div className="h-2 w-2 rounded-full bg-rose-400" />
            <div className="h-2 w-2 rounded-full bg-amber-400" />
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="ml-2">chat.cortexai.app</span>
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{
                opacity: demoStep === 1 ? 1 : demoStep > 1 ? 0.45 : 0.25,
                x: 0,
                scale: demoStep === 1 ? [1, 1.02, 1] : 1,
                borderColor: demoStep === 1 ? "rgba(250, 204, 21, 0.65)" : "rgba(34, 211, 238, 0.18)",
              }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="rounded-2xl border bg-cyan-400/10 p-5"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                  <FaFileAlt />
                </div>
                <div>
                  <p className="font-medium text-white">Quarterly_Report.pdf</p>
                  <p className="text-sm text-white/55">Selected and uploaded</p>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-cyan-300"
                  initial={{ width: "0%" }}
                  animate={{ width: demoStep >= 1 ? "100%" : "0%" }}
                  transition={{ duration: 1.1 }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{
                opacity: demoStep === 2 ? 1 : demoStep > 2 ? 0.35 : 0.18,
                y: 0,
                borderColor: demoStep === 2 ? "rgba(250, 204, 21, 0.65)" : "rgba(255,255,255,0.08)",
              }}
              transition={{ duration: 0.4 }}
              className="max-w-[28rem] rounded-2xl border bg-white/5 p-5 text-white/80"
            >
              Summarize the revenue trend and mention the strongest region.
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: demoStep === 3 ? 1 : demoStep > 3 ? 0.35 : 0.12,
                borderColor: demoStep === 3 ? "rgba(250, 204, 21, 0.55)" : "rgba(252, 211, 77, 0.15)",
              }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-3 rounded-full border bg-amber-200/8 px-4 py-2 text-sm text-amber-100"
            >
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-300" />
              CortexAI is thinking through retrieved chunks...
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{
                opacity: demoStep === 4 ? 1 : 0.15,
                x: 0,
                borderColor: demoStep === 4 ? "rgba(250, 204, 21, 0.65)" : "rgba(52, 211, 153, 0.2)",
              }}
              transition={{ duration: 0.45 }}
              className="ml-auto max-w-[32rem] rounded-2xl border bg-emerald-400/10 p-5 text-white/85"
            >
              Revenue grew steadily across the quarter, with the highest momentum
              coming from the North America segment. The document also notes
              stronger enterprise renewals and faster expansion in mid-market
              accounts.
            </motion.div>
          </div>

          <motion.div
            className="pointer-events-none absolute left-10 top-16 h-5 w-5 rounded-full border-2 border-white bg-black"
            animate={{
              x:
                demoStep >= 4
                  ? [0, 180, 205, 140, 320]
                  : demoStep >= 2
                    ? [0, 180]
                    : [0, 0],
              y:
                demoStep >= 4
                  ? [0, 30, 135, 205, 250]
                  : demoStep >= 2
                    ? [0, 30]
                    : [0, 0],
            }}
            transition={{ duration: 3.5, ease: "easeInOut" }}
          />
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-black p-5">
          <motion.div
            animate={{
              borderColor: demoStep === 1 ? "rgba(250, 204, 21, 0.65)" : "rgba(255,255,255,0.08)",
              backgroundColor: demoStep === 1 ? "rgba(250, 204, 21, 0.08)" : "rgba(0,0,0,1)",
            }}
            className="rounded-2xl border p-5"
          >
            <p className="text-sm text-white/45">Step 1</p>
            <h4 className="mt-2 text-lg font-semibold text-white">
              Choose a PDF
            </h4>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Upload your file and let CortexAI prepare it for semantic
              retrieval.
            </p>
          </motion.div>

          <motion.div
            animate={{
              borderColor: demoStep === 2 ? "rgba(250, 204, 21, 0.65)" : "rgba(255,255,255,0.08)",
              backgroundColor: demoStep === 2 ? "rgba(250, 204, 21, 0.08)" : "rgba(0,0,0,1)",
            }}
            className="rounded-2xl border p-5"
          >
            <p className="text-sm text-white/45">Step 2</p>
            <h4 className="mt-2 text-lg font-semibold text-white">
              Ask a natural question
            </h4>
            <p className="mt-2 text-sm leading-6 text-white/65">
              No prompt engineering required. Just ask as if you were talking to
              a helpful analyst.
            </p>
          </motion.div>

          <motion.div
            animate={{
              borderColor: demoStep === 4 ? "rgba(250, 204, 21, 0.65)" : "rgba(255,255,255,0.08)",
              backgroundColor: demoStep === 4 ? "rgba(250, 204, 21, 0.08)" : "rgba(0,0,0,1)",
            }}
            className="rounded-2xl border p-5"
          >
            <p className="text-sm text-white/45">Step 3</p>
            <h4 className="mt-2 text-lg font-semibold text-white">
              Receive grounded answers
            </h4>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Responses are based on relevant document context, not just generic
              generation.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CortexLanding() {
  const navigate = useNavigate();
  const [trail, setTrail] = useState([]);
  const [featureIndex, setFeatureIndex] = useState(0);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    let pointId = 0;

    const handleMove = (event) => {
      const newPoint = {
        id: pointId++,
        x: event.clientX,
        y: event.clientY,
        size: 10 + Math.random() * 8,
      };

      setTrail((current) => [...current.slice(-14), newPoint]);
      window.setTimeout(() => {
        setTrail((current) => current.filter((point) => point.id !== newPoint.id));
      }, 750);
    };

    window.addEventListener("pointermove", handleMove);

    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  const testimonialColumns = useMemo(
    () => [
      [...testimonials, ...testimonials],
      [testimonials[1], testimonials[2], testimonials[0], testimonials[1], testimonials[2], testimonials[0]],
      [testimonials[2], testimonials[0], testimonials[1], testimonials[2], testimonials[0], testimonials[1]],
    ],
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-serif text-white">
      <AnimatedBackground trail={trail} />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
            <button
              onClick={() => scrollToSection("hero")}
              className="ml-0 mr-auto flex items-center gap-3 pl-0 text-left"
            >
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-black">
                <span className="relative text-lg font-semibold tracking-wide text-white">
                  C
                </span>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">CortexAI</p>
              </div>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/85 transition hover:border-white/30 hover:bg-white/5"
              >
                Login
              </button>
                
               <button
                onClick={() => navigate("/signup")}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/85 transition hover:border-white/30 hover:bg-white/5"
              >
               Signup
              </button>





            
            </div>
          </div>
        </header>

        <main>
          <section
            id="hero"
            className="mx-auto flex min-h-[68vh] max-w-7xl flex-col justify-center px-6 py-10 lg:px-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mx-auto max-w-4xl text-center"
            >
              <h1 className="text-5xl font-semibold tracking-tight text-white md:text-7xl">
                Welcome to CortexAI
              </h1>

              <div className="mt-6">
                <TypewriterTitle />
              </div>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/68 md:text-lg">
                Upload your PDFs, ask your question, and get instant answers
                without reading every page yourself. If you are tired of going
                through long documents manually, CortexAI is your faster way to
                find what matters.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                onClick={() => {
  localStorage.setItem("demoMode", "true");
  navigate("/home");
}}
                  className="inline-flex items-center gap-3 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
                >
                Request a Demo
                  <FaArrowRight />
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="rounded-full border border-white/15 px-7 py-3 text-sm font-medium text-white/85 transition hover:border-white/30 hover:bg-white/5"
                >
                  View Features
                </button>
              </div>
            </motion.div>
          </section>

          <section id="demo" className="mx-auto max-w-7xl px-6 py-4 lg:px-10">
            <div className="mb-12 max-w-4xl">
              <p className="text-sm uppercase tracking-[0.35em] text-white/40">
                Product Walkthrough
              </p>
              <h2 className="mt-3 text-4xl font-semibold md:text-6xl">
                Upload a PDF, ask a question, and watch the answer arrive!
              </h2>
            </div>

            <DemoMockup />
          </section>

          <section
            id="features"
            className="mx-auto max-w-7xl px-6 py-20 lg:px-10"
          >
            <div className="mx-auto mb-10 flex max-w-5xl flex-col items-start text-left">
              <p className="text-sm uppercase tracking-[0.35em] text-white/40">
                Core Features
              </p>
              <h2 className="mt-3 text-3xl font-semibold md:text-5xl">
                Built to make your RAG workflow feel effortless
              </h2>
            </div>

            <div className="overflow-visible">
              <div className="mx-auto flex max-w-5xl justify-start">
                <div className="relative flex min-h-[620px] w-full items-start justify-start pt-4 md:pl-24">
                  {features.map((feature, stackIndex) => {
                    const Icon = feature.icon;
                    const relativeIndex =
                      (stackIndex - featureIndex + features.length) % features.length;
                    const isActive = relativeIndex === 0;

                    if (relativeIndex > 3) return null;

                    return (
                      <motion.button
                        key={feature.title}
                        type="button"
                        onClick={() =>
                          setFeatureIndex((current) => (current + 1) % features.length)
                        }
                        className={`absolute left-1/2 top-6 w-full max-w-[360px] -translate-x-1/2 rounded-[28px] bg-gradient-to-br ${feature.tone} text-left`}
                        animate={{
                          y: relativeIndex * -16,
                          x: relativeIndex * 12,
                          scale: 1 - relativeIndex * 0.035,
                          rotate: relativeIndex === 0 ? 0 : relativeIndex % 2 === 0 ? -2 : 2,
                          opacity: 1 - relativeIndex * 0.08,
                          zIndex: features.length - relativeIndex,
                        }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                      >
                        <div className="flex min-h-[460px] flex-col rounded-[28px] px-7 py-8 md:px-8 md:py-9">
                          <div className="mb-6 flex items-center justify-between">
                            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-black/15 text-xl text-white">
                              <Icon />
                            </div>
                            <div className="rounded-full bg-black/15 px-4 py-2 text-sm text-white/80">
                              {stackIndex + 1} / {features.length}
                            </div>
                          </div>

                          <div className="max-w-xs">
                            <h3 className="text-3xl font-semibold text-white md:text-[2.35rem]">
                              {feature.title}
                            </h3>
                            <p className="mt-6 text-lg leading-8 text-white/76">
                              {feature.description}
                            </p>
                            <p className="mt-6 max-w-[16rem] text-sm leading-7 text-white/70">
                              Click the active card to move to the next feature.
                              After the last one, the carousel returns to the
                              first card automatically.
                            </p>
                          </div>

                          <div className="mt-auto flex items-center justify-between pt-10">
                            <div className="flex gap-2">
                              {features.map((_, dotIndex) => (
                                <span
                                  key={dotIndex}
                                  className={`h-2.5 rounded-full transition-all ${
                                    dotIndex === featureIndex
                                      ? "w-8 bg-white"
                                      : "w-2.5 bg-black/30"
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="rounded-full bg-black/15 px-5 py-2 text-sm text-white/86">
                              {isActive ? "Click for next feature" : "Up next"}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
            <div className="mb-12 max-w-none">
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                Testimonials
              </p>
              <h2 className="mt-3 max-w-6xl text-4xl font-semibold leading-tight md:text-6xl">
                People remember products that save them real time
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {testimonialColumns.map((column, columnIndex) => (
                <div
                  key={`column-${columnIndex}`}
                  className="h-[430px] overflow-hidden rounded-[32px] border border-white/10 bg-black p-4"
                >
                  <motion.div
                    className="space-y-5"
                    animate={{ y: ["0%", "-50%"] }}
                    transition={{
                      duration: 16 + columnIndex * 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    {column.map((item, index) => (
                      <div
                        key={`${item.name}-${columnIndex}-${index}`}
                        className={`min-h-[180px] rounded-[28px] border border-white/15 bg-gradient-to-br ${item.tone} p-[1px]`}
                      >
                        <div className="flex h-full flex-col rounded-[27px] bg-black p-6">
                          <FaQuoteLeft className="text-white/72" />
                          <p className="mt-4 leading-7 text-white/80">
                            {item.quote}
                          </p>
                          <div className="mt-6">
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="text-sm text-white/55">{item.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="border-t border-white/10 bg-black/70">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-10">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-black text-white">
                  C
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">CortexAI</p>
                </div>
              </div>
              <p className="mt-5 max-w-md leading-7 text-white/58">
                Upload documents, skip the long reading, and let CortexAI bring
                the right answers to you in seconds.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/42">
                Platform
              </h3>
              <div className="mt-5 space-y-3">
                {footerLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      className="flex items-center gap-3 text-white/68 transition hover:text-white"
                    >
                      <Icon />
                      <span>{link.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/42">
                Legal
              </h3>
              <div className="mt-5 flex flex-col gap-3">
                <button
                  onClick={() => navigate("/privacy-policy")}
                  className="text-left text-white/68 transition hover:text-white"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => navigate("/cookie-declaration")}
                  className="text-left text-white/68 transition hover:text-white"
                >
                  Cookie Declaration
                </button>
                <button
                  onClick={() => navigate("/terms")}
                  className="text-left text-white/68 transition hover:text-white"
                >
                  Terms
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 px-6 py-5 text-center text-sm text-white/45">
            Developed by Ritika
          </div>
        </footer>
      </div>
    </div>
  );
}
