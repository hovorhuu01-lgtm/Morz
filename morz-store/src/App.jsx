import { useEffect, useRef, useState } from 'react'
import { T } from './data/content'
import { CONFIG, RATES } from './config'
import { products } from './data/products'
import { ICONS } from './data/icons'
import { SLIDES } from './data/slides'
import logo from './assets/logo.png'

const imgs = import.meta.glob('./assets/shoes/*.webp', { eager: true, import: 'default' })
const SH = (k) => imgs[`./assets/shoes/${k}.webp`]
const FINE = typeof matchMedia !== 'undefined' && matchMedia('(hover:hover) and (pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches
const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion:reduce)').matches
const GEN = { m: ['Men', 'Эрэгтэй'], w: ['Women', 'Эмэгтэй'], k: ['Kids', 'Хүүхэд'] }
const NAV = [['home', 'home'], ['sport', 'sport'], ['all', 'all'], ['gym', 'gym'], ['m', 'men'], ['w', 'women'], ['k', 'kids'], ['about', 'about']]
const SPORTS = ['Football', 'Basketball', 'Tennis', 'Running', 'Gym', 'Volleyball', 'Boxing', 'Cycling']
const sizesOf = (c) => c === 'shoes' ? ['38', '39', '40', '41', '42', '43', '44', '45'] : ['tops', 'bottoms', 'outdoor'].includes(c) ? ['XS', 'S', 'M', 'L', 'XL', 'XXL'] : []
const F0 = { g: 'all', c: 'all', s: 'all', q: '' }
const jump = (id) => setTimeout(() => document.getElementById(id)?.scrollIntoView(), 0)
const byId = Object.fromEntries(products.map((p) => [p.id, p]))

function useTilt(ref, max) {
  useEffect(() => {
    const el = ref.current
    if (!el || !FINE) return
    let rx = 0, ry = 0, cx = 0, cy = 0, raf = 0, on = false
    const loop = () => {
      cx += (rx - cx) * .12; cy += (ry - cy) * .12
      el.style.transform = `perspective(800px) rotateX(${cx.toFixed(2)}deg) rotateY(${cy.toFixed(2)}deg)` + (on ? ' translateY(-5px)' : '')
      if (on || Math.abs(cx) > .05 || Math.abs(cy) > .05) raf = requestAnimationFrame(loop)
      else { el.style.transform = ''; raf = 0 }
    }
    const enter = () => { on = true; if (!raf) raf = requestAnimationFrame(loop) }
    const move = (e) => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5
      ry = x * max * 2; rx = -y * max * 2
      el.style.setProperty('--mx', (x + .5) * 100 + '%'); el.style.setProperty('--my', (y + .5) * 100 + '%')
      el.style.setProperty('--ix', x * 16 + 'px'); el.style.setProperty('--iy', y * 16 + 'px')
    }
    const leave = () => { on = false; rx = 0; ry = 0; el.style.setProperty('--ix', '0px'); el.style.setProperty('--iy', '0px'); if (!raf) raf = requestAnimationFrame(loop) }
    el.addEventListener('pointerenter', enter); el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave)
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointerenter', enter); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, [ref, max])
}

const Ico = ({ p }) => p.image
  ? <img className="pimg" src={SH(p.image)} alt="" />
  : <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[p.category] }} />

function Modal({ open, onClose, id, children }) {
  const r = useRef()
  useEffect(() => { const d = r.current; if (open && !d.open) d.showModal(); if (!open && d.open) d.close() }, [open])
  return <dialog id={id} ref={r} onClose={onClose} onClick={(e) => e.target === r.current && onClose()}>{open && children}</dialog>
}

