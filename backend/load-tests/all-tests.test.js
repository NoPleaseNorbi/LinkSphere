import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';

const BASE_URL = 'http://localhost:5000';
const PROJECT_KEY = 'SCRUM'; // replace 
const ACCOUNT_ID = '0c2dd712-fd2c-4d84-b770-bd60342c72bf'; // replace

export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { scenario: 'smoke' },
    },
    average: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m',  target: 10 },
        { duration: '30s', target: 0  },
      ],
      startTime: '30s', // starts after smoke finishes
      tags: { scenario: 'average' },
    },
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '30s', target: 20 },
        { duration: '30s', target: 40 },
        { duration: '30s', target: 80 },
        { duration: '1m',  target: 80 },
        { duration: '30s', target: 0  },
      ],
      startTime: '2m30s', // starts after average finishes
      tags: { scenario: 'stress' },
    },
    save_graph: {
      executor: 'constant-vus',
      vus: 3,
      duration: '1m',
      startTime: '6m', // starts after stress finishes
      tags: { scenario: 'save_graph' },
    },
  },
  thresholds: {
    // Global thresholds
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<5000'],

    // Per scenario thresholds
    'http_req_duration{scenario:smoke}':      ['p(95)<2000'],
    'http_req_duration{scenario:average}':    ['p(95)<2000'],
    'http_req_duration{scenario:stress}':     ['p(95)<5000'],
    'http_req_duration{scenario:save_graph}': ['p(95)<30000'],

    'http_req_failed{scenario:smoke}':        ['rate<0.01'],
    'http_req_failed{scenario:average}':      ['rate<0.01'],
    'http_req_failed{scenario:stress}':       ['rate<0.05'],
    'http_req_failed{scenario:save_graph}':   ['rate<0.01'],
  },
};

export function handleSummary(data) {
  return {
    'load-tests/reports/summary.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// Smoke scenario functions
function smokeTest() {
  const statusRes = http.get(`${BASE_URL}/api/jira/status`);
  check(statusRes, {
    'smoke: status returns 200': (r) => r.status === 200,
    'smoke: has connected field': (r) => {
      try {
        return JSON.parse(r.body).hasOwnProperty('connected');
      } catch { return false; }
    },
  });
  sleep(1);

  const projectsRes = http.get(`${BASE_URL}/api/jira/projects`);
  check(projectsRes, {
    'smoke: projects returns 200 or 400': (r) => r.status === 200 || r.status === 400,
  });
  sleep(1);
}

// Average scenario functions
function averageTest() {
  const statusRes = http.get(`${BASE_URL}/api/jira/status`);
  check(statusRes, { 'average: status is 200': (r) => r.status === 200 });
  sleep(1);

  const projectsRes = http.get(`${BASE_URL}/api/jira/projects`);
  check(projectsRes, { 'average: projects is 200 or 400': (r) => r.status === 200 || r.status === 400 });
  sleep(2);

  const graphRes = http.get(`${BASE_URL}/api/database/project/${PROJECT_KEY}/graph`);
  check(graphRes, {
    'average: graph is 200': (r) => r.status === 200,
    'average: graph has nodes': (r) => {
      try {
        return JSON.parse(r.body).graph?.nodes?.length > 0;
      } catch { return false; }
    },
  });
  sleep(2);

  const responses = http.batch([
    ['GET', `${BASE_URL}/api/database/project/${PROJECT_KEY}/users`],
    ['GET', `${BASE_URL}/api/database/project/${PROJECT_KEY}/statuses`],
    ['GET', `${BASE_URL}/api/database/project/${PROJECT_KEY}/priorities`],
  ]);
  responses.forEach(res => {
    check(res, { 'average: filter endpoint is 200': (r) => r.status === 200 });
  });
  sleep(2);

  const usersRes = http.get(`${BASE_URL}/api/database/users`);
  check(usersRes, { 'average: users is 200': (r) => r.status === 200 });
  sleep(1);

  const userGraphRes = http.get(`${BASE_URL}/api/database/user/${ACCOUNT_ID}/graph`);
  check(userGraphRes, { 'average: user graph is 200': (r) => r.status === 200 });
  sleep(2);
}

// Stress scenario function
function stressTest() {
  const graphRes = http.get(`${BASE_URL}/api/database/project/${PROJECT_KEY}/graph`);
  check(graphRes, {
    'stress: graph returns successfully': (r) => r.status === 200,
  });
  sleep(1);
}

// Save graph scenario function
function saveGraphTest() {
  const res = http.post(
    `${BASE_URL}/api/jira/project/save-graph`,
    JSON.stringify({ projectKey: PROJECT_KEY }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(res, {
    'save_graph: returns 200': (r) => r.status === 200,
    'save_graph: returns success': (r) => {
      try {
        return JSON.parse(r.body).success === true;
      } catch { return false; }
    },
  });
  sleep(5);
}

export default function () {
  const scenario = exec.scenario.name;

  if (scenario === 'smoke')      smokeTest();
  else if (scenario === 'average')    averageTest();
  else if (scenario === 'stress')     stressTest();
  else if (scenario === 'save_graph') saveGraphTest();
}