"use client";

import type { ProductAnalysis } from "@/types/analysis";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisResultCardProps {
  analysis: ProductAnalysis;
  onOpenCanvas: () => void;
}

export default function AnalysisResultCard({
  analysis,
  onOpenCanvas,
}: AnalysisResultCardProps) {
  return (
    <Card className="mb-8 border-primary/30 bg-primary/10 p-8 shadow-xl sm:p-12">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
            <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">
              Analysis Complete!
            </h3>
            <p className="text-sm text-muted-foreground">
              Your product analysis is ready for campaign creation
            </p>
          </div>
        </div>
        <Button
          onClick={onOpenCanvas}
          className="flex transform items-center gap-2 transition-all hover:scale-105"
        >
          <Sparkles className="h-5 w-5" />
          Open Canvas
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Product Info */}
        <Card className="border-border bg-card p-6 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Title:
                </span>
                <p className="mt-1 font-semibold text-foreground">
                  {analysis.product.title}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Brand:
                </span>
                <p className="mt-1 font-semibold text-foreground">
                  {analysis.product.brand}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Category:
                </span>
                <p className="mt-1 font-semibold text-foreground capitalize">
                  {analysis.product.category}
                </p>
              </div>
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Description:
                </span>
                <p className="mt-1 leading-relaxed text-foreground">
                  {analysis.product.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        {analysis.product.key_features.length > 0 && (
          <Card className="border-border bg-card p-6 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {analysis.product.key_features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Target Audience */}
        <Card className="border-border bg-card p-6 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">
              Target Audience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Age:
                </span>
                <p className="mt-1 font-semibold text-foreground">
                  {analysis.product.target_audience.age}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Gender:
                </span>
                <p className="mt-1 font-semibold text-foreground">
                  {analysis.product.target_audience.gender}
                </p>
              </div>
              {analysis.product.target_audience.interests.length > 0 && (
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Interests:
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {analysis.product.target_audience.interests.map(
                      (interest, idx) => (
                        <span
                          key={idx}
                          className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                        >
                          {interest}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Market Analysis */}
        <Card className="border-border bg-card p-6 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">
              Market Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Trend:
                </span>
                <p className="mt-1 font-semibold text-foreground capitalize">
                  {analysis.market.trend}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Competition:
                </span>
                <p className="mt-1 font-semibold text-foreground capitalize">
                  {analysis.market.competition_level}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Seasonality:
                </span>
                <p className="mt-1 font-semibold text-foreground capitalize">
                  {analysis.market.seasonality}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Maturity:
                </span>
                <p className="mt-1 font-semibold text-foreground capitalize">
                  {analysis.market.market_maturity}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Card>
  );
}
