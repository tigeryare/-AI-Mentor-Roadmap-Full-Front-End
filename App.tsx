import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ROADMAP_DATA } from './constants';
import { Difficulty, RoadmapItem, Project, User } from './types';
import MentorChat from './components/MentorChat';
import { generateProjectIdea } from './services/geminiService';

// --- Custom Hook for LocalStorage Progress & User Tracking ---
const useProgress = () => {
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('roadmap-progress-topics');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [completedProjects, setCompletedProjects] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('roadmap-progress-projects');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [completedOutcomes, setCompletedOutcomes] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('roadmap-progress-outcomes');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [completedTech, setCompletedTech] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('roadmap-progress-tech');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('roadmap-active-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [usersDB, setUsersDB] = useState<Record<string, User>>(() => {
    const saved = localStorage.getItem('roadmap-users-db');
    return saved ? JSON.parse(saved) : {};
  });

  const toggleTopic = (itemId: string, topicIndex: number) => {
    if (!user) return;
    const key = `${user.username}-${itemId}-${topicIndex}`;
    const next = new Set(completedTopics);
    if (next.has(key)) next.delete(key); else next.add(key);
    setCompletedTopics(next);
    localStorage.setItem('roadmap-progress-topics', JSON.stringify([...next]));
  };

  const toggleProject = (itemId: string, projectIndex: number) => {
    if (!user) return;
    const key = `${user.username}-${itemId}-${projectIndex}`;
    const next = new Set(completedProjects);
    if (next.has(key)) next.delete(key); else next.add(key);
    setCompletedProjects(next);
    localStorage.setItem('roadmap-progress-projects', JSON.stringify([...next]));
  };

  const toggleOutcome = (itemId: string, projectIndex: number, outcomeIndex: number) => {
    if (!user) return;
    const key = `${user.username}-${itemId}-p${projectIndex}-o${outcomeIndex}`;
    const next = new Set(completedOutcomes);
    if (next.has(key)) next.delete(key); else next.add(key);
    setCompletedOutcomes(next);
    localStorage.setItem('roadmap-progress-outcomes', JSON.stringify([...next]));
  };

  const toggleTech = (itemId: string, projectIndex: number, techIndex: number) => {
    if (!user) return;
    const key = `${user.username}-${itemId}-p${projectIndex}-t${techIndex}`;
    const next = new Set(completedTech);
    if (next.has(key)) next.delete(key); else next.add(key);
    setCompletedTech(next);
    localStorage.setItem('roadmap-progress-tech', JSON.stringify([...next]));
  };

  const register = (username: string, password?: string): { success: boolean; message?: string } => {
    if (usersDB[username]) {
      return { success: false, message: 'Username already taken' };
    }
    const newUser: User = { 
      username, 
      password,
      email: `${username.toLowerCase()}@engineer.ai`, 
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      claimedChests: [] 
    };
    const nextDB = { ...usersDB, [username]: newUser };
    setUsersDB(nextDB);
    localStorage.setItem('roadmap-users-db', JSON.stringify(nextDB));
    
    setUser(newUser);
    localStorage.setItem('roadmap-active-user', JSON.stringify(newUser));
    return { success: true };
  };

  const login = (username: string, password?: string): { success: boolean; message?: string } => {
    const found = usersDB[username];
    if (found && found.password === password) {
      setUser(found);
      localStorage.setItem('roadmap-active-user', JSON.stringify(found));
      return { success: true };
    }
    return { success: false, message: 'Invalid username or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('roadmap-active-user');
  };

  const claimChest = (moduleId: string) => {
    if (!user) return;
    if (user.claimedChests.includes(moduleId)) return;
    const nextUser = { ...user, claimedChests: [...user.claimedChests, moduleId] };
    setUser(nextUser);
    localStorage.setItem('roadmap-active-user', JSON.stringify(nextUser));
    
    const nextDB = { ...usersDB, [user.username]: nextUser };
    setUsersDB(nextDB);
    localStorage.setItem('roadmap-users-db', JSON.stringify(nextDB));
  };

  return { 
    completedTopics, toggleTopic, 
    completedProjects, toggleProject,
    completedOutcomes, toggleOutcome,
    completedTech, toggleTech,
    user, register, login, logout, claimChest
  };
};

