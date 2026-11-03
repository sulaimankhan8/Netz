// node --import ./tests/engines/register.mjs … — see resolve-hook.mjs
import { register } from 'node:module';

register('./resolve-hook.mjs', import.meta.url);
