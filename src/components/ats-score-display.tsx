
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts" 
import { PieChartIcon, Activity, Target, FileCheck2, GanttChartSquare, HelpCircle, BarChartBig, CheckSquare, Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import type { CalculateAtsScoreOutput } from "@/ai/flows/calculate-ats-score"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const initialBarChartData = [
  { metric: "Keywords", score: 0, fill: "var(--color-keywords)" },
  { metric: "Clarity", score: 0, fill: "var(--color-clarity)" },
  { metric: "Impact", score: 0, fill: "var(--color-impact)" },
  { metric: "Format", score: 0, fill: "var(--color-format)" },
  { metric: "Relevance", score: 0, fill: "var(--color-relevance)" },
];

const barChartConfig = {
  keywords: { label: "Keywords", color: "hsl(var(--chart-1))", icon: FileCheck2 },
  clarity: { label: "Clarity", color: "hsl(var(--chart-2))", icon: Activity },
  impact: { label: "Impact", color: "hsl(var(--chart-3))", icon: Target },
  format: { label: "Format", color: "hsl(var(--chart-4))", icon: GanttChartSquare },
  relevance: { label: "Relevance", color: "hsl(var(--chart-5))", icon: CheckSquare },
} satisfies ChartConfig;

const pieChartConfig = {
  score: { label: "ATS Score", color: "hsl(var(--primary))" },
  remaining: { label: "Remaining", color: "hsl(var(--muted))" },
} satisfies ChartConfig;


type AtsScoreDisplayProps = {
  atsScoreData: CalculateAtsScoreOutput | null;
  isLoading: boolean;
  className?: string;
  mode: 'ats' | 'matcher' | null;
  hasResume: boolean;
  hasJobDescription: boolean;
}

export function AtsScoreDisplay({ atsScoreData, isLoading, className, mode, hasResume, hasJobDescription }: AtsScoreDisplayProps) {
  const [barChartData, setBarChartData] = React.useState(initialBarChartData);

  React.useEffect(() => {
    if (atsScoreData) {
      const categories = atsScoreData.categoryScores;
      setBarChartData([
        { metric: "Keywords", score: categories.keywords, fill: barChartConfig.keywords.color },
        { metric: "Clarity", score: categories.clarity, fill: barChartConfig.clarity.color },
        { metric: "Impact", score: categories.impact, fill: barChartConfig.impact.color },
        { metric: "Format", score: categories.format, fill: barChartConfig.format.color },
        { metric: "Relevance", score: categories.relevance, fill: barChartConfig.relevance.color },
      ]);
    } else {
      setBarChartData(initialBarChartData);
    }
  }, [atsScoreData]);

  const overallScore = atsScoreData?.overallScore ?? 0;
  const pieData = [
    { name: "Score", value: overallScore, fill: pieChartConfig.score.color },
    { name: "Remaining", value: Math.max(0, 100 - overallScore), fill: pieChartConfig.remaining.color },
  ];

  const noDataToDisplay = !atsScoreData && !isLoading;
  
  let cardDescriptionText = "Estimated scores based on provided information.";
  let awaitingInputTitle = "Awaiting Inputs";
  let awaitingInputMessage = "Please provide the necessary information to generate scores.";

  if (isLoading) {
    cardDescriptionText = "Analyzing resume for ATS scores...";
  } else if (noDataToDisplay) {
    if (!hasResume) {
      cardDescriptionText = "Upload your resume to see the ATS analysis.";
      awaitingInputMessage = "Upload your resume to get ATS scores.";
    } else if (mode === 'matcher' && !hasJobDescription) {
      cardDescriptionText = "Provide job description for tailored ATS analysis.";
      awaitingInputMessage = "Provide the job description for tailored ATS scores.";
    } else if (mode === 'ats' && hasResume) {
        cardDescriptionText = "Upload resume for ATS analysis."; // Should ideally not hit this if score is expected
        awaitingInputMessage = "Processing ATS scores...";
    }
  }


  return (
    <Card className={cn("shadow-lg flex flex-col", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <PieChartIcon className="h-6 w-6 text-primary" />
          ATS Friendliness Analysis
        </CardTitle>
        <CardDescription>
          {cardDescriptionText}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pt-2 flex flex-col justify-center items-center overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full w-full p-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Calculating scores...</p>
          </div>
        ) : noDataToDisplay ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4">
            <HelpCircle className="h-12 w-12 mb-3" />
            <p className="text-lg font-medium">{awaitingInputTitle}</p>
            <p className="text-sm">{awaitingInputMessage}</p>
          </div>
        ) : atsScoreData ? (
          <ScrollArea className="h-full w-full">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 items-start lg:items-center p-2 md:p-4">
              <div className="lg:col-span-2 flex flex-col items-center justify-center pt-0">
                <h3 className="text-lg font-semibold text-center mb-1 text-foreground">Overall Score</h3>
                 <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-[140px] w-[140px] sm:h-[160px] sm:w-[160px]">
                  <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel indicator="dot" />}
                    />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={55} 
                      innerRadius={35} 
                      labelLine={false}
                      strokeWidth={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} className="focus:outline-none ring-0" stroke={entry.fill === pieChartConfig.remaining.color ? "hsl(var(--border))" : pieChartConfig.score.color}/>
                      ))}
                    </Pie>
                     <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xl font-bold fill-primary"
                      >
                        {`${overallScore}%`}
                      </text>
                  </PieChart>
                </ChartContainer>
              </div>
              <div className="lg:col-span-3 flex flex-col justify-center w-full">
                <h3 className="text-lg font-semibold mb-1 sm:mb-2 text-foreground flex items-center gap-2">
                  <BarChartBig className="h-5 w-5"/>
                  Category Breakdown
                </h3>
                <ChartContainer config={barChartConfig} className="w-full aspect-[4/3] max-h-[200px] sm:max-h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart accessibilityLayer data={barChartData} layout="vertical" margin={{left: 0, right:30, top:5, bottom:5}}>
                      <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                      <XAxis type="number" dataKey="score" domain={[0, 100]} tickFormatter={(value) => `${value}%`} fontSize={10} />
                      <YAxis 
                        dataKey="metric" 
                        type="category" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={5}
                        width={80}
                        fontSize={10}
                        interval={0}
                        tickFormatter={(value) => {
                          const key = value.toLowerCase().replace(/ & /g, '').replace(/ /g, '');
                          const configEntry = barChartConfig[key as keyof typeof barChartConfig];
                          return configEntry?.label || value;
                        }}
                      />
                      <ChartTooltip
                        cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                        content={<ChartTooltipContent indicator="line" />}
                      />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={12}>
                         {barChartData.map((entry) => (
                          <Cell key={`cell-${entry.metric}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </ScrollArea>
        ) : null}
      </CardContent>
    </Card>
  )
}
