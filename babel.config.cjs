module.exports = {
    presets: [
      [
        "@babel/preset-env",
        {
          "targets": "> 0.25%, not dead", // Esto asegura que Babel transpile el código para los navegadores más comunes
          "useBuiltIns": "entry",
          "corejs": 3
        }
      ]
    ],
    plugins: ["@babel/plugin-proposal-optional-chaining"] // Esto habilita el encadenamiento opcional
  };
  