module.exports = {
  presets: [
    [
      '@babel/preset-env', 
      {
        targets: 'node 20', // Esto asegura que se transpile para Node.js 20.x
      }
    ]
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining', // Plugin para opcional chaining
    '@babel/plugin-transform-runtime' // Para optimizar el código generado por Babel
  ],
};
