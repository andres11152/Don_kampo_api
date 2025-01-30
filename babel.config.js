export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: '20' }
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-transform-async-to-generator',
  ],
};
