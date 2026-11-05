import { cp, mkdir, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const source = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2] && resolve(process.argv[2]);
if (!target || target === source || target.startsWith(source + '/')) throw new Error('Choose a destination outside the scaffold.');
try { if ((await readdir(target)).length) throw new Error('Destination must be empty.'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
await mkdir(target, { recursive: true });
for (const path of ['index.html','styles.css','src','tests','scripts','package.json','README.md','.gitignore','.github']) {
 await cp(resolve(source,path), resolve(target,path), { recursive: true });
}
console.log(`Created viewer at ${target}`);
