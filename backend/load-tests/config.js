export const BASE_URL = 'http://localhost:5000';

export const defaultOptions = {
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2 seconds
    http_req_failed: ['rate<0.01'],    // less than 1% failure rate
  },
};