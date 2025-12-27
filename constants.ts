
import { Difficulty, RoadmapItem } from './types';

export const ROADMAP_DATA: RoadmapItem[] = [
  {
    id: 'foundations',
    title: '1. Foundations',
    description: 'Understand how the world of web development operates before writing a single line of React code.',
    duration: '2-3 Weeks',
    difficulty: Difficulty.BEGINNER,
    category: 'foundations',
    topics: [
      'How the Internet works (DNS, HTTP/HTTPS, IP)',
      'Git & GitHub: Version control, branching, pull requests',
      'CLI: Basic terminal commands (ls, cd, mkdir, touch)',
      'Developer Workflow: VS Code, Extensions, Debugging',
      'npm/yarn/pnpm: Package management basics'
    ],
    projects: [
      { 
        title: 'Repo Explorer', 
        desc: 'Create and manage your first code repository using Git and GitHub.',
        learningOutcomes: ['Branching strategies', 'Pull request workflows', 'Markdown documentation'],
        techFocus: ['Git CLI', 'GitHub UI', 'SSH Keys'],
        challenges: ['Resolving merge conflicts', 'Understanding remote vs local state']
      }
    ]
  },
  {
    id: 'frontend-core',
    title: '2. Modern Front-End Core',
    description: 'Master the visual and functional layer of the web. This is your interface for AI.',
    duration: '2-3 Months',
    difficulty: Difficulty.BEGINNER,
    category: 'frontend',
    topics: [
      'HTML5: Semantic tags, SEO basics, Forms',
      'CSS3: Flexbox, Grid, CSS Variables, Responsive Design',
      'Tailwind CSS: Utility-first styling (industry standard)',
      'JavaScript ES6+: Arrow functions, Destructuring, Promises, Async/Await',
      'DOM Manipulation: How JS interacts with HTML',
      'Web APIs: Fetching data from the internet'
    ],
    projects: [
      { 
        title: 'Responsive Portfolio', 
        desc: 'A multi-page professional site showcasing your skills.',
        learningOutcomes: ['Mobile-first design', 'Semantic SEO', 'CSS Layout mastery'],
        techFocus: ['Tailwind CSS', 'HTML5', 'Flexbox/Grid'],
        challenges: ['Achieving perfect responsive layouts across all devices', 'Ensuring cross-browser compatibility']
      },
      { 
        title: 'Weather Dashboard', 
        desc: 'A dynamic application that fetches real-time data from a global weather API.',
        learningOutcomes: ['Asynchronous JS', 'API authentication', 'JSON parsing'],
        techFocus: ['Fetch API', 'OpenWeatherMap', 'ES6 Modules'],
        challenges: ['Handling API downtime/errors', 'Parsing complex nested JSON objects']
      }
    ]
  },
  {
    id: 'frontend-frameworks',
    title: '3. React & Advanced Ecosystem',
    description: 'Build scalable interfaces using the world’s most popular framework.',
    duration: '2 Months',
    difficulty: Difficulty.INTERMEDIATE,
    category: 'frontend',
    topics: [
      'React Fundamentals: Components, Props, State',
      'Hooks: useState, useEffect, useContext, useMemo',
      'Routing: React Router (HashRouter for modern SPAs)',
      'State Management: TanStack Query (React Query) & Zustand',
      'Performance: Lazy loading, Code splitting',
      'Testing: Vitest, React Testing Library',
      'Accessibility (a11y): ARIA labels, Keyboard navigation'
    ],
    projects: [
      { 
        title: 'Task Management App', 
        desc: 'A productivity tool with categorization, search, and local persistence.',
        learningOutcomes: ['CRUD logic', 'Lifting state up', 'LocalStorage integration'],
        techFocus: ['React Hooks', 'Zustand', 'React-Beautiful-DND'],
        challenges: ['Syncing state with local storage', 'Managing deep component trees']
      },
      { 
        title: 'E-commerce UI', 
        desc: 'A complex storefront with dynamic routing and advanced filtering.',
        learningOutcomes: ['Route parameters', 'Global shopping cart state', 'Animation basics'],
        techFocus: ['React Router', 'Framer Motion', 'React Query'],
        challenges: ['Efficiently filtering large datasets', 'Smooth layout transitions']
      }
    ]
  },
  {
    id: 'ai-fundamentals',
    title: '4. AI Engineering Fundamentals',
    description: 'Transition from "User of AI" to "Builder with AI".',
    duration: '1-2 Months',
    difficulty: Difficulty.INTERMEDIATE,
    category: 'ai',
    topics: [
      'Python for AI: Basics, Lists, Dictionaries, Lambda functions',
      'Mathematics: Probability, Statistics, Vectors (Simplified for AI Engineers)',
      'Machine Learning basics: Regressions, Classifications',
      'Deep Learning & Neural Networks: What is a transformer?',
      'NLP (Natural Language Processing) & Tokenization',
      'Vector Databases: Pinecone, Milvus (Storing AI memory)'
    ],
    projects: [
      { 
        title: 'Python Scraper', 
        desc: 'An automated tool to collect data for training or processing.',
        learningOutcomes: ['Scripting automation', 'Parsing HTML structure', 'Data cleaning'],
        techFocus: ['Python', 'BeautifulSoup', 'Requests'],
        challenges: ['Handling dynamic JS-rendered content', 'Avoiding rate limits']
      },
      { 
        title: 'Sentiment Analyzer', 
        desc: 'Use basic NLP to classify text data as positive, negative, or neutral.',
        learningOutcomes: ['Preprocessing text', 'Understanding NLP libraries', 'Decision logic'],
        techFocus: ['TextBlob', 'NLTK', 'Python'],
        challenges: ['Handling sarcasm/nuance', 'Cleaning noisy input data']
      }
    ]
  },
  {
    id: 'ai-integration',
    title: '5. The AI + Front-End Bridge',
    description: 'This is where the magic happens. Connecting your UI to LLMs.',
    duration: '1-2 Months',
    difficulty: Difficulty.ADVANCED,
    category: 'integration',
    topics: [
      'LLM APIs: Gemini API, OpenAI, Anthropic',
      'Prompt Engineering: System instructions, Few-shot prompting',
      'RAG (Retrieval Augmented Generation): Chatting with your own data',
      'Multi-modal AI: Handling images, audio, and video in the browser',
      'Agentic Workflows: AI that can call tools (Function Calling)',
      'Security: Managing API keys, rate limiting, and data privacy'
    ],
    projects: [
      { 
        title: 'AI Study Assistant', 
        desc: 'A RAG-powered chatbot that analyzes your documents and answers queries.',
        learningOutcomes: ['Vector search', 'Context windows', 'RAG architecture'],
        techFocus: ['Gemini API', 'Pinecone', 'LangChain'],
        challenges: ['Minimizing hallucinations', 'Efficient document chunking']
      },
      { 
        title: 'Dynamic Image Generator', 
        desc: 'A smart UI for multimodal generation and editing.',
        learningOutcomes: ['Binary data streams', 'Base64 processing', 'Cost management'],
        techFocus: ['Gemini Flash Image', 'Canvas API', 'Blob management'],
        challenges: ['UI latency during generation', 'Ensuring secure API communication']
      }
    ]
  },
  {
    id: 'career-launch',
    title: '6. Portfolio & Career Ready',
    description: 'Closing the loop. Getting hired or starting as a freelancer.',
    duration: '1 Month',
    difficulty: Difficulty.ADVANCED,
    category: 'career',
    topics: [
      'The "AI First" Portfolio: Highlighting AI integration skills',
      'DevOps: Deploying React apps to Vercel/Netlify',
      'CI/CD: Automating builds with GitHub Actions',
      'Environment Security: Securely handling API Keys in production',
      'Custom Domains & SSL: Setting up professional web addresses',
      'Job Hunting: Technical interviews, System design for AI apps'
    ],
    projects: [
      { 
        title: 'The Ultimate Capstone', 
        desc: 'A full-scale AI-native application solving a specific industry problem.',
        learningOutcomes: ['Product management', 'End-to-end deployment', 'User feedback cycles'],
        techFocus: ['React', 'PostgreSQL', 'Vercel AI SDK'],
        challenges: ['Scaling concurrent users', 'Refining the user experience based on feedback']
      }
    ]
  }
];
