const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const address = 'lq1qqwtc98th06ulteyzkegdu8rtyetmrrlcxakml0qtcqgpq3f2tq5j0t0vpx3au2wnpkrthtre4alqlt7z0dc9z0zj0an7wwezt';
const outDir = path.join(__dirname, '../public/assets/crypto');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  // generate razor sharp svg with high error correction and dark background styling
  const svg = await QRCode.toString(address, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });

  const svgPath = path.join(outDir, 'liquid_qr.svg');
  fs.writeFileSync(svgPath, svg, 'utf8');
  console.log('Saved SVG QR code to:', svgPath);

  // also generate a 1024x1024 png version for maximum fallback support
  const pngPath = path.join(outDir, 'liquid_qr.png');
  await QRCode.toFile(pngPath, address, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 600,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
  console.log('Saved PNG QR code to:', pngPath);
}

run().catch(err => {
  console.error('Failed to generate QR:', err);
  process.exit(1);
});

