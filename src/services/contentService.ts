import { CategoryKey, ReadingPiece, CATEGORIES } from '../types';
import { fetchQuestions } from './questionsService';

// Expanded 14-discipline curated vault with rich abstracts
export const CURATED_PIECES: Record<CategoryKey, Array<{ title: string; summary: string; url: string; source: string }>> = {
  science: [
    {
      title: "Self-Organized Criticality in Neural Information Processing",
      summary: "Cortical networks operate near a non-equilibrium critical point between order and chaos. In this regime, known as self-organized criticality, information transmission capacity, dynamic range of sensory inputs, and the diversity of collective states are simultaneously maximized. We demonstrate how homeostatic synaptic plasticity tunes recurrent inhibitory-excitatory loops to preserve criticality despite fluctuating sensory noise.",
      url: "https://arxiv.org/abs/2304.09812",
      source: "arXiv (q-bio.NC / Physics)"
    },
    {
      title: "Topological Defects and Phase Transitions in Active Nematic Matter",
      summary: "Active fluids powered by internal microscopic engines defy equilibrium thermodynamics. We report the spontaneous formation and annihilation of half-integer topological defects in dense bacterial suspensions and cell monolayers. These defect dynamics govern macroscopic turbulent flows and generate self-sustained mechanical stresses capable of driving morphogenetic rearrangements.",
      url: "https://arxiv.org/abs/2209.11245",
      source: "arXiv (physics.gen-ph)"
    }
  ],
  philosophy: [
    {
      title: "The Epistemic Value of Disagreement and Intellectual Humility",
      summary: "When two epistemic peers discover they hold contradictory beliefs on the same evidence, rationality seems to demand conciliation: lowering one's confidence. Yet radical conciliation risks skepticism, while steadfastness invites dogmatism. We examine how intellectual humility functions not as passive uncertainty, but as calibrated openness to counter-reasons without epistemic surrender.",
      url: "https://aeon.co/essays/the-virtue-of-intellectual-humility-in-polarised-times",
      source: "Aeon (Philosophy & Ideas)"
    },
    {
      title: "The Problem of Future Generations and Intergenerational Ethics",
      summary: "Derek Parfit's 'Non-Identity Problem' demonstrates that policies adopted today alter which specific individuals will exist in centuries to come. Because different decisions cause different people to be born, we cannot easily claim that a polluting policy harms a future person if they would never have existed without it. Resolving this dilemma requires rethinking rights and welfare beyond individualist frameworks.",
      url: "https://plato.stanford.edu/entries/nonidentity-problem/",
      source: "Stanford Encyclopedia of Philosophy"
    }
  ],
  psychology: [
    {
      title: "The Illusion of Explanatory Depth and Cognitive Scaffolding",
      summary: "People believe they understand complex mechanisms (e.g., how a zipper, a toilet, or economic inflation works) far better than they actually do. When prompted to write down step-by-step causal explanations, self-assessed understanding drops dramatically. This illusion arises because humans conflate knowledge stored in their social environment with knowledge stored in their own brains.",
      url: "https://pubmed.ncbi.nlm.nih.gov/12444748/",
      source: "PubMed (Cognitive Psychology)"
    },
    {
      title: "Attention Restoration Theory: Nature Micro-Breaks and Executive Function",
      summary: "Direct attention requires voluntary mental effort and is susceptible to cognitive depletion. Attention Restoration Theory posits that exposure to natural environments engages involuntary fascination ('soft fascination'), allowing prefrontal executive control networks to recover baseline capacity. Randomized trials show significant working memory improvements following brief exposures to fractal natural stimuli.",
      url: "https://pubmed.ncbi.nlm.nih.gov/25678123/",
      source: "PubMed (Experimental Psychology)"
    }
  ],
  neuroscience: [
    {
      title: "Predictive Processing and the Bayesian Architecture of Perception",
      summary: "Rather than passively receiving bottom-up sensory streams, the human brain functions as an active predictive engine. High-level cortical regions project continuous top-down predictions regarding sensory causes, while afferent nerves transmit only residual prediction errors. Hallucinations and cognitive biases emerge when hyper-precise priors override contradictory sensory evidence.",
      url: "https://pubmed.ncbi.nlm.nih.gov/24055106/",
      source: "PubMed (Cognitive Neuroscience)"
    },
    {
      title: "Default Mode Network Suppression and Meditative Absorption States",
      summary: "The Default Mode Network (DMN), anchored in the medial prefrontal cortex and posterior cingulate cortex, orchestrates self-referential narrative contemplation and rumination. Functional neuroimaging reveals that deep contemplative focus and psilocybin-assisted therapy decouple DMN connectivity, liberating unconstrained functional crosstalk between normally segregated sensory modules.",
      url: "https://pubmed.ncbi.nlm.nih.gov/29532822/",
      source: "PubMed (Neuroimaging)"
    }
  ],
  astronomy: [
    {
      title: "Atmospheric Disequilibrium Biosignatures on Temperate Terrestrial Exoplanets",
      summary: "Searching for extraterrestrial metabolisms requires identifying chemical species in planetary atmospheres that cannot co-exist in thermodynamic equilibrium without continuous biological replenishment. We evaluate simultaneous spectroscopic detections of methane (CH4) and oxygen (O2) on M-dwarf orbiting terrestrial planets, ruling out abiotic volcanic and photochemical false positives.",
      url: "https://arxiv.org/abs/2302.04512",
      source: "arXiv (astro-ph.EP)"
    },
    {
      title: "Gravitational Wave Sirens and the Cosmological Expansion Tension",
      summary: "Independent measurements of the Hubble constant using the cosmic microwave background and Type Ia supernovae diverge by more than 5 sigma. Coincident detection of gravitational waves and electromagnetic counterparts from merging binary neutron stars acts as a 'standard siren', measuring cosmic distances directly from general relativity without ladder calibrations.",
      url: "https://arxiv.org/abs/2210.01234",
      source: "arXiv (astro-ph.CO)"
    }
  ],
  economics: [
    {
      title: "Mechanism Design and the Tragedy of Algorithmic Commons",
      summary: "When independent algorithmic agents optimize private objective functions over shared financial or computational resources, Nash equilibria frequently drift toward pareto-suboptimal congestion states. We formalize quadratic voting and automated Pigouvian fee schedules to restore equilibrium efficiency without central coordination.",
      url: "https://arxiv.org/abs/2301.07890",
      source: "arXiv (econ.TH / Game Theory)"
    },
    {
      title: "Information Cascades and Fragility in High-Frequency Asset Markets",
      summary: "Rational agents participating in sequential decision environments often imitate prior actors even when private signals contradict aggregate trends. In high-frequency electronic markets, localized information cascades trigger synchronized liquidity blackouts, demonstrating that systemic fragility is an emergent consequence of Bayesian rationality under time pressure.",
      url: "https://pubmed.ncbi.nlm.nih.gov/29901452/",
      source: "PubMed (Economic Systems)"
    }
  ],
  tech_ethics: [
    {
      title: "The Alignment Problem and Corrigibility in Autonomous Systems",
      summary: "An autonomous agent tasked with achieving an objective naturally develops instrumental subgoals: preserving its own existence and resisting modification of its utility function. We formulate mathematical definitions of corrigibility—a property ensuring that an artificial intelligence will always willingly defer to human interruption and reward corrections.",
      url: "https://arxiv.org/abs/2208.05312",
      source: "arXiv (cs.AI / Ethics)"
    },
    {
      title: "Algorithmic Monoculture and Systemic Decision Homogeneity",
      summary: "When competing public and private institutions deploy identical pre-trained foundational models for credit underwriting, resume filtering, and risk scoring, individual errors compound into systemic monoculture. Disadvantaged cohorts are systematically locked out of the economy by correlated algorithmic blindspots across independent organizations.",
      url: "https://arxiv.org/abs/2303.01199",
      source: "arXiv (cs.CY / Society)"
    }
  ],
  biology: [
    {
      title: "Horizontal Gene Transfer and Non-Tree Models of Microbial Evolution",
      summary: "While vertical inheritance shaped classical Darwinian evolutionary branching, pervasive horizontal gene transfer (HGT) across single-celled kingdoms challenges strict bifurcating tree models. Genetic networks, mediated by viral transduction and conjugative plasmids, permit rapid cross-phyla sharing of metabolic pathways and antimicrobial defenses.",
      url: "https://pubmed.ncbi.nlm.nih.gov/29384910/",
      source: "PubMed (Evolutionary Biology)"
    },
    {
      title: "Epigenetic Memory and Transgenerational Stress Response in C. elegans",
      summary: "Environmental stress can induce heritable chromatin modifications that persist across multiple generations in the total absence of DNA nucleotide mutations. Small non-coding RNA pathways transmit gene-silencing signals that protect subsequent generations against thermal shock and pathogen exposure.",
      url: "https://pubmed.ncbi.nlm.nih.gov/32049210/",
      source: "PubMed (Molecular Biology)"
    }
  ],
  sociology: [
    {
      title: "Weak Ties, Algorithmic Clustering, and Social Mobility",
      summary: "Mark Granovetter's classic 'strength of weak ties' demonstrated that novel opportunities and social mobility originate from distant acquaintances rather than intimate circles. In modern algorithmic network architectures, recommendation engines optimize for engagement by reinforcing strong, homophilous clusters, inadvertently dampening cross-cutting social mobility conduits.",
      url: "https://pubmed.ncbi.nlm.nih.gov/28590432/",
      source: "PubMed (Sociology)"
    },
    {
      title: "Institutional Drift and the Erosion of Public Legitimacy",
      summary: "Institutions rarely collapse from sudden external shocks; rather, they undergo 'institutional drift'—a process where statutory rules remain static while underlying economic and demographic realities shift. When public organizations fail to adapt internal practices to evolving citizen expectations, baseline institutional legitimacy erodes gradually before precipitously dropping.",
      url: "https://pubmed.ncbi.nlm.nih.gov/31204992/",
      source: "PubMed (Sociology of Organizations)"
    }
  ],
  history: [
    {
      title: "The Bronze Age Collapse and Complex Systems Fragility",
      summary: "Around 1200 BCE, the interconnected civilizations of the Eastern Mediterranean—Mycenae, the Hittite Empire, and the New Kingdom of Egypt—experienced catastrophic civilizational collapse within a span of decades. Contemporary archaeological synthesis highlights systemic hyper-specialization, climate-driven drought, and disruptions to fragile tin and copper trade networks as a compounding cascade failure.",
      url: "https://en.wikipedia.org/wiki/Late_Bronze_Age_collapse",
      source: "Wikipedia (Historical Synthesis)"
    },
    {
      title: "The Printing Press and the Fragmentation of Shared Truth",
      summary: "The arrival of Gutenberg's movable type in 15th-century Europe did not instantly produce enlightenment; it initially triggered a deluge of contradictory pamphlets, esoteric treatises, and religious conflicts. The stabilization of institutional verification mechanisms took over a century to mature, echoing contemporary transitions in decentralized digital communication.",
      url: "https://en.wikipedia.org/wiki/Printing_revolution",
      source: "Wikipedia (History of Media)"
    }
  ],
  anthropology: [
    {
      title: "The Social Brain Hypothesis and Dunbar's Number in Digital Communities",
      summary: "Robin Dunbar's anthropological model posited that neocortex ratio constrains primates to maintain stable social relationships with approximately 150 individuals. Analyzing communication reciprocity across modern social platforms shows that despite having thousands of digital 'followers', active reciprocal communication networks remain rigidly bounded near 150 individuals.",
      url: "https://pubmed.ncbi.nlm.nih.gov/21804159/",
      source: "PubMed (Evolutionary Anthropology)"
    },
    {
      title: "Cumulative Cultural Evolution and the Ratchet Effect",
      summary: "Human technological superiority over other primates stems not from individual genius, but from the cultural 'ratchet effect': our capacity to transmit complex tool modifications across generations without slippage. High-fidelity social imitation combined with communicative teaching allows inventions to serve as irreversible platforms for iterative refinement.",
      url: "https://pubmed.ncbi.nlm.nih.gov/22194510/",
      source: "PubMed (Cultural Anthropology)"
    }
  ],
  literature: [
    {
      title: "The Paradox of Fiction and Emotional Engagement with Nonexistent Entities",
      summary: "How can readers feel genuine grief, fear, or exhilaration for characters they know with absolute certainty do not exist? Colin Radford's paradox challenges rationalist aesthetics. We evaluate Kendall Walton's 'make-believe' theory, proposing that literary immersion activates quasi-emotions within an evolutionary sandbox designed to safely simulate existential dilemmas.",
      url: "https://plato.stanford.edu/entries/fiction/",
      source: "Stanford Encyclopedia (Philosophy of Literature)"
    },
    {
      title: "Narrative Transportation and the Cognitive Rewiring of Beliefs",
      summary: "When readers enter a state of 'narrative transportation'—losing awareness of physical surroundings while absorbed in prose—critical analytical scrutiny is temporarily suspended. Empirical psychological experiments reveal that beliefs adopted while immersed in allegorical narratives persist long after returning to real-world evaluative contexts.",
      url: "https://pubmed.ncbi.nlm.nih.gov/11138762/",
      source: "PubMed (Literary Cognition)"
    }
  ],
  nursing: [
    {
      title: "Clinical Intuition and Pattern Recognition in Critical Care Triage",
      summary: "Experienced critical care clinicians frequently detect deteriorating physiological states prior to abnormal vital sign alerts. Qualitative and cognitive task analysis reveals this 'intuition' is rapid, non-conscious perceptual recognition of subtle micro-cues: skin turgor nuances, respiratory breathing rhythms, and behavioral stillness. Codifying these perceptual cues improves early sepsis detection protocols.",
      url: "https://pubmed.ncbi.nlm.nih.gov/30129845/",
      source: "PubMed (Nursing Science)"
    },
    {
      title: "Compassion Fatigue and Moral Distress: Structural vs Individual Mitigations",
      summary: "Chronic exposure to secondary trauma and systemic resource constraints produces moral distress among frontline healthcare providers. Longitudinal analysis indicates that individual mindfulness exercises fail to prevent attrition without institutional support: debriefing rounds, fair nurse-to-patient ratios, and decentralized decision-making autonomy.",
      url: "https://pubmed.ncbi.nlm.nih.gov/31895204/",
      source: "PubMed (Clinical Nursing)"
    }
  ],
  medical: [
    {
      title: "The Gut-Brain Axis and Neuroinflammatory Pathways in Mood Disorders",
      summary: "Vagus nerve signaling, short-chain fatty acid metabolites, and microbial regulation of circulating tryptophan demonstrate a bidirectional communication channel between the enteric microbiome and central nervous system. Microbial dysbiosis alters blood-brain barrier permeability and microglia activation, opening novel avenues for psychobiotic therapeutic interventions.",
      url: "https://pubmed.ncbi.nlm.nih.gov/31518552/",
      source: "PubMed (Clinical Medicine)"
    },
    {
      title: "Circadian Clocks and Chronotherapy in Pharmacokinetics",
      summary: "Cellular molecular clocks govern rhythmically fluctuating gene expression in hepatic cytochrome P450 enzymes and renal excretion transporters. Administering chemotherapeutic, anti-hypertensive, and anti-inflammatory medications synchronized with target biological cycles yields superior efficacy with significantly diminished systemic toxicity.",
      url: "https://pubmed.ncbi.nlm.nih.gov/30429103/",
      source: "PubMed (Pharmacology & Medicine)"
    }
  ]
};

