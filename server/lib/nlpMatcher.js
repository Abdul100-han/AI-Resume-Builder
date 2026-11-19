// NLP skill & qualification matcher (no external dependencies).
//
// Pipeline, applied the same way to job vacancies and student profiles:
//   1. Normalise text      lowercase, clean punctuation, collapse whitespace
//   2. Canonicalise skills map aliases to one canonical token (js -> javascript, ml -> machine_learning)
//   3. Tokenise            split into words, drop English stopwords, light plural stemming
//   4. Skill matching      whole-token / whole-phrase comparison, so "java" never matches "javascript"
//   5. TF-IDF + cosine     how close the student's whole profile is to the vacancy's text
//   6. Score               score = 70% skill coverage + 30% context similarity  (0-100)

// ---------------------------------------------------------------------------
// 1. Skill dictionary: canonical token -> aliases (all lowercase)
// Multi-word canonical skills use "_" so they survive tokenisation as one token.
// ---------------------------------------------------------------------------
const SKILL_ALIASES = {
  javascript: ['javascript', 'js', 'ecmascript', 'es6', 'vanilla js'],
  typescript: ['typescript', 'ts'],
  'node.js': ['node.js', 'nodejs', 'node js', 'node'],
  react: ['react', 'reactjs', 'react.js', 'react js'],
  react_native: ['react native'],
  next_js: ['next.js', 'nextjs', 'next js'],
  vue: ['vue', 'vuejs', 'vue.js', 'vue js'],
  angular: ['angular', 'angularjs', 'angular.js'],
  express: ['express', 'expressjs', 'express.js'],
  python: ['python', 'py', 'python3'],
  java: ['java'],
  kotlin: ['kotlin'],
  'c++': ['c++', 'cpp'],
  'c#': ['c#', 'csharp', 'c sharp'],
  dotnet: ['dotnet', 'asp.net', 'asp net'],
  php: ['php'],
  laravel: ['laravel'],
  django: ['django'],
  flask: ['flask'],
  html: ['html', 'html5'],
  css: ['css', 'css3'],
  tailwind: ['tailwind', 'tailwindcss', 'tailwind css'],
  bootstrap: ['bootstrap'],
  sql: ['sql', 'structured query language'],
  mysql: ['mysql', 'my sql'],
  postgresql: ['postgresql', 'postgres', 'postgre sql', 'psql'],
  sqlite: ['sqlite'],
  sql_server: ['sql server', 'mssql', 'ms sql'],
  oracle_db: ['oracle database', 'oracle db', 'oracle'],
  mongodb: ['mongodb', 'mongo', 'mongo db'],
  firebase: ['firebase'],
  database: ['database', 'databases', 'dbms', 'database management', 'database design'],
  machine_learning: ['machine learning', 'ml'],
  deep_learning: ['deep learning', 'dl'],
  artificial_intelligence: ['artificial intelligence', 'ai'],
  data_analysis: ['data analysis', 'data analytics', 'data analyst'],
  excel: ['excel', 'ms excel', 'microsoft excel'],
  power_bi: ['power bi', 'powerbi'],
  microsoft_office: ['microsoft office', 'ms office', 'office suite'],
  git: ['git', 'version control'],
  github: ['github'],
  gitlab: ['gitlab'],
  docker: ['docker'],
  kubernetes: ['kubernetes', 'k8s'],
  aws: ['aws', 'amazon web services'],
  azure: ['azure', 'microsoft azure'],
  gcp: ['gcp', 'google cloud', 'google cloud platform'],
  cloud: ['cloud computing', 'cloud'],
  rest_api: ['rest api', 'rest apis', 'restful api', 'restful apis', 'restful'],
  graphql: ['graphql'],
  ui_ux: ['ui ux', 'ux ui', 'ui and ux', 'user experience', 'user interface design', 'ux'],
  computer_networking: ['computer networking', 'computer networks', 'networking'],
  cybersecurity: ['cybersecurity', 'cyber security', 'information security'],
  communication: ['communication skills', 'communication'],
}

// Generic skill -> specific skills that fully satisfy it (MySQL proves SQL knowledge).
const GENERALISATIONS = {
  database: ['sql', 'mysql', 'postgresql', 'sqlite', 'sql_server', 'oracle_db', 'mongodb', 'firebase'],
  sql: ['mysql', 'postgresql', 'sqlite', 'sql_server', 'oracle_db'],
  javascript: ['typescript'],
  git: ['github', 'gitlab'],
  cloud: ['aws', 'azure', 'gcp'],
  artificial_intelligence: ['machine_learning', 'deep_learning'],
  machine_learning: ['deep_learning'],
}

