export default function HeroSection() {
  return (
    <div className="text-center mb-16 relative py-12">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-teal-500/20 rounded-full filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-emerald-500/20 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/2 left-1/2 w-[500px] h-[500px] bg-cyan-500/20 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-teal-500/30 bg-teal-500/5 backdrop-blur-sm hover:bg-teal-500/10 transition-all">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
        </span>
        <span className="text-teal-400 text-xs font-semibold tracking-wider uppercase">
          AI-Powered Analysis
        </span>
      </div>

      <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
        Meta Ads Automation
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400">
          Suite
        </span>
      </h1>
      <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
        From AI analysis to campaign launch—everything you need to create, optimize, and
        scale Meta ads with intelligent automation
      </p>
    </div>
  );
}
