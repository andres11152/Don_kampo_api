import swaggerAutogen from 'swagger-autogen';

const outputFile = './swagger.json';
const endpointsFiles = ['./src/index.js'];

const doc = {
  info: {       
    title: 'API DON KAMPO',
    description: 'Esta API PERMITE GESTIONAR LOS DATOS DE LA APLICACIÓN DON KAMPO',
  },  
  host: 'don-kampo-api-5vf3.onrender.com',
  schemes : ['https']
}

swaggerAutogen()(outputFile, endpointsFiles, doc);
