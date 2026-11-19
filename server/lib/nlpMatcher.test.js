import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  tokenize, canonicalizeText, matchSkills, buildIdf, tfidfVector, cosineSimilarity, rankJobs,
} from './nlpMatcher.js'

test('java does not match javascript (old substring bug)', () => {
  const result = matchSkills(['Java'], ['JavaScript'])
  assert.deepEqual(result.missing, ['Java'])
  assert.equal(result.coverage, 0)
})

test('javascript does not match java either', () => {
  assert.deepEqual(matchSkills(['JavaScript'], ['Java']).missing, ['JavaScript'])
})

test('aliases map to one canonical skill', () => {
  assert.deepEqual(tokenize('JS, TS, NodeJS, React.js, py, ML, AI'),
    ['javascript', 'typescript', 'node.js', 'react', 'python', 'machine_learning', 'artificial_intelligence'])
  assert.equal(matchSkills(['Node.js', 'React', 'Machine Learning'], ['node', 'ReactJS', 'ML']).coverage, 1)
})

test('longer phrases win: react native is not react, sql server is not sql', () => {
  assert.equal(canonicalizeText('React Native and SQL Server'), 'react_native and sql_server')
  assert.deepEqual(matchSkills(['React Native'], ['React']).missing, ['React Native'])
})

test('generic database skills are satisfied by specific ones', () => {
  const result = matchSkills(['SQL', 'Database'], ['MySQL'])
  assert.equal(result.coverage, 1)
  assert.equal(result.matched[0].via, 'inferred')
})

test('related sibling skills earn half credit', () => {
  const result = matchSkills(['MySQL'], ['Postgres'])
  assert.equal(result.partial.length, 1)
  assert.equal(result.coverage, 0.5)
})

test('skills found in profile text count, but only as whole phrases', () => {
  assert.equal(matchSkills(['Python'], [], 'Built data pipelines in Python.').coverage, 1)
  assert.equal(matchSkills(['Customer Service'], [], 'customer feedback service desk').coverage, 0)
})

test('stopwords are removed and plurals are stemmed', () => {
  assert.deepEqual(tokenize('Strong knowledge of the databases and APIs'), ['database', 'api'])
})

test('cosine similarity: identical = 1, unrelated = 0', () => {
  const a = tokenize('python data analysis')
  const b = tokenize('graphic design branding')
  const idf = buildIdf([a, b])
  assert.equal(cosineSimilarity(tfidfVector(a, idf), tfidfVector(a, idf)).toFixed(6), '1.000000')
  assert.equal(cosineSimilarity(tfidfVector(a, idf), tfidfVector(b, idf)), 0)
})

test('rankJobs orders vacancies and explains the score', () => {
  const student = {
    skills: ['JavaScript', 'React', 'MySQL'],
    department: 'Computer Science',
    targetRoles: 'Frontend Developer',
    profileText: 'Final-year computer science student building web applications.',
  }
  const jobs = [
    { _id: '1', jobTitle: 'Java Backend Engineer', description: 'Spring Boot microservices.', requiredSkills: ['Java', 'Spring Boot'] },
    { _id: '2', jobTitle: 'Frontend Developer', description: 'Build web applications with React. Computer science graduates welcome.', requiredSkills: ['JS', 'React', 'SQL'] },
  ]
  const [best, worst] = rankJobs(student, jobs)
  assert.equal(best.job._id, '2')
  assert.deepEqual(best.missingSkills, [])
  assert.equal(worst.score, 0)
  assert.match(best.explanation, /3 of 3 required skills/)
  assert.ok(['Strong', 'Good'].includes(best.band))
})
