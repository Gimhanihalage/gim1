/* =========================================================
   Footer year
   ========================================================= */
document.getElementById('year').textContent = new Date().getFullYear();

/* =========================================================
   Nav: scroll shadow + mobile toggle
   ========================================================= */
const nav = document.getElementById('nav');
const navLinks = document.getElementById('navLinks');
const navToggle = document.getElementById('navToggle');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* =========================================================
   Theme toggle (dark default, persists for this session)
   ========================================================= */
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

function applyTheme(theme){
  if (theme === 'light') root.setAttribute('data-theme', 'light');
  else root.removeAttribute('data-theme');
}

let currentTheme = 'dark';
try {
  currentTheme = sessionStorage.getItem('gc-theme') || 'dark';
} catch (e) { /* storage unavailable — default to dark */ }
applyTheme(currentTheme);

themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
  try { sessionStorage.setItem('gc-theme', currentTheme); } catch (e) { /* ignore */ }
});

/* =========================================================
   Typed eyebrow line
   ========================================================= */
const typedEl = document.getElementById('typedLine');
const fullLine = "> const developer = { role: 'Data Science Undergraduate' }";
let typedChars = 0;

function typeStep(){
  if (typedChars <= fullLine.length){
    typedEl.textContent = fullLine.slice(0, typedChars);
    typedChars++;
    setTimeout(typeStep, 28);
  }
}
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  typedEl.textContent = fullLine;
} else {
  typeStep();
}

/* =========================================================
   Hero subtitle — looping typing animation (Typed.js)
   Cycles through role phrases with a natural blinking cursor.
   ========================================================= */
(function initHeroRoleTyping(){
  const target = document.getElementById('typedRole');
  if (!target) return;

  const roles = [
    'Data Science Undergraduate',
    'Java Developer',
    'Web Developer',
    'Machine Learning Enthusiast',
    'Data Analyst',
    'Problem Solver',
    'Building Intelligent Digital Solutions'
  ];

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof Typed === 'undefined'){
    target.textContent = roles[0];
    return;
  }

  new Typed('#typedRole', {
    strings: roles,
    typeSpeed: 70,
    backSpeed: 40,
    backDelay: 2000,
    loop: true,
    smartBackspace: true,
    showCursor: true,
    cursorChar: '|'
  });
})();

/* =========================================================
   Hero canvas — animated data-node graph
   Signature element: a slowly drifting network of nodes and
   connecting edges, evoking a data pipeline / graph structure.
   ========================================================= */
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
let width, height, nodes = [];
const NODE_COUNT_DENSITY = 15000; // px^2 per node
const LINK_DIST = 150;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function getAccentColor(){
  const isLight = root.getAttribute('data-theme') === 'light';
  return isLight ? '15, 138, 115' : '53, 224, 192';
}

function resizeCanvas(){
  const hero = canvas.parentElement;
  width = canvas.width = hero.offsetWidth;
  height = canvas.height = hero.offsetHeight;
  const count = Math.min(90, Math.max(28, Math.floor((width * height) / NODE_COUNT_DENSITY)));
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    r: Math.random() * 1.6 + 0.8
  }));
}

