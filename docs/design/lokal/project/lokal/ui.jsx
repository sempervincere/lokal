// LOKAL UI v2 — Shared Components
const { useState, useEffect, useRef } = React;

const T = {
  p600:'#1B7A65',p500:'#2A9D82',p400:'#5FB8A3',p100:'#E6F3EF',
  e600:'#C17A5F',e500:'#D4917A',e100:'#F5E9E3',
  c50:'#FDFBF7',c100:'#FAF6ED',c200:'#F5F1EC',
  g500:'#6B6560',g700:'#4A4540',g900:'#1A1A1A',
  success:'#2A9D82',warning:'#D4A03D',danger:'#C45B4A',info:'#5B8BA0',
};

// ── Icons ────────────────────────────────────────────────────────────
function Icon({name,size=20,color=T.g700,sw=1.5,style={}}) {
  const p={fill:'none',stroke:color,strokeWidth:sw,strokeLinecap:'round',strokeLinejoin:'round'};
  const paths={
    MapPin:<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
    ShieldCheck:<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></>,
    MessageCircle:<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    TrendingDown:<><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>,
    TrendingUp:<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    BarChart2:<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    Users:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    DollarSign:<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    ChevronRight:<><polyline points="9 18 15 12 9 6"/></>,
    ChevronDown:<><polyline points="6 9 12 15 18 9"/></>,
    ArrowLeft:<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
    ArrowRight:<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    Send:<><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    Check:<><polyline points="20 6 9 17 4 12"/></>,
    X:<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    AlertTriangle:<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    Plus:<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    Trash2:<><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    Lock:<><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    Download:<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    Star:<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
    Clock:<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    Sparkles:<><path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5Z"/><path d="M19 3l.9 2.1L22 6l-2.1.9L19 9l-.9-2.1L16 6l2.1-.9Z"/></>,
    FileText:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
    Search:<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    Grid:<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    List:<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
    Wallet:<><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></>,
    CreditCard:<><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
    LogOut:<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    Globe:<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
    Settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    ChevronLeft:<><polyline points="15 18 9 12 15 6"/></>,
    Eye:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    Award:<><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>,
    Activity:<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={style} {...p}>{paths[name]}</svg>;
}

// ── Button ────────────────────────────────────────────────────────────
function Btn({children,variant='primary',size='md',onClick,disabled,icon,full,style={}}) {
  const [h,setH]=useState(false);
  const pad={sm:'7px 16px',md:'11px 22px',lg:'13px 32px'}[size];
  const fs={sm:13,md:14,lg:15}[size];
  const base={display:'inline-flex',alignItems:'center',justifyContent:'center',gap:7,borderRadius:9999,fontFamily:'inherit',fontWeight:600,cursor:disabled?'not-allowed':'pointer',border:'none',transition:'all 150ms ease-out',fontSize:fs,padding:pad,opacity:disabled?.45:1,width:full?'100%':'auto',letterSpacing:'-0.01em',...style};
  const v={
    primary:{background:h?T.p500:T.p600,color:T.c50,boxShadow:h?'0 4px 14px rgba(27,122,101,0.3)':'none'},
    secondary:{background:h?T.p100:'transparent',color:T.p600,border:`1.5px solid ${T.p600}`},
    accent:{background:h?T.e500:T.e600,color:T.c50,boxShadow:h?'0 4px 14px rgba(193,122,95,0.3)':'none'},
    ghost:{background:h?T.c200:'transparent',color:T.g700,borderRadius:10,padding:'8px 14px'},
    dark:{background:h?'#2a2a2a':T.g900,color:T.c50},
  }[variant]||{};
  return <button style={{...base,...v}} onClick={disabled?undefined:onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>{icon&&icon}{children}</button>;
}

// ── Badge ─────────────────────────────────────────────────────────────
function Badge({children,variant='active',style={}}) {
  const v={
    active:{bg:T.p100,color:T.p600},seeding:{bg:'#FEF3C7',color:'#92400E'},
    danger:{bg:'#FEE2E2',color:T.danger},warn:{bg:T.e100,color:T.e600},
    dark:{bg:T.g900,color:T.c50},neutral:{bg:T.c200,color:T.g500},
    info:{bg:'#EAF3F7',color:T.info},success:{bg:T.p100,color:T.p600},
  }[variant]||{bg:T.p100,color:T.p600};
  return <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',borderRadius:9999,fontSize:11,fontWeight:700,letterSpacing:'0.01em',background:v.bg,color:v.color,whiteSpace:'nowrap',...style}}>{children}</span>;
}

// ── Input ─────────────────────────────────────────────────────────────
function Input({placeholder,value,onChange,type='text',prefix,suffix,style={}}) {
  const [f,setF]=useState(false);
  return <div style={{display:'flex',alignItems:'center',gap:8,background:T.c50,border:`1.5px solid ${f?T.p500:T.c200}`,borderRadius:10,padding:'10px 14px',boxShadow:f?`0 0 0 3px ${T.p100}`:'none',transition:'all 150ms',...style}}>{prefix&&prefix}<input value={value} onChange={onChange} type={type} placeholder={placeholder} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{flex:1,border:'none',outline:'none',background:'transparent',fontFamily:'inherit',fontSize:14,color:T.g900}}/>{suffix&&suffix}</div>;
}

// ── Confidence Ring ───────────────────────────────────────────────────
function ConfRing({score,size=48}) {
  const r=(size-6)/2,circ=2*Math.PI*r,fill=(score/100)*circ;
  const c=score>=80?T.p600:score>=65?T.warning:T.danger;
  return <div style={{position:'relative',width:size,height:size,flexShrink:0}}>
    <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.c200} strokeWidth={3}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={3} strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"/>
    </svg>
    <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:c}}>{score}</div>
  </div>;
}

