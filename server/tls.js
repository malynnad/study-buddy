// macOS 下 Node 默认只信任内置根证书，系统钥匙串里安装的企业/代理根证书不会被使用，
// 访问被代理的 HTTPS 接口时会报 "self-signed certificate in certificate chain"。
// 这里把系统钥匙串里的证书合并进 Node 的信任列表，避免模型接口连不上。
import tls from 'node:tls';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { DATA_DIR } from './paths.js';

const KEYCHAINS = [
  '/System/Library/Keychains/SystemRootCertificates.keychain',
  '/Library/Keychains/System.keychain',
  path.join(process.env.HOME || '', 'Library/Keychains/login.keychain-db')
];

const CERT_RE = /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g;

function readKeychainCertificates() {
  const parts = [];
  for (const keychain of KEYCHAINS) {
    try {
      parts.push(execFileSync('security', ['find-certificate', '-a', '-p', keychain], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }));
    } catch {
      /* 钥匙串不存在或无法读取，跳过 */
    }
  }
  return parts.join('\n');
}

export function trustSystemCertificates() {
  if (process.platform !== 'darwin' || typeof tls.setDefaultCACertificates !== 'function') return;

  const cacheFile = path.join(DATA_DIR, 'system-ca.pem');
  let bundle = '';
  try {
    bundle = fs.readFileSync(cacheFile, 'utf8');
  } catch {
    /* 首次运行没有缓存 */
  }
  if (!bundle) {
    bundle = readKeychainCertificates();
    if (bundle) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(cacheFile, bundle, { mode: 0o600 });
      } catch {
        /* 缓存写入失败不影响使用 */
      }
    }
  }

  const extra = bundle.match(CERT_RE) || [];
  if (!extra.length) return;

  const base = tls.getCACertificates('default');
  tls.setDefaultCACertificates([...base, ...extra]);
  console.log(`已载入系统证书 ${extra.length} 张`);
}
