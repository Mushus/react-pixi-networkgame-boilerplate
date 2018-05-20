interface Config {
  matchingServer: {
    scheme: string,
    url: string
  }
}

let config = {
  matchingServer: {
    scheme: "http",
    url: "localhost:8090/hoge"
  }
}

if (process.env.NODE_ENV === 'production') {
  config = {
    ...config,
    matchingServer: {
      scheme: "http",
      url: "localhost:8090/hoge"
    }
  }
}

export default config