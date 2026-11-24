const get = id => document.getElementById(id);
const report = get('report');
const sections = Array.from(document.querySelectorAll('.report-section'));
const chapterNames = ['The project','Our goal','The platform structure','The database','The thing itself','My contribution','Outcomes & next steps','What I learned'];
let current = 0;
let scheduled = false;

function updatePosition() {
  const cursor = report.scrollTop + report.clientHeight * 0.32;
  current = Math.max(0, sections.findLastIndex(section => section.offsetTop <= cursor));
  get('position').textContent = chapterNames[current];
  get('previous').disabled = current === 0;
  get('next').disabled = current === sections.length - 1;
}
function goTo(index, behavior = 'smooth') {
  if (index < 0 || index >= sections.length) return;
  const section = sections[index];
  history.pushState(null, '', '#' + section.id);
  report.scrollTo({top:section.offsetTop,behavior});
}
for (const link of document.querySelectorAll('a[href^="#"]')) {
  link.addEventListener('click', event => {
    const index = sections.findIndex(section => '#' + section.id === link.hash);
    if (index < 0) return;
    event.preventDefault();
    goTo(index);
  });
}
report.addEventListener('scroll', () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { updatePosition(); scheduled = false; });
}, {passive:true});
get('previous').onclick = () => goTo(current - 1);
get('next').onclick = () => goTo(current + 1);
function restoreHash() {
  const hash = ['#create','#experience'].includes(location.hash) ? '#explore' : location.hash;
  const index = sections.findIndex(section => '#' + section.id === hash);
  if (index >= 0) report.scrollTo({top:sections[index].offsetTop,behavior:'instant'});
  updatePosition();
}
window.addEventListener('popstate', restoreHash);
document.addEventListener('keydown', event => {
  if (document.querySelector('dialog[open]') || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const destination = {ArrowRight:current+1,PageDown:current+1,ArrowLeft:current-1,PageUp:current-1,Home:0,End:sections.length-1};
  if (!Object.hasOwn(destination,event.key)) return;
  event.preventDefault();
  goTo(destination[event.key]);
});

function openImage(src, title) {
  const image = get('image-full');
  image.src = src;
  image.alt = title;
  image.classList.toggle('matrix', src.includes('catalogue-matrix'));
  get('image-title').textContent = title;
  get('image-dialog').showModal();
}
document.querySelectorAll('[data-zoom]').forEach(image => {
  image.tabIndex = 0;
  image.setAttribute('role','button');
  image.setAttribute('aria-label','Enlarge ' + (image.dataset.label || image.alt));
  const open = () => openImage(image.dataset.full || image.src, image.dataset.label || image.alt);
  image.onclick = open;
  image.onkeydown = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } };
});
document.querySelectorAll('[data-image]').forEach(button => {
  button.onclick = () => openImage(button.dataset.image,button.dataset.label);
});
document.querySelectorAll('[data-close]').forEach(button => { button.onclick = () => get(button.dataset.close).close(); });
const deckTitles = ['Project cover','From cultural resources to visual assets','Colour and pattern database','Collection atlas','Collection atlas — alternative view','Same-colour comparison','Object and colour graph','Filtered colour relationships','Object details','Pattern exploration','Pattern workshop','Chime bells','Six workflows','Platform architecture','Closing'];
get('deck-grid').innerHTML = deckTitles.map((title,i) => {
  const file = i === 12 ? 'slide-13-video-still.webp' : 'slide-' + String(i+1).padStart(2,'0') + '.webp';
  return '<button data-slide-image="assets/deck/' + file + '"><img loading="lazy" src="assets/deck/' + file + '" alt="' + title + '"><span>' + String(i+1).padStart(2,'0') + ' · ' + title + '</span></button>';
}).join('');
get('deck-grid').onclick = event => {
  const button = event.target.closest('[data-slide-image]');
  if (button) openImage(button.dataset.slideImage,button.querySelector('span').textContent);
};
get('deck-button').onclick = () => get('deck-dialog').showModal();
get('credits-button').onclick = () => get('credits-dialog').showModal();
get('fullscreen').hidden = !document.fullscreenEnabled;
get('fullscreen').onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { get('fullscreen').hidden = true; }
};
document.addEventListener('fullscreenchange', () => {
  get('fullscreen').setAttribute('aria-label',document.fullscreenElement ? 'Exit full screen' : 'Enter full screen');
});
window.addEventListener('load', restoreHash);
updatePosition();
