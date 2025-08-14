// Script para testar imports dinâmicos do App.tsx
// Comenta todos os React.lazy, descomenta um a um e executa o build para identificar qual está quebrando

const fs = require('fs');
const path = require('path');

const appPath = path.resolve(__dirname, '../src/App.tsx');
const original = fs.readFileSync(appPath, 'utf-8');

// Encontra todos os React.lazy
const lazyRegex = /(const\s+\w+\s*=\s*React\.lazy\([^;]+;)/g;
const matches = [...original.matchAll(lazyRegex)];

if (matches.length === 0) {
  console.log('Nenhum React.lazy encontrado.');
  process.exit(0);
}

console.log(`Encontrados ${matches.length} imports React.lazy.`);

for (let i = 0; i < matches.length; i++) {
  // Comenta todos
  let testCode = original.replace(lazyRegex, match => '// ' + match);
  // Descomenta só o atual
  const current = matches[i][0];
  testCode = testCode.replace('// ' + current, current);
  fs.writeFileSync(appPath, testCode, 'utf-8');
  console.log(`\nTestando import ${i + 1}/${matches.length}:\n${current}`);
  // Executa build
  const result = require('child_process').spawnSync('npm', ['run', 'build'], { stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    console.log(`\nERRO encontrado no import:\n${current}`);
    break;
  }
}

// Restaura o arquivo original
ds = fs.createWriteStream(appPath);
ds.write(original);
ds.end();
console.log('\nTeste finalizado. App.tsx restaurado.');