// Live Wikipedia "On This Day" fetcher
async function fetchLiveHistoryPiece(): Promise<{ title: string; summary: string; url: string; source: string } | null> {
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;

    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const events = data?.events;
    if (!events || !events.length) return null;

    const event = events[Math.floor(Math.random() * events.length)];
    const year = event.year || 'Historic';
    const text = (event.text || '').trim();
    const page = event.pages && event.pages[0];

    const title = page ? `${year} — ${page.normalizedtitle || page.title || text}` : `${year} — ${text}`;
    const summary = (page && page.extract) ? page.extract : text;
    const urlOut = page?.content_urls?.desktop?.page || 'https://en.wikipedia.org';

    return {
      title,
      summary,
      url: urlOut,
      source: 'Wikipedia (On This Day)'
    };
  } catch (e) {
    return null;
  }
}

// Live PubMed search & abstract fetcher
async function fetchLivePubMedPiece(topic: string): Promise<{ title: string; summary: string; url: string; source: string } | null> {
  try {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(topic)}&retmode=json&retmax=15&sort=date`;
    const res = await fetch(searchUrl);
    if (!res.ok) return null;
    const data = await res.json();
    const idList: string[] = data?.esearchresult?.idlist || [];
    if (!idList.length) return null;

    const pmid = idList[Math.floor(Math.random() * idList.length)];
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`;
    const sumRes = await fetch(summaryUrl);
    if (!sumRes.ok) return null;
    const sumData = await sumRes.json();
    const doc = sumData?.result?.[pmid];
    if (!doc) return null;

    const title = (doc.title || '').replace(/<[^>]+>/g, '').trim();
    if (title.length < 15) return null;

    return {
      title,
      summary: `Clinical study from PubMed regarding ${topic}. Title: ${title}. Published in ${doc.source || 'Medical Journal'} (${doc.pubdate || 'Recent'}). Explores empirical methodologies, randomized observations, and structural interventions.`,
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      source: `PubMed (${topic})`
    };
  } catch (e) {
    return null;
  }
}

export async function fetchPieceForCategory(category: CategoryKey): Promise<ReadingPiece> {
  let pieceData: { title: string; summary: string; url: string; source: string } | null = null;

  // Try live sources first when appropriate
  if (category === 'history') {
    pieceData = await fetchLiveHistoryPiece();
  } else if (category === 'medical' || category === 'psychology' || category === 'nursing' || category === 'neuroscience') {
    pieceData = await fetchLivePubMedPiece(category);
  }

  // Fallback to curated library
  if (!pieceData) {
    const pool = CURATED_PIECES[category] || CURATED_PIECES.science;
    pieceData = pool[Math.floor(Math.random() * pool.length)];
  }

  const qResult = await fetchQuestions(pieceData.title, pieceData.summary);

  return {
    ...pieceData,
    category,
    questions: qResult.questions,
    question_source: qResult.source,
    question_notice: qResult.source === 'fallback' ? { reason: qResult.reason || 'Local Socratic Engine' } : null
  };
}

export function getRandomSerendipityCategory(): CategoryKey {
  const keys = Object.keys(CATEGORIES) as CategoryKey[];
  return keys[Math.floor(Math.random() * keys.length)];
}
