/* Shared project records for Research previews and the future populated Timeline.
 * Dates retain the precision supplied by the researcher.
 * Record fields:
 * id: stable unique identifier
 * title, summary: plain text
 * research_areas: array of existing area IDs (e.g. "working-memory")
 * status: "active", "completed", or "planned"
 * start_date, end_date: known ISO date precision (YYYY, YYYY-MM, YYYY-MM-DD), or null
 * url: optional dedicated project page or HTTPS project URL
 * Dates must not be inferred from status or publication dates.
 */
window.JAGS_PROJECTS = [{
  id: 'representational-geometries',
  title: 'Assessing psychological, neural, and AI-based representational geometries across multiple similarity properties',
  short_title: 'Representational geometries across similarity properties',
  summary: 'How are object representations organized across human judgments, the brain, and computational models, and how does this organization change depending on the property being compared?',
  research_areas: ['perception'],
  // Null method dates are intentional: project dates do not establish method timing.
  methods: [
    { label: 'fMRI', start_date: null, end_date: null },
    { label: 'CNNs', start_date: null, end_date: null }
  ],
  keywords: ['Representational Similarity Analysis (RSA)', 'Cognitive neuroscience', 'Visual perception and object representation', 'fMRI', 'Behavioral similarity judgments', 'Computational modeling / artificial neural networks', 'Representational geometry', 'Multivariate analysis'],
  status: 'active',
  status_label: 'Active — under review for publication',
  start_date: '2022',
  end_date: '2025',
  url: 'content/research/representational-geometries.html',
  preprint_url: 'https://doi.org/10.31234/osf.io/fz94u_v2'
},
{
  "id": "voluntary-action",
  "title": "Not so fast! Comparing the neural markers of self-generated urgency regimes in voluntary actions",
  "short_title": "Neural markers of voluntary action",
  "summary": "What happens in the brain as we decide when to act, and does it matter whether the pressure to act quickly comes from an instruction or from ourselves?",
  "research_areas": [
    "decision"
  ],
  "status": "completed",
  "status_label": "Completed — MSc dissertation (Distinction)",
  "start_date": "2020-12",
  "end_date": "2021-09",
  "methods": [
    {
      "label": "EEG",
      "start_date": null,
      "end_date": null
    },
    {
      "label": "Behavioral task",
      "start_date": null,
      "end_date": null
    }
  ],
  "links": [
    {
      "label": "Read the dissertation",
      "url": "https://drive.google.com/file/d/1cHq-IfiN6D4GO0lS3d1v_iy1kCkC2uc7/view?usp=drive_link"
    }
  ],
  "url": "content/research/voluntary-action.html"
},
{
  "id": "agency-real-virtual",
  "title": "Sense of Agency, Automation and Videogames: A new framework for Human Machine Interactions",
  "short_title": "Agency in real & virtual environments",
  "summary": "How does the feeling that we caused an action change when a machine takes over part of the task, or when the action happens in a video game?",
  "research_areas": [
    "interactive",
    "consciousness",
    "decision"
  ],
  "status": "completed",
  "status_label": "Completed — MSc thesis",
  "start_date": "2021-10",
  "end_date": "2022-06",
  "methods": [
    {
      "label": "Behavioral experiments",
      "start_date": null,
      "end_date": null
    },
    {
      "label": "Human–computer interaction",
      "start_date": null,
      "end_date": null
    }
  ],
  "links": [
    {
      "label": "Read the thesis",
      "url": "https://drive.google.com/file/d/1uPFwIQSi0VOx_6IXny5GI6ZgYvFqIxVM/view?usp=drive_link"
    }
  ],
  "url": "content/research/agency-real-virtual.html"
},
{
  "id": "motion-repulsion-behavior",
  "title": "Cognitive and Metacognitive Constraints on Motion Repulsion",
  "short_title": "Motion repulsion — behavior",
  "summary": "Why can two directions of movement look farther apart than they really are, and can we recognize that distortion in our own experience?",
  "research_areas": [
    "perception",
    "working-memory",
    "metacognition"
  ],
  "status": "active",
  "status_label": "Active — manuscript in preparation",
  "start_date": "2023",
  "end_date": null,
  "ongoing": true,
  "methods": [
    {
      "label": "Behavioral psychophysics",
      "start_date": null,
      "end_date": null
    },
    {
      "label": "Confidence judgments",
      "start_date": null,
      "end_date": null
    }
  ],
  "links": [
    {
      "label": "Read the related VSS abstract",
      "url": "https://doi.org/10.1167/jov.24.10.1433"
    }
  ],
  "url": "content/research/motion-repulsion-behavior.html"
},
{
  "id": "motion-repulsion-eeg",
  "title": "Neural Dynamics of Motion Repulsion",
  "short_title": "Motion repulsion — EEG",
  "summary": "When does a visual distortion emerge in the brain: while we see movement, while we remember it, or while we decide what to report?",
  "research_areas": [
    "perception",
    "working-memory"
  ],
  "status": "active",
  "status_label": "Active — analyses ongoing; manuscript in preparation",
  "start_date": "2024",
  "end_date": null,
  "ongoing": true,
  "methods": [
    {
      "label": "EEG",
      "start_date": null,
      "end_date": null
    },
    {
      "label": "Multivariate decoding",
      "start_date": null,
      "end_date": null
    }
  ],
  "links": [],
  "url": "content/research/motion-repulsion-eeg.html"
},
{
  "id": "prestimulus-consciousness",
  "title": "Prestimulus Neural Activity and Subsequent Conscious Perception",
  "short_title": "Prestimulus consciousness",
  "summary": "Could the brain's activity before something appears help explain whether we consciously see it?",
  "research_areas": [
    "consciousness",
    "perception",
    "decision"
  ],
  "status": "active",
  "status_label": "Active — preregistered secondary analyses",
  "start_date": "2026",
  "end_date": null,
  "ongoing": true,
  "methods": [
    {
      "label": "fMRI",
      "start_date": null,
      "end_date": null
    },
    {
      "label": "Open-data secondary analysis",
      "start_date": null,
      "end_date": null
    }
  ],
  "links": [
    {
      "label": "Consciousness Commons award record",
      "url": "https://doi.org/10.54224/33254"
    }
  ],
  "url": "content/research/prestimulus-consciousness.html"
}
];
