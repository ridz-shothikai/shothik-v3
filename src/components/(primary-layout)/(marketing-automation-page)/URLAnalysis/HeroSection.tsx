export default function HeroSection() {
  return (
    <div className="relative mb-16 py-12 text-center">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/2 left-1/2 h-[500px] w-[500px] rounded-full bg-primary/20 filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 backdrop-blur-sm transition-all hover:bg-primary/10">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
        </span>
        <span className="text-primary text-xs font-semibold uppercase tracking-wider">
          AI-Powered Analysis
        </span>
      </div>

      <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-7xl">
        Meta Ads Automation
        <span className="block bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent">
          Suite
        </span>
      </h1>
      <p className="mx-auto max-w-2xl text-lg leading-relaxed font-light text-muted-foreground sm:text-xl">
        From AI analysis to campaign launch—everything you need to create,
        optimize, and scale Meta ads with intelligent automation
      </p>
    </div>
  );
}
