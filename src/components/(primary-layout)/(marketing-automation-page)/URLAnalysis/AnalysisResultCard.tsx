"use client";

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
    <div className="mb-8 rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 shadow-xl sm:p-12">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Analysis Complete!
            </h3>
            <p className="text-sm text-gray-600">
              Your product analysis is ready for campaign creation
            </p>
          </div>
        </div>
        <button
          onClick={onOpenCanvas}
          className="flex transform items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl"
        >
          <Sparkles className="h-5 w-5" />
          Open Canvas
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Product Info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <h4 className="mb-4 text-xl font-semibold text-gray-900">
            Product Information
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <span className="text-sm font-medium text-gray-600">Title:</span>
              <p className="mt-1 font-semibold text-gray-900">
                {analysis.product.title}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Brand:</span>
              <p className="mt-1 font-semibold text-gray-900">
                {analysis.product.brand}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">
                Category:
              </span>
              <p className="mt-1 font-semibold text-gray-900 capitalize">
                {analysis.product.category}
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">
                Description:
              </span>
              <p className="mt-1 leading-relaxed text-gray-700">
                {analysis.product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        {analysis.product.key_features.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
            <h4 className="mb-4 text-xl font-semibold text-gray-900">
              Key Features
            </h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {analysis.product.key_features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Target Audience */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <h4 className="mb-4 text-xl font-semibold text-gray-900">
            Target Audience
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <span className="text-sm font-medium text-gray-600">Age:</span>
              <p className="mt-1 font-semibold text-gray-900">
                {analysis.product.target_audience.age}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Gender:</span>
              <p className="mt-1 font-semibold text-gray-900">
                {analysis.product.target_audience.gender}
              </p>
            </div>
            {analysis.product.target_audience.interests.length > 0 && (
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-gray-600">
                  Interests:
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {analysis.product.target_audience.interests.map(
                    (interest, idx) => (
                      <span
                        key={idx}
                        className="rounded-full border border-purple-200 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 text-sm font-medium text-purple-700"
                      >
                        {interest}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Market Analysis */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <h4 className="mb-4 text-xl font-semibold text-gray-900">
            Market Analysis
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Trend:</span>
              <p className="mt-1 font-semibold text-gray-900 capitalize">
                {analysis.market.trend}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">
                Competition:
              </span>
              <p className="mt-1 font-semibold text-gray-900 capitalize">
                {analysis.market.competition_level}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">
                Seasonality:
              </span>
              <p className="mt-1 font-semibold text-gray-900 capitalize">
                {analysis.market.seasonality}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">
                Maturity:
              </span>
              <p className="mt-1 font-semibold text-gray-900 capitalize">
                {analysis.market.market_maturity}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