function drawFrame(){
  ctx.clearRect(0, 0, width, height);
  const accent = getAccentColor();

  for (const n of nodes){
    n.x += n.vx;
    n.y += n.vy;
    if (n.x < 0 || n.x > width) n.vx *= -1;
    if (n.y < 0 || n.y > height) n.vy *= -1;
  }

  for (let i = 0; i < nodes.length; i++){
    for (let j = i + 1; j < nodes.length; j++){
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < LINK_DIST){
        ctx.strokeStyle = `rgba(${accent}, ${(1 - dist / LINK_DIST) * 0.35})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  for (const n of nodes){
    ctx.fillStyle = `rgba(${accent}, 0.8)`;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!reducedMotion) requestAnimationFrame(drawFrame);
}

resizeCanvas();
drawFrame();
window.addEventListener('resize', resizeCanvas, { passive: true });
if (reducedMotion){
  // Draw a single static frame instead of animating.
  drawFrame();
}

/* =========================================================
   Education photo slideshow — auto-advances through the
   school photos, with arrow and dot controls.
   ========================================================= */
(function initEduSlideshows(){
  const roots = Array.from(document.querySelectorAll('.edu-slideshow'));
  if (!roots.length) return;

  roots.forEach((root) => {
    const slides = Array.from(root.querySelectorAll('.edu-slide'));
    const dots = Array.from(root.querySelectorAll('.edu-dot'));
    const prevBtn = root.querySelector('[data-role="prev"]');
    const nextBtn = root.querySelector('[data-role="next"]');
    if (!slides.length || !prevBtn || !nextBtn) return;

    let index = 0;
    let timer = null;
    const INTERVAL = 3500;

    function show(i){
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
      dots.forEach((d, n) => {
        d.classList.toggle('is-active', n === index);
        d.setAttribute('aria-selected', String(n === index));
      });
    }

    function next(){ show(index + 1); }
    function prev(){ show(index - 1); }

    function startAuto(){
      if (reducedMotion || slides.length < 2) return;
      stopAuto();
      timer = setInterval(next, INTERVAL);
    }
    function stopAuto(){ if (timer) clearInterval(timer); }

    nextBtn.addEventListener('click', () => { next(); startAuto(); });
    prevBtn.addEventListener('click', () => { prev(); startAuto(); });
    dots.forEach((d, n) => d.addEventListener('click', () => { show(n); startAuto(); }));

    root.addEventListener('mouseenter', stopAuto);
    root.addEventListener('mouseleave', startAuto);

    show(0);
    startAuto();
  });
})();

/* =========================================================
   Contact form — sends real emails via Web3Forms (fetch, no
   page reload). No backend of your own needed.

   TODO: paste your Web3Forms access key into the hidden
   "access_key" input in index.html — get one free at
   https://web3forms.com

   Prefer EmailJS instead? Swap the fetch block below for:
     emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
       name: formData.get('name'),
       email: formData.get('email'),
       message: formData.get('message')
     }, 'YOUR_PUBLIC_KEY')
   (after loading the EmailJS SDK script and calling emailjs.init()).
   ========================================================= */
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
const submitBtn = document.getElementById('contactSubmit');

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

function setFormNote(message, state){
  formNote.textContent = message;
  formNote.classList.remove('is-success', 'is-error');
  if (state) formNote.classList.add(state);
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Honeypot check — if this hidden field got filled in, silently drop it.
  if (contactForm.botcheck && contactForm.botcheck.checked){
    return;
  }

  const formData = new FormData(contactForm);
  const accessKey = formData.get('access_key');

  if (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY'){
    setFormNote('Form not connected yet — add your Web3Forms access key in index.html.', 'is-error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  setFormNote('Sending your message…', null);

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    });
    const result = await response.json();

    if (response.ok && result.success){
      setFormNote('Message sent — thanks for reaching out! I\u2019ll reply soon.', 'is-success');
      contactForm.reset();
    } else {
      setFormNote(result.message || 'Something went wrong — please try again.', 'is-error');
    }
  } catch (err) {
    setFormNote('Network error — please check your connection and try again.', 'is-error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
});

/* =========================================================
   AI Chat Widget — answers visitor questions about Gimhan
   using the Gemini API (fetch, no page reload).

   TODO: 1. Get a free API key at https://aistudio.google.com/apikey
         2. Paste it below, replacing YOUR_GEMINI_API_KEY
         3. In Google Cloud Console, restrict the key to your
            site's domain (HTTP referrer restriction) before
            publishing, so it can't be used elsewhere.

   Prefer OpenAI instead? Swap the fetch call in askAI() below for
   a POST to https://api.openai.com/v1/chat/completions with an
   Authorization: Bearer YOUR_OPENAI_KEY header — but note OpenAI
   keys are not safe to expose in client-side code without a
   backend proxy, unlike Gemini keys which support domain
   restriction.
   ========================================================= */
const GEMINI_API_KEY = 'AQ.Ab8RN6KrirbfhOFTkuF3JX1TJJilpI0SEDvAGlqp9czuEAtjpA';
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Background info the assistant draws on when answering visitor questions.
// Keep this in sync with the rest of the site as it changes.
const SITE_CONTEXT = `
You are a friendly AI assistant embedded on I.Gimhan Chamara's personal portfolio website.
Answer visitor questions about Gimhan using only the facts below. Keep answers short
(2-4 sentences), warm, and professional. If asked something outside this info, say you
don't have that detail and suggest using the contact form on the site.

ABOUT: I.Gimhan Chamara, Data Science Undergraduate.
EDUCATION: B.Sc. (Hons) in Data Science at SLTC Research University (currently studying);
previously studied at Sri Subuthi National School.
ACHIEVEMENTS / CERTIFICATIONS: Python for Data Science; Cisco Certified Network
Associate (CCNA).
PROJECTS:
1. Student Management System.
2. Grand Monarch Hotel Booking System — a desktop Hotel Management System built with
   Python in Visual Studio Code, handling room bookings, customer records, check-in/
   check-out, room availability, and billing.
3. Automated Greenhouse System — an Arduino-based IoT project for a school assignment
   that monitors and controls temperature, humidity, soil moisture, and lighting for
   smart agriculture.
4. Develop the Database System (ongoing) — designing database structures, entity
   relationships, queries, and optimized data management.
CONTACT: Email gimhanihalage@gmail.com; Phone 075 764 9707; Location Colombo, Sri Lanka;
GitHub github.com/Gimhanihalage; LinkedIn linkedin.com/in/gimhan-chamara-2b8492361.
`.trim();

(function initChatWidget(){
  const widget = document.getElementById('chatWidget');
  if (!widget) return;

  const toggleBtn = document.getElementById('chatToggle');
  const closeBtn = document.getElementById('chatClose');
  const panel = document.getElementById('chatPanel');
  const messagesEl = document.getElementById('chatMessages');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');

  let history = []; // { role: 'user' | 'model', text }

  function openPanel(){
    panel.hidden = false;
    toggleBtn.setAttribute('aria-expanded', 'true');
    input.focus();
  }
  function closePanel(){
    panel.hidden = true;
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  toggleBtn.addEventListener('click', () => {
    panel.hidden ? openPanel() : closePanel();
  });
  closeBtn.addEventListener('click', closePanel);

  function addMessage(text, kind){
    const el = document.createElement('div');
    el.className = `chat-msg chat-msg-${kind}`;
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  async function askAI(question){
    const contents = [
      ...history.map(turn => ({ role: turn.role, parts: [{ text: turn.text }] })),
      { role: 'user', parts: [{ text: question }] }
    ];

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SITE_CONTEXT }] },
        contents
      })
    });

    const result = await response.json();
    if (!response.ok){
      throw new Error(result.error && result.error.message ? result.error.message : 'Request failed');
    }

    const reply = result.candidates &&
      result.candidates[0] &&
      result.candidates[0].content &&
      result.candidates[0].content.parts &&
      result.candidates[0].content.parts[0] &&
      result.candidates[0].content.parts[0].text;

    if (!reply) throw new Error('No response from the model.');
    return reply.trim();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY'){
      addMessage(question, 'user');
      addMessage('This assistant isn\u2019t connected yet — add a Gemini API key in script.js to enable real answers.', 'error');
      input.value = '';
      return;
    }

    addMessage(question, 'user');
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    const typingEl = addMessage('Thinking…', 'typing');

    try {
      const reply = await askAI(question);
      typingEl.remove();
      addMessage(reply, 'bot');
      history.push({ role: 'user', text: question });
      history.push({ role: 'model', text: reply });
      // Keep the last few turns only, to keep each request small.
      if (history.length > 12) history = history.slice(-12);
    } catch (err) {
      typingEl.remove();
      addMessage('Sorry, something went wrong reaching the assistant. Please try again.', 'error');
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  });
})();
