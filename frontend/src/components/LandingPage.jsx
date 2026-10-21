import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ChevronDown, 
  ArrowRight, 
  CheckCircle, 
  Radio, 
  Activity, 
  Cpu, 
  Video, 
  Play, 
  Maximize2, 
  Zap, 
  ExternalLink 
} from 'lucide-react';

export default function LandingPage({ onLaunchDashboard }) {
  // Available reference videos
  const videos = [
    { id: 1, name: 'Highway Night Surveillance', src: '/videos/gettyimages-871539966-640_adpp.mp4' },
    { id: 2, name: 'Expressway Daytime Tracking', src: '/videos/gettyimages-931707818-640_adpp.mp4' }
  ];

  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  // Live simulation plate cycles
  const simulatedDetections = [
    {
      cam: 'CAM 04 · Main Gate',
      country: 'GB',
      plate: 'MT70 VRC',
      confidence: 97.3,
      direction: 'OUT →',
      speed: '18 mph',
      action: 'Avg speed logged · Service Road',
      isHotlist: false
    },
    {
      cam: 'CAM 01 · Hazratganj Express',
      country: 'IND',
      plate: 'UP32 AB 1234',
      confidence: 98.8,
      direction: 'INBOUND →',
      speed: '58 km/h',
      action: 'HOTLIST MATCH · Siren Triggered',
      isHotlist: true
    },
    {
      cam: 'CAM 02 · Charbagh Terminal',
      country: 'IND',
      plate: 'KA01 AB 1234',
      confidence: 96.4,
      direction: 'INBOUND →',
      speed: '34 km/h',
      action: 'Watchlist Verified · Access Permitted',
      isHotlist: false
    },
    {
      cam: 'CAM 03 · Alambagh Bypass',
      country: 'GB',
      plate: 'LD68 XKY',
      confidence: 99.1,
      direction: 'OUT →',
      speed: '24 mph',
      action: 'Zone Occupancy Logged',
      isHotlist: false
    }
  ];

  const [currentDetectionIndex, setCurrentDetectionIndex] = useState(0);

  // Cycle detections automatically every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDetectionIndex((prev) => (prev + 1) % simulatedDetections.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const activeDetection = simulatedDetections[currentDetectionIndex];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#131726',
      color: '#ffffff',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden'
    }}>
      
      {/* 1. TOP NAVBAR (MATCHING REFERENCE STRUCTURE WITH DASHBOARD THEME) */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        backgroundColor: 'rgba(27, 32, 52, 0.88)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(40, 48, 76, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 36px',
        zIndex: 9999
      }}>
        {/* BRAND LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#f59e0b',
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)'
          }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#1b2034', borderRadius: '2px' }} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px', color: '#ffffff', lineHeight: 1 }}>
              ARGUS<span style={{ color: '#f59e0b' }}>.</span>
            </div>
            <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: '#8e9ab0' }}>
              ANPR LIVE
            </div>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', fontSize: '13px', color: '#cbd5e1', fontWeight: '500' }}>
          <a href="#capabilities" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f59e0b'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>Capabilities</a>
          <a href="#how-it-works" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f59e0b'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>How it works</a>
          <a href="#zones" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f59e0b'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>Zones & speed</a>
          <a href="#use-cases" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f59e0b'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>Use cases</a>
          <a href="#hardware" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f59e0b'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>Hardware Relay</a>
          
          <button 
            onClick={onLaunchDashboard} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#f59e0b', 
              fontWeight: '600', 
              fontSize: '13px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px' 
            }}
          >
            Live Command Center <ExternalLink size={12} />
          </button>
        </div>

        {/* RIGHT ACTION BUTTONS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onLaunchDashboard}
            style={{
              background: 'none',
              border: 'none',
              color: '#cbd5e1',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '8px 12px'
            }}
          >
            Sign in
          </button>

          <button 
            onClick={onLaunchDashboard}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '9px 20px',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(245, 158, 11, 0.4)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(245, 158, 11, 0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 18px rgba(245, 158, 11, 0.4)';
            }}
          >
            Launch Command Center
          </button>

          {/* LANGUAGE PILL */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#1b2034',
            border: '1px solid #28304c',
            borderRadius: '6px',
            padding: '7px 12px',
            fontSize: '12px',
            color: '#8e9ab0',
            cursor: 'pointer'
          }}>
            <span>English</span>
            <ChevronDown size={13} />
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION WITH AMBIENT VIDEO BACKGROUND (MATCHING DASHBOARD PALETTE) */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '110px 48px 60px 48px',
        overflow: 'hidden'
      }}>
        
        {/* HTML5 VIDEO BACKGROUND (AUTOPLAYING LOOP - HIGH VISIBILITY) */}
        <video 
          key={videos[activeVideoIndex].src}
          autoPlay 
          loop 
          muted 
          playsInline 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            transform: 'translate(-50%, -50%)',
            objectFit: 'cover',
            zIndex: 1,
            opacity: 0.68,
            filter: 'brightness(0.95) contrast(1.15) saturate(1.2)'
          }}
        >
          <source src={videos[activeVideoIndex].src} type="video/mp4" />
        </video>

        {/* CINEMATIC THEME GRADIENT OVERLAY (BALANCED TO KEEP VIDEO CLEARLY VISIBLE) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(19, 23, 38, 0.78) 0%, rgba(19, 23, 38, 0.42) 50%, rgba(19, 23, 38, 0.80) 100%)',
          zIndex: 2,
          pointerEvents: 'none'
        }} />

        {/* AMBIENT RADIAL LIGHTING ACCENT (AMBER GLOW) */}
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.16) 0%, rgba(240, 90, 62, 0.08) 50%, rgba(0,0,0,0) 75%)',
          zIndex: 2,
          pointerEvents: 'none'
        }} />

        {/* HERO CONTENT CONTAINER */}
        <div style={{
          maxWidth: '1360px',
          width: '100%',
          margin: '0 auto',
          position: 'relative',
          zIndex: 3,
          display: 'grid',
          gridTemplateColumns: '1.15fr 0.85fr',
          gap: '50px',
          alignItems: 'center'
        }}>
          
          {/* LEFT COLUMN: HEADLINE, DESCRIPTION, CTAS */}
          <div>
            
            {/* TAGLINE PILL */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(27, 32, 52, 0.92)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '28px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)'
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
              <span>Part of the ARGUS Defense & Traffic Intelligence Grid.</span>
            </div>

            {/* MAIN HEADLINE */}
            <h1 style={{
              fontSize: '66px',
              fontWeight: '900',
              lineHeight: '1.08',
              letterSpacing: '-1.5px',
              margin: '0 0 24px 0',
              color: '#ffffff',
              textShadow: '0 4px 24px rgba(0, 0, 0, 0.9)'
            }}>
              Every vehicle.<br />
              Every zone.<br />
              <span style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #f05a3e 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                textShadow: '0 4px 24px rgba(245, 158, 11, 0.3)'
              }}>
                In real time.
              </span>
            </h1>

            {/* PARAGRAPH SUMMARY */}
            <p style={{
              fontSize: '16px',
              lineHeight: '1.65',
              color: '#cbd5e1',
              maxWidth: '560px',
              margin: '0 0 34px 0',
              fontWeight: '400',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.85)'
            }}>
              ARGUS turns any traffic camera into a live vehicle-intelligence network — reading plates the instant they pass, tracking movement across all your zones, enforcing hotlists and firing automated actions.
            </p>

            {/* CTAS (SWITCH FEED REMOVED, HIGH VISIBILITY PRIMARY CTA) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px' }}>
              <button 
                onClick={onLaunchDashboard}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '15px 32px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 6px 26px rgba(245, 158, 11, 0.5)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 32px rgba(245, 158, 11, 0.65)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 26px rgba(245, 158, 11, 0.5)';
                }}
              >
                <span>Launch Command Center</span>
                <ArrowRight size={18} />
              </button>

              <a 
                href="#capabilities"
                style={{
                  backgroundColor: 'rgba(27, 32, 52, 0.88)',
                  border: '1px solid #3b4564',
                  color: '#cbd5e1',
                  padding: '15px 22px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '14px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#f59e0b';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.backgroundColor = '#1f253c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#3b4564';
                  e.currentTarget.style.color = '#cbd5e1';
                  e.currentTarget.style.backgroundColor = 'rgba(27, 32, 52, 0.88)';
                }}
              >
                <span>System Architecture ↓</span>
              </a>
            </div>

            {/* FEATURE BULLETS BAR */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              fontSize: '12px',
              color: '#8e9ab0',
              fontWeight: '500'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} color="#f59e0b" /> All major camera brands
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} color="#f59e0b" /> Real-time OCR detection
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} color="#f59e0b" /> Zone-accurate routing
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} color="#f59e0b" /> Multi-tenant by design
              </span>
            </div>

          </div>

          {/* RIGHT COLUMN: THE EXACT LIVE OCR DETECTION CARD (MATCHING THE SCREENSHOT) */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: 'rgba(27, 32, 52, 0.94)',
              border: '1px solid #3b4564',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(245, 158, 11, 0.2)',
              padding: '24px',
              position: 'relative',
              backdropFilter: 'blur(10px)'
            }}>
              
              {/* CARD HEADER BAR */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
                  <span>{activeDetection.cam}</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#f05a3e'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#f05a3e',
                    boxShadow: '0 0 10px #f05a3e',
                    animation: 'radarPulse 1.5s infinite ease-out'
                  }} />
                  <span>LIVE</span>
                </div>
              </div>

              {/* CENTRAL LICENSE PLATE CROP BOX WITH CORNER SCAN BRACKETS */}
              <div style={{
                position: 'relative',
                padding: '20px 24px',
                backgroundColor: '#131726',
                borderRadius: '8px',
                border: '1px solid #28304c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '26px'
              }}>
                {/* 4 SCANNER CORNER BRACKETS IN THEME AMBER */}
                <div style={{ position: 'absolute', top: '8px', left: '8px', width: '12px', height: '12px', borderTop: '2px solid #f59e0b', borderLeft: '2px solid #f59e0b' }} />
                <div style={{ position: 'absolute', top: '8px', right: '8px', width: '12px', height: '12px', borderTop: '2px solid #f59e0b', borderRight: '2px solid #f59e0b' }} />
                <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '12px', height: '12px', borderBottom: '2px solid #f59e0b', borderLeft: '2px solid #f59e0b' }} />
                <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '12px', height: '12px', borderBottom: '2px solid #f59e0b', borderRight: '2px solid #f59e0b' }} />

                {/* THE HIGH-CONTRAST LICENSE PLATE */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ffd000',
                  color: '#000000',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
                  border: '2px solid #ffffff'
                }}>
                  {/* Left Country Strip */}
                  <div style={{
                    backgroundColor: '#003399',
                    color: '#ffffff',
                    padding: '12px 8px',
                    fontSize: '11px',
                    fontWeight: '800',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span>{activeDetection.country}</span>
                  </div>

                  {/* Plate Digits */}
                  <div style={{
                    padding: '10px 24px',
                    fontSize: '28px',
                    fontWeight: '900',
                    letterSpacing: '3px',
                    fontFamily: "'Courier New', monospace"
                  }}>
                    {activeDetection.plate}
                  </div>
                </div>

              </div>

              {/* DETECTION METRICS BREAKDOWN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
                
                {/* PLATE ROW */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8e9ab0', fontWeight: '600' }}>PLATE</span>
                  <span style={{ color: '#ffffff', fontWeight: '800', fontFamily: 'monospace', fontSize: '13px' }}>
                    {activeDetection.plate}
                  </span>
                </div>

                {/* CONFIDENCE ROW */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8e9ab0', fontWeight: '600' }}>CONFIDENCE</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '80px', height: '6px', backgroundColor: '#131726', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${activeDetection.confidence}%`,
                        height: '100%',
                        background: 'linear-gradient(to right, #f59e0b, #10b981)',
                        borderRadius: '3px'
                      }} />
                    </div>
                    <span style={{ color: '#ffffff', fontWeight: '700' }}>{activeDetection.confidence}%</span>
                  </div>
                </div>

                {/* DIRECTION ROW */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8e9ab0', fontWeight: '600' }}>DIRECTION</span>
                  <span style={{ color: '#cbd5e1', fontWeight: '700' }}>{activeDetection.direction}</span>
                </div>

                {/* SPEED ROW */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8e9ab0', fontWeight: '600' }}>SPEED</span>
                  <span style={{ color: '#ffffff', fontWeight: '700' }}>{activeDetection.speed}</span>
                </div>

                {/* ACTION STATUS PILL */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px' }}>
                  <span style={{ color: '#8e9ab0', fontWeight: '600' }}>ACTION</span>
                  <div style={{
                    backgroundColor: activeDetection.isHotlist ? 'rgba(240, 90, 62, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                    border: activeDetection.isHotlist ? '1px solid #f05a3e' : '1px solid #f59e0b',
                    color: activeDetection.isHotlist ? '#f05a3e' : '#f59e0b',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    {activeDetection.action}
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </section>

      {/* 3. CAPABILITIES & ARCHITECTURE FEATURE CARDS (THEMED FOR COMMAND CENTER) */}
      <section id="capabilities" style={{
        padding: '90px 48px',
        backgroundColor: '#131726',
        borderTop: '1px solid #28304c'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
              Built for Law Enforcement & Smart City Operations
            </div>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
              End-to-End Tactical Intelligence
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
            
            {/* CARD 1 */}
            <div style={{
              backgroundColor: '#1b2034',
              border: '1px solid #28304c',
              borderRadius: '10px',
              padding: '30px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#f59e0b'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#28304c'; }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Cpu size={22} color="#f59e0b" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: '0 0 10px 0' }}>Edge AI Brain Ingestion</h3>
              <p style={{ color: '#8e9ab0', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                High-speed OCR reading validated at the camera node (Laptop 1 Edge). Dispatches instant JSON telemetry over LAN with sub-second response times.
              </p>
            </div>

            {/* CARD 2 */}
            <div style={{
              backgroundColor: '#1b2034',
              border: '1px solid #28304c',
              borderRadius: '10px',
              padding: '30px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#f05a3e'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#28304c'; }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'rgba(240, 90, 62, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Shield size={22} color="#f05a3e" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: '0 0 10px 0' }}>Watchlist & Police FIR Audit</h3>
              <p style={{ color: '#8e9ab0', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                Real-time hotlist matching in SQLite single-transactions. Auto-creates court-admissible audit trails, IO case records, and PDF evidence exports.
              </p>
            </div>

            {/* CARD 3 */}
            <div style={{
              backgroundColor: '#1b2034',
              border: '1px solid #28304c',
              borderRadius: '10px',
              padding: '30px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#10b981'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#28304c'; }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Zap size={22} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: '0 0 10px 0' }}>Hardware Gate & Siren Relay</h3>
              <p style={{ color: '#8e9ab0', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                Instant USB serial trip to Arduino microcontrollers to close barrier gates, sound physical sirens, or trigger road barriers on confirmed hotlist match.
              </p>
            </div>

          </div>

          {/* BOTTOM BANNER TO JUMP TO DASHBOARD */}
          <div style={{
            marginTop: '60px',
            background: 'linear-gradient(135deg, #1b2034 0%, #1f253c 100%)',
            border: '1px solid #28304c',
            borderRadius: '12px',
            padding: '36px 44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 12px 36px rgba(0,0,0,0.4)'
          }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>
                Ready to monitor live traffic feeds?
              </div>
              <div style={{ fontSize: '13px', color: '#8e9ab0' }}>
                Open the ARGUS Command Center dashboard to access live Leaflet GPS trajectories and camera feeds.
              </div>
            </div>

            <button 
              onClick={onLaunchDashboard}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 18px rgba(245, 158, 11, 0.4)'
              }}
            >
              <span>Launch Dashboard</span>
              <ArrowRight size={15} />
            </button>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: '#0f121d',
        borderTop: '1px solid #28304c',
        padding: '28px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#64748b'
      }}>
        <div>
          © 2026 ARGUS Command Center. High-Velocity Optical Character Recognition & Surveillance Grid.
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>DPDP Act 2023 Compliant</span>
          <span>•</span>
          <span>Apple M2 Optimized</span>
          <span>•</span>
          <span style={{ color: '#10b981', fontWeight: '600' }}>System: Operational</span>
        </div>
      </footer>

    </div>
  );
}

