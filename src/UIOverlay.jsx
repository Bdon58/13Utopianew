import React from 'react';

const CHAPTERS = [
  { id: '', title: '', headline: '', desc: '' }, // Empty first frame
  { id: '01', title: 'ORIGIN', headline: 'FEEL THE FUTURE', desc: 'EMPHASIS ON HUMAN CONTACT\nBY CONVERTING IDEAS AND\nPROJECTS INTO FUTURE\nSUCCESS.' },
  { id: '02', title: 'INTRO', headline: 'AGNOSTIC FAITH', desc: 'EMPHASIS ON HUMAN CONTACT\nBY CONVERTING IDEAS AND\nPROJECTS INTO FUTURE AND\nSUCCESS.' },
  { id: '03', title: 'DIMENSION', headline: 'DIGITAL REALM', desc: 'EXPLORING NEW FRONTIERS\nIN THE VIRTUAL SPACE AND\nBEYOND.' },
  { id: '04', title: 'SYSTEMS', headline: 'CORE ARCHITECTURE', desc: 'BUILDING THE FOUNDATION\nFOR TOMORROW\'S DIGITAL\nEMPIRES.' }
];

export default function UIOverlay({ currentChapterIndex }) {
  const chapter = CHAPTERS[currentChapterIndex];

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '40px', color: '#d4b895', fontFamily: '"Space Mono", monospace', textTransform: 'uppercase', boxSizing: 'border-box' }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.5rem', lineHeight: '0.9', letterSpacing: '2px', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
          13<br/>UTOPIA
        </div>
        <div style={{ border: '1px solid rgba(212, 184, 149, 0.3)', borderRadius: '20px', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(5px)' }}>
          MENU <span style={{ width: '4px', height: '4px', backgroundColor: '#d4b895', borderRadius: '50%' }}></span>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        
        {/* Left Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '40px', paddingLeft: '10px' }}>
          {CHAPTERS.slice(1).map((ch, i) => {
            const actualIndex = i + 1;
            return (
              <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', opacity: currentChapterIndex === actualIndex ? 1 : 0.4, transition: 'opacity 0.5s ease', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ width: '4px', height: '4px', backgroundColor: '#d4b895', borderRadius: '50%' }}></span>
                  {currentChapterIndex === actualIndex && (
                    <span style={{ position: 'absolute', width: '16px', height: '16px', border: '1px solid #d4b895', borderRadius: '50%' }}></span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', letterSpacing: '2px' }}>
                  <span style={{ opacity: 0.7 }}>{ch.id}</span>
                  <span>{ch.title}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Right Text */}
        <div style={{ position: 'absolute', right: '15%', top: '40%', transform: 'translateY(-50%)', maxWidth: '400px' }}>
          {currentChapterIndex > 0 && (
            <div key={currentChapterIndex} style={{ animation: 'fadeInUp 1s ease-out forwards' }}>
              <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '6rem', lineHeight: '0.9', margin: '0 0 20px 0', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
                {chapter.headline}
              </h1>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.8', letterSpacing: '1px', whiteSpace: 'pre-line', textShadow: '0 2px 10px rgba(0,0,0,0.8)', opacity: 0.8 }}>
                {chapter.desc}
              </p>
              <div style={{ marginTop: '30px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', borderBottom: '1px solid rgba(212, 184, 149, 0.3)', paddingBottom: '5px' }}>
                EXPLORE THE PORTAL
                <div style={{ width: '12px', height: '20px', border: '1px solid #d4b895', borderRadius: '6px', display: 'flex', justifyContent: 'center', padding: '2px' }}>
                  <div style={{ width: '2px', height: '4px', backgroundColor: '#d4b895', borderRadius: '1px' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Portal Vertical Text */}
        <div style={{ position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', opacity: 0.7 }}>
           <span style={{ width: '1px', height: '100px', backgroundColor: 'rgba(212, 184, 149, 0.4)' }}></span>
           <span style={{ width: '3px', height: '3px', backgroundColor: '#d4b895', borderRadius: '50%' }}></span>
           <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '6px', fontSize: '0.75rem' }}>
             PORTAL
           </div>
           <span style={{ width: '3px', height: '3px', backgroundColor: '#d4b895', borderRadius: '50%' }}></span>
           <span style={{ width: '1px', height: '100px', backgroundColor: 'rgba(212, 184, 149, 0.4)' }}></span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '0.75rem', letterSpacing: '2px' }}>
          SOUND <span style={{ letterSpacing: '1px', fontSize: '0.6rem', opacity: 0.6 }}>||||||||</span>
        </div>
        <div style={{ position: 'absolute', left: '50%', bottom: '40px', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.8 }}>
          SCROLL TO DISCOVER
          <div style={{ width: '16px', height: '28px', border: '1px solid rgba(212, 184, 149, 0.6)', borderRadius: '8px', display: 'flex', justifyContent: 'center', padding: '4px' }}>
            <div style={{ width: '2px', height: '4px', backgroundColor: '#d4b895', borderRadius: '1px', animation: 'scrollAnim 2s infinite' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
