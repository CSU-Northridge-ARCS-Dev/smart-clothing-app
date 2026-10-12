// createURL mirrors what Expo Go returns; parse reads the query string.
const mock = {
  createURL: jest.fn((path) => `exp://127.0.0.1:8081/--/${path}`),
  parse: jest.fn((url) => {
    const [base, query = ""] = url.split("?");
    const queryParams = {};
    for (const pair of query.split("&").filter(Boolean)) {
      const [k, v = ""] = pair.split("=");
      queryParams[decodeURIComponent(k)] = decodeURIComponent(v);
    }
    return { path: base.split("/--/")[1] || null, queryParams };
  }),
};

module.exports = mock;
