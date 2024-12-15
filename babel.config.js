export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: '20' },
        modules: false, // Asegura que Babel no transforme los módulos
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-transform-async-to-generator',
  ],
};