// Sibling skills that earn half credit (MySQL vs PostgreSQL are related, not identical).
const RELATED_GROUPS = [
  ['mysql', 'postgresql', 'sqlite', 'sql_server', 'oracle_db'],
  ['react', 'vue', 'angular'],
  ['aws', 'azure', 'gcp'],
  ['django', 'flask'],
  ['excel', 'power_bi'],
]

const STOPWORDS = new Set(`
a about above after again against all also am an and any are as at be because been before being below
between both but by can could did do does doing down during each etc few for from further had has have
having he her here hers him his how i if in into is it its itself just me more most my no nor not of off
on once only or other our ours out over own same she should so some such than that the their theirs them
then there these they this those through to too under until up very was we were what when where which
while who whom why will with would you your yours
ability able applicant applicants candidate candidates experience experienced familiarity familiar
good great including job knowledge looking must plus preferred proficiency proficient required
requirement requirements responsibilities responsible role skill skills strong understanding using
well work working year years
`.trim().split(/\s+/))

const SKILL_TOKENS = new Set(Object.keys(SKILL_ALIASES))

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Longest aliases first so "react native" wins over "react" and "sql server" over "sql".
const ALIAS_RULES = Object.entries(SKILL_ALIASES)
  .flatMap(([canonical, aliases]) => aliases.map((alias) => ({ alias, canonical })))
  .sort((a, b) => b.alias.length - a.alias.length)
  .map(({ alias, canonical }) => ({
    canonical,
    // Word boundaries that treat + # . as part of a word, so "c" never matches inside "c++".
    pattern: new RegExp(`(?<![a-z0-9+#._])${escapeRegex(alias)}(?![a-z0-9+#._])`, 'g'),
  }))

