
import React from 'react';

const DeploymentGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="bg-white p-8 rounded-3xl border shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn text-black relative" role="dialog" aria-labelledby="deploy-title" aria-modal="true">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
        aria-label="Close deployment guide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <div className="mb-8">
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4 inline-block">Production Ready</span>
        <h2 id="deploy-title" className="text-3xl font-black text-slate-900 mb-2">Deploy Your Application</h2>
        <p className="text-slate-500">Follow these steps to take your AI Mentor Roadmap from local development to a live URL.</p>
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-sm">1</div>
            <h3 className="text-xl font-bold text-slate-800">Push to GitHub</h3>
          </div>
          <div className="pl-11 space-y-3">
            <p className="text-sm text-slate-600">The first step for any modern deployment is version control. Create a repository on GitHub and push your local files.</p>
            <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-indigo-300">
              <p>git init</p>
              <p>git add .</p>
              <p>git commit -m "Initial commit"</p>
              <p>git remote add origin https://github.com/yourusername/ai-roadmap.git</p>
              <p>git push -u origin main</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-sm">2</div>
            <h3 className="text-xl font-bold text-slate-800">Choose a Platform (Recommended: Vercel)</h3>
          </div>
          <div className="pl-11 grid md:grid-cols-2 gap-6">
            <div className="border rounded-2xl p-6 hover:border-indigo-600 transition-colors">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 76 65" fill="none"><path d="M37.5273 0L75.0546 65H0L37.5273 0Z" fill="black"/></svg>
                Vercel
              </h4>
              <p className="text-xs text-slate-500 mb-4">Best for React apps. Automatic deployments every time you push to GitHub.</p>
              <ul className="text-[10px] space-y-1 text-slate-600">
                <li>• Connect your GitHub account.</li>
                <li>• Select your repository.</li>
                <li>• Deploy in one click.</li>
              </ul>
            </div>
            <div className="border rounded-2xl p-6 hover:border-teal-600 transition-colors">
              <h4 className="font-bold mb-2 flex items-center gap-2 text-teal-700">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
                Netlify
              </h4>
              <p className="text-xs text-slate-500 mb-4">Excellent choice for static sites and frontend frameworks. Great free tier.</p>
              <ul className="text-[10px] space-y-1 text-slate-600">
                <li>• Link GitHub repository.</li>
                <li>• Set build command: <code>npm run build</code></li>
                <li>• Publish directory: <code>dist</code></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-amber-50 border border-amber-100 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-black text-sm">3</div>
            <h3 className="text-xl font-bold text-slate-800">Critical: Configure API Keys</h3>
          </div>
          <div className="pl-11 space-y-4">
            <p className="text-sm text-amber-900 font-medium">Never hardcode your Gemini API Key. Your app will fail in production if environment variables are not set.</p>
            <div className="space-y-2">
              <p className="text-xs text-amber-800 font-bold uppercase tracking-widest">In Vercel/Netlify Dashboard:</p>
              <ol className="text-xs text-amber-700 space-y-2">
                <li>1. Go to <b>Settings</b> &gt; <b>Environment Variables</b>.</li>
                <li>2. Add a new key: <code>API_KEY</code>.</li>
                <li>3. Paste your Gemini API Key as the value.</li>
                <li>4. Trigger a new deployment for changes to take effect.</li>
              </ol>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-sm">4</div>
            <h3 className="text-xl font-bold text-slate-800">Verify & Go Live</h3>
          </div>
          <div className="pl-11">
            <p className="text-sm text-slate-600 mb-4">Once the build finishes, your platform will provide a <code>.vercel.app</code> or <code>.netlify.app</code> link. Visit it, log in, and test the AI Mentor to ensure everything is connected!</p>
            <button 
              onClick={onClose}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg"
            >
              I UNDERSTAND, LET'S GO!
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DeploymentGuide;