function Card({ p, n, t, lang, fmt, onOpen, onAdd }) {
  const r = useRef(); useTilt(r, 7)
  const name = p[lang]
  return (
    <div ref={r} className={'p' + (p.available ? '' : ' oos')} style={{ '--d': n * 28 + 'ms' }} tabIndex={0} role="group" aria-label={name}
      onClick={() => onOpen(p)} onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) { e.preventDefault(); onOpen(p) } }}>
      <div className={'ph' + (p.hasLogo ? ' b' : '')}><Ico p={p} /><span className="vw">{t.view}</span></div>
      <h3>{name}</h3>
      <div className="pr"><span>{p.available ? fmt(p) : t.out}</span>
        <button className="add" disabled={!p.available} aria-label={'+ ' + name} onClick={(e) => { e.stopPropagation(); onAdd(p) }}>+</button></div>
    </div>
  )
}

function ProductDialog({ p, t, lang, fmt, add, onClose }) {
  const ph = useRef(); useTilt(ph, 14)
  const [sel, setSel] = useState(''), [warn, setWarn] = useState(false)
  const sz = sizesOf(p.category)
  const go = () => { if (sz.length && !sel) return setWarn(true); add(p.id, sel); onClose() }
  return (
    <div className="pv">
      <div ref={ph} className={'ph pvbig' + (p.hasLogo ? ' b' : '')}><Ico p={p} /></div>
      <div>
        <h2>{p[lang]}</h2><p className="pp">{p.available ? fmt(p) : t.out}</p>
        {sz.length > 0 && <><p className="note" style={warn ? { color: 'var(--blue)' } : null}>{warn ? t.pick : t.size}</p>
          <div className="chips">{sz.map((s) => <button key={s} aria-pressed={sel === s} onClick={() => setSel(s)}>{s}</button>)}</div></>}
        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <button className="btn" disabled={!p.available} onClick={go}>{t.addc}</button>
          <button className="cartb" onClick={onClose}>{t.close}</button>
        </div>
      </div>
    </div>
  )
}

