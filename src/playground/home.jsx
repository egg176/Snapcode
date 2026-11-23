import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';

const styles = `
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:#f7f8fc;color:#20243a;overflow-x:hidden}
body:before{content:"";position:fixed;inset:0;pointer-events:none;background:radial-gradient(circle at 8% 12%,#e9e4ff88,transparent 28%),radial-gradient(circle at 90% 80%,#dcf7ff88,transparent 28%);z-index:-1}
nav{height:76px;display:flex;align-items:center;justify-content:space-between;gap:22px;padding:0 max(5vw,24px);background:#ffffffdd;backdrop-filter:blur(16px);border-bottom:1px solid #ececf4;position:sticky;top:0;z-index:20;animation:navIn .65s ease both}.nav-search{flex:1;max-width:520px;padding:12px 16px;border:1px solid #e5e6ef;background:#f7f8fc;border-radius:14px;font:inherit;transition:.25s}.nav-search:focus{outline:none;border-color:#8175ee;box-shadow:0 0 0 4px #6657e822;transform:scale(1.01)}.accountnav{padding:11px 15px;border:1px solid #e5e6ef;border-radius:13px;background:white;color:#45465b;font-weight:700;cursor:pointer;transition:transform .2s,box-shadow .2s}.accountnav:hover{transform:translateY(-3px);box-shadow:0 8px 20px #25234418}.nav-brand{font-weight:850;font-size:24px;color:#5548d9;text-decoration:none;white-space:nowrap;transition:transform .25s}.nav-brand:hover{transform:scale(1.04)}.store-link{font-weight:700;color:#5548d9!important;text-decoration:none;white-space:nowrap;padding:10px 12px;border-radius:12px;transition:background .2s,transform .2s}.store-link:hover{background:#f0edff;transform:translateY(-2px)}@media(max-width:750px){nav{gap:10px;padding:0 12px}.nav-search{min-width:0}.nav-brand{font-size:20px}}
.hero{max-width:1160px;margin:60px auto 45px;padding:20px 24px;display:grid;grid-template-columns:1.1fr .9fr;gap:50px;align-items:center}.hero-copy{animation:rise .85s cubic-bezier(.2,.7,.2,1) both}.eyebrow{color:#6657e8;font-weight:750;letter-spacing:1.5px;font-size:12px;text-transform:uppercase;display:inline-flex;align-items:center;gap:8px}.eyebrow:before{content:"";width:24px;height:2px;background:#6657e8;animation:lineGrow 1s ease both}h1{font-size:clamp(44px,6vw,76px);line-height:1.02;letter-spacing:-4px;margin:18px 0}h1 span{color:#6657e8;background:linear-gradient(90deg,#6657e8,#a66bdf,#6657e8);background-size:200%;background-clip:text;-webkit-background-clip:text;color:transparent;animation:gradientShift 5s ease infinite}p{color:#686b81;line-height:1.7;font-size:18px}.actions{display:flex;gap:14px;margin-top:30px;flex-wrap:wrap}.btn{padding:14px 22px;border-radius:14px;font-weight:750;text-decoration:none;display:inline-block;transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s,background .25s}.btn:hover{transform:translateY(-4px) scale(1.025)}.btn:active{transform:translateY(0) scale(.97)}.primary{background:linear-gradient(135deg,#6555e8,#8774f4);color:white;box-shadow:0 12px 25px #6555e833}.primary:hover{box-shadow:0 17px 35px #6555e855}.secondary{background:white;color:#45465b;border:1px solid #e3e5ef}.secondary:hover{box-shadow:0 12px 25px #25234412}
.preview{border-radius:26px;background:linear-gradient(135deg,#e8e5ff,#d9f4ff);padding:25px;min-height:340px;overflow:hidden;position:relative;animation:float 6s ease-in-out infinite,fadeIn .9s .15s both}.preview:before,.preview:after{content:"";position:absolute;border-radius:50%;background:#ffffff66;animation:orb 8s ease-in-out infinite}.preview:before{width:90px;height:90px;right:-20px;top:25px}.preview:after{width:55px;height:55px;left:12px;bottom:15px;animation-delay:-3s}.window{background:white;border-radius:17px;padding:17px;box-shadow:0 22px 60px #5d55b422;transform:rotate(2deg);position:relative;z-index:1;transition:transform .5s}.preview:hover .window{transform:rotate(0) scale(1.025)}.dots{display:flex;gap:6px;margin-bottom:18px}.dot{width:9px;height:9px;border-radius:50%;background:#e5e5ef}.blocks{display:grid;gap:10px;padding:10px}.block{border-radius:11px;padding:14px;color:white;font-weight:700;width:max-content;max-width:100%;box-shadow:0 7px 16px #00000012;animation:blockIn .6s cubic-bezier(.2,.8,.2,1) both;transition:transform .2s,filter .2s}.block:hover{transform:translateX(8px) rotate(-1deg);filter:brightness(1.06)}.yellow{background:#f4b840;animation-delay:.3s}.blue{background:#438bd7;margin-left:28px;animation-delay:.5s}.purple{background:#9a62c9;margin-left:48px;animation-delay:.7s}.green{background:#54b778;margin-left:22px;animation-delay:.9s}
.features{max-width:1160px;margin:35px auto 90px;padding:0 24px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.feature{background:#ffffffd9;border:1px solid #ececf4;border-radius:20px;padding:24px;transition:transform .3s,box-shadow .3s,border-color .3s;animation:rise .8s .25s both}.feature:nth-child(2){animation-delay:.4s}.feature:nth-child(3){animation-delay:.55s}.feature:hover{transform:translateY(-8px);box-shadow:0 20px 40px #25234412;border-color:#d6d1ff}.feature>div:first-child{font-size:26px;transition:transform .3s}.feature:hover>div:first-child{transform:scale(1.15) rotate(-8deg)}.feature h3{margin:10px 0 4px}.feature p{font-size:15px;margin:0}
.loading{position:fixed;inset:0;background:#6555e8;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;z-index:1000;transition:opacity .5s,visibility .5s}.loading.hide{opacity:0;visibility:hidden;pointer-events:none}.loading-logo{font-size:32px;font-weight:900;animation:pulse 1s ease-in-out infinite}.loader{margin-top:24px;width:140px;height:4px;border-radius:9px;background:#ffffff44;overflow:hidden}.loader:after{content:"";display:block;width:45%;height:100%;background:white;border-radius:9px;animation:loadSlide 1s ease-in-out infinite}.transition{position:fixed;inset:0;background:#6555e8;z-index:999;transform:translateY(100%);animation:pageCover .45s ease forwards;pointer-events:none}
@keyframes navIn{from{opacity:0;transform:translateY(-15px)}to{opacity:1;transform:translateY(0)}}@keyframes rise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}@keyframes blockIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}@keyframes orb{0%,100%{transform:translate(0,0)}50%{transform:translate(-12px,15px)}}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}@keyframes loadSlide{from{transform:translateX(-120%)}to{transform:translateX(250%)}}@keyframes lineGrow{from{width:0}to{width:24px}}@keyframes gradientShift{0%,100%{background-position:0%}50%{background-position:100%}}@keyframes pageCover{to{transform:translateY(0)}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}
@media(max-width:750px){.hero{grid-template-columns:1fr;margin-top:20px}.features{grid-template-columns:1fr}h1{letter-spacing:-2px}.preview{min-height:270px}}
`;
function Home(){
 const [loading,setLoading]=useState(true);
 const [transition,setTransition]=useState(false);
 useEffect(()=>{const timer=setTimeout(()=>setLoading(false),750);return()=>clearTimeout(timer)},[]);
 const navigate=(e)=>{const link=e.target.closest('a');if(!link||link.target||link.href.startsWith(window.location.origin+'#')||link.href===window.location.href)return;if(link.href.startsWith(window.location.origin)){e.preventDefault();setTransition(true);setTimeout(()=>window.location.href=link.href,350)}};
 return (
 <>
  <style>{styles}</style>
  <div className={'loading '+(loading?'':'hide')} aria-label="Loading Snapcode">
   <div className="loading-logo">✦ Snapcode</div><div className="loader"/>
  </div>
  {transition && <div className="transition"/>}
  <div onClick={navigate}>
   <nav>
    <a className="nav-brand" href="index.html">✦ Snapcode</a>
    <a className="store-link" href="extensions.html">Extension Store</a>
    <input className="nav-search" placeholder="Search projects..." aria-label="Search projects"/>
    <a className="accountnav" href="account.html" style={{textDecoration:'none'}}>☺ Account</a>
   </nav>
   <main>
    <section className="hero">
     <div className="hero-copy">
      <div className="eyebrow">Ideas become interactive</div>
      <h1>Make something<br/><span>awesome.</span></h1>
      <p>Bring your ideas to life with blocks. Create games, animations, stories and more — one block at a time.</p>
      <div className="actions"><a className="btn primary" href="editor.html">Start creating →</a><a className="btn secondary" href="#features">Explore</a></div>
     </div>
     <div className="preview">
      <div className="window">
       <div className="dots"><i className="dot"/><i className="dot"/><i className="dot"/></div>
       <div className="blocks">
        <div className="block yellow">when green flag clicked</div>
        <div className="block blue">move 10 steps</div>
        <div className="block purple">say Hello! for 2 seconds</div>
        <div className="block green">repeat 10</div>
       </div>
      </div>
     </div>
    </section>
    <section className="features" id="features">
     <div className="feature"><div>🧩</div><h3>Simple building blocks</h3><p>Combine colorful blocks to build your ideas.</p></div>
     <div className="feature"><div>🎨</div><h3>Make it your own</h3><p>Dream up characters, worlds and stories.</p></div>
     <div className="feature"><div>🚀</div><h3>Explore and experiment</h3><p>Try things out and see what you can create.</p></div>
    </section>
   </main>
  </div>
 </>
 );
}
ReactDOM.render(<Home/>,document.getElementById('home'));
