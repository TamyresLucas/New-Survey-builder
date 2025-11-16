import React from 'react';
import ReactDOM from 'react-dom/client';

// Capturar erros não tratados ANTES de qualquer coisa
window.addEventListener('error', (event) => {
  console.error('❌ Erro global capturado:', event.error);
  console.error('❌ Detalhes:', event.message, event.filename, event.lineno);
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="padding: 20px; color: red; font-family: monospace;">
        <h1>❌ Erro JavaScript Detectado</h1>
        <p><strong>Mensagem:</strong> ${event.message}</p>
        <p><strong>Arquivo:</strong> ${event.filename}</p>
        <p><strong>Linha:</strong> ${event.lineno}</p>
        <pre style="background: #f0f0f0; padding: 10px; overflow: auto;">${event.error?.stack || 'Sem stack trace'}</pre>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promise rejeitada:', event.reason);
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="padding: 20px; color: red;">
        <h1>❌ Erro de Promise</h1>
        <pre>${String(event.reason)}</pre>
      </div>
    `;
  }
});

console.log('🚀 Iniciando aplicação...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Elemento root não encontrado!');
  throw new Error("Could not find root element to mount to");
}

console.log('✅ Elemento root encontrado');

// Teste simples primeiro
try {
  console.log('🔄 Tentando importar App...');
  import('./App').then(({ default: App }) => {
    console.log('✅ App importado com sucesso');
    
    import('./contexts/ThemeContext').then(({ ThemeProvider }) => {
      console.log('✅ ThemeProvider importado com sucesso');
      
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </React.StrictMode>
      );
      console.log('✅ Aplicação renderizada!');
    }).catch((err) => {
      console.error('❌ Erro ao importar ThemeProvider:', err);
      rootElement.innerHTML = `
        <div style="padding: 20px; color: red;">
          <h1>❌ Erro ao importar ThemeProvider</h1>
          <pre>${err.message}\n${err.stack}</pre>
        </div>
      `;
    });
  }).catch((err) => {
    console.error('❌ Erro ao importar App:', err);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red;">
        <h1>❌ Erro ao importar App</h1>
        <pre>${err.message}\n${err.stack}</pre>
        <p>Verifique o console do navegador para mais detalhes.</p>
      </div>
    `;
  });
} catch (error) {
  console.error('❌ Erro ao renderizar:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; color: red;">
      <h1>❌ Erro ao inicializar a aplicação</h1>
      <p>${error instanceof Error ? error.message : String(error)}</p>
      <pre>${error instanceof Error ? error.stack : ''}</pre>
    </div>
  `;
}