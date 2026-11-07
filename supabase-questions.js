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
  ...(window.IONIC_EQUILIBRIUM_QUESTIONS || []),
  ...(window.GOC_QUESTIONS || []),
  ...(window.D_F_BLOCK_QUESTIONS || []),
  ...(window.SOLID_STATE_SOLUTIONS_ELECTROCHEM_QUESTIONS || []),
  ...(window.CHEMICAL_KINETICS_QUESTIONS || []),
  ...(window.PERIODIC_TABLE_QUESTIONS || []),
  ...(window.CHEMICAL_BONDING_QUESTIONS || []),
  ...(window.SALT_ANALYSIS_QUESTIONS || []),
  ...(window.S_BLOCK_QUESTIONS || []),
  ...(window.P_BLOCK_QUESTIONS || []),
  ...(window.COORDINATION_COMPOUNDS_QUESTIONS || []),
  ...(window.SOME_BASIC_CONCEPTS_QUESTIONS || []),
  ...(window.STRUCTURE_OF_ATOM_QUESTIONS || []),
  ...(window.REDOX_REACTIONS_QUESTIONS || []),
  ...(window.CHEMICAL_THERMODYNAMICS_QUESTIONS || []),
  ...(window.MATHS_DIFFERENTIAL_EQUATIONS_QUESTIONS || []),
  ...(window.MATHS_INTEGRATION_AOI_QUESTIONS || []),
  ...(window.MATHS_STRAIGHT_LINES_CONICS_QUESTIONS || []),
  ...(window.VECTOR_ALGEBRA_QUESTIONS || []),
  ...(window.MATHS_SETS_LOG_QUADRATIC_QUESTIONS || []),
  ...(window.MATHS_SEQUENCES_SERIES_BINOMIAL_THEOREM_QUESTIONS || []),
  ...(window.MATHS_COMPLEX_3D_STATISTICS_MATRICES_PNC_PROBABILITY_QUESTIONS || []),
  ...(window.MATHS_FUNCTIONS_LIMITS_DIFF_AOD_QUESTIONS || []),
  ...(window.MATHS_TRIGONOMETRY_QUESTIONS || []),
  ...(window.RESPIRATION_IN_PLANTS_QUESTIONS || []),
  ...(window.HYDROCARBONS_QUESTIONS || []),
  ...(window.HALOALKANES_HALOARENES_QUESTIONS || []),
  ...(window.ALCOHOLS_PHENOLS_ETHERS_QUESTIONS || []),
  ...(window.ALDEHYDES_KETONES_CARBOXYLIC_ACIDS_QUESTIONS || []),
  ...(window.BIOMOLECULES_QUESTIONS || []),
  ...(window.COMPOUNDS_CONTAINING_NITROGEN_QUESTIONS || [])
];
window.JEE_BANK_READY = loadQuestionBank()
  .then(questions => [...questions, ...localQuestions])
  .catch(error => {
    if (!localQuestions.length) throw error;
    console.warn('Supabase is unavailable; loading the local question banks.');
    return localQuestions;
  });
