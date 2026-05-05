import{useState,useRef,useCallback}from'react'
import{compressToEncodedURIComponent}from'lz-string'
import s from'./MakerPage.module.css'

const THEMES=[
  {id:'violet',label:'Violet Cyber',   preview:'linear-gradient(135deg,#8b5cf6,#38bdf8)'},
  {id:'rose',  label:'Rose Fire',      preview:'linear-gradient(135deg,#f43f5e,#fb923c)'},
  {id:'emerald',label:'Emerald Ocean', preview:'linear-gradient(135deg,#10b981,#38bdf8)'},
  {id:'gold',  label:'Gold Sunset',    preview:'linear-gradient(135deg,#f59e0b,#ec4899)'},
  {id:'midnight',label:'Midnight Blue',preview:'linear-gradient(135deg,#3b82f6,#8b5cf6)'},
  {id:'white', label:'Clean Light',    preview:'linear-gradient(135deg,#f1f5f9,#e2e8f0)',border:'1px solid #cbd5e1'},
]
const EMOJIS=['🎨','💻','🚀','⚡','🛠️','📱','🌐','📊','✍️','🔧','💡','🎯','📈','🤝','🔒','☁️','🎤','📷','🎵','🏆','🖥️','📐','🧩','🔍']
let _id=0
const mkProj=()=>({id:_id++,name:'',url:'',github:'',desc:'',tech:'',image:'',featured:false})
const mkExp =()=>({id:_id++,role:'',company:'',period:'',desc:''})
const mkEdu =()=>({id:_id++,degree:'',institution:'',year:'',desc:''})
const mkSvc =()=>({id:_id++,icon:'⚡',title:'',desc:''})
const mkTes =()=>({id:_id++,name:'',role:'',text:'',avatar:''})
const slugify=v=>v.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||'portfolio'
const isDataUrl=v=>typeof v==='string'&&v.startsWith('data:')

function Field({label,hint,children}){
  return(
    <div className={s.field}>
      <label>{label}</label>
      {children}
      {hint&&<small className={s.hint}>{hint}</small>}
    </div>
  )
}
function Card({icon,title,children}){
  return(
    <section className={s.card}>
      <div className={s.sectionTitle}><span>{icon}</span>{title}</div>
      {children}
    </section>
  )
}

