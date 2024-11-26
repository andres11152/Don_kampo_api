export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: '20' }, // Compatibilidad con Node.js v20
        modules: false, // Mantener ES Modules
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining', // Manejar operador opcional (?.)
    '@babel/plugin-transform-runtime', // Reducir duplicados en código transpilado
    '@babel/plugin-transform-async-to-generator', // Convertir async/await a generadores
  ],
};
