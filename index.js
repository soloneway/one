// Downloads Xray at boot, writes config from XCFG (base64 JSON), runs it on $PORT.
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const AdmZip = require('adm-zip');
const DIR = '/tmp/xr', BIN = path.join(DIR, 'xray');
const URL = 'https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-' + (process.arch === 'arm64' ? 'arm64-v8a' : '64') + '.zip';
async function main() {
  fs.mkdirSync(DIR, { recursive: true });
  if (!fs.existsSync(BIN)) {
    const r = await fetch(URL, { redirect: 'follow' });
    if (!r.ok) throw new Error('download ' + r.status);
    new AdmZip(Buffer.from(await r.arrayBuffer())).extractAllTo(DIR, true);
    fs.chmodSync(BIN, 0o755);
  }
  const cfg = JSON.parse(Buffer.from(process.env.XCFG || '', 'base64').toString());
  cfg.inbounds[0].port = parseInt(process.env.PORT || '8080', 10);
  fs.writeFileSync(path.join(DIR, 'c.json'), JSON.stringify(cfg));
  const p = spawn(BIN, ['run', '-c', path.join(DIR, 'c.json')], { stdio: 'inherit', env: { ...process.env, XRAY_LOCATION_ASSET: DIR } });
  p.on('exit', c => process.exit(c || 1));
}
main().catch(e => { console.error(e); process.exit(1); });