const AuthForm: React.FC<{ 
  onAuth: (u: string, p: string, m: 'register' | 'login') => { success: boolean, message?: string }; 
  onCancel: () => void 
}> = ({ onAuth, onCancel }) => {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [mode, setMode] = useState<'register' | 'login'>('login');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!u || !p) {
      setError("Please fill in all fields.");
      return;
    }
    const result = onAuth(u, p, mode);
    if (!result.success) {
      setError(result.message || "An error occurred");
    }
  };

  return (
    <div 
      className="bg-white dark:bg-slate-900 p-8 rounded-3xl border dark:border-slate-800 shadow-2xl max-w-md w-full animate-fadeIn text-black dark:text-white relative"
      role="dialog"
      aria-labelledby="auth-title"
      aria-modal="true"
    >
      <button 
        onClick={onCancel} 
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
        aria-label="Close authentication modal"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      
      <div className="flex justify-center gap-8 mb-8 border-b dark:border-slate-800 border-slate-100 pb-4">
        <button 
          onClick={() => { setMode('login'); setError(null); }} 
          className={`text-sm font-black uppercase tracking-widest transition-all pb-2 ${mode === 'login' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' : 'text-slate-400'}`}
          aria-current={mode === 'login' ? 'step' : undefined}
        >
          Login
        </button>
        <button 
          onClick={() => { setMode('register'); setError(null); }} 
          className={`text-sm font-black uppercase tracking-widest transition-all pb-2 ${mode === 'register' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' : 'text-slate-400'}`}
          aria-current={mode === 'register' ? 'step' : undefined}
        >
          Register
        </button>
      </div>

      <h2 id="auth-title" className="text-2xl font-black mb-2">{mode === 'register' ? 'Join the Academy' : 'Welcome Back'}</h2>
      <p className="text-xs text-slate-500 mb-6">Enter your details to sync your roadmap progress.</p>
      
      {error && (
        <div className="mb-6 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold animate-fadeIn">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="text-[10px] font-bold uppercase tracking-widest block mb-1 text-slate-500">Username</label>
          <input 
            id="username"
            type="text" 
            value={u} 
            onChange={(v) => setU(v.target.value)} 
            className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-600 outline-none text-black dark:text-white placeholder:text-slate-400" 
            placeholder="Engineer_2026" 
          />
        </div>
        <div>
          <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest block mb-1 text-slate-500">Password</label>
          <input 
            id="password"
            type="password" 
            value={p} 
            onChange={(v) => setP(v.target.value)} 
            className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-600 outline-none text-black dark:text-white placeholder:text-slate-400" 
            placeholder="••••••••" 
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all mt-4 focus:ring-4 focus:ring-indigo-200"
        >
          {mode === 'register' ? 'START LEARNING' : 'ACCESS ROADMAP'}
        </button>
      </form>
    </div>
  );
};

const ProjectCard: React.FC<{ 
  project: Project | { title: string; description: string; features?: string[] }; 
  isCompleted?: boolean; 
  onToggle?: () => void;
  isAiGenerated?: boolean;
  moduleId: string;
  projectIndex: number;
  completedOutcomes: Set<string>;
  completedTech: Set<string>;
  toggleOutcome: (mId: string, pIdx: number, oIdx: number) => void;
  toggleTech: (mId: string, pIdx: number, tIdx: number) => void;
  isLocked?: boolean;
}> = ({ 
  project, isCompleted, onToggle, isAiGenerated, 
  moduleId, projectIndex, completedOutcomes, completedTech, toggleOutcome, toggleTech, isLocked
}) => {
  const title = project.title;
  const desc = 'description' in project ? project.description : project.desc;

  return (
    <div className={`border rounded-xl overflow-hidden transition-all group/project ${
      isAiGenerated ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20' : 
      isCompleted 
        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 opacity-90 shadow-none' 
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md'
    }`}>
      <div className={`p-4 border-b dark:border-slate-800 flex justify-between items-start gap-4 transition-colors ${
        isAiGenerated ? 'bg-indigo-100/30 dark:bg-indigo-900/30' :
        isCompleted ? 'bg-emerald-100/50 dark:bg-emerald-900/30' : 'bg-white dark:bg-slate-900 group-hover/project:bg-indigo-50 dark:group-hover/project:bg-slate-800'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h5 className={`font-bold transition-all ${isCompleted ? 'text-emerald-900 dark:text-emerald-400 line-through' : 'text-slate-900 dark:text-white'}`}>
              {title}
            </h5>
            {isAiGenerated && (
              <span className="text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-widest">AI Generated</span>
            )}
          </div>
          <p className={`text-xs ${isCompleted ? 'text-emerald-700/70 dark:text-emerald-500/70' : 'text-slate-600 dark:text-slate-400'}`}>{desc}</p>
        </div>
        {!isLocked && onToggle && (
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all border-2 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 outline-none ${
              isCompleted 
                ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600' 
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            {isCompleted ? (
              <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>Done</>
            ) : 'Complete'}
          </button>
        )}
      </div>
      <div className="p-4 space-y-4">
        {'features' in project && project.features && (
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest block mb-2 text-indigo-600 dark:text-indigo-400">Features Checklist</span>
            <ul className="text-[10px] space-y-1 text-slate-600 dark:text-slate-400">
              {project.features.map((feature, i) => (
                <li key={i} className="flex gap-1 items-center"><span className="text-indigo-400">•</span> {feature}</li>
              ))}
            </ul>
          </div>
        )}
        
        {'techFocus' in project && project.techFocus && (
          <div>
            <span className={`text-[9px] font-bold uppercase tracking-widest block mb-2 ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>Tech Focus Mastery</span>
            <div className="flex flex-wrap gap-1.5">
              {project.techFocus.map((tech, i) => {
                const isTechDone = completedTech.has(`${moduleId}-p${projectIndex}-t${i}`);
                return (
                  <button 
                    key={i} 
                    onClick={() => !isLocked && toggleTech(moduleId, projectIndex, i)} 
                    className={`text-[9px] px-2 py-0.5 rounded font-medium border shadow-sm transition-all flex items-center gap-1.5 ${isTechDone ? 'bg-emerald-500 text-white border-emerald-500' : isCompleted ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' : 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-600'} ${isLocked ? 'cursor-default opacity-50' : ''}`}
                    disabled={isLocked}
                  >
                    {isTechDone && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}{tech}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RoadmapCard: React.FC<{ 
  item: RoadmapItem; isActive: boolean; onClick: () => void; index: number;
  completedTopicCount: number; completedProjectCount: number;
  toggleTopic: (itemId: string, topicIndex: number) => void;
  toggleProject: (itemId: string, projectIndex: number) => void;
  completedTopics: Set<string>; completedProjects: Set<string>;
  completedOutcomes: Set<string>; completedTech: Set<string>;
  toggleOutcome: (mId: string, pIdx: number, oIdx: number) => void;
  toggleTech: (mId: string, pIdx: number, tIdx: number) => void;
  onClaimReward: (id: string) => void;
  isClaimed: boolean;
  isLocked?: boolean;
  user: User | null;
}> = ({ 
  item, isActive, onClick, index, completedTopicCount, completedProjectCount, 
  toggleTopic, toggleProject, completedTopics, completedProjects, completedOutcomes, completedTech,
  toggleOutcome, toggleTech, onClaimReward, isClaimed, isLocked, user
}) => {
  const [aiProject, setAiProject] = useState<{ title: string; description: string; features: string[] } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGetIdea = async () => {
    if (isGenerating || isLocked) return;
    setIsGenerating(true);
    try {
      const idea = await generateProjectIdea({ title: item.title, difficulty: item.difficulty, topics: item.topics });
      setAiProject(idea);
    } catch (err) { console.error(err); } finally { setIsGenerating(false); }
  };

  const totalItems = item.topics.length + item.projects.length;
  const completedItems = completedTopicCount + completedProjectCount;
  const progressPercentage = Math.round((completedItems / totalItems) * 100);
  const isFullyCompleted = completedItems === totalItems;

  return (
    <div className="relative pl-8 pb-12 group/item">
      <div 
        className={`absolute left-[11px] top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 group-last/item:bg-transparent ${isActive ? 'bg-indigo-300 dark:bg-indigo-800' : ''} ${isFullyCompleted ? 'bg-emerald-200 dark:bg-emerald-800' : ''}`} 
        aria-hidden="true" 
      />
      <div 
        className={`absolute left-0 top-0 w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all z-10 ${isFullyCompleted ? 'bg-emerald-500 border-emerald-100 dark:border-emerald-900 shadow-emerald-200 dark:shadow-none' : isActive ? 'bg-indigo-600 border-indigo-100 dark:border-indigo-900 scale-125 shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group-hover/item:border-indigo-300'}`}
        aria-hidden="true"
      >
        {isFullyCompleted ? <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <span className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>{index + 1}</span>}
      </div>

      <div className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden ${isFullyCompleted ? 'border-emerald-500 shadow-md shadow-emerald-50 dark:shadow-none' : isActive ? 'shadow-xl border-indigo-200 dark:border-indigo-800' : 'shadow-sm border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'}`}>
        <button 
          onClick={onClick}
          className={`w-full text-left p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all focus:ring-4 focus:ring-inset focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none ${isActive ? 'bg-slate-50 dark:bg-slate-800/30 border-b dark:border-slate-800' : ''}`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${item.difficulty === Difficulty.BEGINNER ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50' : item.difficulty === Difficulty.INTERMEDIATE ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50' : 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/50'}`}>{item.difficulty}</span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>{item.duration}</span>
              {completedItems > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${isFullyCompleted ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${progressPercentage}%` }} />
                  </div>
                  <span className={`text-[9px] font-bold ${isFullyCompleted ? 'text-emerald-600' : 'text-indigo-600 dark:text-indigo-400'}`}>{progressPercentage}%</span>
                </div>
              )}
            </div>
            <h3 className={`text-xl font-black ${isActive ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'} ${isFullyCompleted ? '!text-emerald-900 dark:!text-emerald-400' : ''}`}>{item.title}</h3>
            {!isActive && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 italic">{item.description}</p>}
          </div>
          <div className="flex items-center gap-2">
             <span className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${isFullyCompleted ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'}`}>
                {isActive ? 'Hide' : isFullyCompleted ? 'Review' : 'Start'}
                <svg className={`w-4 h-4 transition-transform ${isActive ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </span>
          </div>
        </button>

        <div className={`grid transition-all duration-500 ease-in-out ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
          <div className="overflow-hidden">
            <div className="p-6 lg:p-8 space-y-8 animate-fadeIn text-black dark:text-white relative">
              {isLocked && (
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/80 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-6 rounded-b-2xl">
                   <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-2xl mb-4 text-3xl">🔒</div>
                   <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Login Required</h4>
                   <p className="text-slate-600 dark:text-slate-400 max-w-xs text-sm">Create a free profile to track your roadmap progress and earn achievements.</p>
                   <button 
                     onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('open-auth')); }} 
                     className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-black shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest"
                   >
                     Login / Register
                   </button>
                </div>
              )}
              
              {isFullyCompleted && !isClaimed && (
                <div className="bg-emerald-600 p-6 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                  <div>
                    <h4 className="font-black text-lg">Module Mastered!</h4>
                    <p className="text-sm opacity-90">You've completed all topics and projects in this stage.</p>
                  </div>
                  <button onClick={() => onClaimReward(item.id)} className="bg-white text-emerald-600 font-black px-6 py-2 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                    🎁 CLAIM CHEST
                  </button>
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-10">
                <section>
                  <h4 className="flex items-center gap-2 font-black text-slate-800 dark:text-slate-200 mb-4 uppercase text-[10px] tracking-widest">
                    <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/50 rounded flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-mono">01</div>
                    Curriculum Topics
                  </h4>
                  <ul className="space-y-2">
                    {item.topics.map((topic, i) => {
                      const isCompleted = completedTopics.has(`${user?.username}-${item.id}-${i}`);
                      return (
                        <li key={i}>
                          <button 
                            onClick={() => !isLocked && toggleTopic(item.id, i)} 
                            className={`flex items-start gap-3 text-sm p-3 rounded-xl border transition-all w-full text-left ${isCompleted ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'}`}
                            disabled={isLocked}
                          >
                            <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isCompleted ? 'bg-emerald-500 border-emerald-500' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600'}`}>
                              {isCompleted && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span className={isCompleted ? 'line-through opacity-70' : ''}>{topic}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="flex items-center gap-2 font-black text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-widest">
                      <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900/50 rounded flex items-center justify-center text-amber-600 dark:text-amber-400 font-mono">02</div>
                      Required Projects
                    </h4>
                    <button 
                      onClick={handleGetIdea} 
                      disabled={isGenerating || isLocked} 
                      className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      {isGenerating ? 'AI Thinking...' : '+ Get AI Idea'}
                    </button>
                  </div>
                  <div className="grid gap-4">
                    {aiProject && <ProjectCard project={aiProject} isAiGenerated={true} moduleId={item.id} projectIndex={999} completedOutcomes={completedOutcomes} completedTech={completedTech} toggleOutcome={toggleOutcome} toggleTech={toggleTech} isLocked={isLocked} />}
                    {item.projects.map((proj, i) => (
                      <ProjectCard key={i} project={proj} isCompleted={completedProjects.has(`${user?.username}-${item.id}-${i}`)} onToggle={() => !isLocked && toggleProject(item.id, i)} moduleId={item.id} projectIndex={i} completedOutcomes={completedOutcomes} completedTech={completedTech} toggleOutcome={toggleOutcome} toggleTech={toggleTech} isLocked={isLocked} />
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileDashboard: React.FC<{ user: User; totalProgress: number; roadmap: RoadmapItem[]; onLogout: () => void }> = ({ user, totalProgress, roadmap, onLogout }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fadeIn text-black dark:text-white">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-2xl p-8 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-6xl opacity-5 select-none dark:opacity-10">🚀</div>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-2xl rotate-3">
            {user.username[0].toUpperCase()}
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{user.username}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Engineering Student • Joined {user.joinedDate}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {user.claimedChests.length > 0 ? (
                user.claimedChests.map(cid => {
                  const mod = roadmap.find(r => r.id === cid);
                  return (mod && <span key={cid} className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">🏆 {mod.title.split('.')[1].trim()} Mastered</span>);
                })
              ) : (
                <span className="text-slate-400 dark:text-slate-500 text-xs italic">Complete a module to earn your first badge.</span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button 
              onClick={onLogout}
              className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-8 py-3 rounded-xl text-xs font-black hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              LOGOUT
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t dark:border-slate-800">
          <div className="text-center">
            <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{totalProgress}%</div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Completion</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{user.claimedChests.length}</div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Mastery Badges</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-amber-600 dark:text-amber-400">{ROADMAP_DATA.length - user.claimedChests.length}</div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Remaining</div>
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 mb-6 px-2">Path Milestones</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {roadmap.map(m => (
          <div key={m.id} className={`p-6 rounded-3xl border transition-all ${user.claimedChests.includes(m.id) ? 'bg-indigo-600 text-white shadow-xl border-indigo-500' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-40 grayscale'}`}>
            <div className="text-3xl mb-4">{user.claimedChests.includes(m.id) ? '🏅' : '🔒'}</div>
            <div className="text-[10px] font-black uppercase opacity-80 tracking-widest leading-none">{m.title.split('.')[1]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>(ROADMAP_DATA[0].id);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'All'>('All');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [view, setView] = useState<'roadmap' | 'profile'>('roadmap');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const { 
    completedTopics, toggleTopic, completedProjects, toggleProject, 
    completedOutcomes, toggleOutcome, completedTech, toggleTech, 
    user, register, login, logout, claimChest 
  } = useProgress();

  const filteredRoadmap = useMemo(() => difficultyFilter === 'All' ? ROADMAP_DATA : ROADMAP_DATA.filter(item => item.difficulty === difficultyFilter), [difficultyFilter]);
  const activeModule = useMemo(() => { if (!activeId) return undefined; const item = ROADMAP_DATA.find(i => i.id === activeId); return item ? { title: item.title, description: item.description } : undefined; }, [activeId]);
  
  const totalProgress = useMemo(() => { 
    if (!user) return 0;
    const totalItems = ROADMAP_DATA.reduce((acc, item) => acc + item.topics.length + item.projects.length, 0); 
    const completedCount = ROADMAP_DATA.reduce((acc, item) => {
      const topics = item.topics.filter((_, i) => completedTopics.has(`${user.username}-${item.id}-${i}`)).length;
      const projects = item.projects.filter((_, i) => completedProjects.has(`${user.username}-${item.id}-${i}`)).length;
      return acc + topics + projects;
    }, 0);
    return Math.round((completedCount / totalItems) * 100); 
  }, [completedTopics, completedProjects, user]);

  const completedModulesList = useMemo(() => {
    if (!user) return [];
    return user.claimedChests.map(cid => {
      const m = ROADMAP_DATA.find(rd => rd.id === cid);
      return m ? m.title : '';
    }).filter(Boolean);
  }, [user]);

  useEffect(() => {
    const handleOpenAuth = () => setIsAuthModalOpen(true);
    window.addEventListener('open-auth', handleOpenAuth);
    return () => window.removeEventListener('open-auth', handleOpenAuth);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleAuth = (u: string, p: string, mode: 'register' | 'login') => {
    const result = mode === 'register' ? register(u, p) : login(u, p);
    if (result.success) {
      setIsAuthModalOpen(false);
      setView('roadmap');
    }
    return result;
  };

  const handleLogout = () => {
    logout();
    setView('roadmap');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 pb-20">
      {/* Background Decor */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-900/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 dark:bg-emerald-900/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <AuthForm 
            onAuth={handleAuth} 
            onCancel={() => setIsAuthModalOpen(false)} 
          />
        </div>
      )}

      {/* Global Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <button 
            className="flex items-center gap-2 group outline-none" 
            onClick={() => setView('roadmap')}
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg">A</div>
            <div className="text-left">
              <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tighter">Roadmap Pro</h1>
              <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Academy 2026</div>
            </div>
          </button>
          
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:ring-2 hover:ring-indigo-500 transition-all outline-none"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l dark:border-slate-800">
                <button 
                  onClick={() => setView(view === 'roadmap' ? 'profile' : 'roadmap')}
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${view === 'profile' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}
                >
                  {view === 'roadmap' ? 'Dashboard' : 'Path View'}
                </button>
                <button 
                  onClick={() => setView('profile')}
                  className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xs"
                >
                  {user.username[0].toUpperCase()}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)} 
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[10px] font-black shadow-lg hover:bg-indigo-700 transition-all uppercase tracking-widest"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {view === 'roadmap' ? (
        <main className="max-w-4xl mx-auto px-4 pt-16">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest mb-4">Phase 1: Foundations</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Become a Master of the <span className="text-indigo-600 dark:text-indigo-400">Modern Web.</span></h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-10">
              The only roadmap you need to transition from zero to a Senior Front-End and AI Engineer in 2026.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border dark:border-slate-800 inline-flex">
              {(['All', Difficulty.BEGINNER, Difficulty.INTERMEDIATE, Difficulty.ADVANCED] as const).map((level) => (
                <button 
                  key={level} 
                  onClick={() => setDifficultyFilter(level)} 
                  className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    difficultyFilter === level 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredRoadmap.map((item, index) => {
              const completedTopicCount = item.topics.filter((_, i) => completedTopics.has(`${user?.username}-${item.id}-${i}`)).length;
              const completedProjectCount = item.projects.filter((_, i) => completedProjects.has(`${user?.username}-${item.id}-${i}`)).length;
              return (
                <RoadmapCard 
                  key={item.id} item={item} index={index} isActive={activeId === item.id} 
                  onClick={() => setActiveId(activeId === item.id ? null : item.id)} 
                  completedTopicCount={completedTopicCount} completedProjectCount={completedProjectCount} 
                  toggleTopic={toggleTopic} toggleProject={toggleProject} 
                  completedTopics={completedTopics} completedProjects={completedProjects} 
                  completedOutcomes={completedOutcomes} completedTech={completedTech} 
                  toggleOutcome={toggleOutcome} toggleTech={toggleTech}
                  onClaimReward={claimChest} isClaimed={user ? user.claimedChests.includes(item.id) : false}
                  isLocked={!user}
                  user={user}
                />
              );
            })}
          </div>
        </main>
      ) : (
        user && <ProfileDashboard 
          user={user} 
          totalProgress={totalProgress} 
          roadmap={ROADMAP_DATA} 
          onLogout={handleLogout} 
        />
      )}

      {user && (
        <div className={`fixed bottom-8 right-8 z-[60] transition-all duration-300 ${isChatOpen ? 'w-[92vw] md:w-[400px] h-[70vh] md:h-[550px]' : 'w-14 h-14'}`}>
          {isChatOpen ? (
            <div className="w-full h-full shadow-2xl relative animate-fadeIn bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border dark:border-slate-800">
              <button 
                onClick={() => setIsChatOpen(false)} 
                className="absolute top-4 right-4 z-[70] text-indigo-100 hover:text-white transition-colors p-1"
                aria-label="Close AI Mentor Chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <MentorChat 
                activeModule={activeModule} 
                completedModules={completedModulesList}
                totalCompletion={totalProgress}
              />
            </div>
          ) : (
            <button 
              onClick={() => setIsChatOpen(true)} 
              className="w-full h-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
            >
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full animate-pulse" />
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } 
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        *:focus-visible { outline: 2px solid #4f46e5; outline-offset: 4px; }
      `}</style>
    </div>
  );
};

export default App;