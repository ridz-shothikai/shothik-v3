import type { ProductAnalysis } from "@/types/analysis";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

interface AnalysisResultCardProps {
  analysis: ProductAnalysis;
  onOpenCanvas: () => void;
}

export default function AnalysisResultCard({
  analysis,
  onOpenCanvas,
}: AnalysisResultCardProps) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 sm:p-12 mb-8 border border-green-200 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Analysis Complete!
            </h3>
            <p className="text-gray-600 text-sm">
              Your product analysis is ready for campaign creation
            </p>
          </div>
        </div>
        <button
          onClick={onOpenCanvas}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Sparkles className="w-5 h-5" />
          Open Canvas
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Product Info */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">
            Product Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600 text-sm font-medium">Title:</span>
              <p className="text-gray-900 font-semibold mt-1">
                {analysis.product.title}
              </p>
            </div>
            <div>
              <span className="text-gray-600 text-sm font-medium">Brand:</span>
              <p className="text-gray-900 font-semibold mt-1">
                {analysis.product.brand}
              </p>
            </div>
            <div>
              <span className="text-gray-600 text-sm font-medium">
                Category:
              </span>
              <p className="text-gray-900 font-semibold mt-1 capitalize">
                {analysis.product.category}
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-600 text-sm font-medium">
                Description:
              </span>
              <p className="text-gray-700 mt-1 leading-relaxed">
                {analysis.product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        {analysis.product.key_features.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md">
            <h4 className="text-xl font-semibold text-gray-900 mb-4">
              Key Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysis.product.key_features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Target Audience */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">
            Target Audience
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600 text-sm font-medium">Age:</span>
              <p className="text-gray-900 font-semibold mt-1">
                {analysis.product.target_audience.age}
              </p>
            </div>
            <div>
              <span className="text-gray-600 text-sm font-medium">Gender:</span>
              <p className="text-gray-900 font-semibold mt-1">
                {analysis.product.target_audience.gender}
              </p>
            </div>
            {analysis.product.target_audience.interests.length > 0 && (
              <div className="md:col-span-2">
                <span className="text-gray-600 text-sm font-medium">
                  Interests:
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {analysis.product.target_audience.interests.map(
                    (interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200"
                      >
                        {interest}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Market Analysis */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">
            Market Analysis
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600 text-sm font-medium">Trend:</span>
              <p className="text-gray-900 font-semibold mt-1 capitalize">
                {analysis.market.trend}
              </p>
            </div>
            <div>
              <span className="text-gray-600 text-sm font-medium">
                Competition:
              </span>
              <p className="text-gray-900 font-semibold mt-1 capitalize">
                {analysis.market.competition_level}
              </p>
            </div>
            <div>
              <span className="text-gray-600 text-sm font-medium">
                Seasonality:
              </span>
              <p className="text-gray-900 font-semibold mt-1 capitalize">
                {analysis.market.seasonality}
              </p>
            </div>
            <div>
              <span className="text-gray-600 text-sm font-medium">
                Maturity:
              </span>
              <p className="text-gray-900 font-semibold mt-1 capitalize">
                {analysis.market.market_maturity}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
