# npm-package-check

This is a tool to help check installed npm packages and even install and import them. It works like a charm!

## Features

1. **check**: To check whether a npm package is installed locally or globally.

1. **checkVersion**: To check whether a specific version of a npm package is installed locally or globally.

1. **checkAndInstall** & **checkVersionAndInstall**: You can choose to install the package after checking if it is not installed.

1. **ensureImport** & **ensureVersionImport**: Import a npm package without caring about anything!

    If it's installed locally, it will be imported from local node_modules.

    If it's installed globally, it will be imported from global installed packages.

    If it's not installed anywhere, it will be installed and then imported. You can config installing parameters `-g` or `-S` or `-D`.

    The priority is like `local dependence -> global dependence -> to install`.

## Start

### Install

```sh
npm install --save-dev npm-package-check
```

### Usage

```js
import {
    check,
    checkVersion,
    checkAndInstall,
    checkVersionAndInstall,
    INSTALL_OPTS,
    ensureImport,
    ensureVersionImport,
} from 'npm-package-check';
```

All functions are ASYNC functions!

You see that every function has a similar function to it which containes `Version` in its function name. That is to specify a version you want.

#### Check functions

Only do checks, don't install or import.

##### check

```js
const pkgName = 'one-package-name';
const retVal = await check(
    pkgName, // package name
    {
        global: false, // default: false
        cwd: process.cwd(), // default process.cwd()
    } // default: {}
);
```

This function `check` only helps checking if a package is installed.

By default it checks locally installed packages. And you can add a `global: true` options to check globally. (The following is similar and will not repeat.)

If the package has been installed already, returns the version string, else returns null.

##### checkVersion

```js
const pkgName = 'one-package-name';
const pkgVersion = 'latest'; // support semver and range and "latest" distTag
const retVal = await checkVersion(
    pkgName, // package name
    pkgVersion, // a semver range you want
    {
        global: false, // default: false
        cwd: process.cwd(), // default process.cwd()
    } // default: {}
);
```

This function `checkVersion` is to check whether the package is installed with the version `pkgVersion` you want.

If the package is not installed, or is installed but not satisfy the version, returns null, else returns the version string.

It's worth mentioning that the `pkgVersion` field you give can be a semver range, like `^1.1.0` and `~2.0.0 || >=3.0.0`, and so on.

The value `"latest"` distTag is also allowed for `pkgVersion` field, in which case, it will first fetch the exact latest version and then do checks.

#### Install functions

Do checks, and install if not installed

##### checkAndInstall

```js
const pkgName = 'one-package-name';
const retVal = await checkAndInstall(
    pkgName, // package name
    {
        global: false, // default: false
        dev: false, // default: false
        cwd: process.cwd(), // default process.cwd()
    } // default: {}
);
```

This function `checkAndInstall` is to check and install a package not installed.

If the package is not installed, will install it and return false after installation done. If the package has been installed already, returns true.

When installing a pacakge, it will add the package to `dependencies` of package.json. Set a `dev = true` option will change it to `devDependencies`. The `dev` option will be ignored when a `global = true` option is set.

##### checkVersionAndInstall

```js
const pkgName = 'one-package-name';
const pkgVersion = '^2.1.0';
const retVal = await checkVersionAndInstall(
    pkgName, // package name
    pkgVersion, // a semver range you want
    {
        global: false, // default: false
        dev: false, // default: false
        cwd: process.cwd(), // default process.cwd()
    } // default: {}
);
```

Much the same to `checkVersion` in checking part, but some differencies in installing part.

**IMPORTANT!** If the package has been already installed but there is no intersection between the installed package version and the `pkgVersion` you want, it will install the `pkgVersion` of the package and **OVERWRITE dependencies** or devDependencies in package.json, which may destroy the original program. So make sure you do know what you are doing.

#### Import functions

Do checks, install what not installed, and import

##### INSTALL_OPTS

```js
import { INSTALL_OPTS } from 'npm-package-check';

console.log(INSTALL_OPTS.global); // '-g'
console.log(INSTALL_OPTS.dependence); // '-S'
console.log(INSTALL_OPTS.devDependence); // '-D'
```

This is a constant value map for options of installing.

##### ensureImport

```js
const pkgName = 'one-package-name';
const retVal = await checkAndInstall(
    pkgName, // package name
    {
        installOpts: INSTALL_OPTS.dependence, // default: INSTALL_OPTS.dependence
        cwd: process.cwd(), // default process.cwd()
    } // default: {}
);
```

This function `ensureImport` is to import a package in code without caring about whether or where it is installed.

It will check local dependencies and global dependencies and then install the package if not found, and finally import the package and return it in a promise.

The `installOpts` option is to config npm install. If not found, where to install the package depends on this option.

Default value is INSTALL_OPTS.dependence, that will add `-S` option to `npm install` operation.
INSTALL_OPTS.devDependence option adds `-D` and INSTALL_OPTS.global option adds `-g`.

##### ensureVersionImport

```js
const pkgName = 'one-package-name';
const pkgVersion = '1.9.1 || ~2.5.1 || ^3.0.0';
const retVal = await ensureVersionImport(
    pkgName,
    pkgVersion,
    {
        installOpts: INSTALL_OPTS.dependence, // default: INSTALL_OPTS.dependence
        cwd: process.cwd(), // default process.cwd()
    } // default: {}
);
```

Similar to `checkVersionAndInstall` function. And also need to know about "version overwritten in package.json".

The difference is the return value, return value is the same to `ensureImport` function.

## Recently changes

See the [change log](CHANGELOG.md).

## License

[MIT](LICENSE)
