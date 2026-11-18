try {
  var t = localStorage.getItem('episafe.theme')
  if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches)) document.documentElement.classList.add('dark')
} catch (e) {}
try {
  // Primera carga de la sesion: el splash estatico (en index.html) calza con la intro animada.
  if (!sessionStorage.getItem('episafe.intro') && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.setAttribute('data-intro', '1')
} catch (e) {}
