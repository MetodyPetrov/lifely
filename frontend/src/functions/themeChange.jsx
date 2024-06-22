export default function setTheme(t) {
    let theme = localStorage.getItem('theme');
    if(t) theme = t;
    if(theme !== 'default' && theme !== 'dark' && theme !== 'blue') {
      theme = 'default';
    } 
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
      element.style.transition = 'background-color 500ms ease-in-out, color 1000ms ease-in-out';
    });

    document.body.classList = theme;
    localStorage.setItem('theme', theme);
    
    setTimeout(() => {
      elements.forEach(element => {
          element.removeAttribute('style');
      });
    }, 1001);
} 