'use client'

import { useEffect, useState, useRef } from 'react'

const DEMO_KEY = 'hive_demo_field'

const DEMO_INPUT = "ICU nurse, night shift"

const DEMO_SCENARIO = {
  time: "3:20am",
  setup: "Bay 4. Mr Okafor, 67, post-CABG day 2.",
  situation: "His SpO₂ has dropped from 97% to 91% in the last 20 minutes. RR 24. He's restless but arousable. Drain output: 40ml/hr for two hours.",
  question: "What do you do first?",
  choices: [
    { label: "A", text: "Sit him up and apply high-flow O₂ via non-rebreather" },
    { label: "B", text: "Call the registrar immediately" },
    { label: "C", text: "Check drain output trend and check for tamponade signs" },
  ]
}

export default function AutoDemo() {
  const [phase, setPhase] = useState<'hidden'|'typing'|'scenario'|'fading'>('hidden')
  const [typedText, setTypedText] = useState('')
  const mounted = useRef(false)

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true
    if (typeof window === 'undefined') return
    if (localStorage.getItem(DEMO_KEY)) return

    const start = setTimeout(() => {
      setPhase('typing')
      let i = 0
      const ti = setInterval(() => {
        i++
        setTypedText(DEMO_INPUT.slice(0, i))
        if (i >= DEMO_INPUT.length) {
          clearInterval(ti)
          setTimeout(() => {
            setPhase('scenario')
            setTimeout(() => {
              setPhase('fading')
              setTimeout(() => { setPhase('hidden'); localStorage.setItem(DEMO_KEY,'1'); }, 600)
            }, 9000)
          }, 500)
        }
      }, 55)
    }, 1200)

    return () => clearTimeout(start)
  }, [])

  if (phase === 'hidden') return null

  const dismiss = () => {
    setPhase('fading')
    setTimeout(() => { setPhase('hidden'); localStorage.setItem(DEMO_KEY,'1'); }, 600)
  }

  return (
    <div
      style={{
        position:'fixed',inset:0,zIndex:100,
        background:'rgba(3,7,18,0.88)',
        backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',
        display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',
        opacity:phase==='fading'?0:1,transition:'opacity 0.6s ease',
        pointerEvents:phase==='fading'?'none':'auto',
      }}
      onClick={dismiss}
    >
      <div
        style={{width:'100%',maxWidth:'560px',display:'flex',flexDirection:'column',gap:'14px',animation:'demoIn 0.5s ease'}}
        onClick={e=>e.stopPropagation()}
      >
        <div style={{fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(251,191,36,0.45)',textAlign:'center',marginBottom:'2px'}}>
          Here's how it works
        </div>

        {/* Input */}
        <div style={{background:'rgba(17,24,39,0.95)',border:'1px solid rgba(107,114,128,0.4)',borderRadius:'10px',padding:'14px 16px',fontSize:'15px',color:'#f9fafb',minHeight:'54px'}}>
          {typedText || <span style={{color:'rgba(107,114,128,0.6)'}}>snake handler, anxious spouse, ICU nurse…</span>}
          {phase==='typing' && <span style={{display:'inline-block',width:'2px',height:'15px',background:'#fbbf24',marginLeft:'1px',verticalAlign:'middle',animation:'blink 0.7s step-end infinite'}}/>}
        </div>

        {/* Scenario */}
        {phase==='scenario' && (
          <div style={{background:'rgba(17,24,39,0.95)',border:'1px solid rgba(107,114,128,0.25)',borderRadius:'12px',padding:'20px 22px',animation:'demoIn 0.4s ease'}}>
            <div style={{fontSize:'11px',color:'rgba(251,191,36,0.5)',letterSpacing:'0.08em',marginBottom:'10px'}}>SCENARIO BEGINS</div>
            <div style={{fontSize:'13px',color:'rgba(156,163,175,0.7)',marginBottom:'6px'}}>{DEMO_SCENARIO.time} · {DEMO_SCENARIO.setup}</div>
            <div style={{fontSize:'15px',color:'#e5e7eb',lineHeight:'1.6',marginBottom:'14px'}}>{DEMO_SCENARIO.situation}</div>
            <div style={{fontSize:'15px',fontWeight:600,color:'#fbbf24',marginBottom:'14px'}}>{DEMO_SCENARIO.question}</div>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {DEMO_SCENARIO.choices.map(c=>(
                <div key={c.label} style={{background:'rgba(31,41,55,0.8)',border:'1px solid rgba(75,85,99,0.4)',borderRadius:'8px',padding:'10px 14px',fontSize:'14px',color:'#d1d5db',cursor:'default'}}>
                  <strong style={{color:'#9ca3af'}}>{c.label}.</strong> {c.text}
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={dismiss} style={{alignSelf:'center',background:'none',border:'1px solid rgba(107,114,128,0.3)',borderRadius:'100px',padding:'8px 24px',color:'rgba(107,114,128,0.6)',fontSize:'12px',fontFamily:'inherit',cursor:'pointer',transition:'all 0.2s'}}>
          Got it — let me try
        </button>
      </div>
      <style>{`@keyframes demoIn{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  )
}
