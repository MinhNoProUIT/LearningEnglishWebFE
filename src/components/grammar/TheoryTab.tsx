"use client";

import React from "react";
import { BookOpen, Lightbulb, MessageSquare } from "lucide-react";
import { IGrammarRuleWithExamples } from "@/models/Grammar";

interface TheoryTabProps {
  rules: IGrammarRuleWithExamples[];
  isLoading?: boolean;
}

const TheoryTab: React.FC<TheoryTabProps> = ({ rules, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!rules || rules.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Chưa có nội dung lý thuyết cho bài học này</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {rules.map((rule, index) => (
        <div
          key={rule.id}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
        >
          {/* Rule Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-400 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">{index + 1}</span>
              </div>
              <h3 className="text-xl font-bold text-white">{rule.title}</h3>
            </div>
          </div>

          {/* Rule Content */}
          <div className="p-6">
            {/* Structure */}
            {rule.structure && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={18} className="text-amber-500" />
                  <span className="font-semibold text-gray-700">Công thức:</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <code className="text-amber-800 font-mono text-lg whitespace-pre-wrap">
                    {rule.structure}
                  </code>
                </div>
              </div>
            )}

            {/* Note */}
            {rule.note && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={18} className="text-blue-500" />
                  <span className="font-semibold text-gray-700">Ghi chú:</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-blue-800 whitespace-pre-wrap">{rule.note}</p>
                </div>
              </div>
            )}

            {/* Examples */}
            {rule.examples && rule.examples.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={18} className="text-green-500" />
                  <span className="font-semibold text-gray-700">
                    Ví dụ ({rule.examples.length}):
                  </span>
                </div>
                <div className="space-y-3">
                  {rule.examples.map((example, exIndex) => (
                    <div
                      key={example.id}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {exIndex + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-green-800 font-medium text-lg mb-1">
                            {example.example_en}
                          </p>
                          {example.example_vi && (
                            <p className="text-green-600 text-sm italic">
                              → {example.example_vi}
                            </p>
                          )}
                          {example.note && (
                            <p className="text-gray-500 text-sm mt-2 bg-white/50 rounded-lg p-2">
                              💡 {example.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TheoryTab;
