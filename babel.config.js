module.exports = {
  presets: [
    [
      '@babel/preset-env', 
      {
        targets: 'node 20', // Asegúrate de que sea compatible con Node 20.x
      }
    ]
  ],
  plugins: [
    '@babel/plugin-syntax-optional-chaining', // Plugin para sintaxis de optional chaining
    '@babel/plugin-proposal-optional-chaining', // Plugin para opcional chaining
    '@babel/plugin-transform-runtime' // Optimización del código generado por Babel
  ]
};
