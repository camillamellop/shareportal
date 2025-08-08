#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Padrões de logs para remover
const logPatterns = [
  /console\.log\([^)]*\);?/g,
  /console\.debug\([^)]*\);?/g,
  /console\.info\([^)]*\);?/g,
];

// Padrões de logs para manter (erros e warnings)
const keepPatterns = [
  /console\.error\(/,
  /console\.warn\(/,
];

function shouldKeepLog(line) {
  return keepPatterns.some(pattern => pattern.test(line));
}

function cleanupFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    
    const cleanedLines = lines.map(line => {
      const trimmedLine = line.trim();
      
      // Verificar se é um log que deve ser mantido
      if (shouldKeepLog(trimmedLine)) {
        return line;
      }
      
      // Verificar se é um log que deve ser removido
      const shouldRemove = logPatterns.some(pattern => pattern.test(trimmedLine));
      
      if (shouldRemove) {
        modified = true;
        console.log(`Removendo log de: ${filePath}`);
        console.log(`  Linha: ${trimmedLine}`);
        return line.replace(/^\s*/, '// ') + ' // Removed by cleanup script';
      }
      
      return line;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, cleanedLines.join('\n'));
      console.log(`✅ Arquivo limpo: ${filePath}`);
    }
    
    return modified;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

function cleanupProject() {
  console.log('🧹 Iniciando limpeza de logs...\n');
  
  // Encontrar todos os arquivos TypeScript/JavaScript
  const files = glob.sync('src/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
  });
  
  let totalModified = 0;
  
  files.forEach(file => {
    const modified = cleanupFile(file);
    if (modified) {
      totalModified++;
    }
  });
  
  console.log(`\n📊 Resumo:`);
  console.log(`   Arquivos processados: ${files.length}`);
  console.log(`   Arquivos modificados: ${totalModified}`);
  console.log(`\n✅ Limpeza concluída!`);
  
  if (totalModified > 0) {
    console.log(`\n💡 Dica: Use o logger centralizado em src/utils/logger.ts para logs futuros.`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  cleanupProject();
}

module.exports = { cleanupFile, cleanupProject };
