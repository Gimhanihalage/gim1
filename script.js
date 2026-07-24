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
   OFFLINE Chat Widget — answers visitor questions about Gimhan
   using a local rule-based knowledge base. No API key, no
   internet connection, no server required.

   To update what the bot knows, edit the KNOWLEDGE_BASE array
   below — add new entries or edit the "keywords"/"reply" pairs.
   ========================================================= */
const KNOWLEDGE_BASE = [
  {
    keywords: ['hi', 'hello', 'hey', 'ayubowan', 'vanakkam'],
    reply: "Ayubowan! I'm Gimhan's offline assistant. Ask me about his skills, projects, education, achievements, or how to contact him."
  },
  {
    keywords: ['who', 'about', 'yourself', 'gimhan', 'chamara'],
    reply: "I.Gimhan Chamara is a 21-year-old Data Science undergraduate at SLTC Research University, with a strong foundation in programming and analytical thinking. He works across Java, web development, and machine learning."
  },
  {
    keywords: ['skill', 'skills', 'tech', 'stack', 'technolog', 'language', 'programming'],
    reply: "Gimhan works with Java, Python, web development (HTML/CSS/JS), Arduino/embedded systems, SQL and database design, and is building his machine learning and data science skill set at university."
  },
  {
    keywords: ['project', 'projects', 'portfolio', 'built'],
    reply: "Some of Gimhan's projects: a Java Student Management System (OOP, file handling), the Grand Monarch Hotel Booking System (Python desktop app), an Automated Greenhouse System (Arduino/IoT), and an ongoing Database System project (SQL, data modeling). Ask me about any one by name for more detail!"
  },
  {
    keywords: ['student management'],
    reply: "The Student Management System is a Java-based app using OOP concepts — adding, viewing, searching, updating, and deleting student records with classes, objects, constructors, ArrayLists, and file handling."
  },
  {
    keywords: ['hotel', 'grand monarch', 'booking system'],
    reply: "The Grand Monarch Hotel Booking System is a desktop app built with Python in VS Code. It manages room bookings, customer records, check-in/check-out, room availability, and billing."
  },
  {
    keywords: ['greenhouse', 'arduino', 'iot'],
    reply: "The Automated Greenhouse System is a school project using Arduino to monitor and control temperature, humidity, soil moisture, and lighting for optimal plant growth — an intro to IoT and embedded systems."
  },
  {
    keywords: ['database', 'sql', 'data modeling'],
    reply: "Gimhan is currently developing a Database System project — designing structures, entity relationships, queries, and optimizing data management using SQL and data modeling."
  },
  {
    keywords: ['education', 'study', 'studies', 'degree', 'university', 'school', 'sltc'],
    reply: "Gimhan studied at Sri Subuthi National School (Grade 4–13), and is now pursuing a B.Sc. (Hons) in Data Science at SLTC Research University, focusing on analytics, programming, statistics, and machine learning."
  },
  {
    keywords: ['achievement', 'certificat', 'award', 'ccna', 'cisco'],
    reply: "Gimhan's certifications include Python for Data Science and Cisco Certified Network Associate (CCNA)."
  },
  {
    keywords: ['contact', 'email', 'reach', 'hire', 'phone', 'number', 'location', 'where'],
    reply: "You can reach Gimhan at gimhanihalage@gmail.com or 075 764 9707. He's based in Colombo, Sri Lanka, and is open to internships and collaborations."
  },
  {
    keywords: ['cv', 'resume'],
    reply: "You can view or download Gimhan's CV using the 'Resume' link in the navbar or the 'Download CV' button in the Contact section."
  },
  {
    keywords: ['github', 'linkedin', 'social', 'facebook', 'instagram'],
    reply: "Gimhan's GitHub is github.com/Gimhanihalage and his LinkedIn is linkedin.com/in/gimhan-chamara-2b8492361 — links are also in the navbar and footer."
  },
  {
    keywords: ['bye', 'goodbye', 'thanks', 'thank you'],
    reply: "Thanks for stopping by! Feel free to look around the site or reach out through the Contact section."
  }
];

const FALLBACK_REPLIES = [
  "I'm an offline assistant so my answers are limited — try asking about Gimhan's skills, projects, education, achievements, or contact info.",
  "I don't have an answer for that yet. Try asking about a specific project, his education, or how to contact him!"
];

function getOfflineReply(input){
  const text = input.toLowerCase();
  for (const entry of KNOWLEDGE_BASE){
    if (entry.keywords.some(k => text.includes(k))) return entry.reply;
  }
  return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
}

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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    addMessage(question, 'user');
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    const typingEl = addMessage('Typing…', 'typing');

    setTimeout(() => {
      typingEl.remove();
      addMessage(getOfflineReply(question), 'bot');
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }, 500);
  });
})();