// ── Map Placeholder ───────────────────────────────────────────────────
function MapPlaceholder({accent='#E6F3EF',color=T.p400,height=120,label=''}) {
  const id='mp'+color.replace('#','');
  return <div style={{height,background:accent,borderRadius:12,overflow:'hidden',position:'relative',flexShrink:0}}>
    <svg width="100%" height={height} style={{position:'absolute',inset:0}}>
      <defs><pattern id={id} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><line x1="0" y1="24" x2="24" y2="0" stroke={color} strokeWidth="0.5" opacity="0.25"/></pattern></defs>
      <rect width="100%" height={height} fill={`url(#${id})`}/>
      <circle cx="50%" cy="50%" r="22" fill={color} opacity="0.12"/>
      <circle cx="50%" cy="50%" r="12" fill={color} opacity="0.2"/>
      <circle cx="50%" cy="50%" r="5" fill={color} opacity="0.7"/>
      {label&&<text x="50%" y="85%" textAnchor="middle" fontSize="10" fill={color} opacity="0.6" fontFamily="inherit">{label}</text>}
    </svg>
  </div>;
}

// ── Progress Bar ──────────────────────────────────────────────────────
function ProgressBar({value,max=100,color=T.p600,height=6,label}) {
  const pct=(value/max)*100;
  return <div>
    {label&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:5,fontSize:12,color:T.g500}}><span>{label}</span><span style={{fontWeight:700,color:T.g900}}>{value}/{max}</span></div>}
    <div style={{height,background:T.c200,borderRadius:9999,overflow:'hidden'}}>
      <div style={{height:'100%',width:`${pct}%`,background:color,borderRadius:9999,transition:'width 600ms ease'}}/>
    </div>
  </div>;
}

