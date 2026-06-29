'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Landmark, Sun, Moon } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? theme : "light";
  const isDark = activeTheme === "dark";

  const heroRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const btnsRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mounted) return;

    const ctx = gsap.context(() => {
      // Nav entrance
      gsap.from(navRef.current, {
        y: -60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      // Hero stagger
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(badgeRef.current, { y: 30, opacity: 0, duration: 0.6 })
        .from(headingRef.current, { y: 50, opacity: 0, duration: 0.8 }, "-=0.3")
        .from(subRef.current, { y: 30, opacity: 0, duration: 0.6 }, "-=0.4");

      if (btnsRef.current) {
        tl.from(btnsRef.current.children, {
          y: 20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.15,
        }, "-=0.3");
      }

      // Stats count-up/down feel
      const statsTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".stats-section",
          start: "top 85%",
          once: true,
        }
      });

      statsTl.from(".stat-card", {
        y: 45,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
      });

      // Animate the numeric values in parallel
      const numElements = document.querySelectorAll(".stat-number");
      numElements.forEach((el) => {
        const startVal = parseInt(el.getAttribute("data-start") || "0", 10);
        const targetVal = parseInt(el.getAttribute("data-target") || "0", 10);
        const suffix = el.getAttribute("data-suffix") || "";
        const isInfinity = el.getAttribute("data-infinity") === "true";

        const obj = { val: startVal };
        
        statsTl.to(obj, {
          val: targetVal,
          duration: 2.2,
          ease: "power3.out",
          onUpdate: () => {
            if (isInfinity) {
              const currentVal = Math.round(obj.val);
              if (currentVal <= 10) {
                el.innerHTML = "∞";
              } else {
                el.innerHTML = currentVal.toString();
              }
            } else {
              el.innerHTML = Math.round(obj.val) + suffix;
            }
          },
          onComplete: () => {
            if (isInfinity) {
              el.innerHTML = "∞";
            } else {
              el.innerHTML = targetVal + suffix;
            }
          }
        }, "<+=0.25");
      });

      // Feature cards scroll reveal
      gsap.from(".feature-card", {
        scrollTrigger: { trigger: ".cards-grid", start: "top 75%" },
        y: 60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
      });

      // Role pills
      gsap.from(".role-pill", {
        scrollTrigger: { trigger: ".roles-section", start: "top 80%" },
        scale: 0.8,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: "back.out(1.7)",
      });

      // CTA section
      gsap.from(".cta-section", {
        scrollTrigger: { trigger: ".cta-section", start: "top 80%" },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      // Floating glow pulse
      gsap.to(".hero-glow", {
        scale: 1.15,
        opacity: 0.6,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    return () => ctx.revert();
  }, [mounted]);

  return (
    <>
      <a href="#main" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:p-4 focus:rounded-md">
        Skip to content
      </a>
      <div id="main" className="bg-watermark min-h-screen overflow-x-hidden transition-colors duration-300 bg-background text-text-primary font-sans">

        {/* Navbar */}
        <nav ref={navRef} aria-label="Main navigation" className="flex items-center justify-between py-[1.2rem] px-[2.5rem] border-b border-border-custom sticky top-0 z-50 bg-background/85 backdrop-blur-md transition-colors duration-300">
          <div className="flex items-center gap-[10px]">
            <img 
              src="/logo-watermark.png" 
              alt="Anchor University Logo" 
              className="w-8 h-8 object-contain logo-hover" 
            />
            <div className="flex flex-col leading-[1.1]">
              <span className="text-[14px] font-bold text-primary tracking-[0.05em] uppercase">
                Anchor University
              </span>
              <span className="text-[10px] text-text-secondary font-medium tracking-[0.05em]">
                SIWES PORTAL
              </span>
            </div>
          </div>

          <div className="flex gap-8">
            {["Features", "Roles", "About"].map((item) => (
              <a
                key={item}
                className="nav-link text-[14px] text-text-secondary hover:text-text-primary no-underline inline-block transition-colors duration-200"
                href={`#${item.toLowerCase()}`}
                onMouseEnter={e => {
                  gsap.to(e.currentTarget, { y: -2, duration: 0.2, ease: "power2.out" });
                }}
                onMouseLeave={e => {
                  gsap.to(e.currentTarget, { y: 0, duration: 0.3, ease: "elastic.out(1, 0.5)" });
                }}
                aria-label={`Navigate to ${item}`}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center bg-transparent text-text-primary border border-border-custom hover:bg-black/5 dark:hover:bg-white/5 w-10 h-10 rounded-[10px] cursor-pointer transition-colors duration-200"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-primary hover:brightness-110 text-white py-3 px-7 rounded-[10px] text-[14px] font-semibold no-underline transition-[filter] duration-200"
              aria-label="Get started - access portal"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section ref={heroRef} className="min-h-[88vh] flex flex-col items-center justify-center text-center py-20 px-8 relative overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,var(--border-custom)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-custom)_1px,transparent_1px)] opacity-20 bg-[size:48px_48px]" />

          {/* Glow */}
          <div className="hero-glow absolute top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] z-0 pointer-events-none bg-[radial-gradient(ellipse,#3b82f615_0%,transparent_70%)]" />

          <div className="relative z-10 max-w-[900px]">
            <div ref={badgeRef} className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[12px] font-semibold tracking-[0.15em] uppercase py-[0.4rem] px-[1.1rem] rounded-full mb-8 transition-colors duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              SIWES Monitoring System — Tripartite Management
            </div>

            <h1 ref={headingRef} className="text-[clamp(2.3rem,5.5vw,4rem)] font-bold leading-[1.1] mb-6 tracking-[-0.02em]">
              Modernizing SIWES at <span className="text-primary font-style-normal not-italic">Anchor University</span>, <br className="hidden sm:inline" />
              <em className="text-primary font-style-normal not-italic">Fully Digital.</em>
            </h1>

            <p ref={subRef} className="text-[1.1rem] text-text-secondary max-w-[680px] leading-[1.7] mx-auto mb-10">
              Replacing paper logbooks with a secure, cloud-based digital workspace. Empowering students, supervisors, and admins with daily logs, GPS check-ins, AI analysis, and online supervision.
            </p>

            <div ref={btnsRef} className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-primary hover:brightness-110 text-white py-3 px-7 rounded-[10px] text-[14px] font-semibold no-underline transition-[filter] duration-200"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-transparent text-text-primary border border-border-custom hover:bg-black/5 dark:hover:bg-white/5 py-3 px-7 rounded-[10px] text-[14px] font-semibold no-underline cursor-pointer transition-colors duration-200"
              >
                Login to Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="stats-section max-w-[1100px] mx-auto py-8 px-8 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-center">
            {[
              { label: "User roles", target: 4, start: 50, suffix: "" },
              { label: "Features", target: 20, start: 120, suffix: "+" },
              { label: "Cloud-based", target: 100, start: 300, suffix: "%" },
              { label: "Log entries", target: 0, start: 999, suffix: "", isInfinity: true },
            ].map((s) => (
              <div
                key={s.label}
                className="stat-card bg-surface border border-border-custom px-6 py-8 rounded-2xl shadow-xs hover:shadow-lg hover:border-primary/50 transition-all duration-300 flex flex-col justify-center items-center relative overflow-hidden group"
              >
                {/* Subtle radial glow inside on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-[0.12] dark:group-hover:opacity-[0.18] transition-opacity duration-500 pointer-events-none stat-card-glow"
                />
                
                <div className="text-[2.5rem] md:text-[3rem] font-extrabold text-primary font-mono tracking-tight leading-none mb-2 transform transition-transform duration-300 group-hover:scale-108 group-hover:-translate-y-1">
                  <span
                    className="stat-number"
                    data-start={s.start}
                    data-target={s.target}
                    data-suffix={s.suffix}
                    data-infinity={s.isInfinity ? "true" : "false"}
                  >
                    {s.start}
                    {s.suffix}
                  </span>
                </div>
                <div className="text-[12px] md:text-[13px] font-semibold text-text-secondary uppercase tracking-wider text-center transition-colors duration-300 group-hover:text-primary-light">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <section id="features" className="py-20 px-8 max-w-[1100px] mx-auto">
          <p className="text-center text-[14px] font-semibold tracking-[0.2em] uppercase text-primary mb-4">
            What's included
          </p>
          <h2 className="text-center text-[clamp(2.2rem,4vw,3rem)] font-bold mb-12 tracking-[-0.01em]">
            Everything SIWES Needs
          </h2>

          <div className="cards-grid grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[1px] bg-border-custom rounded-[20px] overflow-hidden border border-border-custom transition-colors duration-300">
            {[
              { title: "Daily Log Entries", desc: "Students log activities, tools used, skills learned, and challenges each day with attachment support.", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" },
              { title: "Supervisor Approval", desc: "Digital sign-off workflow for weekly entries with comments, feedback, and full approval history.", icon: "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" },
              { title: "Coordinator Dashboard", desc: "School coordinators monitor all students, flag suspicious submissions, and track SIWES progress.", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" },
              { title: "GPS Check-in", desc: "Attendance with timestamp and location capture. Geofencing prevents fake check-ins from off-site.", icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a2 2 0 100 4 2 2 0 000-4" },
              { title: "Analytics & Reports", desc: "Export full PDF logbooks, attendance reports, and performance charts per student or department.", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
              { title: "Anti-Cheat System", desc: "Backdating prevention, IP logging, device tracking, and duplicate entry detection all built in.", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
            ].map((card) => (
              <div
                key={card.title}
                className="feature-card bg-surface py-10 px-8 cursor-default transition-colors duration-300"
                onMouseEnter={e => {
                  gsap.to(e.currentTarget, { y: -6, duration: 0.3, ease: "power2.out" });
                }}
                onMouseLeave={e => {
                  gsap.to(e.currentTarget, { y: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" });
                }}
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-border-custom flex items-center justify-center mb-6 transition-colors duration-300">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={card.icon} />
                  </svg>
                </div>
                <h3 className="text-[18px] font-semibold mb-3">{card.title}</h3>
                <p className="text-[15px] text-text-secondary leading-[1.6]">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Roles */}
        <section id="roles" className="roles-section py-16 px-8 max-w-[1100px] mx-auto text-center">
          <h2 className="text-[clamp(2.2rem,4vw,3rem)] font-bold mb-10 tracking-[-0.01em]">
            Built for every user
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { role: "Student", desc: "Log daily activities" },
              { role: "Supervisor", desc: "Review & approve entries" },
              { role: "Coordinator", desc: "Monitor all students" },
              { role: "Admin", desc: "Manage system & sessions" },
            ].map((r) => (
              <div
                key={r.role}
                className="role-pill bg-surface border border-border-custom rounded-full py-[0.8rem] px-[1.8rem] text-[16px] text-text-primary transition-colors duration-300"
              >
                <strong className="text-primary">{r.role}</strong> — {r.desc}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section text-center py-24 px-8">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold mb-[1.2rem] tracking-[-0.02em]">
            Ready to go digital?
          </h2>
          <p className="text-text-secondary mb-10 text-[1.1rem]">
            Join students and supervisors tracking their SIWES the modern way.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-primary hover:brightness-110 text-white py-[0.9rem] px-[2.8rem] rounded-[10px] text-[16px] font-semibold no-underline transition-[filter] duration-200"
          >
            Create your account
          </Link>
        </section>

        {/* Footer */}
        <footer className="border-t border-border-custom py-10 px-8 text-center text-[13px] text-text-secondary transition-colors duration-300">
          © {new Date().getFullYear()} Anchor University SIWES Portal — All rights reserved.
        </footer>
      </div>
    </>
  );
}

export default HomePage;


