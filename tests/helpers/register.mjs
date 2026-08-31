/**
 * DIVINI exo — Enregistrement du loader de test
 *
 * À passer via `node --import ./tests/helpers/register.mjs`.
 * Séparé du loader car `module.register` doit tourner dans le thread principal
 * avant que les modules de test ne soient résolus.
 */

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./loader.mjs', pathToFileURL(new URL('./', import.meta.url).pathname));
