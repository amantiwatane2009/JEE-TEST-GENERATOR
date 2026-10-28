const QUESTION_PAGE_SIZE = 1000;

async function loadQuestionBank() {
  const config = window.SUPABASE_CONFIG;
  if (!config?.url || !config?.publishableKey) {
    throw new Error('Supabase client configuration is missing.');
  }

  const questions = [];
  let offset = 0;
  while (true) {
    const endpoint = new URL('/rest/v1/jee_questions', config.url);
    endpoint.searchParams.set('select', 'source_file,question_id,question');
    endpoint.searchParams.set('order', 'source_file.asc,question_id.asc');
    endpoint.searchParams.set('limit', String(QUESTION_PAGE_SIZE));
    endpoint.searchParams.set('offset', String(offset));

    const response = await fetch(endpoint, {
      headers: { apikey: config.publishableKey, Accept: 'application/json' }
    });
    if (!response.ok) {
      throw new Error('Supabase returned HTTP ' + response.status + '.');
    }

    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Supabase returned an invalid question page.');
    for (const row of rows) {
      let question = row.question;
      if (typeof question === 'string') question = JSON.parse(question);
      if (!question || typeof question !== 'object' || Array.isArray(question)) {
        throw new Error('Invalid question record ' + row.source_file + ':' + row.question_id + '.');
      }
      questions.push(question);
    }

    if (rows.length < QUESTION_PAGE_SIZE) break;
    offset += rows.length;
  }
  return questions;
}

const localQuestions = [
  ...(window.CHEMICAL_EQUILIBRIUM_QUESTIONS || []),
  ...(window.GOC_QUESTIONS || []),
  ...(window.MATHS_DIFFERENTIAL_EQUATIONS_QUESTIONS || []),
  ...(window.RESPIRATION_IN_PLANTS_QUESTIONS || [])
];
window.JEE_BANK_READY = loadQuestionBank()
  .then(questions => [...questions, ...localQuestions])
  .catch(error => {
    if (!localQuestions.length) throw error;
    console.warn('Supabase is unavailable; loading the local question banks.');
    return localQuestions;
  });
