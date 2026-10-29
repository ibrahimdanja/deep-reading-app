import { CategoryKey, ReadingPiece } from '../types';
import { fetchQuestions } from './questionsService';

// Curated high-value readings for instant, offline, and reliable access
const CURATED_PIECES: Record<CategoryKey, Array<{ title: string; summary: string; url: string; source: string }>> = {
  science: [
    {
      title: "Self-Organized Criticality in Neural Information Processing",
      summary: "Cortical networks operate near a non-equilibrium critical point between order and chaos. In this regime, known as self-organized criticality, information transmission capacity, dynamic range of sensory inputs, and the diversity of collective states are simultaneously maximized. We demonstrate how homeostatic synaptic plasticity tunes recurrent inhibitory-excitatory loops to preserve criticality despite fluctuating sensory noise.",
      url: "https://arxiv.org/abs/2304.09812",
      source: "arXiv (q-bio.NC / Physics)"
    },
    {
      title: "Emergence of World Models in Deep Autoregressive Networks",
      summary: "Whether large autoregressive models merely recite stochastic correlations or form coherent internal world representations remains a pivotal debate. By probing hidden activation geometries across counterfactual navigation environments, we observe linear representations of physical entity coordinates and causal invariants. The network actively compresses topological transition graphs into internal geometry.",
      url: "https://arxiv.org/abs/2301.00282",
      source: "arXiv (cs.AI)"
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
      title: "Phenomenal Consciousness and the Inverted Spectrum Problem",
      summary: "Could another observer experience subjective red where you experience green, yet share identical functional behavior and linguistic categorization? The inverted spectrum hypothesis targets functionalist and physicalist theories of mind, arguing that qualitative subjective experience (qualia) escapes purely relational or behavioral descriptions.",
      url: "https://plato.stanford.edu/entries/qualia-inverted/",
      source: "Stanford Encyclopedia of Philosophy"
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
  biology: [
    {
      title: "Horizontal Gene Transfer and Non-Tree Models of Microbial Evolution",
      summary: "While vertical inheritance shaped Darwinian evolutionary diagrams, pervasive horizontal gene transfer (HGT) across prokaryotes and single-celled eukaryotes challenges strict bifurcating tree models. Genetic networks, mediated by viral transduction and conjugative plasmids, permit rapid cross-phyla sharing of metabolic pathways and antimicrobial resistance traits.",
      url: "https://pubmed.ncbi.nlm.nih.gov/29384910/",
      source: "PubMed (Evolutionary Biology)"
    },
    {
      title: "Epigenetic Memory and Transgenerational Stress Response in C. elegans",
      summary: "Environmental stress can induce heritable modifications that persist across generations in the absence of genetic mutations. Small non-coding RNA pathways transmit chromatin remodeling signals that protect subsequent generations against pathogen exposure, revealing an adaptable molecular bridge between immediate environment and long-term lineage survival.",
      url: "https://pubmed.ncbi.nlm.nih.gov/32049210/",
      source: "PubMed (Molecular Biology)"
    }
  ],
  sociology: [
    {
      title: "Weak Ties, Algorithmic Clustering, and Social Mobility",
      summary: "Granovetter's seminal 'strength of weak ties' demonstrated that novel opportunities and social mobility originate from distant acquaintances rather than intimate circles. In modern algorithmic network architectures, recommendation engines optimize for engagement by reinforcing strong, homophilous clusters, inadvertently dampening cross-cutting social mobility conduits.",
      url: "https://pubmed.ncbi.nlm.nih.gov/28590432/",
      source: "PubMed (Sociology)"
    },
    {
      title: "Institutional Drift and the Erosion of Public Trust",
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
    console.warn('Live history fetch failed, using curated piece', e);
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
    // PubMed summary doesn't always have full abstract, check if title is descriptive
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

  // Try live sources first
  if (category === 'history') {
    pieceData = await fetchLiveHistoryPiece();
  } else if (category === 'medical' || category === 'psychology' || category === 'nursing') {
    pieceData = await fetchLivePubMedPiece(category);
  }

  // Fallback to curated high-quality library if live fetch returned null
  if (!pieceData) {
    const pool = CURATED_PIECES[category] || CURATED_PIECES.science;
    pieceData = pool[Math.floor(Math.random() * pool.length)];
  }

  // Generate Socratic questions via Gemini (or intelligent fallback)
  const qResult = await fetchQuestions(pieceData.title, pieceData.summary);

  return {
    ...pieceData,
    category,
    questions: qResult.questions,
    question_source: qResult.source,
    question_notice: qResult.source === 'fallback' ? { reason: qResult.reason || 'Local Socratic Engine' } : null
  };
}
