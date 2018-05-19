interface Config {
  matchingServerUrl: string
}

let config = {
  matchingServerUrl: "http://localhost:8090/hoge"
}

if (process.env.NODE_ENV === 'production') {
  config = {
    ...config,
    matchingServerUrl: ""
  }
}

export default config