function Hero({ t, lang, fmt, add, toShop }) {
  const [si, setSi] = useState(0), [ci, setCi] = useState(0), [phase, setPhase] = useState('in'), [rev, setRev] = useState(''), [sz, setSz] = useState('40'), [held, setHeld] = useState(false)
  const cur = useRef(0), busy = useRef(false), paused = useRef(false), hold = useRef(false)
  const hs = useRef(), par = useRef(), wpar = useRef(), x0 = useRef(null)
  const s = SLIDES[ci], p = products.find((x) => x.image === SLIDES[si].k)
  const set = (n, dir) => {
    if (busy.current || n === cur.current) return
    busy.current = true; cur.current = n; setCi(n); setRev(dir < 0 ? ' r' : ''); setPhase('out')
    setTimeout(() => {
      setSi(n); setPhase('pre')
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase('in')))
      setTimeout(() => { busy.current = false }, 600)
    }, 450)
  }
  const nx = (d) => set((cur.current + d + SLIDES.length) % SLIDES.length, d)
  useEffect(() => {
    const r = document.documentElement.style
    r.setProperty('--blue', s.a); r.setProperty('--bg', s.bg); r.setProperty('--panel', s.pn); r.setProperty('--line', s.ln)
  }, [ci])
  useEffect(() => {
    if (REDUCED) return
    const id = setInterval(() => { if (!paused.current && !hold.current && !document.hidden) nx(1) }, 6500)
    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    if (!FINE) return
    const h = hs.current; let tx = 0, ty = 0, cx = 0, cy = 0, raf
    const mv = (e) => { const r = h.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5; h.style.setProperty('--gx', e.clientX - r.left + 'px'); h.style.setProperty('--gy', e.clientY - r.top + 'px') }
    const lv = () => { tx = 0; ty = 0 }
    h.addEventListener('pointermove', mv); h.addEventListener('pointerleave', lv)
    const l = () => { cx += (tx - cx) * .07; cy += (ty - cy) * .07
      par.current.style.transform = `translate(${(cx * 44).toFixed(1)}px,${(cy * 26).toFixed(1)}px) rotate(${(cx * 5).toFixed(2)}deg)`
      wpar.current.style.transform = `translate(${(-cx * 64).toFixed(1)}px,${(-cy * 32).toFixed(1)}px)`
      raf = requestAnimationFrame(l) }
    l()
    return () => { cancelAnimationFrame(raf); h.removeEventListener('pointermove', mv); h.removeEventListener('pointerleave', lv) }
  }, [])
  return (
    <div className="hs" id="top" ref={hs} style={{ '--c1': s.c1, '--c2': s.c2, '--fg': s.fg, '--fgi': s.fgi }}
      onPointerEnter={() => { paused.current = true }} onPointerLeave={() => { paused.current = false }}>
      <div className="wrap hg">
        <div className="ht"><h1><span>{t.h1}</span> <em>{t.h1b}</em></h1><p>{t.hp}</p></div>
        <div className="stage" id="stage" onPointerDown={(e) => { x0.current = e.clientX }}
          onPointerUp={(e) => { if (x0.current !== null && Math.abs(e.clientX - x0.current) > 40) nx(e.clientX < x0.current ? 1 : -1); x0.current = null }}>
          <div className="wpar" ref={wpar}><div className={'word' + (phase === 'out' ? ' wout' : phase === 'pre' ? ' wpre' : '')}>{SLIDES[si].w.replace(' ', '\n')}</div></div>
          <div className="par" ref={par}><div className="fl"><img className={phase === 'in' ? 'shoe' : `shoe ${phase}${rev}`} src={SH(SLIDES[si].k)} alt="MORZ shoe" /></div></div>
        </div>
        <div className="info">
          <h2>{p[lang]}</h2><div className="hpr">{fmt(p)}</div>
          <div className="chips" role="group">{['39', '40', '41', '42', '43', '44'].map((z) => <button key={z} aria-pressed={sz === z} onClick={() => setSz(z)}>{z}</button>)}</div>
          <div className="hb"><button className="btn" disabled={!p.available} onClick={() => add(p.id, sz)}>{p.available ? t.addc : t.out}</button>
            <a className="btn ghost" href="#shop" onClick={(e) => { e.preventDefault(); toShop() }}>{t.shopnow}</a></div>
          <div className="nav2">
            <button aria-label="Previous" onClick={() => nx(-1)}>&#8249;</button>
            <div id="dots">{SLIDES.map((_, i) => <i key={i} className={i === si ? 'on' : ''} onClick={() => set(i, i > cur.current ? 1 : -1)} />)}</div>
            <button aria-label="Next" onClick={() => nx(1)}>&#8250;</button>
            <button aria-label={held ? 'Play' : 'Pause'} style={{ fontSize: '.75rem' }} onClick={() => { hold.current = !hold.current; setHeld(hold.current) }}>{held ? '▶' : '❚❚'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [lang, setLang] = useState(() => /^mn/i.test(navigator.language || '') ? 'mn' : 'en')
  const [cur, setCur] = useState(() => /^mn/i.test(navigator.language || '') ? 'MNT' : 'USD')
  const [f, setF] = useState(F0), [openP, setOpenP] = useState(null), [cartOpen, setCartOpen] = useState(false), [note, setNote] = useState(false), [bumped, setBumped] = useState(false)
  const [cart, setCart] = useState(() => { try { const a = JSON.parse(localStorage.getItem('morz_cart') || '[]'); return Array.isArray(a) ? a.filter((c) => c && byId[c.id] && c.q > 0) : [] } catch { return [] } })
  const t = T[lang]
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  useEffect(() => { document.documentElement.style.setProperty('--logo', `url(${logo})`) }, [])
  useEffect(() => { try { localStorage.setItem('morz_cart', JSON.stringify(cart)) } catch { /* storage unavailable */ } }, [cart])

  const money = (u) => new Intl.NumberFormat(lang === 'mn' ? 'mn-MN' : 'en-US', { style: 'currency', currency: cur, maximumFractionDigits: ['MNT', 'JPY', 'KRW', 'RUB'].includes(cur) ? 0 : 2 }).format(u * RATES[cur])
  const fmt = (p) => p.price == null ? t.ask : money(p.price)
  const add = (id, s = '') => {
    setCart((c) => { const m = c.find((x) => x.id === id && x.s === s); return m ? c.map((x) => x === m ? { ...x, q: x.q + 1 } : x) : [...c, { id, s, q: 1 }] })
    setBumped(true); setTimeout(() => setBumped(false), 450)
  }
  const quick = (p) => sizesOf(p.category).length ? setOpenP(p) : add(p.id)
  const act = { home: () => { setF(F0); window.scrollTo(0, 0) }, sport: () => jump('sports'), all: () => { setF(F0); jump('shop') }, gym: () => { setF({ ...F0, s: 'gym' }); jump('shop') },
    m: () => { setF({ ...f, g: 'm' }); jump('shop') }, w: () => { setF({ ...f, g: 'w' }); jump('shop') }, k: () => { setF({ ...f, g: 'k' }); jump('shop') }, about: () => jump('about') }
  const q = f.q.toLowerCase()
  const list = products.filter((p) => !(f.g !== 'all' && p.gender !== f.g && !(p.gender === 'u' && f.g !== 'k')) && !(f.c !== 'all' && p.category !== f.c) && !(f.s !== 'all' && p.sport !== f.s) && !(q && !(p.en + ' ' + p.mn).toLowerCase().includes(q)))
  const count = cart.reduce((a, c) => a + c.q, 0)
  const total = cart.reduce((a, c) => a + (byId[c.id].price == null ? 0 : byId[c.id].price * c.q), 0)
  const change = (k, d) => setCart((c) => d === 0 ? c.filter((_, i) => i !== k) : c.map((x, i) => i === k ? { ...x, q: x.q + d } : x).filter((x) => x.q > 0))
  const order = () => {
    setNote(true); if (!cart.length) return
    let miss = false
    const l = cart.map((c) => { const p = byId[c.id]; if (p.price == null) miss = true; return `${c.q} x ${p.en}${c.s ? ` (${c.s})` : ''}${p.price == null ? '' : ' - ' + money(p.price * c.q)}` })
    location.href = `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent('MORZ order request')}&body=${encodeURIComponent(l.join('\n') + (miss ? '' : `\n\nTotal: ${money(total)}`) + '\n\nName / phone / address:\n')}`
  }

  return (<>
    <header className="top"><div className="wrap">
      <a href="#top" aria-label="MORZ" onClick={(e) => { e.preventDefault(); act.home() }}><img className="mark" src={logo} alt="MORZ" /></a>
      <span className="sp" />
      <select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value)}><option value="en">English</option><option value="mn">Монгол</option></select>
      <select aria-label="Currency" value={cur} onChange={(e) => setCur(e.target.value)}>{Object.keys(RATES).map((c) => <option key={c}>{c}</option>)}</select>
      <button className={'cartb' + (bumped ? ' bump' : '')} onClick={() => { setNote(false); setCartOpen(true) }}>{t.cart} ({count})</button>
      <input className="search" type="search" placeholder={t.search} value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
      <nav className="main" aria-label="Main">{NAV.map(([a, k]) => <a key={a} href={'#' + a} onClick={(e) => { e.preventDefault(); act[a]() }}>{t[k]}</a>)}</nav>
    </div></header>

    <Hero t={t} lang={lang} fmt={fmt} add={add} toShop={act.all} />

    <section id="sports"><div className="wrap"><h2>{t.bysport}</h2>
      <div className="cats">{Object.keys(t.s).map((k) => <button key={k} className={'cat' + (f.s === k ? ' on' : '')} onClick={() => { setF({ ...f, s: f.s === k ? 'all' : k }); jump('shop') }}><b>{t.s[k]}</b><span>{t.sh}</span></button>)}</div></div></section>

    <section id="shop"><div className="wrap"><h2>{t.catalog}</h2>
      <div className="chips" role="group">{['all', 'm', 'w', 'k'].map((k) => <button key={k} aria-pressed={f.g === k} onClick={() => setF({ ...f, g: k })}>{k === 'all' ? t.ga : GEN[k][lang === 'en' ? 0 : 1]}</button>)}</div>
      <div className="chips" role="group">{Object.keys(t.cats).map((k) => <button key={k} aria-pressed={f.c === k} onClick={() => setF({ ...f, c: k })}>{t.cats[k]}</button>)}</div>
      <div className="prods">{list.map((p, n) => <Card key={p.id} p={p} n={n + 1} t={t} lang={lang} fmt={fmt} onOpen={setOpenP} onAdd={quick} />)}</div>
      {!list.length && <p className="none">{t.none}</p>}</div></section>

    <section id="gym"><div className="wrap promo">
      <div className="card"><h3>{t.build}</h3><p>{t.buildp}</p><a className="btn" href="#shop" onClick={(e) => { e.preventDefault(); act.gym() }}>{t.shopgym}</a></div>
      <div className="trust">{[1, 2, 3, 4].map((n) => <div key={n}><b>{t['t' + n]}</b><span>{t['t' + n + 'p']}</span></div>)}</div></div></section>

    <section id="about"><div className="wrap"><h2>{t.vision}</h2>
      <p style={{ fontFamily: 'var(--disp)', fontWeight: 700, fontSize: 'clamp(1.4rem,4vw,2.2rem)', lineHeight: 1.15, maxWidth: '40rem', margin: '0 0 1rem' }}>{t.v1}</p>
      <p style={{ color: 'var(--muted)', margin: 0 }}>{t.v2}</p></div></section>

    <section id="info"><div className="wrap">{[['ship', 'shipp'], ['priv', 'privp'], ['contact', 'contactp']].map(([a, b]) => <details key={a}><summary>{t[a]}</summary><p>{t[b]}</p></details>)}</div></section>

    <footer><div className="wrap">
      <div><img className="mark" src={logo} alt="MORZ" /><p>{t.f1}</p><p>{t.f2}</p></div>
      <div className="sports">{SPORTS.map((s) => <span key={s}>{s}</span>)}</div></div></footer>

    <Modal id="pd" open={!!openP} onClose={() => setOpenP(null)}>{openP && <ProductDialog key={openP.id} p={openP} t={t} lang={lang} fmt={fmt} add={add} onClose={() => setOpenP(null)} />}</Modal>
    <Modal id="dlg" open={cartOpen} onClose={() => setCartOpen(false)}>
      <h2>{t.cart}</h2>
      <div>{!cart.length && <p className="none">{t.empty}</p>}
        {cart.map((c, k) => { const p = byId[c.id]; return (
          <div className="li" key={c.id + c.s}><span>{p[lang]}{c.s ? ' · ' + c.s : ''}<br /><span className="q">
            <button aria-label="-" onClick={() => change(k, -1)}>−</button> {c.q} <button aria-label="+" onClick={() => change(k, 1)}>+</button> <button aria-label={t.rm} onClick={() => change(k, 0)}>✕</button></span></span>
            <span>{p.price == null ? t.ask : money(p.price * c.q)}</span></div>) })}</div>
      <div className="tot"><span>{t.total}</span><span>{money(total)}</span></div>
      {note && <p className="note">{t.demo}</p>}
      <div style={{ display: 'flex', gap: '.6rem', marginTop: '1rem' }}><button className="btn" onClick={order}>{t.checkout}</button><button className="cartb" onClick={() => setCartOpen(false)}>{t.close}</button></div>
    </Modal>
  </>)
}
