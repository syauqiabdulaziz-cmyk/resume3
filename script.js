// Client-side routing + interaksi
// Behavior update: Beranda (route "/") menampilkan semua ringkasan section.
// Setiap menu navbar juga tetap punya laman sendiri (/about, /skills, /projects, /experience, /education, /contact).
document.addEventListener('DOMContentLoaded', () => {
  const pages = Array.from(document.querySelectorAll('.page'));
  const navLinks = Array.from(document.querySelectorAll('#primary-menu a[data-route]'));
  const main = document.getElementById('main');
  const themeToggle = document.getElementById('theme-toggle');
  const downloadBtn = document.getElementById('download-cv');
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const projectsGrid = document.getElementById('projects-grid');
  const detailsBtns = Array.from(document.querySelectorAll('.details-btn'));
  const modal = document.getElementById('project-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalTech = document.getElementById('modal-tech');
  const modalLive = document.getElementById('modal-live');
  const modalSrc = document.getElementById('modal-src');
  const modalClose = modal && modal.querySelector('.modal-close');
  const contactForm = document.getElementById('contact-form');
  const yearEl = document.getElementById('year');
  const skillFills = Array.from(document.querySelectorAll('.fill'));
  const openIntro = document.getElementById('open-intro');

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // THEME
  const root = document.documentElement;
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) root.setAttribute('data-theme', storedTheme);
  else root.setAttribute('data-theme', 'dark');
  themeToggle && themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeToggle.setAttribute('aria-pressed', next === 'dark');
  });

  // CV download (text file)
  function downloadCVFile() {
    const content = [
      "Syauqi Abdul Aziz",
      "Mahasiswa Sistem Informasi — Universitas Komputama Majenang",
      "",
      "Kontak: syauqi@example.com",
      "",
      "Tujuan Karier: Web Developer / System Analyst / Pembuat solusi digital untuk UMKM.",
      "",
      "Keahlian:",
      "- HTML, CSS, JavaScript",
      "- PHP dasar, MySQL",
      "- Git, UI/UX dasar, Microsoft Office",
      "",
      "Pengalaman:",
      "- Staff Operasional, Warung Rembulan (14.00–22.00): pelayanan pelanggan, pencatatan transaksi, pengelolaan stok."
    ].join("\n");

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Syauqi_Abdul_Aziz_CV.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  downloadBtn && downloadBtn.addEventListener('click', (e) => { e.preventDefault(); downloadCVFile(); });

  // ROUTING: show only selected page (except "/" which is the composite home)
  function showPage(route, push = true) {
    if (!route) route = '/';
    let target = pages.find(p => p.dataset.route === route);
    // fallback to home
    if (!target) target = pages.find(p => p.dataset.route === '/');
    pages.forEach(p => {
      p.hidden = (p !== target);
    });

    // update nav aria-current
    navLinks.forEach(a => {
      const aRoute = a.dataset.route || '/';
      if (aRoute === route) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });

    if (push) history.pushState({ route }, '', route);
    window.scrollTo({ top: 0, behavior: 'instant' });

    // trigger skill bars if entering /skills
    if (route === '/skills') animateSkillBars();
  }

  // Link handling
  navLinks.forEach(a => a.addEventListener('click', (e) => {
    const route = a.dataset.route || '/';
    e.preventDefault();
    showPage(route, true);
  }));

  // Back/forward support
  window.addEventListener('popstate', (e) => {
    const route = (e.state && e.state.route) || location.pathname || '/';
    showPage(route, false);
  });

  // Initialize at URL
  const initialRoute = location.pathname && pages.some(p => p.dataset.route === location.pathname) ? location.pathname : '/';
  showPage(initialRoute, false);

  // REVEAL animations
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(r => io.observe(r));

  // SKILL BARS animation
  function animateSkillBars() {
    skillFills.forEach(f => {
      const percent = parseInt(f.dataset.fill || '0', 10);
      f.style.width = percent + '%';
    });
  }

  // PROJECT FILTERS
  function applyFilter(filter) {
    if (!projectsGrid) return;
    const cards = Array.from(projectsGrid.querySelectorAll('.project-card'));
    cards.forEach(card => {
      const cats = (card.dataset.category || '').split(/\s+/);
      if (filter === 'all' || cats.includes(filter)) card.classList.remove('hidden');
      else card.classList.add('hidden');
    });
  }
  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter || 'all';
    applyFilter(f);
  }));
  applyFilter('all');

  // PROJECT DETAILS MODAL
  const projectData = {
    p1: {
      title: "Sistem Manajemen Toko Sembako",
      desc: "Sistem berbasis PHP & MySQL untuk pengelolaan stok, transaksi kasir, dan laporan harian. Fokus UX kasir sederhana.",
      tech: "PHP, MySQL, HTML, CSS",
      live: "#",
      src: "#"
    },
    p2: {
      title: "Portofolio Personal",
      desc: "Portofolio front-end responsif dengan fokus performa, aksesibilitas, dan presentasi proyek.",
      tech: "HTML, CSS, JavaScript",
      live: "#",
      src: "#"
    },
    p3: {
      title: "Aplikasi Kasir Sederhana",
      desc: "Aplikasi kasir berbasis browser dengan LocalStorage untuk menyimpan transaksi dan laporan sederhana.",
      tech: "JavaScript, LocalStorage, HTML, CSS",
      live: "#",
      src: "#"
    }
  };

  detailsBtns.forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.project;
    const d = projectData[id];
    if (!d) return;
    modalTitle.textContent = d.title;
    modalDesc.textContent = d.desc;
    modalTech.innerHTML = `<strong>Teknologi:</strong> ${d.tech}`;
    modalLive.href = d.live;
    modalSrc.href = d.src;
    openModal();
  }));

  function openModal() {
    modal && modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const close = modal.querySelector('.modal-close');
    close && close.focus();
  }
  function closeModal() {
    modal && modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  modalClose && modalClose.addEventListener('click', closeModal);
  modal && modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // CONTACT FORM validation & mailto fallback
  function showFieldError(fieldId, msg) { const el = document.getElementById(fieldId); if (el) el.textContent = msg; }
  function clearFieldErrors() { showFieldError('error-name',''); showFieldError('error-email',''); showFieldError('error-message',''); }

  contactForm && contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFieldErrors();
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();
    let valid = true;
    if (name.length < 2) { showFieldError('error-name', 'Masukkan nama (min 2 karakter).'); valid = false; }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) { showFieldError('error-email', 'Masukkan email valid.'); valid = false; }
    if (message.length < 10) { showFieldError('error-message', 'Pesan terlalu singkat (min 10 karakter).'); valid = false; }

    const feedback = document.getElementById('form-feedback');
    if (!valid) { if (feedback) feedback.textContent = 'Periksa kembali form.'; return; }

    const subject = encodeURIComponent('Pesan via Portofolio — ' + name);
    const body = encodeURIComponent(`Nama: ${name}\nEmail: ${email}\n\n${message}`);
    const mailto = `mailto:syauqi@example.com?subject=${subject}&body=${body}`;
    window.location.href = mailto;

    if (feedback) feedback.textContent = 'Terima kasih! Klien email Anda akan terbuka untuk mengirim pesan.';
    contactForm.reset();
  });

  // Quick intro button -> buka laman About
  openIntro && openIntro.addEventListener('click', () => showPage('/about', true));

  // accessibility: Escape focuses main
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') main && main.focus();
  });
});