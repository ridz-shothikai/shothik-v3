import { Globe, Zap, CheckCircle2, Facebook } from "lucide-react";

export default function FeaturesGrid() {
  const features = [
    {
      icon: Globe,
      title: "Product & Competitor Intelligence",
      description: "Paste any product link and watch our AI analyze your competitors, extract market insights, and generate detailed buyer personas",
      color: "rgba(20, 184, 166, 0.1)",
      iconColor: "#14b8a6",
      borderColor: "rgba(20, 184, 166, 0.2)",
    },
    {
      icon: Zap,
      title: "Smart Targeting",
      description: "AI-powered audience segmentation with real-time demographic analysis and behavioral insights",
      color: "rgba(16, 185, 129, 0.1)",
      iconColor: "#10b981",
      borderColor: "rgba(16, 185, 129, 0.2)",
    },
    {
      icon: CheckCircle2,
      title: "Campaign Automation",
      description: "Automated campaign creation with optimized ad copy, budget allocation, and performance tracking",
      color: "rgba(6, 182, 212, 0.1)",
      iconColor: "#06b6d4",
      borderColor: "rgba(6, 182, 212, 0.2)",
    },
    {
      icon: Facebook,
      title: "Meta Integration",
      description: "Seamless connection to Facebook & Instagram with one-click campaign publishing and real-time sync",
      color: "rgba(59, 130, 246, 0.1)",
      iconColor: "#3b82f6",
      borderColor: "rgba(59, 130, 246, 0.2)",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {features.map((feature, idx) => (
        <div
          key={idx}
          className="group relative"
        >
          {/* Glow effect on hover */}
          <div 
            className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"
            style={{ backgroundColor: feature.iconColor }}
          />
          
          <div
            className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 transition-all duration-300 hover:translate-y-[-4px] h-full"
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg"
              style={{ 
                backgroundColor: feature.color,
                boxShadow: `0 10px 30px -10px ${feature.iconColor}40`
              }}
            >
              <feature.icon
                className="w-7 h-7"
                style={{ color: feature.iconColor }}
              />
            </div>
            <h3 className="text-white font-bold mb-3 text-base leading-tight">
              {feature.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
