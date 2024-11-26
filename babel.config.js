import { fileURLToPath } from 'url';
import path from 'path';

export default {
  presets: [
    [
      '@babel/preset-env', 
      {
        targets: 'node 20', // Asegúrate de que sea compatible con Node 20.x
        modules: false // No transformar los módulos en CommonJS
      }
    ]
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining', // Plugin para opcional chaining
    '@babel/plugin-transform-runtime' // Optimización del código generado por Babel
  ]
};