export default function MakerPage(){
  const[name,setName]=useState('')
  const[jobTitle,setJobTitle]=useState('')
  const[bio,setBio]=useState('')
  const[location,setLocation]=useState('')
  const[email,setEmail]=useState('')
  const[avatar,setAvatar]=useState('')
  const[avatarOk,setAvatarOk]=useState(false)
  const[whatsapp,setWhatsapp]=useState('')
  const[resumeUrl,setResumeUrl]=useState('')
  const[cvFile,setCvFile]=useState(null)
  const[upwork,setUpwork]=useState('')
  const[freelancer,setFreelancer]=useState('')
  const[mostaql,setMostaql]=useState('')
  const[fiveamsat,setFiveamsat]=useState('')
  const[yearsExp,setYearsExp]=useState('')
  const[projCount,setProjCount]=useState('')
  const[clients,setClients]=useState('')
  const[satisfaction,setSatisfaction]=useState('')
  const[skills,setSkills]=useState([])
  const[skillInput,setSkillInput]=useState('')
  const skillRef=useRef(null)
  const[projects,setProjects]=useState([mkProj()])
  const[experiences,setExperiences]=useState([mkExp()])
  const[educations,setEducations]=useState([mkEdu()])
  const[services,setServices]=useState([])
  const[testimonials,setTestimonials]=useState([])
  const[github,setGithub]=useState('')
  const[linkedin,setLinkedin]=useState('')
  const[twitter,setTwitter]=useState('')
  const[website,setWebsite]=useState('')
  const[instagram,setInstagram]=useState('')
  const[youtube,setYoutube]=useState('')
  const[theme,setTheme]=useState('violet')
  const[sectionSpacing,setSectionSpacing]=useState('medium')
  const[fontFamily,setFontFamily]=useState('sans')
  const[primaryColor,setPrimaryColor]=useState('#8b5cf6')
  const[link,setLink]=useState('')
  const[copied,setCopied]=useState(false)
  const resultRef=useRef(null)

  const commitSkill=useCallback(()=>{
    const v=skillInput.trim().replace(/,$/,'')
    if(v&&!skills.includes(v))setSkills(p=>[...p,v])
    setSkillInput('')
  },[skillInput,skills])
  const onSkillKey=e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();commitSkill()}}
  const rmSkill=i=>setSkills(p=>p.filter((_,j)=>j!==i))
  const upd=(set,id,f,v)=>set(p=>p.map(x=>x.id===id?{...x,[f]:v}:x))
  const rm=(set,id)=>set(p=>p.filter(x=>x.id!==id))
  const toDataUrl=(file,cb)=>{
    const reader=new FileReader()
    reader.onload=e=>cb(e.target?.result||'')
    reader.readAsDataURL(file)
  }

  const onAvatarUpload=e=>{
    const file=e.target.files?.[0]
    if(!file)return
    toDataUrl(file,(data)=>{
      setAvatar(data)
      setAvatarOk(true)
    })
  }

  const onCvUpload=e=>{
    const file=e.target.files?.[0]
    if(!file)return
    toDataUrl(file,(data)=>setCvFile({name:file.name,data}))
  }

  const onProjectImageUpload=(id,e)=>{
    const file=e.target.files?.[0]
    if(!file)return
    toDataUrl(file,(data)=>upd(setProjects,id,'image',data))
  }

  const generate=()=>{
    if(!name.trim()||!bio.trim()){alert('Please fill in at least your Name and Bio.');return}
    const data={
      name:name.trim(),title:jobTitle.trim(),bio:bio.trim(),
      location:location.trim(),email:email.trim(),avatar:avatar.trim(),
      whatsapp:whatsapp.trim(),resumeUrl:resumeUrl.trim(),
      cvFile,
      freelance:{
        upwork:upwork.trim(),
        freelancer:freelancer.trim(),
        mostaql:mostaql.trim(),
        fiveamsat:fiveamsat.trim(),
      },
      stats:{yearsExp:yearsExp||null,projects:projCount||null,clients:clients||null,satisfaction:satisfaction||null},
      skills,
      experiences:experiences.filter(e=>e.role.trim()||e.company.trim()).map(e=>({role:e.role.trim(),company:e.company.trim(),period:e.period.trim(),desc:e.desc.trim()})),
      educations:educations.filter(e=>e.degree.trim()||e.institution.trim()).map(e=>({degree:e.degree.trim(),institution:e.institution.trim(),year:e.year.trim(),desc:e.desc.trim()})),
      projects:projects.filter(p=>p.name.trim()).map(p=>({name:p.name.trim(),url:p.url.trim(),github:p.github.trim(),desc:p.desc.trim(),tech:p.tech.trim(),image:p.image,featured:p.featured})),
      services:services.filter(sv=>sv.title.trim()).map(sv=>({icon:sv.icon,title:sv.title.trim(),desc:sv.desc.trim()})),
      testimonials:testimonials.filter(t=>t.name.trim()&&t.text.trim()).map(t=>({name:t.name.trim(),role:t.role.trim(),text:t.text.trim(),avatar:t.avatar.trim()})),
      links:{github:github.trim(),linkedin:linkedin.trim(),twitter:twitter.trim(),website:website.trim(),instagram:instagram.trim(),youtube:youtube.trim()},
      layout:{sectionSpacing,fontFamily,primaryColor},
      theme,
    }
    const compactData={
      ...data,
      // keep links compact by excluding heavy uploaded blobs
      avatar:isDataUrl(data.avatar)?'':data.avatar,
      cvFile:null,
      projects:data.projects.map(p=>({
        ...p,
        image:isDataUrl(p.image)?'':p.image,
      })),
    }

    const shortId=Math.random().toString(36).slice(2,8)
    const userSlug=slugify(name)
    const compressed=compressToEncodedURIComponent(JSON.stringify(compactData))
    const url=`${window.location.origin}${window.location.pathname}#p=${userSlug}-${shortId}&d=${compressed}`
    setLink(url)
    setTimeout(()=>resultRef.current?.scrollIntoView({behavior:'smooth'}),50)
  }

  const copy=()=>{
    navigator.clipboard.writeText(link).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)})
  }

  return(
    <div className={s.page}>
      <div className={s.container}>

        <div className={s.hero}>
          <div className={s.heroBg}/>
          <div className={s.badge}>✦ No-code · Instant · Shareable</div>
          <h1 className={s.heroTitle}>Build Your Portfolio<br/>in Minutes</h1>
          <p className={s.heroSub}>Fill in the details below — get a unique shareable link that IS your portfolio.</p>
          <div className={s.heroFeatures}>
            {['⚡ Instant link','🎨 5 themes','📱 Mobile-ready','🔒 No server needed'].map(f=>(
              <span key={f} className={s.heroFeature}>{f}</span>
            ))}
          </div>
        </div>

        {/* PERSONAL */}
        <Card icon="👤" title="Personal Info">
          <div className={s.row}>
            <Field label="Full Name *"><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Alex Johnson"/></Field>
            <Field label="Job Title"><input value={jobTitle} onChange={e=>setJobTitle(e.target.value)} placeholder="e.g. Full-Stack Developer"/></Field>
          </div>
          <Field label="Short Bio *"><textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Write 2–3 sentences about yourself, your passion and expertise..."/></Field>
          <div className={s.row}>
            <Field label="Location"><input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Cairo, Egypt"/></Field>
            <Field label="Email"><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="alex@example.com"/></Field>
          </div>
          <div className={s.row}>
            <Field label="WhatsApp Number" hint="Include country code e.g. +20 123 456 7890">
              <input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="+20 123 456 7890"/>
            </Field>
            <Field label="Resume / CV Link (optional)" hint="Google Drive, Dropbox, or direct PDF link">
              <input value={resumeUrl} onChange={e=>setResumeUrl(e.target.value)} placeholder="https://drive.google.com/..."/>
            </Field>
          </div>
          <div className={s.row}>
            <Field label="Avatar URL (optional)">
              <input value={avatar} onChange={e=>{setAvatar(e.target.value);setAvatarOk(false)}} placeholder="https://..."/>
            </Field>
            <Field label="Upload Profile Picture">
              <input type="file" accept="image/*" onChange={onAvatarUpload}/>
            </Field>
          </div>
          <div className={s.row}>
            <Field label="Upload CV File (PDF/DOC)">
              <input type="file" accept=".pdf,.doc,.docx" onChange={onCvUpload}/>
              {cvFile&&<small className={s.hint}>Attached: {cvFile.name}</small>}
            </Field>
            <Field label="Upwork Profile">
              <input value={upwork} onChange={e=>setUpwork(e.target.value)} placeholder="https://upwork.com/freelancers/..."/>
            </Field>
          </div>
          <div className={s.row}>
            <Field label="Freelancer Profile">
              <input value={freelancer} onChange={e=>setFreelancer(e.target.value)} placeholder="https://freelancer.com/u/..."/>
            </Field>
            <Field label="Mostaql Profile">
              <input value={mostaql} onChange={e=>setMostaql(e.target.value)} placeholder="https://mostaql.com/u/..."/>
            </Field>
          </div>
          <div className={s.row}>
            <Field label="5amsat Profile">
              <input value={fiveamsat} onChange={e=>setFiveamsat(e.target.value)} placeholder="https://khamsat.com/user/..."/>
            </Field>
          </div>
          {avatar&&<img src={avatar} alt="preview" className={s.avatarPreview} style={{display:avatarOk?'block':'none'}} onLoad={()=>setAvatarOk(true)} onError={()=>setAvatarOk(false)}/>}
        </Card>

        {/* STATS */}
        <Card icon="📊" title="Stats & Numbers">
          <p className={s.hint} style={{marginBottom:'1.2rem'}}>These show as animated counters on your portfolio — leave empty to hide.</p>
          <div className={s.row4}>
            <Field label="Years Exp."><input type="number" value={yearsExp} onChange={e=>setYearsExp(e.target.value)} placeholder="5"/></Field>
            <Field label="Projects Done"><input type="number" value={projCount} onChange={e=>setProjCount(e.target.value)} placeholder="40"/></Field>
            <Field label="Happy Clients"><input type="number" value={clients} onChange={e=>setClients(e.target.value)} placeholder="30"/></Field>
            <Field label="Satisfaction %"><input type="number" min="0" max="100" value={satisfaction} onChange={e=>setSatisfaction(e.target.value)} placeholder="98"/></Field>
          </div>
        </Card>

        {/* SKILLS */}
        <Card icon="⚡" title="Skills">
          <Field label="Add skills (press Enter or comma)">
            <div className={s.tagWrap} onClick={()=>skillRef.current?.focus()}>
              {skills.map((sk,i)=>(
                <span key={i} className={s.tag}>{sk}<button type="button" onClick={()=>rmSkill(i)}>×</button></span>
              ))}
              <input ref={skillRef} className={s.tagInput} value={skillInput}
                onChange={e=>setSkillInput(e.target.value)} onKeyDown={onSkillKey} onBlur={commitSkill}
                placeholder={skills.length?'':'Type a skill...'}/>
            </div>
          </Field>
        </Card>

        {/* EXPERIENCE */}
        <Card icon="💼" title="Work Experience">
          {experiences.map(ex=>(
            <div key={ex.id} className={s.dynItem}>
              <button className={s.removeBtn} onClick={()=>rm(setExperiences,ex.id)}>Remove</button>
              <div className={s.row}>
                <Field label="Job Title / Role"><input value={ex.role} onChange={e=>upd(setExperiences,ex.id,'role',e.target.value)} placeholder="Senior Developer"/></Field>
                <Field label="Company"><input value={ex.company} onChange={e=>upd(setExperiences,ex.id,'company',e.target.value)} placeholder="Tech Corp"/></Field>
              </div>
              <Field label="Period"><input value={ex.period} onChange={e=>upd(setExperiences,ex.id,'period',e.target.value)} placeholder="Jan 2022 – Present"/></Field>
              <Field label="Description"><textarea value={ex.desc} onChange={e=>upd(setExperiences,ex.id,'desc',e.target.value)} placeholder="Key responsibilities and achievements..." style={{minHeight:'65px'}}/></Field>
            </div>
          ))}
          <button className={s.addBtn} onClick={()=>setExperiences(p=>[...p,mkExp()])}>＋ Add Experience</button>
        </Card>

        {/* EDUCATION */}
        <Card icon="🎓" title="Education">
          {educations.map(ed=>(
            <div key={ed.id} className={s.dynItem}>
              <button className={s.removeBtn} onClick={()=>rm(setEducations,ed.id)}>Remove</button>
              <div className={s.row}>
                <Field label="Degree / Certificate"><input value={ed.degree} onChange={e=>upd(setEducations,ed.id,'degree',e.target.value)} placeholder="B.Sc. Computer Science"/></Field>
                <Field label="Institution"><input value={ed.institution} onChange={e=>upd(setEducations,ed.id,'institution',e.target.value)} placeholder="Cairo University"/></Field>
              </div>
              <Field label="Year"><input value={ed.year} onChange={e=>upd(setEducations,ed.id,'year',e.target.value)} placeholder="2018 – 2022"/></Field>
              <Field label="Details (optional)"><textarea value={ed.desc} onChange={e=>upd(setEducations,ed.id,'desc',e.target.value)} placeholder="GPA, achievements, activities..." style={{minHeight:'55px'}}/></Field>
            </div>
          ))}
          <button className={s.addBtn} onClick={()=>setEducations(p=>[...p,mkEdu()])}>＋ Add Education</button>
        </Card>

        {/* PROJECTS */}
        <Card icon="🚀" title="Projects">
          {projects.map(p=>(
            <div key={p.id} className={`${s.dynItem} ${p.featured?s.featuredItem:''}`}>
              <button className={s.removeBtn} onClick={()=>rm(setProjects,p.id)}>Remove</button>
              <div className={s.row}>
                <Field label="Project Name"><input value={p.name} onChange={e=>upd(setProjects,p.id,'name',e.target.value)} placeholder="My Awesome App"/></Field>
                <Field label="Live URL"><input value={p.url} onChange={e=>upd(setProjects,p.id,'url',e.target.value)} placeholder="https://..."/></Field>
              </div>
              <Field label="GitHub Repository"><input value={p.github} onChange={e=>upd(setProjects,p.id,'github',e.target.value)} placeholder="https://github.com/user/repo"/></Field>
              <Field label="Description"><textarea value={p.desc} onChange={e=>upd(setProjects,p.id,'desc',e.target.value)} placeholder="What does this project do?" style={{minHeight:'65px'}}/></Field>
              <Field label="Tech Stack (comma-separated)"><input value={p.tech} onChange={e=>upd(setProjects,p.id,'tech',e.target.value)} placeholder="React, Node.js, MongoDB"/></Field>
              <Field label="Project Image">
                <input type="file" accept="image/*" onChange={e=>onProjectImageUpload(p.id,e)}/>
                {p.image&&<img src={p.image} alt={`${p.name||'Project'} preview`} style={{marginTop:'.6rem',width:'100%',maxWidth:'220px',height:'120px',objectFit:'cover',borderRadius:'8px',border:'1px solid rgba(255,255,255,.15)'}}/>}
              </Field>
              <label className={s.checkLabel}>
                <input type="checkbox" checked={p.featured} onChange={e=>upd(setProjects,p.id,'featured',e.target.checked)}/>
                ⭐ Mark as Featured Project
              </label>
            </div>
          ))}
          <button className={s.addBtn} onClick={()=>setProjects(p=>[...p,mkProj()])}>＋ Add Project</button>
        </Card>

        {/* SERVICES */}
        <Card icon="🛠️" title="Services">
          <p className={s.hint} style={{marginBottom:'1.2rem'}}>What do you offer to clients?</p>
          {services.map(sv=>(
            <div key={sv.id} className={s.dynItem}>
              <button className={s.removeBtn} onClick={()=>rm(setServices,sv.id)}>Remove</button>
              <div className={s.row}>
                <Field label="Icon (pick or type emoji)">
                  <div className={s.emojiRow}>
                    <input className={s.emojiInput} value={sv.icon} onChange={e=>upd(setServices,sv.id,'icon',e.target.value)} maxLength={4}/>
                    <div className={s.emojiGrid}>
                      {EMOJIS.map(em=>(<button key={em} type="button" className={`${s.emojiBt} ${sv.icon===em?s.emojiActive:''}`} onClick={()=>upd(setServices,sv.id,'icon',em)}>{em}</button>))}
                    </div>
                  </div>
                </Field>
                <Field label="Service Title"><input value={sv.title} onChange={e=>upd(setServices,sv.id,'title',e.target.value)} placeholder="Web Development"/></Field>
              </div>
              <Field label="Description"><textarea value={sv.desc} onChange={e=>upd(setServices,sv.id,'desc',e.target.value)} placeholder="Brief description of this service..." style={{minHeight:'60px'}}/></Field>
            </div>
          ))}
          <button className={s.addBtn} onClick={()=>setServices(p=>[...p,mkSvc()])}>＋ Add Service</button>
        </Card>

        {/* TESTIMONIALS */}
        <Card icon="💬" title="Testimonials">
          <p className={s.hint} style={{marginBottom:'1.2rem'}}>What do clients or colleagues say about you?</p>
          {testimonials.map(t=>(
            <div key={t.id} className={s.dynItem}>
              <button className={s.removeBtn} onClick={()=>rm(setTestimonials,t.id)}>Remove</button>
              <div className={s.row}>
                <Field label="Name"><input value={t.name} onChange={e=>upd(setTestimonials,t.id,'name',e.target.value)} placeholder="Sarah Ahmed"/></Field>
                <Field label="Role / Company"><input value={t.role} onChange={e=>upd(setTestimonials,t.id,'role',e.target.value)} placeholder="CEO at StartupX"/></Field>
              </div>
              <Field label="Quote"><textarea value={t.text} onChange={e=>upd(setTestimonials,t.id,'text',e.target.value)} placeholder="Working with them was an amazing experience..." style={{minHeight:'70px'}}/></Field>
              <Field label="Their Avatar URL (optional)"><input value={t.avatar} onChange={e=>upd(setTestimonials,t.id,'avatar',e.target.value)} placeholder="https://..."/></Field>
            </div>
          ))}
          <button className={s.addBtn} onClick={()=>setTestimonials(p=>[...p,mkTes()])}>＋ Add Testimonial</button>
        </Card>

        {/* SOCIAL */}
        <Card icon="🔗" title="Social Links">
          <div className={s.row}>
            <Field label="GitHub"><input value={github} onChange={e=>setGithub(e.target.value)} placeholder="https://github.com/username"/></Field>
            <Field label="LinkedIn"><input value={linkedin} onChange={e=>setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username"/></Field>
          </div>
          <div className={s.row}>
            <Field label="Twitter / X"><input value={twitter} onChange={e=>setTwitter(e.target.value)} placeholder="https://twitter.com/username"/></Field>
            <Field label="Website / Blog"><input value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://mysite.com"/></Field>
          </div>
          <div className={s.row}>
            <Field label="Instagram"><input value={instagram} onChange={e=>setInstagram(e.target.value)} placeholder="https://instagram.com/username"/></Field>
            <Field label="YouTube"><input value={youtube} onChange={e=>setYoutube(e.target.value)} placeholder="https://youtube.com/@channel"/></Field>
          </div>
        </Card>

        {/* THEME */}
        <Card icon="🎨" title="Portfolio Theme">
          <div className={s.themeGrid}>
            {THEMES.map(t=>(
              <div key={t.id} className={`${s.themeCard} ${theme===t.id?s.themeActive:''}`} onClick={()=>setTheme(t.id)}>
                <div className={s.themePreview} style={{background:t.preview,border:t.border||'none'}}/>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* LAYOUT */}
        <Card icon="🧱" title="Body & Layout Options">
          <div className={s.row}>
            <Field label="Section Spacing">
              <select value={sectionSpacing} onChange={e=>setSectionSpacing(e.target.value)}>
                <option value="small">Compact</option>
                <option value="medium">Standard</option>
                <option value="large">Spacious</option>
              </select>
            </Field>
            <Field label="Font Style">
              <select value={fontFamily} onChange={e=>setFontFamily(e.target.value)}>
                <option value="sans">Modern Sans</option>
                <option value="serif">Classic Serif</option>
                <option value="mono">Technical Mono</option>
              </select>
            </Field>
          </div>
          <Field label="Primary Color">
            <input type="color" value={primaryColor} onChange={e=>setPrimaryColor(e.target.value)} style={{height:'44px'}}/>
          </Field>
        </Card>

        <button className={s.generateBtn} onClick={generate}>✨ Generate My Portfolio Link</button>

        {link&&(
          <div ref={resultRef} className={s.resultBox}>
            <div className={s.resultIcon}>🎉</div>
            <h3>Your Portfolio is Ready!</h3>
            <p>Share this link anywhere — LinkedIn bio, email signature, Twitter, anywhere!</p>
            <p className={s.hint}>For shorter links, uploaded image/CV files are not embedded. Use URL fields for assets you want visible in shared portfolio.</p>
            <div className={s.linkRow}>
              <div className={s.linkDisplay}>{link}</div>
              <button className={s.copyBtn} onClick={copy} style={copied?{background:'#10b981'}:{}}>
                {copied?'✓ Copied!':'Copy'}
              </button>
            </div>
            <div className={s.resultActions}>
              <a href={link} target="_blank" rel="noopener noreferrer" className={s.openBtn}>🌐 Preview Portfolio →</a>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