// ---------------------------------------------------------------------------
// Step 1: normalisation
// ---------------------------------------------------------------------------
export function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/<[^>]*>/g, ' ') // strip HTML from rich-text resume fields
    .replace(/&/g, ' and ')
    .replace(/\.net\b/g, ' dotnet ')
    .replace(/[/\\|,;:()[\]{}"'!?*•–—-]/g, ' ')
    .replace(/\.(?=\s|$)/g, ' ') // sentence-ending full stops (keeps node.js, asp.net)
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ---------------------------------------------------------------------------
// Step 2: alias / synonym canonicalisation
// ---------------------------------------------------------------------------
export function canonicalizeText(value) {
  let text = ` ${normalizeText(value)} `
  // Pass 1 swaps each alias for a placeholder so a replaced word is never re-matched by a shorter alias.
  const found = []
  for (const { canonical, pattern } of ALIAS_RULES) {
    text = text.replace(pattern, () => {
      found.push(canonical)
      return ` \u0000${found.length - 1}\u0000 `
    })
  }
  return text
    .replace(/\u0000(\d+)\u0000/g, (_, index) => found[Number(index)])
    .replace(/\s+/g, ' ')
    .trim()
}

// ---------------------------------------------------------------------------
// Step 3: tokenisation, stopword removal, light stemming
// ---------------------------------------------------------------------------
function stem(token) {
  if (SKILL_TOKENS.has(token) || /[^a-z]/.test(token) || token.length <= 3) return token
  if (token.endsWith('ies')) return `${token.slice(0, -3)}y`
  if (token.endsWith('s') && !/(ss|us|sis)$/.test(token)) return token.slice(0, -1)
  return token
}

export function tokenize(value) {
  return canonicalizeText(value)
    .split(' ')
    .map((token) => token.replace(/^\.+|\.+$/g, ''))
    .filter((token) => token && !STOPWORDS.has(token))
    .filter((token) => token.length > 1 || SKILL_TOKENS.has(token) || token === 'c' || token === 'r')
    .filter((token) => !/^\d+$/.test(token))
    .map(stem)
}

// ---------------------------------------------------------------------------
// Step 4: skill matching (whole tokens / contiguous phrases only)
// ---------------------------------------------------------------------------
function containsPhrase(tokens, phrase) {
  if (!phrase.length || phrase.length > tokens.length) return false
  for (let i = 0; i <= tokens.length - phrase.length; i += 1) {
    if (phrase.every((token, offset) => tokens[i + offset] === token)) return true
  }
  return false
}

const DISPLAY_NAMES = {
  javascript: 'JavaScript', typescript: 'TypeScript', 'node.js': 'Node.js', next_js: 'Next.js',
  'c++': 'C++', 'c#': 'C#', dotnet: '.NET', php: 'PHP', html: 'HTML', css: 'CSS', sql: 'SQL',
  mysql: 'MySQL', postgresql: 'PostgreSQL', sqlite: 'SQLite', sql_server: 'SQL Server',
  oracle_db: 'Oracle DB', mongodb: 'MongoDB', power_bi: 'Power BI', github: 'GitHub', gitlab: 'GitLab',
  aws: 'AWS', gcp: 'Google Cloud', rest_api: 'REST API', graphql: 'GraphQL', ui_ux: 'UI/UX',
  artificial_intelligence: 'AI', machine_learning: 'Machine Learning',
}

const displaySkill = (token) => {
  if (DISPLAY_NAMES[token]) return DISPLAY_NAMES[token]
  const entry = SKILL_ALIASES[token]
  return entry ? entry[0].replace(/\b\w/g, (c) => c.toUpperCase()) : token
}

export function matchSkills(requiredSkills = [], studentSkills = [], profileText = '') {
  const skillTokenLists = studentSkills.map(tokenize).filter((tokens) => tokens.length)
  const ownedSkills = new Set(skillTokenLists.flat())
  const profileTokens = tokenize(profileText)
  const evidence = new Set([...ownedSkills, ...profileTokens])

  const matched = []
  const partial = []
  const missing = []
  let credit = 0

  for (const skill of requiredSkills.map((s) => String(s || '').trim()).filter(Boolean)) {
    const phrase = tokenize(skill)
    if (!phrase.length) continue

    // a) exact / alias match against the student's skills list
    if (skillTokenLists.some((tokens) => containsPhrase(tokens, phrase))) {
      matched.push({ skill, via: 'skills' })
      credit += 1
      continue
    }
    // b) the same phrase appears in the student's summary, experience or target roles
    if (containsPhrase(profileTokens, phrase)) {
      matched.push({ skill, via: 'profile' })
      credit += 1
      continue
    }

    const key = phrase.length === 1 ? phrase[0] : null
    // c) generic requirement satisfied by a specific skill (e.g. SQL <- MySQL)
    const specific = key && (GENERALISATIONS[key] || []).find((s) => evidence.has(s))
    if (specific) {
      matched.push({ skill, via: 'inferred', from: displaySkill(specific) })
      credit += 1
      continue
    }
    // d) a closely related sibling skill earns half credit (e.g. PostgreSQL for MySQL)
    const group = key && RELATED_GROUPS.find((g) => g.includes(key))
    const sibling = group && group.find((s) => s !== key && evidence.has(s))
    if (sibling) {
      partial.push({ skill, from: displaySkill(sibling) })
      credit += 0.5
      continue
    }
    missing.push(skill)
  }

  const total = matched.length + partial.length + missing.length
  return { matched, partial, missing, coverage: total ? credit / total : null }
}

// ---------------------------------------------------------------------------
// Step 5: TF-IDF vectors + cosine similarity
// ---------------------------------------------------------------------------
function termFrequencies(tokens) {
  const counts = new Map()
  for (const token of tokens) counts.set(token, (counts.get(token) || 0) + 1)
  const length = tokens.length || 1
  for (const [token, count] of counts) counts.set(token, count / length)
  return counts
}

// Smoothed IDF: idf(t) = ln((1 + N) / (1 + df(t))) + 1
export function buildIdf(tokenisedDocs) {
  const df = new Map()
  for (const tokens of tokenisedDocs) {
    for (const token of new Set(tokens)) df.set(token, (df.get(token) || 0) + 1)
  }
  const n = tokenisedDocs.length
  const idf = new Map()
  for (const [token, count] of df) idf.set(token, Math.log((1 + n) / (1 + count)) + 1)
  return idf
}

export function tfidfVector(tokens, idf) {
  const vector = new Map()
  for (const [token, tf] of termFrequencies(tokens)) vector.set(token, tf * (idf.get(token) || 1))
  return vector
}

export function cosineSimilarity(a, b) {
  let dot = 0
  let normA = 0
  let normB = 0
  for (const [token, weight] of a) {
    normA += weight * weight
    if (b.has(token)) dot += weight * b.get(token)
  }
  for (const weight of b.values()) normB += weight * weight
  if (!normA || !normB) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

function topSharedTerms(a, b, limit = 5) {
  return [...a.keys()]
    .filter((token) => b.has(token))
    .sort((x, y) => a.get(y) * b.get(y) - a.get(x) * b.get(x))
    .slice(0, limit)
    .map(displaySkill)
}

// ---------------------------------------------------------------------------
// Step 6: final score
// ---------------------------------------------------------------------------
export const WEIGHTS = { skills: 0.7, context: 0.3 }

export function scoreBand(score) {
  if (score >= 75) return 'Strong'
  if (score >= 50) return 'Good'
  if (score >= 25) return 'Fair'
  return 'Low'
}

// Required skills are repeated so they weigh more than ordinary description words.
const jobDocument = (job) =>
  [job.jobTitle, job.description, ...(job.requiredSkills || []), ...(job.requiredSkills || [])].join(' . ')

const studentDocument = (student) =>
  [...student.skills, ...student.skills, student.department, student.targetRoles, student.profileText].join(' . ')

function explain({ skills, similarity, shared, student, job, jobTokens }) {
  const parts = []
  const required = skills.matched.length + skills.partial.length + skills.missing.length

  if (required) {
    parts.push(`You meet ${skills.matched.length} of ${required} required skills${
      skills.partial.length
        ? ` and partly meet ${skills.partial.map((p) => `${p.skill} (via ${p.from})`).join(', ')}`
        : ''}.`)
    const inferred = skills.matched.filter((m) => m.via === 'inferred')
    if (inferred.length) {
      parts.push(`Inferred: ${inferred.map((m) => `${m.skill} from ${m.from}`).join(', ')}.`)
    }
    if (skills.missing.length) parts.push(`Focus on ${skills.missing.slice(0, 3).join(', ')} to improve this match.`)
  } else {
    parts.push('This vacancy lists no required skills, so the score uses text similarity only.')
  }

  const deptTokens = tokenize(student.department)
  if (deptTokens.length && deptTokens.some((t) => jobTokens.includes(t))) {
    parts.push(`Your department (${student.department}) is relevant to the description.`)
  }
  if (shared.length) {
    parts.push(`Profile and vacancy share key terms: ${shared.join(', ')} (${Math.round(similarity * 100)}% text similarity).`)
  } else if (!required || skills.missing.length === required) {
    parts.push(`Your profile has little in common with the ${job.jobTitle} description.`)
  }
  return parts.join(' ')
}

/**
 * Rank every vacancy for one student.
 * student: { skills: string[], department, targetRoles, profileText }
 */
export function rankJobs(student, jobs) {
  const studentTokens = tokenize(studentDocument(student))
  const jobTokenLists = jobs.map((job) => tokenize(jobDocument(job)))
  const idf = buildIdf([...jobTokenLists, studentTokens])
  const studentVector = tfidfVector(studentTokens, idf)

  return jobs
    .map((job, index) => {
      const jobVector = tfidfVector(jobTokenLists[index], idf)
      const similarity = cosineSimilarity(studentVector, jobVector)
      const skills = matchSkills(
        job.requiredSkills || [],
        student.skills,
        [student.targetRoles, student.profileText].join(' . ')
      )

      const raw = skills.coverage === null
        ? similarity
        : WEIGHTS.skills * skills.coverage + WEIGHTS.context * similarity
      const score = Math.round(Math.min(1, raw) * 100)
      const shared = topSharedTerms(studentVector, jobVector)

      return {
        job,
        score,
        band: scoreBand(score),
        matchedSkills: skills.matched.map((m) => m.skill),
        partialSkills: skills.partial.map((p) => ({ skill: p.skill, related: p.from })),
        missingSkills: skills.missing,
        matchDetails: skills.matched,
        breakdown: {
          skillCoverage: skills.coverage === null ? null : Math.round(skills.coverage * 100),
          textSimilarity: Math.round(similarity * 100),
          weights: WEIGHTS,
        },
        sharedTerms: shared,
        explanation: explain({ skills, similarity, shared, student, job, jobTokens: jobTokenLists[index] }),
      }
    })
    .sort((a, b) => b.score - a.score)
}
