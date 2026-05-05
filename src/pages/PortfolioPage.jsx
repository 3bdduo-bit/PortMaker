import{useEffect,useRef,useState,useCallback}from'react'
import s from'./PortfolioPage.module.css'

const THEMES={
  violet: {cls:'',       a1:'#8b5cf6',a2:'#38bdf8'},
  rose:   {cls:s.rose,   a1:'#f43f5e',a2:'#fb923c'},
  emerald:{cls:s.emerald,a1:'#10b981',a2:'#38bdf8'},
  gold:   {cls:s.gold,   a1:'#f59e0b',a2:'#ec4899'},
  midnight:{cls:s.midnight,a1:'#3b82f6',a2:'#8b5cf6'},
  white:  {cls:s.white,  a1:'#8b5cf6',a2:'#38bdf8'},
}

/* ── Animated counter hook ─── */
function useCounter(target,active){
  const[val,setVal]=useState(0)
  useEffect(()=>{
    if(!active||!target)return
    const n=Number(target)
    if(!n)return
    let start=0
    const step=Math.ceil(n/60)
    const timer=setInterval(()=>{
      start=Math.min(start+step,n)
      setVal(start)
      if(start>=n)clearInterval(timer)
    },20)
    return()=>clearInterval(timer)
  },[target,active])
  return val
}

/* ── Section component ─── */
function Sec({id,label,children,className=''}){
  const ref=useRef(null)
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)e.target.classList.add(s.visible)},{threshold:.12})
    if(ref.current)obs.observe(ref.current)
    return()=>obs.disconnect()
  },[])
  return(
    <section id={id} ref={ref} className={`${s.section} ${className}`}>
      {label&&(
        <div className={s.secHeader}>
          <div className={s.secLine}/>
          <span className={s.secLabel}>{label}</span>
          <div className={s.secLine}/>
        </div>
      )}
      {children}
    </section>
  )
}

/* ── Stats counter component ─── */
function StatItem({value,suffix='',label,active}){
  const n=useCounter(value,active)
  return(
    <div className={s.statItem}>
      <div className={s.statNum}>{n}{suffix}</div>
      <div className={s.statLabel}>{label}</div>
    </div>
  )
}

/* ── Testimonials carousel ─── */
function Testimonials({items}){
  const[idx,setIdx]=useState(0)
  const prev=()=>setIdx(i=>(i-1+items.length)%items.length)
  const next=()=>setIdx(i=>(i+1)%items.length)
  const t=items[idx]
  return(
    <div className={s.tesWrap}>
      <div className={s.tesCard}>
        <div className={s.tesQuote}>"</div>
        <p className={s.tesText}>{t.text}</p>
        <div className={s.tesAuthor}>
          {t.avatar
            ?<img src={t.avatar} alt={t.name} className={s.tesAvatar}/>
            :<div className={s.tesAvatarFb}>{t.name[0]}</div>}
          <div>
            <div className={s.tesName}>{t.name}</div>
            {t.role&&<div className={s.tesRole}>{t.role}</div>}
          </div>
        </div>
      </div>
      {items.length>1&&(
        <div className={s.tesNav}>
          <button onClick={prev} className={s.tesBtn}>‹</button>
          <div className={s.tesDots}>
            {items.map((_,i)=>(
              <button key={i} className={`${s.tesDot} ${i===idx?s.tesDotActive:''}`} onClick={()=>setIdx(i)}/>
            ))}
          </div>
          <button onClick={next} className={s.tesBtn}>›</button>
        </div>
      )}
    </div>
  )
}

