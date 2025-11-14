const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
const inputFile = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../public');

async function generateIcons() {
  console.log('🎨 Gerando ícones PWA...\n');
  
  // Verificar se o arquivo de entrada existe
  if (!fs.existsSync(inputFile)) {
    console.error('❌ Arquivo logo.png não encontrado em public/');
    process.exit(1);
  }

  let successCount = 0;
  let errorCount = 0;

  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(inputFile)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png({ quality: 100, compressionLevel: 9 })
        .toFile(outputFile);
      
      console.log(`✅ Criado: icon-${size}x${size}.png`);
      successCount++;
    } catch (error) {
      console.error(`❌ Erro ao criar icon-${size}x${size}.png:`, error.message);
      errorCount++;
    }
  }

  // Criar favicon.ico (usando 32x32)
  try {
    await sharp(inputFile)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(outputDir, 'favicon-32x32.png'));
    
    console.log('✅ Criado: favicon-32x32.png');
    successCount++;
  } catch (error) {
    console.error('❌ Erro ao criar favicon:', error.message);
    errorCount++;
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   ✅ Sucesso: ${successCount} ícones`);
  if (errorCount > 0) {
    console.log(`   ❌ Erros: ${errorCount} ícones`);
  }
  console.log('\n✨ Ícones PWA gerados com sucesso!');
}

generateIcons().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
