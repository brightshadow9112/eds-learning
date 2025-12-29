/**
 * Fetches markdown content
 */
export async function loadMarkdown(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    const markdown = await response.text();
    return markdown;
  } catch (error) {
    console.error('Error loading markdown:', error);
    return null;
  }
}

/**
 * Converts markdown to HTML sections
 */
export function markdownToSections(markdown) {
  const main = document.querySelector('main');
  main.innerHTML = '';
  
  // Split by horizontal rules to create sections
  const sections = markdown.split(/\n---\n/);
  
  sections.forEach(sectionContent => {
    if (!sectionContent.trim()) return;
    
    const section = document.createElement('div');
    section.classList.add('section');
    section.dataset.sectionStatus = 'initialized';
    
    const wrapper = document.createElement('div');
    wrapper.classList.add('default-content-wrapper');
    
    // Convert markdown to HTML
    let html = sectionContent;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<picture><img src="$2" alt="$1"></picture>');
    
    // Links - convert to buttons if standalone
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
    
    // Lists
    const lines = html.split('\n');
    let inList = false;
    let processedLines = [];
    
    lines.forEach(line => {
      if (line.match(/^[\*\-] /)) {
        if (!inList) {
          processedLines.push('<ul>');
          inList = true;
        }
        processedLines.push(line.replace(/^[\*\-] /, '<li>') + '</li>');
      } else {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push(line);
      }
    });
    if (inList) processedLines.push('</ul>');
    
    html = processedLines.join('\n');
    
    // Paragraphs - wrap non-tag lines
    html = html.split('\n').map(line => {
      line = line.trim();
      if (line && !line.startsWith('<')) {
        return `<p>${line}</p>`;
      }
      return line;
    }).join('\n');
    
    wrapper.innerHTML = html;
    section.appendChild(wrapper);
    main.appendChild(section);
    
    // Mark section as loaded immediately and make it visible
    section.dataset.sectionStatus = 'loaded';
    section.style.display = null;
  });
  
  return main;
}