export default function PortfolioPage({data}){
  const[scrollPct,setScrollPct]=useState(0)
  const[showTop,setShowTop]=useState(false)
  const[statsActive,setStatsActive]=useState(false)
  const statsRef=useRef(null)
  const makerUrl=window.location.origin+window.location.pathname

  /* Scroll progress + back-to-top */
  useEffect(()=>{
    const onScroll=()=>{
      const doc=document.documentElement
      const pct=(doc.scrollTop/(doc.scrollHeight-doc.clientHeight))*100
      setScrollPct(pct)
      setShowTop(doc.scrollTop>400)
    }
    window.addEventListener('scroll',onScroll,{passive:true})
    return()=>window.removeEventListener('scroll',onScroll)
  },[])

  /* Stats observer */
  useEffect(()=>{
    if(!statsRef.current)return
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)setStatsActive(true)},{threshold:.3})
    obs.observe(statsRef.current)
    return()=>obs.disconnect()
  },[])

  /* Document title */
  useEffect(()=>{
    document.title=data?`${data.name} – Portfolio`:'Portfolio Not Found'
  },[data])

  if(!data){
    return(
      <div className={s.page}>
        <div className={s.errorWrap}>
          <div className={s.errorIcon}>🔗</div>
          <h2>No Portfolio Data Found</h2>
          <p>This link doesn't contain portfolio data. Create your own!</p>
          <a href={makerUrl} className={s.backBtn}>Build My Portfolio</a>
        </div>
      </div>
    )
  }

  const t=THEMES[data.theme]||THEMES.violet
  const hasStats=data.stats&&Object.values(data.stats).some(v=>v)
  const hasSocials=data.links&&Object.values(data.links).some(v=>v)
  const waLink=data.whatsapp?`https://wa.me/${data.whatsapp.replace(/\D/g,'')}?text=Hi%2C%20I%20found%20your%20portfolio!`:null

  const socials=[
    data.links?.github    &&{href:data.links.github,   icon:'🐙',label:'GitHub'},
    data.links?.linkedin  &&{href:data.links.linkedin, icon:'💼',label:'LinkedIn'},
    data.links?.twitter   &&{href:data.links.twitter,  icon:'🐦',label:'Twitter'},
    data.links?.website   &&{href:data.links.website,  icon:'🌐',label:'Website'},
    data.links?.instagram &&{href:data.links.instagram,icon:'📸',label:'Instagram'},
    data.links?.youtube   &&{href:data.links.youtube,  icon:'▶️',label:'YouTube'},
  ].filter(Boolean)

  /* Nav sections */
  const navSections=[
    hasStats&&{id:'stats',label:'Stats'},
    data.skills?.length&&{id:'skills',label:'Skills'},
    data.experiences?.length&&{id:'experience',label:'Experience'},
    data.educations?.length&&{id:'education',label:'Education'},
    data.projects?.length&&{id:'projects',label:'Projects'},
    data.services?.length&&{id:'services',label:'Services'},
    data.testimonials?.length&&{id:'testimonials',label:'Reviews'},
  ].filter(Boolean)

  return(
    <div className={`${s.page} ${t.cls}`}>
      {/* SCROLL PROGRESS */}
      <div className={s.progressBar} style={{width:`${scrollPct}%`}}/>

      {/* STICKY NAV */}
      <nav className={s.nav}>
        <div className={s.navInner}>
          <div className={s.navLinks}>
            {navSections.map(sec=>(
              <a key={sec.id} href={`#${sec.id}`} className={s.navLink}>{sec.label}</a>
            ))}
          </div>
          <div className={s.navActions}>
            {data.resumeUrl&&(
              <a href={data.resumeUrl} target="_blank" rel="noopener noreferrer" className={s.navCv}>⬇ Resume</a>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header id="hero" className={s.hero}>
        <div className={s.heroBg}/>
        <div className={s.heroInner}>
          {data.avatar
            ?<div className={s.avatarRing}><img src={data.avatar} alt={data.name} className={s.avatarImg}/></div>
            :<div className={s.avatarRing}><div className={s.avatarFb}>{data.name[0]}</div></div>}
          <h1 className={s.heroName}>{data.name}</h1>
          {data.title&&<p className={s.jobTitle}>{data.title}</p>}
          {(data.location||data.email)&&(
            <div className={s.metaRow}>
              {data.location&&<span className={s.metaPill}>📍 {data.location}</span>}
              {data.email&&<span className={s.metaPill}>✉️ {data.email}</span>}
            </div>
          )}
          {data.bio&&<p className={s.bio}>{data.bio}</p>}
          <div className={s.heroButtons}>
            {waLink&&<a href={waLink} target="_blank" rel="noopener noreferrer" className={s.waBtn}>💬 WhatsApp Me</a>}
            {data.email&&<a href={`mailto:${data.email}`} className={s.emailBtnHero}>✉️ Email Me</a>}
            {data.resumeUrl&&<a href={data.resumeUrl} target="_blank" rel="noopener noreferrer" className={s.cvBtnHero}>⬇ Download CV</a>}
          </div>
          {socials.length>0&&(
            <div className={s.socialRow}>
              {socials.map(sc=>(
                <a key={sc.label} href={sc.href} target="_blank" rel="noopener noreferrer" className={s.socialBtn}>
                  <span>{sc.icon}</span>{sc.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className={s.container}>
        {/* STATS */}
        {hasStats&&(
          <div ref={statsRef} id="stats">
            <Sec label="Stats">
              <div className={s.statsGrid}>
                {data.stats.yearsExp   &&<StatItem value={data.stats.yearsExp}    suffix="+" label="Years of Experience" active={statsActive}/>}
                {data.stats.projects   &&<StatItem value={data.stats.projects}    suffix="+" label="Projects Completed"  active={statsActive}/>}
                {data.stats.clients    &&<StatItem value={data.stats.clients}     suffix="+" label="Happy Clients"       active={statsActive}/>}
                {data.stats.satisfaction&&<StatItem value={data.stats.satisfaction} suffix="%" label="Satisfaction Rate" active={statsActive}/>}
              </div>
            </Sec>
          </div>
        )}

        {/* SKILLS */}
        {data.skills?.length>0&&(
          <Sec id="skills" label="Skills">
            <div className={s.skillsGrid}>
              {data.skills.map((sk,i)=><span key={i} className={s.skillTag}>{sk}</span>)}
            </div>
          </Sec>
        )}

        {/* EXPERIENCE */}
        {data.experiences?.length>0&&(
          <Sec id="experience" label="Experience">
            <div className={s.timeline}>
              {data.experiences.map((ex,i)=>(
                <div key={i} className={s.tlItem}>
                  <div className={s.tlDot}/>
                  <div className={s.tlContent}>
                    <div className={s.tlHeader}>
                      <span className={s.tlRole}>{ex.role}</span>
                      {ex.period&&<span className={s.tlPeriod}>{ex.period}</span>}
                    </div>
                    {ex.company&&<div className={s.tlCompany}>{ex.company}</div>}
                    {ex.desc&&<p className={s.tlDesc}>{ex.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Sec>
        )}

        {/* EDUCATION */}
        {data.educations?.length>0&&(
          <Sec id="education" label="Education">
            <div className={s.timeline}>
              {data.educations.map((ed,i)=>(
                <div key={i} className={s.tlItem}>
                  <div className={s.tlDot}/>
                  <div className={s.tlContent}>
                    <div className={s.tlHeader}>
                      <span className={s.tlRole}>{ed.degree}</span>
                      {ed.year&&<span className={s.tlPeriod}>{ed.year}</span>}
                    </div>
                    {ed.institution&&<div className={s.tlCompany}>{ed.institution}</div>}
                    {ed.desc&&<p className={s.tlDesc}>{ed.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Sec>
        )}

        {/* PROJECTS */}
        {data.projects?.length>0&&(
          <Sec id="projects" label="Projects">
            {data.projects.filter(p=>p.featured).length>0&&(
              <>
                <div className={s.projSubLabel}>⭐ Featured</div>
                <div className={s.projsGrid}>
                  {data.projects.filter(p=>p.featured).map((p,i)=>(
                    <ProjCard key={i} p={p}/>
                  ))}
                </div>
                {data.projects.filter(p=>!p.featured).length>0&&(
                  <div className={s.projSubLabel} style={{marginTop:'1.5rem'}}>Other Projects</div>
                )}
              </>
            )}
            <div className={s.projsGrid}>
              {data.projects.filter(p=>!p.featured).map((p,i)=>(
                <ProjCard key={i} p={p}/>
              ))}
            </div>
          </Sec>
        )}

        {/* SERVICES */}
        {data.services?.length>0&&(
          <Sec id="services" label="Services">
            <div className={s.servicesGrid}>
              {data.services.map((sv,i)=>(
                <div key={i} className={s.serviceCard}>
                  <div className={s.serviceIcon}>{sv.icon}</div>
                  <h3 className={s.serviceTitle}>{sv.title}</h3>
                  {sv.desc&&<p className={s.serviceDesc}>{sv.desc}</p>}
                </div>
              ))}
            </div>
          </Sec>
        )}

        {/* TESTIMONIALS */}
        {data.testimonials?.length>0&&(
          <Sec id="testimonials" label="Testimonials">
            <Testimonials items={data.testimonials}/>
          </Sec>
        )}

        {/* CONTACT */}
        {(data.email||waLink||hasSocials)&&(
          <Sec id="contact" label="Contact">
            <div className={s.contactCard}>
              <h3>Let's Work Together</h3>
              <p>Have a project in mind? I'd love to hear from you!</p>
              <div className={s.contactBtns}>
                {data.email&&<a href={`mailto:${data.email}`} className={s.emailBtn}>✉️ Send Email</a>}
                {waLink&&<a href={waLink} target="_blank" rel="noopener noreferrer" className={s.waContactBtn}>💬 WhatsApp</a>}
                {data.resumeUrl&&<a href={data.resumeUrl} target="_blank" rel="noopener noreferrer" className={s.cvContactBtn}>⬇ Download CV</a>}
              </div>
              {socials.length>0&&(
                <div className={s.socialRow} style={{marginTop:'1.5rem'}}>
                  {socials.map(sc=>(
                    <a key={sc.label} href={sc.href} target="_blank" rel="noopener noreferrer" className={s.socialBtn}>
                      <span>{sc.icon}</span>{sc.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Sec>
        )}
      </div>

      <footer className={s.footer}>
        Built with Portfolio Maker · {data.name} © {new Date().getFullYear()}
      </footer>

    </div>
  )
}

/* ── Project card ─── */
function ProjCard({p}){
  return(
    <div className={`${s.projCard} ${p.featured?s.projFeatured:''}`}>
      {p.featured&&<div className={s.featuredBadge}>⭐ Featured</div>}
      <div className={s.projName}>{p.name}</div>
      {p.desc&&<p className={s.projDesc}>{p.desc}</p>}
      {p.tech&&(
        <div className={s.projTech}>
          {p.tech.split(',').map((ch,j)=><span key={j} className={s.techChip}>{ch.trim()}</span>)}
        </div>
      )}
      <div className={s.projLinks}>
        {p.url&&<a href={p.url} target="_blank" rel="noopener noreferrer" className={s.projLink}>🔗 Live Demo</a>}
        {p.github&&<a href={p.github} target="_blank" rel="noopener noreferrer" className={s.projLinkGh}>⌥ GitHub</a>}
      </div>
    </div>
  )
}
