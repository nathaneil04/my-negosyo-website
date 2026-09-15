(function(){
  const $=s=>document.querySelector(s); const $$=s=>document.querySelectorAll(s);
  const header=$('#siteHeader'), toggle=$('#menuToggle'), mobile=$('#mobileMenu');
  const backdrop=$('#modalBackdrop'), close=$('#modalClose'), authForm=$('#authForm');
  const installBackdrop=$('#installBackdrop'), installClose=$('#installClose'), installNow=$('#installNow');
  let deferredInstallPrompt=null;
  let mode='signup';

  function openModal(next='signup',plan){
    mode=next; backdrop.hidden=false; document.body.style.overflow='hidden';
    $('#modalTitle').textContent=next==='signup'?'Create your account':'Welcome back';
    $('#sideTitle').textContent=next==='signup'?'Ready to run smarter?':'Welcome back to MyNegosyo';
    $('#modalDescription').textContent=next==='signup'?'Use a local demo account to explore this website.':'Log in to continue to your MyNegosyo demo dashboard.';
    $('#authSubmit').textContent=next==='signup'?'Create free account':'Log in';
    $('#switchPrompt').textContent=next==='signup'?'Already have an account?':'New to MyNegosyo?';
    $('#switchMode').textContent=next==='signup'?'Log in':'Create account';
    $('#storeField').style.display=next==='signup'?'block':'none';
    $('#authStore').required=next==='signup';
    $('#formStatus').textContent=plan?`${plan} selected — complete the form to continue.`:'';
    setTimeout(()=>$('#authName').focus(),30);
  }
  function closeModal(){backdrop.hidden=true;document.body.style.overflow='';}

  ['#heroSignup','#benefitSignup','#ctaSignup','#footerSignup'].forEach(id=>$(id)?.addEventListener('click',()=>openModal('signup')));

  function openInstallModal(){
    if(!installBackdrop) return;
    installBackdrop.hidden=false;
    document.body.style.overflow='hidden';
    const isStandalone=window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
    if(isStandalone){
      $('#installDescription').textContent='MyNegosyo is already installed on this device.';
      if(installNow){ installNow.disabled=true; installNow.innerHTML='<i class="fa-solid fa-circle-check"></i> Already Installed'; }
      $('#installNow')?.classList.add('installed');
      $('#installNote').innerHTML='<i class="fa-solid fa-circle-check"></i> You are using MyNegosyo as an installed app.';
      $('#chromeInstructions').style.display='none';
    } else if(deferredInstallPrompt){
      $('#installDescription').textContent='Install MyNegosyo app now.';
      $('#chromeInstructions').style.display='none';
      $('#installNote').innerHTML='<i class="fa-solid fa-bolt"></i> MyNegosyo app is ready to show the install icon.';
    } else {
      $('#installDescription').textContent='Install MyNegosyo app on your device for quick access.';
      $('#chromeInstructions').style.display='block';
      $('#installNote').innerHTML='<i class="fa-solid fa-circle-info"></i> If the app still doesn’t download, simply follow the instructions for your device.';
    }
  }
  function closeInstallModal(){ if(installBackdrop){ installBackdrop.hidden=true; document.body.style.overflow=''; } }
  window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); deferredInstallPrompt=e; });
  window.addEventListener('appinstalled', ()=>{ deferredInstallPrompt=null; closeInstallModal(); });
  ['#installBtn','#mobileInstall'].forEach(id=>$(id)?.addEventListener('click',openInstallModal));
  installClose?.addEventListener('click',closeInstallModal);
  installBackdrop?.addEventListener('click',e=>{if(e.target===installBackdrop)closeInstallModal()});
  installNow?.addEventListener('click',async()=>{
    if(!deferredInstallPrompt){ return; }
    deferredInstallPrompt.prompt();
    try { await deferredInstallPrompt.userChoice; } catch {}
    deferredInstallPrompt=null;
    closeInstallModal();
  });
  ['#loginBtn','#footerLogin'].forEach(id=>$(id)?.addEventListener('click',()=>openModal('login')));
  $$('.price-card button').forEach(b=>b.addEventListener('click',()=>openModal('signup',b.dataset.plan)));
  close?.addEventListener('click',closeModal); backdrop?.addEventListener('click',e=>{if(e.target===backdrop)closeModal()});
  $('#switchMode')?.addEventListener('click',()=>openModal(mode==='signup'?'login':'signup'));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!backdrop.hidden)closeModal(); if(e.key==='Escape'&&installBackdrop&&!installBackdrop.hidden)closeInstallModal()});

  toggle?.addEventListener('click',()=>{const open=mobile.classList.toggle('open');toggle.setAttribute('aria-expanded',open?'true':'false');toggle.innerHTML=open?'<i class="fa-solid fa-xmark"></i>':'<i class="fa-solid fa-bars"></i>'});
  $$('#mobileMenu a').forEach(a=>a.addEventListener('click',()=>mobile.classList.remove('open')));
  window.addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>8));

  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}}),{threshold:.12});
  $$('.reveal').forEach(el=>io.observe(el));

  function money(n){return new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',maximumFractionDigits:0}).format(n)}
  function loadState(){try{return JSON.parse(localStorage.getItem('mynegosyo_site_state')||'{}')}catch{return {}}}
  function saveState(s){localStorage.setItem('mynegosyo_site_state',JSON.stringify(s))}

  authForm?.addEventListener('submit',e=>{
    e.preventDefault();
    const fd=new FormData(authForm); const s=loadState();
    if(mode==='signup'){
      const account={name:fd.get('name'),email:fd.get('email'),store:fd.get('store'),createdAt:new Date().toISOString()};
      s.account=account;saveState(s);
      $('#formStatus').style.color='#149447';$('#formStatus').textContent=`Account created for ${account.name}. Demo mode is ready.`;
      $('#authSubmit').textContent='Account created'; $('#authSubmit').disabled=true;
      setTimeout(()=>{authForm.reset();$('#authSubmit').disabled=false;closeModal()},1100);
    }else{
      if(!s.account || s.account.email!==fd.get('email')){
        $('#formStatus').style.color='#ef233c';$('#formStatus').textContent='No demo account found with that email. Create an account first.';return;
      }
      $('#formStatus').style.color='#149447';$('#formStatus').textContent='Logged in successfully. Welcome back!';
      setTimeout(closeModal,900);
    }
  });

  // Mini dashboard demo interaction: cycle a few realistic values.
  let sales=8420; const kpi=$('#kpiSales');
  setInterval(()=>{if(!kpi)return;sales+=Math.floor(Math.random()*31)-10;kpi.textContent=money(Math.max(0,sales));},3500);

  // Turn feature links into subtle demo hints instead of dead-end anchors.
  $$('.feature-card a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault(); document.querySelector('#demo')?.scrollIntoView({behavior:'smooth',block:'center'});}));
})();
