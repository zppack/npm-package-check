import { execSync } from 'child_process';
import validRange from 'semver/ranges/valid';
import packageJson from 'package-json';
import { semverIntersect } from '@voxpelli/semver-set';
import importGlobal from 'import-global';

const MAX_BUFFER_SIZE = 1024 * 10000;

export const check = async (pkgName, { global = false, cwd = process.cwd() } = {}) => {
  try {
    const jsonResult = execSync(
      `npm ls --json --parseable --depth=0 --global ${global} ${pkgName}`,
      {
        cwd,
        maxBuffer: MAX_BUFFER_SIZE,
      }
    );
    const result = JSON.parse(jsonResult);
    return (result && result.dependencies && result.dependencies[pkgName] && result.dependencies[pkgName].version) ?? null;
  } catch (e) {
    return null;
  }
};

const latestVersion = async (packageName, options = {}) => {
  const { version } = await packageJson(packageName.toLowerCase(), options);
  return version;
}

const getWantVersion = async (pkgName, pkgVersion) => {
  if (pkgVersion === 'latest') {
    return await latestVersion(pkgName);
  }
  if (validRange(pkgVersion)) {
    return pkgVersion;
  }
  return null;
}

export const checkVersion = async (pkgName, pkgVersion, { global = false, cwd = process.cwd() } = {}) => {
  const wantVersion = await getWantVersion(pkgName, pkgVersion);
  if (!wantVersion) {
    return null;
  }
  const version = await check(pkgName, { global, cwd });
  if (!version) {
    return null;
  }
  const intersectionVer = semverIntersect(wantVersion, version);
  return intersectionVer;
};

export const INSTALL_OPTS = {
  global: '--global',
  devDependence: '--save-dev',
  dependence: '--save',
};

export const checkAndInstall = async (pkgName, { global = false, dev = false, cwd = process.cwd() } = {}) => {
  const version = await check(pkgName, { global, cwd });
  if (version) {
    return true;
  }
  const installOpts = global ? INSTALL_OPTS.global : (dev ? INSTALL_OPTS.devDependence : INSTALL_OPTS.dependence);
  execSync(`npm install ${installOpts} ${pkgName}`, { cwd });
  return false;
};

export const checkVersionAndInstall = async (pkgName, pkgVersion, { global = false, dev = false, cwd = process.cwd() } = {}) => {
  const version = await checkVersion(pkgName, pkgVersion, { global, cwd });
  if (version) {
    return true;
  }
  const installOpts = global ? INSTALL_OPTS.global : (dev ? INSTALL_OPTS.devDependence : INSTALL_OPTS.dependence);
  execSync(`npm install ${installOpts} ${pkgName}@${pkgVersion}`, { cwd });
  return false;
};

export const ensureImport = async (pkgName, { installOpts = INSTALL_OPTS.dependence, cwd = process.cwd() } = {}) => {
  const localVersion = await check(pkgName, { global: false, cwd });
  if (localVersion) {
    // import from local if installed
    return await import(pkgName);
  }
  const globalVersion = await check(pkgName, { global: true, cwd });
  if (globalVersion) {
    // import from global if installed
    return importGlobal(pkgName);
  }
  // to install
  execSync(`npm install ${installOpts} ${pkgName}`, { cwd });
  // import from where installed
  return installOpts === INSTALL_OPTS.global ? importGlobal(pkgName) : await import(pkgName);
}

export const ensureVersionImport = async (pkgName, pkgVersion, { installOpts = INSTALL_OPTS.dependence, cwd = process.cwd() } = {}) => {
  const localVersion = await checkVersion(pkgName, pkgVersion, { global: false, cwd });
  if (localVersion) {
    // import from local if installed
    return await import(pkgName);
  }
  const globalVersion = await checkVersion(pkgName, pkgVersion, { global: true, cwd });
  if (globalVersion) {
    // import from global if installed
    return importGlobal(pkgName);
  }
  // to install specific version package
  execSync(`npm install ${installOpts} ${pkgName}@${pkgVersion}`, { cwd });
  // import from where installed
  return installOpts === INSTALL_OPTS.global ? importGlobal(pkgName) : await import(pkgName);
}
