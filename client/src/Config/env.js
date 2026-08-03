const ENV = {
    development: {
      // baseUrl: "https://teamflow-api.bedatatech.com/api",
      baseUrl: "http://localhost:4000/api",
      genCodeAzurefunctionUrl: "https://ticket2pr-func-ddd9hbbcbaa3heaz.eastus-01.azurewebsites.net/api/autogencodefromllm",
    },
    production: {
      baseUrl: "https://teamflow-api.com/api",
      genCodeAzurefunctionUrl: "https://ticket2pr-func-ddd9hbbcbaa3heaz.eastus-01.azurewebsites.net/api/autogencodefromllm",
    },
  };
  
  const currentEnv = process.env.REACT_APP_ENV || "development";
  
  export const baseUrl = ENV[currentEnv].baseUrl;

  export const baseUrlImg = `https://teamflow-api.bedatatech.com/`;

  export const genCodeAzurefunctionUrl = ENV[currentEnv].genCodeAzurefunctionUrl;

  
