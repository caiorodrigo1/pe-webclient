interface Config {
  [key: string]: string;
}

//Session auth needs to use the same origin anyway
export const config: Config = {
  //apiUrl: 'http://localhost:3000',
  //apiUrl: 'http://topdown3.topdownrn.com.br:8081',
  //apiUrl: 'https://rocketconsult.eastus.cloudapp.azure.com',
  apiUrl: 'https://bff.rocketconsultoria.tec.br',
  //authUrl: 'http://localhost:3000/sso/auth',
  //authUrl: 'http://topdown3.topdownrn.com.br:8081/sso',
  //authUrl: 'https://rocketconsult.eastus.cloudapp.azure.com/sso',
  authUrl: 'https://bff.rocketconsultoria.tec.br/sso/auth',
  auth: 'token',
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiV2VzY2xleSIsInN1YiI6Ijg3OTg0MzA3LTY5NjMtNGIxYi05NDllLTc1ODU2OTlkOWE0OSIsImNwZiI6IjE4NjQ4MDM0MDE5IiwidGVuYW50IjoiYzNiNTZjZGItYmE3OS00Nzc1LTg5YWMtNWQxZWI5MGFiMDA2IiwicGVybWlzc2lvbnMiOiJbXCIqXCJdIiwibmJmIjoxNjgxOTUxNjgyLCJleHAiOjE2ODE5NTg4ODIsImlhdCI6MTY4MTk1MTY4MiwiaXNzIjoiaHR0cDovL3NpdGUuY29tLmJyIiwiYXVkIjoicnQgKyBqd3QiLCJtZXRhZGF0YSI6IntcImlkZW50aWZpY2Fkb3JPcmdhb1wiOlwiMTIyMzQ1NlwiLFwic2V0b3Jlc1wiOlt7XCJpZFwiOjQsXCJzaWdsYVwiOlwiU0VUT1IgQVwiLFwiaWRlbnRpZmljYWRvck9yZ2FvXCI6XCIxMjIzNDU2XCJ9XX0ifQ.qZAJkOa-znLRsN_rBAWiwNnhf6OomwcxoeT9XglEAEo',
};