// ── Stat Card ─────────────────────────────────────────────────────────
function StatCard({icon,label,value,sub,color=T.p600,trend}) {
  return <div style={{background:T.c50,border:`1px solid ${T.c200}`,borderRadius:14,padding:'18px 20px',display:'flex',flexDirection:'column',gap:10}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div style={{width:36,height:36,borderRadius:10,background:T.p100,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <Icon name={icon} size={18} color={color}/>
      </div>
      {trend!=null&&<div style={{display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:700,color:trend>=0?T.success:T.danger}}>
        <Icon name={trend>=0?'TrendingUp':'TrendingDown'} size={12} color={trend>=0?T.success:T.danger}/>
        {Math.abs(trend)}%
      </div>}
    </div>
    <div>
      <div style={{fontSize:24,fontWeight:700,color:T.g900,letterSpacing:'-0.02em',fontVariantNumeric:'tabular-nums'}}>{value}</div>
      <div style={{fontSize:12,color:T.g500,marginTop:2}}>{label}</div>
      {sub&&<div style={{fontSize:11,color:T.g500,marginTop:4}}>{sub}</div>}
    </div>
  </div>;
}

// ── Section Expander ──────────────────────────────────────────────────
function SectionExpander({section,delay=0}) {
  const [open,setOpen]=useState(false);
  const [vis,setVis]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVis(true),delay);return()=>clearTimeout(t);},[]);
  return <div onClick={()=>setOpen(o=>!o)} style={{background:T.c100,border:`1px solid ${T.c200}`,borderRadius:12,overflow:'hidden',cursor:'pointer',opacity:vis?1:0,transform:vis?'none':'translateY(8px)',transition:`opacity 300ms ease ${delay}ms,transform 300ms ease ${delay}ms`,boxShadow:open?'0 2px 10px rgba(26,26,26,0.07)':'none'}}>
    <div style={{padding:'14px 16px',display:'flex',alignItems:'center',gap:12}}>
      <div style={{width:34,height:34,borderRadius:9,background:T.p100,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
        <Icon name={section.icon} size={16} color={T.p600}/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:600,color:T.g900}}>{section.title}</div>
        <div style={{fontSize:12,color:T.g500,marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{section.summary}</div>
      </div>
      <div style={{transform:open?'rotate(180deg)':'none',transition:'200ms',flexShrink:0}}>
        <Icon name="ChevronDown" size={16} color={T.g500}/>
      </div>
    </div>
    {open&&<div style={{padding:'0 16px 14px',borderTop:`1px solid ${T.c200}`}}>
      <ul style={{margin:'10px 0 0',padding:0,listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
        {section.points.map((p,i)=><li key={i} style={{display:'flex',gap:8,fontSize:13,color:T.g700,lineHeight:1.5}}>
          <div style={{width:4,height:4,borderRadius:'50%',background:T.p400,flexShrink:0,marginTop:7}}/>
          <span>{p}</span>
        </li>)}
      </ul>
    </div>}
  </div>;
}

// ── Steps Progress ────────────────────────────────────────────────────
function StepsProgress({steps,current}) {
  return <div style={{display:'flex',alignItems:'center'}}>
    {steps.map((s,i)=><React.Fragment key={i}>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,minWidth:60}}>
        <div style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:i<current?T.p600:i===current?T.p600:T.c200,color:i<=current?T.c50:T.g500,fontSize:12,fontWeight:700,transition:'all 250ms'}}>
          {i<current?<Icon name="Check" size={13} color={T.c50}/>:i+1}
        </div>
        <span style={{fontSize:10,color:i===current?T.p600:T.g500,fontWeight:i===current?600:400,whiteSpace:'nowrap'}}>{s}</span>
      </div>
      {i<steps.length-1&&<div style={{flex:1,height:2,background:i<current?T.p600:T.c200,margin:'0 4px 14px',transition:'all 250ms'}}/>}
    </React.Fragment>)}
  </div>;
}

Object.assign(window,{T,Icon,Btn,Badge,Input,ConfRing,MapPlaceholder,ProgressBar,StatCard,SectionExpander,StepsProgress});
